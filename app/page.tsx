"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, Square } from 'lucide-react';

// 元の動作を維持するためのインポート（絶対に変えない部分）
import { createVoicePlayer } from '@/utils/voicevoxClient';
import { CharacterAvatar } from '@/components/CharacterAvatar';
import { ListeningVisualizer } from '@/components/ListeningVisualizer';

export default function Home() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  // キャラクター選択状態
  const [selectedSpeaker, setSelectedSpeaker] = useState(2);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const voicePlayerRef = useRef<any>(null);

  // 音声・チャットのロジック（変えていない部分）
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
    setMessage('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: text,
          speakerId: selectedSpeaker
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
    <main className="flex h-screen flex-col bg-[#FFFDD0] text-slate-800">
      
      {/* 上：3人の画像選択エリア */}
      <section className="flex justify-around p-6 bg-white/50 border-b border-orange-100 shadow-sm">
        {[
          { id: 2, label: "子供" },
          { id: 14, label: "女友達" },
          { id: 1, label: "知識人" }
        ].map((char) => (
          <button
            key={char.id}
            onClick={() => setSelectedSpeaker(char.id)}
            className={`flex flex-col items-center transition-all ${selectedSpeaker === char.id ? 'scale-110 opacity-100' : 'opacity-40 grayscale'}`}
          >
            <div className={`w-24 h-24 rounded-full mb-2 border-4 ${selectedSpeaker === char.id ? 'border-orange-500 shadow-lg' : 'border-transparent'} overflow-hidden bg-white flex items-center justify-center`}>
              {/* kさんの元の CharacterAvatar をそのまま配置（Propsエラーを防ぐため引数なし） */}
              <CharacterAvatar />
            </div>
            <span className="font-bold text-lg">{char.label}</span>
          </button>
        ))}
      </section>

      {/* 中：入力・返答履歴（チャット欄） */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-3xl px-6 py-3 text-xl shadow-md ${
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

      {/* 下：操作エリア */}
      <footer className="p-6 bg-white/80 backdrop-blur-md border-t border-orange-100">
        <div className="max-w-4xl mx-auto space-y-4">
          
          {/* 文字入力欄の上に停止ボタン */}
          <div className="flex justify-center">
            <button
              onClick={stopSpeaking}
              className="flex items-center gap-2 bg-red-500 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-red-600 transition-all shadow-lg active:scale-95"
            >
              <Square size={24} fill="currentColor" />
              お話を止める
            </button>
          </div>

          <div className="flex gap-4 items-end">
            {/* 文字入力欄（大きめ） */}
            <div className="flex-1 relative">
              {isListening && <div className="absolute -top-16 left-0 right-0 flex justify-center"><ListeningVisualizer /></div>}
              <input
                id="chat-input"
                name="chat-input"
                className="w-full border-2 border-orange-200 rounded-3xl px-8 py-5 text-2xl outline-none focus:border-orange-500 bg-white shadow-inner"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="メッセージを入力..."
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(message)}
              />
            </div>

            {/* 下右：音声ボタン & 送信ボタン */}
            <div className="flex flex-col gap-3">
              <button
                type="button"
                className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-xl transition-all ${
                  isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-orange-100 text-orange-600'
                }`}
                onClick={() => setIsListening(!isListening)}
              >
                {isListening ? <MicOff size={40} /> : <Mic size={40} />}
              </button>
              
              <button
                onClick={() => handleSendMessage(message)}
                disabled={!message.trim() || isTyping}
                className="w-20 h-20 bg-orange-600 text-white rounded-3xl flex items-center justify-center shadow-xl disabled:bg-slate-300 transition-transform active:scale-95"
              >
                <Send size={36} />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}