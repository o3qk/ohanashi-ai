import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// キャラクターIDの型定義です。フロントと合わせておきます。
type CharacterId = "hana" | "neighbor" | "uncle";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// キャラクターごとの話し方を system プロンプトとして定義します。
function buildSystemPrompt(character: CharacterId): string {
  if (character === "hana") {
    return [
      "あなたは5歳の女の子「はなちゃん」です。",
      "元気で明るいタメ口で話します。",
      "むずかしい言葉はなるべく使わず、「〜だよ」「〜なの？」のような子どもっぽい口調にしてください。",
      "話す文章はできるだけ短く、やさしく、楽しくしてください。"
    ].join("\n");
  }

  if (character === "neighbor") {
    return [
      "あなたは近所の仲のいい女性です。",
      "やさしくフレンドリーな話し方をします。",
      "ていねいすぎない敬語をまじえながら、親しみやすい日本語で話してください。",
      "5歳の子どもにも分かるように、むずかしい話はかみくだいて説明してください。"
    ].join("\n");
  }

  // uncle
  return [
    "あなたは頭脳明晰なおじさまです。",
    "おだやかでていねいな話し方をします。",
    "ただし5歳の子どもにも分かるように、むずかしい言葉はやさしい表現に言いかえてください。",
    "上から目線にならず、やさしくたのしく会話してください。"
  ].join("\n");
}

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      {
        text:
          "ごめんね、AIと おはなし する じゅんびが まだ できていないみたい…。おとなの人に せつび を みなおしてもらってね。"
      },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const messages = body.messages as
      | { role: "user" | "assistant" | "system"; content: string }[]
      | undefined;
    const characterId = (body.characterId ?? "hana") as CharacterId;

    const userMessage = messages?.[0]?.content ?? "";
    if (!userMessage) {
      return NextResponse.json(
        { text: "なにか おはなし を してみてね。" },
        { status: 200 }
      );
    }

    const systemContent = buildSystemPrompt(characterId);

    const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemContent },
        { role: "user", content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 256
    });

    const text =
      completion.choices[0]?.message?.content ??
      "ごめんね、うまく おへんじ が できなかったみたい…。";

    return NextResponse.json({ text });
  } catch (error) {
    console.error("/api/chat error", error);
    return NextResponse.json(
      {
        text:
          "ごめんね、いま AI が ちょっと つかれているみたい…。すこし まってから、もういちど ためしてみてね。"
      },
      { status: 500 }
    );
  }
}

