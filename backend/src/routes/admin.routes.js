const express = require('express');
const router = express.Router();
const {
  getAuditLogs,
  getUsers,
  updateUserRole,
  unlockUser,
  getSecurityStats
} = require('../controllers/admin.controller');

const authMiddleware = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { validateBody, updateRoleSchema } = require('../middleware/validate');

// All Admin routes require 'admin' role
router.use(authMiddleware);
router.use(requireRole('admin'));

router.get('/audit-logs', getAuditLogs);
router.get('/users', getUsers);
router.post('/users/role', validateBody(updateRoleSchema), updateUserRole);
router.post('/users/:userId/unlock', unlockUser);
router.get('/stats', getSecurityStats);

module.exports = router;
