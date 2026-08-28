const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Environment check for Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('⚡ Supabase Client initialized successfully with URL:', supabaseUrl);
}

const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'nexus_research.db');
const db = new sqlite3.Database(dbPath);

// Helper for promise-based queries
const dbQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Safe migration helper to add missing columns if table already exists
const addColumnIfMissing = async (tableName, columnName, columnDef) => {
  try {
    const columns = await dbQuery(`PRAGMA table_info(${tableName})`);
    const exists = columns.some(c => c.name === columnName);
    if (!exists) {
      await dbRun(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDef}`);
      console.log(`Added column ${columnName} to ${tableName}`);
    }
  } catch (err) {
    console.error(`Error checking/adding column ${columnName} to ${tableName}:`, err.message);
  }
};

const initDatabase = async () => {
  try {
    // Users table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'researcher',
        is_verified INTEGER DEFAULT 0,
        verification_token TEXT,
        verification_expires DATETIME,
        failed_login_attempts INTEGER DEFAULT 0,
        locked_until DATETIME,
        token_version INTEGER DEFAULT 1,
        mfa_enabled INTEGER DEFAULT 0,
        mfa_secret TEXT,
        mfa_backup_codes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Migrations for existing user table schemas
    await addColumnIfMissing('users', 'role', "TEXT DEFAULT 'researcher'");
    await addColumnIfMissing('users', 'is_verified', 'INTEGER DEFAULT 0');
    await addColumnIfMissing('users', 'verification_token', 'TEXT');
    await addColumnIfMissing('users', 'verification_expires', 'DATETIME');
    await addColumnIfMissing('users', 'failed_login_attempts', 'INTEGER DEFAULT 0');
    await addColumnIfMissing('users', 'locked_until', 'DATETIME');
    await addColumnIfMissing('users', 'token_version', 'INTEGER DEFAULT 1');
    await addColumnIfMissing('users', 'mfa_enabled', 'INTEGER DEFAULT 0');
    await addColumnIfMissing('users', 'mfa_secret', 'TEXT');
    await addColumnIfMissing('users', 'mfa_backup_codes', 'TEXT');

    // Password resets table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token_hash TEXT NOT NULL,
        expires_at DATETIME NOT NULL,
        used_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // Security audit logs table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS security_audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        email TEXT,
        event_type TEXT NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        status TEXT NOT NULL,
        details TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // CAPTCHA challenges table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS captcha_challenges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        token TEXT UNIQUE NOT NULL,
        answer TEXT NOT NULL,
        expires_at DATETIME NOT NULL
      )
    `);

    // Workspaces table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS workspaces (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        domain TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // Documents table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workspace_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        filename TEXT,
        filepath TEXT,
        file_type TEXT,
        file_size INTEGER,
        content TEXT,
        summary TEXT,
        key_insights TEXT,
        entities TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (workspace_id) REFERENCES workspaces (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // Notes table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workspace_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        tags TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (workspace_id) REFERENCES workspaces (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // Chat messages table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workspace_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        sender TEXT NOT NULL,
        message TEXT NOT NULL,
        citations TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (workspace_id) REFERENCES workspaces (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // Reports table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workspace_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        report_type TEXT NOT NULL,
        content TEXT NOT NULL,
        sources TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (workspace_id) REFERENCES workspaces (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    console.log('✅ SQLite & Supabase Database layer initialized successfully.');
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
  }
};

module.exports = {
  db,
  dbQuery,
  dbRun,
  dbGet,
  supabase,
  initDatabase
};
