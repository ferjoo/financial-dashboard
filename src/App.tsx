import { lazy, Suspense, Component, type ReactNode } from 'react'
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/hooks/use-auth'
import { ToastProvider } from '@/components/ui/toast'
import { CurrencyProvider } from '@/context/currency'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import RoleRoute from '@/components/layout/RoleRoute'
import AppLayout from '@/components/layout/AppLayout'

const LoginPage = lazy(() => import('@/pages/LoginPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const ReportsPage = lazy(() => import('@/pages/ReportsPage'))
const ReportDetailPage = lazy(() => import('@/pages/ReportDetailPage'))
const UploadPage = lazy(() => import('@/pages/UploadPage'))
const AffiliateDashboardPage = lazy(() => import('@/pages/AffiliateDashboardPage'))
const AffiliateReportsPage = lazy(() => import('@/pages/AffiliateReportsPage'))
const AffiliateReportDetailPage = lazy(() => import('@/pages/AffiliateReportDetailPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))
const PlaygroundPage = lazy(() => import('@/pages/PlaygroundPage'))
const OnlineDashboardPage = lazy(() => import('@/pages/online/OnlineDashboardPage'))
const OnlineReportsPage = lazy(() => import('@/pages/online/OnlineReportsPage'))
const OnlineUploadPage = lazy(() => import('@/pages/online/OnlineUploadPage'))
const UsersPage = lazy(() => import('@/pages/UsersPage'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
    },
  },
})

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <p className="text-gray-600">Something went wrong.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
          >
            Reload page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

/** Old links used /affiliates/...; keep them working after the rename to partners. */
function LegacyPartnerRedirect() {
  const { pathname } = useLocation()
  return <Navigate to={pathname.replace(/^\/affiliates/, '/partners')} replace />
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CurrencyProvider>
          <ToastProvider>
            <HashRouter>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/affiliates/*" element={<LegacyPartnerRedirect />} />
                  <Route element={<ProtectedRoute />}>
                    <Route element={<AppLayout />}>
                      {/* Playground — admins + superadmin */}
                      <Route element={<RoleRoute roles={['superadmin', 'offline_admin', 'online_admin']} redirectTo="/" />}>
                        <Route path="playground" element={<PlaygroundPage />} />
                      </Route>

                      {/* User management — superadmin + channel admins */}
                      <Route element={<RoleRoute roles={['superadmin', 'offline_admin', 'online_admin']} redirectTo="/" />}>
                        <Route path="users" element={<UsersPage />} />
                      </Route>

                      {/* In-store dashboard — all offline roles + superadmin */}
                      <Route element={<RoleRoute roles={['offline_viewer', 'offline_admin', 'superadmin']} redirectTo="/online" />}>
                        <Route index element={<DashboardPage />} />
                      </Route>

                      {/* In-store full — admin + superadmin (reports, upload) */}
                      <Route element={<RoleRoute roles={['offline_admin', 'superadmin']} redirectTo="/" />}>
                        <Route path="reports" element={<ReportsPage />} />
                        <Route path="reports/:reportId" element={<ReportDetailPage />} />
                        <Route path="upload" element={<UploadPage />} />
                        <Route path="partners/reports" element={<AffiliateReportsPage />} />
                        <Route path="partners/reports/:reportId" element={<AffiliateReportDetailPage />} />
                      </Route>

                      {/* Partner dashboard — all offline roles + superadmin */}
                      <Route element={<RoleRoute roles={['offline_viewer', 'offline_admin', 'superadmin']} redirectTo="/online" />}>
                        <Route path="partners" element={<AffiliateDashboardPage />} />
                      </Route>

                      {/* Online dashboard — all online roles + superadmin */}
                      <Route element={<RoleRoute roles={['online_viewer', 'online_admin', 'superadmin']} redirectTo="/" />}>
                        <Route path="online" element={<OnlineDashboardPage />} />
                      </Route>

                      {/* Online full — admin + superadmin (reports, upload) */}
                      <Route element={<RoleRoute roles={['online_admin', 'superadmin']} redirectTo="/" />}>
                        <Route path="online/reports" element={<OnlineReportsPage />} />
                        <Route path="online/upload" element={<OnlineUploadPage />} />
                      </Route>
                    </Route>
                  </Route>
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </HashRouter>
          </ToastProvider>
          </CurrencyProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
