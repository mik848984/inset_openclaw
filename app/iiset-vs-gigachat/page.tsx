import Link from "next/link";
import { TrackedPricingCTA } from "@/components/TrackedPricingCTA";

export const metadata = {
  title: "ИИСеть vs GigaChat — честное сравнение российских нейросетей 2025",
  description:
    "Объективное сравнение ИИСеть и GigaChat: цена, модели, функции, генерация изображений и шаблоны. Какой ИИ выбрать в России в 2025 году.",
  keywords: [
    "ИИСеть vs GigaChat",
    "GigaChat аналог",
    "аналог GigaChat",
    "сравнение нейросетей Россия",
    "нейросеть на русском цена",
    "GigaChat vs ИИСеть",
    "ИИ для работы в России",
    "гигачат сравнение",
  ],
  alternates: {
    canonical: "https://iiset.io/iiset-vs-gigachat",
  },
  openGraph: {
    title: "ИИСеть vs GigaChat — честное сравнение российских нейросетей 2025",
    description:
      "Объективное сравнение цены, моделей и функций: ИИСеть за 249 ₽/мес vs GigaChat Max.",
    url: "https://iiset.io/iiset-vs-gigachat",
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
          name: "Чем ИИСеть отличается от GigaChat?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "ИИСеть доступна без VPN и регистрации, включает международные модели (GPT-4o, Claude, Gemini, DeepSeek) и предлагает больше функций: генерацию изображений, веб-поиск и работу с документами — всё за 249 ₽/мес. GigaChat силён в русском бюрократическом стиле и интегрирован в экосистему Сбера.",
          },
        },
        {
          "@type": "Question",
          name: "Сколько стоит ИИСеть по сравнению с GigaChat?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Premium-подписка ИИСеть стоит 249 ₽/месяц — и включает чат, веб-поиск, генерацию изображений и работу с документами. GigaChat Max — платная подписка, цена зависит от региона и тарифа.",
          },
        },
        {
          "@type": "Question",
          name: "Есть ли в ИИСеть русские модели?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "В ИИСеть доступны модели, которые отлично работают с русским языком: GPT-4o, Claude, Gemini и DeepSeek-V3 адаптированы для русскоязычных пользователей. Для задач, где критичен максимально нативный русский контекст, GigaChat по-прежнему силён.",
          },
        },
        {
          "@type": "Question",
          name: "Что лучше: ИИСеть или GigaChat?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Для комплексных задач — тексты, изображения, документы, поиск — лучше ИИСеть: больше моделей, больше функций, доступ без VPN. Для пользователей, глубоко интегрированных в экосистему Сбер (бизнес, документы, СберБизнес), GigaChat удобнее. GigaChat силён в формальных деловых текстах; ИИСеть — в универсальных профессиональных сценариях.",
          },
        },
        {
          "@type": "Question",
          name: "Можно ли использовать ИИСеть без VPN?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Да. ИИСеть размещена на российской инфраструктуре и доступна без VPN из любой точки России. В отличие от ChatGPT, который требует VPN.",
          },
        },
        {
          "@type": "Question",
          name: "Какие модели есть в ИИСеть?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "ИИСеть включает GPT-4o, Claude, Gemini, DeepSeek-V3, DeepSeek-R1, DeepSeek-V4, Mistral, Qwen, Llama и другие модели — всё в одной подписке за 249 ₽/мес.",
          },
        },
      ],
    },
    {
      "@type": "WebPage",
      "@id": "https://iiset.io/iiset-vs-gigachat",
      url: "https://iiset.io/iiset-vs-gigachat",
      name: "ИИСеть vs GigaChat — честное сравнение российских нейросетей 2025",
      description: "Объективное сравнение ИИ-платформ для России.",
      inLanguage: "ru-RU",
    },
  ],
};

// ── Apple-style design tokens (match /pricing page) ─────────────────
const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: "28px",
  padding: "28px 32px",
  boxShadow: "0 1px 2px rgba(0,0,0,0.03), 0 8px 32px rgba(31,38,70,0.05)",
  border: "1px solid #ECECF4",
};

const secondaryButton: React.CSSProperties = {
  display: "inline-block",
  background: "#F7F7FB",
  color: "#1d1d1f",
  padding: "12px 24px",
  borderRadius: "9999px",
  fontWeight: 600,
  fontSize: "15px",
  textDecoration: "none",
};

const primaryButton: React.CSSProperties = {
  display: "inline-block",
  background: "linear-gradient(135deg, rgba(109,93,246,0.92), rgba(77,140,255,0.92))",
  color: "#ffffff",
  padding: "13px 28px",
  borderRadius: "9999px",
  fontWeight: 700,
  fontSize: "16px",
  textDecoration: "none",
};

