import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, KeyRound, Smartphone, History, CheckCircle2, Copy, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';

export default function SecurityCenterModal({ isOpen, onClose }) {
  const { user, refreshUser } = useAuth();

  const [activeTab, setActiveTab] = useState('2fa'); // '2fa', 'logs'

  // MFA states
  const [mfaLoading, setMfaLoading] = useState(false);
  const [mfaSetupData, setMfaSetupData] = useState(null);
  const [mfaCodeInput, setMfaCodeInput] = useState('');
  const [mfaError, setMfaError] = useState('');
  const [mfaSuccess, setMfaSuccess] = useState('');

  // Security logs state
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const [copiedSecret, setCopiedSecret] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchSecurityLogs();
    }
  }, [isOpen]);

  const fetchSecurityLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await authService.getSecurityLogs();
      if (res.data.success) {
        setLogs(res.data.logs || []);
      }
    } catch (err) {
      console.error('Failed to fetch security logs:', err);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleStartMfaSetup = async () => {
    setMfaError('');
    setMfaSuccess('');
    setMfaLoading(true);

    try {
      const res = await authService.setupMfa();
      if (res.data.success) {
        setMfaSetupData(res.data);
      }
    } catch (err) {
      setMfaError(err.response?.data?.error || 'Failed to initiate 2FA setup.');
    } finally {
      setMfaLoading(false);
    }
  };

  const handleVerifyMfaSetup = async (e) => {
    e.preventDefault();
    setMfaError('');
    setMfaLoading(true);

    try {
      const res = await authService.verifyMfaSetup({
        code: mfaCodeInput,
        backupCodes: mfaSetupData?.backupCodes || []
      });

      if (res.data.success) {
        setMfaSuccess('2FA Multi-Factor Authentication is now enabled!');
        setMfaSetupData(null);
        setMfaCodeInput('');
        await refreshUser();
        fetchSecurityLogs();
      }
    } catch (err) {
      setMfaError(err.response?.data?.error || 'Invalid 2FA code. Please check your authenticator app.');
    } finally {
      setMfaLoading(false);
    }
  };

  const handleDisableMfa = async () => {
    if (!window.confirm('Are you sure you want to disable Multi-Factor Authentication? Your account will be less secure.')) {
      return;
    }

    setMfaLoading(true);
    try {
      const codePrompt = window.prompt('Enter your current 6-digit 2FA code to disable:');
      if (!codePrompt) {
        setMfaLoading(false);
        return;
      }

      const res = await authService.disableMfa({ code: codePrompt });
      if (res.data.success) {
        setMfaSuccess('2FA has been disabled.');
        await refreshUser();
        fetchSecurityLogs();
      }
    } catch (err) {
      setMfaError(err.response?.data?.error || 'Failed to disable 2FA.');
    } finally {
      setMfaLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#09090b] border border-zinc-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1a1c23] via-[#090a0f] to-[#050507] border border-[#c58b41]/60 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#d4af37]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-['Cinzel'] tracking-wide">
                Security & Authentication Center
              </h3>
              <p className="text-xs text-zinc-400">
                Manage 2FA authenticator apps & monitor login audit logs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-800 bg-zinc-950 px-6 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('2fa')}
            className={`py-3 px-4 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
              activeTab === '2fa'
                ? 'border-[#d2f235] text-[#d2f235] bg-zinc-900'
                : 'border-transparent text-zinc-400 hover:text-white'
            } flex items-center gap-2`}
          >
            <Smartphone className="w-4 h-4" /> Two-Factor Auth (2FA)
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`py-3 px-4 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
              activeTab === 'logs'
                ? 'border-[#d2f235] text-[#d2f235] bg-zinc-900'
                : 'border-transparent text-zinc-400 hover:text-white'
            } flex items-center gap-2`}
          >
            <History className="w-4 h-4" /> Security Audit Log
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {mfaError && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{mfaError}</span>
            </div>
          )}

          {mfaSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{mfaSuccess}</span>
            </div>
          )}

          {/* TAB 1: 2FA MFA Setup */}
          {activeTab === '2fa' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${user?.mfaEnabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Authenticator App 2FA</h4>
                    <p className="text-xs text-zinc-400">
                      {user?.mfaEnabled 
                        ? 'Active — Account protected with TOTP authenticator app' 
                        : 'Disabled — Add an extra layer of security using Google Authenticator / Authy'}
                    </p>
                  </div>
                </div>

                {user?.mfaEnabled ? (
                  <button
                    onClick={handleDisableMfa}
                    disabled={mfaLoading}
                    className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 text-xs font-bold transition-all"
                  >
                    Disable 2FA
                  </button>
                ) : !mfaSetupData ? (
                  <button
                    onClick={handleStartMfaSetup}
                    disabled={mfaLoading}
                    className="px-4 py-2 rounded-xl bg-[#d2f235] text-black font-extrabold text-xs shadow-lg hover:bg-[#b8d62b] transition-all"
                  >
                    {mfaLoading ? 'Generating...' : 'Enable 2FA'}
                  </button>
                ) : null}
              </div>

              {/* MFA Setup QR & Secret Step */}
              {mfaSetupData && !user?.mfaEnabled && (
                <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-700 space-y-6">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-[#d2f235]" /> Step 1: Scan QR Code with Authenticator App
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                    <div className="bg-white p-3 rounded-2xl w-fit mx-auto shadow-xl">
                      <img src={mfaSetupData.qrCodeDataUrl} alt="2FA QR Code" className="w-44 h-44" />
                    </div>

                    <div className="space-y-4">
                      <div>
                        <span className="text-[11px] uppercase font-black text-zinc-400 block mb-1">
                          Manual Secret Key
                        </span>
                        <div className="flex items-center gap-2 bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                          <code className="text-xs font-mono font-bold text-[#d2f235] flex-1 tracking-wider">
                            {mfaSetupData.secret}
                          </code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(mfaSetupData.secret);
                              setCopiedSecret(true);
                              setTimeout(() => setCopiedSecret(false), 2000);
                            }}
                            className="p-1.5 text-zinc-400 hover:text-white"
                          >
                            {copiedSecret ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] uppercase font-black text-zinc-400 block mb-1">
                          Backup Recovery Codes
                        </span>
                        <div className="grid grid-cols-3 gap-1 bg-zinc-950 p-2 rounded-xl border border-zinc-800 text-[10px] font-mono text-zinc-300">
                          {mfaSetupData.backupCodes?.map((code, idx) => (
                            <span key={idx} className="bg-zinc-900 px-1.5 py-1 rounded text-center">{code}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleVerifyMfaSetup} className="pt-4 border-t border-zinc-800 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-white mb-2">
                        Step 2: Enter 6-Digit Code from Authenticator App to Confirm
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={mfaCodeInput}
                        onChange={(e) => setMfaCodeInput(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="123456"
                        className="w-full bg-zinc-950 text-white font-mono text-lg font-bold tracking-[0.5em] text-center rounded-xl py-3 border border-zinc-700 focus:border-[#d2f235]"
                      />
                    </div>

                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setMfaSetupData(null)}
                        className="px-4 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold hover:bg-zinc-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={mfaLoading || mfaCodeInput.length !== 6}
                        className="px-6 py-2.5 rounded-xl bg-[#d2f235] text-black font-extrabold text-xs shadow-lg hover:bg-[#b8d62b] disabled:opacity-50"
                      >
                        Verify & Activate 2FA
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Security Audit Log Timeline */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400">
                  Recent Account Security Events (Last 50)
                </h4>
                <button
                  onClick={fetchSecurityLogs}
                  className="text-xs text-[#d2f235] hover:underline"
                >
                  Refresh Logs
                </button>
              </div>

              {logsLoading ? (
                <div className="py-12 text-center text-xs text-zinc-400">Loading audit history...</div>
              ) : logs.length === 0 ? (
                <div className="py-12 text-center text-xs text-zinc-500">No security audit logs recorded yet.</div>
              ) : (
                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            log.status === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-400' :
                            log.status === 'ALERT' ? 'bg-rose-500/20 text-rose-400' :
                            'bg-amber-500/20 text-amber-400'
                          }`}>
                            {log.event_type}
                          </span>
                          <span className="text-zinc-300 font-bold">{log.details || 'Security event logged'}</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 font-mono">
                          IP: {log.ip_address} • {log.user_agent ? log.user_agent.substring(0, 45) + '...' : ''}
                        </p>
                      </div>

                      <span className="text-[11px] text-zinc-400 font-mono shrink-0">
                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-800 text-white font-bold text-xs hover:bg-zinc-700 transition-colors"
          >
            Close Security Center
          </button>
        </div>

      </div>
    </div>
  );
}
