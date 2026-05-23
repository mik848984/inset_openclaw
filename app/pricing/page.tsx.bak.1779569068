import Link from "next/link";
import { TrackedPricingCTA } from "@/components/TrackedPricingCTA";

export const metadata = {
  title: "Premium ИИСеть за 249 ₽/мес — тарифы Free и Premium",
  description:
    "Premium-доступ к ИИСеть: ИИ-чат на русском, интернет-поиск, тексты, изображения и AI-агенты за 249 ₽ в месяц.",
};

const comparisonRows = [
  ["ИИ-чат на русском", "Да", "Да"],
  ["Поиск в интернете", "Встроенный поиск", "Расширенный поиск + AI-саммари"],
  ["Текстовые запросы", "До ~120 страниц/мес", "До 2 400 страниц/мес"],
  ["Генерация изображений", "Ограниченно", "До 150 изображений/мес"],
  ["AI-агенты и сценарии", "3 базовых", "15+ рабочих сценариев"],
  ["Для ежедневной работы", "На пробу", "Без лимитов"],
  ["Цена", "0 ₽", "249 ₽/мес"],
  ["Стоимость в день", "0 ₽", "Меньше 9 ₽/день"],
];

const premiumUseCases = [
  "Написать пост, письмо или статью",
  "Быстро разобраться в сложной теме",
  "Найти и структурировать информацию",
  "Сгенерировать идеи для бизнеса или контента",
  "Подготовить резюме, описание или презентацию",
  "Создать изображение или визуальную концепцию",
];

const faq = [
  {
    q: "Можно ли сначала попробовать бесплатно?",
    a: "Да. Можно начать с бесплатного чата и перейти на Premium позже, когда поймёте, что используете ИИСеть регулярно.",
  },
  {
    q: "Что даёт Premium?",
    a: "Premium увеличивает лимиты: до 2 400 страниц текста и до 150 изображений в месяц. Доступны все AI-агенты, расширенный поиск и рабочие сценарии.",
  },
  {
    q: "Почему цена 249 ₽/мес?",
    a: "Это низкий порог входа: меньше 9 ₽ в день. Для сравнения — ChatGPT Plus стоит около 1 830 ₽/мес, а российские агрегаторы — от 500 ₽/мес. ИИСеть даёт чат, поиск, тексты, изображения и агентов в одном окне.",
  },
  {
    q: "Это замена ChatGPT?",
    a: "ИИСеть можно использовать как русскоязычный AI-сервис для задач, где нужен чат, поиск, тексты, идеи и изображения. Это не полная копия ChatGPT.",
  },
  {
    q: "Можно ли использовать ИИСеть для работы?",
    a: "Да, но важные решения нужно проверять. ИИ помогает быстрее подготовить черновик, идею, план, письмо или объяснение.",
  },
  {
    q: "Есть ли скрытые платежи?",
    a: "На этой странице указан Premium 249 ₽/мес. Перед оплатой всегда проверяйте финальные условия на платёжном шаге.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
};

const cardStyle = {
  border: "1px solid rgba(20, 23, 38, 0.08)",
  borderRadius: 28,
  padding: 28,
  background: "rgba(255, 255, 255, 0.78)",
  boxShadow: "0 20px 60px rgba(24, 33, 77, 0.08)",
} as const;

const primaryButton = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(135deg, #6D5DF6 0%, #4D8CFF 100%)",
  color: "white",
  padding: "15px 24px",
  borderRadius: 999,
  textDecoration: "none",
  fontWeight: 800,
  boxShadow: "0 16px 34px rgba(109, 93, 246, 0.26)",
} as const;

const secondaryButton = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid rgba(20, 23, 38, 0.12)",
  color: "#1F2433",
  padding: "15px 24px",
  borderRadius: 999,
  textDecoration: "none",
  fontWeight: 800,
  background: "rgba(255, 255, 255, 0.72)",
} as const;

