from __future__ import annotations

import base64
import concurrent.futures
import json
import threading
from typing import Optional

import requests
from aiohttp import ClientSession, BaseConnector
from g4f import debug, Messages
from g4f.errors import MissingAuthError
from g4f.providers.base_provider import AsyncGeneratorProvider, ProviderModelMixin
from g4f.providers.response import FinishReason, Usage
from g4f.requests import raise_for_status
from g4f.typing import MediaListType, AsyncResult

api_keys = [
    "AIzaSyD_Va7ms2OCay9zJuE4lLxuT5VxWgxyWhw",
    "AIzaSyCRtpD3bb5H04ci2nqWnS4ifSf7b2LsZcg",
    "AIzaSyB5MqN8JZDxAAlHVhtEYnRDcA-1bxmnswA",
    "AIzaSyB6ZEoYhBxPL49o7LnbHSDbUdypT_8dcNw",
    "AIzaSyCJfWSgzIKvaupQpZMyz-xI7znlnWxT6No",
    "AIzaSyCqSWqjVmHETH3r_WY4tDXJ08vPPD8Ju7M",
    "AIzaSyAoPGNDz696E0AWhHFljIUB9GEI8t60xSo",
    "AIzaSyDZizGYch5_CgwUpdGykZ_wLg7OQb2WjRY",
    "AIzaSyA52NEDooSH7OI1fjRHfWwUoevyWiQBLnk",
    "AIzaSyAY63v6EUp5oKlx3QrRKW1VQMbg4iP4atQ",
    "AIzaSyBk9kFT47YVfxkjrnZJ7wmTNDkpsIrXvSk",
    "AIzaSyBLLg9OrpQx1KEYF6NsePMT6OPt9Vj5dGU",
    "AIzaSyBeXLljGIACcrjK1hnIv-GFqKIBJgtU1Uw",
    "AIzaSyBaNa8qdJsJM1TQW2AP1UBzMsZjA1tQOp8",
    "AIzaSyCitruW9Chn19VEL7y10eN_U-wsr_ltHY4",
    "AIzaSyA6TmdCplCNP6hpRaNT0daNZc2GO5hjWig",
    "AIzaSyCBVXcbmXhECydSX-N0otj0zVO8B2K8lh4",
    "AIzaSyCmEV2uE17_bK3fxe1TQ6eFBAzHR63T0H8",
    "AIzaSyBZ5EQ9_g1cPoRW5q4K2EQoQ6HXij4DebU",
    "AIzaSyCVEPcNoAEuYjmJMHVydRDbsBMXwbBbvoU",
    "AIzaSyBgfjSWIPXz_lT3060U5kHsxNVRnIjQVFw",
    "AIzaSyCHcwP1MxozaRM3NOAz0SaPQu4WHWBvOBA",
    "AIzaSyBe4P2lJXV3QiWI_tmFSupRotVJNBITC2k",
    "AIzaSyAOe5C_xhcdLNChg3L3AjMIgr9rGMazZiU",
    "AIzaSyA8sVgwAYl0WT28cmHobz-qAxP9sqS5XBk",
    "AIzaSyAmsTTZX6EUtkIxENQCnZxP2u94R_PzLHI",
    "AIzaSyB91uB1X5rFlmMPhJkJjzlOL7zSHHwOSik",
    "AIzaSyAQ0xEFpSvrBDu5pmHcGp64kQKqpaeIJ00",
    "AIzaSyC1wg7UV0_Jgc-nE-iSCxyDaLr5XF7SZBQ",
    "AIzaSyACxbehTGrOhPrZ_7ezCiE8T6gDaNTSa6A",
    "AIzaSyBZCuxHG99-UgKle6gH-m1vPgWtsCUqBtQ",
    "AIzaSyBSCepMP-p4_ERXz8dkOdWr0G8VIZ3Pz9A",
    "AIzaSyDuVcmhZVsK2HOrD6s6oq0bQ5_B3JZKwO8",
    "AIzaSyDGRWLUj6rLCyWEmX4tAWwAqw_QVDHgaSo",
    "AIzaSyBGG4tXu0QGEMXrXjSD45r2DZJXvLxPIkY",
    "AIzaSyAwYbqfjdn5kDiKHkevIZQDbDcCh1IxpA8",
    "AIzaSyBc-67nz5aOgp8M__0zKQ3uEq_SO_b9lq8",
    "AIzaSyBa_R8eE9mHmrUZQmldT2DoCC9-6wEhAnY",
    "AIzaSyCmgDGmyhstBaPsczkt3kHQ0GyfKIs58_0",
    "AIzaSyCusK25qCshOGMyDYu73fd6rmhPUUM8lVk",
    "AIzaSyDBIZuVqfwz6VegySRzyARCuOb8WZGSm4Y",
    "AIzaSyAuhphWK3MXFrlQ39OhyysVOSPS4JR3ElM",
    "AIzaSyABnSsmRZmyK1ma_wwiLp_JUOy99PnU4Mc",
    "AIzaSyAb2dG-y5Hqq3QubYawBi_iX1kUm0J-XAA",
    "AIzaSyBbF1_JstFLr8AvRqg_q93i8hKE9g8gIXs",
    "AIzaSyCF9TWC9ec9N2Lh1t8VdESIrbQ7pcQtT1c",
    "AIzaSyDYDKxv72wVpCkjDgukiZ0mWHG7AgDHIm4",
    "AIzaSyBigACdt-I887U5Z3-wkUS_kWnFTnu2LUA",
    "AIzaSyCzwpospxRnGNidrHsvPR4duy-KNhq1y0U",
    "AIzaSyBMwZoo17_9wTM_aGKeEj7NvbkfTJRILak",
    "AIzaSyCJXIQeOyI15wd62QuqCrIeR6gJiz3A7P0",
    "AIzaSyABnSsmRZmyK1ma_wwiLp_JUOy99PnU4Mc",
    "AIzaSyCwuEyhQSQChEoA_sNHOq3K9nwKwdNvkj0",
    "AIzaSyAwJ4HG6fw6fvwXXsRAMYf6xnwhDFjY7Co",
    "AIzaSyBwoEkTx7WfshNG8_ZTlP1oBhHnE2xxS6g",
    "AIzaSyCfmFZ0sYTCxyPSBTOWTlXx9wxNt466o-A",
    "AIzaSyAv46HFyh-1kKdpRbo683yWNEwbCE-3slU",
    "AIzaSyB_l6ylxD9VkW01LDr9sJ9IlhOgh8InD8k",
    "AIzaSyD80aq4ROQnr5D1PJ5AuU0QMrjZoabBgEY",
    "AIzaSyAG03Dbwcl6C1HXRSdw29rTLuIMsN6e6Jo",
    "AIzaSyCN2QdKa_Tk4y3hMVLydhkiovLPGujt4kE",
    "AIzaSyA7fldVgai99gUtLdV5KyrNyzohFvkBeHo"
]


