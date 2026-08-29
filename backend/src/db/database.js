const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
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
    await addColumnIfMissing('users', 'auth_provider', "TEXT DEFAULT 'google'");
    await addColumnIfMissing('users', 'google_id', 'TEXT');
    await addColumnIfMissing('users', 'avatar_url', 'TEXT');
    await addColumnIfMissing('users', 'is_session_active', 'INTEGER DEFAULT 0');
    await addColumnIfMissing('users', 'active_session_id', 'TEXT');
    await addColumnIfMissing('users', 'last_active_at', 'DATETIME');

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
        session_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (workspace_id) REFERENCES workspaces (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    try {
      await dbRun('ALTER TABLE chat_messages ADD COLUMN session_id TEXT');
    } catch (e) {
      // Column may already exist
    }

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

    // Ensure Sole Admin Account (jiffyresearchnxt@gmail.com / Jiffy123)
    const adminEmail = 'jiffyresearchnxt@gmail.com';
    const adminUser = await dbGet('SELECT id, email, password_hash, role FROM users WHERE LOWER(email) = LOWER(?)', [adminEmail]);
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash('Jiffy123', salt);

    if (!adminUser) {
      const adminInsert = await dbRun(
        `INSERT INTO users (name, email, password_hash, role, is_verified, created_at)
         VALUES (?, ?, ?, 'admin', 1, CURRENT_TIMESTAMP)`,
        ['Jiffy Admin', adminEmail, adminPasswordHash]
      );
      // Create default workspace for Admin
      await dbRun(
        'INSERT INTO workspaces (user_id, name, description, domain) VALUES (?, ?, ?, ?)',
        [adminInsert.id, 'Jiffy Admin Workspace', 'Primary AI Research Administration Console', 'System Administration']
      );
      console.log('👑 Single Admin account (jiffyresearchnxt@gmail.com) created.');
    } else {
      // Ensure admin has role 'admin', is_verified = 1, and password hash updated to Jiffy123
      await dbRun(
        `UPDATE users SET role = 'admin', is_verified = 1, password_hash = ? WHERE LOWER(email) = LOWER(?)`,
        [adminPasswordHash, adminEmail]
      );
    }

    // Demote any other user with 'admin' role to 'researcher' (strict single-admin rule)
    await dbRun(
      `UPDATE users SET role = 'researcher' WHERE LOWER(email) != LOWER(?) AND role = 'admin'`,
      [adminEmail]
    );

    // Clear any past account lockouts
    await dbRun('UPDATE users SET failed_login_attempts = 0, locked_until = NULL');

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
