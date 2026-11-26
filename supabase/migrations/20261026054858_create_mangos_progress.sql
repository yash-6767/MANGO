/*
# Create MANGOS roadmap progress

1. New Tables
- `mangos_progress`
- `id` (uuid, primary key): unique progress record identifier.
- `learner_key` (text): anonymous learning-lab identifier used by the first version.
- `step_id` (text): roadmap step label completed by the learner.
- `completed_at` (timestamptz): time the step was completed.

2. Security
- Enable row level security on `mangos_progress`.
- Grant the anonymous and authenticated app roles only the CRUD operations used by the roadmap.
- Allow access to the intentionally shared first-version learning-lab progress records.

3. Important Notes
- This first version does not include sign-in, so progress is stored under the demo learning-lab key.
- The unique learner/step constraint keeps repeated clicks from creating duplicate progress records.
*/

CREATE TABLE IF NOT EXISTS public.mangos_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_key text NOT NULL,
  step_id text NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT mangos_progress_learner_step_key UNIQUE (learner_key, step_id)
);

ALTER TABLE public.mangos_progress ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mangos_progress TO anon, authenticated;

DROP POLICY IF EXISTS "Public learning lab progress is readable" ON public.mangos_progress;
CREATE POLICY "Public learning lab progress is readable"
  ON public.mangos_progress FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Public learning lab progress is writable" ON public.mangos_progress;
CREATE POLICY "Public learning lab progress is writable"
  ON public.mangos_progress FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public learning lab progress is updatable" ON public.mangos_progress;
CREATE POLICY "Public learning lab progress is updatable"
  ON public.mangos_progress FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public learning lab progress is removable" ON public.mangos_progress;
CREATE POLICY "Public learning lab progress is removable"
  ON public.mangos_progress FOR DELETE
  TO anon, authenticated
  USING (true);