def get_api_generator(my_array):
    index = 0
    while True:
        yield my_array[index]
        index += 1
        if index == len(my_array):
            index = 0


api_generator = get_api_generator(api_keys)


def download_single_file(file_info: dict) -> list | None:
    url = file_info.get('url')
    filename = file_info.get('name')
    file_type = file_info.get('type')

    if not url or not filename or file_type is None:
        print(
            f"⚠️ [Поток: {threading.current_thread().name}] Пропущена запись из-за отсутствия 'url', 'name' или 'type': {file_info}")
        return None

    try:
        print(f"🌐 [Поток: {threading.current_thread().name}] Начинаем скачивание: {filename} ({file_type}) с {url}")
        response = requests.get(url)
        response.raise_for_status()
        print(f"✅ [Поток: {threading.current_thread().name}] Скачивание завершено: {filename}")

        return [response.content, file_type, filename]

    except requests.exceptions.HTTPError as e:
        print(f"❌ [Поток: {threading.current_thread().name}] Ошибка HTTP при скачивании {filename} с {url}: {e}")
        return None
    except requests.exceptions.RequestException as e:
        print(f"❌ [Поток: {threading.current_thread().name}] Ошибка запроса при скачивании {filename} с {url}: {e}")
        return None
    except Exception as e:
        print(f"❌ [Поток: {threading.current_thread().name}] Неизвестная ошибка при скачивании {filename} с {url}: {e}")
        return None


def download_all_files_threaded(files_data: list) -> list:
    media_list = []
    with concurrent.futures.ThreadPoolExecutor() as executor:

        future_to_file = {executor.submit(download_single_file, file_info): file_info for file_info in files_data}

        print(f"🚀 Запущено {len(future_to_file)} задач скачивания в пуле потоков.")

        for future in concurrent.futures.as_completed(future_to_file):
            file_info = future_to_file[future]
            try:
                result = future.result()
                if result is not None:
                    media_list.append(result)
            except Exception as exc:
                print(
                    f"❌ [Поток: {threading.current_thread().name}] Задача для {file_info.get('name', '???')} вызвала исключение: {exc}")
                pass

    return media_list


