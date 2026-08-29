const { dbQuery, dbGet, dbRun } = require('../db/database');
const { chatWithResearchContext, generateKnowledgeGraph } = require('../services/gemini.service');

const chat = async (req, res) => {
  try {
    const { workspaceId, query, sessionId } = req.body;
    const userId = req.user.userId;

    if (!workspaceId || !query) {
      return res.status(400).json({ success: false, error: 'Workspace ID and query are required.' });
    }

    const workspace = await dbGet('SELECT * FROM workspaces WHERE id = ? AND user_id = ?', [workspaceId, userId]);
    if (!workspace) {
      return res.status(404).json({ success: false, error: 'Workspace not found.' });
    }

    const activeSessionId = sessionId || `session_${Date.now()}`;

    // Save user message to database with session_id
    await dbRun(
      'INSERT INTO chat_messages (workspace_id, user_id, sender, message, session_id) VALUES (?, ?, ?, ?, ?)',
      [workspaceId, userId, 'user', query, activeSessionId]
    );

    // Fetch workspace documents for context
    const documents = await dbQuery('SELECT title, summary, content FROM documents WHERE workspace_id = ?', [workspaceId]);

    // Fetch previous chat context for this specific session
    const prevMessages = await dbQuery(
      'SELECT sender, message FROM chat_messages WHERE workspace_id = ? AND (session_id = ? OR session_id IS NULL) ORDER BY created_at DESC LIMIT 6',
      [workspaceId, activeSessionId]
    );

    // Call Gemini Service
    const aiResult = await chatWithResearchContext(query, documents, prevMessages);

    // Save AI response to database with session_id
    const result = await dbRun(
      'INSERT INTO chat_messages (workspace_id, user_id, sender, message, citations, session_id) VALUES (?, ?, ?, ?, ?, ?)',
      [workspaceId, userId, 'ai', aiResult.answer, JSON.stringify(aiResult.citations || []), activeSessionId]
    );

    return res.json({
      success: true,
      sessionId: activeSessionId,
      chatMessage: {
        id: result.id,
        workspace_id: workspaceId,
        session_id: activeSessionId,
        sender: 'ai',
        message: aiResult.answer,
        citations: aiResult.citations || [],
        created_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('AI chat error:', error);
    return res.status(500).json({ success: false, error: 'Failed to process AI chat query.' });
  }
};

const getChatSessions = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user.userId;

    const workspace = await dbGet('SELECT * FROM workspaces WHERE id = ? AND user_id = ?', [workspaceId, userId]);
    if (!workspace) {
      return res.status(404).json({ success: false, error: 'Workspace not found.' });
    }

    const messages = await dbQuery(
      'SELECT * FROM chat_messages WHERE workspace_id = ? AND user_id = ? ORDER BY created_at ASC',
      [workspaceId, userId]
    );

    // Group messages by session_id
    const sessionsMap = {};
    messages.forEach(msg => {
      const sId = msg.session_id || 'default_session';
      if (!sessionsMap[sId]) {
        sessionsMap[sId] = {
          id: sId,
          title: msg.sender === 'user' ? (msg.message.length > 50 ? msg.message.slice(0, 50) + '...' : msg.message) : 'Research Chat',
          created_at: msg.created_at,
          messages: []
        };
      }
      sessionsMap[sId].messages.push({
        ...msg,
        citations: msg.citations ? JSON.parse(msg.citations) : []
      });
    });

    // Return up to 10 latest chat sessions
    const sessionsList = Object.values(sessionsMap).reverse().slice(0, 10);

    return res.json({
      success: true,
      sessions: sessionsList
    });
  } catch (error) {
    console.error('Get chat sessions error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch previous chat sessions.' });
  }
};

const deleteChatSession = async (req, res) => {
  try {
    const { workspaceId, sessionId } = req.params;
    const userId = req.user.userId;

    await dbRun(
      'DELETE FROM chat_messages WHERE workspace_id = ? AND user_id = ? AND (session_id = ? OR (session_id IS NULL AND ? = "default_session"))',
      [workspaceId, userId, sessionId, sessionId]
    );

    return res.json({ success: true, message: 'Chat session deleted.' });
  } catch (error) {
    console.error('Delete chat session error:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete chat session.' });
  }
};

