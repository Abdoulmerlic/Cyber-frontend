import { useEffect, useState } from 'react'
import { adminService } from '../services/api'
import { 
  UsersIcon, 
  DocumentTextIcon, 
  BookmarkIcon, 
  ChatBubbleLeftIcon 
} from '@heroicons/react/24/outline'

interface Stats {
  totalUsers: number
  totalArticles: number
  totalBookmarks: number
  totalComments: number
}

interface User {
  _id: string
  username: string
  email: string
  createdAt: string
}

interface Article {
  _id: string
  title: string
  author: {
    _id: string
    username: string
  }
  createdAt: string
  status: string
}

interface UsersResponse {
  users: User[]
  total: number
  currentPage: number
  totalPages: number
}

interface ArticlesResponse {
  articles: Article[]
  total: number
  currentPage: number
  totalPages: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null)
        const [statsData, usersData, articlesData] = await Promise.all([
          adminService.getStats(),
          adminService.getUsers(),
          adminService.getArticles()
        ])
        
        setStats(statsData)
        setUsers(usersData?.users || [])
        setArticles(articlesData?.articles || [])
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setError('Failed to load dashboard data. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  async function handleDeleteUser(userId: string) {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminService.deleteUser(userId)
        // Refresh the users list
        const usersData = await adminService.getUsers()
        setUsers(usersData?.users || [])
      } catch (error) {
        console.error('Error deleting user:', error)
      }
    }
  }

  async function handleDeleteArticle(articleId: string) {
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        await adminService.deleteArticle(articleId)
        // Refresh the articles list
        const articlesData = await adminService.getArticles()
        setArticles(articlesData?.articles || [])
      } catch (error) {
        console.error('Error deleting article:', error)
      }
    }
  }

  // Add placeholder handlers for View and Edit actions
  function handleViewUser(userId: string) {
    alert(`View user: ${userId}`)
  }
  function handleEditUser(userId: string) {
    alert(`Edit user: ${userId}`)
  }
  function handleViewArticle(articleId: string) {
    alert(`View article: ${articleId}`)
  }
  function handleEditArticle(articleId: string) {
    alert(`Edit article: ${articleId}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">{error}</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={<UsersIcon className="h-6 w-6" />}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Articles"
          value={stats?.totalArticles || 0}
          icon={<DocumentTextIcon className="h-6 w-6" />}
          color="bg-green-500"
        />
        <StatCard
          title="Total Bookmarks"
          value={stats?.totalBookmarks || 0}
          icon={<BookmarkIcon className="h-6 w-6" />}
          color="bg-purple-500"
        />
        <StatCard
          title="Total Comments"
          value={stats?.totalComments || 0}
          icon={<ChatBubbleLeftIcon className="h-6 w-6" />}
          color="bg-yellow-500"
        />
      </div>

      {/* Recent Users */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Recent Users</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users && users.length > 0 ? (
                users.map((user) => (
                  <tr key={user._id}>
                    <td className="px-6 py-4 whitespace-nowrap">{user.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewUser(user._id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEditUser(user._id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Articles */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Articles</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {articles && articles.length > 0 ? (
                articles.map((article) => (
                  <tr key={article._id}>
                    <td className="px-6 py-4 whitespace-nowrap">{article.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{article.author.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(article.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        article.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {article.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewArticle(article._id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEditArticle(article._id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteArticle(article._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No articles found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: number
  icon: React.ReactNode
  color: string
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`${color} rounded-full p-3 mr-4`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  )
} 