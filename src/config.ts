export const API_CONFIG = {
  BASE_URL: 'http://localhost:8000',
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
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

// Add validation for required environment variables
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  throw new Error('Required Supabase environment variables are not set');
}

export const API_BASE_URL = API_CONFIG.BASE_URL;
