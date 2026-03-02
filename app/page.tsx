"use client";
// @ts-nocheck

import React, { useState, useEffect, useRef } from "react";

const MaterialIcon = ({ name, size = "24px", color = "inherit" }) => (
  <span className="material-icons-round" style={{ fontSize: size, color: color, display: 'block' }}>{name}</span>
);

const CHARACTERS = {
  hana: { id: "hana", name: "はなちゃん", sub: "5さい", icon: "child_care", color: "#FF7EB9", speaker: 2, prompt: "5歳の女の子として、ひらがな多めで元気いっぱいに答えて。" },
  oneesan: { id: "oneesan", name: "おねえさん", sub: "優しい", icon: "face_3", color: "#66BB6A", speaker: 14, prompt: "優しいお姉さんとして、癒やしのトーンではなして。" },
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

  // 通信処理を「動いていた時」のシンプルな形に完全復帰
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
      setMessages(prev => [...prev, { role: "ai", text: "ごめんね、もう一度お話ししてくれる？" }]);
    }
  };

  const startListening = () => {
    const W = window;
    const SpeechRec = W.SpeechRecognition || W.webkitSpeechRecognition;
    if (!SpeechRec) {
      alert("ブラウザが対応していません");
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
    <div style={{ background: "#F5F7FA", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet" />
      
      {/* キャラクターを大きく、分かりやすく */}
      <div style={{ width: "100%", maxWidth: "500px", padding: "20px", display: "flex", gap: "10px" }}>
        {Object.values(CHARACTERS).map((char) => (
          <button key={char.id} onClick={() => setSelectedChar(char)} style={{ flex: 1, padding: "15px 5px", border: "none", borderRadius: "20px", background: selectedChar.id === char.id ? "white" : "transparent", boxShadow: selectedChar.id === char.id ? "0 4px 15px rgba(0,0,0,0.1)" : "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", transition: "0.2s" }}>
            <MaterialIcon name={char.icon} size="40px" color={selectedChar.id === char.id ? char.color : "#BDC3C7"} />
            <span style={{ fontSize: "12px", fontWeight: "bold", marginTop: "5px", color: selectedChar.id === char.id ? "#333" : "#BDC3C7" }}>{char.name}</span>
          </button>
        ))}
      </div>

      {/* チャット履歴 */}
      <div ref={scrollRef} style={{ flex: 1, width: "100%", maxWidth: "500px", padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "15px" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "80%", background: m.role === "user" ? selectedChar.color : "white", color: m.role === "user" ? "white" : "#333", padding: "12px 18px", borderRadius: "20px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            {m.text}
          </div>
        ))}
        {isTyping && <div style={{ color: "#BDC3C7", paddingLeft: "10px" }}>考案中...</div>}
      </div>

      {/* 押しやすい大きなマイクボタンを下に固定 */}
      <div style={{ width: "100%", maxWidth: "500px", padding: "20px", position: "sticky", bottom: 0, background: "rgba(245,247,250,0.9)", backdropFilter: "blur(10px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "white", padding: "8px", borderRadius: "40px", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}>
          <input 
            value={inputText} 
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage(inputText)}
            placeholder={`${selectedChar.name}とはなそう`}
            style={{ flex: 1, border: "none", padding: "0 15px", fontSize: "16px", outline: "none" }}
          />
          <button 
            onClick={startListening}
            style={{ width: "60px", height: "60px", borderRadius: "30px", border: "none", background: isListening ? "#FF4757" : selectedChar.color, color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <MaterialIcon name={isListening ? "stop" : "mic"} size="32px" />
          </button>
        </div>
      </div>

      <audio ref={audioRef} />
    </div>
  );
}