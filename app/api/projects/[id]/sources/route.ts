import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import User from '@/models/user';
import Project from '@/models/project';
import ProjectSource from '@/models/projectSource';
import dbConnect from '@/lib/db';

export const dynamic = 'force-dynamic';

type Params = { params: { id: string } };

async function loadOwner(projectId: string) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return { ok: false as const, status: 401 };
  const user = await User.findOne({ email });
  if (!user) return { ok: false as const, status: 401 };
  const project = await Project.findOne({ _id: projectId, user: user.id });
  if (!project) return { ok: false as const, status: 404 };
  return { ok: true as const, email, userId: String(user.id) };
}

/** GET — список источников проекта (только для владельца). */
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    const owner = await loadOwner(params.id);
    if (!owner.ok) {
      return NextResponse.json(
        { message: 'Нет доступа' },
        { status: owner.status },
      );
    }
    const sources = await ProjectSource.find({
      project: params.id,
      userEmail: owner.email,
    })
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json(sources);
  } catch (e) {
    console.error('[SOURCES_GET]', e);
    return NextResponse.json(
      { message: 'Не удалось загрузить источники' },
      { status: 500 },
    );
  }
}
