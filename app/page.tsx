"use client";
// @ts-nocheck

import React, { useState, useEffect, useRef } from "react";

// Google Material Iconsを外部から読み込み（インストール不要）
const MaterialIcon = ({ name, size = "24px", color = "inherit" }) => (
  <span className="material-icons-round" style={{ fontSize: size, color: color, display: 'block' }}>{name}</span>
);

const CHARACTERS = {
  hana: { id: "hana", name: "はなちゃん", sub: "5さいの女の子", icon: "child_care", color: "#FF7EB9", speaker: 2, prompt: "5歳の女の子として、ひらがな多めで元気いっぱいに答えて。語尾は「〜だよ」「〜なの」。" },
  oneesan: { id: "oneesan", name: "おねえさん", sub: "近所の優しい人", icon: "face_3", color: "#66BB6A", speaker: 14, prompt: "優しいお姉さんとして、癒やしのトーンで丁寧にはなして。" },
  ojisama: { id: "ojisama", name: "おじさま", sub: "知的で紳士的", icon: "person_4", color: "#42A5F5", speaker: 13, prompt: "紳士的なおじさまとして、論理的かつ丁寧に話して。" }
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
    const W = window;
    const SpeechRec = W.SpeechRecognition || W.webkitSpeechRecognition;
    if (!SpeechRec) {
      alert("このブラウザは音声認識に対応していません。Chromeなどをお使いください。");
      return;
    }
    const rec = new SpeechRec();
    rec.lang = "ja-JP";
    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onresult = (e) => handleSendMessage(e.results[0][0].transcript);
    rec.start();
  };

  return (
    <div style={{ background: `linear-gradient(135deg, ${selectedChar.color}10 0%, #F5F7FA 100%)`, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", fontFamily: "'Hiragino Kaku Gothic ProN', sans-serif", paddingBottom: "120px" }}>
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet" />
      <style>{`
        @keyframes msgIn { from { opacity: 0; transform: translateY(15px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes pulseMic { 0% { box-shadow: 0 0 0 0 ${selectedChar.color}66; } 70% { box-shadow: 0 0 0 15px ${selectedChar.color}00; } 100% { box-shadow: 0 0 0 0 ${selectedChar.color}00; } }
        @keyframes typing { 0%, 100% { transform: translateY(0); opacity: 0.5; } 50% { transform: translateY(-5px); opacity: 1; } }
        .msg-in { animation: msgIn 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
        .char-btn { transition: all 0.3s ease; }
        .char-btn:hover { transform: translateY(-3px); }
        .typing-dot { width: 8px; height: 8px; background: #BDC3C7; border-radius: 50%; display: inline-block; margin: 0 3px; animation: typing 1s infinite; }
      `}</style>
      
      {/* キャラクター選択セクション (上部に固定、少し大きく) */}
      <div style={{ width: "100%", maxWidth: "600px", padding: "30px 20px", display: "flex", justifyContent: "space-around", gap: "15px", position: "sticky", top: 0, zIndex: 10, background: "rgba(245, 247, 250, 0.8)", backdropFilter: "blur(10px)" }}>
        {Object.values(CHARACTERS).map((char) => (
          <button key={char.id} onClick={() => setSelectedChar(char)} className="char-btn" style={{ border: "none", background: selectedChar.id === char.id ? "white" : "rgba(255,255,255,0.5)", cursor: "pointer", flex: 1, padding: "20px", borderRadius: "24px", display: "flex", flexDirection: "column", alignItems: "center", boxShadow: selectedChar.id === char.id ? "0 10px 25px rgba(0,0,0,0.05)" : "0 4px 10px rgba(0,0,0,0.02)", outline: selectedChar.id === char.id ? `2px solid ${char.color}` : "none" }}>
            {/* アイコンサイズを大きく (32px -> 48px) */}
            <div style={{ width: "70px", height: "70px", borderRadius: "20px", background: `${char.color}15`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "10px" }}>
              <MaterialIcon name={char.icon} size="48px" color={char.color} />
            </div>
            <span style={{ fontSize: "14px", fontWeight: "bold", color: "#333", marginBottom: "2px" }}>{char.name}</span>
            <span style={{ fontSize: "11px", color: "#777" }}>{char.sub}</span>
          </button>
        ))}
      </div>

      {/* チャットエリア (背景を白に、影を薄くして浮かせる) */}
      <div ref={scrollRef} style={{ width: "100%", maxWidth: "600px", flex: 1, display: "flex", flexDirection: "column", gap: "20px", padding: "20px" }}>
        {messages.map((m, i) => (
          <div key={i} className="msg-in" style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "80%" }}>
            <div style={{
              background: m.role === "user" ? selectedChar.color : "#FFFFFF",
              color: m.role === "user" ? "white" : "#2C3E50",
              padding: "16px 22px", borderRadius: "25px", fontSize: "16px", fontWeight: "500", lineHeight: "1.6",
              boxShadow: "0 5px 15px rgba(0,0,0,0.03)",
              borderBottomRightRadius: m.role === "user" ? "5px" : "25px",
              borderBottomLeftRadius: m.role === "ai" ? "5px" : "25px"
            }}>
              {m.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div style={{ alignSelf: "flex-start", background: "#FFF", padding: "15px 20px", borderRadius: "20px", boxShadow: "0 5px 15px rgba(0,0,0,0.03)" }}>
            <div className="typing-dot" /><div className="typing-dot" style={{animationDelay: "0.2s"}}/><div className="typing-dot" style={{animationDelay: "0.4s"}}/>
          </div>
        )}
      </div>

      {/* フローティング「話すボタン」セクション (下部に固定) */}
      <div style={{ position: "fixed", bottom: 0, width: "100%", display: "flex", justifyContent: "center", padding: "20px", zIndex: 100 }}>
        <div style={{ width: "100%", maxWidth: "600px", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(15px)", borderRadius: "30px", padding: "15px", boxShadow: "0 -10px 30px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: "10px" }}>
          
          {/* テキスト入力欄 (マイクの横に配置) */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage(inputText)}
            placeholder={`${selectedChar.name}とはなそう...`}
            style={{ flex: 1, border: "none", background: "#F1F3F5", padding: "15px 20px", borderRadius: "20px", fontSize: "16px", outline: "none", color: "#2C3E50" }}
          />

          {/* 明確な「話すボタン」 (大きく、アニメーション付き) */}
          <button 
            onClick={startListening} 
            style={{ 
              border: "none", 
              background: selectedChar.color, 
              width: "60px", 
              height: "60px", 
              borderRadius: "30px", 
              cursor: "pointer", 
              color: "white", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              boxShadow: `0 8px 20px ${selectedChar.color}55`,
              animation: isListening ? `pulseMic 1.5s infinite` : "none",
              transition: "transform 0.2s ease"
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.95)"}
            onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            <MaterialIcon name={isListening ? "mic_off" : "mic"} size="32px" />
          </button>
        </div>
      </div>

      <audio ref={audioRef} style={{ display: "none" }} />
    </div>
  );
}