import Link from "next/link";
import { TrackedPricingCTA } from "@/components/TrackedPricingCTA";

export const metadata = {
  title: "ИИСеть vs ЯндексGPT — честное сравнение российских нейросетей 2025",
  description:
    "Объективное сравнение ИИСеть и ЯндексGPT: цена, модели, функции, генерация изображений и документы. Какой ИИ выбрать в России в 2025 году.",
  keywords: [
    "ИИСеть vs ЯндексGPT",
    "ЯндексGPT аналог",
    "аналог ЯндексGPT дешевле",
    "сравнение нейросетей Россия",
    "нейросеть на русском цена",
    "ЯндексGPT vs ИИСеть",
    "ИИ для работы в России",
  ],
  alternates: {
    canonical: "https://iiset.io/iiset-vs-yandexgpt",
  },
  openGraph: {
    title: "ИИСеть vs ЯндексGPT — честное сравнение российских нейросетей 2025",
    description:
      "Объективное сравнение цены, моделей и функций: ИИСеть за 249 ₽/мес vs ЯндексGPT Plus за ~590 ₽/мес. Выбираем лучший ИИ для России.",
    url: "https://iiset.io/iiset-vs-yandexgpt",
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
          name: "Чем ИИСеть отличается от ЯндексGPT?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "ИИСеть стоит в 2 раза дешевле (249 ₽/мес vs ~590 ₽/мес), включает международные модели (GPT-4o, Claude, Gemini, DeepSeek) и предлагает больше функций: генерацию изображений, работу с документами и веб-поиск. ЯндексGPT силён в чисто русском контексте и интегрирован в экосистему Яндекса.",
          },
        },
        {
          "@type": "Question",
          name: "Сколько стоит ИИСеть по сравнению с ЯндексGPT?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Premium-подписка ИИСеть стоит 249 ₽/месяц — это в 2 раза дешевле ЯндексGPT Plus (~590 ₽/мес). При этом ИИСеть включает чат, веб-поиск, генерацию изображений и работу с документами в одном тарифе.",
          },
        },
        {
          "@type": "Question",
          name: "Есть ли в ИИСеть русские модели?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "В ИИСеть доступны модели, которые отлично работают с русским языком: GPT-4o, Claude, Gemini и DeepSeek-V3 адаптированы для русскоязычных пользователей. Для задач, где критичен максимально нативный русский контекст, ЯндексGPT по-прежнему силён.",
          },
        },
        {
          "@type": "Question",
          name: "Что лучше: ИИСеть или ЯндексGPT?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Для комплексных задач — тексты, изображения, документы, поиск — лучше ИИСеть: больше моделей, больше функций, ниже цена. Для пользователей, глубоко интегрированных в экосистему Яндекс (Документы, Алиса, Поиск), ЯндексGPT удобнее. ЯндексGPT силён в коротких бытовых запросах; ИИСеть — в профессиональных сценариях.",
          },
        },
        {
          "@type": "Question",
          name: "Можно ли использовать ИИСеть без VPN?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Да. ИИСеть размещена на российской инфраструктуре и доступна без VPN из любой точки России. В отличие от ChatGPT и Claude, которые требуют VPN.",
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
      "@id": "https://iiset.io/iiset-vs-yandexgpt",
      url: "https://iiset.io/iiset-vs-yandexgpt",
      name: "ИИСеть vs ЯндексGPT — честное сравнение российских нейросетей 2025",
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
            ИИСеть vs ЯндексGPT
          </h1>
          <p style={{ color: "#596174", fontSize: 19, lineHeight: 1.55, maxWidth: 680, margin: "0 auto 32px" }}>
            Два российских ИИ-инструмента — один для бытовых запросов, другой для работы.
            Честное сравнение цен, моделей и возможностей: зачем платить 590 ₽, когда можно платить 249 ₽?
          </p>
          <TrackedPricingCTA
            href="/chat"
            style={primaryButton}
            location="yandexgpt_comparison_hero"
            plan="free"
          >
            Попробовать ИИСеть бесплатно
          </TrackedPricingCTA>
        </section>

        {/* ── Related: Нейросеть онлайн ────────────────────────── */}
        <section style={{ ...cardStyle, marginBottom: 34, background: "linear-gradient(135deg, rgba(109,93,246,0.05), rgba(77,140,255,0.04))", border: "1px solid rgba(109,93,246,0.12)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", justifyContent: "space-between" }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <p style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 700 }}>
                Ищете нейросеть онлайн без VPN и регистрации?
              </p>
              <p style={{ margin: 0, color: "#596174", fontSize: 15, lineHeight: 1.55 }}>
                ИИСеть объединяет 6 моделей — GPT-4o, DeepSeek, Claude, Gemini и другие — в одном окне. Работает из России, с оплатой картой РФ. От 249 ₽/мес.
              </p>
            </div>
            <Link href="/neiroset-online" style={primaryButton}>
              Нейросеть онлайн →
            </Link>
          </div>
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
                    ЯндексGPT Plus
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Доступ без VPN", checkCell, checkCell],
                  ["Работает из России", checkCell, checkCell],
                  ["Модели GPT-4o / Claude / Gemini / DeepSeek", checkCell, crossCell],
                  ["Русский язык + локальный контекст", checkCell, checkCell],
                  ["Веб-поиск с источниками", checkCell, checkCell],
                  ["Генерация изображений", checkCell, crossCell],
                  ["Работа с PDF / DOCX", checkCell, warnCell],
                  ["Оплата картой РФ", checkCell, checkCell],
                  ["Цена за мес", "249 ₽", "~590 ₽"],
                  ["Всё в одном тарифе", checkCell, crossCell],
                ].map(([feature, iiset, yandex], idx) => (
                  <tr key={feature} style={{ borderTop: idx === 0 ? "none" : "1px solid #ECECF4", background: feature === "Цена за мес" ? "linear-gradient(180deg, rgba(109,93,246,0.04), transparent)" : undefined }}>
                    <td style={{ padding: "15px 12px", fontWeight: 700 }}>{feature}</td>
                    <td style={{ padding: "15px 12px", fontWeight: 700, color: "#0a0a0c" }}>{iiset}</td>
                    <td style={{ padding: "15px 12px", color: "#596174" }}>{yandex}</td>
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
            Почему ИИСеть стоит в 2 раза дешевле
          </h2>
          <p style={{ color: "#4E5568", fontSize: 18, lineHeight: 1.65, maxWidth: 760 }}>
            ЯндексGPT Plus — около 590 ₽/месяц. За эти деньги вы получаете доступ к
            нейросети Яндекса и интеграцию с её сервисами. Это хороший продукт, но цена
            отражает бренд, а не количество функций.
          </p>
          <p style={{ color: "#4E5568", fontSize: 18, lineHeight: 1.65, maxWidth: 760, marginTop: 16 }}>
            ИИСеть Premium — 249 ₽/месяц. В 2 раза дешевле — и при этом вы получаете
            больше моделей, больше инструментов и больше возможностей.
          </p>
          <ul style={{ lineHeight: 1.95, paddingLeft: 20, color: "#4E5568", maxWidth: 760 }}>
            <li>ИИСеть: 249 ₽/мес — GPT-4o, Claude, Gemini, DeepSeek, веб-поиск, изображения, документы</li>
            <li>ЯндексGPT Plus: ~590 ₽/мес — только чат с моделью Яндекса + ограниченные дополнения</li>
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
            ЯндексGPT использует собственные модели Яндекса — хорошо оптимизированные
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
            Функциональность
          </p>
          <h2 style={{ margin: "0 0 16px", fontSize: "clamp(26px, 3.6vw, 40px)", fontWeight: 700, lineHeight: 1.1 }}>
            ЯндексGPT — отличный чат, но только чат
          </h2>
          <p style={{ color: "#4E5568", fontSize: 18, lineHeight: 1.65, maxWidth: 760 }}>
            ЯндексGPT создаёт качественные текстовые ответы на русском языке.
            Но платформа ограничена текстовым чатом: нет генерации изображений,
            работы с документами или готовых шаблонов. ИИСеть закрывает эти пробелы.
          </p>
          <ul style={{ lineHeight: 1.95, paddingLeft: 20, color: "#4E5568", maxWidth: 760 }}>
            <li>Веб-поиск с прямыми ссылками на источники</li>
            <li>Генерация изображений (Stable Diffusion, DALL-E)</li>
            <li>Загрузка и анализ PDF, DOCX, XLSX</li>
            <li>Память диалогов и проекты</li>
            <li>Готовые шаблоны для работы и учёбы</li>
          </ul>
        </section>

        <section style={{ ...cardStyle, marginBottom: 34, background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(247,247,255,0.96))", border: "2px solid rgba(109, 93, 246, 0.68)" }}>
          <p style={{ color: "#6D5DF6", fontWeight: 800, marginTop: 0, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.12em" }}>
            Русский язык
          </p>
          <h2 style={{ margin: "0 0 16px", fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 700, lineHeight: 1.1 }}>
            Где ЯндексGPT всё ещё силён
          </h2>
          <p style={{ color: "#4E5568", fontSize: 18, lineHeight: 1.65, maxWidth: 760 }}>
            Честно: ЯндексGPT — продукт десятилетий работы над русским языком.
            Для коротких бытовых запросов, реалий российского рынка и нативного
            восприятия русской культуры он по-прежнему эталонен. ИИСеть хорошо
            работает с русским через GPT-4o, Claude и Gemini, но для задач, где
            нужен максимально нативный русский контекст (юридические формулировки,
            локальные реалии), ЯндексGPT сохраняет преимущество.
          </p>
        </section>

        {/* ── Who it's for ───────────────────────────────────── */}
        <section style={{ ...cardStyle, marginBottom: 34 }}>
          <h2 style={{ margin: "0 0 16px", fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 700, lineHeight: 1.1 }}>
            Кому что выбрать
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, marginTop: 18 }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: 17, margin: "0 0 8px" }}>
                ЯндексGPT
              </p>
              <p style={{ color: "#596174", lineHeight: 1.6, margin: 0 }}>
                Лучший выбор для пользователей, глубоко интегрированных в экосистему Яндекс:
                Алиса, Документы, Поиск, Карты. Для коротких бытовых запросов и максимально
                нативного русского контекста. Если вы готовы платить ~590 ₽/мес за чат.
              </p>
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 17, margin: "0 0 8px", color: "#6D5DF6" }}>
                ИИСеть
              </p>
              <p style={{ color: "#596174", lineHeight: 1.6, margin: 0 }}>
                Комплексное решение для работы, учёбы и коммерческих задач.
                GPT-4o, Claude, Gemini, DeepSearch, веб-поиск, изображения и документы —
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
            ИИСеть уже используют 8 000+ пользователей
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
              location="yandexgpt_comparison_bottom_cta"
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
