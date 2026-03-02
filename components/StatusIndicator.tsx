import React from "react";
import type { ConversationStatus } from "./CharacterAvatar";

type Props = {
  status: ConversationStatus;
};

// 現在の状態（待機中 / 聞き取り中 / 考え中 / お話し中）を
// テキストと色でわかりやすく表示するコンポーネントです。
export const StatusIndicator: React.FC<Props> = ({ status }) => {
  let label = "待機中";
  let colorClass = "bg-slate-200 text-slate-800";

  if (status === "listening") {
    label = "聞いています…";
    colorClass = "bg-emerald-200 text-emerald-900";
  } else if (status === "thinking") {
    label = "考え中…";
    colorClass = "bg-sky-200 text-sky-900";
  } else if (status === "speaking") {
    label = "お話し中…";
    colorClass = "bg-ohanashi-orange-300 text-ohanashi-orange-900";
  }

  return (
    <div
      className={`inline-flex items-center px-4 py-2 rounded-full text-sm sm:text-base font-semibold ${colorClass}`}
    >
      <span className="mr-2 w-2 h-2 rounded-full bg-current" />
      {label}
    </div>
  );
};

