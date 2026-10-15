import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Home } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-200">404</h1>
        <p className="text-base text-gray-700 mt-3">Page not found</p>
        <p className="text-sm text-gray-400 mt-1">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link to="/">
          <Button className="mt-5">
            <Home className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}
