import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cxjdkqkzmtyudkwwhelq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4amRrcWt6bXR5dWRrd3doZWxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU4MDE1NzEsImV4cCI6MjA1MTM3NzU3MX0.GIuHV-ov2Zm-G09rOHuy1cIrvrzVaDg7CPQmH3UyrUE'

export const supabase = createClient(supabaseUrl, supabaseKey)