import React from "react";

import type { ConversationStatus } from "./CharacterAvatar";

export type ReplyMode = "voice" | "text" | "both";

type Props = {
  status: ConversationStatus;
  replyMode: ReplyMode;
  onReplyModeChange: (mode: ReplyMode) => void;
  speed: number;
  onSpeedChange: (value: number) => void;
  onStartSpeaking: () => void;
  onStopAll: () => void;
  isRecognizing: boolean;
  isBusy: boolean;
};

// 画面下部の「話す」「停止」ボタンや返信モード、速度スライダーをまとめたコンポーネントです。
export const ControlPanel: React.FC<Props> = ({
  status,
  replyMode,
  onReplyModeChange,
  speed,
  onSpeedChange,
  onStartSpeaking,
  onStopAll,
  isRecognizing,
  isBusy
}) => {
  const isSpeakingOrListening =
    status === "listening" || status === "speaking";

  // 返信モード選択用の共通スタイルです。
  const modeButtonBase =
    "flex-1 px-3 py-2 sm:px-4 sm:py-3 rounded-xl text-sm sm:text-lg font-semibold border-2 transition";

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <button
          type="button"
          className="flex-1 py-4 sm:py-5 rounded-full text-2xl sm:text-3xl font-extrabold bg-ohanashi-orange-500 text-white hover:bg-ohanashi-orange-600 shadow-lg transition disabled:bg-slate-300 disabled:cursor-not-allowed"
          onClick={onStartSpeaking}
          disabled={isBusy}
        >
          {isRecognizing ? "ききとり中…" : "話す"}
        </button>
        <button
          type="button"
          className="flex-1 py-4 sm:py-5 rounded-full text-2xl sm:text-3xl font-extrabold bg-slate-700 text-white hover:bg-slate-800 shadow-lg transition disabled:bg-slate-400 disabled:cursor-not-allowed"
          onClick={onStopAll}
          disabled={!isSpeakingOrListening && !isBusy}
        >
          とめる
        </button>
      </div>

      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-ohanashi-orange-100 space-y-3 sm:space-y-4">
        <div>
          <div className="text-xs sm:text-sm font-semibold text-ohanashi-orange-700 mb-2">
            返信モード
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              type="button"
              className={`${modeButtonBase} ${
                replyMode === "text"
                  ? "bg-ohanashi-yellow-300 border-ohanashi-orange-400 text-ohanashi-orange-900"
                  : "bg-white border-ohanashi-yellow-200 text-ohanashi-orange-700"
              }`}
              onClick={() => onReplyModeChange("text")}
            >
              テキストだけ
            </button>
            <button
              type="button"
              className={`${modeButtonBase} ${
                replyMode === "voice"
                  ? "bg-ohanashi-yellow-300 border-ohanashi-orange-400 text-ohanashi-orange-900"
                  : "bg-white border-ohanashi-yellow-200 text-ohanashi-orange-700"
              }`}
              onClick={() => onReplyModeChange("voice")}
            >
              声だけ
            </button>
            <button
              type="button"
              className={`${modeButtonBase} ${
                replyMode === "both"
                  ? "bg-ohanashi-yellow-300 border-ohanashi-orange-400 text-ohanashi-orange-900"
                  : "bg-white border-ohanashi-yellow-200 text-ohanashi-orange-700"
              }`}
              onClick={() => onReplyModeChange("both")}
            >
              声 + テキスト
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="text-xs sm:text-sm font-semibold text-ohanashi-orange-700">
              返答の はやさ
            </div>
            <div className="text-xs sm:text-sm text-slate-600">
              {speed.toFixed(1)}倍
            </div>
          </div>
          <input
            type="range"
            min={0.5}
            max={2}
            step={0.1}
            value={speed}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            className="w-full accent-ohanashi-orange-500"
          />
          <div className="flex justify-between text-[11px] sm:text-xs text-slate-500 mt-1">
            <span>ゆっくり</span>
            <span>ふつう</span>
            <span>はやく</span>
          </div>
        </div>
      </div>
    </div>
  );
};

