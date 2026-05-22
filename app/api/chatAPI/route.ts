import { modelsService } from '@/services/api/ModelsService';
import { auth } from '@/auth';
import User from '@/models/user';
import dbConnect from '@/lib/db';

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

    const { messages, model, mode, webSearch, files, youtube } =
      (await req.json()) as any;
    log('req_json_done', {
      model,
      mode,
      webSearch: !!webSearch,
      messagesCount: Array.isArray(messages) ? messages.length : 0,
      filesCount: Array.isArray(files) ? files.length : 0,
      youtubePresent: !!youtube,
    });

    const session = await auth();
    log('auth_done');

    const user = await User.findOne({ email: session?.user?.email });
    log('user_findone_done');

    const result = await modelsService.multiModalRequest({
      model,
      messages,
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
