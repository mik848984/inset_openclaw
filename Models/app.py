import os
import asyncio
import json
import re
from random import randint

import requests
import tiktoken
from duckduckgo_search import DDGS
from flask import Flask, request, Response
from g4f import Client
from g4f.Provider import PollinationsAI, DeepInfraChat, Websim, TeachAnything, LambdaChat
from g4f.providers.retry_provider import RetryProvider
from openai import OpenAI

from llm.GeminiPro import GeminiPro, download_all_files_threaded
from llm.proxy import get_next_proxy, get_next_proxy_usa
from parse_hh_data import download, parse
from parse_hh_data.format_resume import format_resume, parse_russian_date, calculate_age, format_age_string

app = Flask(__name__)


def get_event_message(chunk, model):
    return json.dumps({
        "id": str(randint(0, 10000000)),
        "object": "chat.completion.chunk",
        "model": model,
        "choices": [
            {
                "index": 0,
                "delta": {"content": chunk},
                "finish_reason": None
            }
        ]
    })


def num_tokens_from_string(string: str) -> int:
    encoding = tiktoken.get_encoding("cl100k_base")
    num_tokens = len(encoding.encode(string))
    return num_tokens


def get_last_message(token, model, messages, output):
    prompt_tokens = num_tokens_from_string("".join(str(message["content"]) for message in messages)) / 4
    completion_tokens = num_tokens_from_string(output)

    return json.dumps({
        "id": str(randint(0, 10000000)),
        "object": "chat.completion.chunk",
        "model": model,
        "usage": {
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "total_tokens": prompt_tokens + completion_tokens
        },
        "choices": [
            {
                "index": 0,
                "delta": {"content": None},
                "finish_reason": "stop"
            }
        ]
    })


def create_model_client(model, client):
    return {
        "model": model,
        "client": client
    }


openrouter_client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY", ""),
)

deep_seek_r1_gpt4free = create_model_client(
    client=Client(provider=RetryProvider([PollinationsAI, DeepInfraChat])),
    model="deepseek-r1"
)

deepseek_v3_gpt4free = create_model_client(
    client=Client(provider=RetryProvider([PollinationsAI, DeepInfraChat])),
    model="deepseek-v3"
)

mixtral_small_gpt4free = create_model_client(
    client=Client(provider=RetryProvider([DeepInfraChat])),
    model="mixtral-small-24b"
)

mixtral_8x22_gpt4free = create_model_client(
    client=Client(provider=RetryProvider([DeepInfraChat])),
    model="mixtral-8x22b"
)

gemini_2_flash_thinking_gpt4free = create_model_client(
    client=Client(provider=RetryProvider([PollinationsAI])),
    model="gemini-2.0-flash-thinking"
)

gemini_2_flash_thinking_official = create_model_client(
    client=Client(provider=GeminiPro),
    model="gemini-2.0-flash-thinking-exp-01-21"
)
gemini_2_5_flash_thinking_official = create_model_client(
    client=Client(provider=GeminiPro),
    model="gemini-2.5-flash"
)

gemini_2_5_flash_lite_official = create_model_client(
    client=Client(provider=GeminiPro),
    model="gemini-2.5-flash-lite"
)

gemini_2_5_pro_official = create_model_client(
    client=Client(provider=GeminiPro),
    model="gemini-2.5-pro"
)

gemini_2_flash_thinking_openrouter = create_model_client(
    client=openrouter_client,
    model="google/gemini-2.0-flash-thinking-exp:free"
)

gemini_2_flash_exp_openrouter = create_model_client(
    client=openrouter_client,
    model="google/gemini-2.0-flash-exp:free"
)

gemini_2_flash_gpt4free = create_model_client(
    client=Client(provider=RetryProvider([PollinationsAI])),
    model="gemini-2.0-flash"
)

gemini_1_5_flash_gpt4free = create_model_client(
    client=Client(provider=RetryProvider([Websim, TeachAnything])),
    model="gemini-1.5-flash"
)

llama_3_3_70b_gpt4free = create_model_client(
    client=Client(provider=RetryProvider([PollinationsAI, DeepInfraChat, LambdaChat])),
    model="llama-3.3-70b",
)

llama_3_2_90b_gpt4free = create_model_client(
    client=Client(provider=RetryProvider([DeepInfraChat])),
    model="llama-3.2-90b",
)

