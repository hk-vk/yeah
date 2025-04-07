-- Create a storage bucket for images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('analysis-images', 'analysis-images', true);

-- Create policy to allow public access to images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'analysis-images' );

-- Create policy to allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'analysis-images' );

-- Create images table
CREATE TABLE IF NOT EXISTS public.analysis_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID REFERENCES public.analysis_result(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    original_url TEXT,
    image_type TEXT CHECK (image_type IN ('uploaded', 'url', 'extracted')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_analysis_images_analysis_id ON public.analysis_images(analysis_id);

-- Enable RLS
ALTER TABLE public.analysis_images ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for analysis_images
CREATE POLICY "Anyone can view analysis_images"
    ON public.analysis_images FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert analysis_images"
    ON public.analysis_images FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Owner can update their own analysis_images"
    ON public.analysis_images FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.analysis_result ar
        WHERE ar.id = analysis_id
        AND (ar.user_id = auth.uid() OR ar.user_id IS NULL)
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.analysis_result ar
        WHERE ar.id = analysis_id
        AND (ar.user_id = auth.uid() OR ar.user_id IS NULL)
    ));

CREATE POLICY "Owner can delete their own analysis_images"
    ON public.analysis_images FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.analysis_result ar
        WHERE ar.id = analysis_id
        AND (ar.user_id = auth.uid() OR ar.user_id IS NULL)
    ));

-- Create trigger for updated_at
CREATE TRIGGER update_analysis_images_updated_at
    BEFORE UPDATE ON public.analysis_images
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON public.analysis_images TO authenticated;
GRANT ALL ON public.analysis_images TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon; 