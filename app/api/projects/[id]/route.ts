import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { auth } from '@/auth';
import User from '@/models/user';
import Project from '@/models/project';
import ProjectSource from '@/models/projectSource';
import ProjectChunk from '@/models/projectChunk';
import ProjectArtifact from '@/models/projectArtifact';
import ProjectThread from '@/models/projectThread';
import { vectorStoreService } from '@/services/api/VectorStoreService';
import dbConnect from '@/lib/db';

export const dynamic = 'force-dynamic';

type Params = { params: { id: string } };

async function resolveUserId(): Promise<string | null> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return null;
  const user = await User.findOne({ email });
  return user ? String(user.id) : null;
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    const userId = await resolveUserId();
    if (!userId) {
      return NextResponse.json(
        { message: 'Требуется вход' },
        { status: 401 },
      );
    }
    const project = await Project.findOne({
      _id: params.id,
      user: userId,
    }).lean();
    if (!project) {
      return NextResponse.json(
        { message: 'Проект не найден' },
        { status: 404 },
      );
    }
    return NextResponse.json(project);
  } catch (error) {
    console.error('[PROJECT_GET]', error);
    return NextResponse.json(
      { message: 'Не удалось загрузить проект' },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    const userId = await resolveUserId();
    if (!userId) {
      return NextResponse.json(
        { message: 'Требуется вход' },
        { status: 401 },
      );
    }
    const body = (await req.json().catch(() => ({}))) as any;

    const allowed: any = {};
    if (typeof body.title === 'string')
      allowed.title = body.title.slice(0, 120);
    if (typeof body.goal === 'string') allowed.goal = body.goal;
    if (typeof body.description === 'string')
      allowed.description = body.description;
    if (typeof body.instructions === 'string')
      allowed.instructions = body.instructions;
    if (typeof body.nextStep === 'string')
      allowed.nextStep = body.nextStep.slice(0, 240);
    if (Array.isArray(body.suggestedActions)) {
      allowed.suggestedActions = body.suggestedActions
        .filter((s: any) => typeof s === 'string')
        .slice(0, 8);
    }
    // agentState — целиком гибкий JSON. Сохраняем как есть, валидируем
    // только что это объект и не разрастается до абсурда (cap 32KB).
    if (body.agentState && typeof body.agentState === 'object') {
      try {
        const serialized = JSON.stringify(body.agentState);
        if (serialized.length <= 32 * 1024) {
          allowed.agentState = {
            ...body.agentState,
            updatedAt: new Date().toISOString(),
          };
        }
      } catch {
        // silently skip — agentState не критичен
      }
    }

    const project = await Project.findOneAndUpdate(
      { _id: params.id, user: userId },
      { $set: allowed },
      { new: true },
    );
    if (!project) {
      return NextResponse.json(
        { message: 'Проект не найден' },
        { status: 404 },
      );
    }
    return NextResponse.json(project);
  } catch (error) {
    console.error('[PROJECT_PATCH]', error);
    return NextResponse.json(
      { message: 'Не удалось обновить проект' },
      { status: 500 },
    );
  }
}

// ── DELETE: cascade-удаление проекта ─────────────────────────────
// Удаляет проект + все связанные данные:
//   • ProjectSource (rows)
//   • ProjectChunk (vector + keyword fallback контент)
//   • ProjectArtifact (документы)
//   • ProjectThread (ветки)
//   • файлы из uploads/projects/<projectId>
//   • Qdrant points через vectorStoreService.deleteProject()
// Строго scoped по ownership: проверяем user перед каждым шагом.
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    const session = await auth();
    const email = session?.user?.email;
    if (!email) {
      return NextResponse.json(
        { message: 'Требуется вход' },
        { status: 401 },
      );
    }
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { message: 'Пользователь не найден' },
        { status: 401 },
      );
    }

    // Сначала находим проект, проверяя владельца. Если не наш —
    // 404 (не выдаём существование чужих проектов).
    const project = await Project.findOne({
      _id: params.id,
      user: user.id,
    });
    if (!project) {
      return NextResponse.json(
        { message: 'Проект не найден' },
        { status: 404 },
      );
    }
    const projectIdStr = String(project._id);

    // 1) Qdrant points (если включён). Делаем до удаления sources,
    //    чтобы payload-фильтр projectId+userEmail точно сработал.
    try {
      await vectorStoreService.deleteProject(projectIdStr, email);
    } catch (e) {
      console.error('[PROJECT_DELETE] qdrant failed (continue)', e);
    }

    // 2) Файлы на диске. Удаляем по списку sources.storagePath,
    //    а также пытаемся снести директорию uploads/projects/<id>
    //    целиком — на случай если что-то осталось.
    try {
      const sources = await ProjectSource.find({
        project: project._id,
        user: user.id,
      })
        .select({ storagePath: 1 })
        .lean();
      for (const s of sources) {
        const p = (s as any).storagePath as string | undefined;
        if (!p) continue;
        try {
          if (fs.existsSync(p)) fs.unlinkSync(p);
        } catch (e) {
          console.error('[PROJECT_DELETE] unlink failed', p, e);
        }
      }
      // Cleanup project upload dir. Безопасно — путь
      // uploads/projects/<projectId>, никаких .. / *.
      const uploadDir = path.join(
        process.cwd(),
        'uploads',
        'projects',
        projectIdStr,
      );
      if (fs.existsSync(uploadDir)) {
        try {
          fs.rmSync(uploadDir, { recursive: true, force: true });
        } catch (e) {
          console.error('[PROJECT_DELETE] rmdir failed', uploadDir, e);
        }
      }
    } catch (e) {
      console.error('[PROJECT_DELETE] file cleanup failed (continue)', e);
    }

    // 3) Mongo cascade. Все запросы scoped по project+user, чтобы
    //    исключить случайное удаление чужих документов из-за
    //    оставшихся orphan-записей.
    await Promise.allSettled([
      ProjectChunk.deleteMany({ project: project._id, user: user.id }),
      ProjectArtifact.deleteMany({ project: project._id, user: user.id }),
      ProjectThread.deleteMany({ project: project._id, user: user.id }),
      ProjectSource.deleteMany({ project: project._id, user: user.id }),
    ]);

    // 4) Сам проект.
    await Project.deleteOne({ _id: project._id, user: user.id });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('[PROJECT_DELETE]', error);
    return NextResponse.json(
      { message: 'Не удалось удалить проект' },
      { status: 500 },
    );
  }
}
