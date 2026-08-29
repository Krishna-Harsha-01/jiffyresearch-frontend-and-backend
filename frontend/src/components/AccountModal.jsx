import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  LogOut, 
  Trash2, 
  X, 
  CheckCircle2, 
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AccountModal({ isOpen, onClose }) {
  const { user, logout, deleteAccount } = useAuth();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !user) return null;

  // Format account created date and time stably
  const rawCreated = user.createdAt || user.created_at;
  const createdDate = rawCreated ? new Date(rawCreated) : null;
  const isValidDate = createdDate && !isNaN(createdDate.getTime());

  const formattedDate = isValidDate
    ? createdDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Unknown Date';

  const formattedTime = isValidDate
    ? createdDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      })
    : 'Unknown Time';

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

  const handleLogout = async () => {
    try {
      setShowConfirmLogout(false);
      onClose();
      await logout();
      window.location.replace('/login');
    } catch (e) {
      window.location.replace('/login');
    }
  };

  const isAdmin = user?.role === 'admin' || user?.email?.toLowerCase() === 'jiffyresearchnxt@gmail.com';

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
              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                isAdmin 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                  : 'bg-[#d2f235]/20 text-[#d2f235] border border-[#d2f235]/40'
              }`}>
                {isAdmin ? 'System Administrator' : 'Verified Researcher'}
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-medium flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3.5 h-3.5 text-zinc-400" />
              <span>{user.email}</span>
            </p>
          </div>
        </div>

        {/* Modal Body: Account Details */}
        <div className="overflow-y-auto pr-1 space-y-6 flex-1">
          
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

          {/* Account Danger Actions */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800">
            {!showConfirmLogout ? (
              <button
                onClick={() => setShowConfirmLogout(true)}
                className="px-5 py-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white font-extrabold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-[#d2f235]" />
                <span>Sign Out of Account</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-[#d2f235]/10 p-2 rounded-2xl border border-[#d2f235]/30">
                <span className="text-[11px] font-bold text-zinc-300 pl-2">Are you sure you want to log out?</span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-xl bg-[#d2f235] hover:bg-[#c2e225] text-black font-black text-xs transition-colors cursor-pointer"
                >
                  Yes, Log Out
                </button>
                <button
                  onClick={() => setShowConfirmLogout(false)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}

            {!isAdmin ? (
              <button
                onClick={() => setShowConfirmDelete(true)}
                className="px-4 py-2 rounded-full text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Account</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Protected Administrator Account</span>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Permanent Account Deletion Warning Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#09090b] text-white w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-rose-500/40 shadow-2xl relative space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight font-['Cinzel']">
                Permanently Delete Account & Data?
              </h3>
              <p className="text-xs text-rose-300/90 font-medium leading-relaxed">
                Warning: This action will permanently erase your user account (<strong className="text-white">{user?.email}</strong>) and execute a total database purge.
              </p>
            </div>

            {/* List of Data to be Erased */}
            <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/20 text-xs space-y-2 text-zinc-300 text-left">
              <div className="text-[11px] font-black uppercase text-rose-300 tracking-wider mb-1">
                The following data will be permanently destroyed:
              </div>
              <div className="flex items-center gap-2">
                <span className="text-rose-400">✕</span>
                <span>All uploaded research papers & PDF files</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-rose-400">✕</span>
                <span>All saved evidence notes & annotations</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-rose-400">✕</span>
                <span>All Gemini AI Assistant chat logs & previous sessions</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-rose-400">✕</span>
                <span>All synthesized literature review reports</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-rose-400">✕</span>
                <span>All research workspaces & knowledge graph mappings</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-rose-400">✕</span>
                <span>Authentication credentials & cloud database records</span>
              </div>
            </div>

            <p className="text-[11px] text-zinc-500 text-center font-semibold">
              ⚠️ This action is instantaneous, non-reversible, and cannot be undone.
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmDelete(false)}
                className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-all cursor-pointer"
              >
                Cancel / Keep Account
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-lg shadow-rose-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Erasing All Data...' : 'Yes, Permanently Delete All Data'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
