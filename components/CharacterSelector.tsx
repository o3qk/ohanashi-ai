import React from "react";

// アプリ内で扱うキャラクターIDの型です。
export type CharacterId = "hana" | "neighbor" | "uncle";

type Props = {
  value: CharacterId;
  onChange: (value: CharacterId) => void;
};

// キャラクター選択用の巨大ボタンコンポーネントです。
// 押し間違えしにくいように、かなり大きめのボタンとしています。
export const CharacterSelector: React.FC<Props> = ({ value, onChange }) => {
  const baseButtonClass =
    "flex-1 px-4 py-4 sm:py-5 rounded-2xl border-4 text-xl sm:text-2xl font-bold transition transform";

  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
      <button
        type="button"
        className={`${baseButtonClass} ${
          value === "hana"
            ? "bg-ohanashi-orange-500 border-ohanashi-yellow-300 text-white scale-105 shadow-lg"
            : "bg-white border-ohanashi-orange-300 text-ohanashi-orange-700"
        }`}
        onClick={() => onChange("hana")}
      >
        はなちゃん
        <span className="block text-sm sm:text-base font-normal mt-1">
          元気な5さい
        </span>
      </button>
      <button
        type="button"
        className={`${baseButtonClass} ${
          value === "neighbor"
            ? "bg-ohanashi-yellow-400 border-ohanashi-orange-300 text-ohanashi-orange-900 scale-105 shadow-lg"
            : "bg-white border-ohanashi-yellow-300 text-ohanashi-orange-700"
        }`}
        onClick={() => onChange("neighbor")}
      >
        近所のおねえさん
        <span className="block text-sm sm:text-base font-normal mt-1">
          やさしい話し方
        </span>
      </button>
      <button
        type="button"
        className={`${baseButtonClass} ${
          value === "uncle"
            ? "bg-white border-ohanashi-orange-600 text-ohanashi-orange-800 scale-105 shadow-lg"
            : "bg-white border-ohanashi-orange-300 text-ohanashi-orange-700"
        }`}
        onClick={() => onChange("uncle")}
      >
        おじさま
        <span className="block text-sm sm:text-base font-normal mt-1">
          あたまのいいおじさん
        </span>
      </button>
    </div>
  );
};

