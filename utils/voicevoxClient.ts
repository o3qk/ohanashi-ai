// VOICEVOX 用のクライアントユーティリティです。
// `/api/voice` にテキストを送ると、音声データを受け取り再生します。

export type VoiceOptions = {
  speed: number;
  speakerId?: number;
};

export async function speakWithVoiceVox(
  text: string,
  options: VoiceOptions
): Promise<HTMLAudioElement | null> {
  if (!text.trim()) {
    return null;
  }

  // ブラウザ外では音声再生ができないため、サーバーサイド実行時は何もしません。
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const res = await fetch("/api/voice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text,
        speed: options.speed,
        speakerId: options.speakerId ?? 2
      })
    });

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    const audio = new Audio(url);
    await audio.play();

    return audio;
  } catch (error) {
    console.error("voicevox error", error);
    return null;
  }
}

