"use client";

import React, { useState, useEffect, useRef } from "react";

const MaterialIcon = ({ name, size = "24px", color = "inherit" }: { name: string, size?: string, color?: string }) => (
  <span className="material-icons-round" style={{ fontSize: size, color: color, display: 'block' }}>{name}</span>
);

const CHARACTERS = {
  hana: { id: "hana", name: "はなちゃん", icon: "child_care", color: "#FF7EB9", speaker: 2, prompt: "5歳の女の子。ひらがな多めで元気よく。" },
  oneesan: { id: "oneesan", name: "おねえさん", icon: "face_3", color: "#66BB6A", speaker: 14, prompt: "優しいお姉さん。癒やしのトーンで。" },
  ojisama: { id: "ojisama", name: "おじさま", icon: "person_4", color: "#42A5F5", speaker: 13, prompt: "紳士的なおじさま。丁寧に。" }
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
      setMessages(prev => [...prev, { role: "ai", text: "ごめんね、いまお話しできないみたい。もう一度試してみて！" }]);
    }
  };

  const startListening = () => {
    if (typeof window === "undefined") return;
    const W = window as any;
    const SpeechRec = W.SpeechRecognition || W.webkitSpeechRecognition;
    if (!SpeechRec) return;
    const rec = new SpeechRec();
    rec.lang = "ja-JP";
    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onresult = (e: any) => handleSendMessage(e.results[0][0].transcript);
    rec.start();
  };

  return (
    <div style={{ background: "#F5F7FA", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet" />
      <div style={{ width: "100%", maxWidth: "500px", padding: "20px", display: "flex", gap: "10px" }}>
        {Object.values(CHARACTERS).map((char) => (
          <button key={char.id} onClick={() => setSelectedChar(char)} style={{ flex: 1, padding: "15px 5px", border: "none", borderRadius: "20px", background: selectedChar.id === char.id ? "white" : "transparent", boxShadow: selectedChar.id === char.id ? "0 4px 15px rgba(0,0,0,0.1)" : "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <MaterialIcon name={char.icon} size="42px" color={selectedChar.id === char.id ? char.color : "#BDC3C7"} />
            <span style={{ fontSize: "14px", fontWeight: "bold", marginTop: "5px", color: selectedChar.id === char.id ? "#333" : "#BDC3C7" }}>{char.name}</span>
          </button>
        ))}
      </div>
      <div ref={scrollRef} style={{ flex: 1, width: "100%", maxWidth: "500px", padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "15px" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "80%", background: m.role === "user" ? selectedChar.color : "white", color: m.role === "user" ? "white" : "#333", padding: "15px 20px", borderRadius: "25px", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>{m.text}</div>
        ))}
        {isTyping && <div style={{ color: "#BDC3C7", paddingLeft: "10px" }}>考え中...</div>}
      </div>
      <div style={{ width: "100%", maxWidth: "500px", padding: "20px", position: "sticky", bottom: 0, background: "rgba(245,247,250,0.9)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "white", padding: "8px", borderRadius: "40px", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}>
          <input value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSendMessage(inputText)} placeholder={`${selectedChar.name}とはなそう`} style={{ flex: 1, border: "none", padding: "0 15px", fontSize: "16px", outline: "none" }} />
          <button onClick={startListening} style={{ width: "64px", height: "64px", borderRadius: "32px", border: "none", background: isListening ? "#FF4757" : selectedChar.color, color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <MaterialIcon name={isListening ? "stop" : "mic"} size="32px" />
          </button>
        </div>
      </div>
      <audio ref={audioRef} />
    </div>
  );
}