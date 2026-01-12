-- Create storage bucket for defect images
INSERT INTO storage.buckets (id, name, public) VALUES ('defect-images', 'defect-images', true);

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload defect images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'defect-images');

-- Allow public read access to defect images
CREATE POLICY "Public can view defect images"
ON storage.objects FOR SELECT
USING (bucket_id = 'defect-images');