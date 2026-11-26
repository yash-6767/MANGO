/*
# Create MANGOS workspace state

1. New Tables
- `mangos_workspace_state`
- `id` (uuid, primary key): unique state row identifier.
- `learner_key` (text): anonymous learning-lab identifier used before sign-in exists.
- `state` (jsonb): saved bookmarks, solved questions, profile preferences, and activity state.
- `updated_at` (timestamptz): last saved time.

2. Security
- Enable row level security on `mangos_workspace_state`.
- Grant CRUD access to the anonymous and authenticated app roles.
- Add separate policies for each CRUD operation because this first version has no sign-in and intentionally uses a shared learning-lab record.

3. Important Notes
- The state row is keyed by the existing demo learner key and is safe to upsert repeatedly.
- This supports a complete first-version workflow without introducing an incomplete authentication experience.
*/

CREATE TABLE IF NOT EXISTS public.mangos_workspace_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_key text NOT NULL UNIQUE,
  state jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.mangos_workspace_state ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mangos_workspace_state TO anon, authenticated;

DROP POLICY IF EXISTS "Public workspace state is readable" ON public.mangos_workspace_state;
CREATE POLICY "Public workspace state is readable"
  ON public.mangos_workspace_state FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Public workspace state is insertable" ON public.mangos_workspace_state;
CREATE POLICY "Public workspace state is insertable"
  ON public.mangos_workspace_state FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public workspace state is updatable" ON public.mangos_workspace_state;
CREATE POLICY "Public workspace state is updatable"
  ON public.mangos_workspace_state FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public workspace state is removable" ON public.mangos_workspace_state;
CREATE POLICY "Public workspace state is removable"
  ON public.mangos_workspace_state FOR DELETE
  TO anon, authenticated
  USING (true);
