import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Message, UserInfo, ChatState } from '../types';
import { RHODE_KNOWLEDGE_BASE } from '../constants';
import { Send, User, Mail, Star, RefreshCw, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function ChatBot() {
  const [chatState, setChatState] = useState<ChatState>('onboarding');
  const [userInfo, setUserInfo] = useState<UserInfo>({ firstName: '', email: '' });
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInfo.firstName && userInfo.email) {
      setChatState('chatting');
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'model',
        text: `Hi ${userInfo.firstName}! Welcome to Rhode Customer Care. How can I help you achieve your glazed skin goals today?`,
        timestamp: Date.now(),
      };
      setMessages([welcomeMessage]);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const model = "gemini-3-flash-preview";
      
      const chatHistory = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const response = await ai.models.generateContent({
        model,
        contents: [
          ...chatHistory,
          { role: 'user', parts: [{ text: input }] }
        ],
        config: {
          systemInstruction: `You are the Rhode Customer Care AI assistant. 
          Knowledge Base: ${RHODE_KNOWLEDGE_BASE}
          User Name: ${userInfo.firstName}
          User Email: ${userInfo.email}
          
          Guidelines:
          - Be helpful, calm, and sophisticated.
          - Use a minimalist and clean tone.
          - Focus on Rhode products and "glazed" skin.
          - If you don't know something, offer to connect them with a human agent (simulated).
          - Keep responses concise but thorough.`,
        },
      });

      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text || "I'm sorry, I couldn't process that. How else can I help?",
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error("Chat Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const submitFeedback = () => {
    setChatState('completed');
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-white shadow-2xl overflow-hidden sm:my-8 sm:h-[800px] sm:rounded-3xl border border-black/5">
      {/* Header */}
      <header className="px-8 py-6 border-b border-black/5 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-light tracking-widest uppercase text-rhode-ink">Rhode</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-rhode-muted mt-1">Customer Care</p>
        </div>
        {chatState === 'chatting' && (
          <button 
            onClick={() => setChatState('feedback')}
            className="text-[10px] uppercase tracking-widest text-rhode-muted hover:text-rhode-ink transition-colors"
          >
            End Chat
          </button>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative flex flex-col">
        <AnimatePresence mode="wait">
          {chatState === 'onboarding' && (
            <motion.div 
              key="onboarding"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col justify-center px-12"
            >
              <div className="space-y-8">
                <div className="space-y-2">
                  <h2 className="text-3xl font-light leading-tight">Welcome to the world of Rhode.</h2>
                  <p className="text-rhode-muted text-sm">Please tell us a bit about yourself to start the conversation.</p>
                </div>
                
                <form onSubmit={handleOnboarding} className="space-y-6">
                  <div className="space-y-4">
                    <div className="relative">
                      <User className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-rhode-muted" />
                      <input 
                        required
                        type="text"
                        placeholder="First Name"
                        value={userInfo.firstName}
                        onChange={e => setUserInfo(prev => ({ ...prev, firstName: e.target.value }))}
                        className="w-full pl-8 py-3 bg-transparent border-b border-black/10 focus:border-rhode-ink outline-none transition-colors text-sm placeholder:text-rhode-muted/50"
                      />
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-rhode-muted" />
                      <input 
                        required
                        type="email"
                        placeholder="Email Address"
                        value={userInfo.email}
                        onChange={e => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full pl-8 py-3 bg-transparent border-b border-black/10 focus:border-rhode-ink outline-none transition-colors text-sm placeholder:text-rhode-muted/50"
                      />
                    </div>
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-4 bg-rhode-ink text-white rounded-full text-xs uppercase tracking-widest hover:bg-black/90 transition-all flex items-center justify-center gap-2 group"
                  >
                    Start Chatting
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {chatState === 'chatting' && (
            <motion.div 
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-8 py-8 space-y-8 scroll-smooth"
              >
                {messages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={cn(
                      "flex flex-col max-w-[85%]",
                      msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                    )}
                  >
                    <div className={cn(
                      "px-5 py-3 rounded-2xl text-sm leading-relaxed",
                      msg.role === 'user' 
                        ? "bg-rhode-ink text-white rounded-tr-none" 
                        : "bg-rhode-gray text-rhode-ink rounded-tl-none"
                    )}>
                      <div className={cn(
                        "prose prose-sm max-w-none",
                        msg.role === 'user' ? "prose-invert" : "prose-slate"
                      )}>
                        <ReactMarkdown>
                          {msg.text}
                        </ReactMarkdown>
                      </div>
                    </div>
                    <span className="text-[9px] uppercase tracking-widest text-rhode-muted mt-2 px-1">
                      {msg.role === 'user' ? 'You' : 'Rhode AI'} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-center gap-2 text-rhode-muted">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span className="text-[10px] uppercase tracking-widest">Rhode is typing...</span>
                  </div>
                )}
              </div>

              <div className="p-8 border-t border-black/5 bg-white">
                <form onSubmit={sendMessage} className="relative">
                  <input 
                    type="text"
                    placeholder="Type your message..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    className="w-full pl-6 pr-14 py-4 bg-rhode-gray rounded-full text-sm outline-none focus:ring-1 focus:ring-black/5 transition-all"
                  />
                  <button 
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-rhode-ink text-white rounded-full disabled:opacity-50 transition-opacity"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {chatState === 'feedback' && (
            <motion.div 
              key="feedback"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col justify-center items-center px-12 text-center"
            >
              <div className="space-y-8 max-w-sm">
                <div className="space-y-2">
                  <h2 className="text-2xl font-light">How was your experience?</h2>
                  <p className="text-rhode-muted text-sm">Your feedback helps us refine the Rhode experience.</p>
                </div>
                
                <div className="flex justify-center gap-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star 
                        className={cn(
                          "w-8 h-8 transition-colors",
                          (hoverRating || rating) >= star 
                            ? "fill-rhode-ink text-rhode-ink" 
                            : "text-black/10"
                        )}
                      />
                    </button>
                  ))}
                </div>

                <button 
                  onClick={submitFeedback}
                  disabled={rating === 0}
                  className="w-full py-4 bg-rhode-ink text-white rounded-full text-xs uppercase tracking-widest hover:bg-black/90 transition-all disabled:opacity-50"
                >
                  Submit Feedback
                </button>
              </div>
            </motion.div>
          )}

          {chatState === 'completed' && (
            <motion.div 
              key="completed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col justify-center items-center px-12 text-center"
            >
              <div className="space-y-6">
                <div className="w-16 h-16 bg-rhode-gray rounded-full flex items-center justify-center mx-auto">
                  <Star className="w-8 h-8 fill-rhode-ink text-rhode-ink" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-light">Thank you, {userInfo.firstName}.</h2>
                  <p className="text-rhode-muted text-sm">We've received your feedback. Have a glazed day!</p>
                </div>
                <button 
                  onClick={() => {
                    setChatState('onboarding');
                    setMessages([]);
                    setRating(0);
                  }}
                  className="text-[10px] uppercase tracking-widest text-rhode-ink border-b border-rhode-ink pb-1"
                >
                  Start New Session
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
