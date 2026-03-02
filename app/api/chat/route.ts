export async function POST(req: Request) {
  const { message, systemPrompt } = await req.json();
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  // AI Studioが成功しているなら、このURLとこの形式で必ず通ります
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${systemPrompt}\n\n${message}` }] }]
    })
  });

  const data = await res.json();

  // 余計な加工をせず、Googleの返答をそのままフロントエンドに流します
  const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "エラー: " + JSON.stringify(data);
  
  return new Response(JSON.stringify({ reply }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}