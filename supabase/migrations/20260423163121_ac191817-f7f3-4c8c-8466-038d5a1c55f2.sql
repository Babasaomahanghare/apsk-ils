-- =========================================================
-- 1. ADMIN USERS TABLE (3 role-based admin accounts)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  admin_role text NOT NULL CHECK (admin_role IN ('super', 'atl', 'officer')),
  display_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS admin_users_all ON public.admin_users;
CREATE POLICY admin_users_all ON public.admin_users FOR ALL USING (true) WITH CHECK (true);

-- Seed the 3 default accounts (idempotent)
INSERT INTO public.admin_users (username, password_hash, admin_role, display_name)
VALUES
  ('APSKADMINS',     public.hash_password('APSKADMINS19065'), 'super',   'Principal (Super Admin)'),
  ('ATLLABAPSK',     public.hash_password('ATLLABAPSK1122'),  'atl',     'ATL Lab'),
  ('ADMOFFICERAPSK', public.hash_password('ADAMOFFICER1122'), 'officer', 'Admin Officer')
ON CONFLICT (username) DO NOTHING;

-- =========================================================
-- 2. COMPLAINT ROUTING + SLA FIELDS
-- =========================================================
ALTER TABLE public.complaints
  ADD COLUMN IF NOT EXISTS assigned_to   text NOT NULL DEFAULT 'UNASSIGNED'
    CHECK (assigned_to IN ('ATL_LAB','ADMIN_OFFICER','UNASSIGNED')),
  ADD COLUMN IF NOT EXISTS handled_by    text,
  ADD COLUMN IF NOT EXISTS handled_role  text,
  ADD COLUMN IF NOT EXISTS resolved_at   timestamptz;

CREATE INDEX IF NOT EXISTS idx_complaints_assigned_to ON public.complaints (assigned_to);

-- =========================================================
-- 3. AUTO-ROUTING TRIGGER
-- =========================================================
CREATE OR REPLACE FUNCTION public.route_complaint()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  hay text;
BEGIN
  hay := lower(coalesce(NEW.category,'') || ' ' || coalesce(NEW.subtopic,'') || ' ' || coalesce(NEW.description,''));
  IF hay ~ '(projector|interactive panel|smart board|smartboard|computer|technical|atl)' THEN
    NEW.assigned_to := 'ATL_LAB';
  ELSIF hay ~ '(bench|chair|table|furniture|classroom|window|fan)' THEN
    NEW.assigned_to := 'ADMIN_OFFICER';
  ELSE
    NEW.assigned_to := COALESCE(NEW.assigned_to, 'UNASSIGNED');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS complaints_route_before_insert ON public.complaints;
CREATE TRIGGER complaints_route_before_insert
BEFORE INSERT ON public.complaints
FOR EACH ROW
EXECUTE FUNCTION public.route_complaint();

-- Backfill assigned_to for existing complaints using the same logic
UPDATE public.complaints
SET assigned_to = CASE
  WHEN lower(coalesce(category,'') || ' ' || coalesce(subtopic,'') || ' ' || coalesce(description,''))
       ~ '(projector|interactive panel|smart board|smartboard|computer|technical|atl)' THEN 'ATL_LAB'
  WHEN lower(coalesce(category,'') || ' ' || coalesce(subtopic,'') || ' ' || coalesce(description,''))
       ~ '(bench|chair|table|furniture|classroom|window|fan)' THEN 'ADMIN_OFFICER'
  ELSE 'UNASSIGNED'
END
WHERE assigned_to = 'UNASSIGNED';

-- =========================================================
-- 4. AUTO-STAMP resolved_at WHEN STATUS CLOSES
-- =========================================================
CREATE OR REPLACE FUNCTION public.stamp_resolved_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status IN ('resolved','rejected') AND OLD.status NOT IN ('resolved','rejected') THEN
    NEW.resolved_at := now();
  ELSIF NEW.status = 'pending' THEN
    NEW.resolved_at := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS complaints_stamp_resolved_at ON public.complaints;
CREATE TRIGGER complaints_stamp_resolved_at
BEFORE UPDATE ON public.complaints
FOR EACH ROW
EXECUTE FUNCTION public.stamp_resolved_at();

-- =========================================================
-- 5. ACTIVITY LOGS TABLE
-- =========================================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  user_name text NOT NULL,
  user_role text NOT NULL,
  action text NOT NULL,
  details text,
  complaint_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_role  ON public.activity_logs (user_role);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action     ON public.activity_logs (action);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS activity_logs_all ON public.activity_logs;
CREATE POLICY activity_logs_all ON public.activity_logs FOR ALL USING (true) WITH CHECK (true);
