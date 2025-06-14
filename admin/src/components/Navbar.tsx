import { NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            <NavLink to="/" className={({ isActive }) => isActive ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'}>Dashboard</NavLink>
            <NavLink to="/Userspage" className={({ isActive }) => isActive ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'}>Users</NavLink>
            <NavLink to="/Articlespage" className={({ isActive }) => isActive ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'}>Articles</NavLink>
            <NavLink to="/SettingsPage" className={({ isActive }) => isActive ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'}>Settings</NavLink>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              Welcome, {user?.email}
            </span>
            <button
              onClick={logout}
              className="text-sm text-gray-700 hover:text-gray-900"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
} 