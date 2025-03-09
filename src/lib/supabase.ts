import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
}

// Create the Supabase client with proper error handling
export const supabase = createClient<Database>(
  supabaseUrl || 'https://cxjdkqkzmtyudkwwhelq.supabase.co', 
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4amRrcWt6bXR5dWRrd3doZWxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU4MDE1NzEsImV4cCI6MjA1MTM3NzU3MX0.GIuHV-ov2Zm-G09rOHuy1cIrvrzVaDg7CPQmH3UyrUE'
)