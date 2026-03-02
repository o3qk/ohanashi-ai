export async function POST(req: Request) {
  try {
    const { message, systemPrompt } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return new Response(JSON.stringify({ reply: "APIキー未設定" }), { status: 500 });

    // モデル名を 1.5 Flash から、より汎用的な gemini-pro に変更
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `${systemPrompt}\n\nユーザー: ${message}` }]
        }]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      return new Response(JSON.stringify({ reply: `エラー: ${data.error.message}` }), { status: 500 });
    }

    const replyText = data.candidates[0].content.parts[0].text;

    return new Response(JSON.stringify({ reply: replyText }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ reply: "通信エラーです。" }), { status: 500 });
  }
}