-- Migration: 20261126170000_resource_admin_and_hardening.sql
-- Description: Enforces Role-Based Access Control (RBAC) on public.learning_resources and prevents privilege escalation

-- 1. ADD ROLE COLUMN TO PROFILES IF NOT EXISTS
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'role'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'mentor', 'admin'));
  END IF;
END $$;

-- 2. CREATE SECURE IS_ADMIN HELPER FUNCTION
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role = 'admin' FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;

-- 3. PREVENT PRIVILEGE ESCALATION ON PROFILES
-- Regular users must never be able to update their own role column to 'admin'
CREATE OR REPLACE FUNCTION public.check_profile_role_update()
RETURNS trigger AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT public.is_admin() THEN
      RAISE EXCEPTION 'Unauthorized: only administrators can alter account roles';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_check_profile_role_update ON public.profiles;
CREATE TRIGGER trg_check_profile_role_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_profile_role_update();

-- 4. HARDEN LEARNING_RESOURCES TABLE RLS POLICIES
ALTER TABLE public.learning_resources ENABLE ROW LEVEL SECURITY;

-- Drop legacy permissive policies
DROP POLICY IF EXISTS "Authenticated users can insert resources" ON public.learning_resources;
DROP POLICY IF EXISTS "Anyone can view active learning resources" ON public.learning_resources;
DROP POLICY IF EXISTS "Public can view learning resources" ON public.learning_resources;
DROP POLICY IF EXISTS "Admins can insert learning resources" ON public.learning_resources;
DROP POLICY IF EXISTS "Admins can update learning resources" ON public.learning_resources;
DROP POLICY IF EXISTS "Admins can delete learning resources" ON public.learning_resources;

-- Public / Authenticated read access
CREATE POLICY "Public can view learning resources"
  ON public.learning_resources FOR SELECT
  USING (true);

-- Admin-only INSERT
CREATE POLICY "Admins can insert learning resources"
  ON public.learning_resources FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Admin-only UPDATE
CREATE POLICY "Admins can update learning resources"
  ON public.learning_resources FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admin-only DELETE
CREATE POLICY "Admins can delete learning resources"
  ON public.learning_resources FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 5. GRANTS AUDIT
REVOKE ALL ON public.learning_resources FROM anon;
REVOKE ALL ON public.learning_resources FROM authenticated;

GRANT SELECT ON public.learning_resources TO anon;
GRANT SELECT ON public.learning_resources TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.learning_resources TO authenticated;
-- Note: authenticated role has INSERT/UPDATE/DELETE grants, but RLS strictly limits execution to public.is_admin() = true.
