import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Logout() {
  const { signOut } = useAuth();
  
  useEffect(() => {
    signOut().catch(console.error);
  }, [signOut]);

  return <Navigate to="/" replace />;
}
