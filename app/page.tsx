"use client";
// @ts-nocheck

import React, { useState, useEffect, useRef } from "react";

// Googleアイコン（外部から読み込むことでインストール不要に）
const MaterialIcon = ({ name, size = "24px" }) => (
  <span className="material-icons-round" style={{ fontSize: size, display: 'block' }}>{name}</span>
);

const CHARACTERS = {
  hana: { id: "hana", name: "はな", sub: "5歳児", icon: "child_care", color: "#FF7EB9", speaker: 2, prompt: "5歳の女の子として、ひらがな多めで元気いっぱいに答えて。" },
  oneesan: { id: "oneesan", name: "おねえさん", sub: "癒やし", icon: "face_3", color: "#66BB6A", speaker: 14, prompt: "優しいお姉さんとして、癒やしのトーンで話して。" },
  ojisama: { id: "ojisama", name: "おじさま", sub: "紳士", icon: "person_4", color: "#42A5F5", speaker: 13, prompt: "紳士的なおじさまとして、論理的かつ丁寧に話して。" }
};

export default function OhanashiApp() {
  const [selectedChar, setSelectedChar] = useState(CHARACTERS.hana);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

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
    }
  };

  const startListening = () => {
    const W = window as any;
    const SpeechRec = W.SpeechRecognition || W.webkitSpeechRecognition;
    if (!SpeechRec) {
      alert("このブラウザは音声認識に対応していません。");
      return;
    }
    const rec = new SpeechRec();
    rec.lang = "ja-JP";
    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onresult = (e: any) => handleSendMessage(e.results[0][0].transcript);
    rec.start();
  };

  return (
    <div style={{ background: `linear-gradient(135deg, ${selectedChar.color}15 0%, #F8F9FA 100%)`, minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", padding: "16px" }}>
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet" />
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
        .msg-in { animation: fadeIn 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); }
        .typing-dot { width: 6px; height: 6px; background: #BDC3C7; border-radius: 50%; display: inline-block; margin: 0 2px; animation: pulse 1s infinite; }
      `}</style>
      
      <div style={{ width: "100%", maxWidth: "500px", height: "92vh", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)", borderRadius: "32px", display: "flex", flexDirection: "column", boxShadow: "0 20px 50px rgba(0,0,0,0.1)", border: "1px solid rgba(255,255,255,0.4)" }}>
        
        {/* Header: キャラクター選択 */}
        <div style={{ display: "flex", justifyContent: "center", gap: "20px", padding: "20px", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
          {Object.values(CHARACTERS).map((char) => (
            <button key={char.id} onClick={() => setSelectedChar(char)} style={{ border: "none", background: "none", cursor: "pointer", opacity: selectedChar.id === char.id ? 1 : 0.3, transition: "0.3s", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: "50px", height: "50px", borderRadius: "16px", background: char.color, display: "flex", alignItems: "center", justifyContent: "center", color: "white", marginBottom: "4px", boxShadow: selectedChar.id === char.id ? `0 8px 16px ${char.color}44` : "none" }}>
                <MaterialIcon name={char.icon} />
              </div>
              <span style={{ fontSize: "11px", fontWeight: "bold", color: "#444" }}>{char.name}</span>
            </button>
          ))}
        </div>

        {/* Main: チャット履歴 */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {messages.map((m, i) => (
            <div key={i} className="msg-in" style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "85%" }}>
              <div style={{
                background: m.role === "user" ? selectedChar.color : "#FFFFFF",
                color: m.role === "user" ? "white" : "#2C3E50",
                padding: "14px 20px", borderRadius: "20px", fontSize: "16px", fontWeight: "500",
                boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                borderBottomRightRadius: m.role === "user" ? "4px" : "20px",
                borderBottomLeftRadius: m.role === "ai" ? "4px" : "20px"
              }}>
                {m.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div style={{ alignSelf: "flex-start", background: "#FFF", padding: "12px 18px", borderRadius: "20px" }}>
              <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
            </div>
          )}
        </div>

        {/* Footer: 入力欄 */}
        <div style={{ padding: "20px", background: "white", borderTop: "1px solid #F0F0F0", borderRadius: "0 0 32px 32px" }}>
          <div style={{ display: "flex", background: "#F1F3F5", borderRadius: "24px", padding: "6px", alignItems: "center" }}>
            <button onClick={startListening} style={{ border: "none", background: isListening ? "#FF4757" : "transparent", width: "44px", height: "44px", borderRadius: "22px", cursor: "pointer", color: isListening ? "white" : "#7F8C8D", transition: "0.2s" }}>
              <MaterialIcon name={isListening ? "mic_off" : "mic"} />
            </button>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage(inputText)}
              placeholder={`${selectedChar.name}とはなそう...`}
              style={{ flex: 1, border: "none", background: "transparent", padding: "0 12px", fontSize: "16px", outline: "none", color: "#2C3E50" }}
            />
            <button onClick={() => handleSendMessage(inputText)} style={{ border: "none", background: selectedChar.color, color: "white", width: "44px", height: "44px", borderRadius: "22px", cursor: "pointer", boxShadow: `0 4px 10px ${selectedChar.color}44` }}>
              <MaterialIcon name="arrow_upward" />
            </button>
          </div>
        </div>
      </div>
      <audio ref={audioRef} style={{ display: "none" }} />
    </div>
  );
}