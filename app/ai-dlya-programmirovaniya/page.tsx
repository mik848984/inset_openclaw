import Link from "next/link";
import { TrackedPricingCTA } from "@/components/TrackedPricingCTA";

export const metadata = {
  title: "Нейросеть для программирования — пишет код, объясняет, исправляет баги | ИИСеть",
  description:
    "Пишите код быстре с ИИ. Нейросеть помогает с Python, JavaScript, Go, SQL, версткой, дебагом и ревью. Без VPN, на русском, с веб-поиском и документами.",
  keywords: [
    "нейросеть для программирования",
    "нейросеть пишет код",
    "ai для кода",
    "chatgpt для программистов",
    "нейросеть для python",
    "нейросеть для javascript",
    "помощник программиста",
    "ai код ревью",
    "debug нейросеть",
    "нейросеть объясняет код",
  ],
  alternates: {
    canonical: "https://iiset.io/ai-dlya-programmirovaniya",
  },
  openGraph: {
    title: "Нейросеть для программирования — пишет код, объясняет, исправляет баги",
    description:
      "Пишите код быстрее с ИИ: Python, JavaScript, Go, SQL, дебаг, ревью, документация. Без VPN, на русском.",
    url: "https://iiset.io/ai-dlya-programmirovaniya",
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
          name: "Как нейросеть помогает с программированием?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Нейросеть пишет код по описанию, объясняет чужой код, находит баги, предлагает оптимизации, генерирует тесты, переводит между языками программирования и помогает с документацией. Экономит до 40% времени разработки.",
          },
        },
        {
          "@type": "Question",
          name: "Какие языки поддерживаются?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Python, JavaScript / TypeScript, Go, Rust, Java, C/C++, C#, PHP, Ruby, Kotlin, Swift, SQL, HTML/CSS и другие. Нейросеть понимает контекст проекта и пишет под конкретный стек.",
          },
        },
        {
          "@type": "Question",
          name: "Нужен ли VPN?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Нет. ИИСеть работает из России без VPN. Доступ к ведущим ИИ-моделям стабилен 24/7.",
          },
        },
        {
          "@type": "Question",
          name: "Какие модели лучше всего подходят для кода?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "DeepSeek-R1 отлично справляется с математикой, алгоритмами и сложной логикой. GPT-4o — лучший выбор для общих задач и быстрого прототипирования. Gemini хорош для работы с большими файлами и контекстом. В ИИСеть доступны все эти модели в одном окне.",
          },
        },
        {
          "@type": "Question",
          name: "Можно ли загружать код из файлов?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Да. ИИСеть читает PDF, DOCX, TXT и другие форматы. Можно загрузить спецификацию, документацию или логи — и нейросеть проанализирует их в контексте вашего запроса.",
          },
        },
        {
          "@type": "Question",
          name: "Сколько стоит?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Базовое использование бесплатно. Premium — 249 ₽/месяц за безлимитный доступ ко всем моделям, веб-поиск и генерацию изображений. Оплата картами РФ.",
          },
        },
      ],
    },
    {
      "@type": "WebPage",
      "@id": "https://iiset.io/ai-dlya-programmirovaniya",
      url: "https://iiset.io/ai-dlya-programmirovaniya",
      name: "Нейросеть для программирования — пишет код, объясняет, исправляет баги",
      description: "Пишите код быстрее с ИИ. Python, JavaScript, Go, SQL, дебаг, ревью, документация. Без VPN, на русском.",
      inLanguage: "ru-RU",
    },
  ],
};

const useCases = [
  {
    title: "Напишет код по описанию",
    text: "Объясните задачу простым языком — нейросеть сгенерирует готовый код на Python, JavaScript, Go или другом языке",
  },
  {
    title: "Найдёт и исправит баги",
    text: "Вставьте код с ошибкой — нейросеть найдёт причину, объяснит проблему и предложит исправленную версию",
  },
  {
    title: "Объяснит чужой код",
    text: "Вставьте непонятный фрагмент — получите разбор логики, паттернов и потенциальных проблем",
  },
  {
    title: "Сгенерирует тесты",
    text: "Попросите написать unit-тесты, API-тесты или интеграционные тесты для вашего кода",
  },
  {
    title: "Поможет с ревью",
    text: "Нейросеть проанализирует код на читаемость, производительность, безопасность и соответствие best practices",
  },
  {
    title: "Переведёт между языками",
    text: "Конвертирует код с одного языка на другой: Python → Go, JavaScript → TypeScript, PHP → Python и т.д.",
  },
];

const models = [
  { name: "DeepSeek-R1", bestFor: "Алгоритмы, математика, сложная логика" },
  { name: "GPT-4o", bestFor: "Быстрое прототипирование, общие задачи" },
  { name: "Gemini", bestFor: "Большие файлы, документация, контекст" },
];

