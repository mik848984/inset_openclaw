export default function Head() {
  const schema = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://iiset.io/#organization",
        name: "ИИСеть",
        url: "https://iiset.io",
        logo: "https://iiset.io/brand.png",
        description:
          "Российская AI-платформа: чат с GPT-4o, Claude и Gemini, веб-поиск со ссылками на источники и генерация изображений на русском языке.",
        areaServed: {
          "@type": "Country",
          name: "Russia",
        },
        sameAs: [],
      },
      {
        "@type": "WebSite",
        "@id": "https://iiset.io/#website",
        url: "https://iiset.io",
        name: "ИИСеть",
        publisher: {
          "@id": "https://iiset.io/#organization",
        },
        inLanguage: "ru-RU",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: "https://iiset.io/search?q={search_term_string}",
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  });

  return (
    <>
      <title>
        ИИСеть — нейросеть онлайн на русском: ИИ-чат, веб-поиск и генерация изображений
      </title>
      <meta
        name="description"
        content="ИИСеть — российская AI-платформа: чат с GPT-4o, Claude и Gemini, веб-поиск со ссылками на источники и генерация изображений на русском языке. Один интерфейс вместо десятка сервисов. Регистрация бесплатна."
      />
      <meta
        name="keywords"
        content="ИИСеть, нейросеть онлайн, ИИ чат, чат с ИИ, ChatGPT на русском, нейросеть для текста, генерация изображений нейросетью, ИИ поиск, веб-поиск с источниками, ИИ помощник, нейросеть на русском, AI сервис"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: schema }}
      />
    </>
  );
}
