export type VoiceOptions = {
  speed: number;
  speakerId?: number;
};

export type VoicePlaybackHandle = {
  stop: () => void;
  finished: Promise<void>;
};

export type VoicePlayer = {
  unlock: () => Promise<boolean>;
  speak: (text: string, options: VoiceOptions) => Promise<VoicePlaybackHandle | null>;
  stop: () => void;
  isUnlocked: () => boolean;
};

export function createVoicePlayer(): VoicePlayer {
  if (typeof window === "undefined") {
    return {
      unlock: async () => false,
      speak: async () => null,
      stop: () => {},
      isUnlocked: () => false
    };
  }

  let currentAudio: HTMLAudioElement | null = null;
  let unlocked = false;

  const stop = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.src = "";
      currentAudio = null;
    }
  };

  return {
    unlock: async () => {
      unlocked = true;
      return true;
    },
    isUnlocked: () => unlocked,
    stop,
    speak: async (text, options) => {
      if (!text.trim()) return null;
      try {
        stop();
        const res = await fetch("/api/voice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            speed: options.speed,
            speakerId: options.speakerId ?? 2
          })
        });

        if (!res.ok) throw new Error("Voice API failed");
        const data = await res.json();
        if (!data.mp3StreamingUrl) throw new Error("No MP3 URL");

        const audio = new Audio();
        audio.src = data.mp3StreamingUrl.replace("http://", "https://");
        audio.preload = "auto";
        currentAudio = audio;

        const finished = new Promise<void>((resolve) => {
          audio.onended = () => resolve();
          audio.onerror = () => resolve();
        });

        await audio.play();
        return { stop, finished };
      } catch (e) {
        console.error("Playback error:", e);
        return null;
      }
    }
  };
}