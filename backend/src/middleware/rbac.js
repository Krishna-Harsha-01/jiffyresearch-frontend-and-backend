const { dbGet } = require('../db/database');

// Require specific user roles (e.g. requireRole('admin'), requireRole('admin', 'researcher'))
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized.' });
    }

    const userRole = req.user.role || 'researcher';
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden. You do not have sufficient permissions to perform this action.'
      });
    }

    next();
  };
};

// Require user to own or have valid role access to a workspace
const requireWorkspaceAccess = (minRole = 'viewer') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized.' });
      }

      const workspaceId = req.params.workspaceId || req.params.id || req.body.workspaceId || req.query.workspaceId;
      
      if (!workspaceId) {
        return res.status(400).json({ success: false, error: 'Workspace ID is required.' });
      }

      // System Admins bypass workspace ownership check
      if (req.user.role === 'admin') {
        return next();
      }

      const workspace = await dbGet('SELECT * FROM workspaces WHERE id = ?', [workspaceId]);
      if (!workspace) {
        return res.status(404).json({ success: false, error: 'Workspace not found.' });
      }

      if (workspace.user_id !== req.user.userId) {
        return res.status(403).json({ success: false, error: 'Access denied to this workspace.' });
      }

      req.workspace = workspace;
      next();
    } catch (error) {
      console.error('Workspace access middleware error:', error);
      return res.status(500).json({ success: false, error: 'Internal server authorization error.' });
    }
  };
};

module.exports = {
  requireRole,
  requireWorkspaceAccess
};
