import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, BookOpen, Quote, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { aiService } from '../services/api';

export default function ResearchChat({ workspaceId, initialMessages = [] }) {
  const [messages, setMessages] = useState(initialMessages);
  const [query, setQuery] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!query.trim() || sending) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      message: query,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentQuery = query;
    setQuery('');
    setSending(true);

    try {
      const res = await aiService.chat(workspaceId, currentQuery);
      if (res.data.success && res.data.chatMessage) {
        setMessages(prev => [...prev, res.data.chatMessage]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          sender: 'ai',
          message: '⚠️ Apologies, I encountered an issue synthesizing your research query. Please check your document upload status or API configuration.',
          citations: []
        }
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#121215] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl flex flex-col h-[650px]">
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-[#09090b] rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[#0284c7] dark:text-[#d2f235] border border-zinc-300 dark:border-zinc-700 flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-zinc-900 dark:text-white text-sm flex items-center gap-2 uppercase tracking-tight">
              Gemini AI Research Assistant
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-[#d2f235] border border-zinc-300 dark:border-zinc-700 font-bold">
                Grounding Active
              </span>
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">Ask questions, extract hypotheses, or request evidence synthesis across workspace files</p>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-[#0284c7] dark:text-[#d2f235] border border-zinc-300 dark:border-zinc-700 flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="font-black text-zinc-900 dark:text-white text-base uppercase tracking-tight">Start Research Dialogue</h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-sm mt-1 mb-4 font-medium">
              Ask questions about methodologies, key conclusions, empirical evidence, or literature gaps.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left w-full max-w-lg">
              {[
                "Synthesize the main empirical findings",
                "What methodology limitations are noted?",
                "Compare key evidence arguments across files",
                "Draft an executive briefing summary"
              ].map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => setQuery(prompt)}
                  className="p-3 text-xs bg-zinc-100 dark:bg-zinc-900 hover:border-[#0284c7] dark:hover:border-[#d2f235] text-zinc-900 dark:text-zinc-200 rounded-xl border border-zinc-300 dark:border-zinc-800 text-left transition-colors font-bold"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={msg.id || idx}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[#0284c7] dark:text-[#d2f235] border border-zinc-300 dark:border-zinc-700 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[85%] rounded-2xl p-4 text-sm ${
                msg.sender === 'user'
                  ? 'btn-recraft-lime text-black font-extrabold rounded-tr-none shadow-md'
                  : 'bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 rounded-tl-none font-medium'
              }`}>
                {msg.sender === 'user' ? (
                  <p>{msg.message}</p>
                ) : (
                  <div className="prose dark:prose-invert prose-xs max-w-none text-zinc-900 dark:text-zinc-200">
                    <ReactMarkdown>{msg.message}</ReactMarkdown>
                    
                    {/* Citations section */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                        <p className="text-[11px] font-black text-[#0284c7] dark:text-[#d2f235] flex items-center gap-1 mb-2 uppercase tracking-wide">
                          <BookOpen className="w-3.5 h-3.5" />
                          Grounded Citations & Evidence:
                        </p>
                        <div className="space-y-1.5">
                          {msg.citations.map((cit, cIdx) => (
                            <div key={cIdx} className="bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs">
                              <span className="font-extrabold text-zinc-900 dark:text-white block">📄 {cit.title}</span>
                              {cit.snippet && <p className="text-[11px] text-zinc-600 dark:text-zinc-400 italic mt-0.5">"{cit.snippet}"</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white dark:bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))
        )}
        
        {sending && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[#0284c7] dark:text-[#d2f235] border border-zinc-300 dark:border-zinc-700 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-zinc-50 dark:bg-[#09090b] px-4 py-3 rounded-2xl rounded-tl-none border border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#0284c7] dark:text-[#d2f235] animate-bounce" />
              <span className="text-xs text-zinc-600 dark:text-zinc-400 font-bold">Analyzing research context & synthesizing answer...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090b] rounded-b-2xl">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask a research question or request comparative analysis..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={sending}
            className="flex-1 bg-white dark:bg-[#18181b] text-zinc-900 dark:text-white placeholder-zinc-400 text-xs rounded-xl px-4 py-3 border border-zinc-300 dark:border-zinc-800 focus:outline-none focus:border-[#0284c7] dark:focus:border-[#d2f235] font-medium"
          />
          <button
            type="submit"
            disabled={sending || !query.trim()}
            className="btn-recraft-lime px-4 py-3 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-md disabled:opacity-50"
          >
            <Send className="w-4 h-4 text-black" />
            <span>Ask AI</span>
          </button>
        </div>
      </form>
    </div>
  );
}
