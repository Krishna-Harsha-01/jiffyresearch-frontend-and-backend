import React, { useState } from 'react';
import { FileSpreadsheet, Sparkles, X, CheckCircle, FileText } from 'lucide-react';
import { reportService } from '../services/api';

export default function ReportGeneratorModal({ workspaceId, isOpen, onClose, onReportGenerated }) {
  const [reportType, setReportType] = useState('literature_review');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    try {
      const res = await reportService.generate(workspaceId, reportType);
      if (res.data.success && res.data.report) {
        onReportGenerated(res.data.report);
        onClose();
      }
    } catch (err) {
      console.error('Report generation error:', err);
      setError('Failed to generate report. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const reportOptions = [
    {
      id: 'literature_review',
      title: 'Literature Review & Synthesis Matrix',
      description: 'Generates a structured comparative literature matrix across all workspace research papers.'
    },
    {
      id: 'executive_brief',
      title: 'Executive Evidence Briefing',
      description: 'High-level executive summary summarizing core conclusions for decision-makers.'
    },
    {
      id: 'methodology_critique',
      title: 'Methodological Analysis & Gaps',
      description: 'Detailed critique of research methods, potential biases, and unaddressed scientific gaps.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-gradient-to-br from-[#2d040e] via-[#420614] to-[#1a0208] text-white w-full max-w-lg rounded-[2rem] p-6 sm:p-8 border border-[#5c0f20] shadow-2xl relative overflow-hidden">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-white text-[#2b040d] border border-[#4a0d1a] flex items-center justify-center shrink-0 shadow-lg font-black">
            <FileSpreadsheet className="w-6 h-6 text-[#3b0914]" />
          </div>
          <div>
            <h3 className="font-black text-white text-base sm:text-lg flex items-center gap-2 uppercase tracking-tight">
              Generate Research Report
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white text-[#2b040d] font-mono font-black">
                400+ Words
              </span>
            </h3>
            <p className="text-xs text-rose-200/80 font-medium">Select Salford & Co. template to synthesize publication-grade research analysis</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-100 text-xs font-bold">
            {error}
          </div>
        )}

        <div className="space-y-3 mb-6">
          {reportOptions.map((opt) => (
            <div
              key={opt.id}
              onClick={() => setReportType(opt.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                reportType === opt.id
                  ? 'bg-white text-[#2b040d] border-white shadow-xl'
                  : 'bg-white/5 border-white/15 text-white hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <h4 className={`font-black text-sm flex items-center gap-2 uppercase ${reportType === opt.id ? 'text-[#2b040d]' : 'text-white'}`}>
                  <FileText className={`w-4 h-4 ${reportType === opt.id ? 'text-[#3b0914]' : 'text-rose-200'}`} />
                  {opt.title}
                </h4>
                {reportType === opt.id && <CheckCircle className="w-4 h-4 text-[#3b0914]" />}
              </div>
              <p className={`text-xs font-medium ${reportType === opt.id ? 'text-[#4a0d1a]' : 'text-rose-100/80'}`}>{opt.description}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold text-rose-200 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-6 py-3 rounded-full bg-white text-[#2b040d] hover:bg-rose-50 font-black text-xs flex items-center gap-2 shadow-xl transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-[#3b0914]" />
            <span>{generating ? 'Synthesizing 400+ Words...' : 'Generate Presentation Report'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
