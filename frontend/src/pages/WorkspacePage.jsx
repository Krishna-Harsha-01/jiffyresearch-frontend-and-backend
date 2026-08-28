import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Upload, 
  Bot, 
  Network, 
  FileSpreadsheet, 
  StickyNote, 
  Sparkles, 
  Trash2, 
  Plus, 
  ArrowLeft,
  BookOpen,
  CheckCircle,
  Eye
} from 'lucide-react';
import { workspaceService, documentService, aiService, reportService } from '../services/api';
import KnowledgeGraph from '../components/KnowledgeGraph';
import ResearchChat from '../components/ResearchChat';
import ReportGeneratorModal from '../components/ReportGeneratorModal';
import SalfordPresentationCard from '../components/SalfordPresentationCard';
import ReactMarkdown from 'react-markdown';

export default function WorkspacePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('documents'); // 'documents', 'chat', 'graph', 'notes', 'reports'
  
  // Document Upload State
  const [uploading, setUploading] = useState(false);
  const [pasteMode, setPasteMode] = useState(false);
  const [rawTitle, setRawTitle] = useState('');
  const [rawContent, setRawContent] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);

  const triggerFileInput = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Notes State
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTag, setNoteTag] = useState('Key Finding');

  // Report Modal State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const fetchWorkspace = async () => {
    try {
      const res = await workspaceService.getById(id);
      if (res.data.success) {
        setWorkspace(res.data.workspace);
        if (res.data.workspace.documents?.length > 0 && !selectedDoc) {
          setSelectedDoc(res.data.workspace.documents[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch workspace:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspace();
  }, [id]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('workspaceId', id);

    try {
      const res = await documentService.upload(formData);
      if (res.data.success) {
        await fetchWorkspace();
        setSelectedDoc(res.data.document);
      }
    } catch (err) {
      console.error('Upload failed:', err);
      alert(err.response?.data?.error || 'Document processing failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleTextPasteUpload = async (e) => {
    e.preventDefault();
    if (!rawContent.trim()) return;

    setUploading(true);
    try {
      const res = await documentService.upload({
        workspaceId: id,
        rawTextTitle: rawTitle || 'Pasted Research Document',
        rawTextContent: rawContent
      });

      if (res.data.success) {
        setRawTitle('');
        setRawContent('');
        setPasteMode(false);
        await fetchWorkspace();
        setSelectedDoc(res.data.document);
      }
    } catch (err) {
      console.error('Text paste upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDoc = async (docId, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this research paper document?')) return;
    try {
      await documentService.delete(docId);
      if (selectedDoc?.id === docId) setSelectedDoc(null);
      fetchWorkspace();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;

    try {
      const res = await aiService.createNote({
        workspaceId: Number(id),
        title: noteTitle,
        content: noteContent,
        tags: [noteTag]
      });

      if (res.data.success) {
        setNoteTitle('');
        setNoteContent('');
        fetchWorkspace();
      }
    } catch (err) {
      console.error('Create note error:', err);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await aiService.deleteNote(noteId);
      fetchWorkspace();
    } catch (err) {
      console.error('Delete note error:', err);
    }
  };

  const handleDeleteReport = async (reportId) => {
    try {
      await reportService.deleteReport(reportId);
      fetchWorkspace();
    } catch (err) {
      console.error('Delete report error:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Sparkles className="w-10 h-10 text-indigo-400 animate-spin mx-auto mb-4" />
        <p className="text-slate-400 text-sm">Loading AI Research Workspace...</p>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-white mb-4">Workspace Not Found</h2>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 bg-[#09090b] dark:bg-[#09090b] light:bg-white p-6 rounded-3xl border border-zinc-800 dark:border-zinc-800 light:border-zinc-200">
        <div>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-400 light:text-zinc-600 hover:text-[#d2f235] font-bold mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Workspaces
          </button>
          <h1 className="text-2xl font-black text-white dark:text-white light:text-zinc-900 flex items-center gap-3">
            {workspace.name}
            <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-zinc-800 text-[#d2f235] border border-zinc-700">
              {workspace.domain}
            </span>
          </h1>
          <p className="text-xs text-zinc-400 dark:text-zinc-400 light:text-zinc-600 mt-1">{workspace.description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <label
            htmlFor="workspace-file-upload-input"
            className="w-full sm:w-auto btn-recraft-secondary px-5 py-3 rounded-full text-xs font-black flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            <Upload className="w-4 h-4 text-[#d2f235]" />
            <span>Upload Research File</span>
          </label>

          <button
            onClick={() => setIsReportModalOpen(true)}
            className="w-full sm:w-auto btn-recraft-lime px-6 py-3 rounded-full text-xs font-black flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-black" />
            <span>Synthesize Report</span>
          </button>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 bg-[#121215] dark:bg-[#121215] light:bg-zinc-100 p-2 rounded-full border border-zinc-800 dark:border-zinc-800 light:border-zinc-200 mb-8 overflow-x-auto">
        {[
          { id: 'documents', label: 'Documents & Summaries', icon: FileText, count: workspace.documents?.length },
          { id: 'chat', label: 'Gemini AI Assistant', icon: Bot },
          { id: 'graph', label: 'Knowledge Mesh Graph', icon: Network },
          { id: 'notes', label: 'Evidence & Notes', icon: StickyNote, count: workspace.notes?.length },
          { id: 'reports', label: 'Synthesis Reports', icon: FileSpreadsheet, count: workspace.reports?.length }
        ].map((tab) => {
          const IconComp = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-xs font-extrabold flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#d2f235] text-black shadow-md'
                  : 'text-zinc-400 dark:text-zinc-400 light:text-zinc-600 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <IconComp className="w-4 h-4" />
              {tab.label}
              {tab.count !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                  activeTab === tab.id ? 'bg-black text-[#d2f235] font-mono' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: Documents & AI Summaries */}
      {activeTab === 'documents' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Upload & Document List */}
          <div className="space-y-6">
            
            {/* Upload Box */}
            <div className="bg-white dark:bg-[#121215] p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-sm font-black text-zinc-900 dark:text-white mb-2 flex items-center gap-2 uppercase tracking-tight">
                <Upload className="w-4 h-4 text-[#0284c7] dark:text-[#d2f235]" />
                Ingest Research Material
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-4 font-medium">Upload PDF, TXT, MD, CSV, or paste research text</p>

              {!pasteMode ? (
                <div className="space-y-3">
                  <label
                    htmlFor="workspace-file-upload-input"
                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-zinc-300 dark:border-zinc-800 hover:border-[#0284c7] dark:hover:border-[#d2f235] rounded-xl cursor-pointer bg-zinc-50 dark:bg-[#09090b] transition-all hover:bg-zinc-100 dark:hover:bg-zinc-900 active:scale-[0.98]"
                  >
                    <Upload className="w-8 h-8 text-[#0284c7] dark:text-[#d2f235] mb-2 animate-bounce" />
                    <span className="text-xs font-black text-zinc-900 dark:text-white">
                      {uploading ? 'Processing & Extracting with AI...' : 'Tap or Click to Upload File'}
                    </span>
                    <span className="text-[10px] text-zinc-600 dark:text-zinc-400 mt-1 font-bold">PDF, TXT, MD, CSV, DOCX (Max 15MB)</span>
                    <input
                      id="workspace-file-upload-input"
                      ref={fileInputRef}
                      type="file"
                      disabled={uploading}
                      onChange={handleFileUpload}
                      accept=".pdf,.txt,.md,.markdown,.csv,.json,.docx,application/pdf,text/plain"
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={() => setPasteMode(true)}
                    className="w-full py-2.5 text-xs text-zinc-900 dark:text-white font-extrabold border border-zinc-300 dark:border-zinc-700 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:border-[#0284c7] dark:hover:border-[#d2f235] transition-colors"
                  >
                    + Paste Raw Text Instead
                  </button>
                </div>
              ) : (
                <form onSubmit={handleTextPasteUpload} className="space-y-3">
                  <input
                    type="text"
                    placeholder="Document Title"
                    value={rawTitle}
                    onChange={(e) => setRawTitle(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-[#18181b] text-zinc-900 dark:text-white text-xs rounded-xl px-3 py-2.5 border border-zinc-300 dark:border-zinc-800 focus:outline-none focus:border-[#0284c7] dark:focus:border-[#d2f235] font-medium"
                  />
                  <textarea
                    rows={4}
                    placeholder="Paste research abstract, paper content, or notes..."
                    value={rawContent}
                    onChange={(e) => setRawContent(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-[#18181b] text-zinc-900 dark:text-white text-xs rounded-xl px-3 py-2.5 border border-zinc-300 dark:border-zinc-800 focus:outline-none focus:border-[#0284c7] dark:focus:border-[#d2f235] font-medium"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={uploading || !rawContent.trim()}
                      className="flex-1 btn-recraft-lime py-2 text-black font-black text-xs rounded-xl"
                    >
                      {uploading ? 'Analyzing...' : 'Ingest & Synthesize'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPasteMode(false)}
                      className="px-3 py-2 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Document Collection List */}
            <div className="bg-white dark:bg-[#121215] p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-sm font-black text-zinc-900 dark:text-white mb-4 uppercase tracking-tight">Workspace Documents ({workspace.documents?.length || 0})</h3>
              
              {workspace.documents?.length === 0 ? (
                <p className="text-xs text-zinc-600 dark:text-zinc-400 text-center py-6 font-medium">No documents ingested yet.</p>
              ) : (
                <div className="space-y-2">
                  {workspace.documents.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDoc(doc)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        selectedDoc?.id === doc.id
                          ? 'bg-[#d2f235] text-black border-[#d2f235] font-black'
                          : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white hover:border-[#0284c7] dark:hover:border-[#d2f235]'
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <FileText className={`w-4 h-4 shrink-0 ${selectedDoc?.id === doc.id ? 'text-black' : 'text-[#0284c7] dark:text-[#d2f235]'}`} />
                        <div className="truncate">
                          <h4 className={`text-xs font-bold truncate ${selectedDoc?.id === doc.id ? 'text-black' : 'text-zinc-900 dark:text-white'}`}>{doc.title}</h4>
                          <span className={`text-[10px] font-medium ${selectedDoc?.id === doc.id ? 'text-zinc-800' : 'text-zinc-600 dark:text-zinc-400'}`}>{doc.file_type || 'Text'}</span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteDoc(doc.id, e)}
                        className={`p-1 transition-colors ${selectedDoc?.id === doc.id ? 'text-zinc-800 hover:text-black' : 'text-zinc-400 hover:text-rose-500'}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Selected Document AI Synthesis & Detail View */}
          <div className="lg:col-span-2">
            {selectedDoc ? (
              <SalfordPresentationCard
                title={selectedDoc.title}
                subtitle={`AI Executive Analysis & Key Takeaways for ${workspace.name}`}
                date={new Date(selectedDoc.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                presenter="Presented by: Jiffy Research AI"
                badgeText="EXECUTIVE RESEARCH BRIEF"
              >
                {/* AI Executive Summary */}
                <div className="mb-6">
                  <h3 className="text-sm font-black text-[#2b040d] uppercase tracking-tight mb-2">
                    Executive Summary & Core Takeaways
                  </h3>
                  <div className="p-4 rounded-2xl bg-[#fcf5f6] border border-[#f0d5d9] text-[#3b0914] text-xs sm:text-sm leading-relaxed font-medium">
                    {selectedDoc.summary || 'Summary generation in progress...'}
                  </div>
                </div>

                {/* Extracted Key Insights */}
                {selectedDoc.key_insights && selectedDoc.key_insights.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-black text-[#2b040d] uppercase tracking-tight mb-2">
                      Key Findings & Empirical Evidence
                    </h3>
                    <ul className="space-y-2">
                      {selectedDoc.key_insights.map((insight, idx) => (
                        <li key={idx} className="bg-[#fcf5f6] p-3.5 rounded-xl border border-[#f0d5d9] text-xs text-[#3b0914] font-bold flex items-start gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#3b0914] mt-1 shrink-0" />
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Extracted Entity Tags */}
                {selectedDoc.entities && selectedDoc.entities.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xs font-black text-[#4a0d1a] mb-2 uppercase tracking-wider">Extracted Entities & Concepts</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedDoc.entities.map((ent, idx) => (
                        <span key={idx} className="text-xs font-bold px-3 py-1 rounded-lg bg-[#f5d0d6] text-[#2b040d] border border-[#e8b5bd]">
                          {typeof ent === 'string' ? ent : ent.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Full Text View */}
                <div>
                  <h3 className="text-xs font-black text-[#4a0d1a] mb-2 uppercase tracking-wider">Raw Extracted Document Text</h3>
                  <div className="bg-[#fcf5f6] p-4 rounded-xl max-h-56 overflow-y-auto font-mono text-xs text-[#3b0914] border border-[#f0d5d9] whitespace-pre-wrap">
                    {selectedDoc.content || 'No text extracted.'}
                  </div>
                </div>
              </SalfordPresentationCard>
            ) : (
              <div className="bg-white dark:bg-[#121215] p-12 text-center rounded-2xl border border-zinc-200 dark:border-zinc-800 h-full flex flex-col items-center justify-center shadow-sm">
                <FileText className="w-12 h-12 text-zinc-400 mb-3" />
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">Select or Upload a Document</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 max-w-sm font-medium">
                  Click a document from your workspace collection to inspect its AI summary and findings.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2: AI Research Chat Assistant */}
      {activeTab === 'chat' && (
        <ResearchChat workspaceId={id} initialMessages={workspace.chatMessages} />
      )}

      {/* TAB 3: Knowledge Mesh Graph */}
      {activeTab === 'graph' && (
        <KnowledgeGraph workspaceId={id} />
      )}

      {/* TAB 4: Evidence & Research Notes */}
      {activeTab === 'notes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Note Input Form */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-400" />
              Add Research Note & Evidence Block
            </h3>
            <form onSubmit={handleCreateNote} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Benchmark comparison anomaly"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full bg-slate-900 text-white text-xs rounded-xl px-3 py-2.5 border border-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tag Category</label>
                <select
                  value={noteTag}
                  onChange={(e) => setNoteTag(e.target.value)}
                  className="w-full bg-slate-900 text-white text-xs rounded-xl px-3 py-2.5 border border-slate-800 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Key Finding">Key Finding</option>
                  <option value="Methodology Gap">Methodology Gap</option>
                  <option value="Empirical Citation">Empirical Citation</option>
                  <option value="Hypothesis">Hypothesis</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Note Details</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Record insights, citations, or synthetic observations..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full bg-slate-900 text-white text-xs rounded-xl px-3 py-2.5 border border-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20"
              >
                Save Note
              </button>
            </form>
          </div>

          {/* Saved Notes Grid */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-white mb-2">Saved Evidence Notes ({workspace.notes?.length || 0})</h3>
            
            {workspace.notes?.length === 0 ? (
              <div className="glass-panel p-8 text-center rounded-2xl border border-slate-800">
                <StickyNote className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No notes created yet. Add notes to curate evidence for your report.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {workspace.notes.map((note) => (
                  <div key={note.id} className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {note.tags?.[0] || 'Note'}
                        </span>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="text-slate-500 hover:text-red-400 transition-colors text-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <h4 className="font-bold text-sm text-white mb-1">{note.title}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-4 pt-2 border-t border-slate-800">
                      {new Date(note.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 5: Synthesis Reports */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Synthesized Research Reports</h3>
              <p className="text-xs text-slate-400">Generated Markdown reports and literature review matrices</p>
            </div>
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Generate New Synthesis Report
            </button>
          </div>

          {workspace.reports?.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800">
              <FileSpreadsheet className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No synthesis reports generated yet.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {workspace.reports.map((report) => (
                <div key={report.id} className="relative group">
                  <div className="absolute top-8 right-8 z-20 flex items-center gap-2">
                    <button
                      onClick={() => handleDeleteReport(report.id)}
                      className="p-2 rounded-xl bg-white/10 hover:bg-rose-600 text-white transition-colors border border-white/20 shadow-md"
                      title="Delete Synthesis Report"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <SalfordPresentationCard
                    title={report.title}
                    subtitle={`Structured Research Literature Review & Evidence Matrix for ${workspace.name}`}
                    date={new Date(report.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    presenter="Presented by: Jiffy Research AI"
                    badgeText={`${report.report_type.replace(/_/g, ' ')} • 400+ WORDS`}
                  >
                    <div className="prose prose-xs sm:prose-sm max-w-none text-[#2b040d]">
                      <ReactMarkdown>{report.content}</ReactMarkdown>
                    </div>
                  </SalfordPresentationCard>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Report Generator Modal */}
      <ReportGeneratorModal
        workspaceId={id}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onReportGenerated={() => {
          fetchWorkspace();
          setActiveTab('reports');
        }}
      />

    </div>
  );
}
