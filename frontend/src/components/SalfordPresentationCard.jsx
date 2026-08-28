import React from 'react';
import { Sparkles, ShieldCheck, ExternalLink, BookOpen } from 'lucide-react';

export default function SalfordPresentationCard({ 
  title = "Research Proposal Presentation", 
  subtitle = "Discovering Impact: The Contribution of Research to Society",
  date = "October 2026",
  presenter = "Presented by: Jiffy Research AI",
  children,
  badgeText = "AI SYNTHESIS TEMPLATE"
}) {
  return (
    <div className="bg-gradient-to-br from-[#2d040e] via-[#420614] to-[#1a0208] text-white rounded-[2.5rem] p-6 sm:p-10 lg:p-12 border border-[#5c0f20] shadow-2xl relative overflow-hidden my-6">
      
      {/* Background Decorative Glass Orbs */}
      <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-[#8a1431]/25 blur-[90px] pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-[#610a1f]/30 blur-[100px] pointer-events-none" />
      <div className="absolute top-8 right-1/3 w-16 h-16 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm pointer-events-none hidden sm:block" />
      <div className="absolute bottom-16 left-1/4 w-10 h-10 rounded-full bg-white/5 border border-white/10 pointer-events-none hidden sm:block" />

      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-4 mb-8 relative z-10 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1a1c23] via-[#090a0f] to-[#050507] border border-[#c58b41]/60 shadow-md flex items-center justify-center shrink-0">
            <span className="font-['Cinzel'] font-black text-xl text-transparent bg-clip-text bg-gradient-to-b from-[#f3e0aa] via-[#d4af37] to-[#a67c1e] select-none">
              J
            </span>
          </div>
          <div className="leading-none">
            <span className="font-['Cinzel'] font-black text-sm tracking-[0.14em] text-white uppercase block">
              JIFFY RESEARCH
            </span>
            <span className="text-[7px] font-mono font-bold tracking-[0.24em] text-[#c58b41] uppercase block mt-1">
              STRATEGIC RESEARCH & INSIGHTS
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-white/10 border border-white/20 text-rose-100">
            {date}
          </span>
        </div>
      </div>

      {/* Main Inner White Card (Salford Style) */}
      <div className="bg-white text-[#2b040d] rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 shadow-2xl border border-[#4a0d1a] relative z-10 mb-8">
        
        {/* Card Header Badge & Title */}
        <div className="mb-6 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#fce8eb] text-[#3b0914] border border-[#f5c2ca] text-[11px] font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#3b0914]" />
            <span>{badgeText}</span>
          </div>
          
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-[#2b040d] tracking-tight uppercase leading-snug break-words max-w-full">
            {title}
          </h2>
          
          {subtitle && (
            <p className="text-xs sm:text-sm text-[#4a0d1a] font-bold border-l-4 border-[#3b0914] pl-3 py-0.5 leading-relaxed break-words">
              {subtitle}
            </p>
          )}
        </div>

        {/* Dynamic Children Content (Markdown Report / Summary / Key Takeaways) */}
        <div className="salford-template-body text-[#2b040d] text-xs sm:text-sm leading-relaxed font-medium">
          {children}
        </div>
      </div>

      {/* Bottom Footer Presentation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 relative z-10 pt-2">
        <div className="bg-white text-[#2b040d] font-black px-6 py-3 rounded-full shadow-lg text-xs sm:text-sm flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#3b0914]" />
          <span>{presenter}</span>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono font-bold text-rose-100/90">
          <span className="px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
            +100% Grounded Evidence
          </span>
        </div>
      </div>

    </div>
  );
}
