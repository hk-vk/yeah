-- Drop existing policies
DROP POLICY IF EXISTS "Users can view feedback for their analyses" ON public.feedback;
DROP POLICY IF EXISTS "Users can insert feedback for their analyses" ON public.feedback;

-- Create new policies that allow public access
CREATE POLICY "Anyone can view feedback"
    ON public.feedback FOR SELECT
    USING (true);

CREATE POLICY "Anyone can insert feedback"
    ON public.feedback FOR INSERT
    WITH CHECK (true);

-- Grant public access
GRANT SELECT ON public.feedback TO anon;
GRANT INSERT ON public.feedback TO anon;