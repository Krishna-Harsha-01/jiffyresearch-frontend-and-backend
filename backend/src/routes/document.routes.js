const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const authMiddleware = require('../middleware/auth');
const { uploadDocument, getDocumentById, deleteDocument } = require('../controllers/document.controller');

router.use(authMiddleware);

router.post('/upload', upload.single('file'), uploadDocument);
router.get('/:id', getDocumentById);
router.delete('/:id', deleteDocument);

module.exports = router;
