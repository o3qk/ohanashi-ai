"use client";

import React, { useState, useEffect, useRef } from "react";

// Googleアイコンの定義
const MaterialIcon = ({ name, size = "24px", color = "inherit" }: { name: string, size?: string, color?: string }) => (
  <span className="material-icons-round" style={{ fontSize: size, color: color, display: 'block' }}>{name}</span>
);

const CHARACTERS = {
  hana: { id: "hana", name: "はなちゃん", sub: "5さいの女の子", icon: "child_care", color: "#FF7EB9", speaker: 2, prompt: "5歳の女の子として、ひらがな多めで元気いっぱいに答えて。" },
  oneesan: { id: "oneesan", name: "おねえさん", sub: "近所の優しい人", icon: "face_3", color: "#66BB6A", speaker: 14, prompt: "優しいお姉さんとして、癒やしのトーンではなして。" },
  ojisama: { id: "ojisama", name: "おじさま", sub: "知的で紳士的", icon: "person_4", color: "#42A5F5", speaker: 13, prompt: "紳士的なおじさまとして、論理的かつ丁寧に話して。" }
};

export default function OhanashiApp() {
  const [selectedChar, setSelectedChar] = useState(CHARACTERS.hana);
  const [messages, setMessages] = useState<{role: string, text: string}[]>([]);
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  // 通信部分：kさんの環境で動いていたシンプルな形に固定
  const handleSendMessage = async (text: string) => {
    if (!text?.trim()) return;
    setMessages(prev => [...prev, { role: "user", text }]);
    setInputText("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, systemPrompt: selectedChar.prompt }) 
      });
      const data = await res.json();
      setIsTyping(false);
      setMessages(prev => [...prev, { role: "ai", text: data.reply }]);
      
      const voiceUrl = `https://api.tts.quest/v3/voicevox/synthesis?text=${encodeURIComponent(data.reply)}&speaker=${selectedChar.speaker}`;
      if (audioRef.current) {
        audioRef.current.src = voiceUrl;
        audioRef.current.play().catch(() => {});
      }
    } catch (e) {
      setIsTyping(false);
      setMessages(prev => [...prev, { role: "ai", text: "おはなしの準備ができませんでした。少し待ってね。" }]);
    }
  };

  // 音声認識：ビルドエラーを防ぐための厳格な型回避
  const startListening = () => {
    if (typeof window === "undefined") return;
    const anyWindow = window as any;
    const SpeechRecognition = anyWindow.SpeechRecognition || anyWindow.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("ブラウザが対応していません。Chromeをお使いください。");
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = "ja-JP";
    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onresult = (e: any) => {
      const result = e.results[0][0].transcript;
      if (result) handleSendMessage(result);
    };
    rec.start();
  };

  return (
    <div style={{ background: "#F8F9FA", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: "100px" }}>
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet" />
      
      {/* キャラクター選択：大きく押しやすく調整 */}
      <div style={{ width: "100%", maxWidth: "500px", display: "flex", gap: "10px", padding: "20px", position: "sticky", top: 0, background: "#F8F9FAee", zIndex: 10 }}>
        {Object.values(CHARACTERS).map((char) => (
          <button key={char.id} onClick={() => setSelectedChar(char)} style={{ flex: 1, padding: "15px 5px", border: "none", borderRadius: "20px", background: selectedChar.id === char.id ? "white" : "transparent", boxShadow: selectedChar.id === char.id ? "0 4px 15px rgba(0,0,0,0.1)" : "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", transition: "0.2s", borderBottom: selectedChar.id === char.id ? `4px solid ${char.color}` : "none" }}>
            <MaterialIcon name={char.icon} size="42px" color={selectedChar.id === char.id ? char.color : "#BDC3C7"} />
            <span style={{ fontSize: "14px", fontWeight: "bold", marginTop: "5px", color: selectedChar.id === char.id ? "#333" : "#BDC3C7" }}>{char.name}</span>
          </button>
        ))}
      </div>

      {/* チャット履歴エリア */}
      <div ref={scrollRef} style={{ flex: 1, width: "100%", maxWidth: "500px", padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "15px" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "85%", background: m.role === "user" ? selectedChar.color : "white", color: m.role === "user" ? "white" : "#333", padding: "15px 20px", borderRadius: "25px", boxShadow: "0 2px 10px rgba(0,0,0,0.03)", fontSize: "16px", fontWeight: 500 }}>
            {m.text}
          </div>
        ))}
        {isTyping && <div style={{ color: "#BDC3C7", paddingLeft: "10px", fontSize: "14px" }}>考え中...</div>}
      </div>

      {/* 操作パネル：大きなマイクボタン */}
      <div style={{ position: "fixed", bottom: "20px", width: "95%", maxWidth: "500px", zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "white", padding: "10px", borderRadius: "40px", boxShadow: "0 15px 40px rgba(0,0,0,0.1)" }}>
          <input 
            value={inputText} 
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage(inputText)}
            placeholder={`${selectedChar.name}とはなそう`}
            style={{ flex: 1, border: "none", padding: "0 20px", fontSize: "16px", outline: "none" }}
          />
          <button 
            onClick={startListening}
            style={{ width: "64px", height: "64px", borderRadius: "32px", border: "none", background: isListening ? "#FF4757" : selectedChar.color, color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 15px ${selectedChar.color}44` }}
          >
            <MaterialIcon name={isListening ? "stop" : "mic"} size="32px" />
          </button>
        </div>
      </div>

      <audio ref={audioRef} />
    </div>
  );
}