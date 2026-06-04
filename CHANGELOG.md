# Changelog

## [2.4.3] 2026-06-04

### SEO — `/neiroset-online` use-case landing page created and deployed

- Created `app/neiroset-online/page.tsx` targeting exact-match query "нейросеть онлайн".
- Full metadata export: title with exact keyword, description, keywords (10), canonical URL, OpenGraph tags.
- JSON-LD FAQPage schema with 6 Q&A pairs (what is, models, registration, free usage, vs ChatGPT, work use-cases).
- JSON-LD WebPage schema with `@id`, `url`, `name`, `description`, `inLanguage`.
- Hero with H1 exact match, trust pills (10 000+ users, 6 models, без VPN).
- Feature sections: capabilities grid (6 cards), models grid (6 models), dark features checklist (6 items), how-it-works steps (4 steps).
- Tracked CTAs to `/chat` (primary) and `/pricing` (secondary) in hero and bottom sections.
- Footer cross-links to `/chatgpt-bez-vpn`, comparison pages.
- Updated `app/sitemap.ts` with `/neiroset-online` entry (priority 0.95).
- Added inbound cross-link from `/chatgpt-bez-vpn` footer.
- Updated freshness keyword from "2025" to "2026".
- Production verified: HTTP 200, title, description, canonical, OG, JSON-LD schema, CTA links.
- 173/173 static pages generated, zero new errors, IndexNow 202 response.

## [2.4.2] 2026-06-02

### SEO — FAQPage JSON-LD schema added to /pricing

- Added `const faqJsonLd` object with `@context: "https://schema.org"` and `@type: "FAQPage"`.
- Rendered via `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />`.
- Includes 7 Q&A pairs covering trial, Premium features, price justification, refund guarantee, ChatGPT comparison, work use-cases, and hidden fees.
- FAQ section HTML and visible layout unchanged.
- Production verified: `https://iiset.io/pricing` returns HTTP 200 with valid JSON-LD FAQPage schema in HTML.

## [2.4.1] 2026-05-19

### Added social proof and urgency to landing and paywall

- Homepage: added trust section with user count, daily-framing copy, and trust signals
- TariffModal: added social proof banner inside paywall modal
- CardTariff: added "Популярный выбор" badge and "Меньше 9 ₽ в день" microcopy for paid plans

## [2.4.0] 2024-05-30

### Removed all vulnerabilities

## [2.3.0] 2024-02-10

### Added AI Assistant

- Added AI assistant page, which should be provided with the assistant key variable (NEXT_PUBLIC_OPENAI_ASSISTANT_KEY=asst_**************************) in order to work. 

## [2.2.0] 2024-02-03

### Next.js 14

Updated to next 14.1.0 and removed pages directory in favor of app directory.

## [2.1.0] 2024-01-16

### Chakra UI 2.X.X

Updated all Chakra UI libraries.

## [2.0.0] 2024-01-11

### Added GPT-4 + Solved prompts

Added GPT-4 + Solved prompts (spacings)

## [1.8.0] 2023-10-25

### Next.js app directory

Changed the structure of the template to the new Next.js App directory!

## [1.7.0] 2023-07-28

### Added Bootstrap to Tailwind CSS code Convertor

Added Bootstrap to Tailwind CSS code Convertor

## [1.6.0] 2023-07-27

### Added Domain Name Generator Prompt

Added Domain Name Generator Prompt

## [1.5.0] 2023-07-19

### Added Content Translator Prompt

Added Content Translator Prompt

## [1.4.0] 2023-07-12

### Added Pet Name Generator Prompt

Added Pet Name Generator Prompt

## [1.3.0] 2023-07-05

### Added Hashtags Generator Prompt

Added Hashtags Generator Prompt

## [1.2.1] 2023-06-29

### 🐛 Bug fixing - SEO Keywords Prompt fixed

SEO Keywords Prompt fixed

## [1.2.0] 2023-06-27

### Added Plagiarism Checker Prompt

Added Plagiarism Checker Prompt

## [1.1.0] 2023-06-23

### 🐛 Bug Generated content Prompt Markdown - Solved

Generated content Prompt Markdown on all prompts - Solved

## [1.0.0] 2023-06-20

### Official Release

Added TypeScript & NextJS
