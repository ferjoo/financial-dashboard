import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { homeFor } from '@/lib/home'
import { DEMO_ROLES, type DemoRole } from '@/mock/adapter'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  FileText,
  Upload,
  LogOut,
  Menu,
  X,
  BarChart3,
  User,
  Users,
  FlaskConical,
  Globe,
  Store,
  Handshake,
  Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const OFFLINE_FINANCIAL_DASHBOARD = { to: '/', icon: LayoutDashboard, label: 'Financial Dashboard', end: true }
const OFFLINE_AFFILIATE_DASHBOARD = { to: '/affiliates', icon: Handshake, label: 'Affiliate Dashboard', end: true }
const OFFLINE_ADMIN_NAV = [
  { to: '/reports', icon: FileText, label: 'Financial Reports', end: false },
  { to: '/affiliates/reports', icon: FileText, label: 'Affiliate Reports', end: false },
  { to: '/upload', icon: Upload, label: 'Upload CSV', end: false },
]

const ONLINE_DASHBOARD = { to: '/online', icon: Globe, label: 'Dashboard', end: true }
const ONLINE_ADMIN_NAV = [
  { to: '/online/reports', icon: FileText, label: 'Reports', end: false },
  { to: '/online/upload', icon: Upload, label: 'Upload CSV', end: false },
]

export default function AppLayout() {
  const { user, logout, switchRole } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  async function handleRoleChange(role: DemoRole) {
    await switchRole(role)
    navigate(homeFor(role))
  }

  const role = user?.role
  const isSuperadmin = role === 'superadmin'
  const isOfflineAdmin = role === 'offline_admin'
  const isOnlineAdmin = role === 'online_admin'
  const showOffline = role === 'offline_viewer' || isOfflineAdmin || isSuperadmin
  const showOfflineAdmin = isOfflineAdmin || isSuperadmin
  const showOnline = role === 'online_viewer' || isOnlineAdmin || isSuperadmin
  const showOnlineAdmin = isOnlineAdmin || isSuperadmin
  const showUsers = isSuperadmin || isOfflineAdmin || isOnlineAdmin
  const showPlayground = isSuperadmin || isOfflineAdmin || isOnlineAdmin

  return (
    <div className="min-h-screen flex bg-gray-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        id="app-sidebar"
        aria-label="Main navigation"
        className={cn(
          'fixed lg:sticky top-0 left-0 z-50 h-screen w-60 flex flex-col',
          'bg-white border-r border-gray-200',
          'transition-transform duration-200',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-sm">Financial Dashboard</p>
              <p className="text-[11px] text-gray-500">Reporting · Demo</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
          {showOffline && (
            <div>
              <div className="flex items-center gap-1.5 px-3 mb-1">
                <Store className="w-3 h-3 text-gray-400" />
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Offline</p>
              </div>
              <div className="space-y-0.5">
                {[OFFLINE_FINANCIAL_DASHBOARD, OFFLINE_AFFILIATE_DASHBOARD, ...(showOfflineAdmin ? OFFLINE_ADMIN_NAV : [])].map(({ to, icon: Icon, label, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                        isActive
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50',
                      )
                    }
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                    {label}
                  </NavLink>
                ))}
              </div>
            </div>
          )}

          {showOnline && (
            <div>
              <div className="flex items-center gap-1.5 px-3 mb-1">
                <Globe className="w-3 h-3 text-blue-400" />
                <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">Online</p>
              </div>
              <div className="space-y-0.5">
                {[ONLINE_DASHBOARD, ...(showOnlineAdmin ? ONLINE_ADMIN_NAV : [])].map(({ to, icon: Icon, label, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50',
                      )
                    }
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                    {label}
                  </NavLink>
                ))}
              </div>
            </div>
          )}

          {showUsers && (
            <div>
              <div className="space-y-0.5">
                <NavLink
                  to="/users"
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                      isActive
                        ? 'bg-purple-50 text-purple-700'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50',
                    )
                  }
                >
                  <Users className="w-4 h-4" />
                  Users
                </NavLink>
              </div>
            </div>
          )}

          {showPlayground && (
            <div>
              <div className="space-y-0.5">
                <NavLink
                  to="/playground"
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50',
                    )
                  }
                >
                  <FlaskConical className="w-4 h-4" />
                  Playground
                </NavLink>
              </div>
            </div>
          )}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <label htmlFor="demo-role" className="block px-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
            View as
          </label>
          <select
            id="demo-role"
            value={user?.role ?? 'superadmin'}
            onChange={(e) => handleRoleChange(e.target.value as DemoRole)}
            className="mx-3 mt-1 mb-2 w-[calc(100%-1.5rem)] rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            {DEMO_ROLES.map(({ role, label }) => (
              <option key={role} value={role}>{label}</option>
            ))}
          </select>
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-700 truncate font-medium">
                {user ? `${user.firstName} ${user.lastName}` : 'Guest'}
              </p>
              <p className="text-[11px] text-gray-500 truncate">
                {user?.email}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start mt-1"
            onClick={logout}
          >
            <LogOut className="w-3.5 h-3.5" />
            Exit demo
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 lg:hidden flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 -ml-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label="Open menu"
            aria-expanded={sidebarOpen}
            aria-controls="app-sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <p className="font-semibold text-sm text-gray-900">Financial Dashboard</p>
        </header>

        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs sm:text-sm text-amber-900 flex items-start gap-2">
          <Info className="w-4 h-4 shrink-0 mt-px" aria-hidden="true" />
          <p>
            <span className="font-semibold">Demo with sample data.</span>{' '}
            Every bet shop, cashier, affiliate and amount is invented. Uploads and edits stay in your browser and reset on reload.
          </p>
        </div>

        <main className="flex-1 min-w-0 p-4 sm:p-5 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
