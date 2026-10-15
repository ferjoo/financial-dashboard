import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { api } from '@/lib/axios'
import { setDemoRole, type DemoRole } from '@/mock/adapter'
import type { RequestUser } from '@/types/api'

interface AuthContextValue {
  user: RequestUser | null
  token: string | null
  isLoading: boolean
  /** Demo: enter the dashboard as the given role */
  enterDemo: (role: DemoRole) => Promise<void>
  /** Demo: switch roles without leaving the dashboard */
  switchRole: (role: DemoRole) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const DEMO_TOKEN = 'demo-token'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<RequestUser | null>(null)
  // Visitors land straight on the dashboard; logging out shows the role picker.
  const [token, setToken] = useState<string | null>(DEMO_TOKEN)
  const isLoading = token !== null && user === null

  const fetchUser = useCallback(async () => {
    const { data } = await api.get<RequestUser>('/auth/me')
    setUser(data)
  }, [])

  useEffect(() => {
    if (token) void fetchUser()
  }, [token, fetchUser])

  const switchRole = useCallback(
    async (role: DemoRole) => {
      setDemoRole(role)
      await fetchUser()
    },
    [fetchUser],
  )

  const enterDemo = useCallback(
    async (role: DemoRole) => {
      setDemoRole(role)
      setToken(DEMO_TOKEN)
      // Refetch even when already signed in, so picking a new role always applies
      await fetchUser()
    },
    [fetchUser],
  )

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, isLoading, enterDemo, switchRole, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

