import React from "react";
import type { CharacterId } from "./CharacterSelector";

// アプリ全体で共有する会話状態の型です。
export type ConversationStatus = "idle" | "listening" | "thinking" | "speaking";

type Props = {
  character: CharacterId;
  status: ConversationStatus;
};

// 状態ごとにアニメーション用のクラスを決めるヘルパー関数です。
function statusToAnimation(status: ConversationStatus): string {
  switch (status) {
    case "listening":
      return "animate-bounce-soft";
    case "thinking":
      return "animate-pulse-soft";
    case "speaking":
      return "animate-float-slow";
    default:
      return "";
  }
}

// 状態ごとに背景色を変えることで、今なにをしているかを分かりやすくします。
function statusToColor(status: ConversationStatus): string {
  switch (status) {
    case "listening":
      return "bg-emerald-200";
    case "thinking":
      return "bg-sky-200";
    case "speaking":
      return "bg-ohanashi-orange-300";
    default:
      return "bg-white";
  }
}

// キャラクターごとに顔アイコンと説明を切り替えます。
function characterToFace(character: CharacterId): { emoji: string; label: string } {
  switch (character) {
    case "hana":
      return { emoji: "👧", label: "はなちゃん" };
    case "neighbor":
      return { emoji: "👩", label: "近所のおねえさん" };
    case "uncle":
      return { emoji: "👨‍🏫", label: "頭のいいおじさま" };
    default:
      return { emoji: "🙂", label: "お話AI" };
  }
}

export const CharacterAvatar: React.FC<Props> = ({ character, status }) => {
  const { emoji, label } = characterToFace(character);
  const animationClass = statusToAnimation(status);
  const colorClass = statusToColor(status);

  return (
    <div className="relative flex items-center gap-4 sm:gap-6 mb-4 sm:mb-6">
      {/* 上で動く“キラキラ”演出（視線を集めて「動いてる感」を出す） */}
      <div className="absolute -top-3 left-0 right-0 flex justify-center pointer-events-none">
        <div className="px-4 py-1 rounded-full bg-white/70 border border-ohanashi-yellow-200 text-ohanashi-orange-800 text-xs sm:text-sm font-bold animate-float-slow">
          きらきら うごいてるよ
        </div>
      </div>
      <div
        className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full flex items-center justify-center text-5xl sm:text-6xl shadow-md border-4 border-ohanashi-orange-300 ${colorClass} ${animationClass}`}
      >
        <span aria-hidden="true">{emoji}</span>
      </div>
      <div className="flex-1">
        <div className="text-2xl sm:text-3xl font-bold text-ohanashi-orange-800">
          {label}
        </div>
        <div className="mt-1 text-base sm:text-lg text-slate-700">
          {/* 状態に応じて短い説明を出します。 */}
          {status === "idle" && "いつでも おしゃべり できるよ。"}
          {status === "listening" && "いま おはなし を きいているよ…"}
          {status === "thinking" && "なんて おへんじしようか な…"}
          {status === "speaking" && "いま おはなし しているよ！"}
        </div>
      </div>
    </div>
  );
};

