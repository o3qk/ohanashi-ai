// VOICEVOX（tts.quest v3）用のクライアントユーティリティです。
//
// この実装は「mp3StreamingUrl」を使って、合成完了を待たずに再生開始します。
// - `/api/voice` が mp3StreamingUrl を返す
// - ブラウザ側は <audio> の src に mp3StreamingUrl を入れて、そのまま再生
//
// 注意:
// - ブラウザは「ユーザー操作なしの音声再生」をブロックすることがあるため、
//   1回ユーザーがボタンを押したタイミングで unlock() を呼ぶ設計にしています。

export type VoiceOptions = {
  speed: number;
  speakerId?: number;
};

export type VoicePlaybackHandle = {
  // 返答途中で止めたいときに呼び出します。
  stop: () => void;
  // 再生が最後まで終わったら解決されます。
  finished: Promise<void>;
};

export type VoicePlayer = {
  // iOS Safari などで必要：ユーザー操作のタイミングで呼ぶと音が出やすくなります。
  unlock: () => Promise<boolean>;
  // VOICEVOX で音声を生成して再生します。
  speak: (text: string, options: VoiceOptions) => Promise<VoicePlaybackHandle | null>;
  // いま再生中の音を止めます。
  stop: () => void;
  // 音声再生の準備ができているか（目安）
  isUnlocked: () => boolean;
};

export function createVoicePlayer(): VoicePlayer {
  // サーバーサイドでは音声再生できないため、ダミーを返します。
  if (typeof window === "undefined") {
    return {
      unlock: async () => false,
      speak: async () => null,
      stop: () => {},
      isUnlocked: () => false
    };
  }

  // 再生中の audio を保持して、途中停止できるようにします。
  let currentAudio: HTMLAudioElement | null = null;
  let unlocked = false;

  const stop = () => {
    try {
      if (currentAudio) {
        currentAudio.pause();
        // 読み込みも止めたいので src を空にします（端末によって有効）
        currentAudio.src = "";
      }
    } catch {
      // stop 失敗は無視してOK
    } finally {
      currentAudio = null;
    }
  };

  const isUnlocked = () => {
    return unlocked;
  };

  const unlock = async (): Promise<boolean> => {
    try {
      // <audio> の autoplay 制限は「ユーザー操作が1回あったかどうか」で緩くなることが多いです。
      // ここでは “解除できた” というフラグを立てるだけにしておき、
      // 実際の再生は speak() が URL を受け取った時点で行います。
      unlocked = true;
      return true;
    } catch (error) {
      console.error("voice unlock error", error);
      return false;
    }
  };

  const speak = async (
    text: string,
    options: VoiceOptions
  ): Promise<VoicePlaybackHandle | null> => {
    if (!text.trim()) return null;

    try {
      // 先に止めてから新しく再生します（多重再生防止）。
      stop();

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

      const data = (await res.json()) as {
        mp3StreamingUrl?: string;
        speakerName?: string;
        isApiKeyValid?: boolean | null;
      };

      if (!data.mp3StreamingUrl) {
        throw new Error("mp3StreamingUrl is missing");
      }

      // mp3StreamingUrl をそのまま audio にセットします。
      // これにより、合成完了を待たずに音が出始めます（環境により多少差あり）。
      const audio = new Audio();
      audio.src = data.mp3StreamingUrl;
      audio.preload = "auto";
      audio.crossOrigin = "anonymous";
      currentAudio = audio;

      const finished = new Promise<void>((resolve) => {
        audio.onended = () => {
          if (currentAudio === audio) {
            currentAudio = null;
          }
          resolve();
        };
        audio.onerror = () => {
          if (currentAudio === audio) {
            currentAudio = null;
          }
          resolve();
        };
      });

      // ここで play() がブロックされる場合は、
      // UI 側で「もう一度ボタンを押してね」と案内する想定です。
      await audio.play();

      return {
        stop,
        finished
      };
    } catch (error) {
      console.error("voicevox speak error", error);
      return null;
    }
  };

  return {
    unlock,
    speak,
    stop,
    isUnlocked
  };
}

