import Link from "next/link";
import { TrackedPricingCTA } from "@/components/TrackedPricingCTA";

export const metadata = {
  title: "Нейросеть онлайн — GPT-4o, DeepSeek, Claude без VPN и регистрации",
  description:
    "ИИСеть — 6 нейросетей онлайн в одном окне. GPT-4o, DeepSeek, Claude, Gemini — без VPN, без регистрации, без западных карт. Работает прямо сейчас.",
  keywords: [
    "нейросеть онлайн",
    "нейросеть бесплатно",
    "нейросеть без регистрации",
    "нейросеть без vpn",
    "нейросеть для текста",
    "нейросеть для кода",
    "нейросеть с русским языком",
    "нейросеть онлайн 2025",
    "лучшая нейросеть для работы",
    "нейросеть на русском",
  ],
  alternates: {
    canonical: "https://iiset.io/neiroset-online",
  },
  openGraph: {
    title: "Нейросеть онлайн — GPT-4o, DeepSeek, Claude без VPN и регистрации",
    description:
      "6 нейросетей в одном окне: GPT-4o, DeepSeek, Claude, Gemini. Без VPN, без регистрации, без западных карт.",
    url: "https://iiset.io/neiroset-online",
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
          name: "Что такое нейросеть онлайн?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Нейросеть онлайн — это AI-модель, доступная через браузер без установки программ. ИИСеть объединяет 6 передовых моделей (GPT-4o, DeepSeek, Claude, Gemini) в одном интерфейсе, который работает без VPN и регистрации.",
          },
        },
        {
          "@type": "Question",
          name: "Какие нейросети доступны в ИИСеть?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Доступны GPT-4o, GPT-4o Mini, DeepSeek-V3, DeepSeek-R1, Claude 3.5 Sonnet, Gemini 1.5 Pro и другие передовые модели. Все в одном интерфейсе на русском языке и без VPN.",
          },
        },
        {
          "@type": "Question",
          name: "Нужна ли регистрация?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Нет. Вы можете начать работу с нейросетью сразу — без регистрации и SMS. Достаточно открыть сайт и задать вопрос. Регистрация доступна для сохранения истории диалогов, но не обязательна.",
          },
        },
        {
          "@type": "Question",
          name: "Это бесплатно?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Базовое использование бесплатно. Каждый пользователь получает бесплатный лимит сообщений для знакомства с нейросетями. Для неограниченного использования доступна Premium-подписка всего за 249 ₽/месяц.",
          },
        },
        {
          "@type": "Question",
          name: "Чем ИИСеть отличается от ChatGPT?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "ИИСеть работает из России без VPN, принимает российские карты и поддерживает русский контекст. Вместо одной модели (GPT) вы получаете 6 нейросетей на выбор — GPT-4o, DeepSeek, Claude, Gemini — в одном интерфейсе.",
          },
        },
        {
          "@type": "Question",
          name: "Что можно делать с нейросетью?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Написать текст, проверить код, составить резюме, подготовить презентацию, перевести документ, найти информацию в вебе, сгенерировать изображение, переписать сложный текст проще — и многое другое. В ИИСеть нейросеть помогает с любыми задачами.",
          },
        },
      ],
    },
    {
      "@type": "WebPage",
      "@id": "https://iiset.io/neiroset-online",
      url: "https://iiset.io/neiroset-online",
      name: "Нейросеть онлайн — GPT-4o, DeepSeek, Claude без VPN и регистрации",
      description: "ИИСеть — 6 нейросетей онлайн в одном окне без VPN и регистрации.",
      inLanguage: "ru-RU",
    },
  ],
};

