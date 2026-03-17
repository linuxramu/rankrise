import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { Button } from '@/components/ui/Button'

export function Navbar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/dashboard" className="text-xl font-bold text-primary-600">
          RankRise
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/tests" className="text-sm text-gray-600 hover:text-gray-900">Tests</Link>
          <Link to="/analytics" className="text-sm text-gray-600 hover:text-gray-900">Analytics</Link>
          <Link to="/leaderboard" className="text-sm text-gray-600 hover:text-gray-900">Leaderboard</Link>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">{user?.name}</span>
          <Button variant="ghost" size="sm" onClick={handleLogout}>Logout</Button>
        </div>
      </div>
    </nav>
  )
}
