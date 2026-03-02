// app/api/voice/route.ts

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text = body.text ?? "";
    const speed = body.speed ?? 1.0;
    const speakerId = body.speakerId ?? 2;

    if (!text.trim()) return new NextResponse("no text", { status: 400 });

    // 1. サーバー側で URL を組み立てる
    const url = new URL(TTSQUEST_SYNTHESIS_URL);
    url.searchParams.set("text", text);
    url.searchParams.set("speaker", String(speakerId));
    url.searchParams.set("speed", String(speed));
    if (VOICEVOX_API_KEY) url.searchParams.set("key", VOICEVOX_API_KEY);

    // 2. サーバー(Vercel)側から tts.quest を叩く (ブラウザを介さないので CORB を回避)
    const res = await fetch(url.toString());

    if (!res.ok) return new NextResponse("tts.quest synthesis failed", { status: 500 });

    const data = await res.json();

    // 3. ここが重要：クライアントに返すデータを整理
    return NextResponse.json({
        mp3StreamingUrl: data.mp3StreamingUrl,
        success: true
    }, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*', // CORS許可を追加
        }
    });
  } catch (error) {
    return new NextResponse("voicevox request failed", { status: 500 });
  }
}