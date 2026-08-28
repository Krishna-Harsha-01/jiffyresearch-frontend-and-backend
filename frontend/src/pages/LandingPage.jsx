import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  BrainCircuit, 
  Search, 
  FileText, 
  Network, 
  FileSpreadsheet, 
  ShieldCheck, 
  Zap, 
  ArrowRight,
  Database,
  Layers,
  Cpu,
  CheckCircle2,
  Lock,
  Globe,
  BarChart3,
  Bot,
  BookOpen,
  HelpCircle,
  Compass
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import UserManualModal from '../components/UserManualModal';

export default function LandingPage() {
  const { user } = useAuth();
  const [showManualModal, setShowManualModal] = useState(false);

  return (
    <div className="relative overflow-hidden bg-grid-pattern">
      
      {/* Background Decorative Glowing Spheres */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/15 to-pink-600/10 blur-3xl pointer-events-none -z-10 rounded-full animate-pulse" />
      <div className="absolute top-96 left-[-100px] w-96 h-96 bg-cyan-500/10 blur-3xl pointer-events-none -z-10 rounded-full" />
      <div className="absolute bottom-40 right-[-100px] w-96 h-96 bg-indigo-600/15 blur-3xl pointer-events-none -z-10 rounded-full" />

      {/* Recraft Studio Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative">
        
        {/* Recraft Full Hero Showcase Card */}
        <div className="bg-white dark:bg-[#09090b] p-6 sm:p-10 lg:p-12 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 relative overflow-hidden shadow-xl dark:shadow-2xl">
          
          {/* Subtle Background Glows */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#00F2FE]/10 dark:bg-[#c084fc]/10 blur-[100px] pointer-events-none rounded-full" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#0284c7]/10 dark:bg-[#d2f235]/10 blur-[100px] pointer-events-none rounded-full" />

          {/* Logo & Badge Header */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="w-11 sm:w-12 h-11 sm:h-12 rounded-2xl bg-gradient-to-br from-[#1a1c23] via-[#090a0f] to-[#050507] border border-[#c58b41]/60 shadow-lg flex items-center justify-center shrink-0">
              <span className="font-['Cinzel'] font-black text-2xl text-transparent bg-clip-text bg-gradient-to-b from-[#f3e0aa] via-[#d4af37] to-[#a67c1e] drop-shadow-md select-none">
                J
              </span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-700">
              <Sparkles className="w-4 h-4 text-[#d2f235]" />
              <span className="text-zinc-200 font-extrabold text-xs">Jiffy Research — Strategic Research & Insights</span>
            </div>
          </div>

          {/* Main Recraft Style Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-zinc-900 dark:text-white uppercase italic tracking-tight leading-[1.05] max-w-4xl mb-4">
            ACCELERATE <span className="text-[#0284c7] dark:text-[#d2f235] not-italic">ACADEMIC & RESEARCH</span> DISCOVERY
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-lg text-zinc-700 dark:text-zinc-300 max-w-3xl mb-6 leading-relaxed font-medium">
            Every synthesis report comes out grounded, structured, and analytically alive — because good literature reviews aren't just summaries. They're evocative.
          </p>

          {/* Recraft Pill CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <Link
              to={user ? "/dashboard" : "/register"}
              className="btn-recraft-lime px-6 py-3.5 rounded-full text-sm font-black flex items-center gap-2 shadow-xl"
            >
              {user ? "Go to My Workspace" : "Start creating free"}
              <ArrowRight className="w-4 h-4 text-black" />
            </Link>
            
            <button
              onClick={() => setShowManualModal(true)}
              className="btn-recraft-secondary px-6 py-3.5 rounded-full text-sm font-extrabold flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-[#0284c7] dark:text-[#d2f235]" />
              <span>User Guide & Manual</span>
            </button>
          </div>

          {/* 3 Step Feature Highlights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <div className="bg-zinc-50 dark:bg-[#121215] p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <div className="w-7 h-7 rounded-lg bg-[#d2f235] text-black font-black flex items-center justify-center text-xs mb-2">
                01
              </div>
              <h4 className="text-sm font-extrabold text-zinc-900 dark:text-white mb-1">Multi-Format Ingestion</h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                Parse PDFs, TXT, Markdown notes, CSV datasets with automatic Gemini extraction.
              </p>
            </div>

            <div className="bg-zinc-50 dark:bg-[#121215] p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <div className="w-7 h-7 rounded-lg bg-zinc-900 text-[#d2f235] dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-black flex items-center justify-center text-xs mb-2">
                02
              </div>
              <h4 className="text-sm font-extrabold text-zinc-900 dark:text-white mb-1">Knowledge Mesh Graph</h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                Visualize cross-document entity networks, dataset links, and spatial concept maps.
              </p>
            </div>

            <div className="bg-zinc-50 dark:bg-[#121215] p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-black font-black flex items-center justify-center text-xs mb-2">
                03
              </div>
              <h4 className="text-sm font-extrabold text-zinc-900 dark:text-white mb-1">400+ Word Synthesis</h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                Generate 6-part publication-grade reports with grounded citations and empirical evidence.
              </p>
            </div>
          </div>

        </div>

      </section>

      {/* Metrics Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-t border-zinc-200 dark:border-zinc-800">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-left">
          {[
            { metric: "10x", label: "Faster Literature Synthesis", icon: Zap },
            { metric: "100%", label: "Grounded Citations Trace", icon: ShieldCheck },
            { metric: "Multi-Format", label: "PDF, TXT, MD, CSV Parsing", icon: Layers },
            { metric: "Google AI", label: "Backend Google AI Engine", icon: Cpu }
          ].map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div key={idx} className="bg-white dark:bg-[#121215] p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-[#d2f235] border border-zinc-300 dark:border-zinc-700 flex items-center justify-center mb-2">
                  <IconComponent className="w-4 h-4" />
                </div>
                <div className="text-2xl font-black text-zinc-900 dark:text-white">{item.metric}</div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 font-bold">{item.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Problem & Solution Comparison */}
      <section id="problem-solution" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-zinc-200 dark:border-zinc-800">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white uppercase tracking-tight italic">Problem Statement & Innovative Solution</h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-xs mt-1 font-medium">Solving the core scenario-based challenge for researchers worldwide</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          
          {/* Problem Statement Card */}
          <div className="bg-white dark:bg-[#121215] p-6 rounded-2xl border border-rose-300 dark:border-rose-500/40 relative flex flex-col justify-between shadow-sm">
            <div>
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 flex items-center justify-center mb-4 font-bold">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-3 uppercase tracking-tight">The Real-World Research Challenge</h3>
              <p className="text-zinc-700 dark:text-zinc-300 text-xs leading-relaxed mb-4 font-medium">
                Researchers, academics, and decision-makers face severe <strong className="text-zinc-900 dark:text-white font-extrabold">information overload</strong> when attempting to find, organize, and synthesize knowledge across fragmented literature sources.
              </p>
              
              <div className="space-y-2">
                {[
                  "Time-consuming manual reading of dense academic PDFs",
                  "Isolated knowledge silos without cross-paper semantic synthesis",
                  "High risk of AI hallucinations without verifiable citations"
                ].map((prob, i) => (
                  <div key={i} className="flex items-start gap-2.5 bg-rose-50 dark:bg-rose-500/10 p-2.5 rounded-lg border border-rose-200 dark:border-rose-500/30 text-xs text-rose-900 dark:text-rose-300 font-bold">
                    <span className="w-2 h-2 rounded-full bg-rose-500 mt-1 shrink-0" />
                    <span>{prob}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Solution Description Card */}
          <div className="bg-white dark:bg-[#121215] p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 relative flex flex-col justify-between shadow-sm">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#00F2FE] dark:bg-[#d2f235] text-black flex items-center justify-center mb-4 shadow-md font-black">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-3 uppercase tracking-tight">Our Solution: Jiffy Research</h3>
              <p className="text-zinc-700 dark:text-zinc-300 text-xs leading-relaxed mb-4 font-medium">
                An end-to-end research intelligence studio that ingests multi-format papers, generates grounded answers with exact citations, visualizes concept networks, and produces publication-grade reports.
              </p>

              <div className="space-y-2">
                {[
                  "Multi-document context Q&A with Google Gemini AI API",
                  "Interactive Knowledge Mesh Graph for entity & relationship discovery",
                  "Automated 400+ Word Literature Review Matrix & Executive Brief generator"
                ].map((sol, i) => (
                  <div key={i} className="flex items-start gap-2.5 bg-zinc-100 dark:bg-zinc-900 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-200 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-[#0284c7] dark:text-[#d2f235] mt-0.5 shrink-0" />
                    <span>{sol}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Core Architectural Features & User Manual Guide Callout */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-zinc-200 dark:border-zinc-800">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white uppercase tracking-tight italic">Explore Platform Features & User Manual</h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-xs mt-1 mb-4 font-medium">Comprehensive guide explaining how to navigate and use the platform step-by-step</p>
          
          {/* User Manual Button in Explore Features */}
          <button
            onClick={() => setShowManualModal(true)}
            className="btn-recraft-lime px-6 py-3 rounded-full text-xs font-black inline-flex items-center gap-2 shadow-xl"
          >
            <BookOpen className="w-4 h-4 text-black" />
            <span>Open Step-by-Step User Manual & How-to-Use Guide</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: FileText,
              title: "Multi-Format Parsing",
              desc: "Ingest PDF, TXT, Markdown, and CSV files. Automatic extraction of abstracts, key insights, and domain entities."
            },
            {
              icon: Network,
              title: "Knowledge Mesh Graph",
              desc: "Dynamic AI Pie Chart visualizer mapping concepts, methodologies, datasets, and cross-document references."
            },
            {
              icon: FileSpreadsheet,
              title: "400+ Word Synthesis Reports",
              desc: "One-click generation of Literature Review Matrices, Executive Briefings, and Methodological Critiques."
            }
          ].map((feat, idx) => {
            const IconComp = feat.icon;
            return (
              <div key={idx} className="bg-white dark:bg-[#121215] p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all group">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 text-[#d2f235] dark:bg-[#d2f235] dark:text-black font-black flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-md">
                  <IconComp className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-zinc-900 dark:text-white mb-1 uppercase tracking-tight">{feat.title}</h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed font-medium">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-6 text-center text-xs text-zinc-400 font-medium flex flex-col items-center justify-center gap-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1a1c23] via-[#090a0f] to-[#050507] border border-[#c58b41]/60 shadow-md flex items-center justify-center shrink-0">
            <span className="font-['Cinzel'] font-black text-base text-transparent bg-clip-text bg-gradient-to-b from-[#f3e0aa] via-[#d4af37] to-[#a67c1e] select-none">
              J
            </span>
          </div>
          <div className="text-left leading-none">
            <span className="font-['Cinzel'] font-black text-white text-xs tracking-[0.12em] uppercase block">
              JIFFY RESEARCH
            </span>
            <span className="text-[6.5px] font-mono font-bold tracking-[0.22em] text-[#c58b41] uppercase block mt-0.5">
              STRATEGIC RESEARCH & INSIGHTS
            </span>
          </div>
        </div>
        <p className="mt-1 text-[11px] text-zinc-500 font-medium">© 2026 Jiffy Research — Strategic Research & Insights Solution.</p>
      </footer>

      {/* User Manual Modal */}
      <UserManualModal
        isOpen={showManualModal}
        onClose={() => setShowManualModal(false)}
      />

    </div>
  );
}