const getKnowledgeGraph = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user.userId;

    const workspace = await dbGet('SELECT * FROM workspaces WHERE id = ? AND user_id = ?', [workspaceId, userId]);
    if (!workspace) {
      return res.status(404).json({ success: false, error: 'Workspace not found.' });
    }

    const documents = await dbQuery('SELECT id, title, summary, content, entities FROM documents WHERE workspace_id = ?', [workspaceId]);
    const notes = await dbQuery('SELECT id, title, content FROM notes WHERE workspace_id = ?', [workspaceId]);

    const parsedDocs = documents.map(d => ({
      ...d,
      entities: d.entities ? JSON.parse(d.entities) : []
    }));

    const graphData = await generateKnowledgeGraph(parsedDocs, notes);

    return res.json({ success: true, graph: graphData });
  } catch (error) {
    console.error('Knowledge Graph error:', error);
    return res.status(500).json({ success: false, error: 'Failed to generate Knowledge Graph.' });
  }
};

const createNote = async (req, res) => {
  try {
    const { workspaceId, title, content, tags } = req.body;
    const userId = req.user.userId;

    const result = await dbRun(
      'INSERT INTO notes (workspace_id, user_id, title, content, tags) VALUES (?, ?, ?, ?, ?)',
      [workspaceId, userId, title, content, JSON.stringify(tags || [])]
    );

    const newNote = await dbGet('SELECT * FROM notes WHERE id = ?', [result.id]);

    return res.status(201).json({
      success: true,
      note: {
        ...newNote,
        tags: JSON.parse(newNote.tags || '[]')
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to create note.' });
  }
};

const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    await dbRun('DELETE FROM notes WHERE id = ? AND user_id = ?', [id, userId]);
    return res.json({ success: true, message: 'Note deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to delete note.' });
  }
};

const clearChat = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user.userId;

    const workspace = await dbGet('SELECT * FROM workspaces WHERE id = ? AND user_id = ?', [workspaceId, userId]);
    if (!workspace) {
      return res.status(404).json({ success: false, error: 'Workspace not found.' });
    }

    await dbRun('DELETE FROM chat_messages WHERE workspace_id = ? AND user_id = ?', [workspaceId, userId]);

    return res.json({ success: true, message: 'Chat history cleared successfully.' });
  } catch (error) {
    console.error('Clear chat error:', error);
    return res.status(500).json({ success: false, error: 'Failed to clear chat history.' });
  }
};

const autoExtractNotes = async (req, res) => {
  try {
    const { workspaceId, tag } = req.body;
    const userId = req.user.userId;

    const workspace = await dbGet('SELECT * FROM workspaces WHERE id = ? AND user_id = ?', [workspaceId, userId]);
    if (!workspace) {
      return res.status(404).json({ success: false, error: 'Workspace not found.' });
    }

    const documents = await dbQuery('SELECT title, summary, content FROM documents WHERE workspace_id = ?', [workspaceId]);
    if (!documents || documents.length === 0) {
      return res.status(400).json({ success: false, error: 'Please upload at least one research file first.' });
    }

    const { extractEvidenceNotesFromDocs } = require('../services/gemini.service');
    const targetTag = tag || 'Key Finding';
    const extractedList = await extractEvidenceNotesFromDocs(documents, targetTag);

    const insertedNotes = [];
    for (const item of extractedList) {
      const noteTag = item.tag || targetTag;
      const result = await dbRun(
        'INSERT INTO notes (workspace_id, user_id, title, content, tags) VALUES (?, ?, ?, ?, ?)',
        [workspaceId, userId, item.title, item.content, JSON.stringify([noteTag])]
      );
      const note = await dbGet('SELECT * FROM notes WHERE id = ?', [result.id]);
      insertedNotes.push({
        ...note,
        tags: [noteTag]
      });
    }

    return res.json({
      success: true,
      notes: insertedNotes,
      message: `Successfully extracted ${insertedNotes.length} AI research evidence notes for ${targetTag}.`
    });
  } catch (error) {
    console.error('Auto extract notes error:', error);
    return res.status(500).json({ success: false, error: 'Failed to extract notes with AI.' });
  }
};

module.exports = {
  chat,
  getChatSessions,
  deleteChatSession,
  getKnowledgeGraph,
  createNote,
  deleteNote,
  clearChat,
  autoExtractNotes
};
