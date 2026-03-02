import { NextResponse, NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, speed = 1.0, speakerId = 2 } = body;

    const url = new URL("https://api.tts.quest/v3/voicevox/synthesis");
    url.searchParams.set("text", text);
    url.searchParams.set("speaker", String(speakerId));
    url.searchParams.set("speed", String(speed));
    if (process.env.VOICEVOX_API_KEY) url.searchParams.set("key", process.env.VOICEVOX_API_KEY);

    const response = await fetch(url.toString());
    const data = await response.json();

    return NextResponse.json({
      mp3StreamingUrl: data.mp3StreamingUrl,
      success: true
    }, {
      status: 200,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}