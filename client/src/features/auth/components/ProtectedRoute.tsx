import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthVerify } from '@/features/auth/hooks/useAuthVerify';
import { FullScreenLoadingFallback } from '@/components/shared/LoadingFallback';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isAuthVerified } = useAuthVerify();
  const location = useLocation();

  if (!isAuthVerified) {
    return <FullScreenLoadingFallback />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}

export function PublicRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isAuthVerified } = useAuthVerify();
  const location = useLocation();

  if (!isAuthVerified) {
    return <FullScreenLoadingFallback />;
  }

  if (isAuthenticated) {
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
