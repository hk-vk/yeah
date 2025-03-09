-- Create analysis_result table
CREATE TABLE IF NOT EXISTS public.analysis_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    type TEXT NOT NULL CHECK (type IN ('text', 'image', 'url', 'text_image')),
    input JSONB NOT NULL DEFAULT '{}'::jsonb,
    result JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create RLS policies for analysis_result
ALTER TABLE public.analysis_result ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own analysis_result"
    ON public.analysis_result FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analysis_result"
    ON public.analysis_result FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analysis_result"
    ON public.analysis_result FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analysis_result"
    ON public.analysis_result FOR DELETE
    USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_analysis_result_updated_at
    BEFORE UPDATE ON public.analysis_result
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_analysis_result_user_id ON public.analysis_result(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_result_type ON public.analysis_result(type);
CREATE INDEX IF NOT EXISTS idx_analysis_result_created_at ON public.analysis_result(created_at);

-- Grant permissions
GRANT ALL ON public.analysis_result TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated; 