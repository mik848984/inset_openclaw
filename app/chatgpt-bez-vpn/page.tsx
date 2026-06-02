import Link from "next/link";
import { TrackedPricingCTA } from "@/components/TrackedPricingCTA";

export const metadata = {
  title: "ChatGPT без VPN в России — работает прямо сейчас через ИИСеть",
  description:
    "ChatGPT заблокирован в России и требует VPN? ИИСеть даёт доступ к GPT-4o, DeepSeek, Claude, Gemini без VPN, регистрации и западных карт. Работает прямо сейчас.",
  keywords: [
    "chatgpt без vpn",
    "chatgpt без впн",
    "chatgpt в россии",
    "chatgpt заблокирован",
    "chatgpt аналог россия",
    "chatgpt без регистрации",
    "chatgpt бесплатно россия",
    "нейросеть без vpn",
    "gpt без vpn россия",
    "аналог chatgpt без vpn",
  ],
  alternates: {
    canonical: "https://iiset.io/chatgpt-bez-vpn",
  },
  openGraph: {
    title: "ChatGPT без VPN в России — работает прямо сейчас через ИИСеть",
    description:
      "GPT-4o, DeepSeek, Claude, Gemini — без VPN, без регистрации, без западных карт. От 249 ₽/мес.",
    url: "https://iiset.io/chatgpt-bez-vpn",
    siteName: "ИИСеть",
    locale: "ru_RU",
    type: "article",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Почему ChatGPT не работает в России?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "OpenAI заблокировала регистрацию и оплату из России с июля 2024 года. Сайт chat.openai.com требует VPN, а российские банковские карты не принимаются. Даже с VPN доступ нестабилен — сервис периодически выдаёт ошибку авторизации.",
          },
        },
        {
          "@type": "Question",
          name: "Работает ли ИИСеть без VPN?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Да. ИИСеть размещена на российской инфраструктуре и доступна без VPN из любой точки России. Доступ стабилен 24/7, независимо от блокировок зарубежных сервисов.",
          },
        },
        {
          "@type": "Question",
          name: "Какие модели доступны в ИИСеть?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "GPT-4o, GPT-4o Mini, DeepSeek-V3, DeepSeek-R1, DeepSeek-V4, Claude 3.5 Sonnet, Gemini 1.5 Pro и другие передовые нейросети — все в одном интерфейсе на русском языке. Никакого VPN.",
          },
        },
        {
          "@type": "Question",
          name: "Нужна ли регистрация в ИИСеть?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Нет. ИИСеть работает без обязательной регистрации. Просто откройте сайт — и начинайте общение с нейросетью сразу. Регистрация доступна для сохранения истории и доступа к премиум-функциям, но не обязательна.",
          },
        },
        {
          "@type": "Question",
          name: "Сколько стоит ИИСеть?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Базовое использование бесплатно (ограниченное количество сообщений). Premium-подписка — 249 ₽/месяц за безлимитный доступ ко всем моделям, включая GPT-4o и DeepSeek-R1. Оплата картами РФ, ЮMoney, СБП.",
          },
        },
        {
          "@type": "Question",
          name: "Это безопасно? Мои данные уйдут за границу?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "ИИСеть работает через российские серверы с локальной обработкой запросов. Не нужны VPN, прокси или туннели в Европу/США. Ваши данные не проходят через зарубежную инфраструктуру.",
          },
        },
      ],
    },
    {
      "@type": "WebPage",
      "@id": "https://iiset.io/chatgpt-bez-vpn",
      url: "https://iiset.io/chatgpt-bez-vpn",
      name: "ChatGPT без VPN в России — работает прямо сейчас через ИИСеть",
      description: "ChatGPT заблокирован? ИИСеть — доступ к GPT-4o, DeepSeek, Claude, Gemini без VPN, регистрации и западных карт.",
      inLanguage: "ru-RU",
    },
  ],
};

