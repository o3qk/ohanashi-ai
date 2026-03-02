import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message, systemPrompt } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY?.trim();

    if (!apiKey) {
      return NextResponse.json({ reply: "APIキーが設定されていません。" }, { status: 200 });
    }

    // kさんが成功させた最新の Gemini 3 エンドポイント
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${systemPrompt}\n\nユーザー: ${message}` }] }]
      })
    });

    const data = await res.json();

    if (data.error) {
      return NextResponse.json({ reply: `Googleエラー: ${data.error.message}` }, { status: 200 });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "返答がありませんでした。";
    return NextResponse.json({ reply });

  } catch (error: any) {
    return NextResponse.json({ reply: "通信エラーが発生しました。" }, { status: 200 });
  }
}