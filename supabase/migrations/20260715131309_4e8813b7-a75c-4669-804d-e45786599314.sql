ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS username text;
ALTER TABLE public.teachers ALTER COLUMN email DROP NOT NULL;
ALTER TABLE public.teachers ALTER COLUMN phone DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS teachers_username_key
  ON public.teachers (lower(username))
  WHERE username IS NOT NULL;

INSERT INTO public.admin_users (username, password_hash, admin_role, display_name)
VALUES
  ('apsk@kiran', public.hash_password('Apsk@1122'), 'super',   'Principal Kiran'),
  ('apsk@admin', public.hash_password('Apsk@1122'), 'officer', 'Admin Officer')
ON CONFLICT (username) DO UPDATE
  SET password_hash = EXCLUDED.password_hash,
      admin_role    = EXCLUDED.admin_role,
      display_name  = EXCLUDED.display_name;