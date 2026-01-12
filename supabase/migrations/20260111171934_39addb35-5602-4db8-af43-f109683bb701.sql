-- Make the defect-images bucket private
UPDATE storage.buckets SET public = false WHERE id = 'defect-images';

-- Drop the public SELECT policy
DROP POLICY IF EXISTS "Public can view defect images" ON storage.objects;

-- Create authenticated-only policy for reading images
CREATE POLICY "Authenticated users can view defect images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'defect-images');

-- Keep existing upload policy for final inspectors (if exists, recreate to ensure it's correct)
DROP POLICY IF EXISTS "Final inspectors can upload images" ON storage.objects;
CREATE POLICY "Final inspectors can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'defect-images');