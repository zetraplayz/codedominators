"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Loader2, Bot, User } from "lucide-react";
import { ClayButton } from "@/components/ui/ClayButton";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function ConversationPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [resourcesContext, setResourcesContext] = useState("");
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch user's accessible resources to build context
    const fetchContext = async () => {
      try {
        const res = await fetch("/api/resources", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          const contextStr = data.map((r: any) => `- ${r.title}: ${r.description || 'No description'}`).join('\n');
          setResourcesContext(contextStr);
        }
      } catch (e) {
        console.error("Failed to fetch context", e);
      }
    };
    fetchContext();

    // Initial greeting
    setMessages([{
      role: "assistant",
      content: "Hello! I am MESH, your teaching conversation assistant. How can I help you find, structure, or explain teaching resources today?"
    }]);
  }, []);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const newMessages: ChatMessage[] = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: input,
          history: messages.map(m => ({ role: m.role, content: m.content })),
          context: resourcesContext
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages([...newMessages, { role: "assistant", content: data.answer }]);
      } else {
        setMessages([...newMessages, { role: "assistant", content: "I encountered an error connecting to the AI provider. Please try again." }]);
      }
    } catch (e) {
      setMessages([...newMessages, { role: "assistant", content: "Network error occurred. I couldn't process your request." }]);
    }
    setLoading(false);
  };

  return (
    <div className="h-full flex flex-col p-8 max-w-5xl mx-auto gap-6 w-full">
      <div>
        <h1 className="text-4xl font-extrabold text-[var(--color-base-text)]">Teaching Conversation</h1>
        <p className="opacity-70 mt-2 font-medium text-[var(--color-base-text)]">Ask questions, summarize, and explore your authorized resources securely.</p>
      </div>

      <div className="flex-1 bg-[var(--color-base-bg)] p-6 rounded-[2rem] shadow-clay-card flex flex-col min-h-[500px]">
        {/* Chat window */}
        <div 
          ref={chatRef}
          className="flex-1 overflow-y-auto flex flex-col gap-5 pb-4 px-2"
        >
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-clay-btn ${
                msg.role === 'user' ? 'bg-[var(--color-base-yellow)]' : 'bg-[var(--color-base-mint)]'
              }`}>
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div className={`p-4 rounded-2xl max-w-[80%] whitespace-pre-wrap font-medium leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-[var(--color-base-yellow)]/20 shadow-clay-pressed text-[var(--color-base-text)] rounded-tr-none' 
                  : 'bg-[var(--color-base-mint)]/20 shadow-clay-pressed text-[var(--color-base-text)] rounded-tl-none'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-[var(--color-base-mint)] shadow-clay-btn flex items-center justify-center flex-shrink-0">
                <Loader2 size={20} className="animate-spin text-[var(--color-base-text)] opacity-50" />
              </div>
              <div className="p-4 rounded-2xl bg-[var(--color-base-mint)]/20 shadow-clay-pressed text-[var(--color-base-text)] opacity-50 rounded-tl-none italic font-medium">
                MESH is thinking...
              </div>
            </div>
          )}
        </div>

        {/* Input box */}
        <form onSubmit={handleSend} className="mt-4 flex gap-3 pt-4 border-t border-[var(--color-base-text)]/10">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. Can you summarize the Decision Trees notes?"
            className="flex-1 px-6 py-4 rounded-2xl bg-[var(--color-base-mint)] shadow-clay-pressed outline-none text-[var(--color-base-text)] font-medium placeholder:opacity-40"
            disabled={loading}
          />
          <ClayButton type="submit" variant="primary" disabled={loading || !input.trim()} className="w-16 h-14 flex items-center justify-center p-0">
            <Send size={20} className={loading ? 'opacity-50' : ''} />
          </ClayButton>
        </form>
      </div>
    </div>
  );
}
