import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import User from '@/models/user';
import Project from '@/models/project';
import ProjectSource from '@/models/projectSource';
import ProjectArtifact, {
  ProjectArtifactType,
} from '@/models/projectArtifact';
import dbConnect from '@/lib/db';
import { retrievalService } from '@/services/api/RetrievalService';
import { modelsService } from '@/services/api/ModelsService';
import { getTextFromStream } from '@/utils/llmStream';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Params = { params: { id: string } };

const ALLOWED: ProjectArtifactType[] = [
  'brief',
  'plan',
  'risks',
  'faq',
  'comparison',
  'mindmap',
  'report',
];

const TITLES: Record<ProjectArtifactType, string> = {
  brief: 'Обзор проекта',
  plan: 'План действий',
  risks: 'Карта рисков',
  faq: 'FAQ по проекту',
  comparison: 'Сравнение источников',
  mindmap: 'Карта проекта',
  report: 'Briefing document',
};

const INSTRUCTIONS: Record<ProjectArtifactType, string> = {
  brief:
    'Кратко опиши цель, ключевые факты и контекст проекта. Структурируй ответ заголовками и списками.',
  plan:
    'Составь пошаговый план действий по проекту. Каждый шаг — конкретное действие с критерием успеха.',
  risks:
    'Найди риски: технические, продуктовые, временные, финансовые. На каждый — кратко "что сделать, чтобы митигировать".',
  faq:
    'Составь FAQ по проекту: 6–10 вопросов с короткими ответами на основе источников.',
  comparison:
    'Сравни источники между собой: где совпадают, где расходятся, на что обратить внимание.',
  mindmap:
    'Сделай текстовую карту проекта: ключевые узлы (цель, источники, факты, риски, шаги) с короткими описаниями.',
  report:
    'Сделай briefing document: цель → контекст → ключевые факты с цитированиями → выводы → next steps.',
};

export async function POST(req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    const session = await auth();
    const email = session?.user?.email;
    if (!email) {
      return NextResponse.json({ message: 'Требуется вход' }, { status: 401 });
    }
    const userDoc = await User.findOne({ email });
    if (!userDoc) {
      return NextResponse.json(
        { message: 'Пользователь не найден' },
        { status: 401 },
      );
    }
    const project = await Project.findOne({
      _id: params.id,
      user: userDoc.id,
    });
    if (!project) {
      return NextResponse.json(
        { message: 'Проект не найден' },
        { status: 404 },
      );
    }

    const body = (await req.json().catch(() => ({}))) as any;
    const type: ProjectArtifactType = ALLOWED.includes(body.type)
      ? body.type
      : 'brief';

    // ── Берём релевантные чанки на тему проекта ───────────────────
    const seedQuery = `${project.title}. ${project.goal || ''}`.trim();
    const chunks = await retrievalService.retrieve({
      projectId: String(project._id),
      userEmail: email,
      query: seedQuery,
      topFinal: 12,
    });

    const sourcesMeta = await ProjectSource.find({
      project: project._id,
      userEmail: email,
    })
      .select({ _id: 1, title: 1, type: 1, url: 1 })
      .lean();
    const sourceMap = new Map(
      sourcesMeta.map((s: any) => [String(s._id), s]),
    );

    const contextText = chunks
      .map((c, i) => {
        const s = sourceMap.get(c.sourceId);
        const label = s ? `${s.title}${s.url ? ` (${s.url})` : ''}` : 'Источник';
        return `[${i + 1}] ${label}\n${c.text}`.trim();
      })
      .join('\n\n-----------------------------\n\n');

    const systemPrompt = [
      'Ты — ИИСеть, ассистент проектной работы.',
      'Отвечай на русском.',
      INSTRUCTIONS[type],
      'Опирайся на переданные источники проекта.',
      'Используй короткие цитаты [1], [2] на источники проекта.',
      'Никогда не выводи голые URL и не дублируй полный текст источников.',
      'Никогда не выводи <think> и не описывай свои размышления.',
      'Если источников недостаточно — честно отметь это и предложи, что добавить.',
    ].join(' ');

    const messages = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content:
          chunks.length > 0
            ? [
                `Тема проекта: ${project.title}`,
                project.goal ? `Цель: ${project.goal}` : '',
                '',
                `Тип артефакта: ${TITLES[type]}`,
                '',
                'Источники проекта:',
                contextText,
              ]
                .filter(Boolean)
                .join('\n')
            : [
                `Тема проекта: ${project.title}`,
                project.goal ? `Цель: ${project.goal}` : '',
                '',
                `Тип артефакта: ${TITLES[type]}`,
                '',
                'Источники проекта: пока пустые. Сформируй artefact на основе цели проекта и предложи, какие источники стоит добавить.',
              ]
                .filter(Boolean)
                .join('\n'),
      },
    ];

    // ── Просто синхронный LLM-стрим, читаем целиком ───────────────
    let content = '';
    try {
      const stream = (await modelsService.llmBaseRequest({
        model: 'openai/gpt-oss-120b',
        messages: messages as any[],
        stream: true,
        onClose: () => {},
        textToLast: '',
      })) as ReadableStream<Uint8Array>;
      if (stream) {
        content = await getTextFromStream(stream);
      }
    } catch (e) {
      console.error('[ARTIFACT] llm failed', e);
    }
    if (!content) {
      content =
        'Не удалось собрать материал. Попробуйте добавить больше источников в проект и повторить.';
    }

    const artifact = await ProjectArtifact.create({
      project: project._id,
      user: userDoc.id,
      userEmail: email,
      type,
      title: TITLES[type],
      content: content.slice(0, 20000),
      sourceIds: chunks
        .map((c) => c.sourceId)
        .filter((id, i, arr) => id && arr.indexOf(id) === i),
    });
    return NextResponse.json(artifact);
  } catch (e) {
    console.error('[ARTIFACT_POST]', e);
    return NextResponse.json(
      { message: 'Не удалось создать артефакт' },
      { status: 500 },
    );
  }
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    const session = await auth();
    const email = session?.user?.email;
    if (!email) {
      return NextResponse.json({ message: 'Требуется вход' }, { status: 401 });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { message: 'Пользователь не найден' },
        { status: 401 },
      );
    }
    const project = await Project.findOne({ _id: params.id, user: user.id });
    if (!project) {
      return NextResponse.json(
        { message: 'Проект не найден' },
        { status: 404 },
      );
    }
    const list = await ProjectArtifact.find({
      project: project._id,
      userEmail: email,
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    return NextResponse.json(list);
  } catch (e) {
    console.error('[ARTIFACT_GET]', e);
    return NextResponse.json(
      { message: 'Не удалось загрузить артефакты' },
      { status: 500 },
    );
  }
}
