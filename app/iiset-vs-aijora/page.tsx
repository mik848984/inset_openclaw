import Link from "next/link";
import { TrackedPricingCTA } from "@/components/TrackedPricingCTA";

export const metadata = {
  title: "ИИСеть vs Aijora — честное сравнение агрегаторов ИИ для России 2025",
  description:
    "Объективное сравнение ИИСеть и Aijora: доступ без VPN, цена, модели, веб-поиск, генерация изображений и работа с документами. Какой сервис выбрать в 2025 году.",
  keywords: [
    "ИИСеть vs Aijora",
    "Aijora альтернатива",
    "агрегатор нейросетей Россия",
    "сравнение ИИ платформ",
    "ChatGPT на русском без VPN",
    "нейросеть на русском цена",
  ],
  alternates: {
    canonical: "https://iiset.io/iiset-vs-aijora",
  },
  openGraph: {
    title: "ИИСеть vs Aijora — честное сравнение агрегаторов ИИ для России 2025",
    description:
      "Сравниваем два российских агрегатора нейросетей: цена, модели, поиск, изображения, документы — выбираем лучший.",
    url: "https://iiset.io/iiset-vs-aijora",
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
          name: "Чем ИИСеть отличается от Aijora?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "ИИСеть предлагает фиксированную месячную подписку с предсказуемыми лимитами, встроенный веб-поиск со ссылками на источники и генерацию изображений по низкой цене. Aijora работает по системе токенов с оплатой за использование и не предлагает бесплатный тариф.",
          },
        },
        {
          "@type": "Question",
          name: "Есть ли бесплатный тариф в ИИСеть и Aijora?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "ИИСеть предоставляет бесплатный доступ без регистрации с лимитами: до ~9 страниц текста, 20 изображений и 3 веб-поиска. Aijora требует выбрать минимальный платный тариф для начала работы — бесплатного доступа нет.",
          },
        },
        {
          "@type": "Question",
          name: "Что дешевле: ИИСеть или Aijora?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "ИИСеть Premium стоит 249 ₽/месяц — это фиксированная плата за до 2 400 страниц текста и 150 изображений. Aijora использует токенную систему оплаты: стоимость зависит от модели и объёма запросов, что делает итоговую цену менее предсказуемой.",
          },
        },
        {
          "@type": "Question",
          name: "У Aijora есть веб-поиск?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Aijora фокусируется на доступе к текстовым моделям, генерации изображений и видео. Встроенный веб-поиск со ссылками на источники есть в ИИСеть, но не упоминается как ключевая функция в Aijora.",
          },
        },
      ],
    },
    {
      "@type": "WebPage",
      "@id": "https://iiset.io/iiset-vs-aijora",
      url: "https://iiset.io/iiset-vs-aijora",
      name: "ИИСеть vs Aijora — честное сравнение агрегаторов ИИ для России 2025",
      description: "Объективное сравнение двух российских агрегаторов нейросетей.",
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
const crossCell = "❌";
const badgePopular = {
  display: "inline-block",
  background: "#6D5DF6",
  color: "#fff",
  fontWeight: 700,
  fontSize: "12px",
  padding: "4px 12px",
  borderRadius: "999px",
  marginBottom: "10px",
};

export default function IisetVsAijora() {
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
            ИИСеть vs Aijora
          </h1>
          <p style={{ color: "#596174", fontSize: 19, lineHeight: 1.55, maxWidth: 640, margin: "0 auto 32px" }}>
            Два российских агрегатора нейросетей: одни и те же модели, но разный
            подход к цене, поиску и свободе. Честный разбор — без рекламных слоганов.
          </p>
          <TrackedPricingCTA
            href="/pricing"
            style={primaryButton}
            location="comparison_page_hero"
            plan="premium"
          >
            Увидеть тарифы ИИСеть — 249 ₽/мес
          </TrackedPricingCTA>
        </section>

        {/* ── At-a-glance table ──────────────────────────────── */}
        <section style={{ ...cardStyle, marginBottom: 34, overflowX: "auto" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "16px 12px", color: "#697186", fontSize: 13, fontWeight: 600, borderBottom: "2px solid #ECECF4" }}>
                    Что сравниваем
                  </th>
                  <th style={{ textAlign: "left", padding: "16px 12px", color: "#697186", fontSize: 15, fontWeight: 600, borderBottom: "2px solid #ECECF4" }}>
                    Aijora
                  </th>
                  <th style={{ textAlign: "left", padding: "16px 12px", color: "#6D5DF6", fontSize: 15, fontWeight: 800, borderBottom: "2px solid #ECECF4" }}>
                    ИИСеть
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Доступ без VPN", "Да", "Да"],
                  ["Русский интерфейс", "Да", "Да"],
                  ["Модели ИИ", "ChatGPT, Claude, Gemini, DeepSeek, Grok, Moonshot", "GPT-4o, Claude, Gemini, DeepSeek"],
                  ["Веб-поиск с источниками", crossCell, checkCell],
                  ["Генерация изображений", checkCell, checkCell],
                  ["Бесплатный доступ", crossCell, checkCell],
                  ["Тип оплаты", "Токены (за использование)", "Фикс. подписка 249 ₽/мес"],
                  ["Предсказуемость расходов", crossCell, checkCell],
                  ["AI-агенты и сценарии", crossCell, checkCell],
                  ["Работа с файлами/PDF", checkCell, checkCell],
                  ["Цена Premium", "Токенная система", "249 ₽/мес"],
                ].map(([feature, aijora, iiset], idx) => (
                  <tr key={feature} style={{ borderTop: idx === 0 ? "none" : "1px solid #ECECF4", background: feature === "Цена Premium" ? "linear-gradient(180deg, rgba(109,93,246,0.04), transparent)" : undefined }}>
                    <td style={{ padding: "15px 12px", fontWeight: 700 }}>{feature}</td>
                    <td style={{ padding: "15px 12px", color: "#596174" }}>{aijora}</td>
                    <td style={{ padding: "15px 12px", fontWeight: 700, color: "#0a0a0c" }}>{iiset}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Deep sections ──────────────────────────────────── */}
        <section style={{ ...cardStyle, marginBottom: 34 }}>
          <p style={{ color: "#6D5DF6", fontWeight: 800, marginTop: 0, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.12em" }}>
            Доступность
          </p>
          <h2 style={{ margin: "0 0 16px", fontSize: "clamp(26px, 3.6vw, 40px)", fontWeight: 700, lineHeight: 1.1 }}>
            Aijora — множество моделей, но токенная система
          </h2>
          <p style={{ color: "#4E5568", fontSize: 18, lineHeight: 1.65, maxWidth: 760 }}>
            Aijora — российский агрегатор с доступом к официальным API от OpenAI,
            Google, Anthropic, DeepSeek, Moonshot и xAI. Работает без VPN,
            предлагает русский интерфейс и инфраструктуру из 50+ серверов по России.
          </p>
          <ul style={{ lineHeight: 1.95, paddingLeft: 20, color: "#4E5568", maxWidth: 760 }}>
            <li>Большой выбор моделей — от ChatGPT до Grok и Moonshot</li>
            <li>Заявленное добавление новых моделей на следующий день после релиза</li>
            <li>50+ серверов в РФ, CDN для стабильной скорости</li>
            <li>Загрузка изображений и PDF для анализа</li>
            <li>Нет бесплатного тарифа — минимальный платный тариф для старта</li>
            <li>Токенная система делает итоговые расходы непредсказуемыми</li>
            <li>Нет встроенного веб-поиска со ссылками на источники</li>
          </ul>
        </section>

        <section style={{ ...cardStyle, marginBottom: 34, background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(247,247,255,0.96))", border: "2px solid rgba(109, 93, 246, 0.68)" }}>
          <span style={badgePopular}>Популярный выбор</span>
          <h2 style={{ margin: "0 0 16px", fontSize: "clamp(26px, 3.6vw, 40px)", fontWeight: 700, lineHeight: 1.1 }}>
            ИИСеть — платформа под ключ
          </h2>
          <p style={{ color: "#4E5568", fontSize: 18, lineHeight: 1.65, maxWidth: 760 }}>
            ИИСеть развивалась как набор инструментов для реальных задач. Модель
            «от запроса до результата» закрывает весь цикл без переключения
            между сервисами — и по фиксированной цене.
          </p>
          <ul style={{ lineHeight: 1.95, paddingLeft: 20, color: "#4E5568", maxWidth: 760 }}>
            <li>Чат + веб-поиск с карточками источников + генерация изображений + работа с документами в одном окне</li>
            <li>Стабильно работает из России без VPN и обходных путей</li>
            <li>Предсказуемая оплата картой РФ — фиксированная подписка 249 ₽/мес</li>
            <li>Бесплатный старт без регистрации — платите только когда убедились в необходимости</li>
            <li>8 000+ пользователей уже используют платформу</li>
          </ul>
        </section>

        {/* ── Pricing ─────────────────────────────────────────── */}
        <section style={{ ...cardStyle, marginBottom: 34 }}>
          <p style={{ color: "#6D5DF6", fontWeight: 800, marginTop: 0, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.12em" }}>
            Экономия
          </p>
          <h2 style={{ margin: "0 0 16px", fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 700, lineHeight: 1.1 }}>
            ИИСеть дешевле и предсказуемее
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginTop: 18 }}>
            <div style={{ background: "#F7F7FB", borderRadius: 22, padding: 20 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 17 }}>Aijora</p>
              <p style={{ margin: "6px 0 0", color: "#596174" }}>Токенная система</p>
              <p style={{ margin: "2px 0 0", color: "#8e8e93", fontSize: 13 }}>Оплата за использование</p>
            </div>
            <div style={{ background: "linear-gradient(135deg, rgba(109,93,246,0.12), rgba(77,140,255,0.10))", borderRadius: 22, padding: 20, border: "1px solid rgba(109,93,246,0.25)" }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 17, color: "#6D5DF6" }}>ИИСеть Premium</p>
              <p style={{ margin: "6px 0 0", color: "#596174" }}>249 ₽/мес</p>
              <p style={{ margin: "2px 0 0", color: "#6D5DF6", fontSize: 13, fontWeight: 600 }}>Всё включено</p>
            </div>
          </div>
        </section>

        {/* ─‑ Who should choose what ────────────────────────── */}
        <section style={{ ...cardStyle, marginBottom: 34 }}>
          <p style={{ color: "#6D5DF6", fontWeight: 800, marginTop: 0, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.12em" }}>
            Рекомендации
          </p>
          <h2 style={{ margin: "0 0 16px", fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 700, lineHeight: 1.1 }}>
            Кому что выбрать
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, marginTop: 18 }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: 17, margin: "0 0 8px" }}>
                Aijora
              </p>
              <p style={{ color: "#596174", lineHeight: 1.6, margin: 0 }}>
                Лучший выбор, если вам нужен доступ к редким моделям (Grok, Moonshot)
                и вы комфортно чувствуете себя с токенной системой оплаты. Подходит,
                если важна скорость добавления новейших моделей.
              </p>
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 17, margin: "0 0 8px", color: "#6D5DF6" }}>
                ИИСеть
              </p>
              <p style={{ color: "#596174", lineHeight: 1.6, margin: 0 }}>
                Комплексное решение для тех, кто использует ИИ ежедневно:
                работа, учёба, контент, документы, поиск и изображения — всё
                в одном окне на русском, стабильно и доступно из России по
                фиксированной цене.
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
            Мы не показываем вымышленные отзывы. Вместо этого платформа работает
            на российской инфраструктуре, принимает оплату картами РФ и
            закрывает полный цикл задач: текст → поиск → изображение → документ → шаблон.
          </p>
        </section>

        {/* ── CTA ─────────────────────────────────────────────── */}
        <section style={{ ...cardStyle, marginBottom: 34, textAlign: "center" }}>
          <h2 style={{ margin: "0 0 12px", fontSize: "clamp(26px, 3.6vw, 38px)", fontWeight: 700, lineHeight: 1.1 }}>
            Попробовать ИИСеть бесплатно
          </h2>
          <p style={{ color: "#4E5568", fontSize: 18, lineHeight: 1.55, maxWidth: 560, margin: "0 auto 24px" }}>
            Бесплатный тариф — без VPN и регистрации. Перейти на Premium
            можно в любой момент за 249 ₽/мес.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <TrackedPricingCTA
              href="/pricing"
              style={primaryButton}
              location="comparison_page_bottom_cta"
              plan="premium"
            >
              Перейти к тарифам →
            </TrackedPricingCTA>
            <Link href="/chat" style={secondaryButton}>
              Открыть чат бесплатно
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
