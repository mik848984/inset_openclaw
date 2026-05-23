import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import User from '@/models/user';
import Project from '@/models/project';
import dbConnect from '@/lib/db';

export const dynamic = 'force-dynamic';

type Params = { params: { id: string } };

async function ownerFor(projectId: string) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return { error: 'auth' as const };
  const user = await User.findOne({ email });
  if (!user) return { error: 'user_missing' as const };
  const project = await Project.findOne({ _id: projectId, user: user.id });
  if (!project) return { error: 'not_found' as const };
  return { user, project };
}

// ── PATCH: обновить (или создать) intake целиком ──────────────────
// Анкета — единая baseline-сущность. Каждое сохранение перезаписывает,
// НЕ создаёт дубль (раньше форма плодила artifact'ы).
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    const ctx = await ownerFor(params.id);
    if ('error' in ctx) {
      return NextResponse.json(
        { message: 'Доступ запрещён' },
        { status: ctx.error === 'auth' ? 401 : 404 },
      );
    }
    const body = (await req.json().catch(() => ({}))) as any;
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { message: 'Тело должно быть объектом intake' },
        { status: 400 },
      );
    }

    // Валидация: ограничение размера и нормализация чисел.
    const num = (v: any) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : undefined;
    };
    const str = (v: any, max = 240) =>
      typeof v === 'string' ? v.trim().slice(0, max) : undefined;

    const intake: Record<string, any> = {
      sex: str(body.sex, 16),
      age: num(body.age),
      heightCm: num(body.heightCm),
      startWeightKg: num(body.startWeightKg),
      targetWeightKg: num(body.targetWeightKg),
      targetLossKg: num(body.targetLossKg),
      targetDays: num(body.targetDays),
      activityLevel: str(body.activityLevel, 80),
      currentTraining: str(body.currentTraining, 400),
      currentNutrition: str(body.currentNutrition, 400),
      healthRestrictions: str(body.healthRestrictions, 400),
      sleep: str(body.sleep, 80),
      outcome: str(body.outcome, 600),
      deadline: str(body.deadline, 80),
      constraints: str(body.constraints, 400),
      context: str(body.context, 600),
      comment: str(body.comment, 400),
      updatedAt: new Date().toISOString(),
    };
    // Пропускаем неизвестные поля от других доменов «как есть»
    // (career.targetRole, business.sphere и т.д.).
    for (const [k, v] of Object.entries(body)) {
      if (k in intake) continue;
      if (typeof v === 'string') intake[k] = v.slice(0, 600);
      else if (typeof v === 'number' && Number.isFinite(v)) intake[k] = v;
    }
    // Чистим undefined, чтобы Mongo не писал пустые ключи.
    for (const k of Object.keys(intake)) {
      if (intake[k] === undefined || intake[k] === '') delete intake[k];
    }

    const updated = await Project.findOneAndUpdate(
      { _id: ctx.project._id, user: (ctx as any).user.id },
      {
        $set: {
          'agentState.intake': intake,
          'agentState.updatedAt': new Date().toISOString(),
        },
      },
      { new: true },
    ).lean();
    return NextResponse.json({ intake, project: updated });
  } catch (err) {
    console.error('[INTAKE_PATCH]', err);
    return NextResponse.json(
      { message: 'Не удалось сохранить анкету' },
      { status: 500 },
    );
  }
}

// ── DELETE: сбросить intake ───────────────────────────────────────
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    const ctx = await ownerFor(params.id);
    if ('error' in ctx) {
      return NextResponse.json(
        { message: 'Доступ запрещён' },
        { status: ctx.error === 'auth' ? 401 : 404 },
      );
    }
    const updated = await Project.findOneAndUpdate(
      { _id: ctx.project._id, user: (ctx as any).user.id },
      {
        $unset: { 'agentState.intake': '' },
        $set: { 'agentState.updatedAt': new Date().toISOString() },
      },
      { new: true },
    ).lean();
    return NextResponse.json({ project: updated });
  } catch (err) {
    console.error('[INTAKE_DELETE]', err);
    return NextResponse.json(
      { message: 'Не удалось сбросить анкету' },
      { status: 500 },
    );
  }
}
