const { dbGet, dbQuery, dbRun } = require('../db/database');
const { logSecurityEvent } = require('../services/security.service');

const getAuditLogs = async (req, res) => {
  try {
    const { status, eventType, limit = 100 } = req.query;

    let sql = 'SELECT * FROM security_audit_logs WHERE 1=1';
    const params = [];

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }
    if (eventType) {
      sql += ' AND event_type = ?';
      params.push(eventType);
    }

    sql += ' ORDER BY id DESC LIMIT ?';
    params.push(parseInt(limit, 10));

    const logs = await dbQuery(sql, params);
    return res.json({ success: true, logs });
  } catch (error) {
    console.error('Admin audit logs error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch admin security audit logs.' });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await dbQuery(
      `SELECT id, name, email, role, is_verified, failed_login_attempts, locked_until, mfa_enabled, created_at 
       FROM users ORDER BY id DESC`
    );

    return res.json({ success: true, users });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch user list.' });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;

    const targetUser = await dbGet('SELECT id, email, role FROM users WHERE id = ?', [userId]);
    if (!targetUser) {
      return res.status(404).json({ success: false, error: 'Target user not found.' });
    }

    await dbRun('UPDATE users SET role = ? WHERE id = ?', [role, userId]);
    await logSecurityEvent(
      req.user.userId, 
      req.user.email, 
      'ROLE_CHANGE', 
      req, 
      'SUCCESS', 
      `Changed user ${targetUser.email} role from ${targetUser.role} to ${role}`
    );

    return res.json({
      success: true,
      message: `User role updated to ${role} successfully.`
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update user role.' });
  }
};

const unlockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await dbGet('SELECT id, email FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    await dbRun('UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = ?', [userId]);
    await logSecurityEvent(req.user.userId, req.user.email, 'ADMIN_UNLOCKED_USER', req, 'SUCCESS', `Unlocked user ${user.email}`);

    return res.json({ success: true, message: `Account for ${user.email} unlocked successfully.` });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to unlock user.' });
  }
};

const getSecurityStats = async (req, res) => {
  try {
    const userStats = await dbGet('SELECT COUNT(*) as total_users FROM users');
    const lockedStats = await dbGet("SELECT COUNT(*) as locked_users FROM users WHERE locked_until > CURRENT_TIMESTAMP");
    const failedLogins = await dbGet("SELECT COUNT(*) as total_failed FROM security_audit_logs WHERE event_type = 'LOGIN_FAILED'");
    const alertLogs = await dbGet("SELECT COUNT(*) as total_alerts FROM security_audit_logs WHERE status IN ('ALERT', 'WARNING')");

    return res.json({
      success: true,
      stats: {
        totalUsers: userStats.total_users || 0,
        lockedUsers: lockedStats.locked_users || 0,
        totalFailedLogins: failedLogins.total_failed || 0,
        totalSecurityAlerts: alertLogs.total_alerts || 0
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch security statistics.' });
  }
};

module.exports = {
  getAuditLogs,
  getUsers,
  updateUserRole,
  unlockUser,
  getSecurityStats
};
