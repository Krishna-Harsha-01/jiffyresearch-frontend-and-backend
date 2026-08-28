import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FolderKanban, 
  Plus, 
  FileText, 
  Sparkles, 
  Trash2, 
  BookOpen, 
  FileSpreadsheet, 
  ArrowRight,
  Search,
  Globe,
  BarChart3,
  Filter,
  Compass,
  HelpCircle
} from 'lucide-react';
import { workspaceService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import OnboardingModal from '../components/OnboardingModal';
import UserManualModal from '../components/UserManualModal';

export default function DashboardPage() {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomainFilter, setSelectedDomainFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showUserManual, setShowUserManual] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [domain, setDomain] = useState('Computer Science & AI');
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  const fetchWorkspaces = async () => {
    try {
      const res = await workspaceService.getAll();
      if (res.data.success) {
        setWorkspaces(res.data.workspaces);
      }
    } catch (err) {
      console.error('Failed to load workspaces:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();

    // Check if user has seen onboarding tutorial
    const hasSeenTutorial = localStorage.getItem('nexus_has_seen_tutorial');
    if (!hasSeenTutorial) {
      setShowOnboarding(true);
      localStorage.setItem('nexus_has_seen_tutorial', 'true');
    }
  }, []);

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);

    try {
      const res = await workspaceService.create({ name, description, domain });
      if (res.data.success) {
        setIsModalOpen(false);
        setName('');
        setDescription('');
        fetchWorkspaces();
        navigate(`/workspace/${res.data.workspace.id}`);
      }
    } catch (err) {
      console.error('Create error:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteWorkspace = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this research workspace? All documents will be removed.')) return;
    try {
      await workspaceService.delete(id);
      fetchWorkspaces();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const filteredWorkspaces = workspaces.filter(ws => {
    const matchesSearch = ws.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (ws.description && ws.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDomain = selectedDomainFilter === 'all' || ws.domain === selectedDomainFilter;
    return matchesSearch && matchesDomain;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Top Welcome & Actions Header */}
      <div className="bg-[#09090b] p-6 sm:p-8 rounded-3xl border border-zinc-800 mb-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-[#d2f235] text-[11px] font-extrabold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#d2f235]" />
            <span>Research Project Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase italic">
            YOUR RESEARCH WORKSPACES
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl font-medium">
            Manage multi-paper collections, synthesize 400+ word reports, and explore interactive Knowledge Mesh Graphs & AI Pie Charts.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setShowOnboarding(true)}
            className="btn-recraft-secondary px-4 py-2.5 rounded-full text-xs font-bold flex items-center gap-2"
          >
            <Compass className="w-4 h-4 text-[#d2f235]" />
            <span>Tutorial</span>
          </button>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-recraft-lime px-5 py-2.5 rounded-full text-xs font-black flex items-center justify-center gap-2 shadow-lg w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 text-black" />
            <span>+ New Research Project</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Active Workspaces', value: workspaces.length, icon: FolderKanban, color: 'text-[#d2f235]' },
          { label: 'Ingested Documents', value: workspaces.reduce((acc, w) => acc + (w.document_count || 0), 0), icon: FileText, color: 'text-zinc-200' },
          { label: 'Synthesized Reports', value: workspaces.reduce((acc, w) => acc + (w.report_count || 0), 0), icon: Sparkles, color: 'text-[#d2f235]' }
        ].map((stat, idx) => {
          const IconComp = stat.icon;
          return (
            <div key={idx} className="glass-card p-4 rounded-xl border border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">{stat.label}</p>
                <p className="text-xl font-black text-white mt-0.5">{stat.value}</p>
              </div>
              <div className={`w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center ${stat.color}`}>
                <IconComp className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls Bar: Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search workspaces by title or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#121215] text-zinc-200 text-xs rounded-full pl-11 pr-4 py-2.5 border border-zinc-800 focus:outline-none focus:border-[#d2f235] transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-zinc-400" />
          <select
            value={selectedDomainFilter}
            onChange={(e) => setSelectedDomainFilter(e.target.value)}
            className="bg-[#121215] text-zinc-200 text-xs rounded-full px-4 py-2 border border-zinc-800 focus:outline-none focus:border-[#d2f235] font-bold"
          >
            <option value="all">All Research Domains</option>
            <option value="Computer Science & AI">Computer Science & AI</option>
            <option value="Biomedical & Healthcare">Biomedical & Healthcare</option>
            <option value="Environmental & Climate Science">Environmental & Climate Science</option>
            <option value="Economics & Social Policy">Economics & Social Policy</option>
            <option value="General Literature Review">General Literature Review</option>
          </select>
        </div>
      </div>

      {/* Workspaces Grid */}
      <div className="mb-6">
        <h2 className="text-base sm:text-lg font-black text-white mb-4 flex items-center gap-2 uppercase tracking-tight italic">
          <FolderKanban className="w-5 h-5 text-[#d2f235]" />
          Your Knowledge Discovery Workspaces ({filteredWorkspaces.length})
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white dark:bg-[#121215] p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 animate-pulse h-44" />
            ))}
          </div>
        ) : filteredWorkspaces.length === 0 ? (
          <div className="bg-white dark:bg-[#09090b] p-12 text-center rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <FolderKanban className="w-12 h-12 text-zinc-500 mx-auto mb-3" />
            <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">No Research Workspaces Found</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 max-w-sm mx-auto font-medium">
              Click "+ New Research Project" to create your first workspace for paper ingestion and report synthesis.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkspaces.map((ws) => (
              <div
                key={ws.id}
                onClick={() => navigate(`/workspace/${ws.id}`)}
                className="bg-white dark:bg-[#121215] p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-[#d2f235] cursor-pointer transition-all duration-300 group flex flex-col justify-between shadow-sm hover:shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-[#d2f235] border border-zinc-300 dark:border-zinc-700">
                      {ws.domain || 'General Research'}
                    </span>
                    <button
                      onClick={(e) => handleDeleteWorkspace(ws.id, e)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10 transition-colors opacity-80 sm:opacity-0 group-hover:opacity-100"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-zinc-900 dark:text-white group-hover:text-[#0284c7] dark:group-hover:text-[#d2f235] transition-colors">
                    {ws.name}
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 line-clamp-2 font-medium">
                    {ws.description || 'AI knowledge workspace for literature review and evidence extraction.'}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
                  <div className="flex items-center gap-3 font-extrabold">
                    <span>📄 {ws.document_count || 0} docs</span>
                    <span>📊 {ws.report_count || 0} reports</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#0284c7] dark:text-[#d2f235] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Workspace Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#09090b] dark:bg-[#09090b] light:bg-white w-full max-w-md p-6 rounded-[2rem] border border-zinc-800 dark:border-zinc-800 light:border-zinc-200 shadow-2xl">
            <h3 className="text-lg font-black text-white dark:text-white light:text-zinc-900 mb-4 uppercase tracking-tight italic">Create AI Research Workspace</h3>
            <form onSubmit={handleCreateWorkspace} className="space-y-4 font-medium">
              <div>
                <label className="block text-xs font-extrabold text-zinc-300 dark:text-zinc-300 light:text-zinc-700 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. LLM Reasoning Benchmarks 2026"
                  className="w-full bg-[#18181b] dark:bg-[#18181b] light:bg-zinc-100 text-white dark:text-white light:text-zinc-900 text-xs rounded-xl px-4 py-3 border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 focus:outline-none focus:border-[#d2f235]"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-zinc-300 dark:text-zinc-300 light:text-zinc-700 mb-1">Domain / Field</label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full bg-[#18181b] dark:bg-[#18181b] light:bg-zinc-100 text-white dark:text-white light:text-zinc-900 text-xs rounded-xl px-4 py-3 border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 focus:outline-none focus:border-[#d2f235]"
                >
                  <option value="Computer Science & AI">Computer Science & AI</option>
                  <option value="Biomedical & Healthcare">Biomedical & Healthcare</option>
                  <option value="Environmental & Climate Science">Environmental & Climate Science</option>
                  <option value="Economics & Social Policy">Economics & Social Policy</option>
                  <option value="General Literature Review">General Literature Review</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-zinc-300 dark:text-zinc-300 light:text-zinc-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief research objectives and paper topics..."
                  className="w-full bg-[#18181b] dark:bg-[#18181b] light:bg-zinc-100 text-white dark:text-white light:text-zinc-900 text-xs rounded-xl px-4 py-3 border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 focus:outline-none focus:border-[#d2f235]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800 dark:border-zinc-800 light:border-zinc-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn-recraft-lime px-6 py-2.5 rounded-full text-xs font-black shadow-lg disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Onboarding Walkthrough Tutorial Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />

      {/* User Manual Modal */}
      <UserManualModal
        isOpen={showUserManual}
        onClose={() => setShowUserManual(false)}
      />

    </div>
  );
}
