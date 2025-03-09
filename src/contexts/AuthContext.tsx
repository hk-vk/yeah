import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { AuthContextType, User } from '../types/auth';
import { toast } from 'react-hot-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        // Store user ID in localStorage if available
        if (user?.id) {
          localStorage.setItem('userId', user.id);
          console.log('User ID stored in localStorage:', user.id);
        }
      } catch (error) {
        console.error('Error checking auth session:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      // Update localStorage based on auth state
      if (currentUser?.id) {
        localStorage.setItem('userId', currentUser.id);
        console.log('User ID updated in localStorage:', currentUser.id);
      } else {
        localStorage.removeItem('userId');
        console.log('User ID removed from localStorage');
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (user) {
        setUser(user);
        
        // Store user ID in localStorage
        localStorage.setItem('userId', user.id);
        console.log('User ID stored in localStorage after login:', user.id);
        
        toast.success('Successfully logged in!');
      }
    } catch (error: any) {
      setError(error.message || 'Login failed');
      toast.error(error.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      setError(null);
      const { data: { user }, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });

      if (error) throw error;
      if (user) {
        setUser(user);
        toast.success('Successfully registered! Please check your email for verification.');
      }
    } catch (error: any) {
      setError(error.message || 'Registration failed');
      toast.error(error.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };
  

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      
      // Remove user ID from localStorage
      localStorage.removeItem('userId');
      console.log('User ID removed from localStorage after logout');
      
      toast.success('Successfully logged out!');
    } catch (error: any) {
      setError(error.message || 'Logout failed');
      toast.error(error.message || 'Logout failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    signIn,
    signUp,
    signOut,
    loading,
    error
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
