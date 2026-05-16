// lib/indexnow.ts
const INDEXNOW_ENDPOINT = "https://yandex.com/indexnow";

type NotifyPayload = {
  host: string;
  key: string;
  keyLocation: string;
  urlList: string[];
};

export async function notifyIndexNow(urls: string[]) {
  if (!urls || urls.length === 0) return;

  const host = process.env.NEXT_PUBLIC_SITE_HOST ?? "iiset.io";
  const key = process.env.INDEXNOW_KEY;

  if (!key) {
    console.warn("INDEXNOW_KEY is not set. Skipping IndexNow.");
    return;
  }

  const payload: NotifyPayload = {
    host,
    key,
    keyLocation: `https://${host}/${key}.txt`,
    urlList: urls,
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
    console.log("IndexNow sent:", res.status);
  }
}
