import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'

interface RoleRouteProps {
  /** Roles that are allowed to access this route */
  roles: string[]
  /** Where to send unauthorized users */
  redirectTo: string
}

export default function RoleRoute({ roles, redirectTo }: RoleRouteProps) {
  const { user } = useAuth()

  if (!user?.role || !roles.includes(user.role)) {
    return <Navigate to={redirectTo} replace />
  }

  return <Outlet />
}
