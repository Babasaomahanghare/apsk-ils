-- Add attachments column to complaints
ALTER TABLE public.complaints
  ADD COLUMN IF NOT EXISTS attachments text[] NOT NULL DEFAULT '{}';

-- Create storage bucket for complaint photos (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('complaint-photos', 'complaint-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: public read + open insert (matches current app model)
DROP POLICY IF EXISTS "complaint_photos_read" ON storage.objects;
CREATE POLICY "complaint_photos_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'complaint-photos');

DROP POLICY IF EXISTS "complaint_photos_insert" ON storage.objects;
CREATE POLICY "complaint_photos_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'complaint-photos');

DROP POLICY IF EXISTS "complaint_photos_update" ON storage.objects;
CREATE POLICY "complaint_photos_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'complaint-photos');

DROP POLICY IF EXISTS "complaint_photos_delete" ON storage.objects;
CREATE POLICY "complaint_photos_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'complaint-photos');