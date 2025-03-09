-- Grant access to auth schema and users view for the service role
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT ALL ON auth.users TO service_role;

-- Allow the service role to bypass RLS
ALTER TABLE public.analysis_result FORCE ROW LEVEL SECURITY;
ALTER TABLE public.feedback FORCE ROW LEVEL SECURITY;

-- Create policy to allow service_role to bypass RLS
CREATE POLICY "Service role can do everything" 
    ON public.analysis_result
    FOR ALL 
    TO service_role 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Service role can do everything" 
    ON public.feedback
    FOR ALL 
    TO service_role 
    USING (true) 
    WITH CHECK (true);