require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function migrateSupabase() {
  console.log('🚀 Connecting to Supabase PostgreSQL database...');

  const connectionString = process.env.DATABASE_URL || `postgres://postgres:${process.env.SUPABASE_DB_PASSWORD}@db.nzoltlfqcahvnxmayiot.supabase.co:5432/postgres`;

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to Supabase PostgreSQL database successfully.');

    // 1. Read Migration Files
    const initSqlPath = path.join(__dirname, '../../../supabase/migrations/0001_init.sql');
    const securitySqlPath = path.join(__dirname, '../../../supabase/migrations/0002_security_overhaul.sql');

    if (fs.existsSync(initSqlPath)) {
      console.log('Executing 0001_init.sql...');
      const initSql = fs.readFileSync(initSqlPath, 'utf8');
      await client.query(initSql);
      console.log('✅ 0001_init.sql applied.');
    }

    if (fs.existsSync(securitySqlPath)) {
      console.log('Executing 0002_security_overhaul.sql...');
      const securitySql = fs.readFileSync(securitySqlPath, 'utf8');
      await client.query(securitySql);
      console.log('✅ 0002_security_overhaul.sql applied.');
    }

    console.log('\n🎉 ALL SUPABASE DATABASE TABLES AND SCHEMAS ARE PROVISIONED AND READY!');
  } catch (err) {
    console.error('❌ Supabase PostgreSQL Migration Error:', err.message);
  } finally {
    await client.end();
    process.exit(0);
  }
}

migrateSupabase();
