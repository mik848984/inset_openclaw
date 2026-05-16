from random import randint

from g4f import Client
from requests.exceptions import RequestException



def txt2img(prompt, negative_prompt, model, scheduler, guidance_scale, steps, seed=randint(1, 10000)):
    try:
        client = Client()
        response = client.images.generate(
            model="flux",
            prompt=prompt,
            response_format="url"
        )

        return {"output": [response.data[0].url], "meta": {"seed": seed}}

    except RequestException as exc:
        raise RequestException("Unable to fetch the response.") from exc
