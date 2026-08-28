import React, { useState } from 'react';
import { 
  Sparkles, 
  FolderPlus, 
  Upload, 
  Bot, 
  Network, 
  FileSpreadsheet, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';

export default function OnboardingModal({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: "Welcome to Jiffy Research! 🚀",
      subtitle: "Accelerate your research literature review & knowledge discovery",
      icon: Sparkles,
      color: "from-indigo-600 to-purple-600",
      content: (
        <div className="space-y-3 text-xs text-zinc-300 dark:text-zinc-300 light:text-zinc-700 font-medium">
          <p>
            Jiffy Research helps researchers, students, and professionals analyze dense research papers, synthesize evidence, and discover insights using Google Gemini AI.
          </p>
          <div className="bg-zinc-900 dark:bg-zinc-900 light:bg-zinc-100 p-3 rounded-xl border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 text-zinc-200 dark:text-zinc-200 light:text-zinc-900 font-bold">
            <strong>Why it's useful:</strong> Instead of spending days reading isolated PDFs, Jiffy Research analyzes all your documents together, grounds every AI answer with verifiable citations, and auto-generates literature review matrices.
          </div>
        </div>
      )
    },
    {
      title: "Step 1: Create a Research Workspace 📁",
      subtitle: "Organize your papers by domain or research project",
      icon: FolderPlus,
      color: "from-purple-600 to-pink-600",
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p>
            Your first step is to click <strong className="text-white">"+ New Research Project"</strong> on your dashboard.
          </p>
          <ul className="space-y-2 font-mono text-[11px] bg-slate-900 p-3 rounded-xl border border-slate-800">
            <li className="flex items-center gap-2 text-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              Give your workspace a title (e.g., "AI Benchmarks 2026")
            </li>
            <li className="flex items-center gap-2 text-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              Select your domain (CS, Healthcare, Economics, etc.)
            </li>
          </ul>
        </div>
      )
    },
    {
      title: "Step 2: Ingest Research Materials 📄",
      subtitle: "Upload PDFs, TXTs, Markdown, CSV, or paste text",
      icon: Upload,
      color: "from-cyan-600 to-indigo-600",
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p>
            Inside your workspace, drag and drop research papers or paste raw text. The Gemini AI engine automatically:
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 font-semibold text-slate-200">
              ✓ Generates Executive Summaries
            </div>
            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 font-semibold text-slate-200">
              ✓ Extracts Empirical Findings
            </div>
            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 font-semibold text-slate-200">
              ✓ Tags Key Entity Concepts
            </div>
            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 font-semibold text-slate-200">
              ✓ Parses PDF Tables & Text
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Step 3: Query Gemini AI Assistant 🤖",
      subtitle: "Ask questions grounded in your uploaded documents",
      icon: Bot,
      color: "from-indigo-600 to-emerald-600",
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p>
            Switch to the <strong className="text-white">"Gemini Research Assistant"</strong> tab to ask complex research questions.
          </p>
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-[11px]">
            <span className="text-indigo-400 font-bold block mb-1">Grounded Citations Guarantee:</span>
            Every AI answer cites exact quotes and paper titles from your uploaded files so you can verify evidence instantly!
          </div>
        </div>
      )
    },
    {
      title: "Step 4: Explore Graph & Export Reports 📊",
      subtitle: "Visualize concept networks and export literature matrices",
      icon: FileSpreadsheet,
      color: "from-purple-600 to-indigo-600",
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p>
            Use the <strong className="text-white">Knowledge Mesh Graph</strong> tab to see how concepts connect visually across documents.
          </p>
          <p>
            Click <strong className="text-purple-300">"Synthesize Report"</strong> to generate a formatted Literature Review Matrix or Executive Brief in seconds!
          </p>
        </div>
      )
    }
  ];

  const current = steps[currentStep];
  const IconComp = current.icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#09090b] dark:bg-[#09090b] light:bg-white w-full max-w-lg p-6 sm:p-8 rounded-[2rem] border border-zinc-800 dark:border-zinc-800 light:border-zinc-200 shadow-2xl relative overflow-hidden">
        
        {/* Skip Tutorial Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-xs font-bold px-3.5 py-1.5 rounded-full bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-200 text-zinc-300 dark:text-zinc-300 light:text-zinc-700 hover:text-white transition-colors flex items-center gap-1"
        >
          Skip Tutorial <X className="w-3.5 h-3.5" />
        </button>

        {/* Header Icon & Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#1a1c23] via-[#090a0f] to-[#050507] border border-[#c58b41]/60 shadow-lg flex items-center justify-center shrink-0">
            <span className="font-['Cinzel'] font-black text-2xl text-transparent bg-clip-text bg-gradient-to-b from-[#f3e0aa] via-[#d4af37] to-[#a67c1e] select-none">
              J
            </span>
          </div>
          <div>
            <h3 className="font-black text-white dark:text-white light:text-zinc-900 text-base sm:text-lg uppercase tracking-tight italic">{current.title}</h3>
            <p className="text-xs text-zinc-400 dark:text-zinc-400 light:text-zinc-600 font-medium">{current.subtitle}</p>
          </div>
        </div>

        {/* Step Content */}
        <div className="py-4 border-y border-zinc-800 dark:border-zinc-800 light:border-zinc-200 min-h-[140px] flex items-center text-zinc-300 dark:text-zinc-300 light:text-zinc-700 font-medium">
          {current.content}
        </div>

        {/* Footer Controls & Progress Dots */}
        <div className="flex items-center justify-between pt-5">
          
          {/* Progress Indicators */}
          <div className="flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <div
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`h-2 rounded-full cursor-pointer transition-all ${
                  idx === currentStep
                    ? 'w-6 bg-[#d2f235]'
                    : 'w-2 bg-zinc-800 hover:bg-zinc-700'
                }`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="px-3.5 py-2 rounded-full text-xs font-bold text-zinc-400 hover:text-white bg-zinc-800 border border-zinc-700 transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            )}

            <button
              onClick={handleNext}
              className="btn-recraft-lime px-5 py-2 rounded-full text-xs font-black flex items-center gap-1.5 shadow-md"
            >
              {currentStep === steps.length - 1 ? (
                <>Get Started Now <CheckCircle className="w-4 h-4 text-black" /></>
              ) : (
                <>Next Step <ArrowRight className="w-3.5 h-3.5 text-black" /></>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
