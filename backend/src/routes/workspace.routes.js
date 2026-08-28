const express = require('express');
const router = express.Router();
const { getWorkspaces, getWorkspaceById, createWorkspace, deleteWorkspace } = require('../controllers/workspace.controller');
const authMiddleware = require('../middleware/auth');
const { validateBody, workspaceSchema } = require('../middleware/validate');

router.use(authMiddleware);

router.get('/', getWorkspaces);
router.get('/:id', getWorkspaceById);
router.post('/', validateBody(workspaceSchema), createWorkspace);
router.delete('/:id', deleteWorkspace);

module.exports = router;
