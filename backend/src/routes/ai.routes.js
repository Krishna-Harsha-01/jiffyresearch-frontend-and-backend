const express = require('express');
const router = express.Router();
const { chat, getKnowledgeGraph, createNote, deleteNote } = require('../controllers/ai.controller');
const authMiddleware = require('../middleware/auth');
const { validateBody, noteSchema } = require('../middleware/validate');

router.use(authMiddleware);

router.post('/chat', chat);
router.get('/graph/:workspaceId', getKnowledgeGraph);
router.post('/note', validateBody(noteSchema.extend({ workspaceId: require('zod').number() })), createNote);
router.delete('/note/:id', deleteNote);

module.exports = router;
