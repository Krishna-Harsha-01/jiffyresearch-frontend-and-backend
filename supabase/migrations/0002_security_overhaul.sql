-- Complete Supabase PostgreSQL Schema & Security Provisioning Script

-- 1. Users / Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'researcher',
  is_verified BOOLEAN DEFAULT TRUE,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMPTZ,
  token_version INTEGER DEFAULT 1,
  mfa_enabled BOOLEAN DEFAULT FALSE,
  mfa_secret TEXT,
  mfa_backup_codes JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Public Users Alias Table
CREATE TABLE IF NOT EXISTS public.users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  role TEXT DEFAULT 'researcher',
  is_verified BOOLEAN DEFAULT TRUE,
  verification_token TEXT,
  verification_expires TIMESTAMPTZ,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMPTZ,
  token_version INTEGER DEFAULT 1,
  mfa_enabled BOOLEAN DEFAULT FALSE,
  mfa_secret TEXT,
  mfa_backup_codes JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Workspaces Table
CREATE TABLE IF NOT EXISTS public.workspaces (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  name TEXT NOT NULL,
  description TEXT,
  domain TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Documents Table
CREATE TABLE IF NOT EXISTS public.documents (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER,
  user_id INTEGER,
  title TEXT NOT NULL,
  filename TEXT,
  filepath TEXT,
  file_type TEXT,
  file_size BIGINT,
  content TEXT,
  summary TEXT,
  key_insights JSONB,
  entities JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Notes Table
CREATE TABLE IF NOT EXISTS public.notes (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER,
  user_id INTEGER,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Chat Messages Table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER,
  user_id INTEGER,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'ai')),
  message TEXT NOT NULL,
  citations JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER,
  user_id INTEGER,
  title TEXT NOT NULL,
  report_type TEXT NOT NULL,
  content TEXT NOT NULL,
  sources JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Password Resets Table
CREATE TABLE IF NOT EXISTS public.password_resets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Security Audit Logs Table
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  email TEXT,
  event_type TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  status TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. CAPTCHA Challenges Table
CREATE TABLE IF NOT EXISTS public.captcha_challenges (
  id SERIAL PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,
  answer TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);

-- Enable Row Level Security (RLS) & Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_resets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.captcha_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public full access on profiles" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Allow public full access on users" ON public.users FOR ALL USING (true);
CREATE POLICY "Allow public full access on workspaces" ON public.workspaces FOR ALL USING (true);
CREATE POLICY "Allow public full access on documents" ON public.documents FOR ALL USING (true);
CREATE POLICY "Allow public full access on notes" ON public.notes FOR ALL USING (true);
CREATE POLICY "Allow public full access on chat_messages" ON public.chat_messages FOR ALL USING (true);
CREATE POLICY "Allow public full access on reports" ON public.reports FOR ALL USING (true);
CREATE POLICY "Allow public full access on password_resets" ON public.password_resets FOR ALL USING (true);
CREATE POLICY "Allow public full access on security_audit_logs" ON public.security_audit_logs FOR ALL USING (true);
CREATE POLICY "Allow public full access on captcha_challenges" ON public.captcha_challenges FOR ALL USING (true);
