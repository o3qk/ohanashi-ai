import { NextRequest, NextResponse } from "next/server";

// VOICEVOX Web API（クラウド）のベースURLとAPIキーは、環境変数から読み込みます。
// 例:
// VOICEVOX_BASE_URL=https://example.voicevox.api
// VOICEVOX_API_KEY=xxxx

const VOICEVOX_BASE_URL = process.env.VOICEVOX_BASE_URL;
const VOICEVOX_API_KEY = process.env.VOICEVOX_API_KEY;

export async function POST(req: NextRequest) {
  // VOICEVOX のクラウドAPIはサービスによって「APIキー必須/不要」が異なるため、
  // ここでは BASE_URL だけ必須にし、APIキーは任意にします。
  if (!VOICEVOX_BASE_URL) {
    return new NextResponse("VOICEVOX API is not configured", {
      status: 500
    });
  }

  try {
    const body = await req.json();
    const text = (body.text as string | undefined) ?? "";
    const speed = (body.speed as number | undefined) ?? 1.0;
    // プランでは ID:2 を使う指定があるので、デフォルトは 2 にします。
    const speakerId = (body.speakerId as number | undefined) ?? 2;

    if (!text.trim()) {
      return new NextResponse("no text", { status: 400 });
    }

    // APIキーがある場合だけヘッダーに付けます（空文字なら付けない）
    const voicevoxHeaders: Record<string, string> = {
      "Content-Type": "application/json"
    };
    if (VOICEVOX_API_KEY && VOICEVOX_API_KEY.trim().length > 0) {
      voicevoxHeaders["x-api-key"] = VOICEVOX_API_KEY;
    }

    // 1. audio_query を取得
    // BASE_URL が `https://example.com/api/` のようにパスを含む場合でも壊れないように、
    // 先頭スラッシュ無しで連結します（`/audio_query` だと `/api/` が消えてしまうため）
    const queryUrl = new URL("audio_query", VOICEVOX_BASE_URL);
    queryUrl.searchParams.set("text", text);
    queryUrl.searchParams.set("speaker", String(speakerId));

    const queryRes = await fetch(queryUrl.toString(), {
      method: "POST",
      headers: voicevoxHeaders
    });

    if (!queryRes.ok) {
      console.error("VOICEVOX audio_query error", await queryRes.text());
      return new NextResponse("voicevox audio_query failed", {
        status: 500
      });
    }

    const queryJson = await queryRes.json();
    // 速度（speedScale）をリクエストに反映します。
    queryJson.speedScale = speed;

    // 2. synthesis で音声データを生成
    const synthUrl = new URL("synthesis", VOICEVOX_BASE_URL);
    synthUrl.searchParams.set("speaker", String(speakerId));

    const synthRes = await fetch(synthUrl.toString(), {
      method: "POST",
      headers: voicevoxHeaders,
      body: JSON.stringify(queryJson)
    });

    if (!synthRes.ok) {
      console.error("VOICEVOX synthesis error", await synthRes.text());
      return new NextResponse("voicevox synthesis failed", {
        status: 500
      });
    }

    const audioBuffer = Buffer.from(await synthRes.arrayBuffer());

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Content-Length": String(audioBuffer.length)
      }
    });
  } catch (error) {
    console.error("/api/voice error", error);
    return new NextResponse("voicevox request failed", { status: 500 });
  }
}

