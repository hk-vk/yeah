-- Update feedback table to link to analysis_result instead of analyses
DO $$ 
BEGIN
    -- Check if the column exists before attempting to rename
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'feedback' 
        AND column_name = 'analyses_id'
    ) THEN
        -- Rename the column from analyses_id to analysis_result_id
        ALTER TABLE public.feedback RENAME COLUMN analyses_id TO analysis_result_id;
    
    -- If the column doesn't exist, create it
    ELSIF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'feedback' 
        AND column_name = 'analysis_result_id'
    ) THEN
        -- Add the analysis_result_id column
        ALTER TABLE public.feedback ADD COLUMN analysis_result_id UUID REFERENCES public.analysis_result(id);
    END IF;
END $$;

-- Recreate any foreign key constraints to ensure they reference the correct table
ALTER TABLE public.feedback 
    DROP CONSTRAINT IF EXISTS feedback_analysis_result_id_fkey,
    ADD CONSTRAINT feedback_analysis_result_id_fkey 
    FOREIGN KEY (analysis_result_id) 
    REFERENCES public.analysis_result(id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_feedback_analysis_result_id ON public.feedback(analysis_result_id);

-- Update RLS policies if needed
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view feedback for their analyses" ON public.feedback;
DROP POLICY IF EXISTS "Users can insert feedback for their analyses" ON public.feedback;

-- Ensure users can only see feedback for analyses they own
CREATE POLICY "Users can view feedback for their analyses" 
    ON public.feedback 
    FOR SELECT 
    USING (
        auth.uid() IN (
            SELECT user_id 
            FROM public.analysis_result 
            WHERE id = analysis_result_id
        )
    );

-- Ensure users can only insert feedback for analyses they own
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