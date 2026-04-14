import { Suspense } from "react"
import { Outlet } from "react-router-dom"
import { PageLoadingFallback } from "@/components/shared/LoadingFallback"

export default function AuthLayout() {
  return (
    <div
      className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: "url('/background1.jpg')" }}
    >
      <div className="w-full max-w-sm">
        <Suspense fallback={<PageLoadingFallback />}>
          <Outlet />
        </Suspense>
      </div>
    </div>
  )
}
