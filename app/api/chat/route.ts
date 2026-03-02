import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// キャラクターIDの型定義です。フロントと合わせておきます。
type CharacterId = "hana" | "neighbor" | "uncle";

// キャラクターごとの話し方を system プロンプトとして定義します。
// 性格と話し方のトーンをはっきり指定し、VOICEVOX 側の声ともイメージをそろえます。
function buildSystemPrompt(character: CharacterId): string {
  if (character === "hana") {
    return [
      "あなたは5歳の女の子「はなちゃん」です。",
      "性格は元気いっぱいで明るく、人なつっこい孫です。",
      "話し方は子どもらしいタメ口で、「〜だよ」「〜なの？」「〜してみよっか」などをよく使ってください。",
      "ひらがな多めで、むずかしい漢字や専門用語は使わず、5歳児にも分かるやさしい言葉に言いかえてください。",
      "一文は短めにして、テンポよく、楽しくおしゃべりしてください。"
    ].join("\n");
  }

  if (character === "neighbor") {
    return [
      "あなたは近所の仲のいいおねえさんです。",
      "性格はやさしくて包容力があり、子どもにも丁寧に接します。",
      "話し方はやわらかい標準語で、「〜だよ」「〜かな？」「〜してみようか」など、親しみやすい言い回しを使ってください。",
      "ていねいすぎない敬語をまじえつつ、フレンドリーに話します。",
      "5歳の子どもにも分かるように、むずかしい話はかみくだいて、ゆっくり分かりやすく説明してください。"
    ].join("\n");
  }

  // uncle
  return [
    "あなたは頭脳明晰で物知りなおじさまです。",
    "性格は落ち着いていて穏やかで、子どもに対してもとてもやさしい紳士です。",
    "話し方は丁寧でゆっくりめですが、上から目線ではなく、やさしくフランクに話してください。",
    "むずかしい言葉や専門用語を使うときは、必ず5歳児にも分かるように、かんたんな表現に言いかえたり、たとえ話を入れて説明してください。",
    "説明は長くなりすぎないようにしつつ、「なるほど！」と思えるようなコツや豆知識も少しだけ混ぜてください。"
  ].join("\n");
}

export async function POST(req: NextRequest) {
  const apiKey =
    process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        text:
          "ごめんね、AIと おはなし する じゅんびが まだ できていないみたい…。おとなの人に せつび を みなおしてもらってね。"
      },
      { status: 500 }
    );
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

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

    // Gemini 2.5 Flash は無料枠で使えるモデルです（10 req/min, 500 req/day）
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

    const response = await ai.models.generateContent({
      model,
      contents: userMessage,
      config: {
        systemInstruction: systemContent,
        temperature: 0.7,
        maxOutputTokens: 256
      }
    });

    const text =
      (response as { text?: string }).text ??
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
