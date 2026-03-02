import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { message, systemPrompt } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return new Response(JSON.stringify({ reply: "APIキー未設定" }), { status: 500 });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 一番シンプルでエラーの出にくい呼び出し方
    const result = await model.generateContent(systemPrompt + "\n\n" + message);
    const response = await result.response;
    
    return new Response(JSON.stringify({ reply: response.text() }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ reply: "ごめんね、いまお話しできないみたい。もう一度試してみて！" }), { status: 500 });
  }
}