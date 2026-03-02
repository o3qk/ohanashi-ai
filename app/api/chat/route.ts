export async function POST(req: Request) {
  const { message, systemPrompt } = await req.json();
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  // 1. URLを「v1」にする
  // 2. モデル名を「gemini-1.5-flash-latest」にする
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${systemPrompt}\n\n${message}` }] }]
    })
  });

  const data = await res.json();
  
  // もしこれでもエラーなら、その「生データ」を全部画面に出します
  if (data.error) {
    return new Response(JSON.stringify({ reply: "Googleエラー詳細: " + JSON.stringify(data.error) }), { status: 200 });
  }

  const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "返答がありませんでした。";
  
  return new Response(JSON.stringify({ reply }), { status: 200 });
}