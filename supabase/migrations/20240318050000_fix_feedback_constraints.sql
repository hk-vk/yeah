-- Migration to fix feedback table foreign key constraints

-- Drop the problematic constraint if it exists
ALTER TABLE public.feedback DROP CONSTRAINT IF EXISTS fk_analysis;

-- Make sure we have the correct constraint
ALTER TABLE public.feedback 
    DROP CONSTRAINT IF EXISTS feedback_analysis_result_id_fkey,
    ADD CONSTRAINT feedback_analysis_result_id_fkey 
    FOREIGN KEY (analysis_result_id) 
    REFERENCES public.analysis_result(id);

-- Check if analysis_id column exists and drop it if it does
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'feedback' 
        AND column_name = 'analysis_id'
    ) THEN
        -- Drop column if it exists
        ALTER TABLE public.feedback DROP COLUMN analysis_id;
    END IF;
END $$;

-- Update any RLS policies that might reference the old column
DROP POLICY IF EXISTS "Users can view feedback for their analyses" ON public.feedback;
DROP POLICY IF EXISTS "Users can insert feedback for their analyses" ON public.feedback;

-- Recreate policies
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