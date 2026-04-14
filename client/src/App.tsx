import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { Toaster } from "@/components/ui/sonner"
import { FullScreenLoadingFallback } from '@/components/shared/LoadingFallback'

export function App() {
  return (
    <div>
      <Suspense fallback={<FullScreenLoadingFallback />}>
        <Outlet />
      </Suspense>
      <Toaster position="top-right" richColors />
    </div>
  );
}
