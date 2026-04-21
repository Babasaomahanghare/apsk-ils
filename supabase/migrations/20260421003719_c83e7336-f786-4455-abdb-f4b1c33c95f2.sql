
-- Extension for bcrypt
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Password helper functions
CREATE OR REPLACE FUNCTION public.hash_password(_password text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  RETURN crypt(_password, gen_salt('bf', 10));
END;
$$;

CREATE OR REPLACE FUNCTION public.verify_password(_password text, _hash text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  RETURN _hash = crypt(_password, _hash);
END;
$$;

-- Students
CREATE TABLE public.students (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  student_class text NOT NULL,
  section text NOT NULL,
  admission text NOT NULL UNIQUE,
  phone text NOT NULL,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "students_all" ON public.students FOR ALL USING (true) WITH CHECK (true);

-- Teachers
CREATE TABLE public.teachers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "teachers_all" ON public.teachers FOR ALL USING (true) WITH CHECK (true);

-- Ticket counter
CREATE TABLE public.ticket_counter (
  year int NOT NULL PRIMARY KEY,
  seq int NOT NULL DEFAULT 0
);
ALTER TABLE public.ticket_counter ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ticket_counter_all" ON public.ticket_counter FOR ALL USING (true) WITH CHECK (true);

-- Atomic ticket id generator
CREATE OR REPLACE FUNCTION public.next_ticket_id()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _year int := EXTRACT(YEAR FROM now())::int;
  _seq int;
BEGIN
  INSERT INTO public.ticket_counter (year, seq)
  VALUES (_year, 1)
  ON CONFLICT (year) DO UPDATE SET seq = ticket_counter.seq + 1
  RETURNING seq INTO _seq;
  RETURN 'TKT-APS-' || _year || '-' || lpad(_seq::text, 4, '0');
END;
$$;

-- Complaints
CREATE TABLE public.complaints (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id text NOT NULL UNIQUE,
  author_id text NOT NULL,
  author_name text NOT NULL,
  author_role text NOT NULL CHECK (author_role IN ('student','teacher')),
  description text NOT NULL,
  urgency text NOT NULL CHECK (urgency IN ('low','medium','high')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','resolved','rejected')),
  category text,
  subtopic text,
  response text,
  deadline timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "complaints_all" ON public.complaints FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX idx_complaints_author ON public.complaints(author_id);
CREATE INDEX idx_complaints_status ON public.complaints(status);
CREATE INDEX idx_complaints_created ON public.complaints(created_at DESC);

-- Feedback
CREATE TABLE public.feedback (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id text NOT NULL,
  author_name text NOT NULL,
  text text NOT NULL,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "feedback_all" ON public.feedback FOR ALL USING (true) WITH CHECK (true);

-- Notifications
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications_all" ON public.notifications FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX idx_notifications_user ON public.notifications(user_id, created_at DESC);

-- Updated_at trigger for complaints
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER complaints_touch_updated_at
BEFORE UPDATE ON public.complaints
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Realtime
ALTER TABLE public.complaints REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.feedback REPLICA IDENTITY FULL;
ALTER TABLE public.students REPLICA IDENTITY FULL;
ALTER TABLE public.teachers REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.complaints;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.feedback;
ALTER PUBLICATION supabase_realtime ADD TABLE public.students;
ALTER PUBLICATION supabase_realtime ADD TABLE public.teachers;

-- Seed counter for current year
INSERT INTO public.ticket_counter(year, seq)
VALUES (EXTRACT(YEAR FROM now())::int, 0)
ON CONFLICT DO NOTHING;