const checkCell = "✅";
const warnCell = "⚠️";
const crossCell = "❌";

export default function ComparisonPage() {
  return (
    <main style={{ background: "#ffffff", color: "#0a0a0c", fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px", paddingBottom: 60 }}>
        {/* ── Hero ───────────────────────────────────────────── */}
        <section style={{ textAlign: "center", padding: "64px 0 48px" }}>
          <p style={{ color: "#6D5DF6", fontWeight: 800, margin: "0 0 10px", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.12em" }}>
            Сравнение 2025
          </p>
          <h1 style={{ fontSize: "clamp(34px, 5vw, 62px)", fontWeight: 700, margin: "0 0 18px", lineHeight: 1.05, letterSpacing: "-0.02em" }}>
            ИИСеть vs GigaChat
          </h1>
          <p style={{ color: "#596174", fontSize: 19, lineHeight: 1.55, maxWidth: 680, margin: "0 auto 32px" }}>
            Два российских ИИ-инструмента — один от Сбера, другой независимый.
            Честное сравнение: зачем платить за экосистему, когда можно получить
            десять моделей, изображения и поиск за 249 ₽?
          </p>
          <TrackedPricingCTA
            href="/chat"
            style={primaryButton}
            location="gigachat_comparison_hero"
            plan="free"
          >
            Попробовать ИИСеть бесплатно
          </TrackedPricingCTA>
        </section>

        {/* ── At-a-glance table ──────────────────────────────── */}
        <section style={{ ...cardStyle, marginBottom: 34, overflowX: "auto" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "16px 12px", color: "#697186", fontSize: 13, fontWeight: 600, borderBottom: "2px solid #ECECF4" }}>
                    Что сравниваем
                  </th>
                  <th style={{ textAlign: "left", padding: "16px 12px", color: "#6D5DF6", fontSize: 15, fontWeight: 800, borderBottom: "2px solid #ECECF4" }}>
                    ИИСеть
                  </th>
                  <th style={{ textAlign: "left", padding: "16px 12px", color: "#697186", fontSize: 15, fontWeight: 600, borderBottom: "2px solid #ECECF4" }}>
                    GigaChat (Sber)
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Доступ без VPN", checkCell, checkCell],
                  ["Работает из России", checkCell, checkCell],
                  ["Модели GPT-4o / Claude / Gemini / DeepSeek", checkCell, crossCell],
                  ["Русский язык + локальный контекст", checkCell, checkCell],
                  ["Веб-поиск с источниками", checkCell, warnCell],
                  ["Генерация изображений", checkCell, crossCell],
                  ["Работа с PDF / DOCX", checkCell, checkCell],
                  ["Готовые шаблоны", checkCell, checkCell],
                  ["Оплата картой РФ", checkCell, checkCell],
                  ["Цена Premium", "249 ₽/мес", "Платная подписка"],
                  ["Всё в одном тарифе", checkCell, crossCell],
                ].map(([feature, iiset, gigachat], idx) => (
                  <tr key={feature} style={{ borderTop: idx === 0 ? "none" : "1px solid #ECECF4", background: feature === "Цена Premium" ? "linear-gradient(180deg, rgba(109,93,246,0.04), transparent)" : undefined }}>
                    <td style={{ padding: "15px 12px", fontWeight: 700 }}>{feature}</td>
                    <td style={{ padding: "15px 12px", fontWeight: 700, color: "#0a0a0c" }}>{iiset}</td>
                    <td style={{ padding: "15px 12px", color: "#596174" }}>{gigachat}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Deep sections ──────────────────────────────────── */}
        <section style={{ ...cardStyle, marginBottom: 34 }}>
          <p style={{ color: "#6D5DF6", fontWeight: 800, marginTop: 0, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.12em" }}>
            Цена
          </p>
          <h2 style={{ margin: "0 0 16px", fontSize: "clamp(26px, 3.6vw, 40px)", fontWeight: 700, lineHeight: 1.1 }}>
            Почему ИИСеть стоит меньше и даёт больше
          </h2>
          <p style={{ color: "#4E5568", fontSize: 18, lineHeight: 1.65, maxWidth: 760 }}>
            GigaChat предлагает бесплатный тариф с ограничениями и платную подписку GigaChat Max.
            Цена зависит от региона и выбранного тарифа. За те же деньги ИИСеть даёт
            доступ к GPT-4o, Claude, Gemini, DeepSeek и другим моделям — всё в одной подписке.
          </p>
          <p style={{ color: "#4E5568", fontSize: 18, lineHeight: 1.65, maxWidth: 760, marginTop: 16 }}>
            ИИСеть Premium — 249 ₽/мес. Включает чат, веб-поиск, генерацию изображений
            и работу с документами. Без VPN, с оплатой картой РФ.
          </p>
          <ul style={{ lineHeight: 1.95, paddingLeft: 20, color: "#4E5568", maxWidth: 760 }}>
            <li>ИИСеть: 249 ₽/мес — GPT-4o, Claude, Gemini, DeepSeek, веб-поиск, изображения, документы</li>
            <li>GigaChat: бесплатный тариф с ограничениями + платная подписка Max за отдельную цену</li>
          </ul>
        </section>

        <section style={{ ...cardStyle, marginBottom: 34 }}>
          <p style={{ color: "#6D5DF6", fontWeight: 800, marginTop: 0, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.12em" }}>
            Модели
          </p>
          <h2 style={{ margin: "0 0 16px", fontSize: "clamp(26px, 3.6vw, 40px)", fontWeight: 700, lineHeight: 1.1 }}>
            Один русский — или десять мировых
          </h2>
          <p style={{ color: "#4E5568", fontSize: 18, lineHeight: 1.65, maxWidth: 760 }}>
            GigaChat использует собственные модели Сбера — хорошо оптимизированные
            для русского языка, но ограниченные по глобальному контексту и возможностям.
            ИИСеть даёт доступ к GPT-4o, Claude, Gemini, DeepSeek-V3, DeepSeek-R1,
            Mistral, Qwen, Llama — и позволяет переключаться между ними в одном диалоге.
          </p>
          <ul style={{ lineHeight: 1.95, paddingLeft: 20, color: "#4E5568", maxWidth: 760 }}>
            <li><strong>GPT-4o</strong> — универсальная модель для текста, анализа и переводов</li>
            <li><strong>Claude</strong> — отличен для архитектуры и длинных документов</li>
            <li><strong>DeepSeek-R1</strong> — лидер в математике, программировании и логике</li>
            <li><strong>Gemini</strong> — хорош для больших контекстов</li>
            <li>+ Mistral, Qwen, Llama — всё в одной подписке за 249 ₽/мес</li>
          </ul>
        </section>

        <section style={{ ...cardStyle, marginBottom: 34 }}>
          <p style={{ color: "#6D5DF6", fontWeight: 800, marginTop: 0, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.12em" }}>
            Генерация изображений
          </p>
          <h2 style={{ margin: "0 0 16px", fontSize: "clamp(26px, 3.6vw, 40px)", fontWeight: 700, lineHeight: 1.1 }}>
            Текст + картинка в одном окне
          </h2>
          <p style={{ color: "#4E5568", fontSize: 18, lineHeight: 1.65, maxWidth: 760 }}>
            ИИСеть включает генерацию изображений на базе Stable Diffusion Turbo
            прямо в чате. Запросили текст — попросили картинку — получили результат,
            не переключаясь между сервисами. GigaChat не предлагает генерацию изображений
            в рамках основного чата.
          </p>
          <ul style={{ lineHeight: 1.95, paddingLeft: 20, color: "#4E5568", maxWidth: 760 }}>
            <li>ИИСеть: генерация изображений + чат + поиск + документы в одном окне</li>
            <li>GigaChat: генерация изображений не доступна в основном интерфейсе</li>
          </ul>
        </section>

        <section style={{ ...cardStyle, marginBottom: 34 }}>
          <p style={{ color: "#6D5DF6", fontWeight: 800, marginTop: 0, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.12em" }}>
            Шаблоны
          </p>
          <h2 style={{ margin: "0 0 16px", fontSize: "clamp(26px, 3.6vw, 40px)", fontWeight: 700, lineHeight: 1.1 }}>
            Готовые сценарии для бизнеса и творчества
          </h2>
          <p style={{ color: "#4E5568", fontSize: 18, lineHeight: 1.65, maxWidth: 760 }}>
            GigaChat славится шаблонами для деловых писем, анализа документов
            и российского бюрократического стиля. ИИСеть тоже предлагает готовые
            агенты и шаблоны: генерация описаний товаров, SEO-ключевых слов,
            упрощение текста, создание резюме, написание постов и многое другое.
          </p>
          <ul style={{ lineHeight: 1.95, paddingLeft: 20, color: "#4E5568", maxWidth: 760 }}>
            <li>GigaChat: шаблоны деловых писем, анализ документов, русский бюрократический стиль</li>
            <li>ИИСеть: 30+ готовых инструментов для маркетинга, текста, SEO, переводов и генерации картинок</li>
          </ul>
        </section>

        <section style={{ ...cardStyle, marginBottom: 34 }}>
          <p style={{ color: "#6D5DF6", fontWeight: 800, marginTop: 0, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.12em" }}>
            Доступ и экосистема
          </p>
          <h2 style={{ margin: "0 0 16px", fontSize: "clamp(26px, 3.6vw, 40px)", fontWeight: 700, lineHeight: 1.1 }}>
            Экосистема Сбера — или свобода без привязки
          </h2>
          <p style={{ color: "#4E5568", fontSize: 18, lineHeight: 1.65, maxWidth: 760 }}>
            GigaChat интегрирован с сервисами Сбера: СберБизнес, документы,
            корпоративные инструменты. Это удобно, если вы уже внутри экосистемы.
            ИИСеть — независимая платформа. Работает без регистрации,
            не привязана к банку или экосистеме, доступна без VPN.
          </p>
          <ul style={{ lineHeight: 1.95, paddingLeft: 20, color: "#4E5568", maxWidth: 760 }}>
            <li>ИИСеть: доступ без регистрации, независимая платформа, международные модели</li>
            <li>GigaChat: интеграция с Сбер, требует авторизации, ориентирован на корпоративный сегмент</li>
          </ul>
        </section>

        {/* ── Who it's for ───────────────────────────────────── */}
        <section style={{ ...cardStyle, marginBottom: 34 }}>
          <h2 style={{ margin: "0 0 16px", fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 700, lineHeight: 1.1 }}>
            Кому что выбрать
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, marginTop: 18 }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: 17, margin: "0 0 8px" }}>
                GigaChat
              </p>
              <p style={{ color: "#596174", lineHeight: 1.6, margin: 0 }}>
                Лучший выбор для пользователей, глубоко интегрированных в экосистему Сбер:
                СберБизнес, корпоративные документы, деловые письма.
                Для формальных бюрократических текстов и анализа документов.
                Для тех, кто ценит нативную русскую модель над международными альтернативами.
              </p>
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 17, margin: "0 0 8px", color: "#6D5DF6" }}>
                ИИСеть
              </p>
              <p style={{ color: "#596174", lineHeight: 1.6, margin: 0 }}>
                Комплексное решение для работы, учёбы и коммерческих задач.
                GPT-4o, Claude, Gemini, DeepSearch, веб-поиск, изображения, документы —
                всё в одном окне за 249 ₽/мес. Без VPN, с оплатой картой РФ.
              </p>
            </div>
          </div>
        </section>

        {/* ── Trust ───────────────────────────────────────────── */}
        <section
          style={{
            ...cardStyle,
            marginBottom: 34,
            background: "linear-gradient(135deg, rgba(109, 93, 246, 0.10), rgba(77, 140, 255, 0.08))",
          }}
        >
          <p style={{ color: "#6D5DF6", fontWeight: 800, marginTop: 0, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.12em" }}>
            Доверие
          </p>
          <h2 style={{ marginTop: 0, fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 700, lineHeight: 1.1 }}>
            ИИСеть уже используют тысячи пользователей
          </h2>
          <p style={{ color: "#4E5568", fontSize: 18, lineHeight: 1.65, maxWidth: 760 }}>
            Платформа работает на российской инфраструктуре, принимает оплату картами РФ и
            закрывает полный цикл задач: текст → поиск → изображение → документ → шаблон.
            GPT-4o и Claude — всё в одной подписке за 249 ₽/мес.
          </p>
        </section>

        {/* ── CTA ─────────────────────────────────────────────── */}
        <section style={{ ...cardStyle, marginBottom: 34, textAlign: "center" }}>
          <h2 style={{ margin: "0 0 12px", fontSize: "clamp(26px, 3.6vw, 38px)", fontWeight: 700, lineHeight: 1.1 }}>
            Попробовать ИИСеть бесплатно
          </h2>
          <p style={{ color: "#4E5568", fontSize: 18, lineHeight: 1.55, maxWidth: 560, margin: "0 auto 24px" }}>
            Бесплатный тариф — без VPN и регистрации. GPT-4o, Claude, Gemini
            и другие модели прямо сейчас. Перейти на Premium можно за 249 ₽/мес.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <TrackedPricingCTA
              href="/chat"
              style={primaryButton}
              location="gigachat_comparison_bottom_cta"
              plan="free"
            >
              Открыть ИИСеть →
            </TrackedPricingCTA>
            <Link href="/pricing" style={secondaryButton}>
              Сравнить тарифы
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
