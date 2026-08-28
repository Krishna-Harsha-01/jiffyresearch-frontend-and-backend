const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const { dbGet, dbRun, dbQuery } = require('../db/database');
const { summarizeDocument } = require('../services/gemini.service');

const uploadDocument = async (req, res) => {
  try {
    const { workspaceId, rawTextTitle, rawTextContent } = req.body;
    const userId = req.user.userId;

    if (!workspaceId) {
      return res.status(400).json({ success: false, error: 'Workspace ID is required.' });
    }

    const workspace = await dbGet('SELECT * FROM workspaces WHERE id = ? AND user_id = ?', [workspaceId, userId]);
    if (!workspace) {
      return res.status(404).json({ success: false, error: 'Workspace not found.' });
    }

    let title = 'Untitled Research Document';
    let filename = null;
    let filepath = null;
    let fileType = 'text';
    let fileSize = 0;
    let textContent = '';

    if (req.file) {
      filename = req.file.filename;
      filepath = req.file.path;
      fileType = req.file.mimetype || path.extname(req.file.originalname);
      fileSize = req.file.size;
      title = req.body.title || req.file.originalname;

      const ext = path.extname(req.file.originalname).toLowerCase();
      if (ext === '.pdf') {
        const fileBuffer = fs.readFileSync(req.file.path);
        const pdfData = await pdfParse(fileBuffer);
        textContent = pdfData.text;
      } else {
        textContent = fs.readFileSync(req.file.path, 'utf8');
      }
    } else if (rawTextContent) {
      title = rawTextTitle || 'Pasted Research Text';
      textContent = rawTextContent;
      fileSize = Buffer.byteLength(textContent, 'utf8');
      fileType = 'text/plain';
    } else {
      return res.status(400).json({ success: false, error: 'No document file or raw text provided.' });
    }

    // Call Gemini API to synthesize summary, key insights, and entities
    const aiAnalysis = await summarizeDocument(title, textContent);

    const result = await dbRun(
      `INSERT INTO documents 
       (workspace_id, user_id, title, filename, filepath, file_type, file_size, content, summary, key_insights, entities)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        workspaceId,
        userId,
        title,
        filename,
        filepath,
        fileType,
        fileSize,
        textContent,
        aiAnalysis.summary,
        JSON.stringify(aiAnalysis.key_insights || []),
        JSON.stringify(aiAnalysis.entities || [])
      ]
    );

    // Update workspace timestamp
    await dbRun('UPDATE workspaces SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [workspaceId]);

    const newDoc = await dbGet('SELECT * FROM documents WHERE id = ?', [result.id]);

    return res.status(201).json({
      success: true,
      message: 'Document uploaded and analyzed with AI successfully.',
      document: {
        ...newDoc,
        key_insights: JSON.parse(newDoc.key_insights || '[]'),
        entities: JSON.parse(newDoc.entities || '[]')
      }
    });
  } catch (error) {
    console.error('Upload document error:', error);
    return res.status(500).json({ success: false, error: 'Failed to upload and process document.' });
  }
};

const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const doc = await dbGet('SELECT * FROM documents WHERE id = ? AND user_id = ?', [id, userId]);
    if (!doc) {
      return res.status(404).json({ success: false, error: 'Document not found.' });
    }

    return res.json({
      success: true,
      document: {
        ...doc,
        key_insights: JSON.parse(doc.key_insights || '[]'),
        entities: JSON.parse(doc.entities || '[]')
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch document.' });
  }
};

const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const doc = await dbGet('SELECT * FROM documents WHERE id = ? AND user_id = ?', [id, userId]);
    if (!doc) {
      return res.status(404).json({ success: false, error: 'Document not found.' });
    }

    if (doc.filepath && fs.existsSync(doc.filepath)) {
      try {
        fs.unlinkSync(doc.filepath);
      } catch (err) {
        console.warn('Could not remove file on disk:', err.message);
      }
    }

    await dbRun('DELETE FROM documents WHERE id = ?', [id]);

    return res.json({ success: true, message: 'Document removed successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to delete document.' });
  }
};

module.exports = {
  uploadDocument,
  getDocumentById,
  deleteDocument
};
