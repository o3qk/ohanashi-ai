"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff } from 'lucide-react';
import { createVoicePlayer } from '@/utils/voicevoxClient';

export default function Home() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [isTyping, setIsTyping] = useState(false);
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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isTyping) return;

    const userText = message;
    setMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userText,
          systemPrompt: "あなたは「はなちゃん」という名前の5歳の女の子です。明るく元気に話してください。"
        })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);

      if (voicePlayerRef.current) {
        await voicePlayerRef.current.speak(data.reply, { speed: 1.1, speakerId: 2 });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-pink-50 text-slate-900">
      <header className="p-4 bg-white border-b shadow-sm">
        <h1 className="font-bold text-pink-600 text-center">はなちゃんとのお話</h1>
      </header>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 rounded-2xl max-w-[80%] ${m.role === 'user' ? 'bg-pink-500 text-white' : 'bg-white shadow border border-pink-100'}`}>
              {m.content}
            </div>
          </div>
        ))}
        {isTyping && <div className="text-xs text-pink-400 animate-pulse">はなちゃんが考えてるよ...</div>}
      </div>

      <form onSubmit={handleSend} className="p-4 bg-white border-t flex gap-2">
        <input
          id="chat-input"
          name="chat-input"
          className="flex-1 border border-pink-200 rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-pink-300"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="おはなししてね！"
        />
        <button type="submit" className="bg-pink-500 text-white p-2 rounded-full shadow-md hover:bg-pink-600">
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}