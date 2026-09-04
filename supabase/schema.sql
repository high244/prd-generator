-- =================================================================================
-- PRD ARCHITECT STUDIO — SUPABASE DATABASE SCHEMA v2.0
-- Kepatuhan: Supabase Postgres Best Practices & Row Level Security (RLS)
-- =================================================================================

-- 1. TABEL PROFIL PENGGUNA (user_profiles)
-- Menyimpan metadata lengkap akun, role (admin/member), dan plan (pro/free)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  username TEXT UNIQUE,
  phone TEXT,
  organization TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('pro', 'free')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Indeks performa untuk lookup cepat
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON public.user_profiles (username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles (role);

-- Aktifkan Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Kebijakan RLS user_profiles
CREATE POLICY "Pengguna dapat membaca profil mereka sendiri"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING ( (SELECT auth.uid()) = id );

CREATE POLICY "Pengguna dapat memperbarui profil mereka sendiri"
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING ( (SELECT auth.uid()) = id )
  WITH CHECK ( (SELECT auth.uid()) = id );

CREATE POLICY "Admin dapat melihat seluruh profil pengguna"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = (SELECT auth.uid()) AND role = 'admin'
    )
  );

-- 2. TABEL DOKUMEN PRD & PROYEK (prd_projects)
-- Menyimpan riwayat proyek yang terisolasi aman per pengguna (userId)
CREATE TABLE IF NOT EXISTS public.prd_projects (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nama TEXT NOT NULL,
  ide TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  target TEXT,
  stack TEXT,
  timeline TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  markdown TEXT NOT NULL,
  model TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'gemini',
  chat_history JSONB DEFAULT '[]'::jsonb,
  chat_mode TEXT DEFAULT 'discovery',
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Indeks performa untuk isolasi riwayat per user_id
CREATE INDEX IF NOT EXISTS idx_prd_projects_user_id ON public.prd_projects (user_id);
CREATE INDEX IF NOT EXISTS idx_prd_projects_created_at ON public.prd_projects (created_at DESC);

-- Aktifkan Row Level Security (RLS)
ALTER TABLE public.prd_projects ENABLE ROW LEVEL SECURITY;

-- Kebijakan RLS prd_projects
CREATE POLICY "Pengguna hanya dapat melihat proyek mereka sendiri"
  ON public.prd_projects
  FOR SELECT
  TO authenticated
  USING ( (SELECT auth.uid()) = user_id );

CREATE POLICY "Pengguna dapat membuat proyek baru untuk akun mereka"
  ON public.prd_projects
  FOR INSERT
  TO authenticated
  WITH CHECK ( (SELECT auth.uid()) = user_id );

CREATE POLICY "Pengguna dapat memperbarui proyek milik mereka"
  ON public.prd_projects
  FOR UPDATE
  TO authenticated
  USING ( (SELECT auth.uid()) = user_id )
  WITH CHECK ( (SELECT auth.uid()) = user_id );

CREATE POLICY "Pengguna dapat menghapus proyek milik mereka"
  ON public.prd_projects
  FOR DELETE
  TO authenticated
  USING ( (SELECT auth.uid()) = user_id );

-- 3. TRIGGER OTOMATIS SAAT USER BARU DAFTAR (handle_new_user)
-- Menyinkronkan pendaftaran dari auth.users langsung ke public.user_profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, name, username, phone, organization, role, plan)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', SPLIT_PART(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'username', SPLIT_PART(new.email, '@', 1)),
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'organization',
    COALESCE(new.raw_user_meta_data->>'role', 'member'),
    COALESCE(new.raw_user_meta_data->>'plan', 'free')
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, user_profiles.name),
    username = COALESCE(EXCLUDED.username, user_profiles.username),
    role = COALESCE(EXCLUDED.role, user_profiles.role),
    plan = COALESCE(EXCLUDED.plan, user_profiles.plan),
    updated_at = NOW();

  RETURN NEW;
END;
$$;

-- Pasang trigger pada auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. INSERT DATA PROFIL UNTUK AKUN YANG SUDAH DIBUAT (Admin & Member)
INSERT INTO public.user_profiles (id, email, name, username, role, plan)
VALUES 
  ('5288bcdc-e821-4276-bcef-9413d1d4261b', 'admin@prdarchitect.com', 'Jonathan (Admin)', 'admin', 'admin', 'pro'),
  ('f5e174aa-3d50-4446-8890-b63420cb06e0', 'member@prdarchitect.com', 'User Member', 'member', 'member', 'free')
ON CONFLICT (id) DO UPDATE
SET 
  role = EXCLUDED.role,
  plan = EXCLUDED.plan,
  name = EXCLUDED.name;
