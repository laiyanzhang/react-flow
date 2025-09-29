import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from '@tanstack/react-router';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { authStatus, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/login') {
      return;
    }

    if (!isLoading && authStatus.status === 'logged_out') {
      const currentPath = window.location.pathname + window.location.search;
      sessionStorage.setItem('redirectPath', currentPath);

      navigate({ to: '/login' });
    }
  }, [authStatus, isLoading, navigate, location.pathname]);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  if (location.pathname === '/login') {
    return <>{children}</>;
  }

  if (authStatus.status === 'logged_out') {
    return null;
  }

  return <>{children}</>;
}
