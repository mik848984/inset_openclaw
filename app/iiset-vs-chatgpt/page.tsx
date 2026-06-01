import Link from "next/link";
import { TrackedPricingCTA } from "@/components/TrackedPricingCTA";

export const metadata = {
  title: "ИИСеть vs ChatGPT, ЯндексGPT, GigaChat — честное сравнение 2025",
  description:
    "Объективное сравнение ИИСеть, ChatGPT, ЯндексGPT и GigaChat. Доступность из России, цена, функции, русский язык — выбираем лучший ИИ-инструмент в 2025 году.",
  keywords: [
    "ИИСеть vs ChatGPT",
    "аналог ChatGPT в России",
    "нейросеть на русском без VPN",
    "сравнение ИИСеть ЯндексGPT",
    "GigaChat vs ИИСеть",
    "ИИ для работы в России",
  ],
  alternates: {
    canonical: "https://iiset.io/iiset-vs-chatgpt",
  },
  openGraph: {
    title: "ИИСеть vs ChatGPT, ЯндексGPT, GigaChat — честное сравнение 2025",
    description:
      "Объективное сравнение ИИ-платформ: доступность из России, цена, функции, русский язык — выбираем лучший ИИ-инструмент.",
    url: "https://iiset.io/iiset-vs-chatgpt",
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
          name: "Чем ИИСеть отличается от ChatGPT?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "ИИСеть работает стабильно из России без VPN, поддерживает русский язык с локальным контекстом и объединяет чат, веб-поиск, генерацию изображений и работу с документами под единой подпиской. ChatGPT требует VPN, оплата для россиян затруднена, модель ориентирована на западный контекст.",
          },
        },
        {
          "@type": "Question",
          name: "Можно ли использовать ИИСеть без VPN?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Да. ИИСеть размещена на российской инфраструктуре и доступна без VPN из любой точки России. В отличие от ChatGPT, который требует VPN и сторонних способов оплаты.",
          },
        },
        {
          "@type": "Question",
          name: "Сколько стоит ИИСеть по сравнению с ChatGPT и ЯндексGPT?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Premium-подписка ИИСеть стоит 249 ₽/месяц — это в 7 раз дешевле ChatGPT Plus (~1 830 ₽/мес) и в 2 раза дешевле ЯндексGPT Plus (~590 ₽/мес). При этом ИИСеть включает чат, веб-поиск, генерацию изображений и работу с документами в одном тарифе.",
          },
        },
        {
          "@type": "Question",
          name: "Что лучше для работы в России: ИИСеть, ChatGPT, ЯндексGPT или GigaChat?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Для повседневной работы, учёбы и коммерческих задач в России лучше подходит ИИСеть: стабильный доступ без VPN, удобная оплата картой РФ, русский контекст и комплексный набор инструментов (чат, поиск, изображения, документы). ChatGPT лучше для глобальных англоязычных задач. ЯндексGPT и GigaChat — для коротких бытовых запросов.",
          },
        },
      ],
    },
    {
      "@type": "WebPage",
      "@id": "https://iiset.io/iiset-vs-chatgpt",
      url: "https://iiset.io/iiset-vs-chatgpt",
      name: "ИИСеть vs ChatGPT, ЯндексGPT, GigaChat — честное сравнение 2025",
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
            ИИСеть vs ChatGPT,<br />ЯндексGPT, GigaChat
          </h1>
          <p style={{ color: "#596174", fontSize: 19, lineHeight: 1.55, maxWidth: 640, margin: "0 auto 32px" }}>
            Честный разбор четырёх платформ по доступности из России, цене,
            функциям и русскоязычному контексту. Без рекламных слоганов — только
            то, что касается реальной работы.
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
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "16px 12px", color: "#697186", fontSize: 13, fontWeight: 600, borderBottom: "2px solid #ECECF4" }}>
                    Что сравниваем
                  </th>
                  <th style={{ textAlign: "left", padding: "16px 12px", color: "#6D5DF6", fontSize: 15, fontWeight: 800, borderBottom: "2px solid #ECECF4" }}>
                    ИИСеть
                  </th>
                  <th style={{ textAlign: "left", padding: "16px 12px", color: "#697186", fontSize: 15, fontWeight: 600, borderBottom: "2px solid #ECECF4" }}>
                    ChatGPT
                  </th>
                  <th style={{ textAlign: "left", padding: "16px 12px", color: "#697186", fontSize: 15, fontWeight: 600, borderBottom: "2px solid #ECECF4" }}>
                    ЯндексGPT
                  </th>
                  <th style={{ textAlign: "left", padding: "16px 12px", color: "#697186", fontSize: 15, fontWeight: 600, borderBottom: "2px solid #ECECF4" }}>
                    GigaChat
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Доступ без VPN", checkCell, crossCell, checkCell, checkCell],
                  ["Русский контекст", checkCell, warnCell, checkCell, checkCell],
                  ["Веб-поиск с источниками", checkCell, checkCell, warnCell, crossCell],
                  ["Генерация изображений", checkCell, crossCell, warnCell, crossCell],
                  ["Работа с PDF / DOCX", checkCell, crossCell, crossCell, crossCell],
                  ["Память диалогов / проекты", checkCell, checkCell, crossCell, crossCell],
                  ["Оплата из России", checkCell, crossCell, checkCell, checkCell],
                  ["Цена за мес (план)", "249 ₽", "~1 830 ₽", "~590 ₽", "от 249 ₽"],
                  ["Всё в одном тарифе", checkCell, "По частям", "По частям", "Чат + документы"],
                ].map(([feature, iiset, chatgpt, yndx, giga], idx) => (
                  <tr key={feature} style={{ borderTop: idx === 0 ? "none" : "1px solid #ECECF4", background: feature === "Цена за мес (план)" ? "linear-gradient(180deg, rgba(109,93,246,0.04), transparent)" : undefined }}>
                    <td style={{ padding: "15px 12px", fontWeight: 700 }}>{feature}</td>
                    <td style={{ padding: "15px 12px", fontWeight: 700, color: "#0a0a0c" }}>{iiset}</td>
                    <td style={{ padding: "15px 12px", color: "#596174" }}>{chatgpt}</td>
                    <td style={{ padding: "15px 12px", color: "#596174" }}>{yndx}</td>
                    <td style={{ padding: "15px 12px", color: "#596174" }}>{giga}</td>
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
            ChatGPT — хорош, но требует обходных путей
          </h2>
          <p style={{ color: "#4E5568", fontSize: 18, lineHeight: 1.65, maxWidth: 760 }}>
            ChatGPT остаётся сильнейшей моделью для глобальных англоязычных задач.
            Но в 2025 году для России это уже сервис «для особых случаев»:
            нестабильный доступ через VPN, сложности с оплатой подписки и
            западный контекст, который «плавает» в российских реалиях.
          </p>
          <ul style={{ lineHeight: 1.95, paddingLeft: 20, color: "#4E5568", maxWidth: 760 }}>
            <li>VPN обязателен для стабильного доступа</li>
            <li>Официальная подписка ChatGPT Plus недоступна для карт РФ</li>
            <li>Модель заточена под западную повестку и нормы</li>
            <li>Нет встроенного веб-поиска в бесплатном режиме</li>
          </ul>
        </section>

        <section style={{ ...cardStyle, marginBottom: 34 }}>
          <p style={{ color: "#6D5DF6", fontWeight: 800, marginTop: 0, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.12em" }}>
            Функциональность
          </p>
          <h2 style={{ margin: "0 0 16px", fontSize: "clamp(26px, 3.6vw, 40px)", fontWeight: 700, lineHeight: 1.1 }}>
            Российские аналоги быстрые, но узкие
          </h2>
          <p style={{ color: "#4E5568", fontSize: 18, lineHeight: 1.65, maxWidth: 760 }}>
            ЯндексGPT и GigaChat сделали гигантский рывок: отличный русский язык,
            быстрая генерация, понятный интерфейс. Но их ограниченность заметна
            в рабочих сценариях: это в основном чат, а не полноценная платформа.
          </p>
          <ul style={{ lineHeight: 1.95, paddingLeft: 20, color: "#4E5568", maxWidth: 760 }}>
            <li>Базовый чат — хороший, но только чат</li>
            <li>Веб-поиск упрощён или отсутствует</li>
            <li>Генерация изображений слабая или отсутствует</li>
            <li>Нет удобной работы с PDF, DOCX, XLSX</li>
            <li>Память диалогов и проекты реализованы точечно</li>
          </ul>
        </section>

        <section style={{ ...cardStyle, marginBottom: 34, background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(247,247,255,0.96))", border: "2px solid rgba(109, 93, 246, 0.68)" }}>
          <span style={badgePopular}>Популярный выбор</span>
          <h2 style={{ margin: "0 0 16px", fontSize: "clamp(26px, 3.6vw, 40px)", fontWeight: 700, lineHeight: 1.1 }}>
            ИИСеть — платформа под ключ
          </h2>
          <p style={{ color: "#4E5568", fontSize: 18, lineHeight: 1.65, maxWidth: 760 }}>
            ИИСеть развивалась не как «ещё один чат», а как набор инструментов для
            реальных задач. Модель «от запроса до результата» закрывает весь цикл
            без переключения между сервисами.
          </p>
          <ul style={{ lineHeight: 1.95, paddingLeft: 20, color: "#4E5568", maxWidth: 760 }}>
            <li>Чат + веб-поиск с карточками источников + генерация изображений + работа с документами в одном окне</li>
            <li>Стабильно работает из России без VPN и обходных путей</li>
            <li>Предсказуемая оплата картой РФ — никаких сторонних сервисов</li>
            <li>Фиксированная подписка — без скрытых списаний и платных допов</li>
            <li>8 000+ пользователей уже используют платформу для работы, учёбы и творчества</li>
          </ul>
        </section>

        {/* ── Pricing ─────────────────────────────────────────── */}
        <section style={{ ...cardStyle, marginBottom: 34 }}>
          <p style={{ color: "#6D5DF6", fontWeight: 800, marginTop: 0, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.12em" }}>
            Экономия
          </p>
          <h2 style={{ margin: "0 0 16px", fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 700, lineHeight: 1.1 }}>
            ИИСеть дешевле аналогов в 2–7 раз
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginTop: 18 }}>
            <div style={{ background: "#F7F7FB", borderRadius: 22, padding: 20 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 17 }}>ChatGPT Plus</p>
              <p style={{ margin: "6px 0 0", color: "#596174" }}>~1 830 ₽/мес</p>
            </div>
            <div style={{ background: "#F7F7FB", borderRadius: 22, padding: 20 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 17 }}>ЯндексGPT Plus</p>
              <p style={{ margin: "6px 0 0", color: "#596174" }}>~590 ₽/мес</p>
            </div>
            <div style={{ background: "#F7F7FB", borderRadius: 22, padding: 20 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 17 }}>GigaChat Pro</p>
              <p style={{ margin: "6px 0 0", color: "#596174" }}>от 249 ₽/мес</p>
              <p style={{ margin: "2px 0 0", color: "#8e8e93", fontSize: 13 }}>Только чат + документы</p>
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
                ChatGPT
              </p>
              <p style={{ color: "#596174", lineHeight: 1.6, margin: 0 }}>
                Лучший выбор для глубокого анализа, англоязычного контента,
                сложных многоуровневых задач и западного делового контекста.
                Если вы готовы мириться с VPN и ограниченной доступностью
                подписки из России.
              </p>
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 17, margin: "0 0 8px" }}>
                ЯндексGPT / GigaChat
              </p>
              <p style={{ color: "#596174", lineHeight: 1.6, margin: 0 }}>
                Идеально для бытовых запросов, коротких текстов и пациентов,
                кто ценит чистый русский язык. Подходит, если нужен просто
                чат без необходимости в поиске, изображениях и работе с файлами.
              </p>
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 17, margin: "0 0 8px", color: "#6D5DF6" }}>
                ИИСеть
              </p>
              <p style={{ color: "#596174", lineHeight: 1.6, margin: 0 }}>
                Комплексное решение для тех, кто использует ИИ ежедневно:
                работа, учёба, контент, документы, поиск и изображения — всё
                в одном окне на русском, стабильно и доступно из России.
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
