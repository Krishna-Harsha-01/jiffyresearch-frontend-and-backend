import React, { useState } from 'react';
import { 
  BookOpen, 
  X, 
  Sparkles, 
  FolderPlus, 
  Upload, 
  Bot, 
  Network, 
  FileSpreadsheet, 
  HelpCircle, 
  CheckCircle2,
  FileText,
  ShieldCheck,
  ChevronRight,
  StickyNote,
  Layers
} from 'lucide-react';

export default function UserManualModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('getting_started'); // 'getting_started', 'tabs_guide', 'workflow', 'faq'

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#09090b] dark:bg-[#09090b] light:bg-white w-full max-w-3xl h-[85vh] p-6 sm:p-8 rounded-[2rem] border border-zinc-800 dark:border-zinc-800 light:border-zinc-200 shadow-2xl relative flex flex-col justify-between overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-200 text-zinc-300 dark:text-zinc-300 light:text-zinc-700 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 shrink-0">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#1a1c23] via-[#090a0f] to-[#050507] border border-[#c58b41]/60 shadow-lg flex items-center justify-center shrink-0">
            <span className="font-['Cinzel'] font-black text-2xl text-transparent bg-clip-text bg-gradient-to-b from-[#f3e0aa] via-[#d4af37] to-[#a67c1e] select-none">
              J
            </span>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white dark:text-white light:text-zinc-900 flex items-center gap-2 uppercase tracking-tight italic">
              Jiffy Research — Comprehensive User Manual
            </h2>
            <p className="text-xs text-zinc-400 dark:text-zinc-400 light:text-zinc-600 font-medium">Detailed guide explaining what every feature does & how to navigate</p>
          </div>
        </div>

        {/* Manual Tab Buttons */}
        <div className="flex items-center gap-2 border-b border-zinc-800 dark:border-zinc-800 light:border-zinc-200 pb-3 mb-6 overflow-x-auto shrink-0">
          {[
            { id: 'getting_started', label: '1. Overview & First Step', icon: Sparkles },
            { id: 'tabs_guide', label: '2. What Each Feature Does', icon: Layers },
            { id: 'workflow', label: '3. Step-by-Step Workflow', icon: FolderPlus },
            { id: 'faq', label: '4. Frequently Asked Questions', icon: HelpCircle }
          ].map((tab) => {
            const IconComp = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full text-xs font-extrabold flex items-center gap-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-[#d2f235] text-black font-black shadow-md'
                    : 'text-zinc-400 dark:text-zinc-400 light:text-zinc-600 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <IconComp className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Box */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-6 text-zinc-300 dark:text-zinc-300 light:text-zinc-700 text-xs sm:text-sm leading-relaxed">
          
          {/* TAB 1: Getting Started & First Step */}
          {activeTab === 'getting_started' && (
            <div className="space-y-4">
              <div className="bg-[#121215] dark:bg-[#121215] light:bg-zinc-50 p-5 rounded-2xl border border-zinc-800 dark:border-zinc-800 light:border-zinc-200">
                <h3 className="text-base font-black text-white dark:text-white light:text-zinc-900 mb-2 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#d2f235]" />
                  What is Jiffy Research Studio & How is it Useful?
                </h3>
                <p className="text-zinc-300 dark:text-zinc-300 light:text-zinc-700 text-xs leading-relaxed font-medium">
                  Jiffy Research Studio is an intelligent research workspace designed to solve <strong className="text-white dark:text-white light:text-zinc-900 font-bold">information overload</strong>. Instead of reading dozens of complex PDFs manually, Jiffy Research Studio analyzes all your research papers together, extracts key findings, answers questions with grounded citations, and generates literature matrices.
                </p>
              </div>

              <div className="bg-[#121215] dark:bg-[#121215] light:bg-zinc-50 p-5 rounded-2xl border border-zinc-800 dark:border-zinc-800 light:border-zinc-200">
                <h3 className="text-base font-black text-white dark:text-white light:text-zinc-900 mb-3 flex items-center gap-2">
                  <ChevronRight className="w-5 h-5 text-[#d2f235]" />
                  What is the FIRST Step to Do?
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 bg-zinc-900 dark:bg-zinc-900 light:bg-white p-3 rounded-xl border border-zinc-800 dark:border-zinc-800 light:border-zinc-300">
                    <span className="w-6 h-6 rounded-full bg-[#d2f235] text-black font-black text-xs flex items-center justify-center shrink-0">1</span>
                    <div>
                      <strong className="text-white dark:text-white light:text-zinc-900 block font-bold">Create or Log In to your Account</strong>
                      <p className="text-xs text-zinc-400 dark:text-zinc-400 light:text-zinc-600 font-medium">Sign up with your email and password (or log in if you already have an account).</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-zinc-900 dark:bg-zinc-900 light:bg-white p-3 rounded-xl border border-zinc-800 dark:border-zinc-800 light:border-zinc-300">
                    <span className="w-6 h-6 rounded-full bg-[#d2f235] text-black font-black text-xs flex items-center justify-center shrink-0">2</span>
                    <div>
                      <strong className="text-white dark:text-white light:text-zinc-900 block font-bold">Create your First Research Workspace</strong>
                      <p className="text-xs text-zinc-400 dark:text-zinc-400 light:text-zinc-600 font-medium">On your Dashboard, click <strong className="text-[#d2f235]">"+ New Research Project"</strong>. Give it a name (e.g. "Climate Policy Review") and domain.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-zinc-900 dark:bg-zinc-900 light:bg-white p-3 rounded-xl border border-zinc-800 dark:border-zinc-800 light:border-zinc-300">
                    <span className="w-6 h-6 rounded-full bg-[#d2f235] text-black font-black text-xs flex items-center justify-center shrink-0">3</span>
                    <div>
                      <strong className="text-white dark:text-white light:text-zinc-900 block font-bold">Upload Research Documents</strong>
                      <p className="text-xs text-zinc-400 dark:text-zinc-400 light:text-zinc-600 font-medium">Inside your workspace, click <strong className="text-[#d2f235]">"Upload Document"</strong> (PDF, TXT, MD, CSV) or paste research text. Google Gemini AI will instantly summarize it!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Detailed Feature Breakdown (What Each Tab Does) */}
          {activeTab === 'tabs_guide' && (
            <div className="space-y-4">
              <h3 className="text-base font-black text-white dark:text-white light:text-zinc-900 mb-2">Detailed Guide: What Each Workspace Feature Does</h3>
              
              <div className="space-y-4">
                
                {/* 1. Documents & Summaries */}
                <div className="bg-[#121215] dark:bg-[#121215] light:bg-zinc-50 p-5 rounded-2xl border border-zinc-800 dark:border-zinc-800 light:border-zinc-200 space-y-2">
                  <div className="flex items-center gap-2 text-[#d2f235] font-bold text-sm">
                    <FileText className="w-4 h-4 text-[#d2f235]" /> 1. Documents & Summaries
                  </div>
                  <p className="text-xs text-zinc-300 dark:text-zinc-300 light:text-zinc-700 leading-relaxed font-medium">
                    <strong className="text-white dark:text-white light:text-zinc-900">What it does:</strong> Upload research PDFs, TXT, Markdown files, or CSV datasets (or paste raw text). Using `pdf-parse` and Google Gemini AI, the backend automatically extracts executive summaries, empirical findings, and entity tags.
                  </p>
                </div>

                {/* 2. Gemini Research Assistant */}
                <div className="bg-[#121215] dark:bg-[#121215] light:bg-zinc-50 p-5 rounded-2xl border border-zinc-800 dark:border-zinc-800 light:border-zinc-200 space-y-2">
                  <div className="flex items-center gap-2 text-[#d2f235] font-bold text-sm">
                    <Bot className="w-4 h-4 text-[#d2f235]" /> 2. Gemini Research Assistant (AI Chat)
                  </div>
                  <p className="text-xs text-zinc-300 dark:text-zinc-300 light:text-zinc-700 leading-relaxed font-medium">
                    <strong className="text-white dark:text-white light:text-zinc-900">What it does:</strong> Natural language Q&A dialogue grounded across all uploaded workspace documents with direct quote citations.
                  </p>
                </div>

                {/* 3. Knowledge Mesh Graph */}
                <div className="bg-[#121215] dark:bg-[#121215] light:bg-zinc-50 p-5 rounded-2xl border border-zinc-800 dark:border-zinc-800 light:border-zinc-200 space-y-2">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <Network className="w-4 h-4 text-white" /> 3. Knowledge Mesh Graph
                  </div>
                  <p className="text-xs text-zinc-300 dark:text-zinc-300 light:text-zinc-700 leading-relaxed font-medium">
                    <strong className="text-white dark:text-white light:text-zinc-900">What it does:</strong> Interactive visual AI Pie Chart diagram mapping extracted research concepts, methodologies, datasets, and paper relationships.
                  </p>
                </div>

                {/* 4. Synthesis Reports */}
                <div className="bg-[#121215] dark:bg-[#121215] light:bg-zinc-50 p-5 rounded-2xl border border-zinc-800 dark:border-zinc-800 light:border-zinc-200 space-y-2">
                  <div className="flex items-center gap-2 text-[#d2f235] font-bold text-sm">
                    <FileSpreadsheet className="w-4 h-4 text-[#d2f235]" /> 4. Synthesis Reports (400+ Words)
                  </div>
                  <p className="text-xs text-zinc-300 dark:text-zinc-300 light:text-zinc-700 leading-relaxed font-medium">
                    <strong className="text-white dark:text-white light:text-zinc-900">What it does:</strong> 1-click generation of publication-grade 400+ word research synthesis reports with 6 structured sections.
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: Step-by-Step Workflow */}
          {activeTab === 'workflow' && (
            <div className="space-y-4">
              <h3 className="text-base font-black text-white dark:text-white light:text-zinc-900">5-Step Complete Research Workflow Guide</h3>
              
              <div className="space-y-3">
                {[
                  { step: "Step 1: Workspace Organization", desc: "Group papers into dedicated project folders by academic discipline.", icon: FolderPlus },
                  { step: "Step 2: Paper Ingestion & Parsing", desc: "Upload PDFs or TXT files. Backend calls Gemini AI for instant key insight extraction.", icon: Upload },
                  { step: "Step 3: Grounded Gemini AI Dialogue", desc: "Ask research questions with exact quote citations.", icon: Bot },
                  { step: "Step 4: Knowledge Mesh Exploration", desc: "Visualize AI Pie Chart breakdown mapping entities and methodologies.", icon: Network },
                  { step: "Step 5: Synthesis Report Export", desc: "Click 'Synthesize Report' to auto-generate a 400+ word structured report.", icon: FileSpreadsheet }
                ].map((item, idx) => {
                  const IconComponent = item.icon;
                  return (
                    <div key={idx} className="bg-[#121215] dark:bg-[#121215] light:bg-zinc-50 p-4 rounded-xl border border-zinc-800 dark:border-zinc-800 light:border-zinc-200 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#d2f235] text-black font-black flex items-center justify-center shrink-0">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white dark:text-white light:text-zinc-900 text-xs sm:text-sm">{item.step}</h4>
                        <p className="text-xs text-zinc-400 dark:text-zinc-400 light:text-zinc-600 font-medium mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: FAQ */}
          {activeTab === 'faq' && (
            <div className="space-y-4">
              {[
                { q: "Is my research data secure?", a: "Yes. All Google Gemini API keys and database secrets are stored strictly in backend environment variables." },
                { q: "Can I delete my account anytime?", a: "Yes! Click the 'Delete' button in the top navigation bar to permanently wipe your user profile." },
                { q: "What file formats are supported?", a: "You can upload PDF files, TXT files, Markdown (.md) documents, and CSV datasets up to 15MB each." }
              ].map((faq, i) => (
                <div key={i} className="bg-[#121215] dark:bg-[#121215] light:bg-zinc-50 p-4 rounded-xl border border-zinc-800 dark:border-zinc-800 light:border-zinc-200">
                  <strong className="text-white dark:text-white light:text-zinc-900 text-xs sm:text-sm block mb-1 font-bold">Q: {faq.q}</strong>
                  <p className="text-xs text-zinc-400 dark:text-zinc-400 light:text-zinc-600 font-medium leading-relaxed">A: {faq.a}</p>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Footer Close Button */}
        <div className="pt-4 border-t border-zinc-800 dark:border-zinc-800 light:border-zinc-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="btn-recraft-lime px-6 py-2.5 rounded-full text-xs font-black"
          >
            Got It! Close Manual
          </button>
        </div>

      </div>
    </div>
  );
}
