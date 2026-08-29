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
  Eye,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  X
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
  const [showReplaceDocModal, setShowReplaceDocModal] = useState(false);
  const [isDeletingAndReplacing, setIsDeletingAndReplacing] = useState(false);

  const hasExistingDocs = Boolean(workspace?.documents && workspace.documents.length > 0);

  const handleUploadBoxClick = (e) => {
    if (uploading) return;
    if (hasExistingDocs) {
      e?.preventDefault?.();
      setShowReplaceDocModal(true);
    } else {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
        fileInputRef.current.click();
      }
    }
  };

  // Notes State
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTag, setNoteTag] = useState('Key Finding');

  // Report Modal State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isAutoExtractingNotes, setIsAutoExtractingNotes] = useState(false);
  const [presentationReport, setPresentationReport] = useState(null);

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

  const handleAutoExtractNotes = async (selectedCategory) => {
    const categoryToExtract = typeof selectedCategory === 'string' ? selectedCategory : (noteTag || 'Key Finding');
    setIsAutoExtractingNotes(true);
    try {
      const res = await aiService.autoExtractNotes(id, categoryToExtract);
      if (res.data.success) {
        await fetchWorkspace();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Please upload research documents first to analyze and extract evidence notes.');
    } finally {
      setIsAutoExtractingNotes(false);
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
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleConfirmReplace = async () => {
    setIsDeletingAndReplacing(true);
    try {
      if (workspace?.documents && workspace.documents.length > 0) {
        for (const doc of workspace.documents) {
          try {
            await documentService.delete(doc.id);
          } catch (err) {
            console.error('Error deleting previous doc:', err);
          }
        }
        setSelectedDoc(null);
        await fetchWorkspace();
      }
      setShowReplaceDocModal(false);
      // Synchronously open system file selector
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
        fileInputRef.current.click();
      }
    } catch (err) {
      console.error('Failed to replace file:', err);
    } finally {
      setIsDeletingAndReplacing(false);
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
                  <input
                    id="workspace-file-upload-input"
                    ref={fileInputRef}
                    type="file"
                    disabled={uploading}
                    onChange={handleFileUpload}
                    accept=".pdf,.txt,.md,.markdown,.csv,.json,.docx,application/pdf,text/plain"
                    className="hidden"
                  />

                  {uploading ? (
                    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#0284c7]/50 dark:border-[#d2f235]/50 rounded-xl bg-[#0284c7]/5 dark:bg-[#d2f235]/5 transition-all animate-pulse">
                      <div className="relative mb-3 flex items-center justify-center">
                        <Loader2 className="w-10 h-10 text-[#0284c7] dark:text-[#d2f235] animate-spin" />
                        <Sparkles className="w-4 h-4 text-[#0284c7] dark:text-[#d2f235] absolute -top-1 -right-1 animate-ping" />
                      </div>
                      <span className="text-xs font-black text-zinc-900 dark:text-white text-center">
                        Analyzing & Ingesting Document with AI...
                      </span>
                      <span className="text-[10px] text-zinc-600 dark:text-zinc-400 mt-1 font-semibold text-center">
                        Extracting knowledge graph, key findings & evidence nodes
                      </span>
                      {/* Animated Progress Bar */}
                      <div className="w-full max-w-[200px] bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-3.5 border border-zinc-300 dark:border-zinc-700/60">
                        <div className="h-full bg-gradient-to-r from-[#0284c7] to-cyan-400 dark:from-[#d2f235] dark:to-lime-200 rounded-full w-full animate-pulse" />
                      </div>
                    </div>
                  ) : hasExistingDocs ? (
                    <div
                      onClick={() => setShowReplaceDocModal(true)}
                      className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-zinc-300 dark:border-zinc-800 hover:border-[#0284c7] dark:hover:border-[#d2f235] rounded-xl cursor-pointer bg-zinc-50 dark:bg-[#09090b] transition-all hover:bg-zinc-100 dark:hover:bg-zinc-900 active:scale-[0.98]"
                    >
                      <Upload className="w-8 h-8 text-[#0284c7] dark:text-[#d2f235] mb-2 animate-bounce" />
                      <span className="text-xs font-black text-zinc-900 dark:text-white">
                        Tap or Click to Upload File
                      </span>
                      <span className="text-[10px] text-zinc-600 dark:text-zinc-400 mt-1 font-bold">PDF, TXT, MD, CSV, DOCX (Max 15MB)</span>
                    </div>
                  ) : (
                    <label
                      htmlFor="workspace-file-upload-input"
                      className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-zinc-300 dark:border-zinc-800 hover:border-[#0284c7] dark:hover:border-[#d2f235] rounded-xl cursor-pointer bg-zinc-50 dark:bg-[#09090b] transition-all hover:bg-zinc-100 dark:hover:bg-zinc-900 active:scale-[0.98]"
                    >
                      <Upload className="w-8 h-8 text-[#0284c7] dark:text-[#d2f235] mb-2 animate-bounce" />
                      <span className="text-xs font-black text-zinc-900 dark:text-white">
                        Tap or Click to Upload File
                      </span>
                      <span className="text-[10px] text-zinc-600 dark:text-zinc-400 mt-1 font-bold">PDF, TXT, MD, CSV, DOCX (Max 15MB)</span>
                    </label>
                  )}

                  {!uploading && (
                    <button
                      onClick={() => {
                        if (hasExistingDocs) {
                          setShowReplaceDocModal(true);
                        } else {
                          setPasteMode(true);
                        }
                      }}
                      className="w-full py-2.5 text-xs text-zinc-900 dark:text-white font-extrabold border border-zinc-300 dark:border-zinc-700 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:border-[#0284c7] dark:hover:border-[#d2f235] transition-colors cursor-pointer"
                    >
                      + Paste Raw Text Instead
                    </button>
                  )}
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
          <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-zinc-200 dark:border-zinc-800/80 bg-white/70 dark:bg-[#09090b]/80 shadow-2xl">
            <h3 className="text-sm font-black uppercase tracking-tight text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#0284c7] dark:text-[#d2f235]" />
              Add Research Note & Evidence Block
            </h3>
            <form onSubmit={handleCreateNote} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Benchmark comparison anomaly"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-[#18181b] text-zinc-900 dark:text-white text-xs rounded-xl px-3.5 py-2.5 border border-zinc-300 dark:border-zinc-800 focus:outline-none focus:border-[#0284c7] dark:focus:border-[#d2f235] transition-colors font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Tag Category
                </label>
                <select
                  value={noteTag}
                  onChange={(e) => setNoteTag(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-[#18181b] text-zinc-900 dark:text-white text-xs rounded-xl px-3.5 py-2.5 border border-zinc-300 dark:border-zinc-800 focus:outline-none focus:border-[#0284c7] dark:focus:border-[#d2f235] transition-colors font-medium"
                >
                  <option value="Key Finding">Key Finding</option>
                  <option value="Methodology Gap">Methodology Gap</option>
                  <option value="Empirical Citation">Empirical Citation</option>
                  <option value="Hypothesis">Hypothesis</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Note Details
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Record insights, citations, or synthetic observations..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-[#18181b] text-zinc-900 dark:text-white text-xs rounded-xl px-3.5 py-2.5 border border-zinc-300 dark:border-zinc-800 focus:outline-none focus:border-[#0284c7] dark:focus:border-[#d2f235] transition-colors font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-full btn-recraft-lime text-black font-black text-xs shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                Save Note
              </button>
            </form>
          </div>

          {/* Saved Notes Grid */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
              <div>
                <h3 className="text-sm font-black uppercase tracking-tight text-zinc-900 dark:text-white">
                  Saved Evidence Notes ({workspace.notes?.length || 0})
                </h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                  Click any note card to open in Fullscreen Presentation Theme
                </p>
              </div>

              {/* AI Auto-Extract Button & Quick Category Triggers */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleAutoExtractNotes(noteTag)}
                  disabled={isAutoExtractingNotes || !workspace?.documents?.length}
                  className="px-3.5 py-1.5 rounded-xl btn-recraft-lime text-black font-black text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
                  title={`Extract 3-5 structured ${noteTag} evidence notes from documents`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-black" />
                  <span>{isAutoExtractingNotes ? 'Analyzing with AI...' : `✨ AI Extract: ${noteTag}`}</span>
                </button>
              </div>
            </div>

            {/* Quick Category Extraction Pills */}
            <div className="flex items-center gap-2 flex-wrap pb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Quick Extract:</span>
              {["Key Finding", "Methodology Gap", "Empirical Citation", "Hypothesis"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  disabled={isAutoExtractingNotes || !workspace?.documents?.length}
                  onClick={() => {
                    setNoteTag(cat);
                    handleAutoExtractNotes(cat);
                  }}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer disabled:opacity-40 ${
                    noteTag === cat
                      ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white border-zinc-400 dark:border-zinc-600'
                      : 'bg-zinc-100 dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                  }`}
                >
                  + {cat}
                </button>
              ))}
            </div>
            
            {workspace.notes?.length === 0 ? (
              <div className="glass-panel p-8 text-center rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-[#09090b]/60">
                <StickyNote className="w-8 h-8 text-zinc-400 dark:text-zinc-600 mx-auto mb-2" />
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  No notes created yet. Add notes manually on the left or click <strong>✨ AI Extract</strong> to synthesize notes from your files.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {workspace.notes.map((note) => (
                  <div 
                    key={note.id} 
                    onClick={() => setPresentationReport({
                      title: note.title,
                      report_type: note.tags?.[0] || 'Evidence Note',
                      content: note.content,
                      created_at: note.created_at
                    })}
                    className="glass-card p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0d12] flex flex-col justify-between hover:border-[#0284c7] dark:hover:border-[#d2f235] transition-all shadow-sm cursor-pointer group hover:shadow-lg relative"
                    title="Click to open in Luxury Brown Presentation View"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#0284c7]/10 dark:bg-[#d2f235]/15 text-[#0284c7] dark:text-[#d2f235] border border-[#0284c7]/20 dark:border-[#d2f235]/30">
                          {note.tags?.[0] || 'Note'}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity font-bold flex items-center gap-0.5 mr-1">
                            <Eye className="w-3 h-3" /> View Slide
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNote(note.id);
                            }}
                            className="text-zinc-400 hover:text-rose-500 transition-colors text-xs p-1 cursor-pointer"
                            title="Delete note"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-white mb-1 group-hover:text-[#0284c7] dark:group-hover:text-[#d2f235] transition-colors">{note.title}</h4>
                      <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap font-medium">{note.content}</p>
                    </div>
                    <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono mt-4 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                      <span>{new Date(note.created_at).toLocaleDateString()}</span>
                      <span className="text-[#0284c7] dark:text-[#d2f235] font-bold text-[10px]">Presentation Ready →</span>
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
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Synthesized Research Reports</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Generated Markdown reports and luxury presentation review matrices</p>
            </div>
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="px-5 py-2.5 rounded-full btn-recraft-lime text-black font-black text-xs flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-black" />
              Generate New Synthesis Report
            </button>
          </div>

          {workspace.reports?.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-[#09090b]/60">
              <FileSpreadsheet className="w-10 h-10 text-zinc-400 dark:text-zinc-600 mx-auto mb-2" />
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">No synthesis reports generated yet. Click above to generate publication-grade reports.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {workspace.reports.map((report) => (
                <div key={report.id} className="relative group">
                  <div className="absolute top-8 right-8 z-20 flex items-center gap-2">
                    <button
                      onClick={() => setPresentationReport(report)}
                      className="px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white text-white hover:text-[#2b040d] transition-all border border-white/20 shadow-md font-bold text-xs flex items-center gap-1.5 cursor-pointer backdrop-blur-sm"
                      title="Open Fullscreen Presentation View in Luxury Brown Theme"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Presentation Slide View</span>
                    </button>
                    <button
                      onClick={() => handleDeleteReport(report.id)}
                      className="p-2 rounded-xl bg-white/10 hover:bg-rose-600 text-white transition-colors border border-white/20 shadow-md cursor-pointer"
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

      {/* Luxury Brown Presentation Slide Modal (Matching User Design) */}
      {presentationReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 lg:p-8 bg-black/90 backdrop-blur-2xl animate-in fade-in overflow-y-auto">
          <div className="bg-gradient-to-br from-[#1c0308] via-[#350611] to-[#120104] text-white w-full max-w-6xl rounded-[2.5rem] p-6 sm:p-10 lg:p-12 border border-[#520c1c] shadow-2xl relative overflow-hidden my-auto">
            
            {/* Background Decorative Ambient Orbs */}
            <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#8a1431]/20 blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#610a1f]/30 blur-[120px] pointer-events-none" />
            <div className="absolute top-8 left-1/3 w-16 h-16 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm pointer-events-none hidden sm:block" />
            <div className="absolute bottom-16 right-1/3 w-12 h-12 rounded-full bg-white/5 border border-white/10 pointer-events-none hidden sm:block" />

            {/* Top Close Button & Brand Header */}
            <div className="flex items-center justify-between gap-4 mb-6 relative z-20">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1a1c23] via-[#090a0f] to-[#050507] border border-[#c58b41]/60 shadow-md flex items-center justify-center shrink-0">
                  <span className="font-['Cinzel'] font-black text-sm text-transparent bg-clip-text bg-gradient-to-b from-[#f3e0aa] via-[#d4af37] to-[#a67c1e]">
                    J
                  </span>
                </div>
                <span className="text-xs font-mono font-bold tracking-widest text-rose-200/90 uppercase">
                  JIFFY RESEARCH • PRESENTATION MATRIX
                </span>
              </div>

              <button
                type="button"
                onClick={() => setPresentationReport(null)}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white text-white hover:text-black transition-all border border-white/20 cursor-pointer shadow-lg"
                title="Close Presentation View"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid: Left Slide Content + Right Architectural & Research Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 items-stretch">
              
              {/* Left Column: Big Hello! + White Slide Content Card */}
              <div className="lg:col-span-8 flex flex-col justify-between">
                <div>
                  <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight uppercase font-sans mb-5">
                    Hello!
                  </h1>

                  {/* Rounded White Slide Card */}
                  <div className="bg-white text-[#2b040d] rounded-[2rem] p-6 sm:p-8 shadow-2xl border border-[#4a0d1a] max-h-[50vh] overflow-y-auto">
                    <div className="mb-4">
                      <span className="inline-block px-3.5 py-1 rounded-full bg-[#fce8eb] text-[#3b0914] border border-[#f5c2ca] text-[10px] font-black uppercase tracking-wider mb-2.5">
                        {(presentationReport?.report_type || 'EVIDENCE NOTE').replace(/_/g, ' ')}
                      </span>
                      <h2 className="text-lg sm:text-2xl font-black text-[#2b040d] tracking-tight uppercase leading-snug">
                        {presentationReport?.title || 'Research Note'}
                      </h2>
                    </div>

                    <div className="salford-template-body text-[#2b040d] text-xs sm:text-sm leading-relaxed font-medium prose prose-xs sm:prose-sm max-w-none">
                      <ReactMarkdown>{presentationReport?.content || ''}</ReactMarkdown>
                    </div>
                  </div>
                </div>

                {/* Footer Presentation Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-6">
                  <div className="bg-white text-[#2b040d] font-black px-5 py-2.5 rounded-full shadow-lg text-xs flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#3b0914]" />
                    <span>Presented by: Jiffy Research AI</span>
                  </div>

                  <div className="text-xs font-mono font-bold text-rose-100/90 px-4 py-2 rounded-full bg-white/10 border border-white/20">
                    {presentationReport?.created_at
                      ? new Date(presentationReport.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                      : 'October 2026'}
                  </div>
                </div>
              </div>

              {/* Right Column: 2 Sleek Vertical Visual Cards (Matching Screenshot) */}
              <div className="lg:col-span-4 hidden lg:grid grid-cols-2 gap-3.5">
                {/* Vertical Card 1 */}
                <div className="rounded-[2rem] overflow-hidden border border-white/15 bg-[#25050d] shadow-xl relative flex flex-col justify-end p-4 group">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10" />
                  <img 
                    src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80" 
                    alt="Research Architecture" 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                  />
                  <div className="relative z-20">
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-white/20 text-white backdrop-blur-md inline-block mb-1">
                      STRUCTURE
                    </span>
                    <p className="text-xs font-black text-white uppercase leading-tight">
                      Evidence Synthesis
                    </p>
                  </div>
                </div>

                {/* Vertical Card 2 */}
                <div className="rounded-[2rem] overflow-hidden border border-white/15 bg-[#25050d] shadow-xl relative flex flex-col justify-end p-4 group">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10" />
                  <img 
                    src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80" 
                    alt="Strategic Analysis" 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                  />
                  <div className="relative z-20">
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-white/20 text-white backdrop-blur-md inline-block mb-1">
                      CITATIONS
                    </span>
                    <p className="text-xs font-black text-white uppercase leading-tight">
                      100% Grounded
                    </p>
                  </div>
                </div>
              </div>

            </div>

          </div>
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

      {/* Replace Document Confirmation Modal */}
      {showReplaceDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#09090b] text-white w-full max-w-md rounded-3xl p-6 sm:p-7 border border-zinc-800 shadow-2xl relative">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center mb-4 mx-auto shadow-inner">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base sm:text-lg font-black text-white text-center">
              Are you sure you want delete the present file uploaded?
            </h3>
            <p className="text-xs text-zinc-400 text-center mt-2 leading-relaxed">
              A research document is currently uploaded in this workspace. Continuing will delete the present file and open the file chooser so you can select a new file.
            </p>

            <div className="flex items-center justify-center gap-3 mt-6 pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setShowReplaceDocModal(false)}
                disabled={isDeletingAndReplacing}
                className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingAndReplacing}
                onClick={handleConfirmReplace}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-lg shadow-rose-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDeletingAndReplacing ? 'Deleting...' : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
