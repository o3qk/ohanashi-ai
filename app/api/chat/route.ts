import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { message, systemPrompt } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ reply: "APIキーが設定されていません。" }), { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 動いていた時と同じ「一つの文字列」として送る形式に戻しました
    const result = await model.generateContent(systemPrompt + "\n\n" + message);
    const response = await result.response;
    
    return new Response(JSON.stringify({ reply: response.text() }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ reply: "ごめんね、いまお話しできないみたい。もう一度試してみて！" }), { status: 500 });
  }
}