export default function PricingPage() {
  return (
    <main
      style={{
        maxWidth: 1160,
        margin: "0 auto",
        padding: "64px 20px",
        color: "#141726",
      }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 36,
          padding: "clamp(34px, 6vw, 72px)",
          marginBottom: 34,
          background:
            "radial-gradient(circle at 20% 0%, rgba(109, 93, 246, 0.22), transparent 34%), radial-gradient(circle at 86% 18%, rgba(77, 140, 255, 0.22), transparent 30%), linear-gradient(135deg, #F7F7FF 0%, #FFFFFF 68%)",
          border: "1px solid rgba(109, 93, 246, 0.12)",
          boxShadow: "0 28px 90px rgba(42, 52, 99, 0.10)",
        }}
      >
        <div style={{ maxWidth: 820 }}>
          <p style={{ color: "#6D5DF6", fontWeight: 800, margin: "0 0 14px" }}>
            Тарифы ИИСеть
          </p>
          <p style={{ margin: "0 0 14px" }}>
            <span style={{ display: "inline-block", background: "linear-gradient(135deg, #6D5DF6, #4D8CFF)", color: "white", padding: "6px 14px", borderRadius: 999, fontSize: 14, fontWeight: 700 }}>
              Меньше 9 ₽ в день
            </span>
          </p>

          <h1
            style={{
              fontSize: "clamp(38px, 6vw, 72px)",
              lineHeight: 1.02,
              letterSpacing: "-0.055em",
              margin: 0,
            }}
          >
            Premium-доступ к ИИСеть за 249 ₽/мес
          </h1>

          <p
            style={{
              maxWidth: 760,
              margin: "24px 0 0",
              fontSize: "clamp(18px, 2.2vw, 23px)",
              color: "#4E5568",
              lineHeight: 1.55,
            }}
          >
            Больше возможностей для работы с ИИ-чатом, интернет-поиском, текстами,
            изображениями и готовыми агентами — в одном сервисе на русском.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 34 }}>
            <TrackedPricingCTA href="/profile" style={primaryButton} location="hero_primary" plan="premium">
              Оформить Premium за 249 ₽
            </TrackedPricingCTA>
            <TrackedPricingCTA href="/chat" style={secondaryButton} location="hero_secondary" plan="free">
              Сначала попробовать бесплатно
            </TrackedPricingCTA>
          </div>

          <p style={{ marginTop: 14, color: "#697186", fontSize: 15 }}>
            Меньше 9 ₽ в день. Можно начать бесплатно и перейти на Premium позже.
          </p>
        </div>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 18,
          marginBottom: 34,
        }}
      >
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0, fontSize: 28 }}>Free</h2>
          <p style={{ fontSize: 38, fontWeight: 850, margin: "16px 0" }}>0 ₽</p>
          <p style={{ color: "#596174", lineHeight: 1.65 }}>
            Подходит, чтобы познакомиться с ИИСеть и попробовать первые сценарии.
          </p>
          <ul style={{ lineHeight: 1.95, paddingLeft: 20 }}>
            <li>До ~120 страниц текста/мес</li>
            <li>Базовые сценарии работы с ИИ</li>
            <li>Доступ к чату и поиску</li>
          </ul>
          <TrackedPricingCTA href="/chat" style={{ color: "#6D5DF6", fontWeight: 800 }} location="card_free" plan="free">
            Начать бесплатно →
          </TrackedPricingCTA>
        </div>

        <div
          style={{
            ...cardStyle,
            border: "2px solid rgba(109, 93, 246, 0.68)",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(247,247,255,0.96))",
            boxShadow: "0 24px 72px rgba(109, 93, 246, 0.18)",
          }}
        >
          <p style={{ color: "#6D5DF6", fontWeight: 850, marginTop: 0 }}>
            Популярный выбор
          </p>
          <h2 style={{ fontSize: 28 }}>Premium</h2>
          <p style={{ fontSize: 38, fontWeight: 850, margin: "16px 0" }}>249 ₽/мес</p>
          <p style={{ color: "#596174", lineHeight: 1.65 }}>
            Для тех, кто хочет использовать ИИСеть как постоянный AI-инструмент для
            работы, учёбы, контента и повседневных задач.
          </p>
          <ul style={{ lineHeight: 1.95, paddingLeft: 20 }}>
            <li>До 2 400 страниц + 150 изображений/мес</li>
            <li>Все AI-агенты и рабочие сценарии</li>
            <li>Расширенный поиск с AI-саммари</li>
            <li>Меньше 9 ₽ в день</li>
          </ul>
          <TrackedPricingCTA href="/profile" style={primaryButton} location="card_premium" plan="premium">
            Оформить Premium
          </TrackedPricingCTA>
        </div>
      </section>

      <section style={{ ...cardStyle, marginBottom: 34 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
          <div>
            <p style={{ color: "#6D5DF6", fontWeight: 800, margin: "0 0 8px" }}>
              Сравнение тарифов
            </p>
            <h2 style={{ margin: 0, fontSize: "clamp(28px, 4vw, 42px)" }}>
              Free — чтобы попробовать. Premium — чтобы пользоваться каждый день.
            </h2>
          </div>
          <TrackedPricingCTA href="/profile" style={{ ...secondaryButton, alignSelf: "flex-start" }} location="comparison_section" plan="premium">
            Перейти к Premium
          </TrackedPricingCTA>
        </div>

        <div style={{ overflowX: "auto", marginTop: 26 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 680 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "14px 12px", color: "#697186" }}>Возможность</th>
                <th style={{ textAlign: "left", padding: "14px 12px", color: "#697186" }}>Free</th>
                <th style={{ textAlign: "left", padding: "14px 12px", color: "#6D5DF6" }}>Premium</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map(([feature, free, premium]) => (
                <tr key={feature} style={{ borderTop: "1px solid #ECECF4" }}>
                  <td style={{ padding: "15px 12px", fontWeight: 700 }}>{feature}</td>
                  <td style={{ padding: "15px 12px", color: "#596174" }}>{free}</td>
                  <td style={{ padding: "15px 12px", fontWeight: 800 }}>{premium}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section
        style={{
          ...cardStyle,
          marginBottom: 34,
          background:
            "linear-gradient(135deg, rgba(109, 93, 246, 0.10), rgba(77, 140, 255, 0.08))",
        }}
      >
        <p style={{ color: "#6D5DF6", fontWeight: 800, marginTop: 0 }}>Доверие</p>
        <h2 style={{ marginTop: 0, fontSize: "clamp(28px, 4vw, 42px)" }}>
          ИИСеть уже используют 5 268+ пользователей
        </h2>
        <p style={{ color: "#4E5568", fontSize: 18, lineHeight: 1.65, maxWidth: 760 }}>
          Мы не показываем вымышленные отзывы. Вместо этого честно показываем, что
          сервис уже используют для текстов, поиска, идей, изображений и повседневных задач.
        </p>
      </section>

      <section style={{ ...cardStyle, marginBottom: 34 }}>
        <p style={{ color: "#6D5DF6", fontWeight: 800, marginTop: 0 }}>Экономия</p>
        <h2 style={{ marginTop: 0, fontSize: "clamp(28px, 4vw, 42px)" }}>
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
            <p style={{ margin: 0, fontWeight: 700, fontSize: 17 }}>Агрегаторы ИИ</p>
            <p style={{ margin: "6px 0 0", color: "#596174" }}>от 500 ₽/мес</p>
          </div>
          <div style={{ background: "linear-gradient(135deg, rgba(109,93,246,0.12), rgba(77,140,255,0.10))", borderRadius: 22, padding: 20, border: "1px solid rgba(109,93,246,0.25)" }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 17, color: "#6D5DF6" }}>ИИСеть Premium</p>
            <p style={{ margin: "6px 0 0", color: "#596174" }}>249 ₽/мес</p>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: 34 }}>
        <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", marginBottom: 18 }}>
          Что можно делать в ИИСеть
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
          {premiumUseCases.map((item) => (
            <div key={item} style={{ background: "#F7F7FB", borderRadius: 22, padding: 20, fontWeight: 700 }}>
              {item}
            </div>
          ))}
        </div>
      </section>

      <section style={{ ...cardStyle, marginBottom: 34 }}>
        <p style={{ color: "#6D5DF6", fontWeight: 800, marginTop: 0 }}>Оплата</p>
        <h2 style={{ marginTop: 0 }}>Оплата без сложных условий</h2>
        <ul style={{ color: "#4E5568", lineHeight: 1.9, paddingLeft: 20 }}>
          <li>Premium стоит 249 ₽/мес.</li>
          <li>Это меньше 9 ₽ в день.</li>
          <li>Можно начать с бесплатного чата.</li>
          <li>Доступ активируется после успешной оплаты.</li>
          <li>Перед оплатой проверяйте финальные условия на платёжном шаге.</li>
        </ul>
      </section>

      <section style={{ marginBottom: 34 }}>
        <p style={{ color: "#6D5DF6", fontWeight: 800, marginBottom: 8 }}>FAQ</p>
        <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", marginTop: 0 }}>
          Частые вопросы про Premium
        </h2>
        <div style={{ display: "grid", gap: 12 }}>
          {faq.map((item) => (
            <div key={item.q} style={{ ...cardStyle, padding: 22 }}>
              <h3 style={{ margin: "0 0 8px" }}>{item.q}</h3>
              <p style={{ margin: 0, color: "#596174", lineHeight: 1.65 }}>{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        style={{
          textAlign: "center",
          padding: "clamp(30px, 5vw, 54px)",
          background: "linear-gradient(135deg, #141726 0%, #29305A 100%)",
          color: "white",
          borderRadius: 34,
          boxShadow: "0 24px 70px rgba(20, 23, 38, 0.18)",
        }}
      >
        <h2 style={{ marginTop: 0, fontSize: "clamp(30px, 5vw, 48px)" }}>
          Готовы использовать ИИСеть каждый день?
        </h2>
        <p style={{ color: "rgba(255,255,255,0.76)", fontSize: 18, lineHeight: 1.6 }}>
          Оформите Premium за 249 ₽/мес или сначала попробуйте бесплатный чат.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 24 }}>
          <TrackedPricingCTA href="/profile" style={primaryButton} location="bottom_primary" plan="premium">
            Оформить Premium
          </TrackedPricingCTA>
          <TrackedPricingCTA
            href="/chat"
            style={{
              ...secondaryButton,
              background: "rgba(255,255,255,0.10)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.20)",
            }}
            location="bottom_secondary"
            plan="free"
          >
            Попробовать бесплатно
          </TrackedPricingCTA>
        </div>
      </section>
    </main>
  );
}
