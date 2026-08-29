import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  Users, 
  Lock, 
  Unlock, 
  RefreshCw, 
  CheckCircle2, 
  UserCheck, 
  Search, 
  Filter,
  Calendar,
  Clock,
  LogIn,
  ShieldAlert,
  ShieldCheck,
  Crown
} from 'lucide-react';
import { adminService } from '../services/api';

const PRIMARY_ADMIN_EMAIL = 'jiffyresearchnxt@gmail.com';

export default function AdminSecurityDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('accounts'); // 'accounts', 'logins', 'alerts'
  const [searchQuery, setSearchQuery] = useState('');
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
        adminService.getAuditLogs({ limit: 100 })
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (usersRes.data.success) setUsers(usersRes.data.users || []);
      if (logsRes.data.success) setAuditLogs(logsRes.data.logs || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load administrative security data. Ensure you are logged in as jiffyresearchnxt@gmail.com.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleRoleChange = async (userId, userEmail, newRole) => {
    if (userEmail.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase()) {
      setError('The primary Administrator (jiffyresearchnxt@gmail.com) role cannot be changed.');
      setTimeout(() => setError(''), 4000);
      return;
    }

    if (newRole === 'admin') {
      setError('Only jiffyresearchnxt@gmail.com is authorized as Administrator. Delegating admin role to others is restricted.');
      setTimeout(() => setError(''), 4000);
      return;
    }

    try {
      const res = await adminService.updateUserRole(userId, newRole);
      if (res.data.success) {
        setMessage(res.data.message);
        setTimeout(() => setMessage(''), 3000);
        loadAdminData();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update user role.');
      setTimeout(() => setError(''), 4000);
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

  // Helper to format ISO date nicely
  const formatDateTime = (dateStr) => {
    if (!dateStr) return { date: 'N/A', time: 'N/A' };
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return { date: 'N/A', time: 'N/A' };
    return {
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
    };
  };

  // Filter accounts
  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.role && u.role.toLowerCase().includes(q))
    );
  });

  // Filter login events
  const loginLogs = auditLogs.filter((l) => {
    const isLoginEvent = [
      'LOGIN_SUCCESS', 
      'LOGIN_FAILED', 
      'LOGIN_BLOCKED_LOCKED', 
      'USER_LOGOUT', 
      'MFA_CHALLENGE_ISSUED', 
      'MFA_FAILED'
    ].includes(l.event_type);

    if (!isLoginEvent) return false;
    if (filterStatus && l.status !== filterStatus) return false;

    const q = searchQuery.toLowerCase();
    return (
      !searchQuery ||
      (l.email && l.email.toLowerCase().includes(q)) ||
      (l.event_type && l.event_type.toLowerCase().includes(q)) ||
      (l.ip_address && l.ip_address.toLowerCase().includes(q))
    );
  });

  // Filter security & general alert logs
  const securityLogs = auditLogs.filter((l) => {
    if (filterStatus && l.status !== filterStatus) return false;
    const q = searchQuery.toLowerCase();
    return (
      !searchQuery ||
      (l.email && l.email.toLowerCase().includes(q)) ||
      (l.event_type && l.event_type.toLowerCase().includes(q)) ||
      (l.details && l.details.toLowerCase().includes(q))
    );
  });

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 text-xs text-zinc-400">
        <RefreshCw className="w-6 h-6 animate-spin text-[#d2f235]" />
        <span>Loading Admin Console & Account Logs...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in">
      
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-zinc-900 via-[#0f1117] to-zinc-900 border border-zinc-800 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1a1c23] via-[#090a0f] to-[#050507] border border-[#d2f235]/50 shadow-xl flex items-center justify-center shrink-0">
            <Crown className="w-7 h-7 text-[#d2f235]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#d2f235]/15 text-[#d2f235] border border-[#d2f235]/40 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Exclusive Admin Console
              </span>
              <span className="text-zinc-400 text-xs font-mono">
                Admin: <strong className="text-white font-mono">{PRIMARY_ADMIN_EMAIL}</strong>
              </span>
            </div>
            <h1 className="text-2xl font-black text-white italic font-['Cinzel'] mt-1">
              Platform Administration & User Audits
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Tracking up to 100 account creation details, user logins, session activity, and RBAC controls.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{message}</span>
        </div>
      )}

      {/* Security Metrics Overview Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-bold uppercase">Stored Accounts</span>
              <Users className="w-4 h-4 text-[#d2f235]" />
            </div>
            <p className="text-3xl font-black text-white font-mono">{users.length} <span className="text-xs text-zinc-500 font-normal">/ 100 max</span></p>
            <p className="text-[11px] text-zinc-400">Registered platform users</p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-bold uppercase">Locked Accounts</span>
              <Lock className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-3xl font-black text-rose-400 font-mono">{stats.lockedUsers}</p>
            <p className="text-[11px] text-zinc-400">Brute-force protected lockouts</p>
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
              <span className="text-xs font-bold uppercase">Security Events</span>
              <Shield className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-3xl font-black text-indigo-400 font-mono">{auditLogs.length} <span className="text-xs text-zinc-500 font-normal">/ 100</span></p>
            <p className="text-[11px] text-zinc-400">Recent audit log entries</p>
          </div>
        </div>
      )}

      {/* Main Console Panel */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap border-b border-zinc-800 bg-zinc-950 px-6 gap-2 pt-3">
          <button
            onClick={() => setActiveTab('accounts')}
            className={`py-3 px-5 text-xs font-bold rounded-t-2xl transition-all border-b-2 ${
              activeTab === 'accounts'
                ? 'border-[#d2f235] text-[#d2f235] bg-zinc-900'
                : 'border-transparent text-zinc-400 hover:text-white'
            } flex items-center gap-2 cursor-pointer`}
          >
            <UserCheck className="w-4 h-4" /> 
            <span>Account Creations & Details ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('logins')}
            className={`py-3 px-5 text-xs font-bold rounded-t-2xl transition-all border-b-2 ${
              activeTab === 'logins'
                ? 'border-[#d2f235] text-[#d2f235] bg-zinc-900'
                : 'border-transparent text-zinc-400 hover:text-white'
            } flex items-center gap-2 cursor-pointer`}
          >
            <LogIn className="w-4 h-4" /> 
            <span>User Login & Session History ({loginLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('alerts')}
            className={`py-3 px-5 text-xs font-bold rounded-t-2xl transition-all border-b-2 ${
              activeTab === 'alerts'
                ? 'border-[#d2f235] text-[#d2f235] bg-zinc-900'
                : 'border-transparent text-zinc-400 hover:text-white'
            } flex items-center gap-2 cursor-pointer`}
          >
            <ShieldAlert className="w-4 h-4" /> 
            <span>Full Security Audit Stream ({securityLogs.length})</span>
          </button>
        </div>

        {/* Filter / Search Bar */}
        <div className="p-4 bg-zinc-950/60 border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by email, name, IP, or event type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-700/80 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#d2f235]"
            />
          </div>

          {activeTab !== 'accounts' && (
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-bold text-zinc-400">Filter Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-zinc-900 text-white text-xs rounded-xl px-3 py-1.5 border border-zinc-700 focus:outline-none focus:border-[#d2f235]"
              >
                <option value="">All Statuses</option>
                <option value="SUCCESS">SUCCESS</option>
                <option value="FAILED">FAILED</option>
                <option value="ALERT">ALERT</option>
                <option value="WARNING">WARNING</option>
              </select>
            </div>
          )}
        </div>

        <div className="p-6">
          
          {/* TAB 1: Account Creations & Registered Users */}
          {activeTab === 'accounts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                <span>Showing up to 100 stored user account creation records</span>
                <span>{filteredUsers.length} account(s) match search</span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-zinc-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-950">
                    <tr className="border-b border-zinc-800 text-zinc-400 uppercase font-black tracking-wider text-[11px]">
                      <th className="py-3.5 px-4">User</th>
                      <th className="py-3.5 px-4">Registered Email</th>
                      <th className="py-3.5 px-4">Account Created At</th>
                      <th className="py-3.5 px-4">Role</th>
                      <th className="py-3.5 px-4">Email Status</th>
                      <th className="py-3.5 px-4">Security Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 bg-zinc-900/30">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-zinc-500 text-xs">
                          No account records found matching your search.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => {
                        const isPrimaryAdmin = u.email.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase();
                        const isLocked = u.locked_until && new Date(u.locked_until) > new Date();
                        const { date: regDate, time: regTime } = formatDateTime(u.created_at);

                        return (
                          <tr key={u.id} className="hover:bg-zinc-800/40 transition-colors">
                            <td className="py-3.5 px-4 font-bold text-white">
                              <div className="flex items-center gap-2">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                                  isPrimaryAdmin 
                                    ? 'bg-[#d2f235] text-black font-black' 
                                    : 'bg-zinc-800 text-zinc-300'
                                }`}>
                                  {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <span>{u.name}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-zinc-300 font-mono text-[11px]">
                              {u.email}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="space-y-0.5">
                                <div className="text-zinc-200 font-medium flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-[#d2f235]" />
                                  <span>{regDate}</span>
                                </div>
                                <div className="text-zinc-400 text-[10px] font-mono flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-zinc-500" />
                                  <span>{regTime}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              {isPrimaryAdmin ? (
                                <span className="px-2.5 py-1 rounded-full bg-[#d2f235]/20 text-[#d2f235] border border-[#d2f235]/40 text-[10px] font-black uppercase flex items-center gap-1 w-fit">
                                  <Crown className="w-3 h-3" /> System Admin
                                </span>
                              ) : (
                                <select
                                  value={u.role || 'researcher'}
                                  onChange={(e) => handleRoleChange(u.id, u.email, e.target.value)}
                                  className="bg-zinc-950 text-white font-bold text-xs rounded-lg px-2.5 py-1 border border-zinc-700 focus:outline-none focus:border-[#d2f235]"
                                >
                                  <option value="researcher">researcher</option>
                                  <option value="viewer">viewer</option>
                                </select>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              {u.is_verified ? (
                                <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                                </span>
                              ) : (
                                <span className="text-amber-400 font-bold text-[11px]">Unverified</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              {isLocked ? (
                                <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-black uppercase flex items-center gap-1 w-fit">
                                  <Lock className="w-3 h-3" /> Locked Out
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold w-fit block">
                                  Active ({u.failed_login_attempts || 0} failed)
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              {isLocked && (
                                <button
                                  onClick={() => handleUnlockUser(u.id)}
                                  className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 ml-auto cursor-pointer"
                                >
                                  <Unlock className="w-3.5 h-3.5" /> Unlock
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: Login & Authentication Activity Details */}
          {activeTab === 'logins' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                <span>Showing up to 100 recent login and authentication events</span>
                <span>{loginLogs.length} event(s) recorded</span>
              </div>

              <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
                {loginLogs.length === 0 ? (
                  <div className="p-8 text-center text-zinc-500 text-xs bg-zinc-950/40 rounded-2xl border border-zinc-800">
                    No login events match the current filter.
                  </div>
                ) : (
                  loginLogs.map((log) => {
                    const { date, time } = formatDateTime(log.created_at);
                    const isSuccess = log.status === 'SUCCESS';
                    const isAlert = log.status === 'ALERT' || log.status === 'FAILED';

                    return (
                      <div
                        key={log.id}
                        className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                              isSuccess ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                              isAlert ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                              'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}>
                              {log.event_type}
                            </span>
                            <span className="text-white font-bold font-mono">{log.email || 'Anonymous User'}</span>
                            <span className="text-zinc-400 text-[11px]">— {log.details}</span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-500 font-mono">
                            <span>IP: <strong className="text-zinc-400">{log.ip_address}</strong></span>
                            <span>•</span>
                            <span className="truncate max-w-sm">UA: {log.user_agent}</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0 font-mono text-[11px] space-y-0.5">
                          <div className="text-zinc-300 font-bold">{date}</div>
                          <div className="text-zinc-500 text-[10px]">{time}</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Full Security Audit Stream */}
          {activeTab === 'alerts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                <span>Real-time security audit log stream (up to 100 records)</span>
                <span>{securityLogs.length} total event(s)</span>
              </div>

              <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
                {securityLogs.length === 0 ? (
                  <div className="p-8 text-center text-zinc-500 text-xs bg-zinc-950/40 rounded-2xl border border-zinc-800">
                    No security audit logs found.
                  </div>
                ) : (
                  securityLogs.map((log) => {
                    const { date, time } = formatDateTime(log.created_at);

                    return (
                      <div
                        key={log.id}
                        className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
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

                        <div className="text-right shrink-0 font-mono text-[11px]">
                          <span className="text-zinc-400">{date} {time}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
