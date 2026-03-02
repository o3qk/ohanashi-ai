import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message, systemPrompt } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY?.trim();

    if (!apiKey) {
      return NextResponse.json({ reply: "APIキーが設定されていません。" }, { status: 200 });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${systemPrompt}\n\nユーザー: ${message}` }] }]
      })
    });

    const data = await res.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "お返事できなくてごめんね。";
    return NextResponse.json({ reply });

  } catch (error: any) {
    return NextResponse.json({ reply: "エラーが発生しました。" }, { status: 200 });
  }
}