export default function NeirosetOnlinePage() {
  const models = [
    {
      name: "GPT-4o",
      origin: "OpenAI",
      desc: "Лучшая универсальная модель: тексты, код, анализ, креатив, диалоги",
    },
    {
      name: "DeepSeek-R1",
      origin: "DeepSeek",
      desc: "Суперзвезда математики и программирования. Решает сложные задачи.",
    },
    {
      name: "Claude 3.5 Sonnet",
      origin: "Anthropic",
      desc: "Отлично пишет длинные тексты, анализирует документы до 200 тыс. токенов",
    },
    {
      name: "Gemini 1.5 Pro",
      origin: "Google",
      desc: "Огромный контекст до 1 млн токенов — анализирует целые книги за раз",
    },
    {
      name: "GPT-4o Mini",
      origin: "OpenAI",
      desc: "Быстрая и дешёвая модель для повседневных задач и первых шагов с ИИ",
    },
    {
      name: "DeepSeek-V3",
      origin: "DeepSeek",
      desc: "Сбалансированный универсал: код, тексты, переводы, общие вопросы",
    },
  ];

  const capabilities = [
    {
      icon: "📝",
      title: "Тексты и статьи",
      text: "Напишите пост, статью, email или резюме. Нейросеть адаптирует стиль под вашу аудиторию.",
    },
    {
      icon: "💻",
      title: "Код и разработка",
      text: "Объясните задачу на русском — получите рабочий код на Python, JS, Go и других языках.",
    },
    {
      icon: "🎓",
      title: "Обучение и перевод",
      text: "Объясняйте сложные темы простыми словами. Переводите документы с сохранением смысла.",
    },
    {
      icon: "🔍",
      title: "Веб-поиск",
      text: "Нейросеть ищет в интернете прямо в чате. Факты с источниками и ссылками.",
    },
    {
      icon: "🎨",
      title: "Изображения",
      text: "Генерируйте картинки из текстового описания. Идеи для дизайна, иллюстраций, мемов.",
    },
    {
      icon: "✍️",
      title: "Редактура и перевод",
      text: "Сделайте текст короче, понятнее, грамотнее. Нейросеть предложит лучшие варианты.",
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="flex flex-col items-center justify-center px-6 pt-24 pb-20 text-center bg-white">
        <h1 className="max-w-4xl text-3xl font-semibold leading-tight tracking-tight text-ink md:text-[56px] md:leading-[1.07]">
          Нейросеть онлайн
          <br />
          <span className="text-blue-600">6 моделей. Без VPN. Без регистрации.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink/80">
          GPT-4o, DeepSeek, Claude, Gemini — все доступны прямо сейчас, прямо в браузере.
          Не нужен VPN, иностранная карта или номер другой страны.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <TrackedPricingCTA
            href="/chat"
            location="neiroset_online_hero_primary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "14px 28px",
              borderRadius: "9999px",
              background: "#0066cc",
              color: "#fff",
              fontSize: "18px",
              fontWeight: 300,
              textDecoration: "none",
            }}
          >
            Начать бесплатно
          </TrackedPricingCTA>
          <TrackedPricingCTA
            href="/pricing"
            location="neiroset_online_hero_secondary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "14px 28px",
              borderRadius: "9999px",
              background: "#fff",
              color: "#0066cc",
              fontSize: "18px",
              fontWeight: 300,
              textDecoration: "none",
              border: "1px solid #0066cc",
            }}
          >
            Тарифы — от 249 ₽/мес
          </TrackedPricingCTA>
        </div>
        <p className="mt-4 text-sm text-ink/48">
          Без VPN · Без регистрации · Оплата картой РФ
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-ink/60">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#0066cc] text-white text-[10px]">✓</span>
            10 000+ пользователей
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#0066cc] text-white text-[10px]">✓</span>
            6 нейросетей в одном окне
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#0066cc] text-white text-[10px]">✓</span>
            Работает без VPN
          </span>
        </div>
      </section>

      {/* ── CAPABILITIES ─────────────────────────────────── */}
      <section className="bg-[#f5f5f7] py-20 px-6">
        <div className="mx-auto max-w-[980px]">
          <h2 className="text-center text-[28px] font-semibold leading-snug tracking-tight text-ink md:text-[40px]">
            Что умеет нейросеть онлайн
          </h2>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {capabilities.map((c, i) => (
              <div key={i} className="rounded-2xl bg-white p-8 shadow-sm">
                <div className="text-3xl mb-4">{c.icon}</div>
                <h3 className="text-lg font-semibold text-ink">{c.title}</h3>
                <p className="mt-2 text-[17px] leading-relaxed text-ink/72">
                  {c.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MODELS ───────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="mx-auto max-w-[980px]">
          <h2 className="text-center text-[28px] font-semibold leading-snug tracking-tight text-ink md:text-[40px]">
            Доступные модели
          </h2>
          <p className="mt-4 text-center text-[17px] text-ink/72">
            Выбирайте лучшую модель под задачу — или сравнивайте в одном окне
          </p>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {models.map((m, i) => (
              <div key={i} className="rounded-2xl bg-[#f5f5f7] p-8">
                <h3 className="text-lg font-semibold text-ink">{m.name}</h3>
                <p className="mt-1 text-sm font-medium text-ink/48">{m.origin}</p>
                <p className="mt-3 text-[15px] leading-relaxed text-ink/72">
                  {m.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES (dark) ──────────────────────────────── */}
      <section className="bg-[#272729] py-20 px-6">
        <div className="mx-auto max-w-[980px]">
          <h2 className="text-center text-[28px] font-semibold leading-snug tracking-tight text-white md:text-[40px]">
            Русский сервис с мировыми моделями
          </h2>
          <div className="mt-14 grid gap-8 md:grid-cols-2">
            {[
              "6 нейросетей в одном окне — переключайтесь между моделями",
              "Без VPN и блокировок — работает из России напрямую",
              "Без регистрации — начинайте сразу",
              "Оплата картами РФ, ЮMoney, СБП",
              "Русский контекст — ИИ понимает местную специфику",
              "Веб-поиск с источниками и генерация изображений",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0066cc] text-white text-xs">
                  ✓
                </span>
                <p className="text-[17px] text-white/90 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section className="bg-[#f5f5f7] py-20 px-6">
        <div className="mx-auto max-w-[980px]">
          <h2 className="text-center text-[28px] font-semibold leading-snug tracking-tight text-ink md:text-[40px]">
            Как это работает
          </h2>
          <div className="mt-14 grid gap-8 md:grid-cols-4">
            {[
              { num: "1", title: "Откройте сайт", text: "Никакого VPN и регистрации" },
              { num: "2", title: "Выберите модель", text: "GPT-4o, DeepSeek, Claude — любая" },
              { num: "3", title: "Задайте вопрос", text: "Пишите на русском" },
              { num: "4", title: "Получите ответ", text: "Мгновенно и точно" },
            ].map((s) => (
              <div key={s.num} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#0066cc] text-white text-lg font-semibold">
                  {s.num}
                </div>
                <h3 className="text-lg font-semibold text-ink">{s.title}</h3>
                <p className="mt-2 text-[15px] text-ink/60">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="mx-auto max-w-[768px]">
          <h2 className="text-center text-[28px] font-semibold leading-snug tracking-tight text-ink md:text-[40px] mb-14">
            Вопросы и ответы
          </h2>
          <div className="space-y-8">
            {[
              {
                q: "Что такое нейросеть онлайн?",
                a: "Это доступ к AI-модели через браузер — без установки программ, VPN и регистрации. ИИСеть объединяет 6 передовых нейросетей в одном интерфейсе, который работает прямо из России.",
              },
              {
                q: "Какие модели доступны?",
                a: "GPT-4o, GPT-4o Mini, DeepSeek-V3, DeepSeek-R1, Claude 3.5 Sonnet, Gemini 1.5 Pro. Выбирайте модель по задаче — одна хороша в коде (DeepSeek), другая — в длинных текстах (Claude).",
              },
              {
                q: "Нужна ли регистрация?",
                a: "Нет. Начните работу сразу. Регистрация нужна только для сохранения истории и доступа к премиум-функциям, но базовое использование работает без неё.",
              },
              {
                q: "Это бесплатно?",
                a: "Да, первые сообщения бесплатны. Для неограниченного использования — Premium 249 ₽/месяц. Оплата картами РФ, ЮMoney, СБП.",
              },
              {
                q: "В чём отличие от ChatGPT?",
                a: "ChatGPT требует VPN из России и не принимает российские карты. ИИСеть работает напрямую, без VPN, и даёт доступ не к одной модели, а к 6 нейросетям сразу.",
              },
              {
                q: "Подходит ли для работы?",
                a: "Да — написание текстов (статьи, email, резюме), проверка кода, переводы, исследования с веб-поиском, генерация изображений. Все задачи в одном окне.",
              },
            ].map((faq, i) => (
              <div key={i}>
                <h3 className="text-lg font-semibold text-ink">{faq.q}</h3>
                <p className="mt-2 text-[17px] text-ink/72 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ───────────────────────────────────── */}
      <section className="py-20 px-6 bg-[#f5f5f7] text-center">
        <h2 className="text-[28px] font-semibold leading-snug tracking-tight text-ink md:text-[40px]">
          Попробуйте нейросеть онлайн
        </h2>
        <p className="mt-4 text-[17px] text-ink/72 max-w-2xl mx-auto">
          GPT-4o, DeepSeek, Claude, Gemini — все модели в одном окне. Без VPN. Без регистрации.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row justify-center">
          <TrackedPricingCTA
            href="/chat"
            location="neiroset_online_bottom_primary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "14px 28px",
              borderRadius: "9999px",
              background: "#0066cc",
              color: "#fff",
              fontSize: "18px",
              fontWeight: 300,
              textDecoration: "none",
            }}
          >
            Начать бесплатно
          </TrackedPricingCTA>
          <TrackedPricingCTA
            href="/pricing"
            location="neiroset_online_bottom_secondary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "14px 28px",
              borderRadius: "9999px",
              background: "#fff",
              color: "#0066cc",
              fontSize: "18px",
              fontWeight: 300,
              textDecoration: "none",
              border: "1px solid #0066cc",
            }}
          >
            Тарифы — от 249 ₽/мес
          </TrackedPricingCTA>
        </div>
        <p className="mt-4 text-sm text-ink/48">
          Без VPN · Без регистрации · Оплата картой РФ
        </p>
      </section>

      {/* ── FOOTER CROSS-LINKS ───────────────────────────── */}
      <section className="bg-white py-12 px-6 border-t border-[#e0e0e0]">
        <div className="mx-auto max-w-[980px] flex flex-wrap gap-4 justify-center text-[14px] text-ink/60">
          <span>Ещё:</span>
          <Link href="/chatgpt-bez-vpn" className="text-[#0066cc] hover:underline">
            ChatGPT без VPN
          </Link>
          <Link href="/iiset-vs-chatgpt" className="text-[#0066cc] hover:underline">
            ИИСеть vs ChatGPT
          </Link>
          <Link href="/iiset-vs-deepseek" className="text-[#0066cc] hover:underline">
            ИИСеть vs DeepSeek
          </Link>
          <Link href="/iiset-vs-yandexgpt" className="text-[#0066cc] hover:underline">
            ИИСеть vs ЯндексGPT
          </Link>
          <Link href="/iiset-vs-gigachat" className="text-[#0066cc] hover:underline">
            ИИСеть vs GigaChat
          </Link>
        </div>
      </section>
    </main>
  );
}
