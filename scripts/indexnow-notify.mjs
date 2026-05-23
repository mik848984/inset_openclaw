import fs from "node:fs";
import path from "node:path";

/**
 * Примитивный загрузчик .env / .env.local
 */
function loadEnvFile(filename) {
  const fullPath = path.join(process.cwd(), filename);
  if (!fs.existsSync(fullPath)) return;

  const content = fs.readFileSync(fullPath, "utf8");
  for (const rawLine of content.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const eqIndex = line.indexOf("=");
    if (eqIndex === -1) continue;

    const key = line.slice(0, eqIndex).trim();
    let value = line.slice(eqIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (typeof process.env[key] === "undefined") {
      process.env[key] = value;
    }
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const endpoint = "https://yandex.com/indexnow";

const host =
  process.env.NEXT_PUBLIC_SITE_HOST ||
  process.env.HOST ||
  "iiset.io";

const key = process.env.INDEXNOW_KEY;

if (!key) {
  console.warn("INDEXNOW_KEY is not set. Skipping IndexNow postbuild.");
  process.exit(0);
}

// Защита: IndexNow принимает только публичные хосты. Локальный билд
// не должен отправлять localhost/127.0.0.1/0.0.0.0 — это ничего не даст,
// зато может попасть в логи метатели.
if (/^(localhost|127\.|0\.0\.0\.0)/i.test(host)) {
  console.warn(
    `IndexNow: host "${host}" looks local. Skipping postbuild ping.`,
  );
  process.exit(0);
}

const urls = [
  `https://${host}/`,
  `https://${host}/chat`,
  `https://${host}/blog`,
  `https://${host}/life-agents`,
  `https://${host}/all-templates`,
];

const payload = {
  host,
  key,
  keyLocation: `https://${host}/${key}.txt`,
  urlList: urls,
};

(async () => {
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("IndexNow postbuild error:", res.status, text);
      process.exit(1);
    }

    console.log("IndexNow postbuild sent:", res.status);
  } catch (e) {
    console.error("IndexNow postbuild failed:", e);
    process.exit(1);
  }
})();
