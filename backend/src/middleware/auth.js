const jwt = require('jsonwebtoken');
const { dbGet } = require('../db/database');

const authMiddleware = async (req, res, next) => {
  let token = null;

  // Check HttpOnly Cookie first
  if (req.cookies && req.cookies.nexus_token) {
    token = req.cookies.nexus_token;
  }
  
  // Fallback to Bearer Token in Authorization header
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Unauthorized. No authentication token provided.' });
  }

  try {
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'nexus_research_super_secret_jwt_key_2026_hackathon'
    );

    // Fetch user state from database to check session token version, active session ID & account status
    const user = await dbGet(
      'SELECT id, name, email, role, is_verified, token_version, is_session_active, active_session_id, locked_until FROM users WHERE id = ?', 
      [decoded.userId]
    );

    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized. User account no longer exists.' });
    }

    // Check account lockout
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return res.status(423).json({
        success: false,
        error: 'Account is temporarily locked due to multiple failed login attempts. Please try again later.'
      });
    }

    // Session Token Version check (Invalidates old tokens upon logout-all or security reset)
    if (decoded.token_version && decoded.token_version !== user.token_version) {
      return res.status(401).json({ success: false, error: 'Unauthorized. Session expired or invalidated.' });
    }

    // Single Active Session check: If session ID in token doesn't match current active session
    if (decoded.sessionId && user.active_session_id && decoded.sessionId !== user.active_session_id) {
      return res.status(401).json({ success: false, error: 'Unauthorized. This account is active in another session.' });
    }

    // Refresh last active timestamp asynchronously
    const { dbRun } = require('../db/database');
    dbRun('UPDATE users SET is_session_active = 1, last_active_at = CURRENT_TIMESTAMP WHERE id = ?', [user.id]).catch(() => {});

    req.user = {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role || 'researcher',
      isVerified: Boolean(user.is_verified),
      tokenVersion: user.token_version,
      sessionId: decoded.sessionId || user.active_session_id
    };

    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Unauthorized. Token invalid or expired.' });
  }
};

module.exports = authMiddleware;
