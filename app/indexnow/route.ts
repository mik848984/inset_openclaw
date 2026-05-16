import { NextRequest, NextResponse } from "next/server";
import { notifyIndexNow } from "../../lib/indexnow";

export async function POST(req: NextRequest) {
  try {
    const { urls } = (await req.json()) as { urls?: string[] };
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ ok: false, error: "Empty urls" }, { status: 400 });
    }
    await notifyIndexNow(urls);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  if (!url) {
    return NextResponse.json({ ok: false, error: "Missing url param" }, { status: 400 });
  }
  await notifyIndexNow([url]);
  return NextResponse.json({ ok: true });
}
