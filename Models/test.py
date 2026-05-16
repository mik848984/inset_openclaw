import time

import openai
import json

client = openai.OpenAI(
    base_url="https://api.deepinfra.com/v1/openai",
    api_key="UHHqxwr7uoNCRGcwBx0Jy9uz7k4tPYjG",
)

tools = [{
    "type": "function",
    "function": {
        "name": "get_relevance_resume",
        "description": "Gets a number from 0 to 1, indicating the relevance of the resume to the description of which candidate they are looking for and the reason why the candidate is not suitable.",
        "parameters": {
            "type": "object",
            "properties": {
                "score": {
                    "type": "number",
                    "description":
                        "The number from 0 to 1, indicating the relevance of the resume to the description of which candidate is being searched for"
                },
                "reason": {
                    "type": "string",
                    "description":
                        'Explains his verdict on the candidate, the verdict should be detailed in the form of a list, use smiles ✔️ and ❌',
                }
            },
            "required": ["score", "reason"]
        },
    }
}]

hr_prompt = """
I need a backend candidate with at least 4 years of experience in Rust. The candidate should also write tests and automated tests. Experience working in banks is required.
"""

resume_prompt = """
Опыт работы:

Сбер - Июнь, Руководитель направления разработки, 2022 — сейчас (3 года):
Разработка Frontend приложений на React.
Разработка Backend приложений на Spring.

Работа включала в себя разработку микрофронтендов во внутренней системе. 
Разработка собственного фреймворка для сборки и организации архитектуры микрофронтендов.
Разработка общей библиотеки инструментов UI и Utils.
Разработка промежуточных микросервисов на Java.

Писал документации к проектам, как для пользователей, так и для разработчиков

Разработка множества инструментов для поддержки огромного количества команд в компании (Утилиты сборки, анализа качества проектов, метрики по проектам, деплой системы и etc)

Лидер компетенций автотестирования на всем направлении ВЭД, внедрял практики тестирования на десятки команд, разработка фреймоврка автотестирования на основе Playwright.

WorkSolutions, Middle Frontend, Май 2019 — Май 2022 (3 года 1 месяц):
Разработка SPA приложений, на React, Vue, Angular.
Разработка backend приложений на Node.js, python, php, golang. 
Работа в команде, наставничество и обучение стажеров.
Проведение собеседований Junior и middle разработчиков
Разрабатывал курсы по git и frontend для внутреннего обучения сотрудников
Ревью кода

Учавствую в поддержке библиотек нашей компании: пишу тесты, документации с помощью storyBook, реализую функционал.

- Занимался менторством и обучением стажеров, проверкой качества кода на проектах
- Разрабатывал курсы по git и frontend для внутреннего обучения сотрудников
- Проводил собеседования junior и middle разработчиков

Навыки:

TypeScript / JavaScript
CSS / SASS / Styled components / Vanilla Extract
React / Angular / Vue
Next.js / Nest.js / Express.js
MongoDB / PostgreSQL
Mongoose / TypeORM
Webpack / Gulp
Unit Testing / Integration Testing (Playwright)
Jest / enzyme / react-testing-library
TDD / BDD
Mobx / Redux-toolkit / NgRx / Vuex / Effector
Prettier / eslint
Clean architecture / Design Patterns
Docker / Nginx
Python
Flask
PyMongo
Golang
Gin
Linux
MaterialUI / DevExtreme / AntDesign
API Gateway
SOLID
Solid.js
Redux-saga
Java/Spring Framework
tact
Func

О себе:

Телеграм: @GGGGGGrisha
Мой гитхаб: https://github.com/grigoriy-grisha
Мой хабр: https://habr.com/ru/users/GgavriLOVE/posts/

Очень хотелось бы попробовать себя в блокчейн разработке:
Рассматриваю разработку смартконтрактов на tact и func

- Имею опыт работы со всеми современными и популярными фреймворками (React,
Angular,Vue,Next.js)
- Работал с каждым популярным стейт менеджером (Mobx,Redux,Redux-toolkit,NgRx,Vuex)
- Опробовал много библиотек на практике, так же много поковырял в исходниках и
понимаю как они работают
- Хорошо владею вёрсткой, использую все современные и хорошо поддерживаемые
браузерами технологии для верстки
- Погружался в исходники mobx, разбирался как там все работает и развеял магию этой
библиотеки
- окунался с головой в исходники реакта и окунаюсь до сих пор
- Навык копания в исходниках помог мне найти утечку в одном из webpack плагинов, что
позволило ускорить сборку приложения в десятки раз и сократило потребление памяти с
16гб до 1.5 гб
- Работал много с node js, использовал express js и nest.js, в качестве баз данных использовали
postgesql или mongodb
- Имел опыт разработки и интеграции с api Gateaway
- Работал с python и flask
- Изучал numpy и pandas
- Настраивал инфраструктуру проектов в Docker контейнерах, разворачивал dev/prod на
удаленных серверах
- Умею пользоваться chrome-devtools для отлавливания багов и узких горлышек в
производительности, отлавливал проблемы связанные с shift Layout и force layout
Гаврилов Григорий • Резюме обновлено 13 февраля 2024 в 21:53
- Использую тесты в своей работе.
- Набил руку на тестах, что позволяет через TDD разрабатывать программу быстрее и
качественнее
- Разрабатывал библиотеку компонентов и хуков
- Разрабатывал систему генераций административных панелей из конфигураций
- Разрабатывал библиотеку утилит через TDD
- Работал на сложных проектах со спринтами с применением таск менеджеров, agile, канбан
досок, где требовался кропотливый приход к архитектуре и организации кода
- Занимался менторством и обучением стажеров, проверкой качества кода на проектах
- Разрабатывал курсы по git и frontend для внутреннего обучения сотрудников
- Проводил собеседования junior и middle разработчиков
- Умею расставлять приоритет задач и коммуницировать с менеджерами для получения
блестящих результатов в планировании сроков и выпуске релизов
- Писал документации к проектам, как для пользователей, так и для разработчиков
- Разработка множества инструментов для поддержки огромного количества команд в
компании (Утилиты сборки, анализа качества проектов, метрики по проектам, деплой
системы и etc)
- Изучал функциональное программирование, некоторым практикам из этой парадигмы
смог найти применение в продакшн коде
- Прочитал множество книг по работе js, алгоритмам, построению и организации
архитектуры, рефакторингу, чистоте кода, оптимизации своей работы
- Понимаю и применяю на практике паттерны проектирования, архитектурные принципы
в разработке веб приложений
- Контроль качества кода
- В свободное время изучаю исходники различных библиотек и фреймворков набираюсь
навыков

- Являюсь одним из разработчиков в https://deep.foundation/, несем lowcode каждому в дом!

- Разработал опенсорс проект, бесплатный учебник с использованием нейросетей, в котором более 70,000 пользователей - https://github.com/grigoriy-grisha/GPTutor

- Изучал исходники реакта и задокументировал модуль планирования react-scheduler
https://github.com/grigoriy-grisha/react-sheduler-explainer

- Пишу копию крупной фронтенд-бибилиотеки mobx https://github.com/grigoriy-grisha/mobx-explainer и статью с объяснением механизмов реактивности в этой библиотеке
По реализации была написана большая статья https://habr.com/ru/post/689374/

Скромная реализация рендеринга в консоль из древовидной структуры, подобной html - https://github.com/grigoriy-grisha/Hand-Of-MIdas (правда, проект написан на golang)

Утилита организации microfrontends с использоанием System.js (Еще в работе)
https://github.com/grigoriy-grisha/microfrontends

- Сейчас стараюсь выступать с докладами на прогерских конеференциях

Телеграм: @GGGGGGrisha
Мой гитхаб: https://github.com/grigoriy-grisha
Мой хабр: https://habr.com/ru/users/GgavriLOVE/posts/


Образование:
Уровень: Высшее.

Московский государственный университет имени М.В. Ломоносова, Москва
2020
"""

