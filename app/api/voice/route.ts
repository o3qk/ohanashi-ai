import { NextResponse, NextRequest } from "next/server"; // ← NextRequest を追加しました

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text = body.text ?? "";
    const speed = body.speed ?? 1.0;
    const speakerId = body.speakerId ?? 2;

    const TTSQUEST_SYNTHESIS_URL = process.env.TTSQUEST_SYNTHESIS_URL || "https://api.tts.quest/v3/voicevox/synthesis";
    const VOICEVOX_API_KEY = process.env.VOICEVOX_API_KEY;

    if (!text.trim()) return new NextResponse("no text", { status: 400 });

    const url = new URL(TTSQUEST_SYNTHESIS_URL);
    url.searchParams.set("text", text);
    url.searchParams.set("speaker", String(speakerId));
    url.searchParams.set("speed", String(speed));
    if (VOICEVOX_API_KEY) url.searchParams.set("key", VOICEVOX_API_KEY);

    const res = await fetch(url.toString());
    if (!res.ok) return new NextResponse("tts.quest synthesis failed", { status: 500 });

    const data = await res.json();

    return NextResponse.json({
        mp3StreamingUrl: data.mp3StreamingUrl,
        success: true
    }, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
        }
    });
  } catch (error) {
    return new NextResponse("voicevox request failed", { status: 500 });
  }
}