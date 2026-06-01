import Link from "next/link";
import { TrackedPricingCTA } from "@/components/TrackedPricingCTA";

export const metadata = {
  title: "ИИСеть vs DeepSeek — лучшая альтернатива после блокировки в России 2025",
  description:
    "DeepSeek заблокирован в России? ИИСеть работает без VPN и включает те же модели DeepSeek-V3, DeepSeek-R1, DeepSeek-V4 — плюс ChatGPT, Claude, Gemini. Сравнение функций, цен и доступности.",
  keywords: [
    "DeepSeek не работает",
    "DeepSeek альтернатива в России",
    "DeepSeek аналог",
    "DeepSeek заблокировали",
    "аналог DeepSeek без VPN",
    "нейросеть на русском DeepSeek",
    "ИИСеть vs DeepSeek",
    "DeepSeek V3 в России",
    "DeepSeek R1 аналог",
  ],
  alternates: {
    canonical: "https://iiset.io/iiset-vs-deepseek",
  },
  openGraph: {
    title: "ИИСеть vs DeepSeek — лучшая альтернатива после блокировки в России 2025",
    description:
      "DeepSeek заблокирован? ИИСеть включает DeepSeek-V3, DeepSeek-R1, DeepSeek-V4 — без VPN, на русском, с оплатой картой РФ.",
    url: "https://iiset.io/iiset-vs-deepseek",
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
          name: "Почему DeepSeek не работает в России?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "DeepSeek был заблокирован на уровне провайдеров в России с 24 мая 2025 года. Сайт deepseek.com и API недоступны без VPN. Роскомнадзор включил сервис в реестр запрещённых ресурсов. 23 000+ жалоб зафиксировано на сервисе проверки доступности detector404.ru.",
          },
        },
        {
          "@type": "Question",
          name: "Есть ли DeepSeek в ИИСеть?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Да. ИИСеть включает DeepSeek-V3, DeepSeek-R1, DeepSeek-V3.2 Experimental и DeepSeek-V4 Pro — те же модели, что и на официальном сайте, но доступные без VPN из России. DeepSeek-R1 особенно силён в математике, программировании и логических рассуждениях.",
          },
        },
        {
          "@type": "Question",
          name: "Чем ИИСеть лучше DeepSeek для пользователей из России?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "ИИСеть работает без VPN, поддерживает русский язык с локальным контекстом, принимает оплату картами РФ и объединяет DeepSeek с ChatGPT, Claude, Gemini, Mistral и другими моделями. В DeepSeek русский язык реализован слабее — модель заточена под китайский и английский контекст.",
          },
        },
        {
          "@type": "Question",
          name: "Сколько стоит ИИСеть по сравнению с DeepSeek?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Premium-подписка ИИСеть стоит 249 ₽/месяц — за эту цену вы получаете доступ к DeepSeek-V3, DeepSeek-R1, DeepSeek-V4, GPT-4o, Claude, Gemini, веб-поиск, генерацию изображений и работу с документами. На официальном сайте DeepSeek API платный по токенам, а чат заблокирован в России.",
          },
        },
        {
          "@type": "Question",
          name: "DeepSeek или ИИСеть — что лучше для программирования?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "DeepSeek-R1 — одна из лучших моделей для кода и математики в мире. В ИИСеть вы получаете доступ к DeepSeek-R1 плюс Claude (отличен для архитектуры), GPT-4o (лучший для общих задач) и Gemini (хорош для больших контекстов). ИИСеть не заменяет DeepSeek — а даёт к нему доступ без VPN.",
          },
        },
        {
          "@type": "Question",
          name: "Нужен ли VPN для ИИСеть?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Нет. ИИСеть размещена на российской инфраструктуре и доступна без VPN из любой точки России. Это ключевое отличие от DeepSeek, ChatGPT и Claude, которые требуют VPN или нестабильно работают без него.",
          },
        },
      ],
    },
    {
      "@type": "WebPage",
      "@id": "https://iiset.io/iiset-vs-deepseek",
      url: "https://iiset.io/iiset-vs-deepseek",
      name: "ИИСеть vs DeepSeek — лучшая альтернатива после блокировки в России 2025",
      description: "Честное сравнение ИИСеть и DeepSeek: доступность из России, модели, цены, функции.",
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
            ИИСеть vs DeepSeek
          </h1>
          <p style={{ color: "#596174", fontSize: 19, lineHeight: 1.55, maxWidth: 680, margin: "0 auto 32px" }}>
            DeepSeek заблокирован в России? ИИСеть работает без VPN и включает те же модели —
            DeepSeek-V3, DeepSeek-R1, DeepSeek-V4 — плюс ChatGPT, Claude и Gemini на русском языке.
          </p>
          <TrackedPricingCTA
            href="/chat"
            style={primaryButton}
            location="deepseek_comparison_hero"
            plan="free"
          >
            Попробовать DeepSeek в ИИСеть — бесплатно
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
                    DeepSeek (официальный)
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Доступ без VPN", checkCell, crossCell],
                  ["Работает из России", checkCell, crossCell],
                  ["Модели DeepSeek (V3, R1, V4)", checkCell, checkCell],
                  ["Русский язык + локальный контекст", checkCell, warnCell],
                  ["ChatGPT / Claude / Gemini", checkCell, crossCell],
                  ["Веб-поиск с источниками", checkCell, crossCell],
                  ["Генерация изображений", checkCell, crossCell],
                  ["Работа с PDF / DOCX", checkCell, crossCell],
                  ["Оплата картой РФ", checkCell, crossCell],
                  ["Цена за мес", "249 ₽", "API по токенам"],
                  ["Всё в одном тарифе", checkCell, crossCell],
                ].map(([feature, iiset, deepseek], idx) => (
                  <tr key={feature} style={{ borderTop: idx === 0 ? "none" : "1px solid #ECECF4", background: feature === "Цена за мес" ? "linear-gradient(180deg, rgba(109,93,246,0.04), transparent)" : undefined }}>
                    <td style={{ padding: "15px 12px", fontWeight: 700 }}>{feature}</td>
                    <td style={{ padding: "15px 12px", fontWeight: 700, color: "#0a0a0c" }}>{iiset}</td>
                    <td style={{ padding: "15px 12px", color: "#596174" }}>{deepseek}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Deep sections ──────────────────────────────────── */}
        <section style={{ ...cardStyle, marginBottom: 34 }}>
          <p style={{ color: "#6D5DF6", fontWeight: 800, marginTop: 0, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.12em" }}>
            Доступность в России
          </p>
          <h2 style={{ margin: "0 0 16px", fontSize: "clamp(26px, 3.6vw, 40px)", fontWeight: 700, lineHeight: 1.1 }}>
            DeepSeek заблокировали — что делать?
          </h2>
          <p style={{ color: "#4E5568", fontSize: 18, lineHeight: 1.65, maxWidth: 760 }}>
            24 мая 2025 года DeepSeek был официально заблокирован в России на уровне интернет-провайдеров.
            Сайт deepseek.com, мобильное приложение и API перестали открываться без VPN.
            По данным detector404.ru, зафиксировано более 23 000 жалоб на недоступность сервиса.
          </p>
          <p style={{ color: "#4E5568", fontSize: 18, lineHeight: 1.65, maxWidth: 760, marginTop: 16 }}>
            ИИСеть решает эту проблему: платформа размещена на российской инфраструктуре,
            не требует VPN и включает те же модели DeepSeek (V3, R1, V3.2, V4),
            к которым у вас больше нет прямого доступа.
          </p>
          <ul style={{ lineHeight: 1.95, paddingLeft: 20, color: "#4E5568", maxWidth: 760 }}>
            <li>Никаких VPN, прокси и обходных путей</li>
            <li>Регистрация через email или Telegram за 10 секунд</li>
            <li>Оплата картами РФ — Мир, Visa, Mastercard</li>
            <li>Техподдержка на русском языке</li>
          </ul>
        </section>

        <section style={{ ...cardStyle, marginBottom: 34 }}>
          <p style={{ color: "#6D5DF6", fontWeight: 800, marginTop: 0, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.12em" }}>
            Модели
          </p>
          <h2 style={{ margin: "0 0 16px", fontSize: "clamp(26px, 3.6vw, 40px)", fontWeight: 700, lineHeight: 1.1 }}>
            DeepSeek в ИИСеть — те же модели, новый доступ
          </h2>
          <p style={{ color: "#4E5568", fontSize: 18, lineHeight: 1.65, maxWidth: 760 }}>
            ИИСеть не заменяет DeepSeek — а даёт к нему доступ. В платформу интегрированы
            DeepSeek-V3 (универсальная модель), DeepSeek-R1 (математика и код),
            DeepSeek-V3.2 Experimental и DeepSeek-V4 Pro. Вы получаете тот же уровень
            ответов, но на русском языке и с возможностью переключаться на Claude или Gemini
            в том же диалоге.
          </p>
          <ul style={{ lineHeight: 1.95, paddingLeft: 20, color: "#4E5568", maxWidth: 760 }}>
            <li><strong>DeepSeek-V3</strong> — универсальная модель для текста, анализа и переводов</li>
            <li><strong>DeepSeek-R1</strong> — лидер в математике, программировании и логике</li>
            <li><strong>DeepSeek-V4 Pro</strong> — улучшенное рассуждение и длинный контекст</li>
            <li>+ ChatGPT-4o, Claude, Gemini, Mistral, Qwen — в одной подписке</li>
          </ul>
        </section>

        <section style={{ ...cardStyle, marginBottom: 34 }}>
          <p style={{ color: "#6D5DF6", fontWeight: 800, marginTop: 0, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.12em" }}>
            Функциональность
          </p>
          <h2 style={{ margin: "0 0 16px", fontSize: "clamp(26px, 3.6vw, 40px)", fontWeight: 700, lineHeight: 1.1 }}>
            DeepSeek — отличный чат, но только чат
          </h2>
          <p style={{ color: "#4E5568", fontSize: 18, lineHeight: 1.65, maxWidth: 760 }}>
            DeepSeek создаёт впечатляющие текстовые ответы, особенно в коде и математике.
            Но платформа ограничена текстовым чатом: нет веб-поиска, генерации изображений,
            работы с документами или памяти проектов. ИИСеть закрывает эти пробелы и
            добавляет то, чего не было даже до блокировки.
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
            DeepSeek «знает» русский, ИИСеть «живёт» в нём
          </h2>
          <p style={{ color: "#4E5568", fontSize: 18, lineHeight: 1.65, maxWidth: 760 }}>
            DeepSeek-V3 и R1 понимают русский язык на техническом уровне, но их сила —
            в китайском и английском контексте. Переводы, локальные реалии российского рынка,
            юридические формулировки и культурные нюансы часто теряются.
            ИИСеть адаптирована для русскоязычных пользователей: понимает контекст,
            работы с документами на русском и советует с учётом российских реалий.
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
                DeepSeek (через VPN)
              </p>
              <p style={{ color: "#596174", lineHeight: 1.6, margin: 0 }}>
                Лучший выбор для программистов и математиков, работающих на английском
                или китайском языке. DeepSeek-R1 — один из сильнейших моделей для кода
                и логики в мире. Если вы готовы использовать VPN и API-ключи.
              </p>
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 17, margin: "0 0 8px", color: "#6D5DF6" }}>
                ИИСеть
              </p>
              <p style={{ color: "#596174", lineHeight: 1.6, margin: 0 }}>
                Комплексное решение для тех, кто использовал DeepSeek ежедневно и потерял
                к нему доступ. Те же модели — плюс ChatGPT, Claude, веб-поиск, изображения
                и документы. Без VPN, на русском, с оплатой из России.
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
            DeepSeek-V4 Pro, GPT-4o и Claude — всё в одной подписке за 249 ₽/мес.
          </p>
        </section>

        {/* ── CTA ─────────────────────────────────────────────── */}
        <section style={{ ...cardStyle, marginBottom: 34, textAlign: "center" }}>
          <h2 style={{ margin: "0 0 12px", fontSize: "clamp(26px, 3.6vw, 38px)", fontWeight: 700, lineHeight: 1.1 }}>
            Попробовать DeepSeek в ИИСеть бесплатно
          </h2>
          <p style={{ color: "#4E5568", fontSize: 18, lineHeight: 1.55, maxWidth: 560, margin: "0 auto 24px" }}>
            Бесплатный тариф — без VPN и регистрации. Получите доступ к DeepSeek-V3,
            DeepSeek-R1 и другим моделям прямо сейчас. Перейти на Premium можно за 249 ₽/мес.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <TrackedPricingCTA
              href="/chat"
              style={primaryButton}
              location="deepseek_comparison_bottom_cta"
              plan="free"
            >
              Открыть DeepSeek →
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
