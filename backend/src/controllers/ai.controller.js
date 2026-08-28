const { dbQuery, dbGet, dbRun } = require('../db/database');
const { chatWithResearchContext, generateKnowledgeGraph } = require('../services/gemini.service');

const chat = async (req, res) => {
  try {
    const { workspaceId, query } = req.body;
    const userId = req.user.userId;

    if (!workspaceId || !query) {
      return res.status(400).json({ success: false, error: 'Workspace ID and query are required.' });
    }

    const workspace = await dbGet('SELECT * FROM workspaces WHERE id = ? AND user_id = ?', [workspaceId, userId]);
    if (!workspace) {
      return res.status(404).json({ success: false, error: 'Workspace not found.' });
    }

    // Save user message to database
    await dbRun(
      'INSERT INTO chat_messages (workspace_id, user_id, sender, message) VALUES (?, ?, ?, ?)',
      [workspaceId, userId, 'user', query]
    );

    // Fetch workspace documents for context
    const documents = await dbQuery('SELECT title, summary, content FROM documents WHERE workspace_id = ?', [workspaceId]);

    // Fetch previous chat context
    const prevMessages = await dbQuery('SELECT sender, message FROM chat_messages WHERE workspace_id = ? ORDER BY created_at DESC LIMIT 6', [workspaceId]);

    // Call Gemini Service
    const aiResult = await chatWithResearchContext(query, documents, prevMessages);

    // Save AI response to database
    const result = await dbRun(
      'INSERT INTO chat_messages (workspace_id, user_id, sender, message, citations) VALUES (?, ?, ?, ?, ?)',
      [workspaceId, userId, 'ai', aiResult.answer, JSON.stringify(aiResult.citations || [])]
    );

    return res.json({
      success: true,
      chatMessage: {
        id: result.id,
        workspace_id: workspaceId,
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

module.exports = {
  chat,
  getKnowledgeGraph,
  createNote,
  deleteNote
};
