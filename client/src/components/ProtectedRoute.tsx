import { useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string[];
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const [location, navigate] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      console.log('No user found, redirecting to login');
      navigate('/login');
    }
    
    if (!loading && user && requiredRole && !requiredRole.includes(user.tipo)) {
      console.log('User role not authorized:', user.tipo, 'Required:', requiredRole);
      navigate('/dashboard');
    }
  }, [user, loading, requiredRole, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  if (requiredRole && !requiredRole.includes(user.tipo)) {
    return null; // Will redirect via useEffect
  }

  return <>{children}</>;
}