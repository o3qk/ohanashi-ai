export async function POST(req: Request) {
  try {
    const { message, systemPrompt } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY?.trim();

    if (!apiKey) {
      return new Response(JSON.stringify({ reply: "【原因1】VercelにAPIキーが設定されていないか、読み込めていません。" }), { status: 200 });
    }

    // 2026年現在、最も汎用的なモデル名とエンドポイントです
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${systemPrompt}\n\nユーザー: ${message}` }] }]
      })
    });

    const data = await response.json();

    // Google側でエラーが発生した場合、その内容をそのまま返します
    if (data.error) {
      return new Response(JSON.stringify({ 
        reply: `【原因2】Googleがエラーを返しました：${data.error.message} (コード: ${data.error.code})` 
      }), { status: 200 });
    }

    if (!data.candidates || !data.candidates[0].content) {
      return new Response(JSON.stringify({ 
        reply: "【原因3】Googleから有効な回答が返ってきませんでした。内容が制限に抵触した可能性があります。" 
      }), { status: 200 });
    }

    const replyText = data.candidates[0].content.parts[0].text;
    return new Response(JSON.stringify({ reply: replyText }), { status: 200 });

  } catch (error: any) {
    // 通信自体が失敗した場合
    return new Response(JSON.stringify({ 
      reply: `【原因4】通信エラーが発生しました：${error.message}` 
    }), { status: 200 });
  }
}