export default function ChatGPTBezVPNPage() {
  const models = [
    {
      name: "GPT-4o",
      origin: "OpenAI",
      desc: "Лучшая всесторонняя модель: тексты, код, анализ, креативность",
    },
    {
      name: "DeepSeek-R1",
      origin: "DeepSeek",
      desc: "Суперзвезда математики и программирования. Решает задачи ШАД и олимпиадного уровня.",
    },
    {
      name: "Claude 3.5 Sonnet",
      origin: "Anthropic",
      desc: "Превосходно пишет длинные тексты, анализирует документы, вежлив и точен.",
    },
    {
      name: "Gemini 1.5 Pro",
      origin: "Google",
      desc: "Огромный контекст до 1 млн токенов — анализирует целые книги за один запрос.",
    },
    {
      name: "GPT-4o Mini",
      origin: "OpenAI",
      desc: "Быстрая и дешёвая модель для повседневных задач. Идеальна для первых шагов.",
    },
    {
      name: "DeepSeek-V3",
      origin: "DeepSeek",
      desc: "Сбалансированный универсал: код, тексты, переводы, общие вопросы.",
    },
  ];

  const problems = [
    {
      icon: "/icons/vpn-error.svg",
      title: "VPN требуется постоянно",
      text: "ChatGPT, Claude и Google Gemini заблокированы в России. Без VPN — страница не открывается.",
    },
    {
      icon: "/icons/card-blocked.svg",
      title: "Карты РФ не принимаются",
      text: "OpenAI не принимает российские карты. Даже для бесплатного аккаунта нужен VPN + номер другой страны.",
    },
    {
      icon: "/icons/slow-connection.svg",
      title: "VPN = низкая скорость и сбои",
      text: "VPN замедляет соединение, вызывает обрывы и ошибки авторизации. Это неустойчивое решение для работы.",
    },
    {
      icon: "/icons/russian-language.svg",
      title: "Интерфейс на английском",
      text: "Официальный ChatGPT — англоязычный интерфейс. Русский язык поддерживается, но контекст западный.",
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* -- HERO -- */}
      <section className="flex flex-col items-center justify-center px-6 pt-24 pb-20 text-center bg-white">
        <h1 className="max-w-4xl text-3xl font-semibold leading-tight tracking-tight text-ink md:text-[56px] md:leading-[1.07]">
          ChatGPT не работает в России?
          <br />
          <span className="text-blue-600">Работает без VPN.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink/80">
          GPT-4o, DeepSeek, Claude, Gemini — все доступны сейчас, без VPN, без регистрации и
          без западных карт. Просто открой сайт.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <TrackedPricingCTA
            href="/chat"
            location="chatgpt_bez_vpn_hero_primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '14px 28px',
              borderRadius: '9999px',
              background: '#0066cc',
              color: '#fff',
              fontSize: '18px',
              fontWeight: 300,
              textDecoration: 'none',
            }}
          >
            Начать бесплатно
          </TrackedPricingCTA>
          <TrackedPricingCTA
            href="/pricing"
            location="chatgpt_bez_vpn_hero_secondary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '14px 28px',
              borderRadius: '9999px',
              background: '#fff',
              color: '#0066cc',
              fontSize: '18px',
              fontWeight: 300,
              textDecoration: 'none',
              border: '1px solid #0066cc',
            }}
          >
            Тарифы — от 249 ₽/мес
          </TrackedPricingCTA>
        </div>
        <p className="mt-4 text-sm text-ink/48">
          Без VPN · Без регистрации · Оплата картой РФ
        </p>
      </section>

      {/* -- PROBLEM HIGHLIGHT -- */}
      <section className="bg-[#f5f5f7] py-20 px-6">
        <div className="mx-auto max-w-[980px]">
          <h2 className="text-center text-[28px] font-semibold leading-snug tracking-tight text-ink md:text-[40px]">
            Почему ChatGPT — головная боль в России
          </h2>
          <div className="mt-14 grid gap-8 md:grid-cols-2">
            {problems.map((p, i) => (
              <div key={i} className="rounded-2xl bg-white p-8 shadow-sm">
                <h3 className="text-lg font-semibold text-ink">{p.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink/70">
                  {p.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -- MODELS GRID -- */}
      <section className="bg-white py-20 px-6">
        <div className="mx-auto max-w-[980px]">
          <h2 className="text-center text-[28px] font-semibold leading-snug tracking-tight text-ink md:text-[40px]">
            Все модели, для которых раньше нужен был VPN — теперь без него
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-ink/60">
            ИИСеть объединяет лучшие нейросети мира в одном окне на русском языке.
          </p>
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {models.map((m, i) => (
              <div
                key={i}
                className="rounded-[18px] border border-[#e0e0e0] bg-white p-6 transition-colors hover:border-[#0066cc]/30"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold text-ink">{m.name}</span>
                  <span className="rounded-full bg-[#f5f5f7] px-2.5 py-0.5 text-xs text-ink/60">
                    {m.origin}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink/70">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -- FEATURES / WHY IISIET -- */}
      <section className="bg-[#1d1d1f] py-20 px-6 text-white">
        <div className="mx-auto max-w-[980px]">
          <h2 className="text-center text-[28px] font-semibold leading-snug tracking-tight md:text-[40px]">
            Что ты получаешь в ИИСеть
          </h2>
          <div className="mt-14 grid gap-8 md:grid-cols-2">
            {[
              {
                title: "Без VPN",
                text: "Работает из любой точки России. Никаких прокси, туннелей и шаманства с настройками.",
              },
              {
                title: "Без регистрации",
                text: "Открыл сайт — начал общение. За 3 секунды, а не за 3 минуты заполнения форм.",
              },
              {
                title: "Оплата картой РФ",
                text: "Visa, Mastercard, МИР, ЮMoney, СБП. Никаких криптокошельков и посредников.",
              },
              {
                title: "Весь функционал в одном тарифе",
                text: "Чат, веб-поиск, генерация изображений, работа с документами, переводы — за 249 ₽/мес.",
              },
              {
                title: "Русский язык с локальным контекстом",
                text: "Нейросети адаптированы для русскоязычных пользователей. Знают российский КоАП, налоговый кодекс, культурный контекст.",
              },
              {
                title: "6+ моделей в одном окне",
                text: "Не нужно платить за ChatGPT Plus, DeepSeek Pro и Claude Pro отдельно. Всё включено.",
              },
            ].map((f, i) => (
              <div key={i} className="flex gap-4">
                <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 text-sm font-bold">
                  ✓
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{f.title}</h3>
                  <p className="mt-1 text-[15px] leading-relaxed text-white/70">{f.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -- HOW IT WORKS -- */}
      <section className="bg-[#f5f5f7] py-20 px-6">
        <div className="mx-auto max-w-[980px]">
          <h2 className="text-center text-[28px] font-semibold leading-snug tracking-tight text-ink md:text-[40px]">
            Как это работает
          </h2>
          <div className="mt-14 flex flex-col gap-8 md:flex-row md:items-stretch">
            {[
              {
                step: "1",
                title: "Открой iiset.io",
                text: "Без скачиваний, без установок. Просто перейди на сайт с любого устройства.",
              },
              {
                step: "2",
                title: "Выбери модель",
                text: "GPT-4o, DeepSeek, Claude, Gemini — одним кликом. Свитч между моделями мгновенный.",
              },
              {
                step: "3",
                title: "Задай вопрос",
                text: "Пиши на русском. Нейросеть поймёт контекст и ответит без потери смысла.",
              },
              {
                step: "4",
                title: "Получи ответ",
                text: "Ответ генерируется за секунды. Копируй, редактируй, экспортируй — как удобно.",
              },
            ].map((item, i) => (
              <div key={i} className="flex-1 rounded-[18px] bg-white p-6">
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#0066cc] text-sm font-bold text-white">
                  {item.step}
                </div>
                <h3 className="text-base font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/60">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -- FAQ -- */}
      <section className="bg-white py-20 px-6">
        <div className="mx-auto max-w-[720px]">
          <h2 className="text-center text-[28px] font-semibold leading-snug tracking-tight text-ink md:text-[40px]">
            Частые вопросы
          </h2>
          <dl className="mt-14 space-y-8">
            {[
              {
                q: "Это точно работает без VPN?",
                a: "Да. ИИСеть размещена на российских серверах. Никаких туннелей, прокси и VPN-клиентов. Откройте iiset.io — сайт загрузится мгновенно.",
              },
              {
                q: "А модели-то настоящие? Это не подделка?",
                a: "Все модели — оригинальные. GPT-4o — настоящий от OpenAI, DeepSeek-R1 — настоящий от DeepSeek, Claude — настоящий от Anthropic. Мы не создаём подделки, а предоставляем доступ к оригинальным API через российскую инфраструктуру.",
              },
              {
                q: "Сколько стоит и как платить?",
                a: "Базовое использование бесплатно. Premium — 249 ₽/месяц за безлимит ко всем моделям. Оплата картами РФ (Visa, Mastercard, МИР), ЮMoney и СБП.",
              },
              {
                q: "Мой диалог сохранится?",
                a: "Без регистрации — история не сохраняется. Создайте бесплатный аккаунт — и вся история будет доступна с любого устройства.",
              },
              {
                q: "Что лучше — ИИСеть или VPN + ChatGPT?",
                a: "VPN + ChatGPT стоит ~200–400 ₽/мес только за VPN, плюс ~1 830 ₽/мес за ChatGPT Plus, плют карты других стран. ИИСеть — 249 ₽/мес за всё сразу, без VPN, с оплатой картой РФ. Экономия — 5–7×, плюс больше моделей.",
              },
            ].map((faq, i) => (
              <div key={i} className="border-b border-[#e0e0e0] pb-8">
                <dt className="text-base font-semibold text-ink">{faq.q}</dt>
                <dd className="mt-2 text-[15px] leading-relaxed text-ink/70">{faq.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* -- FINAL CTA -- */}
      <section className="bg-white py-20 px-6 text-center">
        <div className="mx-auto max-w-[720px]">
          <h2 className="text-[28px] font-semibold leading-snug tracking-tight text-ink md:text-[40px]">
            Попробуй прямо сейчас
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-ink/60">
            Без VPN. Без регистрации. Без западных карт. Просто открой iiset.io.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <TrackedPricingCTA
              href="/chat"
              location="chatgpt_bez_vpn_bottom_cta"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '14px 28px',
                borderRadius: '9999px',
                background: '#0066cc',
                color: '#fff',
                fontSize: '18px',
                fontWeight: 300,
                textDecoration: 'none',
              }}
            >
              Начать бесплатно
            </TrackedPricingCTA>
            <TrackedPricingCTA
              href="/pricing"
              location="chatgpt_bez_vpn_bottom_pricing"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '14px 28px',
                borderRadius: '9999px',
                background: 'transparent',
                color: '#0066cc',
                fontSize: '18px',
                fontWeight: 300,
                textDecoration: 'none',
                border: '1px solid #0066cc',
              }}
            >
              Тарифы — от 249 ₽/мес
            </TrackedPricingCTA>
          </div>
          <p className="mt-5 text-sm text-ink/48">
            10 000+ пользователей уже пользуются без VPN
          </p>
        </div>
      </section>

      {/* Footer comparison link cluster */}
      <section className="bg-[#f5f5f7] py-12 px-6">
        <div className="mx-auto max-w-[720px] text-center">
          <p className="text-sm text-ink/48">
            Также смотрите:{' '}
            <Link href="/iiset-vs-chatgpt" className="text-[#0066cc] hover:underline">
              ИИСеть vs ChatGPT
            </Link>
            {' · '}
            <Link href="/iiset-vs-deepseek" className="text-[#0066cc] hover:underline">
              ИИСеть vs DeepSeek
            </Link>
            {' · '}
            <Link href="/iiset-vs-yandexgpt" className="text-[#0066cc] hover:underline">
              ИИСеть vs ЯндексGPT
            </Link>
            {' · '}
            <Link href="/iiset-vs-gigachat" className="text-[#0066cc] hover:underline">
              ИИСеть vs GigaChat
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