messages = [
    {
        "role": "user",
        "content": "Оцени резюме по таким критериям: " + hr_prompt
    },
    {
        "role": "user",
        "content": "Резюме кандидата:" + resume_prompt
    },
    {
        "role": "user",
        "content": """
Пиши на русском! 
  
Примерный формат:
✔️ Плюсы:
- Указан опыт работы с Rust, хотя и без детализации.
- Кандидат имеет высшее образование в области программной инженерии.
❌ Минусы:
- Основной опыт и указанные проекты связаны с C#, что не соответствует требованиям вакансии.
- Отсутствует указание коммерческого опыта в Rust (требуется 3+ года).
- Не указан опыт работы с Actix, Tokio, MongoDB, PostgreSQL, Redis, что является ключевым требованием.
- Уровень английского (B1) может быть недостаточным для эффективной работы в команде.
- Указан широкий спектр технологий, что может говорить об отсутствии глубокой специализации в Rust.
        """
    }
]

start_time = time.time()

# let's send the request and print the response
response = client.chat.completions.create(
    model="google/gemini-1.5-flash-8b",
    messages=messages,
    tools=tools,
    tool_choice="required",
)

print("Цена запроса: " + str(response.usage.estimated_cost * 81.4933) + " рублей")

tool_calls = response.choices[0].message.tool_calls

end_time = time.time()
duration = end_time - start_time

print(f"Время, затраченное на запрос: {duration:.2f} секунд")

for tool_call in tool_calls:
    dump = tool_call.model_dump()
    score = dump['function']['arguments']

    arguments_string = dump['function']['arguments']

    arguments_data = json.loads(arguments_string)

    print("Оценка: " + str(arguments_data['score']))
    print("Причина: " + arguments_data['reason'])
