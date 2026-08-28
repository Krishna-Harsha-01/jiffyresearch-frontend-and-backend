import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Sparkles, 
  FolderKanban, 
  BookOpen, 
  LogOut, 
  User, 
  Cpu, 
  ArrowRight,
  UserX,
  AlertTriangle,
  Menu,
  X,
  HelpCircle,
  Compass,
  Sun,
  Moon,
  Monitor,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import UserManualModal from './UserManualModal';
import OnboardingModal from './OnboardingModal';
import AccountModal from './AccountModal';
import SecurityCenterModal from './SecurityCenterModal';

export default function Navbar() {
  const { user, logout, deleteAccount, isSecurityModalOpen, setIsSecurityModalOpen } = useAuth();
  const { themeMode, setThemeMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      let code = undefined;
      if (user?.mfaEnabled) {
        code = window.prompt('Enter your 6-digit 2FA code to confirm account deletion:');
        if (!code) {
          setDeleting(false);
          return;
        }
      }
      await deleteAccount(code);
      setShowDeleteModal(false);
      setMobileMenuOpen(false);
      window.location.href = '/register';
    } catch (err) {
      console.error('Failed to delete account:', err);
      alert(err.response?.data?.error || 'Failed to delete account. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/95 dark:bg-[#050505]/95 light:bg-white/95 border-b border-zinc-800 dark:border-zinc-800 light:border-zinc-200 backdrop-blur-xl shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 sm:w-11 h-10 sm:h-11 rounded-xl bg-gradient-to-br from-[#1a1c23] via-[#090a0f] to-[#050507] border border-[#c58b41]/60 shadow-md flex items-center justify-center shrink-0 group-hover:scale-105 transition-all">
              <span className="font-['Cinzel'] font-black text-xl sm:text-2xl text-transparent bg-clip-text bg-gradient-to-b from-[#f3e0aa] via-[#d4af37] to-[#a67c1e] drop-shadow-md select-none">
                J
              </span>
            </div>
            <div className="flex flex-col justify-center leading-none">
              <div className="flex items-center gap-2">
                <span className="font-['Cinzel'] font-black text-white text-sm sm:text-base tracking-[0.12em] uppercase">
                  JIFFY
                </span>
              </div>
              <span className="font-['Cinzel'] font-black text-white text-base sm:text-lg tracking-[0.18em] uppercase mt-0.5">
                RESEARCH
              </span>
              <span className="text-[7px] sm:text-[7.5px] font-mono font-bold tracking-[0.26em] text-[#c58b41] uppercase mt-0.5">
                STRATEGIC RESEARCH & INSIGHTS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-zinc-900/80 dark:bg-zinc-900/80 light:bg-zinc-100 p-1.5 rounded-full border border-zinc-800 dark:border-zinc-800 light:border-zinc-200">
            <Link
              to="/"
              className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-all ${
                isActive('/') 
                  ? 'bg-[#d2f235] text-black font-black shadow-md' 
                  : 'text-zinc-300 dark:text-zinc-300 light:text-zinc-700 hover:text-white'
              }`}
            >
              Overview
            </Link>
            {user && (
              <Link
                to="/dashboard"
                className={`px-4 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                  isActive('/dashboard') 
                    ? 'bg-[#d2f235] text-black font-black shadow-md' 
                    : 'text-zinc-300 dark:text-zinc-300 light:text-zinc-700 hover:text-white'
                }`}
              >
                <FolderKanban className="w-3.5 h-3.5" />
                Workspaces
              </Link>
            )}

            {user?.role === 'admin' && (
              <Link
                to="/admin/security"
                className={`px-3.5 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 transition-all ${
                  isActive('/admin/security')
                    ? 'bg-amber-400 text-black font-black shadow-md'
                    : 'text-amber-300 hover:text-amber-100'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                Admin Console
              </Link>
            )}

            {/* How-to-Use User Manual Button */}
            <button
              onClick={() => setShowManualModal(true)}
              className="px-3.5 py-1.5 rounded-full text-xs font-extrabold text-zinc-300 dark:text-zinc-300 light:text-zinc-700 hover:text-white flex items-center gap-1.5 transition-all"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#d2f235]" />
              <span>User Guide</span>
            </button>

            {/* Interactive Walkthrough Tutorial Button */}
            <button
              onClick={() => setShowOnboardingModal(true)}
              className="px-3.5 py-1.5 rounded-full text-xs font-extrabold text-zinc-300 dark:text-zinc-300 light:text-zinc-700 hover:text-white flex items-center gap-1.5 transition-all"
            >
              <Compass className="w-3.5 h-3.5 text-[#d2f235]" />
              <span>Tutorial</span>
            </button>
          </nav>

          {/* Desktop User Auth & Security Controls */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                {/* Security Center Button */}
                <button
                  onClick={() => setIsSecurityModalOpen(true)}
                  className="p-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-zinc-800 transition-all cursor-pointer flex items-center gap-1.5 px-3"
                  title="Security Center (2FA, Audit Logs, Verification)"
                >
                  <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
                  <span className="text-xs font-bold text-zinc-200">Security</span>
                </button>

                <button
                  onClick={() => setShowAccountModal(true)}
                  className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-all shadow-md group cursor-pointer"
                  title="My Account Details & AI Settings"
                >
                  <div className="w-6 h-6 rounded-full bg-[#d2f235] text-black flex items-center justify-center font-black text-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-black text-zinc-200 group-hover:text-white">{user.name}</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-zinc-800 text-[#d2f235] border border-zinc-700">
                    {user.role || 'User'}
                  </span>
                </button>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full text-zinc-400 hover:text-white transition-colors"
                  title="Log Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="btn-recraft-secondary px-5 py-2 rounded-full text-xs"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-recraft-lime px-5 py-2 rounded-full text-xs flex items-center gap-1.5"
                >
                  Try Jiffy Studio
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl px-4 py-6 space-y-4 animate-in slide-in-from-top-4">
            <nav className="flex flex-col space-y-2">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-xl text-sm font-semibold text-slate-200 hover:bg-slate-900 flex items-center gap-2"
              >
                <Cpu className="w-4 h-4 text-indigo-400" />
                Overview
              </Link>
              {user && (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-xl text-sm font-semibold text-slate-200 hover:bg-slate-900 flex items-center gap-2"
                >
                  <FolderKanban className="w-4 h-4 text-indigo-400" />
                  My Workspaces
                </Link>
              )}
              {user?.role === 'admin' && (
                <Link
                  to="/admin/security"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-xl text-sm font-semibold text-amber-300 hover:bg-slate-900 flex items-center gap-2"
                >
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  Admin Security Console
                </Link>
              )}
              {user && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsSecurityModalOpen(true);
                  }}
                  className="px-4 py-3 rounded-xl text-sm font-semibold text-slate-200 hover:bg-slate-900 flex items-center gap-2 text-left"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  Security Center (2FA & Audit Logs)
                </button>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowManualModal(true);
                }}
                className="px-4 py-3 rounded-xl text-sm font-semibold text-slate-200 hover:bg-slate-900 flex items-center gap-2 text-left"
              >
                <BookOpen className="w-4 h-4 text-purple-400" />
                User Guide & Manual
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowOnboardingModal(true);
                }}
                className="px-4 py-3 rounded-xl text-sm font-semibold text-indigo-300 hover:bg-slate-900 flex items-center gap-2 text-left"
              >
                <Compass className="w-4 h-4 text-indigo-400" />
                Interactive Tutorial
              </button>
            </nav>

            <div className="pt-4 border-t border-slate-800">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 px-3 py-2 bg-slate-900 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{user.name}</div>
                      <div className="text-xs text-slate-400">{user.email}</div>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3 rounded-xl text-center text-sm font-semibold text-slate-200 bg-slate-900 border border-slate-800"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3 rounded-xl text-center text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg shadow-indigo-600/30"
                  >
                    Get Started Free
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Account Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-red-500/40 shadow-2xl relative">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center mb-4 mx-auto shadow-inner">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-extrabold text-white text-center">Delete Account Permanently?</h3>
            <p className="text-xs text-slate-300 text-center mt-2 leading-relaxed">
              This action will permanently delete your user account (<strong className="text-white">{user?.email}</strong>) and remove all your research workspaces, uploaded papers, and AI reports.
            </p>

            <div className="flex items-center justify-center gap-3 mt-6 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteAccount}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all disabled:opacity-50"
              >
                {deleting ? 'Deleting Account...' : 'Yes, Delete My Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Manual Modal */}
      <UserManualModal
        isOpen={showManualModal}
        onClose={() => setShowManualModal(false)}
      />

      {/* Interactive Onboarding Walkthrough Tutorial Modal */}
      <OnboardingModal
        isOpen={showOnboardingModal}
        onClose={() => setShowOnboardingModal(false)}
      />

      {/* User Account Details & Settings Modal */}
      <AccountModal
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
      />

      {/* Security Center Modal */}
      <SecurityCenterModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
      />
    </>
  );
}
