import React from "react";

type Props = {
  inputText: string;
  responseText: string;
};

// ユーザーの発話テキストとAIの返答テキストをまとめて表示する領域です。
// 「いま なんて言ったか」「なんて 返してくれたか」を視覚的に確認できます。
export const ConversationPanel: React.FC<Props> = ({
  inputText,
  responseText
}) => {
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="bg-white/80 rounded-2xl p-3 sm:p-4 border border-ohanashi-orange-100">
        <div className="text-xs sm:text-sm font-semibold text-ohanashi-orange-600 mb-1">
          あなたの ことば
        </div>
        <div className="min-h-[3rem] text-lg sm:text-2xl">
          {inputText || (
            <span className="text-slate-400 text-base sm:text-lg">
              マイクで 話すか、したの いれもの に 文字をいれてね。
            </span>
          )}
        </div>
      </div>
      <div className="bg-white rounded-2xl p-3 sm:p-4 border-2 border-ohanashi-yellow-200">
        <div className="text-xs sm:text-sm font-semibold text-ohanashi-orange-700 mb-1">
          お話AI からの おへんじ
        </div>
        <div className="min-h-[3rem] text-lg sm:text-2xl">
          {responseText || (
            <span className="text-slate-400 text-base sm:text-lg">
              ここに おへんじ が でてくるよ。
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

