-- Update RLS policies to allow public access to view shared images

-- Drop existing policies for storage.objects
DROP POLICY IF EXISTS "Public read access for analysis-images" ON storage.objects;
DROP POLICY IF EXISTS "Public can upload to analysis-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update images in analysis-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete images in analysis-images" ON storage.objects;

-- Create new policies for storage.objects
-- 1. Allow public read access to all images
CREATE POLICY "Public read access for analysis-images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'analysis-images');

-- 2. Allow public upload access
CREATE POLICY "Public can upload to analysis-images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'analysis-images');

-- 3. Allow public update access
CREATE POLICY "Public can update images in analysis-images"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'analysis-images');

-- 4. Allow public delete access
CREATE POLICY "Public can delete images in analysis-images"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'analysis-images');

-- Update policies for analysis_images table
DROP POLICY IF EXISTS "Anyone can view analysis_images" ON public.analysis_images;
DROP POLICY IF EXISTS "Public can insert related analysis_images" ON public.analysis_images;
DROP POLICY IF EXISTS "Owner can update their own analysis_images" ON public.analysis_images;
DROP POLICY IF EXISTS "Owner can delete their own analysis_images" ON public.analysis_images;

-- Create new policies for analysis_images table
-- 1. Allow public read access
CREATE POLICY "Public can view analysis_images"
ON public.analysis_images FOR SELECT
TO public
USING (true);

-- 2. Allow public insert access
CREATE POLICY "Public can insert analysis_images"
ON public.analysis_images FOR INSERT
TO public
WITH CHECK (true);

-- 3. Allow public update access
CREATE POLICY "Public can update analysis_images"
ON public.analysis_images FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- 4. Allow public delete access
CREATE POLICY "Public can delete analysis_images"
ON public.analysis_images FOR DELETE
TO public
USING (true);

-- Grant necessary permissions
GRANT ALL ON public.analysis_images TO anon;
GRANT ALL ON public.analysis_images TO authenticated; 