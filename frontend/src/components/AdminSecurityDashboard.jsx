import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Users, Lock, Unlock, RefreshCw, CheckCircle2, UserCheck, Search, Filter } from 'lucide-react';
import { adminService } from '../services/api';

export default function AdminSecurityDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'logs'
  const [filterStatus, setFilterStatus] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, usersRes, logsRes] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers(),
        adminService.getAuditLogs({ status: filterStatus || undefined, limit: 100 })
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (usersRes.data.success) setUsers(usersRes.data.users);
      if (logsRes.data.success) setAuditLogs(logsRes.data.logs);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load administrative security data. Ensure you have Admin role.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [filterStatus]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await adminService.updateUserRole(userId, newRole);
      if (res.data.success) {
        setMessage(res.data.message);
        setTimeout(() => setMessage(''), 3000);
        loadAdminData();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update user role.');
    }
  };

  const handleUnlockUser = async (userId) => {
    try {
      const res = await adminService.unlockUser(userId);
      if (res.data.success) {
        setMessage(res.data.message);
        setTimeout(() => setMessage(''), 3000);
        loadAdminData();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to unlock user.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-xs text-zinc-400">
        Loading Admin Security Dashboard...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-zinc-900 via-[#0f1117] to-zinc-900 border border-zinc-800 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1a1c23] via-[#090a0f] to-[#050507] border border-[#c58b41]/60 shadow-xl flex items-center justify-center shrink-0">
            <Shield className="w-7 h-7 text-[#d4af37]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#d2f235]/10 text-[#d2f235] border border-[#d2f235]/30 text-[10px] font-black uppercase tracking-wider">
                System Admin
              </span>
              <h1 className="text-2xl font-black text-white italic font-['Cinzel']">
                Security & Monitoring Console
              </h1>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              System-wide audit trail, brute force attack monitoring, account unlocking, and RBAC user access control
            </p>
          </div>
        </div>

        <button
          onClick={loadAdminData}
          className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" /> Refresh System Audit Data
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
          {error}
        </div>
      )}

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {message}
        </div>
      )}

      {/* Security Metrics Overview Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-bold uppercase">Total Users</span>
              <Users className="w-4 h-4 text-[#d2f235]" />
            </div>
            <p className="text-3xl font-black text-white font-mono">{stats.totalUsers}</p>
            <p className="text-[11px] text-zinc-400">Registered platform accounts</p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-bold uppercase">Locked Accounts</span>
              <Lock className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-3xl font-black text-rose-400 font-mono">{stats.lockedUsers}</p>
            <p className="text-[11px] text-zinc-400">Temporarily locked out</p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-bold uppercase">Failed Logins</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-3xl font-black text-amber-400 font-mono">{stats.totalFailedLogins}</p>
            <p className="text-[11px] text-zinc-400">Tracked authentication failures</p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-bold uppercase">Security Alerts</span>
              <Shield className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-3xl font-black text-indigo-400 font-mono">{stats.totalSecurityAlerts}</p>
            <p className="text-[11px] text-zinc-400">Suspicious activity warnings</p>
          </div>
        </div>
      )}

      {/* Console Tabs */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="flex border-b border-zinc-800 bg-zinc-950 px-6 gap-3 pt-3">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-3 px-5 text-xs font-bold rounded-t-2xl transition-all border-b-2 ${
              activeTab === 'users'
                ? 'border-[#d2f235] text-[#d2f235] bg-zinc-900'
                : 'border-transparent text-zinc-400 hover:text-white'
            } flex items-center gap-2`}
          >
            <UserCheck className="w-4 h-4" /> User Management & RBAC ({users.length})
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`py-3 px-5 text-xs font-bold rounded-t-2xl transition-all border-b-2 ${
              activeTab === 'logs'
                ? 'border-[#d2f235] text-[#d2f235] bg-zinc-900'
                : 'border-transparent text-zinc-400 hover:text-white'
            } flex items-center gap-2`}
          >
            <AlertTriangle className="w-4 h-4" /> Security Audit Log Stream ({auditLogs.length})
          </button>
        </div>

        <div className="p-6">
          {/* TAB 1: User Management & RBAC */}
          {activeTab === 'users' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 uppercase font-black tracking-wider">
                    <th className="pb-3 px-3">User</th>
                    <th className="pb-3 px-3">Email</th>
                    <th className="pb-3 px-3">Role (RBAC)</th>
                    <th className="pb-3 px-3">Email Status</th>
                    <th className="pb-3 px-3">Security Status</th>
                    <th className="pb-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {users.map((u) => {
                    const isLocked = u.locked_until && new Date(u.locked_until) > new Date();
                    return (
                      <tr key={u.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="py-4 px-3 font-bold text-white">
                          {u.name}
                        </td>
                        <td className="py-4 px-3 text-zinc-300 font-mono">
                          {u.email}
                        </td>
                        <td className="py-4 px-3">
                          <select
                            value={u.role || 'researcher'}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className="bg-zinc-950 text-white font-bold text-xs rounded-lg px-2.5 py-1.5 border border-zinc-700 focus:outline-none focus:border-[#d2f235]"
                          >
                            <option value="admin">admin</option>
                            <option value="researcher">researcher</option>
                            <option value="viewer">viewer</option>
                          </select>
                        </td>
                        <td className="py-4 px-3">
                          {u.is_verified ? (
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                            </span>
                          ) : (
                            <span className="text-amber-400 font-bold">Unverified</span>
                          )}
                        </td>
                        <td className="py-4 px-3">
                          {isLocked ? (
                            <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-black uppercase flex items-center gap-1 w-fit">
                              <Lock className="w-3 h-3" /> Locked Out
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold w-fit block">
                              Active ({u.failed_login_attempts || 0} failed)
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-3 text-right">
                          {isLocked && (
                            <button
                              onClick={() => handleUnlockUser(u.id)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 ml-auto"
                            >
                              <Unlock className="w-3.5 h-3.5" /> Unlock Account
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: System Audit Logs */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-zinc-400" />
                  <span className="text-xs font-bold text-zinc-300">Filter by Status:</span>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-zinc-950 text-white text-xs rounded-lg px-3 py-1.5 border border-zinc-700"
                  >
                    <option value="">All Statuses</option>
                    <option value="SUCCESS">SUCCESS</option>
                    <option value="FAILED">FAILED</option>
                    <option value="ALERT">ALERT</option>
                    <option value="WARNING">WARNING</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                          log.status === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-400' :
                          log.status === 'ALERT' ? 'bg-rose-500/20 text-rose-400' :
                          'bg-amber-500/20 text-amber-400'
                        }`}>
                          {log.event_type}
                        </span>
                        <span className="text-white font-bold">{log.email || 'Anonymous'}</span>
                        <span className="text-zinc-400 text-[11px]">— {log.details}</span>
                      </div>
                      <p className="text-[11px] text-zinc-500 font-mono">
                        IP: {log.ip_address} • UA: {log.user_agent}
                      </p>
                    </div>

                    <span className="text-[11px] text-zinc-400 font-mono shrink-0">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
