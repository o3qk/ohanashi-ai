"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, Square } from 'lucide-react';

// 実在する utils と components を使用（機能を壊さない）
import { createVoicePlayer } from '@/utils/voicevoxClient';
import { CharacterAvatar } from '@/components/CharacterAvatar';
import { ListeningVisualizer } from '@/components/ListeningVisualizer';

export default function Home() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  // キャラクター選択状態 (2: 子供, 14: 女友達, 1: 知識人 と仮定)
  const [selectedSpeaker, setSelectedSpeaker] = useState(2);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const voicePlayerRef = useRef<any>(null);

  useEffect(() => {
    voicePlayerRef.current = createVoicePlayer();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: text,
          speakerId: selectedSpeaker // 選択されたキャラを反映
        })
      });
      
      const data = await res.json();
      const aiMsg = { role: 'assistant', content: data.reply };
      setMessages(prev => [...prev, aiMsg]);

      if (voicePlayerRef.current) {
        await voicePlayerRef.current.speak(data.reply, { speed: 1.1, speakerId: selectedSpeaker });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  const stopSpeaking = () => {
    if (voicePlayerRef.current) {
      voicePlayerRef.current.stop();
    }
  };

  return (
    // 背景：クリーム色
    <main className="flex h-screen flex-col bg-[#FFFDD0] text-slate-800 font-sans">
      
      {/* 上部：3人の画像選択エリア */}
      <section className="flex justify-around p-6 bg-white/50 border-b border-orange-100 shadow-sm">
        {[
          { id: 2, label: "子供", color: "bg-pink-400" },
          { id: 14, label: "女友達", color: "bg-orange-400" },
          { id: 1, label: "知識人", color: "bg-blue-500" }
        ].map((char) => (
          <button
            key={char.id}
            onClick={() => setSelectedSpeaker(char.id)}
            className={`flex flex-col items-center transition-all ${selectedSpeaker === char.id ? 'scale-110' : 'opacity-60 grayscale'}`}
          >
            <div className={`w-20 h-20 rounded-full mb-2 border-4 ${selectedSpeaker === char.id ? 'border-orange-500' : 'border-transparent'} overflow-hidden`}>
              {/* キャラクターの口パク・動きのコンポーネント */}
              <CharacterAvatar speakerId={char.id} isActive={selectedSpeaker === char.id && (isTyping || isListening)} />
            </div>
            <span className="font-bold text-sm">{char.label}</span>
          </button>
        ))}
      </section>

      {/* 中央：入力・返答履歴欄 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-3xl px-6 py-3 text-lg shadow-md ${
              msg.role === 'user' ? 'bg-orange-500 text-white' : 'bg-white border border-orange-100'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/80 px-4 py-2 rounded-full text-sm animate-pulse">考え中...</div>
          </div>
        )}
      </div>

      {/* 下部：操作エリア */}
      <footer className="p-4 bg-white/70 backdrop-blur-md border-t border-orange-100">
        <div className="max-w-4xl mx-auto space-y-3">
          
          {/* 返答の停止ボタン（大きめ） */}
          <div className="flex justify-center">
            <button
              onClick={stopSpeaking}
              className="flex items-center gap-2 bg-red-100 text-red-600 px-8 py-3 rounded-full font-bold hover:bg-red-200 transition-colors shadow-sm"
            >
              <Square size={20} fill="currentColor" />
              お話を止める
            </button>
          </div>

          <div className="flex gap-3 items-end">
            {/* 文字入力欄 */}
            <div className="flex-1 relative">
              {isListening && <div className="absolute -top-12 left-0 right-0"><ListeningVisualizer /></div>}
              <input
                id="chat-input"
                name="chat-input"
                className="w-full border-2 border-orange-200 rounded-2xl px-6 py-4 text-xl outline-none focus:border-orange-500 bg-white/90 shadow-inner"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="メッセージを入力してね"
              />
            </div>

            {/* 音声（話す）ボタン & 送信ボタン */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
                  isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-orange-100 text-orange-600'
                }`}
                onClick={() => setIsListening(!isListening)}
              >
                {isListening ? <MicOff size={32} /> : <Mic size={32} />}
              </button>
              
              <button
                onClick={() => handleSendMessage(message)}
                disabled={!message.trim() || isTyping}
                className="w-16 h-16 bg-orange-500 text-white rounded-2xl flex items-center justify-center shadow-lg disabled:bg-slate-300 transition-transform active:scale-95"
              >
                <Send size={28} />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}