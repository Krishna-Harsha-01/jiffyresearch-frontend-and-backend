const { dbQuery, dbGet, dbRun } = require('../db/database');
const { generateResearchReport } = require('../services/gemini.service');

const generateReport = async (req, res) => {
  try {
    const { workspaceId, reportType } = req.body;
    const userId = req.user.userId;

    if (!workspaceId || !reportType) {
      return res.status(400).json({ success: false, error: 'Workspace ID and report type are required.' });
    }

    const workspace = await dbGet('SELECT * FROM workspaces WHERE id = ? AND user_id = ?', [workspaceId, userId]);
    if (!workspace) {
      return res.status(404).json({ success: false, error: 'Workspace not found.' });
    }

    const documents = await dbQuery('SELECT title, summary, key_insights FROM documents WHERE workspace_id = ?', [workspaceId]);
    const notes = await dbQuery('SELECT title, content FROM notes WHERE workspace_id = ?', [workspaceId]);

    const reportData = await generateResearchReport(reportType, workspace.name, documents, notes);

    const result = await dbRun(
      'INSERT INTO reports (workspace_id, user_id, title, report_type, content, sources) VALUES (?, ?, ?, ?, ?, ?)',
      [workspaceId, userId, reportData.title, reportType, reportData.content, JSON.stringify(reportData.sources || [])]
    );

    const newReport = await dbGet('SELECT * FROM reports WHERE id = ?', [result.id]);

    return res.status(201).json({
      success: true,
      report: {
        ...newReport,
        sources: JSON.parse(newReport.sources || '[]')
      }
    });
  } catch (error) {
    console.error('Generate report error:', error);
    return res.status(500).json({ success: false, error: 'Failed to generate research report.' });
  }
};

const getReports = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user.userId;

    const reports = await dbQuery('SELECT * FROM reports WHERE workspace_id = ? AND user_id = ? ORDER BY created_at DESC', [workspaceId, userId]);

    const parsedReports = reports.map(r => ({
      ...r,
      sources: JSON.parse(r.sources || '[]')
    }));

    return res.json({ success: true, reports: parsedReports });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch reports.' });
  }
};

const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    await dbRun('DELETE FROM reports WHERE id = ? AND user_id = ?', [id, userId]);
    return res.json({ success: true, message: 'Report deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to delete report.' });
  }
};

module.exports = {
  generateReport,
  getReports,
  deleteReport
};
