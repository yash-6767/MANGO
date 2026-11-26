/*
# Secure MANGOS Database Schema & Normalize Architecture
# Migration: 20261126160000_secure_and_normalize_schema.sql

1. Security Hardening on Legacy Tables:
   - Revoke public unrestricted access policies on mangos_progress and mangos_workspace_state
   - Replace with safe user-isolated or authenticated policies

2. New Normalized Relational Tables:
   - profiles: User profile, target role, university, preferences linked to auth.users
   - user_progress: Milestones completed per user
   - dsa_progress: Problem status (Solved, Attempted, Not started) and notes per user
   - user_bookmarks: Unique bookmarks for questions and learning resources
   - learning_resources: Centralized curated resource catalog with full metadata
   - user_activity: Daily practice time, problem counts, streak tracking

3. Strict Row-Level Security (RLS):
   - All personal tables enforce auth.uid() = user_id
   - Public read access for learning_resources catalog
   - Authenticated write access for approved resources
*/

-- ============================================================================
-- 1. HARDEN LEGACY POLICIES
-- ============================================================================

-- Drop overly permissive policies on mangos_workspace_state
DROP POLICY IF EXISTS "Public workspace state is readable" ON public.mangos_workspace_state;
DROP POLICY IF EXISTS "Public workspace state is insertable" ON public.mangos_workspace_state;
DROP POLICY IF EXISTS "Public workspace state is updatable" ON public.mangos_workspace_state;
DROP POLICY IF EXISTS "Public workspace state is removable" ON public.mangos_workspace_state;

-- Replace with authenticated user-bound policy on mangos_workspace_state
CREATE POLICY "Users can read own workspace state"
  ON public.mangos_workspace_state FOR SELECT
  TO authenticated
  USING (learner_key = auth.uid()::text);

CREATE POLICY "Users can insert own workspace state"
  ON public.mangos_workspace_state FOR INSERT
  TO authenticated
  WITH CHECK (learner_key = auth.uid()::text);

CREATE POLICY "Users can update own workspace state"
  ON public.mangos_workspace_state FOR UPDATE
  TO authenticated
  USING (learner_key = auth.uid()::text)
  WITH CHECK (learner_key = auth.uid()::text);

CREATE POLICY "Users can delete own workspace state"
  ON public.mangos_workspace_state FOR DELETE
  TO authenticated
  USING (learner_key = auth.uid()::text);

-- Drop overly permissive policies on mangos_progress
DROP POLICY IF EXISTS "Public learning lab progress is readable" ON public.mangos_progress;
DROP POLICY IF EXISTS "Public learning lab progress is writable" ON public.mangos_progress;
DROP POLICY IF EXISTS "Public learning lab progress is updatable" ON public.mangos_progress;
DROP POLICY IF EXISTS "Public learning lab progress is removable" ON public.mangos_progress;

-- Replace with authenticated user-bound policy on mangos_progress
CREATE POLICY "Users can read own progress"
  ON public.mangos_progress FOR SELECT
  TO authenticated
  USING (learner_key = auth.uid()::text);

CREATE POLICY "Users can insert own progress"
  ON public.mangos_progress FOR INSERT
  TO authenticated
  WITH CHECK (learner_key = auth.uid()::text);

CREATE POLICY "Users can update own progress"
  ON public.mangos_progress FOR UPDATE
  TO authenticated
  USING (learner_key = auth.uid()::text)
  WITH CHECK (learner_key = auth.uid()::text);

CREATE POLICY "Users can delete own progress"
  ON public.mangos_progress FOR DELETE
  TO authenticated
  USING (learner_key = auth.uid()::text);

-- ============================================================================
-- 2. CREATE NORMALIZED TABLES
-- ============================================================================

-- Table: profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  university text,
  target_role text DEFAULT 'Software Engineer',
  target_company text DEFAULT 'Meta',
  preferred_language text DEFAULT 'Python',
  experience_level text DEFAULT 'Beginner / Student',
  preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Table: user_progress (Milestones)
CREATE TABLE IF NOT EXISTS public.user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_id text NOT NULL,
  completed boolean NOT NULL DEFAULT true,
  completed_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_progress_unique_milestone UNIQUE (user_id, milestone_id)
);

CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own milestone progress"
  ON public.user_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own milestone progress"
  ON public.user_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own milestone progress"
  ON public.user_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own milestone progress"
  ON public.user_progress FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Table: dsa_progress
CREATE TABLE IF NOT EXISTS public.dsa_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id integer NOT NULL,
  status text NOT NULL CHECK (status IN ('Solved', 'Attempted', 'Not started')) DEFAULT 'Not started',
  notes text,
  last_attempted_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT dsa_progress_unique_user_question UNIQUE (user_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_dsa_progress_user_id ON public.dsa_progress(user_id);
ALTER TABLE public.dsa_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own DSA progress"
  ON public.dsa_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own DSA progress"
  ON public.dsa_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own DSA progress"
  ON public.dsa_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own DSA progress"
  ON public.dsa_progress FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Table: user_bookmarks
CREATE TABLE IF NOT EXISTS public.user_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id text NOT NULL,
  item_type text NOT NULL CHECK (item_type IN ('question', 'resource')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_bookmarks_unique_item UNIQUE (user_id, item_id, item_type)
);

CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user_id ON public.user_bookmarks(user_id);
ALTER TABLE public.user_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own bookmarks"
  ON public.user_bookmarks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks"
  ON public.user_bookmarks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks"
  ON public.user_bookmarks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Table: learning_resources
CREATE TABLE IF NOT EXISTS public.learning_resources (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  official_url text NOT NULL,
  provider text NOT NULL,
  category text NOT NULL,
  tags text[] DEFAULT '{}',
  difficulty text NOT NULL DEFAULT 'All Levels',
  free_status text NOT NULL DEFAULT '100% Free',
  paid_features text,
  date_added text NOT NULL,
  last_verified text NOT NULL,
  status text NOT NULL CHECK (status IN ('Active', 'Under Review', 'Broken', 'Archived')) DEFAULT 'Active',
  learning_path text,
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_learning_resources_category ON public.learning_resources(category);
CREATE INDEX IF NOT EXISTS idx_learning_resources_status ON public.learning_resources(status);
ALTER TABLE public.learning_resources ENABLE ROW LEVEL SECURITY;

-- Public read access for resources
CREATE POLICY "Public can read learning resources"
  ON public.learning_resources FOR SELECT
  TO anon, authenticated
  USING (true);

-- Authenticated write access for learning resources
CREATE POLICY "Authenticated users can add learning resources"
  ON public.learning_resources FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update learning resources"
  ON public.learning_resources FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Table: user_activity
CREATE TABLE IF NOT EXISTS public.user_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_date date NOT NULL DEFAULT current_date,
  study_minutes integer NOT NULL DEFAULT 0,
  problems_solved integer NOT NULL DEFAULT 0,
  streak integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_activity_unique_date UNIQUE (user_id, activity_date)
);

CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON public.user_activity(user_id);
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own activity"
  ON public.user_activity FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity"
  ON public.user_activity FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activity"
  ON public.user_activity FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 3. AUTOMATIC PROFILE CREATION TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, target_role, target_company)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'target_role', 'Software Engineer'),
    COALESCE(NEW.raw_user_meta_data->>'target_company', 'Meta')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
