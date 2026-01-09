import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, BrainCircuit, Bot, Loader2, Minimize2, Maximize2 } from 'lucide-react';
import { createChat } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { Chat, GenerateContentResponse } from "@google/genai";

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
}

export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', content: "Hi! I'm your CodeGuard AI assistant. Ask me anything about your code or security vulnerabilities." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingMode, setThinkingMode] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !chatRef.current) {
      chatRef.current = createChat();
      if (!chatRef.current) {
        setMessages(prev => [...prev, { 
          id: 'err', 
          role: 'model', 
          content: "API Key not configured. Chat is running in offline demo mode." 
        }]);
      }
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      if (chatRef.current) {
        // Configure thinking mode if enabled
        const config = thinkingMode ? {
          thinkingConfig: { thinkingBudget: 32768 } // Max budget for Gemini 3 Pro
        } : {
          thinkingConfig: { thinkingBudget: 0 } // Disable thinking for faster response
        };

        const resultStream = await chatRef.current.sendMessageStream({
          message: userMsg.content,
          config
        });

        let fullResponse = '';
        const modelMsgId = (Date.now() + 1).toString();
        
        // Add placeholder message
        setMessages(prev => [...prev, { id: modelMsgId, role: 'model', content: '' }]);

        for await (const chunk of resultStream) {
            const c = chunk as GenerateContentResponse;
            if (c.text) {
              fullResponse += c.text;
              setMessages(prev => prev.map(m => 
                m.id === modelMsgId ? { ...m, content: fullResponse } : m
              ));
            }
        }
      } else {
        // Fallback mock response
        setTimeout(() => {
          setMessages(prev => [...prev, { 
            id: Date.now().toString(), 
            role: 'model', 
            content: "I am currently in offline mode because no API key was provided. In a real environment, I would analyze your request using **Gemini 3 Pro**." 
          }]);
        }, 1000);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'model', 
        content: "Sorry, I encountered an error communicating with Gemini." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 z-50 flex items-center gap-2 group"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap">
          Ask Gemini
        </span>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 flex flex-col transition-all duration-300 ${isExpanded ? 'w-full md:w-[800px] h-[80vh]' : 'w-[90vw] md:w-[400px] h-[600px] max-h-[80vh]'}`}>
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-900/50 rounded-t-2xl backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Gemini Assistant</h3>
            <p className="text-xs text-slate-400">Powered by Gemini 3 Pro</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors hidden md:block"
          >
             {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Thinking Mode Toggle */}
      <div className="px-4 py-2 bg-slate-950/50 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-300">
            <BrainCircuit className={`w-4 h-4 ${thinkingMode ? 'text-pink-400' : 'text-slate-500'}`} />
            <span>Deep Reasoning Mode</span>
        </div>
        <button 
            onClick={() => setThinkingMode(!thinkingMode)}
            className={`w-10 h-5 rounded-full relative transition-colors ${thinkingMode ? 'bg-pink-600' : 'bg-slate-700'}`}
        >
            <div className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-transform ${thinkingMode ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-950/30">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3 text-sm ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-sm'
                  : 'bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700'
              }`}
            >
              {msg.role === 'model' ? (
                 <div className="markdown-content">
                    <ReactMarkdown 
                        components={{
                            code({node, className, children, ...props}) {
                                return <code className={`${className} bg-slate-950/50 px-1 py-0.5 rounded text-indigo-300`} {...props}>{children}</code>
                            },
                            pre({node, children, ...props}) {
                                return <pre className="bg-slate-950/50 p-2 rounded-lg my-2 overflow-x-auto text-xs" {...props}>{children}</pre>
                            }
                        }}
                    >
                        {msg.content}
                    </ReactMarkdown>
                    {msg.content === '' && isLoading && (
                        <span className="flex items-center gap-1 text-slate-400 animate-pulse">
                            <Sparkles className="w-3 h-3" /> Thinking...
                        </span>
                    )}
                 </div>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 bg-slate-900 border-t border-slate-700 rounded-b-2xl">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={thinkingMode ? "Ask a complex question..." : "Type a message..."}
            className="w-full bg-slate-950 border border-slate-700 text-white text-sm rounded-xl py-3 pl-4 pr-12 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </form>
    </div>
  );
};
