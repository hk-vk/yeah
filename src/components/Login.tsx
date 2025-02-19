import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Login() {
  const { user } = useAuth();
  
  // Redirect to home if already logged in
  if (user) {
    return <Navigate to="/" replace />;
  }

  return <Navigate to="/?login=true" replace />;
}
