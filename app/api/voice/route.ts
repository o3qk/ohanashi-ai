import { NextRequest, NextResponse } from "next/server";

// tts.quest v3 VOICEVOX API を利用して、mp3StreamingUrl を返すためのAPIです。
//
// ポイント:
// - `mp3StreamingUrl` は合成完了を待たずに再生開始できるため、待ち時間を短くできます。
// - SU-SHIKI の高速版キーなどは、`.env` の `VOICEVOX_API_KEY` から読み込み、tts.quest へ `key` パラメータとして渡します。
//
// 参考URL（ユーザー指定）:
// - https://api.tts.quest/v3/voicevox/synthesis

const TTSQUEST_SYNTHESIS_URL =
  process.env.TTSQUEST_SYNTHESIS_URL ||
  "https://api.tts.quest/v3/voicevox/synthesis";

// SU-SHIKI の高速版キーなど（tts.quest へ key=... として渡します）
const VOICEVOX_API_KEY = process.env.VOICEVOX_API_KEY;

type TtsQuestSynthesisResponse = {
  success: boolean;
  isApiKeyValid?: boolean;
  speakerName?: string;
  audioStatusUrl?: string;
  wavDownloadUrl?: string;
  mp3DownloadUrl?: string;
  mp3StreamingUrl?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text = (body.text as string | undefined) ?? "";
    const speed = (body.speed as number | undefined) ?? 1.0;
    // 指定どおり: 話者IDは 2（四国めたん・あまあま）
    const speakerId = (body.speakerId as number | undefined) ?? 2;

    if (!text.trim()) {
      return new NextResponse("no text", { status: 400 });
    }

    // tts.quest の synthesis はクエリパラメータで指定します。
    // 例) /v3/voicevox/synthesis?text=...&speaker=2&speed=1.0&key=...
    const url = new URL(TTSQUEST_SYNTHESIS_URL);
    url.searchParams.set("text", text);
    url.searchParams.set("speaker", String(speakerId));
    url.searchParams.set("speed", String(speed));

    // SU-SHIKI 高速版キー（任意）
    if (VOICEVOX_API_KEY && VOICEVOX_API_KEY.trim().length > 0) {
      url.searchParams.set("key", VOICEVOX_API_KEY);
    }

    const res = await fetch(url.toString(), {
      method: "GET"
    });

    if (!res.ok) {
      console.error("tts.quest synthesis error", await res.text());
      return new NextResponse("tts.quest synthesis failed", { status: 500 });
    }

    const data = (await res.json()) as TtsQuestSynthesisResponse;

    if (!data.success || !data.mp3StreamingUrl) {
      console.error("tts.quest synthesis response", data);
      return new NextResponse("tts.quest response invalid", { status: 500 });
    }

    // クライアントはこの mp3StreamingUrl を <audio> で再生します。
    return NextResponse.json(
      {
        mp3StreamingUrl: data.mp3StreamingUrl,
        mp3DownloadUrl: data.mp3DownloadUrl,
        audioStatusUrl: data.audioStatusUrl,
        speakerName: data.speakerName,
        isApiKeyValid: data.isApiKeyValid ?? null
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("/api/voice error", error);
    return new NextResponse("voicevox request failed", { status: 500 });
  }
}

