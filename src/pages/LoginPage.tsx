import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { homeFor } from '@/lib/home'
import { Button } from '@/components/ui/button'
import { DEMO_ROLES, getDemoRole, type DemoRole } from '@/mock/adapter'
import { BarChart3, LogIn } from 'lucide-react'
import { cn } from '@/lib/utils'

const ROLE_HINTS: Record<DemoRole, string> = {
  superadmin: 'Everything: in-store and online channels, uploads, users and the playground.',
  offline_admin: 'Branch channel: dashboards, reports, uploads and in-store users.',
  offline_viewer: 'Read-only branch dashboards, the view management uses.',
  online_admin: 'Website channel tools and online users.',
  online_viewer: 'Read-only website channel dashboard.',
}

/** Demo entry screen: replaces the real email/password login with a role picker. */
export default function LoginPage() {
  const { enterDemo } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = useState<DemoRole>(getDemoRole)

  async function handleEnter() {
    await enterDemo(role)
    navigate(homeFor(role), { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center mx-auto mb-3">
            <BarChart3 className="w-6 h-6 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Financial Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Reporting · Interactive demo</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-base font-medium text-gray-900">Choose a role to explore</h2>
          <p className="text-sm text-gray-500 mt-1 mb-5">
            Each role sees different pages, just like the real platform. All data is invented.
          </p>
          <fieldset className="space-y-2">
            <legend className="sr-only">Demo role</legend>
            {DEMO_ROLES.map(({ role: value, label }) => (
              <label
                key={value}
                className={cn(
                  'flex gap-3 rounded-lg border p-3 cursor-pointer transition-colors',
                  'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary-500',
                  role === value ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50',
                )}
              >
                <input
                  type="radio"
                  name="role"
                  value={value}
                  checked={role === value}
                  onChange={() => setRole(value)}
                  className="mt-1 accent-primary-600"
                />
                <span>
                  <span className="block text-sm font-medium text-gray-900">{label}</span>
                  <span className="block text-xs text-gray-500 mt-0.5">{ROLE_HINTS[value]}</span>
                </span>
              </label>
            ))}
          </fieldset>
          <Button onClick={handleEnter} className="w-full mt-5" size="lg">
            <LogIn className="w-4 h-4" aria-hidden="true" />
            Enter demo
          </Button>
        </div>
      </div>
    </div>
  )
}
