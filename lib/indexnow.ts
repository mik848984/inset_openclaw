// lib/indexnow.ts
const INDEXNOW_ENDPOINT = "https://yandex.com/indexnow";

type NotifyPayload = {
  host: string;
  key: string;
  keyLocation: string;
  urlList: string[];
};

// Пути, которые мы НЕ хотим отдавать поисковикам — даже если кто-то
// случайно отправит их в /indexnow API.
const PRIVATE_PATH_PATTERNS = [
  /^\/api(\/|$)/,
  /^\/admin(\/|$)/,
  /^\/admin-user(\/|$)/,
  /^\/blog\/admin(\/|$)/,
  /^\/users(\/|$)/,
  /^\/settings(\/|$)/,
  /^\/usage(\/|$)/,
  /^\/my-plan(\/|$)/,
  /^\/my-projects(\/|$)/,
  /^\/history(\/|$)/,
  /^\/dialogs(\/|$)/,
  /^\/hr-agent(\/|$)/,
  /^\/hr-agent-scores(\/|$)/,
  /^\/indexnow(\/|$)/,
];

function isSafeIndexNowUrl(raw: string, expectedHost: string): boolean {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }
  if (url.protocol !== "https:") return false;
  // Не отправляем localhost / приватные адреса
  const h = url.hostname.toLowerCase();
  if (
    h === "localhost" ||
    h.startsWith("127.") ||
    h === "0.0.0.0" ||
    h.endsWith(".local")
  ) {
    return false;
  }
  // Хост должен совпадать с публичным
  if (h !== expectedHost.toLowerCase()) return false;
  // Не отправляем приватные пути
  if (PRIVATE_PATH_PATTERNS.some((re) => re.test(url.pathname))) return false;
  return true;
}

export async function notifyIndexNow(urls: string[]) {
  if (!urls || urls.length === 0) return;

  const host = process.env.NEXT_PUBLIC_SITE_HOST ?? "iiset.io";
  const key = process.env.INDEXNOW_KEY;

  if (!key) {
    console.warn("INDEXNOW_KEY is not set. Skipping IndexNow.");
    return;
  }

  // Не пускаем мусор в Yandex IndexNow.
  const safeUrls = urls.filter((u) => isSafeIndexNowUrl(u, host));
  if (safeUrls.length === 0) {
    console.warn("IndexNow: no safe URLs after filtering. Skipping.");
    return;
  }

  const payload: NotifyPayload = {
    host,
    key,
    keyLocation: `https://${host}/${key}.txt`,
    urlList: safeUrls,
  };

  const res = await fetch(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("IndexNow error:", res.status, text);
  } else {
    console.log(`IndexNow sent: ${res.status} (${safeUrls.length} urls)`);
  }
}
