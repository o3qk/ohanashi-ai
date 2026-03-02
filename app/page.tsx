"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect, useRef } from "react";

const MaterialIcon = ({ name, size = "24px", color = "inherit" }) => (
  <span className="material-icons-round" style={{ fontSize: size, color: color, display: 'block' }}>{name}</span>
);

const CHARACTERS = {
  hana: { id: "hana", name: "はなちゃん", sub: "5さいの女の子", icon: "child_care", color: "#FF7EB9", speaker: 2, prompt: "5歳の女の子として、ひらがな多めで元気いっぱいに答えて。" },
  oneesan: { id: "oneesan", name: "おねえさん", sub: "近所の優しい人", icon: "face_3", color: "#66BB6A", speaker: 14, prompt: "優しいお姉さんとして、癒やしのトーンで丁寧にはなして。" },
  ojisama: { id: "ojisama", name: "おじさま", sub: "知的で紳士的", icon: "person_4", color: "#42A5F5", speaker: 13, prompt: "紳士的なおじさまとして、論理的かつ丁寧に話して。" }
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
    if (!text?.trim() || isTyping) return;
    
    const newUserMsg = { role: "user", text };
    setMessages(prev => [...prev, newUserMsg]);
    setInputText("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, systemPrompt: selectedChar.prompt }) 
      });
      
      const data = await res.json();
      const aiReply = data.reply || "ごめんね、うまく聞き取れなかったよ。";
      
      setMessages(prev => [...prev, { role: "ai", text: aiReply }]);
      
      // 音声合成
      const voiceUrl = `https://api.tts.quest/v3/voicevox/synthesis?text=${encodeURIComponent(aiReply)}&speaker=${selectedChar.speaker}`;
      if (audioRef.current) {
        audioRef.current.src = voiceUrl;
        audioRef.current.play().catch(e => console.log("Audio play failed", e));
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: "ai", text: "接続でエラーが起きちゃった。ネットを確認してみてね。" }]);
    } finally {
      setIsTyping(false);
    }
  };

  const startListening = () => {
    const W = window as any;
    const SpeechRec = W.SpeechRecognition || W.webkitSpeechRecognition;
    if (!SpeechRec) {
      alert("お使いのブラウザは音声認識に対応していません。Chromeをお使いください。");
      return;
    }
    try {
      const rec = new SpeechRec();
      rec.lang = "ja-JP";
      rec.onstart = () => setIsListening(true);
      rec.onend = () => setIsListening(false);
      rec.onresult = (e: any) => {
        const result = e.results[0][0].transcript;
        if (result) handleSendMessage(result);
      };
      rec.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  return (
    <div style={{ background: "#F8F9FA", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: "120px" }}>
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet" />
      <style>{`
        @keyframes popIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        .msg-pop { animation: popIn 0.3s ease-out both; }
        .mic-active { box-shadow: 0 0 0 15px ${selectedChar.color}33; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 ${selectedChar.color}66; } 100% { box-shadow: 0 0 0 20px ${selectedChar.color}00; } }
      `}</style>
      
      {/* キャラクタースイッチ：もっと大きく押しやすく */}
      <div style={{ width: "100%", maxWidth: "600px", display: "flex", gap: "12px", padding: "20px", position: "sticky", top: 0, background: "#F8F9FAf2", zIndex: 10 }}>
        {Object.values(CHARACTERS).map((char) => (
          <button key={char.id} onClick={() => setSelectedChar(char)} style={{ flex: 1, padding: "16px", borderRadius: "24px", border: "none", background: "white", boxShadow: selectedChar.id === char.id ? `0 0 0 3px ${char.color}` : "0 4px 12px rgba(0,0,0,0.05)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", transition: "0.2s" }}>
            <MaterialIcon name={char.icon} size="40px" color={selectedChar.id === char.id ? char.color : "#BDC3C7"} />
            <span style={{ fontSize: "14px", fontWeight: "bold", marginTop: "4px", color: selectedChar.id === char.id ? "#333" : "#BDC3C7" }}>{char.name}</span>
          </button>
        ))}
      </div>

      {/* チャット画面 */}
      <div ref={scrollRef} style={{ width: "100%", maxWidth: "600px", flex: 1, padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
        {messages.map((m, i) => (
          <div key={i} className="msg-pop" style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "85%" }}>
            <div style={{ background: m.role === "user" ? selectedChar.color : "white", color: m.role === "user" ? "white" : "#333", padding: "14px 20px", borderRadius: "20px", boxShadow: "0 4px 10px rgba(0,0,0,0.03)", fontSize: "16px", fontWeight: 500 }}>
              {m.text}
            </div>
          </div>
        ))}
        {isTyping && <div style={{ color: "#BDC3C7", fontSize: "14px", marginLeft: "10px" }}>考え中...</div>}
      </div>

      {/* 操作パネル：大きなマイクボタン */}
      <div style={{ position: "fixed", bottom: "30px", width: "90%", maxWidth: "500px", background: "white", borderRadius: "40px", padding: "10px", display: "flex", alignItems: "center", boxShadow: "0 15px 40px rgba(0,0,0,0.12)" }}>
        <input 
          value={inputText} 
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage(inputText)}
          placeholder={`${selectedChar.name}とはなそう`}
          style={{ flex: 1, border: "none", padding: "0 20px", fontSize: "16px", outline: "none" }}
        />
        <button 
          onClick={startListening}
          className={isListening ? "mic-active" : ""}
          style={{ width: "60px", height: "60px", borderRadius: "30px", border: "none", background: selectedChar.color, color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "0.3s" }}
        >
          <MaterialIcon name={isListening ? "stop" : "mic"} size="32px" />
        </button>
      </div>

      <audio ref={audioRef} />
    </div>
  );
}