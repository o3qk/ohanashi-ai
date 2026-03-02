export async function POST(req: Request) {
  try {
    const { message, systemPrompt } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ reply: "APIキーが設定されていません。" }), { status: 500 });
    }

    // エラーの原因だった「v1beta」を、推奨されている「v1」に修正しました
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

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
      return new Response(JSON.stringify({ 
        reply: `Googleエラー: ${data.error.message}` 
      }), { status: 500 });
    }

    const replyText = data.candidates[0].content.parts[0].text;

    return new Response(JSON.stringify({ reply: replyText }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ reply: "エラーが起きました。もう一度試してね。" }), { status: 500 });
  }
}