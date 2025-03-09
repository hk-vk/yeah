export const API_CONFIG = {
  BASE_URL: 'http://localhost:8000',
  SUPABASE_URL: 'https://cxjdkqkzmtyudkwwhelq.supabase.co',
  SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4amRrcWt6bXR5dWRrd3doZWxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU4MDE1NzEsImV4cCI6MjA1MTM3NzU3MX0.GIuHV-ov2Zm-G09rOHuy1cIrvrzVaDg7CPQmH3UyrUE',
  ENDPOINTS: {
    REVERSE_SEARCH: '/api/reverse-searchy',
    WRITING_STYLE: '/api/writing-style',
    URL_ANALYSIS: '/api/url-analysis',
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout'
    }
  }
};

export const API_BASE_URL = API_CONFIG.BASE_URL;
