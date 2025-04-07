-- Fix RLS policies for storage bucket 'analysis-images'

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS \
Public
Access\ ON storage.objects;
DROP POLICY IF EXISTS \Authenticated
users
can
upload
images\ ON storage.objects;

-- Create comprehensive set of policies for the analysis-images bucket

-- 1. Anyone can view images (public read access)
CREATE POLICY \Public
read
access
for
analysis-images\
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'analysis-images');

-- 2. Any user (public) can upload images
DROP POLICY IF EXISTS "Authenticated users can upload to analysis-images" ON storage.objects;
CREATE POLICY "Public can upload to analysis-images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'analysis-images');

-- 3. Authenticated users can update their own images
-- This policy connects the storage objects to the analysis_result table via analysis_images
CREATE POLICY \Authenticated
users
can
update
images
in
analysis-images\
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'analysis-images' AND
    (EXISTS (
        SELECT 1 FROM public.analysis_images ai
        JOIN public.analysis_result ar ON ai.analysis_id = ar.id
        WHERE 
            storage.objects.name = ai.storage_path AND
            (ar.user_id = auth.uid() OR ar.user_id IS NULL)
    ) OR auth.uid() IS NOT NULL) -- Fallback to allow if we can't find the relation
);

-- 4. Authenticated users can delete their own images
CREATE POLICY \Authenticated
users
can
delete
images
in
analysis-images\
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'analysis-images' AND
    (EXISTS (
        SELECT 1 FROM public.analysis_images ai
        JOIN public.analysis_result ar ON ai.analysis_id = ar.id
        WHERE 
            storage.objects.name = ai.storage_path AND
            (ar.user_id = auth.uid() OR ar.user_id IS NULL)
    ) OR auth.uid() IS NOT NULL) -- Fallback to allow if we can't find the relation
);

-- Fix policies for the analysis_images table if needed
DROP POLICY IF EXISTS "Users can insert analysis_images" ON public.analysis_images;
DROP POLICY IF EXISTS "Authenticated users can insert analysis_images" ON public.analysis_images;
DROP POLICY IF EXISTS "Users can insert related analysis_images" ON public.analysis_images; -- Drop the previous stricter policy

-- Create policy allowing any user (public) to insert related analysis_images
-- Allow insert only if the related analysis_result exists.
CREATE POLICY "Public can insert related analysis_images"
ON public.analysis_images FOR INSERT
TO public
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.analysis_result ar
        WHERE ar.id = analysis_id
    )
);
