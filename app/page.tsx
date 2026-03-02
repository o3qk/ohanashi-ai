"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, Settings } from 'lucide-react';
// kさんのプロジェクト構成に合わせたインポート
import { useChat } from '@/hooks/useChat';
import { useVoice } from '@/hooks/useVoice';
import { CharacterAvatar } from '@/components/CharacterAvatar';
import { ListeningVisualizer } from '@/components/ListeningVisualizer';
import { MessageBubble } from '@/components/MessageBubble';

export default function Home() {
  const [message, setMessage] = useState('');
  const { messages, sendMessage, isTyping } = useChat();
  const { isListening, toggleListening, speak } = useVoice();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = message;
    setMessage('');
    
    const response = await sendMessage(userMessage);
    if (response) {
      speak(response);
    }
  };

  return (
    <main className="flex h-screen flex-col bg-slate-50">
      <header className="flex items-center justify-between border-b bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-full bg-pink-100">
            <CharacterAvatar />
          </div>
          <div>
            <h1 className="font-bold text-slate-800">はなちゃんとのお話</h1>
            <p className="text-xs text-slate-500">Online</p>
          </div>
        </div>
        <button className="rounded-full p-2 text-slate-400 hover:bg-slate-100">
          <Settings size={20} />
        </button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg: any, index: number) => (
          <MessageBubble key={index} message={msg} />
        ))}
        {isTyping && (
          <div className="flex gap-2 text-slate-400 text-sm animate-pulse">
            はなちゃんが考えてるよ...
          </div>
        )}
      </div>

      <footer className="border-t bg-white p-6">
        <div className="mx-auto max-w-4xl relative">
          {isListening && (
            <div className="absolute -top-16 left-0 right-0 flex justify-center">
              <ListeningVisualizer />
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="flex gap-4">
            <button
              type="button"
              onClick={toggleListening}
              className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
                isListening ? 'bg-red-500 text-white animate-bounce' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {isListening ? <MicOff size={24} /> : <Mic size={24} />}
            </button>
            
            <input
              id="chat-input"
              name="chat-input"
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="はなちゃんにお話ししてね..."
              className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-6 py-3 focus:border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-100"
            />
            
            <button
              type="submit"
              disabled={!message.trim()}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-500 text-white shadow-lg shadow-pink-200 hover:bg-pink-600 disabled:bg-slate-300 disabled:shadow-none transition-all"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </footer>
    </main>
  );
}