import React from "react";

type Props = {
  visible: boolean;
};

// 録音中に表示する「波形」風アニメーションです。
// 実際の音量を解析しているわけではありませんが、
// 「いまマイクが動いている」ことが視覚的に伝わるようにしています。
export const ListeningVisualizer: React.FC<Props> = ({ visible }) => {
  if (!visible) return null;

  return (
    <div className="flex items-center gap-2 mt-2">
      <div className="listening-wave h-6 sm:h-8">
        <div className="listening-wave-bar h-full" />
        <div className="listening-wave-bar h-full" />
        <div className="listening-wave-bar h-full" />
        <div className="listening-wave-bar h-full" />
        <div className="listening-wave-bar h-full" />
      </div>
      <span className="text-xs sm:text-sm text-ohanashi-orange-800 font-semibold">
        マイクで ききとり中…
      </span>
    </div>
  );
};

