// app/api/voice/route.ts 【完全版】
import { NextResponse, NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, speed = 1.0, speakerId = 2 } = body;

    if (!text) return new NextResponse("No text provided", { status: 400 });

    const TTS_URL = "https://api.tts.quest/v3/voicevox/synthesis";
    const apiKey = process.env.VOICEVOX_API_KEY;

    // 1. URLの組み立て
    const url = new URL(TTS_URL);
    url.searchParams.set("text", text);
    url.searchParams.set("speaker", String(speakerId));
    url.searchParams.set("speed", String(speed));
    if (apiKey) url.searchParams.set("key", apiKey);

    // 2. サーバー側でデータを取得 (これが CORB 回避の鍵)
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error("Failed to fetch from tts.quest");

    const data = await response.json();

    // 3. ブラウザに「自前サーバーの応答」として返す
    return NextResponse.json({
      mp3StreamingUrl: data.mp3StreamingUrl,
      success: true
    }, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      }
    });

  } catch (error: any) {
    console.error("Voice API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}