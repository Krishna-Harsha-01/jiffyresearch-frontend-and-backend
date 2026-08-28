-- NexusResearch AI Database Schema for Supabase PostgreSQL

-- 1. Users / Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Workspaces
CREATE TABLE IF NOT EXISTS public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  domain TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Documents
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
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

-- 4. Notes
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Chat Messages
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'ai')),
  message TEXT NOT NULL,
  citations JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Reports
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  report_type TEXT NOT NULL,
  content TEXT NOT NULL,
  sources JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Setup RLS Policies (Allow full access for authenticated service role / backend API)
CREATE POLICY "Allow public full access on profiles" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Allow public full access on workspaces" ON public.workspaces FOR ALL USING (true);
CREATE POLICY "Allow public full access on documents" ON public.documents FOR ALL USING (true);
CREATE POLICY "Allow public full access on notes" ON public.notes FOR ALL USING (true);
CREATE POLICY "Allow public full access on chat_messages" ON public.chat_messages FOR ALL USING (true);
CREATE POLICY "Allow public full access on reports" ON public.reports FOR ALL USING (true);
