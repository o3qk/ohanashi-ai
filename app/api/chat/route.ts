// @ts-nocheck
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { message, systemPrompt } = await req.json();
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent([
      { text: systemPrompt },
      { text: message }
    ]);
    
    return Response.json({ reply: result.response.text() });
  } catch (error) {
    return Response.json({ reply: "エラーが発生しました。" }, { status: 500 });
  }
}