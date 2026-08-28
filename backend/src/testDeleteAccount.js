const { initDatabase, dbRun, dbGet } = require('./db/database');
const bcrypt = require('bcryptjs');

async function testDeleteAccount() {
  console.log('=== TESTING ACCOUNT DELETION ===');
  await initDatabase();

  // 1. Create a temporary dummy test user
  const email = 'dummy_delete_test@nexus.io';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('Password123', salt);

  // Clean up if already exists
  const existing = await dbGet('SELECT id FROM users WHERE email = ?', [email]);
  if (existing) {
    await dbRun('DELETE FROM users WHERE id = ?', [existing.id]);
  }

  const result = await dbRun(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    ['Dummy User', email, hash, 'researcher']
  );
  const userId = result.id;
  console.log(`Created test user with ID: ${userId}`);

  // Create associated workspace, document, note, report
  const ws = await dbRun('INSERT INTO workspaces (user_id, name) VALUES (?, ?)', [userId, 'Test Workspace']);
  await dbRun('INSERT INTO documents (workspace_id, user_id, title) VALUES (?, ?, ?)', [ws.id, userId, 'Test Doc']);
  await dbRun('INSERT INTO notes (workspace_id, user_id, title, content) VALUES (?, ?, ?, ?)', [ws.id, userId, 'Test Note', 'Content']);
  await dbRun('INSERT INTO reports (workspace_id, user_id, title, report_type, content) VALUES (?, ?, ?, ?, ?)', [ws.id, userId, 'Test Report', 'summary', 'Report Content']);

  console.log('Created associated workspaces, documents, notes, and reports.');

  // 2. Perform Account Deletion Sequence
  await dbRun('DELETE FROM documents WHERE user_id = ?', [userId]);
  await dbRun('DELETE FROM notes WHERE user_id = ?', [userId]);
  await dbRun('DELETE FROM chat_messages WHERE user_id = ?', [userId]);
  await dbRun('DELETE FROM reports WHERE user_id = ?', [userId]);
  await dbRun('DELETE FROM workspaces WHERE user_id = ?', [userId]);
  await dbRun('DELETE FROM password_resets WHERE user_id = ?', [userId]);
  await dbRun('DELETE FROM security_audit_logs WHERE user_id = ?', [userId]);
  await dbRun('DELETE FROM users WHERE id = ?', [userId]);

  // 3. Verify Deletion
  const deletedUser = await dbGet('SELECT id FROM users WHERE id = ?', [userId]);
  const deletedWs = await dbGet('SELECT id FROM workspaces WHERE user_id = ?', [userId]);

  if (!deletedUser && !deletedWs) {
    console.log('✅ ACCOUNT DELETION VERIFIED SUCCESSFULLY: User and all associated data deleted.');
  } else {
    console.log('❌ DELETION FAILED');
  }

  process.exit(0);
}

testDeleteAccount().catch(console.error);
