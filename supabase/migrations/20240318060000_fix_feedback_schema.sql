-- Migration to fix feedback table schema

-- Check if the feedback table exists, if not create it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'feedback') THEN
        CREATE TABLE public.feedback (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES auth.users(id),
            rating INTEGER,
            comment TEXT,
            analysis_result_id UUID REFERENCES public.analysis_result(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
    END IF;
END $$;

-- Drop the feedback_text column if it exists (to clean up any previous attempts)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'feedback' 
        AND column_name = 'feedback_text'
    ) THEN
        ALTER TABLE public.feedback DROP COLUMN feedback_text;
    END IF;
END $$;

-- Make sure the analysis_result_id column exists and has the correct foreign key
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'feedback' 
        AND column_name = 'analysis_result_id'
    ) THEN
        ALTER TABLE public.feedback ADD COLUMN analysis_result_id UUID REFERENCES public.analysis_result(id);
    END IF;
END $$;

-- Drop the old constraint if it exists
ALTER TABLE public.feedback DROP CONSTRAINT IF EXISTS fk_analysis;

-- Ensure the correct foreign key constraint exists
ALTER TABLE public.feedback 
    DROP CONSTRAINT IF EXISTS feedback_analysis_result_id_fkey,
    ADD CONSTRAINT feedback_analysis_result_id_fkey 
    FOREIGN KEY (analysis_result_id) 
    REFERENCES public.analysis_result(id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_feedback_analysis_result_id ON public.feedback(analysis_result_id);
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback(created_at);

-- Enable RLS
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Update RLS policies
DROP POLICY IF EXISTS "Users can view feedback for their analyses" ON public.feedback;
DROP POLICY IF EXISTS "Users can insert feedback for their analyses" ON public.feedback;

-- Create policies
CREATE POLICY "Users can view feedback for their analyses" 
    ON public.feedback 
    FOR SELECT 
    USING (
        auth.uid() IN (
            SELECT user_id 
            FROM public.analysis_result 
            WHERE id = analysis_result_id
        ) OR auth.uid() = user_id
    );

CREATE POLICY "Users can insert feedback for their analyses" 
    ON public.feedback 
    FOR INSERT 
    WITH CHECK (
        auth.uid() IN (
            SELECT user_id 
            FROM public.analysis_result 
            WHERE id = analysis_result_id
        ) OR auth.uid() = user_id
    );

-- Grant permissions
GRANT ALL ON public.feedback TO authenticated; 