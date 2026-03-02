// 会話API(`/api/chat`) を呼び出すためのユーティリティです。
// 画面側ではこの関数だけを呼べばよいようにして、fetch の細かい処理を隠しています。

import type { ReplyMode } from "@/components/ControlPanel";
import type { CharacterId } from "@/components/CharacterSelector";

export type ChatResponse = {
  text: string;
};

export async function sendChat(params: {
  message: string;
  character: CharacterId;
  replyMode: ReplyMode;
}): Promise<ChatResponse> {
  const { message, character, replyMode } = params;

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: message
          }
        ],
        characterId: character,
        replyMode
      })
    });

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }

    const data = (await res.json()) as ChatResponse;
    return data;
  } catch (error) {
    // エラー時は、子どもにも分かるやさしい文章を返します。
    console.error("chat error", error);
    return {
      text:
        "ごめんね、いま うまく おはなし が できなかったみたい…。すこし まってから、もういちど ためしてみてね。"
    };
  }
}

