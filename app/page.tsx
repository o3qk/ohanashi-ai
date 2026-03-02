"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, Square } from 'lucide-react';

// 【不変】kさんのプロジェクトで成功している既存パーツ
import { createVoicePlayer } from '@/utils/voicevoxClient';
import { CharacterAvatar } from '@/components/CharacterAvatar';
import { ConversationPanel } from '@/components/ConversationPanel';
import { ListeningVisualizer } from '@/components/ListeningVisualizer';

export default function Home() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  // キャラクター選択（初期値：子供/はなちゃん）
  const [selectedSpeaker, setSelectedSpeaker] = useState(2);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const voicePlayerRef = useRef<any>(null);

  // 【不変】成功済みのロジック
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
    // 指定：背景はクリーム色
    <main className="flex h-screen flex-col bg-[#FFFDD0] text-slate-800">
      
      {/* 上：3人の画像選択エリア（大きめのボタン） */}
      <section className="flex justify-around p-6 bg-white/40 border-b border-orange-100 shadow-sm">
        {[
          { id: 2, label: "子供", key: "hana" },
          { id: 14, label: "女友達", key: "friend" },
          { id: 1, label: "知識人", key: "intellectual" }
        ].map((char) => (
          <button
            key={char.id}
            type="button"
            onClick={() => setSelectedSpeaker(char.id)}
            className={`flex flex-col items-center transition-all ${selectedSpeaker === char.id ? 'scale-110' : 'opacity-40 grayscale'}`}
          >
            <div className={`w-28 h-28 rounded-full mb-2 border-4 ${selectedSpeaker === char.id ? 'border-orange-500 shadow-xl' : 'border-transparent'} overflow-hidden bg-white flex items-center justify-center`}>
              {/* 【修正】必須プロパティ character と status を正しく渡す */}
              <CharacterAvatar 
                character={char.key} 
                status={selectedSpeaker === char.id && (isTyping || isListening) ? 'talking' : 'idle'} 
              />
            </div>
            <span className={`font-bold text-xl ${selectedSpeaker === char.id ? 'text-orange-600' : 'text-slate-500'}`}>
              {char.label}
            </span>
          </button>
        ))}
      </section>

      {/* 中：入力・返答履歴（ConversationPanel） */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
        <ConversationPanel messages={messages} />
        {isTyping && (
          <div className="flex justify-start mt-4">
            <div className="bg-white/80 px-6 py-2 rounded-full text-lg animate-pulse shadow-sm">考え中...</div>
          </div>
        )}
      </div>

      {/* 下：操作エリア（全体的に大きめ） */}
      <footer className="p-6 bg-white/70 backdrop-blur-md border-t border-orange-100">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* 指定：文字入力欄の上に停止ボタン */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={stopSpeaking}
              className="flex items-center gap-3 bg-red-500 text-white px-12 py-5 rounded-full font-bold text-2xl hover:bg-red-600 transition-all shadow-xl active:scale-95"
            >
              <Square size={28} fill="currentColor" />
              お話を止める
            </button>
          </div>

          <div className="flex gap-4 items-end">
            {/* 下：文字入力欄（特大サイズ） */}
            <div className="flex-1 relative">
              {isListening && (
                <div className="absolute -top-16 left-0 right-0 flex justify-center">
                  <ListeningVisualizer />
                </div>
              )}
              <input
                id="chat-input"
                name="chat-input"
                className="w-full border-4 border-orange-200 rounded-[2rem] px-8 py-6 text-3xl outline-none focus:border-orange-500 bg-white shadow-inner"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="メッセージを入力..."
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(message)}
              />
            </div>

            {/* 下右：音声ボタン & 送信ボタン */}
            <div className="flex flex-col gap-4">
              <button
                type="button"
                className={`w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl transition-all ${
                  isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-orange-100 text-orange-600'
                }`}
                onClick={() => setIsListening(!isListening)}
              >
                {isListening ? <MicOff size={48} /> : <Mic size={48} />}
              </button>
              
              <button
                type="button"
                onClick={() => handleSendMessage(message)}
                disabled={!message.trim() || isTyping}
                className="w-24 h-24 bg-orange-500 text-white rounded-3xl flex items-center justify-center shadow-2xl disabled:bg-slate-300 transition-transform active:scale-95"
              >
                <Send size={40} />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}