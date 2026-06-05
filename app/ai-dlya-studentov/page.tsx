import Link from "next/link";
import { TrackedPricingCTA } from "@/components/TrackedPricingCTA";

export const metadata = {
  title: "Нейросеть для студентов — пишет рефераты, переводит, упрощает, проверяет на плагиат | ИИСеть",
  description:
    "Экономьте время на учёбе. Нейросеть пишет эссе, рефераты, переводит тексты, упрощает сложные материалы, проверяет на плагиат и помогает с задачами. Без VPN, на русском.",
  keywords: [
    "нейросеть для студентов",
    "нейросеть для учебы",
    "ai для студентов",
    "нейросеть для написания реферата",
    "нейросеть для сочинения",
    "помощник студента",
    "нейросеть для перевода",
    "проверка плагиата нейросеть",
    "нейросеть для эссе",
    "нейросеть для решения задач",
  ],
  alternates: {
    canonical: "https://iiset.io/ai-dlya-studentov",
  },
  openGraph: {
    title: "Нейросеть для студентов — пишет рефераты, переводит, упрощает, проверяет на плагиат",
    description:
      "Экономьте время на учёбе: эссе, рефераты, переводы, конспекты, плагиат, задачи. Без VPN, на русском.",
    url: "https://iiset.io/ai-dlya-studentov",
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
          name: "Как нейросеть помогает с учебой?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Нейросеть пишет рефераты, эссе и сочинения, переводит тексты на другие языки, упрощает сложные материалы, проверяет на плагиат, решает математические задачи и помогает готовиться к экзаменам. Экономит до 50% времени на рутинных учебных задачах.",
          },
        },
        {
          "@type": "Question",
          name: "Какие модели лучше всего подходят для студентов?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "GPT-4o — лучший выбор для текстов, эссе и переводов. DeepSeek-R1 — суперзвезда математики, логики и задач. Gemini — огромный контекст для анализа длинных текстов и книг. DeepSeek-V3 — сбалансированный универсал для всего остального.",
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
          name: "Можно ли проверять тексты на плагиат?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Да. В ИИСеть встроен инструмент проверки уникальности текста. Загружаете текст и получаете оценку оригинальности с рекомендациями по переработке.",
          },
        },
        {
          "@type": "Question",
          name: "Можно ли загружать учебные материалы?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Да. ИИСеть читает PDF, DOCX, TXT и другие форматы. Можно загрузить конспект лекций, методичку или учебник — и нейросеть составит краткое содержание, сделает конспект или ответит на вопросы по материалу.",
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
      "@id": "https://iiset.io/ai-dlya-studentov",
      url: "https://iiset.io/ai-dlya-studentov",
      name: "Нейросеть для студентов — пишет рефераты, переводит, упрощает, проверяет на плагиат",
      description: "Экономьте время на учёбе. Нейросеть пишет эссе, рефераты, переводит тексты, упрощает материалы. Без VPN, на русском.",
      inLanguage: "ru-RU",
    },
  ],
};

const useCases = [
  {
    title: "Напишет реферат или эссе",
    text: "Объясните тему — нейросеть составит структуру, напишет введение, основную часть и выводы. Проверьте и доработайте перед сдачей.",
  },
  {
    title: "Переведёт с любого языка",
    text: "Загружайте тексты на английском, немецком, французском или других языках — получайте качественный перевод с сохранением стиля и терминологии.",
  },
  {
    title: "Упростит сложный текст",
    text: "Вставьте абзац из учебника со сложной терминологией — нейросеть перепишет простым языком, сохранив смысл и ключевые понятия.",
  },
  {
    title: "Проверит на плагиат",
    text: "Загрузите готовый текст — инструмент оценит уникальность и подскажет, какие фрагменты стоит переработать для прохождения проверки.",
  },
  {
    title: "Поможет с задачами и экзаменами",
    text: "DeepSeek-R1 решает математические, физические и логические задачи с пошаговым объяснением. GPT-4o помогает готовиться к устным экзаменам.",
  },
  {
    title: "Сделает конспект из лекций",
    text: "Загрузите запись лекции или PDF методичку — нейросеть выделит главное, составит структурированный конспект и список ключевых понятий.",
  },
];

const models = [
  { name: "GPT-4o", bestFor: "Эссе, рефераты, переводы, общие задачи" },
  { name: "DeepSeek-R1", bestFor: "Математика, логика, задачи со сложной структурой" },
  { name: "Gemini", bestFor: "Большие контексты, конспекты книг, длинные тексты" },
];

export default function AiDlyaStudentovPage() {
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
          <span className="text-blue-600">для студентов</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink/80">
          Пишите рефераты, эссе и переводы быстрее. GPT-4o, DeepSeek-R1 и Gemini
          помогают с учёбой — в одном окне на русском.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <TrackedPricingCTA
            href="/chat"
            location="ai_student_hero_primary"
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
            location="ai_student_hero_secondary"
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
            8+ моделей для учёбы
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
            Что умеет нейросеть для учёбы
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
            Модели для учёбы
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
            Почему студенты выбирают ИИСеть
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
                Нейросеть ищет актуальные научные статьи, методички и дополнительные материалы прямо в чате.
                Показывает ссылки на источники.
              </p>
            </div>
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-ink">Работа с файлами</h3>
              <p className="mt-3 text-base leading-relaxed text-ink/80">
                Загружайте PDF-методички, DOCX-ТЗ и TXT-конспекты — нейросеть проанализирует их
                и составит краткое содержание или ответит на вопросы.
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
            <Link
              href="/iiset-vs-deepseek"
              className="inline-flex items-center gap-1.5 text-[#0066cc] hover:underline"
            >
              ИИСеть vs DeepSeek
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="bg-white py-20 px-6 border-t border-[#e8e8ed]">
        <div className="mx-auto max-w-[980px] text-center">
          <h2 className="text-[28px] font-semibold leading-snug tracking-tight text-ink md:text-[40px]">
            Начните учиться с ИИ прямо сейчас
          </h2>
          <p className="mt-4 text-lg text-ink/80">
            Бесплатный старт. Без VPN. Без регистрации.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row justify-center">
            <TrackedPricingCTA
              href="/chat"
              location="ai_student_footer_primary"
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
              location="ai_student_footer_secondary"
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
