export async function POST(req: Request) {
  try {
    const { message, systemPrompt } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY?.trim();

    if (!apiKey) return new Response(JSON.stringify({ reply: "APIキー未設定" }), { status: 200 });

    // kさんの成功コードに基づき、モデルを gemini-3-flash-preview に変更
    // URLも最新の Gemini 3 世代が動作するエンドポイントに固定します
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${systemPrompt}\n\n${message}` }] }],
        // AI Studioのコードにあった Google Search 機能なども必要に応じてここに追加可能です
      })
    });

    const data = await res.json();
    
    if (data.error) {
      return new Response(JSON.stringify({ reply: "Googleエラー: " + data.error.message }), { status: 200 });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "お返事がありませんでした。";
    return new Response(JSON.stringify({ reply }), { status: 200 });

  } catch (error: any) {
    return new Response(JSON.stringify({ reply: "通信エラーが発生しました。" }), { status: 200 });
  }
}