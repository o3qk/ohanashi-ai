import React from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
};

// テキストで会話したいときに使う入力欄です。
// Enter で送信、Shift+Enter で改行できるようにしています。
export const TextInputArea: React.FC<Props> = ({
  value,
  onChange,
  onSubmit,
  disabled
}) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!disabled) {
        onSubmit();
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl p-3 sm:p-4 border border-ohanashi-orange-100">
      <label className="block text-xs sm:text-sm font-semibold text-ohanashi-orange-700 mb-2">
        文字で はなす
      </label>
      <textarea
        className="w-full resize-none rounded-xl border-2 border-ohanashi-orange-200 focus:border-ohanashi-orange-400 focus:outline-none px-3 sm:px-4 py-2 sm:py-3 text-lg sm:text-2xl leading-relaxed"
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="ここに 文字で はなしかけても いいよ。（Enter で そうしん）"
        disabled={disabled}
      />
      <div className="mt-2 flex justify-end">
        <button
          type="button"
          onClick={onSubmit}
          disabled={disabled}
          className="px-6 sm:px-8 py-2 sm:py-3 rounded-full text-xl sm:text-2xl font-bold bg-ohanashi-orange-500 text-white hover:bg-ohanashi-orange-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition"
        >
          そうしん
        </button>
      </div>
      <p className="mt-1 text-xs sm:text-sm text-slate-500">
        Enterキー だけで そうしん、Shift + Enter で かいぎょう できます。
      </p>
    </div>
  );
};

