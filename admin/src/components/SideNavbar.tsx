import { NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function SideNavbar() {
  const { user, logout } = useAuth()

  return (
    <aside className="h-screen w-64 bg-white shadow flex flex-col justify-between fixed left-0 top-0 z-20">
      <div>
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-900">Admin</h1>
          <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
        </div>
        <nav className="mt-6 flex-1">
          <ul className="space-y-2">
            <li>
              <NavLink to="/" end className={({ isActive }) => isActive ? 'block px-6 py-3 bg-blue-100 text-blue-700 rounded-lg font-semibold' : 'block px-6 py-3 text-gray-700 hover:bg-blue-50 rounded-lg'}>
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to="/users" className={({ isActive }) => isActive ? 'block px-6 py-3 bg-blue-100 text-blue-700 rounded-lg font-semibold' : 'block px-6 py-3 text-gray-700 hover:bg-blue-50 rounded-lg'}>
                Users
              </NavLink>
            </li>
            <li>
              <NavLink to="/articles" className={({ isActive }) => isActive ? 'block px-6 py-3 bg-blue-100 text-blue-700 rounded-lg font-semibold' : 'block px-6 py-3 text-gray-700 hover:bg-blue-50 rounded-lg'}>
                Articles
              </NavLink>
            </li>
            <li>
              <NavLink to="/settings" className={({ isActive }) => isActive ? 'block px-6 py-3 bg-blue-100 text-blue-700 rounded-lg font-semibold' : 'block px-6 py-3 text-gray-700 hover:bg-blue-50 rounded-lg'}>
                Settings
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
      <div className="p-6 border-t">
        <button
          onClick={logout}
          className="w-full text-left text-sm text-gray-700 hover:text-red-600"
        >
          Logout
        </button>
      </div>
    </aside>
  )
} 