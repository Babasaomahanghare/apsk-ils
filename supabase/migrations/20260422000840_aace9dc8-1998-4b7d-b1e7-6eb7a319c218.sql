-- Comments thread for complaints
CREATE TABLE public.complaint_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_complaint_comments_complaint_id ON public.complaint_comments(complaint_id);
CREATE INDEX idx_complaint_comments_created_at ON public.complaint_comments(created_at);

ALTER TABLE public.complaint_comments ENABLE ROW LEVEL SECURITY;

-- App uses custom DB-stored auth (not Supabase Auth), matching existing tables
CREATE POLICY "complaint_comments_all" ON public.complaint_comments
  FOR ALL USING (true) WITH CHECK (true);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.complaint_comments;