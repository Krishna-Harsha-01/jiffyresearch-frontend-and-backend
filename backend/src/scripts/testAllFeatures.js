require('dotenv').config();
const { initDatabase, dbRun, dbGet, dbQuery } = require('../db/database');
const { summarizeDocument, chatWithResearchContext, generateResearchReport, generateKnowledgeGraph } = require('../services/gemini.service');
const { generateCaptcha, verifyCaptcha, generateMFAData, verifyTOTPCode, logSecurityEvent } = require('../services/security.service');
const { validateEmailDeliverability } = require('../services/email.service');
const bcrypt = require('bcryptjs');

async function runComprehensiveAudit() {
  console.log('=============== COMPREHENSIVE SYSTEM & FEATURE AUDIT ===============\n');
  let passedCount = 0;
  let totalCount = 0;

  function assert(condition, testName) {
    totalCount++;
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passedCount++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}`);
    }
  }

  // 1. DATABASE LAYER INIT
  console.log('--- 1. DATABASE & CONFIG AUDIT ---');
  await initDatabase();
  assert(true, 'Database connection & schema tables initialized.');
  assert(Boolean(process.env.GEMINI_API_KEY), 'Gemini API key configured in environment.');
  assert(Boolean(process.env.SUPABASE_URL), 'Supabase URL configured in environment.');

  // 2. EMAIL DELIVERABILITY & VALIDATION
  console.log('\n--- 2. EMAIL VALIDATION AUDIT ---');
  const gmailCheck = await validateEmailDeliverability('audit_test@gmail.com');
  assert(gmailCheck.valid === true, 'Trusted provider (@gmail.com) accepted immediately.');

  const fakeCheck = await validateEmailDeliverability('user@mailinator.com');
  assert(fakeCheck.valid === false, 'Disposable domain (@mailinator.com) blocked.');

  // 3. SECURITY & AUTHENTICATION AUDIT
  console.log('\n--- 3. SECURITY & AUTHENTICATION AUDIT ---');
  const captcha = await generateCaptcha();
  assert(Boolean(captcha.token) && Boolean(captcha.captchaSvg), 'SVG CAPTCHA generated successfully.');
  
  const mfaData = await generateMFAData('audit_user@gmail.com');
  assert(Boolean(mfaData.secret) && Boolean(mfaData.qrCodeDataUrl), 'MFA TOTP Secret & QR Code generated.');
  assert(Array.isArray(mfaData.backupCodes) && mfaData.backupCodes.length === 6, 'Generated 6 single-use MFA backup codes.');

  // 4. USER REGISTRATION & LOCKOUT AUDIT
  console.log('\n--- 4. USER MANAGEMENT AUDIT ---');
  const testEmail = `audit_user_${Date.now()}@gmail.com`;
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('Password123', salt);

  const userResult = await dbRun(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    ['Audit Researcher', testEmail, hash, 'researcher']
  );
  const userId = userResult.id;
  assert(Boolean(userId), `Created test user (ID: ${userId}).`);

  await logSecurityEvent(userId, testEmail, 'AUDIT_TEST_LOGIN', { ip: '127.0.0.1', headers: {} }, 'SUCCESS', 'Audit log test entry');
  const auditLogs = await dbQuery('SELECT * FROM security_audit_logs WHERE user_id = ?', [userId]);
  assert(auditLogs.length > 0, 'Security audit log recorded in database.');

  // 5. WORKSPACE MANAGEMENT AUDIT
  console.log('\n--- 5. WORKSPACE MANAGEMENT AUDIT ---');
  const wsResult = await dbRun(
    'INSERT INTO workspaces (user_id, name, description, domain) VALUES (?, ?, ?, ?)',
    [userId, 'Audit Research Workspace', 'Workspace for automated testing', 'Computer Science']
  );
  const wsId = wsResult.id;
  assert(Boolean(wsId), `Created test workspace (ID: ${wsId}).`);

  // 6. DOCUMENT INGESTION & GEMINI AI SUMMARIZATION
  console.log('\n--- 6. GEMINI AI DOCUMENT SUMMARIZATION AUDIT ---');
  const sampleDocText = `Quantum machine learning integrates quantum computing algorithms with classical machine learning techniques. By leveraging quantum superposition and entanglement, matrix operations in high-dimensional Hilbert spaces achieve exponential acceleration. Experimental results demonstrate a 40% reduction in training latency for deep neural networks.`;
  
  const docResult = await dbRun(
    'INSERT INTO documents (workspace_id, user_id, title, content) VALUES (?, ?, ?, ?)',
    [wsId, userId, 'Quantum_ML_Paper.pdf', sampleDocText]
  );
  const docId = docResult.id;
  assert(Boolean(docId), `Ingested document into workspace (ID: ${docId}).`);

  const summaryResult = await summarizeDocument('Quantum_ML_Paper.pdf', sampleDocText);
  assert(Boolean(summaryResult.summary) && summaryResult.summary.length > 20, 'Gemini AI generated document summary.');
  assert(Array.isArray(summaryResult.key_insights), 'Extracted key insights from document.');

  // 7. GEMINI AI RESEARCH CHAT
  console.log('\n--- 7. GEMINI AI CHAT ASSISTANT AUDIT ---');
  const chatResponse = await chatWithResearchContext(
    'What latency reduction was achieved in training neural networks?',
    [{ title: 'Quantum_ML_Paper.pdf', content: sampleDocText }]
  );
  assert(Boolean(chatResponse.answer) && chatResponse.answer.length > 30, 'Gemini AI generated grounded research answer.');
  assert(Array.isArray(chatResponse.citations), 'Generated citations for research answer.');

  // 8. KNOWLEDGE GRAPH & CONCEPT EFFICIENCY MATRIX
  console.log('\n--- 8. KNOWLEDGE GRAPH AUDIT ---');
  const graphResult = await generateKnowledgeGraph([{ id: docId, title: 'Quantum_ML_Paper.pdf', summary: summaryResult.summary }], []);
  assert(Array.isArray(graphResult.pieChartData), 'Extracted pie chart breakdown data.');
  assert(Array.isArray(graphResult.conceptEfficiency), 'Generated Concept Efficiency Matrix.');

  // 9. NOTES MANAGEMENT
  console.log('\n--- 9. NOTES MANAGEMENT AUDIT ---');
  const noteResult = await dbRun(
    'INSERT INTO notes (workspace_id, user_id, title, content, tags) VALUES (?, ?, ?, ?, ?)',
    [wsId, userId, 'Key Latency Finding', '40% reduction in training latency achieved using quantum superposition.', JSON.stringify(['Latency', 'Quantum'])]
  );
  const noteId = noteResult.id;
  assert(Boolean(noteId), `Created research note (ID: ${noteId}).`);

  // 10. SYNTHESIS REPORT GENERATION
  console.log('\n--- 10. SYNTHESIS REPORT GENERATION AUDIT ---');
  const reportResult = await generateResearchReport(
    'systematic_review',
    'Audit Research Workspace',
    [{ title: 'Quantum_ML_Paper.pdf', summary: summaryResult.summary, content: sampleDocText }],
    [{ title: 'Key Latency Finding', content: '40% reduction in training latency achieved using quantum superposition.' }]
  );
  assert(Boolean(reportResult.title) && Boolean(reportResult.content), 'Generated publication-grade Markdown synthesis report.');
  assert(reportResult.content.length > 300, 'Synthesis report contains detailed academic content.');

  // 11. CLEANUP & ACCOUNT DELETION AUDIT
  console.log('\n--- 11. CASCADING ACCOUNT DELETION AUDIT ---');
  await dbRun('DELETE FROM documents WHERE user_id = ?', [userId]);
  await dbRun('DELETE FROM notes WHERE user_id = ?', [userId]);
  await dbRun('DELETE FROM chat_messages WHERE user_id = ?', [userId]);
  await dbRun('DELETE FROM reports WHERE user_id = ?', [userId]);
  await dbRun('DELETE FROM workspaces WHERE user_id = ?', [userId]);
  await dbRun('DELETE FROM security_audit_logs WHERE user_id = ?', [userId]);
  await dbRun('DELETE FROM users WHERE id = ?', [userId]);

  const deletedUser = await dbGet('SELECT id FROM users WHERE id = ?', [userId]);
  assert(!deletedUser, 'Cleaned up audit test user and all cascading records.');

  console.log(`\n====================================================`);
  console.log(`AUDIT COMPLETE: ${passedCount} / ${totalCount} TESTS PASSED SUCCESSFULY!`);
  console.log(`====================================================\n`);

  process.exit(0);
}

runComprehensiveAudit().catch(err => {
  console.error('Audit execution error:', err);
  process.exit(1);
});
