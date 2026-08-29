const express = require('express');
const router = express.Router();
const { 
  chat, 
  getChatSessions, 
  deleteChatSession, 
  getKnowledgeGraph, 
  createNote, 
  deleteNote, 
  clearChat,
  autoExtractNotes 
} = require('../controllers/ai.controller');
const authMiddleware = require('../middleware/auth');
const { validateBody, noteSchema } = require('../middleware/validate');

router.use(authMiddleware);

router.post('/chat', chat);
router.get('/chat/:workspaceId/sessions', getChatSessions);
router.delete('/chat/:workspaceId/session/:sessionId', deleteChatSession);
router.delete('/chat/:workspaceId', clearChat);
router.get('/graph/:workspaceId', getKnowledgeGraph);
router.post('/note', validateBody(noteSchema.extend({ workspaceId: require('zod').number() })), createNote);
router.post('/auto-extract-notes', autoExtractNotes);
router.delete('/note/:id', deleteNote);

module.exports = router;
