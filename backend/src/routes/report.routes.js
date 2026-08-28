const express = require('express');
const router = express.Router();
const { generateReport, getReports, deleteReport } = require('../controllers/report.controller');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post('/generate', generateReport);
router.get('/workspace/:workspaceId', getReports);
router.delete('/:id', deleteReport);

module.exports = router;
