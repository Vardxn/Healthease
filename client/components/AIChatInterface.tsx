'use client';

import { useState, useRef, useEffect } from 'react';
import { askQuestion, ChatMessagePayload } from '@/lib/api/chat';
import { Send, Bot, User, Loader2, DatabaseZap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AIChatInterface() {
  const [messages, setMessages] = useState<ChatMessagePayload[]>([
    {
      role: 'assistant',
      content: 'Hello! I am HealthEase AI. I have securely loaded your health profile. How can I assist you with your medications or symptoms today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessagePayload = { role: 'user', content: input.trim() };
    const updatedHistory = [...messages, userMessage];
    
    setMessages(updatedHistory);
    setInput('');
    setIsLoading(true);

    try {
      // In a real app, you might only send the last N messages to save tokens
      const reply = await askQuestion(userMessage.content, messages);
      setMessages([...updatedHistory, { role: 'assistant', content: reply }]);
    } catch (error) {
      setMessages([
        ...updatedHistory, 
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[700px] w-full bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Dr. AI Assistant</h2>
            <p className="text-xs text-slate-500">24/7 Medical Guidance</p>
          </div>
        </div>
        
        {/* RAG Context Badge (Flex for Interview) */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full border border-amber-200 text-xs font-medium">
          <DatabaseZap className="w-3.5 h-3.5" />
          Context Active: Reading Health Profile
        </div>
      </div>

      {/* Chat History */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50"
      >
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div key={idx} className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
              
              {!isUser && (
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex-shrink-0 flex items-center justify-center text-indigo-600 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[75%] px-5 py-3.5 rounded-2xl ${
                isUser 
                  ? 'bg-indigo-600 text-white rounded-br-none shadow-sm' 
                  : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center text-slate-600 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-4 justify-start">
             <div className="w-8 h-8 rounded-full bg-indigo-100 flex-shrink-0 flex items-center justify-center text-indigo-600 mt-1">
                <Bot className="w-4 h-4" />
             </div>
             <div className="px-5 py-3.5 bg-white border border-slate-200 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '300ms' }} />
             </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder="Describe your symptoms or ask about medications..."
            className="w-full pl-5 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            disabled={isLoading}
          />
          <Button 
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 rounded-full w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
        <p className="text-center text-[10px] text-slate-400 mt-3">
          AI can make mistakes. Always consult with a licensed physician for medical advice.
        </p>
      </div>

    </div>
  );
}
