"use client";
// @ts-nocheck

import React, { useState, useEffect, useRef } from "react";

const MaterialIcon = ({ name, size = "24px" }) => (
  <span className="material-icons-round" style={{ fontSize: size }}>{name}</span>
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
  const audioRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (text) => {
    if (!text?.trim()) return;
    setMessages(prev => [...prev, { role: "user", text }]);
    setInputText("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", { method: "POST", body: JSON.stringify({ message: text, systemPrompt: selectedChar.prompt }) });
      const data = await res.json();
      setIsTyping(false);
      setMessages(prev => [...prev, { role: "ai", text: data.reply }]);
      const voiceUrl = `https://api.tts.quest/v3/voicevox/synthesis?text=${encodeURIComponent(data.reply)}&speaker=${selectedChar.speaker}`;
      if (audioRef.current) { audioRef.current.src = voiceUrl; audioRef.current.play(); }
    } catch (e) { setIsTyping(false); }
  };

  return (
    <div className="app-container" style={{ background: `linear-gradient(135deg, ${selectedChar.color}11 0%, #FFFFFF 100%)`, minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" }}>
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet" />
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        .bubble-ai { animation: fadeIn 0.4s ease-out; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.03); }
        .bubble-user { animation: fadeIn 0.3s ease-out; box-shadow: 0 4px 15px rgba(0,122,255,0.2); }
        .char-card { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .char-card:hover { transform: translateY(-5px); }
        .typing-dot { width: 6px; height: 6px; background: #999; border-radius: 50%; display: inline-block; margin-right: 3px; animation: bounce 1s infinite; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #E0E0E0; border-radius: 10px; }
      `}</style>
      
      <div style={{ width: "100%", maxWidth: "480px", height: "90vh", background: "rgba(255,255,255,0.8)", backdropFilter: "blur(20px)", borderRadius: "40px", border: "1px solid rgba(255,255,255,0.5)", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 30px 60px rgba(0,0,0,0.12)" }}>
        
        {/* キャラクターナビ（フローティング風） */}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "25px 30px", background: "rgba(255,255,255,0.5)" }}>
          {Object.values(CHARACTERS).map((char) => (
            <div key={char.id} onClick={() => setSelectedChar(char)} className="char-card" style={{ cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", opacity: selectedChar.id === char.id ? 1 : 0.4 }}>
              <div style={{ width: "55px", height: "55px", borderRadius: "20px", background: char.color, display: "flex", alignItems: "center", justifyContent: "center", color: "white", boxShadow: selectedChar.id === char.id ? `0 10px 20px ${char.color}66` : "none" }}>
                <MaterialIcon name={char.icon} size="28px" />
              </div>
              <span style={{ fontSize: "11px", fontWeight: "800", marginTop: "8px", color: "#333" }}>{char.name}</span>
            </div>
          ))}
        </div>

        {/* チャットエリア（透過とグラデーション） */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "20px 25px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {messages.map((m, i) => (
            <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "85%" }}>
              <div className={m.role === "user" ? "bubble-user" : "bubble-ai"} style={{
                background: m.role === "user" ? `linear-gradient(135deg, ${selectedChar.color}, ${selectedChar.color}dd)` : "#FFFFFF",
                color: m.role === "user" ? "white" : "#2C2C2E",
                padding: "16px 22px", borderRadius: "25px", fontSize: "16px", fontWeight: "500", lineHeight: "1.6",
                borderBottomRightRadius: m.role === "user" ? "4px" : "25px",
                borderBottomLeftRadius: m.role === "ai" ? "4px" : "25px",
              }}>
                {m.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="bubble-ai" style={{ alignSelf: "flex-start", background: "#FFFFFF", padding: "12px 20px", borderRadius: "20px" }}>
              <div className="typing-dot" />
              <div className="typing-dot" style={{ animationDelay: "0.2s" }} />
              <div className="typing-dot" style={{ animationDelay: "0.4s" }} />
            </div>
          )}
        </div>

        {/* 入力エリア（スマホアプリUI風） */}
        <div style={{ padding: "25px", background: "white" }}>
          <div style={{ display: "flex", background: "#F2F2F7", borderRadius: "30px", padding: "8px", alignItems: "center", boxShadow: "inset 0 2px 5px rgba(0,0,0,0.05)" }}>
            <button
              onClick={() => {
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                const rec = new SpeechRecognition();
                rec.lang = "ja-JP";
                rec.onstart = () => setIsListening(true);
                rec.onend = () => setIsListening(false);
                rec.onresult = (e) => handleSendMessage(e.results[0][0].transcript);
                rec.start();
              }}
              style={{ border: "none", background: isListening ? "#FF3B30" : "transparent", width: "45px", height: "45px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: isListening ? "white" : "#8E8E93", transition: "0.3s" }}
            >
              <MaterialIcon name={isListening ? "mic_off" : "mic"} />
            </button>
            
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage(inputText)}
              placeholder={`${selectedChar.name}に話しかける...`}
              style={{ flex: 1, border: "none", background: "transparent", padding: "0 15px", fontSize: "16px", outline: "none", color: "#1C1C1E" }}
            />
            
            <button
              onClick={() => handleSendMessage(inputText)}
              style={{ border: "none", background: selectedChar.color, color: "white", width: "45px", height: "45px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: `0 8px 15px ${selectedChar.color}44` }}
            >
              <MaterialIcon name="arrow_upward" />
            </button>
          </div>
        </div>
      </div>
      <audio ref={audioRef} style={{ display: "none" }} />
    </div>
  );
}