// Web Speech API（音声認識）を安全に扱うためのヘルパー関数群です。
// Next.js ではサーバーサイドでも実行されるため、
// window があるかどうかのチェックを必ず行います。

export type SpeechRecognitionController = {
  start: () => void;
  stop: () => void;
  isSupported: boolean;
};

type CreateOptions = {
  onResult: (text: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (event: unknown) => void;
};

export function createSpeechRecognition(
  options: CreateOptions
): SpeechRecognitionController {
  // サーバーサイドでは音声認識は使えないので、ダミーのコントローラを返します。
  if (typeof window === "undefined") {
    return {
      start: () => {},
      stop: () => {},
      isSupported: false
    };
  }

  // ブラウザごとに名前が違うので両方をチェックします。
  const AnyWindow = window as typeof window & {
    webkitSpeechRecognition?: any;
    SpeechRecognition?: any;
  };

  const SpeechRecognitionConstructor =
    AnyWindow.SpeechRecognition || AnyWindow.webkitSpeechRecognition;

  if (!SpeechRecognitionConstructor) {
    // 対応していないブラウザ（iOS Safari など）では、
    // ここで「使えない」という結果だけ返します。
    return {
      start: () => {},
      stop: () => {},
      isSupported: false
    };
  }

  const recognition = new SpeechRecognitionConstructor();
  recognition.lang = "ja-JP";
  recognition.interimResults = false;
  recognition.continuous = false;

  recognition.onresult = (event: any) => {
    // 認識結果から最終的なテキストだけを取り出します。
    const text = event.results?.[0]?.[0]?.transcript as string | undefined;
    if (text) {
      options.onResult(text);
    }
  };

  recognition.onstart = () => {
    options.onStart?.();
  };

  recognition.onend = () => {
    options.onEnd?.();
  };

  recognition.onerror = (event: unknown) => {
    options.onError?.(event);
  };

  return {
    start: () => {
      try {
        recognition.start();
      } catch {
        // 連続クリックなどで start() が失敗することがあるので握りつぶします。
      }
    },
    stop: () => {
      try {
        recognition.stop();
      } catch {
        // stop() も同様に失敗してもアプリ自体は壊れないようにします。
      }
    },
    isSupported: true
  };
}

