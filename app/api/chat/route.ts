export async function POST(req: Request) {
  try {
    const { message, systemPrompt } = await req.json();
    
    // APIキーの前後にあるかもしれない空白を自動で削除します（熟考ポイント1）
    const rawKey = process.env.GEMINI_API_KEY || "";
    const apiKey = rawKey.trim();

    if (!apiKey) {
      return new Response(JSON.stringify({ reply: "サーバー側でAPIキーが読み込めていません。Vercelの設定を確認してください。" }), { status: 500 });
    }

    // モデル名を '-latest' 付きに。URLは最も安定している v1beta を使用（熟考ポイント2）
    const model = "gemini-1.5-flash-latest";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `指示：${systemPrompt}\n\nユーザーメッセージ：${message}` }]
        }]
      })
    });

    const data = await response.json();

    if (data.error) {
      // エラーの詳細をそのまま画面に出すようにして、隠蔽を避けました
      return new Response(JSON.stringify({ 
        reply: `Googleからの応答: ${data.error.message} (Code: ${data.error.code})` 
      }), { status: 500 });
    }

    if (!data.candidates || !data.candidates[0].content) {
      return new Response(JSON.stringify({ reply: "お返事の作成に失敗しました。もう一度送ってみてね。" }), { status: 500 });
    }

    const replyText = data.candidates[0].content.parts[0].text;

    return new Response(JSON.stringify({ reply: replyText }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ reply: "通信中にエラーが発生しました。" }), { status: 500 });
  }
}