import { modelsService } from '@/services/api/ModelsService';
import { auth } from '@/auth';
import User from '@/models/user';
import Project from '@/models/project';
import dbConnect from '@/lib/db';
import { buildProjectSystemPrompt } from '@/services/api/ProjectService';

export async function POST(req: Request): Promise<Response> {
  // ── Lightweight latency instrumentation (gated by NODE_ENV) ──────
  const ENABLE_LATENCY_LOGS = process.env.NODE_ENV !== 'production';
  const tStart =
    typeof performance !== 'undefined' ? performance.now() : Date.now();
  const log = (tag: string, extra?: Record<string, any>) => {
    if (!ENABLE_LATENCY_LOGS) return;
    const dt = Math.round(
      (typeof performance !== 'undefined' ? performance.now() : Date.now()) -
        tStart,
    );
    // eslint-disable-next-line no-console
    console.log(`[CHAT-API] ${tag} +${dt}ms`, extra || '');
  };

  log('request_start');

  try {
    await dbConnect();
    log('db_connect_done');

    const {
      messages,
      model,
      mode,
      webSearch,
      files,
      youtube,
      projectId,
    } = (await req.json()) as any;
    log('req_json_done', {
      model,
      mode,
      webSearch: !!webSearch,
      messagesCount: Array.isArray(messages) ? messages.length : 0,
      filesCount: Array.isArray(files) ? files.length : 0,
      youtubePresent: !!youtube,
      projectIdPresent: !!projectId,
    });

    const session = await auth();
    log('auth_done');

    const user = await User.findOne({ email: session?.user?.email });
    log('user_findone_done');

    // ── Project workspace injection ────────────────────────────────
    // Если в чате выбран проект — подмешиваем его контекст в LLM-запрос
    // двумя способами:
    //   1) Системным сообщением — для обычного chat-flow.
    //   2) Префиксом к последнему user-сообщению — чтобы web-search и
    //      генерация картинок тоже видели контекст проекта.
    // Проект строго scoped по userId. Сообщения в Mongo сохраняются
    // отдельно клиентом и НЕ загрязняются project-промтом.
    let messagesForLLM = Array.isArray(messages) ? messages : [];
    if (typeof projectId === 'string' && projectId.length > 0 && user) {
      try {
        const project = await Project.findOne({
          _id: projectId,
          user: user.id,
        }).lean();
        if (project) {
          const ctx = buildProjectSystemPrompt(project as any);
          // 1) system-сообщение в самом начале.
          const projectSystemMessage = { role: 'system', content: ctx };
          // 2) префикс к последнему user-сообщению.
          let lastUserIdx = -1;
          for (let i = messagesForLLM.length - 1; i >= 0; i--) {
            if (messagesForLLM[i] && messagesForLLM[i].role === 'user') {
              lastUserIdx = i;
              break;
            }
          }
          messagesForLLM = messagesForLLM.map(
            (m: any, i: number) =>
              i === lastUserIdx
                ? {
                    ...m,
                    content:
                      `[Контекст проекта]\n${ctx}\n\n[Запрос пользователя]\n` +
                      (m?.content || ''),
                  }
                : m,
          );
          messagesForLLM = [projectSystemMessage, ...messagesForLLM];
          log('project_context_injected', {
            projectTitle: (project as any).title,
          });
        } else {
          log('project_not_found_or_forbidden');
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('[CHAT-API] project_lookup_failed', e);
      }
    }

    const result = await modelsService.multiModalRequest({
      model,
      messages: messagesForLLM,
      mode,
      user,
      webSearch,
      files,
      youtube,
    });
    log('multiModal_returned');

    // NOTE: AbortSignal propagation (req.signal → modelsService → upstream fetch)
    // is not wired yet; requires plumbing through ILLMRequest types.
    // TODO: thread req.signal so client abort cancels upstream LLM call.

    return new Response(result);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[CHAT-API] error', error);
    return new Response('Error', { status: 500 });
  }
}