llama_3_1_70b_gpt4free = create_model_client(
    client=Client(provider=RetryProvider([])),
    model="llama-3.1-70b",
)
models = {
    "deepseek-r1": {
        "clients": [
            deep_seek_r1_gpt4free,
            gemini_2_flash_thinking_official,
            gemini_2_flash_thinking_openrouter,
            gemini_2_flash_thinking_gpt4free,
        ],
    },
    "deepseek-v3": {
        "clients": [
            deepseek_v3_gpt4free,
            deep_seek_r1_gpt4free,
        ],
    },
    "mistral-small": {
        "clients": [
            gemini_2_flash_thinking_official,
            gemini_2_flash_exp_openrouter,
            gemini_2_flash_thinking_gpt4free,
            gemini_2_flash_gpt4free,
            gemini_1_5_flash_gpt4free,
        ],
    },
    "llama-3": {
        "clients": [
            llama_3_3_70b_gpt4free,
            llama_3_2_90b_gpt4free,
            llama_3_1_70b_gpt4free,
            gemini_2_flash_thinking_official,
            gemini_2_flash_exp_openrouter,
            gemini_2_flash_thinking_gpt4free,
            gemini_2_flash_gpt4free,
            gemini_1_5_flash_gpt4free,
            deepseek_v3_gpt4free,
            deep_seek_r1_gpt4free,
        ],
    },
    "gemini-2.0-flash-thinking": {
        "clients": [
            gemini_2_flash_thinking_official,
            gemini_2_flash_thinking_official,
            gemini_2_flash_thinking_official,
            gemini_2_flash_thinking_official,
            gemini_2_flash_thinking_official,
            gemini_2_flash_thinking_official,
            gemini_2_flash_thinking_official,
            gemini_2_flash_thinking_official,
            gemini_2_flash_thinking_official,
            gemini_2_flash_thinking_official,
            gemini_2_flash_thinking_official,
            gemini_2_flash_thinking_official,
            gemini_2_flash_thinking_openrouter,
            gemini_2_flash_exp_openrouter,
            gemini_2_flash_thinking_gpt4free,
            gemini_2_flash_gpt4free,
            gemini_1_5_flash_gpt4free
        ],
    },
    "gemini-2.5-flash": {
        "clients": [
            gemini_2_5_flash_thinking_official,
            gemini_2_5_flash_thinking_official,
            gemini_2_5_flash_thinking_official,
            gemini_2_5_flash_thinking_official,
            gemini_2_5_flash_thinking_official,
            gemini_2_5_flash_thinking_official,
            gemini_2_5_flash_thinking_official,
            gemini_2_5_flash_thinking_official,
            gemini_2_5_flash_thinking_official,
            gemini_2_5_flash_thinking_official,
            gemini_2_5_flash_thinking_official,
            gemini_2_flash_thinking_openrouter,
        ],
    },
    "gemini-2.5-flash-lite": {
        "clients": [
            gemini_2_5_flash_lite_official,
            gemini_2_5_flash_lite_official,
            gemini_2_5_flash_lite_official,
            gemini_2_5_flash_lite_official,
            gemini_2_5_flash_lite_official,
            gemini_2_5_flash_lite_official,
            gemini_2_5_flash_lite_official,
            gemini_2_5_flash_lite_official,
            gemini_2_5_flash_lite_official,
            gemini_2_5_flash_lite_official,
            gemini_2_5_flash_lite_official,
            gemini_2_flash_thinking_openrouter,
        ],
    },
    "gemini-2.5-pro": {
        "clients": [
            gemini_2_5_pro_official,
            gemini_2_5_pro_official,
            gemini_2_5_pro_official,
            gemini_2_5_pro_official,
            gemini_2_5_pro_official,
            gemini_2_5_pro_official,
            gemini_2_5_pro_official,
            gemini_2_5_pro_official,
            gemini_2_5_pro_official,
            gemini_2_5_pro_official,
            gemini_2_5_pro_official,
            gemini_2_5_pro_official,
            gemini_2_5_pro_official,
            gemini_2_5_flash_thinking_official,
            gemini_2_5_flash_thinking_official,
            gemini_2_5_flash_thinking_official,
            gemini_2_5_flash_thinking_official,
            gemini_2_5_flash_thinking_official,
            gemini_2_5_flash_thinking_official,
            gemini_2_5_flash_thinking_official,
            gemini_2_5_flash_lite_official,
            gemini_2_5_flash_lite_official,
            gemini_2_5_flash_lite_official,
            gemini_2_5_flash_lite_official,
            gemini_2_5_flash_lite_official,
            gemini_2_5_flash_lite_official,
            gemini_2_5_flash_lite_official,
            gemini_2_5_flash_lite_official,
            gemini_2_5_flash_lite_official,
            gemini_2_5_flash_lite_official,
            gemini_2_5_flash_lite_official,
            gemini_2_flash_thinking_openrouter,
        ],
    }
}


