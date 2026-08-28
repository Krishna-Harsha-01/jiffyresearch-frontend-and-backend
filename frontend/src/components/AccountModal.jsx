import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Cpu, 
  Sliders, 
  LogOut, 
  Trash2, 
  X, 
  CheckCircle2, 
  Sparkles,
  Layers,
  Database
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AccountModal({ isOpen, onClose }) {
  const { user, logout, deleteAccount } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !user) return null;

  // Format account created date and time
  const createdDate = user.created_at ? new Date(user.created_at) : new Date();
  const formattedDate = createdDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = createdDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      let code = undefined;
      if (user.mfaEnabled) {
        code = window.prompt('Enter your 6-digit 2FA code to confirm account deletion:');
        if (!code) {
          setIsDeleting(false);
          return;
        }
      }
      await deleteAccount(code);
      onClose();
      window.location.href = '/register';
    } catch (err) {
      console.error('Failed to delete account:', err);
      alert(err.response?.data?.error || 'Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#09090b] text-white w-full max-w-2xl rounded-3xl p-6 sm:p-8 border border-zinc-800 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-4 mb-6 shrink-0 border-b border-zinc-800 pb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#d2f235] to-[#9ec412] text-black font-black text-2xl flex items-center justify-center shrink-0 shadow-lg">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                {user.name}
              </h2>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#d2f235]/20 text-[#d2f235] border border-[#d2f235]/40">
                Verified Researcher
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-medium flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3.5 h-3.5 text-zinc-400" />
              <span>{user.email}</span>
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 mb-6 shrink-0">
          <button
            onClick={() => setActiveTab('account')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
              activeTab === 'account'
                ? 'bg-white text-black shadow-md'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>My Account Details</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
              activeTab === 'settings'
                ? 'bg-white text-black shadow-md'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>AI Settings & Engine</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="overflow-y-auto pr-1 space-y-6 flex-1">
          
          {activeTab === 'account' && (
            <div className="space-y-6">
              
              {/* Account Created At Details Card */}
              <div className="bg-[#121215] p-5 rounded-2xl border border-zinc-800 space-y-4 shadow-sm">
                <h3 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#d2f235]" />
                  <span>Account Registration & Timestamp</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="bg-[#18181b] p-4 rounded-xl border border-zinc-800">
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                      Registration Date
                    </span>
                    <div className="text-sm font-black text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#d2f235]" />
                      <span>{formattedDate}</span>
                    </div>
                  </div>

                  <div className="bg-[#18181b] p-4 rounded-xl border border-zinc-800">
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                      Registration Time
                    </span>
                    <div className="text-sm font-black text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#d2f235]" />
                      <span>{formattedTime}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Profile Summary Info */}
              <div className="bg-[#121215] p-5 rounded-2xl border border-zinc-800 space-y-3">
                <h3 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#d2f235]" />
                  <span>Account Status & Authentication</span>
                </h3>

                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#18181b] border border-zinc-800 text-xs font-bold">
                    <span className="text-zinc-400">User ID</span>
                    <span className="text-zinc-300 font-mono text-[11px]">USR-{user.id || '2026-001'}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#18181b] border border-zinc-800 text-xs font-bold">
                    <span className="text-zinc-400">Database Synchronization</span>
                    <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Active & Synchronized
                    </span>
                  </div>
                </div>
              </div>

              {/* Account Danger Actions */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800">
                <button
                  onClick={logout}
                  className="px-5 py-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white font-extrabold text-xs flex items-center gap-2 transition-all shadow-md"
                >
                  <LogOut className="w-4 h-4 text-[#d2f235]" />
                  <span>Sign Out of Account</span>
                </button>

                {!showConfirmDelete ? (
                  <button
                    onClick={() => setShowConfirmDelete(true)}
                    className="px-4 py-2 rounded-full text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Account</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 bg-rose-500/10 p-2 rounded-2xl border border-rose-500/30">
                    <span className="text-[11px] font-bold text-rose-300 pl-2">Confirm permanent deletion?</span>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs transition-colors"
                    >
                      {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                    </button>
                    <button
                      onClick={() => setShowConfirmDelete(false)}
                      className="px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 font-bold text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              
              {/* AI Engine Configuration Card */}
              <div className="bg-[#121215] p-5 rounded-2xl border border-zinc-800 space-y-4">
                <h3 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#d2f235]" />
                  <span>AI Engine Specifications</span>
                </h3>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-[#18181b] border border-zinc-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-extrabold text-white uppercase">Primary AI Engine</h4>
                      <p className="text-[11px] text-zinc-400 font-medium">Google Gemini 2.5 Flash High-Speed Reasoning</p>
                    </div>
                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded bg-[#d2f235]/20 text-[#d2f235] border border-[#d2f235]/40">
                      ACTIVE
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#18181b] border border-zinc-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-extrabold text-white uppercase">Context Horizon Window</h4>
                      <p className="text-[11px] text-zinc-400 font-medium">6,000 Characters per uploaded research document</p>
                    </div>
                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                      EXPANDED
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#18181b] border border-zinc-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-extrabold text-white uppercase">Evidence Grounding</h4>
                      <p className="text-[11px] text-zinc-400 font-medium">Automatic multi-document citation verification</p>
                    </div>
                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      ENABLED
                    </span>
                  </div>
                </div>
              </div>

              {/* Data & Storage Preferences */}
              <div className="bg-[#121215] p-5 rounded-2xl border border-zinc-800 space-y-3">
                <h3 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#d2f235]" />
                  <span>Workspace & Storage Settings</span>
                </h3>

                <div className="space-y-2 pt-1 text-xs text-zinc-300 font-medium">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#18181b] border border-zinc-800">
                    <span>Local SQLite Database Cache</span>
                    <span className="font-bold text-emerald-400">Connected</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#18181b] border border-zinc-800">
                    <span>Synthesis Output Template</span>
                    <span className="font-bold text-[#d2f235]">Salford & Co. Deep Burgundy</span>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
