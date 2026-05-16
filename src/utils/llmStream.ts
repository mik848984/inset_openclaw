import {createParser, ParsedEvent, ReconnectInterval} from "eventsource-parser";

export interface ICompletionsUser {
    prompt_tokens: number;
    total_tokens: number;
    completion_tokens: number
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

export async function llmStream(res: Response, onClose: (usage: ICompletionsUser) => void, textToLast?: string) {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const result = await res.clone().body?.getReader().read();

    if (decoder.decode(result?.value).startsWith("data: [ERROR]")) {
        throw new Error();
    }

    if (res.status !== 200) {
        const statusText = res.statusText;
        const result = await res.body?.getReader().read();
        throw new Error(
            `API returned an error: ${
                decoder.decode(result?.value) || statusText
            }`,
        );
    }


    return new ReadableStream({
        async start(controller) {
            const onParse = async (event: ParsedEvent | ReconnectInterval) => {
                if (event.type === 'event') {
                    const data = event.data;

                    if (data === '[DONE]') {
                        textToLast && controller.enqueue(encoder.encode(textToLast));
                        controller.close();
                        return;
                    }

                    try {
                        const json = JSON.parse(data);
                        const text = json.choices[0]?.delta?.content;

                        if (json.usage) {
                            onClose(json.usage)
                        }

                        if (!text) return;

                        controller.enqueue(encoder.encode(text));
                    } catch (e) {
                        controller.error(e);
                    }
                }
            };

            const parser = createParser(onParse);

            for await (const chunk of res.body as any) {
                parser.feed(decoder.decode(chunk));
            }
        }
    })
}
