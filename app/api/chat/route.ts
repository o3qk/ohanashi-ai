export async function POST(req: Request) {
  try {
    const { message, systemPrompt } = await req.json();
    
    // Vercelに設定した GEMINI_API_KEY を直接指定します
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ reply: "サーバー側でAPIキーが読み込めていません。" }), { status: 500 });
    }

    // Google AI StudioのGemini APIに直接リクエストを送るURL
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `${systemPrompt}\n\nユーザーのメッセージ: ${message}` }]
        }]
      })
    });

    const data = await response.json();

    // Googleからエラーが返ってきた場合
    if (data.error) {
      console.error("Google API Error Detail:", data.error);
      return new Response(JSON.stringify({ 
        reply: `Googleさんからエラーが返りました: ${data.error.message}` 
      }), { status: 500 });
    }

    const replyText = data.candidates[0].content.parts[0].text;

    return new Response(JSON.stringify({ reply: replyText }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ reply: "プログラムの実行中にエラーが起きました。" }), { status: 500 });
  }
}