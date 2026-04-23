
CREATE TABLE IF NOT EXISTS public.approved_teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  added_at timestamptz NOT NULL DEFAULT now()
);

-- Normalise emails to lowercase for safe lookups.
CREATE OR REPLACE FUNCTION public.lower_approved_email()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.email := lower(trim(NEW.email));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS approved_teachers_lower_email ON public.approved_teachers;
CREATE TRIGGER approved_teachers_lower_email
BEFORE INSERT OR UPDATE ON public.approved_teachers
FOR EACH ROW EXECUTE FUNCTION public.lower_approved_email();

ALTER TABLE public.approved_teachers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS approved_teachers_all ON public.approved_teachers;
CREATE POLICY approved_teachers_all ON public.approved_teachers
FOR ALL USING (true) WITH CHECK (true);
