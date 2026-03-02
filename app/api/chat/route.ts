export async function POST(req: Request) {
  try {
    const { message, systemPrompt } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ reply: "エラー：APIキーが見つかりません。" }), { status: 500 });
    }

    // ライブラリを一切使わない「直結」通信方式
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${systemPrompt}\n\nユーザー: ${message}` }] }]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      return new Response(JSON.stringify({ reply: "ごめんね、Geminiさんの機嫌が悪いみたい。" }), { status: 500 });
    }

    const replyText = data.candidates[0].content.parts[0].text;

    return new Response(JSON.stringify({ reply: replyText }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ reply: "通信がうまくいかなかったみたい。もう一度試してみて！" }), { status: 500 });
  }
}