class GeminiPro(AsyncGeneratorProvider, ProviderModelMixin):
    label = "Google Gemini API"
    url = "https://ai.google.dev"
    login_url = "https://aistudio.google.com/u/0/apikey"
    api_base = "https://generativelanguage.googleapis.com/v1beta"

    working = True
    supports_message_history = True
    supports_system_message = True
    needs_auth = True

    default_model = "gemini-1.5-pro"
    default_vision_model = default_model
    fallback_models = [default_model, "gemini-2.0-flash-exp", "gemini-pro", "gemini-1.5-flash", "gemini-1.5-flash-8b"]
    model_aliases = {
        "gemini-1.5-flash": "gemini-1.5-flash",
        "gemini-1.5-pro": "gemini-pro",
        "gemini-2.0-flash": "gemini-2.0-flash-exp",
    }

    @classmethod
    def get_models(cls, api_key: str = None, api_base: str = api_base) -> list[str]:
        if not cls.models:
            try:
                url = f"{cls.api_base if not api_base else api_base}/models"
                response = requests.get(url, params={"key": api_key})
                raise_for_status(response)
                data = response.json()
                cls.models = [
                    model.get("name").split("/").pop()
                    for model in data.get("models")
                    if "generateContent" in model.get("supportedGenerationMethods")
                ]
                cls.models.sort()
            except Exception as e:
                debug.error(e)
                if api_key is not None:
                    raise MissingAuthError("Invalid API key")
                return cls.fallback_models
        return cls.models

    @classmethod
    async def create_async_generator(
            cls,
            model: str,
            messages: Messages,
            stream: bool = False,
            proxy: str = None,
            api_base: str = api_base,
            use_auth_header: bool = False,
            media: MediaListType = None,
            tools: Optional[list] = None,
            web_search: bool = False,
            connector: BaseConnector = None,
            youtube_video: str = None,
            **kwargs
    ) -> AsyncResult:
        api_key = next(api_generator)

        headers = params = None
        if use_auth_header:
            headers = {"Authorization": f"Bearer {api_key}"}
        else:
            params = {"key": api_key}

        method = "streamGenerateContent" if stream else "generateContent"
        url = f"{api_base.rstrip('/')}/models/{model}:{method}"

        async with ClientSession(headers=headers) as session:
            contents = [
                {
                    "role": "model" if message["role"] == "assistant" else "user",
                    "parts": [{"text": message["content"]}]
                }
                for message in messages
            ]
            if media is not None:

                for media_data, file_type, filename in media:
                    contents[-1]["parts"].append({
                        "inline_data": {
                            "mime_type": file_type,
                            "data": base64.b64encode(media_data).decode()
                        }
                    })

            if youtube_video:
                print("HELLO!")
                contents[-1]["parts"].append({
                    "file_data": {
                        "file_uri": youtube_video
                    }
                })

            data = {
                "contents": contents,
                "generationConfig": {
                    "stopSequences": kwargs.get("stop"),
                    "temperature": kwargs.get("temperature"),
                    "maxOutputTokens": kwargs.get("max_tokens"),
                    "topP": kwargs.get("top_p"),
                    "topK": kwargs.get("top_k"),
                },
                "tools": [
                    {
                        "google_search": {}
                    }
                ] if web_search else None
            }
            system_prompt = "\n".join(
                message["content"]
                for message in messages
                if message["role"] == "system"
            )
            if system_prompt:
                data["system_instruction"] = {"parts": {"text": system_prompt}}
            async with session.post(url, params=params, json=data, proxy=proxy) as response:
                if not response.ok:
                    data = await response.json()
                    data = data[0] if isinstance(data, list) else data
                    raise RuntimeError(f"Response {response.status}: {data['error']['message']}")
                if stream:
                    lines = []
                    async for chunk in response.content:
                        if chunk == b"[{\n":
                            lines = [b"{\n"]
                        elif chunk == b",\r\n" or chunk == b"]":
                            try:
                                data = b"".join(lines)
                                data = json.loads(data)
                                yield data["candidates"][0]["content"]["parts"][0]["text"]
                                if "finishReason" in data["candidates"][0]:
                                    print(data)
                                    yield FinishReason(data["candidates"][0]["finishReason"].lower())
                                usage = data.get("usageMetadata")
                                if usage:
                                    yield Usage(
                                        prompt_tokens=usage.get("promptTokenCount"),
                                        completion_tokens=usage.get("candidatesTokenCount"),
                                        total_tokens=usage.get("totalTokenCount")
                                    )
                            except Exception as e:
                                print(e)
                                data = data.decode(errors="ignore") if isinstance(data, bytes) else data
                                raise RuntimeError(f"Read chunk failed: {data}")
                            lines = []
                        else:
                            lines.append(chunk)
                else:
                    data = await response.json()
                    candidate = data["candidates"][0]
                    if candidate["finishReason"] == "STOP":
                        yield candidate["content"]["parts"][0]["text"]
                        usage = data["usageMetadata"]

                        print(usage)
                        yield Usage(
                            prompt_tokens=usage.get("promptTokenCount"),
                            completion_tokens=usage.get("candidatesTokenCount"),
                            total_tokens=usage.get("totalTokenCount")
                        )
                    else:
                        yield candidate["finishReason"] + ' ' + candidate["safetyRatings"]
