import { createParser, ParsedEvent, ReconnectInterval } from 'eventsource-parser';

export interface ICompletionsUser {
  prompt_tokens: number;
  total_tokens: number;
  completion_tokens: number;
}

export async function getTextFromStream(stream: ReadableStream) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();

  let result = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    result += decoder.decode(value, { stream: true });
  }

  result += decoder.decode();

  return result;
}

export async function llmStream(
  res: Response,
  onClose: (usage: ICompletionsUser) => void,
  textToLast?: string,
) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  // ── Lightweight latency instrumentation ─────────────────────────
  const tInvoked =
    typeof performance !== 'undefined' ? performance.now() : Date.now();
  const dt = () =>
    Math.round(
      (typeof performance !== 'undefined' ? performance.now() : Date.now()) -
        tInvoked,
    );
  // eslint-disable-next-line no-console
  console.log(`[CHAT-LLM] llmStream_invoked status=${res.status} +${dt()}ms`);

  // ── Fast error path: only read body when status indicates failure.
  // Previously this function pre-read res.clone().body and waited for
  // the first upstream chunk before returning the stream — which added
  // TTFT delay on every successful response. Now we return the stream
  // immediately and handle "[ERROR]" SSE events inside the parser loop.
  if (res.status !== 200) {
    const errorText = await res.text().catch(() => '');
    throw new Error(
      `API returned an error: ${errorText || res.statusText || res.status}`,
    );
  }

  return new ReadableStream({
    async start(controller) {
      let firstUpstreamChunkLogged = false;
      let firstEnqueueLogged = false;

      const onParse = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type !== 'event') return;

        const data = event.data;

        // Upstream error (sent as SSE event "data: [ERROR] ..."):
        // handle inside parser so successful responses are not delayed.
        if (data.startsWith('[ERROR]')) {
          controller.error(new Error(`Upstream error: ${data}`));
          return;
        }

        if (data === '[DONE]') {
          // eslint-disable-next-line no-console
          console.log(`[CHAT-LLM] llmStream_done +${dt()}ms`);
          if (textToLast) controller.enqueue(encoder.encode(textToLast));
          controller.close();
          return;
        }

        try {
          const json = JSON.parse(data);
          const text = json.choices?.[0]?.delta?.content;

          if (json.usage) {
            onClose(json.usage);
          }

          if (!text) return;

          if (!firstEnqueueLogged) {
            // eslint-disable-next-line no-console
            console.log(`[CHAT-LLM] llmStream_first_enqueue +${dt()}ms`);
            firstEnqueueLogged = true;
          }

          controller.enqueue(encoder.encode(text));
        } catch (e) {
          controller.error(e);
        }
      };

      const parser = createParser(onParse);

      // Iterate upstream chunks; first chunk timing == TTFT to client.
      for await (const chunk of res.body as any) {
        if (!firstUpstreamChunkLogged) {
          // eslint-disable-next-line no-console
          console.log(
            `[CHAT-LLM] llmStream_first_upstream_chunk +${dt()}ms`,
          );
          firstUpstreamChunkLogged = true;
        }
        parser.feed(decoder.decode(chunk));
      }
    },
  });
}
