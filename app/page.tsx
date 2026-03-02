// app/page.tsx (入力欄の例)
<input
  id="chat-input"    // 追加
  name="chat-input"  // 追加
  type="text"
  value={message}
  onChange={(e) => setMessage(e.target.value)}
  placeholder="はなちゃんにお話ししてね..."
  // ...他の属性
/>