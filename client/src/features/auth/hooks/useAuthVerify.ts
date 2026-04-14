import { useEffect } from 'react';
import { useAuth } from '@/features/auth/stores/authStore';
import authService from '@/features/auth/services/authService';

export function useAuthVerify() {
  const { isAuthenticated, isAuthVerified } = useAuth();

  useEffect(() => {
    if (!isAuthVerified && isAuthenticated) {
      authService.getCurrentUser().catch(() => {
        useAuth.getState().clearAuth();
      }).finally(() => {
        useAuth.getState().setAuthVerified(true);
      });
    } else if (!isAuthVerified && !isAuthenticated) {
      useAuth.getState().setAuthVerified(true);
    }
  }, [isAuthenticated, isAuthVerified]);

  return { isAuthenticated, isAuthVerified };
}
