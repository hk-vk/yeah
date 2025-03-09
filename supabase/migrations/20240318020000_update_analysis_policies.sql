-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own analysis_result" ON public.analysis_result;
DROP POLICY IF EXISTS "Users can insert their own analysis_result" ON public.analysis_result;
DROP POLICY IF EXISTS "Users can update their own analysis_result" ON public.analysis_result;
DROP POLICY IF EXISTS "Users can delete their own analysis_result" ON public.analysis_result;

-- Create new policies that allow public access for viewing
CREATE POLICY "Anyone can view analysis_result"
    ON public.analysis_result FOR SELECT
    USING (true);

CREATE POLICY "Anyone can insert analysis_result"
    ON public.analysis_result FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Owner can update their own analysis_result"
    ON public.analysis_result FOR UPDATE
    USING (auth.uid() = user_id OR user_id IS NULL)
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Owner can delete their own analysis_result"
    ON public.analysis_result FOR DELETE
    USING (auth.uid() = user_id OR user_id IS NULL);

-- Grant public access
GRANT SELECT ON public.analysis_result TO anon;
GRANT INSERT ON public.analysis_result TO anon;
GRANT UPDATE ON public.analysis_result TO anon;
GRANT DELETE ON public.analysis_result TO anon;