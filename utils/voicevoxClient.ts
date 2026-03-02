// utils/voicevoxClient.ts 内の audio 設定部分

const audio = new Audio();
// https への置換を念のため追加
audio.src = data.mp3StreamingUrl!.replace("http://", "https://");

// 重要：crossOrigin を一旦外す（または 'anonymous' を維持しつつサーバー側でCORS許可）
// 今回はシンプルに削除して試すのが一番早いです
// audio.crossOrigin = "anonymous";