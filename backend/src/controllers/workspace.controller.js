const { dbQuery, dbGet, dbRun } = require('../db/database');

const getWorkspaces = async (req, res) => {
  try {
    const userId = req.user.userId;
    const workspaces = await dbQuery(
      `SELECT w.*, 
        (SELECT COUNT(*) FROM documents d WHERE d.workspace_id = w.id) as document_count,
        (SELECT COUNT(*) FROM notes n WHERE n.workspace_id = w.id) as note_count,
        (SELECT COUNT(*) FROM reports r WHERE r.workspace_id = w.id) as report_count
       FROM workspaces w 
       WHERE w.user_id = ? 
       ORDER BY w.updated_at DESC`,
      [userId]
    );

    return res.json({ success: true, workspaces });
  } catch (error) {
    console.error('Get workspaces error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch workspaces.' });
  }
};

const getWorkspaceById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const workspace = await dbGet('SELECT * FROM workspaces WHERE id = ? AND user_id = ?', [id, userId]);
    if (!workspace) {
      return res.status(404).json({ success: false, error: 'Workspace not found.' });
    }

    const documents = await dbQuery('SELECT id, workspace_id, title, filename, file_type, file_size, summary, key_insights, entities, created_at FROM documents WHERE workspace_id = ? ORDER BY created_at DESC', [id]);
    const notes = await dbQuery('SELECT * FROM notes WHERE workspace_id = ? ORDER BY created_at DESC', [id]);
    const reports = await dbQuery('SELECT * FROM reports WHERE workspace_id = ? ORDER BY created_at DESC', [id]);
    const chatMessages = await dbQuery('SELECT * FROM chat_messages WHERE workspace_id = ? ORDER BY created_at ASC', [id]);

    // Parse JSON fields safely
    const parsedDocs = documents.map(d => ({
      ...d,
      key_insights: d.key_insights ? JSON.parse(d.key_insights) : [],
      entities: d.entities ? JSON.parse(d.entities) : []
    }));

    const parsedNotes = notes.map(n => ({
      ...n,
      tags: n.tags ? JSON.parse(n.tags) : []
    }));

    const parsedChat = chatMessages.map(c => ({
      ...c,
      citations: c.citations ? JSON.parse(c.citations) : []
    }));

    const parsedReports = reports.map(r => ({
      ...r,
      sources: r.sources ? JSON.parse(r.sources) : []
    }));

    return res.json({
      success: true,
      workspace: {
        ...workspace,
        documents: parsedDocs,
        notes: parsedNotes,
        reports: parsedReports,
        chatMessages: parsedChat
      }
    });
  } catch (error) {
    console.error('Get workspace detail error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch workspace detail.' });
  }
};

const createWorkspace = async (req, res) => {
  try {
    const { name, description, domain } = req.body;
    const userId = req.user.userId;

    const result = await dbRun(
      'INSERT INTO workspaces (user_id, name, description, domain) VALUES (?, ?, ?, ?)',
      [userId, name, description || '', domain || 'General Research']
    );

    const newWorkspace = await dbGet('SELECT * FROM workspaces WHERE id = ?', [result.id]);

    return res.status(201).json({ success: true, workspace: newWorkspace });
  } catch (error) {
    console.error('Create workspace error:', error);
    return res.status(500).json({ success: false, error: 'Failed to create workspace.' });
  }
};

const deleteWorkspace = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const workspace = await dbGet('SELECT * FROM workspaces WHERE id = ? AND user_id = ?', [id, userId]);
    if (!workspace) {
      return res.status(404).json({ success: false, error: 'Workspace not found.' });
    }

    await dbRun('DELETE FROM workspaces WHERE id = ?', [id]);

    return res.json({ success: true, message: 'Workspace deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to delete workspace.' });
  }
};

module.exports = {
  getWorkspaces,
  getWorkspaceById,
  createWorkspace,
  deleteWorkspace
};
