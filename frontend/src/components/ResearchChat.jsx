import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  BookOpen, 
  Quote, 
  AlertCircle, 
  Trash2, 
  Plus, 
  History, 
  ChevronRight, 
  MessageSquare, 
  Clock, 
  X,
  Check
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { aiService } from '../services/api';

export default function ResearchChat({ workspaceId, initialMessages = [] }) {
  const [activeSessionId, setActiveSessionId] = useState(`session_${Date.now()}`);
  const [sessions, setSessions] = useState([]);
  const [messages, setMessages] = useState(initialMessages);
  const [query, setQuery] = useState('');
  const [sending, setSending] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch all chat sessions for this workspace (up to 10)
  const loadSessions = async () => {
    try {
      const res = await aiService.getChatSessions(workspaceId);
      if (res.data.success && Array.isArray(res.data.sessions)) {
        setSessions(res.data.sessions.slice(0, 10));
      }
    } catch (e) {
      console.warn('Could not load chat sessions:', e);
    }
  };

  useEffect(() => {
    loadSessions();
  }, [workspaceId]);

  useEffect(() => {
    if (initialMessages && initialMessages.length > 0 && messages.length === 0) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Start a fresh new chat session
  const handleNewChat = () => {
    const newSessionId = `session_${Date.now()}`;
    setActiveSessionId(newSessionId);
    setMessages([]);
    setQuery('');
    loadSessions();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Select an existing past chat session
  const handleSelectSession = (session) => {
    setActiveSessionId(session.id);
    setMessages(session.messages || []);
    setQuery('');
    setShowHistoryPanel(false);
  };

  // Delete a specific session
  const handleDeleteSession = async (e, sessionId) => {
    e.stopPropagation();
    try {
      await aiService.deleteChatSession(workspaceId, sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (activeSessionId === sessionId) {
        handleNewChat();
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  // Clear current chat
  const handleClearChat = async () => {
    setClearing(true);
    try {
      await aiService.clearChat(workspaceId);
      setMessages([]);
      setSessions([]);
      setQuery('');
      setShowClearConfirm(false);
    } catch (err) {
      console.error('Failed to clear chat:', err);
      setMessages([]);
      setShowClearConfirm(false);
    } finally {
      setClearing(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!query.trim() || sending) return;

    const userMessage = {
      id: Date.now(),
      workspace_id: workspaceId,
      session_id: activeSessionId,
      sender: 'user',
      message: query,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentQuery = query;
    setQuery('');
    setSending(true);

    try {
      const res = await aiService.chat(workspaceId, currentQuery, activeSessionId);
      if (res.data.success && res.data.chatMessage) {
        setMessages(prev => [...prev, res.data.chatMessage]);
        loadSessions(); // Refresh sessions list in background
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
    <div className="bg-white dark:bg-[#121215] rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col h-[680px] relative overflow-hidden">
      
      {/* Header Bar */}
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-[#09090b] rounded-t-3xl flex-wrap gap-3 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-[#0284c7] dark:text-[#d2f235] border border-zinc-300 dark:border-zinc-700 flex items-center justify-center shadow-inner">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-zinc-900 dark:text-white text-sm flex items-center gap-2 uppercase tracking-tight font-['Cinzel']">
              Gemini AI Research Assistant
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-[#d2f235] border border-zinc-300 dark:border-zinc-700 font-bold font-sans">
                Grounding Active
              </span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              Multi-turn synthesis & grounded citations across workspace files
            </p>
          </div>
        </div>

        {/* Action Controls: Previous Chats, New Chat & Clear */}
        <div className="flex items-center gap-2">
          {/* Previous Chats Toggle */}
          <button
            type="button"
            onClick={() => setShowHistoryPanel(!showHistoryPanel)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              showHistoryPanel
                ? 'bg-[#0284c7]/10 dark:bg-[#d2f235]/15 text-[#0284c7] dark:text-[#d2f235] border-[#0284c7]/30 dark:border-[#d2f235]/40'
                : 'border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
            title="View up to 10 previous chats"
          >
            <History className="w-3.5 h-3.5" />
            <span>Previous Chats ({sessions.length}/10)</span>
          </button>

          {/* New Chat Button */}
          <button
            type="button"
            onClick={handleNewChat}
            className="px-3.5 py-1.5 rounded-xl btn-recraft-lime text-black font-black text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            title="Start fresh conversation"
          >
            <Plus className="w-3.5 h-3.5 text-black" />
            <span>New Chat</span>
          </button>

          {/* Clear Current / All Chat */}
          {(messages.length > 0 || sessions.length > 0) && (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="p-2 rounded-xl border border-zinc-300 dark:border-zinc-700/80 hover:border-rose-500/60 hover:bg-rose-500/10 text-zinc-500 dark:text-zinc-400 hover:text-rose-400 text-xs transition-all cursor-pointer"
              title="Clear all chat history"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area (Messages + Slide-in History Drawer) */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 text-[#0284c7] dark:text-[#d2f235] border border-zinc-300 dark:border-zinc-700 flex items-center justify-center mb-3 shadow-inner">
                <Sparkles className="w-7 h-7" />
              </div>
              <h4 className="font-black text-zinc-900 dark:text-white text-base uppercase tracking-tight font-['Cinzel']">
                Start Research Dialogue
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mt-1 mb-5 font-medium">
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
                    className="p-3 text-xs bg-zinc-50 dark:bg-zinc-900 hover:border-[#0284c7] dark:hover:border-[#d2f235] text-zinc-800 dark:text-zinc-200 rounded-xl border border-zinc-200 dark:border-zinc-800 text-left transition-colors font-bold cursor-pointer"
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
                  <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[#0284c7] dark:text-[#d2f235] border border-zinc-300 dark:border-zinc-700 flex items-center justify-center shrink-0 shadow-sm">
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
                  <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white dark:bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 shadow-sm">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))
          )}
          
          {sending && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[#0284c7] dark:text-[#d2f235] border border-zinc-300 dark:border-zinc-700 flex items-center justify-center shrink-0">
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

        {/* Slide-out Previous Chats Sidebar (Up to 10 Chats) */}
        {showHistoryPanel && (
          <div className="w-72 sm:w-80 border-l border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0c0d12] flex flex-col z-20 animate-in slide-in-from-right duration-200">
            
            {/* Sidebar Header */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#0284c7] dark:text-[#d2f235]" />
                <span className="text-xs font-black uppercase tracking-tight text-zinc-900 dark:text-white">
                  Previous Chats ({sessions.length}/10)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryPanel(false)}
                className="text-zinc-400 hover:text-zinc-200 p-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sessions List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {sessions.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <MessageSquare className="w-8 h-8 text-zinc-400 dark:text-zinc-600 mx-auto mb-2 opacity-50" />
                  <p className="text-xs text-zinc-500 font-medium">No previous conversations yet.</p>
                  <p className="text-[10px] text-zinc-400 mt-1">When you chat and start new sessions, up to 10 past chats are saved here.</p>
                </div>
              ) : (
                sessions.map((session, idx) => {
                  const isActive = activeSessionId === session.id;
                  return (
                    <div
                      key={session.id || idx}
                      onClick={() => handleSelectSession(session)}
                      className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex items-start justify-between gap-2 group ${
                        isActive
                          ? 'bg-[#0284c7]/10 dark:bg-[#d2f235]/10 border-[#0284c7]/40 dark:border-[#d2f235]/40 shadow-sm'
                          : 'bg-white dark:bg-[#18181b] border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-zinc-900 dark:text-white truncate flex items-center gap-1.5">
                          {isActive && <span className="w-2 h-2 rounded-full bg-[#0284c7] dark:bg-[#d2f235] shrink-0" />}
                          <span className="truncate">{session.title || `Conversation #${idx + 1}`}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(session.created_at || Date.now()).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span>•</span>
                          <span>{session.messages?.length || 0} msgs</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteSession(e, session.id)}
                        className="text-zinc-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        title="Delete chat session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Footer Action */}
            <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-[#09090b]/50">
              <button
                type="button"
                onClick={handleNewChat}
                className="w-full py-2 rounded-xl btn-recraft-lime text-black font-black text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-black" />
                <span>+ Start New Chat</span>
              </button>
            </div>

          </div>
        )}

      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090b] rounded-b-3xl">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
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
            className="btn-recraft-lime px-4 py-3 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-md disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-4 h-4 text-black" />
            <span>Ask AI</span>
          </button>
        </div>
      </form>

      {/* Clear Chat Confirmation Modal */}
      {showClearConfirm && (
        <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm rounded-3xl flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-700 p-6 rounded-3xl max-w-sm w-full shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight">Clear All Chat History?</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
                This will permanently delete all messages and saved chat sessions in this workspace.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={clearing}
                onClick={handleClearChat}
                className="px-4 py-2 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                {clearing ? 'Clearing...' : 'Yes, Clear All'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
