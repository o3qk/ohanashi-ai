export async function POST(req: Request) {
  try {
    const { message, systemPrompt } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ reply: "APIキーが設定されていません。" }), { status: 500 });
    }

    // AIza...で始まるキーに最適な「安定版」の通信URL
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: `指示：${systemPrompt}` }] },
          { role: "user", parts: [{ text: message }] }
        ]
      })
    });

    const data = await response.json();
    
    // エラー内容をより詳しくチェック
    if (data.error) {
      console.error("Google API Error:", data.error);
      return new Response(JSON.stringify({ reply: "認証エラーが起きたみたい。APIキーを確認してみてね。" }), { status: 500 });
    }

    const replyText = data.candidates[0].content.parts[0].text;

    return new Response(JSON.stringify({ reply: replyText }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ reply: "通信がうまくいかなかったみたい。ごめんね。" }), { status: 500 });
  }
}