export default function AiDlyaProgrammirovaniyaPage() {
  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="flex flex-col items-center justify-center px-6 pt-24 pb-20 text-center bg-white">
        <h1 className="max-w-4xl text-3xl font-semibold leading-tight tracking-tight text-ink md:text-[56px] md:leading-[1.07]">
          Нейросеть
          <br />
          <span className="text-blue-600">для программирования</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink/80">
          Пишите код быстрее. DeepSeek-R1, GPT-4o и Gemini помогают с Python,
          JavaScript, Go, SQL, версткой и дебагом — в одном окне на русском.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <TrackedPricingCTA
            href="/chat"
            location="ai_programming_hero_primary"
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
            location="ai_programming_hero_secondary"
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
            8+ моделей для кода
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#0066cc] text-white text-[10px]">✓</span>
            Работает без VPN
          </span>
        </div>
      </section>

      {/* ── USE CASES ──────────────────────────────────── */}
      <section className="bg-[#f5f5f7] py-20 px-6">
        <div className="mx-auto max-w-[980px]">
          <h2 className="text-center text-[28px] font-semibold leading-snug tracking-tight text-ink md:text-[40px]">
            Что умеет нейросеть для кода
          </h2>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {useCases.map((u, i) => (
              <div key={i} className="rounded-2xl bg-white p-8 shadow-sm">
                <h3 className="text-xl font-semibold text-ink">
                  {u.title}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-ink/80">
                  {u.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MODELS ───────────────────────────────────────── */}
      <section className="bg-white py-20 px-6">
        <div className="mx-auto max-w-[980px] text-center">
          <h2 className="text-[28px] font-semibold leading-snug tracking-tight text-ink md:text-[40px]">
            Модели для разработчиков
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-ink/80">
            Переключайтесь между моделями в зависимости от задачи — в одном окне
          </p>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {models.map((m, i) => (
              <div
                key={i}
                className="rounded-2xl border border-[#e8e8ed] bg-[#fafafc] p-8"
              >
                <h3 className="text-xl font-semibold text-[#0066cc]">
                  {m.name}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-ink/80">
                  {m.bestFor}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY IISET ────────────────────────────────────── */}
      <section className="bg-[#f5f5f7] py-20 px-6">
        <div className="mx-auto max-w-[980px]">
          <h2 className="text-center text-[28px] font-semibold leading-snug tracking-tight text-ink md:text-[40px]">
            Почему разработчики выбирают ИИСеть
          </h2>
          <div className="mt-14 grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-ink">Без VPN из России</h3>
              <p className="mt-3 text-base leading-relaxed text-ink/80">
                Стабильный доступ к GPT-4o, DeepSeek и Gemini без VPN, прокси и иностранных карт.
                Работает из любой точки России.
              </p>
            </div>
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-ink">Веб-поиск с источниками</h3>
              <p className="mt-3 text-base leading-relaxed text-ink/80">
                Нейросеть ищет актуальную документацию, библиотеки и ошибки в интернете прямо в чате.
                Показывает ссылки на источники.
              </p>
            </div>
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-ink">Работа с файлами</h3>
              <p className="mt-3 text-base leading-relaxed text-ink/80">
                Загружайте логи, документацию, спецификации — нейросеть проанализирует их в контексте
                вашего проекта и даст конкретные рекомендации.
              </p>
            </div>
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-ink">Один интерфейс — много моделей</h3>
              <p className="mt-3 text-base leading-relaxed text-ink/80">
                Не нужно регистрироваться в OpenAI, DeepSeek и Google по отдельности.
                Все модели доступны в одном окне с историей диалогов.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMPARISON LINKS ─────────────────────────────── */}
      <section className="bg-white py-16 px-6 border-t border-[#e8e8ed]">
        <div className="mx-auto max-w-[980px] text-center">
          <p className="text-sm text-ink/48 uppercase tracking-wider mb-6">
            Сравнения
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/iiset-vs-deepseek"
              className="inline-flex items-center gap-1.5 text-[#0066cc] hover:underline"
            >
              ИИСеть vs DeepSeek
            </Link>
            <Link
              href="/iiset-vs-chatgpt"
              className="inline-flex items-center gap-1.5 text-[#0066cc] hover:underline"
            >
              ИИСеть vs ChatGPT
            </Link>
            <Link
              href="/iiset-vs-yandexgpt"
              className="inline-flex items-center gap-1.5 text-[#0066cc] hover:underline"
            >
              ИИСеть vs ЯндексGPT
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="bg-white py-20 px-6 border-t border-[#e8e8ed]">
        <div className="mx-auto max-w-[980px] text-center">
          <h2 className="text-[28px] font-semibold leading-snug tracking-tight text-ink md:text-[40px]">
            Начните писать код с ИИ прямо сейчас
          </h2>
          <p className="mt-4 text-lg text-ink/80">
            Бесплатный старт. Без VPN. Без регистрации.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row justify-center">
            <TrackedPricingCTA
              href="/chat"
              location="ai_programming_footer_primary"
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
              Открыть чат
            </TrackedPricingCTA>
            <TrackedPricingCTA
              href="/pricing"
              location="ai_programming_footer_secondary"
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
        </div>
      </section>
    </main>
  );
}
