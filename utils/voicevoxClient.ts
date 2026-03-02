const speak = async (
  text: string,
  options: VoiceOptions
): Promise<VoicePlaybackHandle | null> => {
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

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);

    const data = await res.json(); // ここで data を定義しています

    if (!data.mp3StreamingUrl) throw new Error("mp3StreamingUrl is missing");

    const audio = new Audio();
    // HTTPをHTTPSに置換して、安全に再生できるようにします
    audio.src = data.mp3StreamingUrl.replace("http://", "https://");
    audio.preload = "auto";
    // CORB対策として、一旦 crossOrigin は設定せずに試します
    currentAudio = audio;

    const finished = new Promise<void>((resolve) => {
      audio.onended = () => {
        if (currentAudio === audio) currentAudio = null;
        resolve();
      };
      audio.onerror = () => {
        if (currentAudio === audio) currentAudio = null;
        resolve();
      };
    });

    await audio.play();

    return { stop, finished };
  } catch (error) {
    console.error("voicevox speak error", error);
    return null;
  }
};