def create_completions(model, messages, web_search, files, youtube):
    print('HELLO!')
    model_config = models[model]

    for model_client in model_config['clients']:
        try:
            model_request = model_client["model"]
            client = model_client["client"]

            def get_stream():
                if isinstance(client, OpenAI):
                    return client.chat.completions.create(
                        extra_headers={
                            "HTTP-Referer": "https://iiset.io/chat",
                            "X-Title": "IISet",
                        },
                        model=model_request,
                        messages=messages,
                        stream=True,
                    )

                if model_request.startswith("gemini"):
                    gemini_model = model_request

                    print(dict(gemini_model=gemini_model))

                    if youtube:
                        gemini_model = "gemini-2.0-flash"

                    print(dict(gemini_model=gemini_model))
                    return client.chat.completions.create(
                        model=gemini_model,
                        messages=messages,
                        stream=True,
                        web_search=web_search,
                        proxy=get_next_proxy_usa(),
                        media=download_all_files_threaded(files_data=files),
                        youtube_video=youtube
                    )

                return client.chat.completions.create(
                    model=model_request,
                    messages=messages,
                    stream=True,
                )

            stream = get_stream()

            output = ""

            print(model_request)
            print(client)

            for token in stream:
                if token.choices[0].finish_reason == "stop":
                    yield 'data:' + get_last_message(token, model, messages, output=output) + '\n\n'

                content = token.choices[0].delta.content
                if content is not None:
                    output += content

                    yield 'data:' + get_event_message(token.choices[0].delta.content, model) + '\n\n'

            yield "data: [DONE]\n\n"

            return

        except Exception as e:
            print(e)
            continue

    yield 'data: [ERROR]\n\n'


@app.post('/llm')
def llm_post():
    files = request.json["files"] if "files" in request.json else []
    youtube = request.json["youtube"] if "youtube" in request.json else None

    return Response(
        create_completions(
            request.json["model"],
            request.json["messages"],
            request.json["webSearch"],
            files,
            youtube,
        ),
        mimetype='text/event-stream'
    )


@app.post('/image')
def image_post():
    attempt = 0

    print(request.json["model"])
    print(request.json["prompt"])

    while attempt < 5:
        attempt += 1
        print(attempt)
        try:
            client = Client(provider=PollinationsAI)

            proxy = get_next_proxy()
            print(proxy)

            response = client.images.generate(
                prompt=request.json["prompt"],
                model=request.json["model"],
                response_format="url"
            )

            print(response.data[0].url)

            requests.get(response.data[0].url)

            return {
                "url": response.data[0].url
            }

        except Exception as e:
            print(e)


def get_search_results(query):
    client = Client(provider=PollinationsAI)
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": query}],
        web_search=True
    )

    text = response.choices[0].message.content

    pattern = r'\[.*?\]\((https?://[^\s)]+)'

    urls = re.findall(pattern, text)

    result = []
    for i, url in enumerate(set(urls), 1):
        print(f"{i}. {url}")

        result.append({"title": "", "href": url, "body": ""})

    return result


@app.get('/resume_hh/<id>')
async def resume_hh(id):
    try:
        resume = download.resume(id)
        resume_dict = parse.resume(resume)
        resume = format_resume(resume_dict)
        birth_date_str = resume_dict.get('birth_date')
        age = format_age_string(calculate_age(parse_russian_date(birth_date_str)))

        return {
            "resume": resume,
            "title": resume_dict["title"],
            "area": resume_dict["area"],
            "age": age
        }
    except Exception as e:
        resume = download.resume(id)
        resume_dict = parse.resume(resume)
        resume = format_resume(resume_dict)
        birth_date_str = resume_dict.get('birth_date')
        age = format_age_string(calculate_age(parse_russian_date(birth_date_str)))

        return {
            "resume": resume,
            "title": resume_dict["title"],
            "area": resume_dict["area"],
            "age": age
        }


@app.post('/ddg')
async def ddg_post():
    try:
        result = get_search_results(request.json["query"])

        if len(result) == 0:
            raise Exception("Нет результатов")

        return result
    except Exception as e:
        print(e)
        attempt = 0
        while attempt < 10:
            attempt += 1
            proxy = get_next_proxy()
            print(proxy)
            try:
                return DDGS(proxy=proxy).text(request.json["query"], max_results=5)
            except:
                await asyncio.sleep(5)

        return DDGS(proxy=get_next_proxy()).text(request.json["query"], max_results=5)


def run_flask():
    app.run(debug=True, port=1337, host="0.0.0.0")


# logging.basicConfig(level=logging.DEBUG)

if __name__ == '__main__':
    run_flask()
