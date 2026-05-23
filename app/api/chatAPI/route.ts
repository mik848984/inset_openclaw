import { modelsService } from '@/services/api/ModelsService';
import { auth } from '@/auth';
import User from '@/models/user';
import Project from '@/models/project';
import ProjectSource from '@/models/projectSource';
import dbConnect from '@/lib/db';
import { buildProjectSystemPrompt } from '@/services/api/ProjectService';
import { retrievalService } from '@/services/api/RetrievalService';

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

          // ── Project RAG retrieval ────────────────────────────────
          // Берём последний user-вопрос как query, дёргаем hybrid
          // retrieval (vector + keyword + rerank). Чанки попадают в
          // system prompt как «Релевантные источники [P1] [P2] ...».
          let lastUserIdx = -1;
          for (let i = messagesForLLM.length - 1; i >= 0; i--) {
            if (messagesForLLM[i] && messagesForLLM[i].role === 'user') {
              lastUserIdx = i;
              break;
            }
          }
          const queryText: string =
            lastUserIdx !== -1
              ? String(messagesForLLM[lastUserIdx]?.content || '')
              : (project as any).title || '';

          let ragBlock = '';
          let usedSourceIds: string[] = [];
          try {
            const tRetrieval =
              typeof performance !== 'undefined'
                ? performance.now()
                : Date.now();
            const chunks = await retrievalService.retrieve({
              projectId: String((project as any)._id),
              userEmail: session?.user?.email || '',
              query: queryText,
              topFinal: 8,
            });
            const retrievalDt = Math.round(
              (typeof performance !== 'undefined'
                ? performance.now()
                : Date.now()) - tRetrieval,
            );
            log('rag_done', {
              chunks: chunks.length,
              dt: retrievalDt,
              hybrid: retrievalService.isHybrid(),
            });

            if (chunks.length > 0) {
              const sourceIds = Array.from(
                new Set(chunks.map((c) => c.sourceId)),
              );
              const sources = await ProjectSource.find({
                _id: { $in: sourceIds },
                project: (project as any)._id,
                userEmail: session?.user?.email,
              })
                .select({ _id: 1, title: 1, type: 1, url: 1 })
                .lean();
              const sourceMap = new Map(
                sources.map((s: any) => [String(s._id), s]),
              );
              usedSourceIds = sourceIds;
              const lines: string[] = ['', 'Релевантные источники проекта:'];
              chunks.forEach((c, i) => {
                const s = sourceMap.get(c.sourceId);
                const label = s
                  ? `${(s as any).title}${
                      (s as any).url ? ` (${(s as any).url})` : ''
                    }`
                  : 'Источник';
                const loc = [
                  c.page ? `стр. ${c.page}` : '',
                  c.sectionTitle || '',
                  c.sheet || '',
                  c.rowRange || '',
                ]
                  .filter(Boolean)
                  .join(' · ');
                lines.push(
                  `[P${i + 1}] ${label}${loc ? ` — ${loc}` : ''}\nФрагмент:\n${c.text.slice(0, 1400)}`,
                );
              });
              ragBlock = lines.join('\n\n');
            }
          } catch (ragErr) {
            // eslint-disable-next-line no-console
            console.error('[CHAT-API] rag_failed', ragErr);
          }

          // 1) system-сообщение с контекстом проекта + RAG-фрагменты.
          const projectSystemMessage = {
            role: 'system',
            content: [
              ctx,
              ragBlock,
              'Правила для проектного чата:',
              '— Отвечай по-русски.',
              '— Используй источники проекта, опирайся на них в первую очередь.',
              '— Цитируй источники проекта маркерами [P1], [P2] сразу после утверждений.',
              '— Если активен веб-поиск, источники из интернета цитируй маркерами [1], [2] и явно отделяй: «В источниках проекта… В интернете…».',
              '— Если данных источников не хватает — честно скажи и предложи, какие материалы стоит добавить в проект.',
              '— Не выдумывай цифры. Не выводи голые URL — UI сам покажет карточки.',
              '— Никогда не выводи <think>.',
              usedSourceIds.length > 0
                ? `— Доступные источники проекта (${usedSourceIds.length}).`
                : '— Сейчас в проекте нет материалов — мягко предложи их добавить.',
            ]
              .filter(Boolean)
              .join('\n'),
          };

          // 2) префикс к последнему user-сообщению — чтобы webSearch и
          // image-gen pipeline тоже знали о проекте.
          messagesForLLM = messagesForLLM.map((m: any, i: number) =>
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
            ragChunks: usedSourceIds.length,
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
