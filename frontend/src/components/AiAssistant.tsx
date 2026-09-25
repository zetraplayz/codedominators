'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Minimize2, Maximize2, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  content: string;
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export function AiAssistant({ resourceContext }: { resourceContext?: string }) {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "Hi! I'm MESH, your resource intelligence assistant. Ask me anything about your resources or teaching materials." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const q = input.trim();
    if (!q || loading) return;
    
    const userMsg: Message = { role: 'user', content: q };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/ai/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          history: messages.slice(1).map(m => ({ role: m.role, content: m.content })),
          context: resourceContext || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages([...newHistory, { role: 'model', content: data.answer }]);
      } else {
        setMessages([...newHistory, { role: 'model', content: 'Sorry, I encountered an error. Please try again.' }]);
      }
    } catch {
      setMessages([...newHistory, { role: 'model', content: 'Cannot reach the AI service. Make sure the backend is running.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[var(--color-base-mint)] shadow-clay-card flex items-center justify-center hover:shadow-clay-pressed transition-all group"
        title="Ask MESH AI"
      >
        <Bot size={24} className="text-[var(--color-base-text)]" />
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 w-96 rounded-[1.5rem] bg-[var(--color-base-bg)] shadow-clay-card border border-white/30 flex flex-col overflow-hidden transition-all ${minimized ? 'h-14' : 'h-[520px]'}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-[var(--color-base-mint)] border-b border-white/20">
        <div className="flex items-center gap-2">
          <Bot size={18} className="text-[var(--color-base-text)]" />
          <span className="font-bold text-sm text-[var(--color-base-text)]">MESH AI</span>
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setMinimized(!minimized)} className="p-1.5 rounded-lg hover:bg-[var(--color-base-bg)] transition-colors text-[var(--color-base-text)]">
            {minimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
          </button>
          <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-[var(--color-base-bg)] transition-colors text-[var(--color-base-text)]">
            <X size={14} />
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm font-medium leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[var(--color-base-mint)] shadow-clay-btn text-[var(--color-base-text)] rounded-br-sm'
                      : 'bg-[var(--color-base-yellow)] shadow-clay-pressed text-[var(--color-base-text)] rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="px-4 py-2.5 rounded-2xl rounded-bl-sm bg-[var(--color-base-yellow)] shadow-clay-pressed">
                  <Loader2 size={16} className="animate-spin text-[var(--color-base-text)]" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-white/20 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask about your resources..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--color-base-mint)] shadow-clay-pressed outline-none text-sm text-[var(--color-base-text)] font-medium placeholder:opacity-40 focus:ring-2 focus:ring-[var(--color-base-text)]/20 transition-all"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-xl bg-[var(--color-base-mint)] shadow-clay-btn hover:shadow-clay-pressed disabled:opacity-40 transition-all text-[var(--color-base-text)]"
            >
              <Send size={16} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
