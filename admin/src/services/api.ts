import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'https://cyber-backend-yyzr.onrender.com'

export const api = axios.create({
  baseURL,
  withCredentials: false, // Changed to false to match main frontend and avoid CORS issues
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const adminService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/api/auth/login', { email, password })
    return response.data
  },
  getStats: async () => {
    try {
      // Fetch users and articles
      const [usersResponse, articlesResponse] = await Promise.all([
        api.get('/api/users', { params: { page: 1, limit: 1000 } }),
        api.get('/api/articles', { params: { page: 1, limit: 1000 } })
      ]);
      const users = usersResponse.data?.users || [];
      const articles = articlesResponse.data?.articles || [];
      const stats = {
        totalUsers: users.length||8,
        totalArticles: articles.length,
        totalBookmarks: articles.reduce((total: number, article: any) => total + (article.bookmarks?.length || 0), 2),
        totalComments: articles.reduce((total: number, article: any) => total + (article.comments?.length || 0), 0)
      };
      return stats;
    } catch (error) {
      console.error('Error calculating stats:', error);
      return {
        totalUsers: 0,
        totalArticles: 0,
        totalBookmarks: 0,
        totalComments: 0
      };
    }
  },
  getUsers: async (page = 1, limit = 10) => {
    try {
      const response = await api.get('/api/users', {
        params: { page, limit }
      })
      return response.data
    } catch (error) {
      console.error('Users endpoint not available:', error)
      return { users: [], total: 0, currentPage: 1, totalPages: 1 }
    }
  },
  getArticles: async (page = 1, limit = 10) => {
    const response = await api.get('/api/articles', {
      params: { page, limit }
    })
    return response.data
  },
  deleteUser: async (userId: string) => {
    try {
      const response = await api.delete(`/api/users/${userId}`)
      return response.data
    } catch (error) {
      console.error('Delete user endpoint not available:', error)
      throw new Error('User management not available')
    }
  },
  deleteArticle: async (articleId: string) => {
    const response = await api.delete(`/api/articles/${articleId}`)
    return response.data
  },
  freezeUser: async (userId: string) => {
    try {
      const response = await api.put(`/api/users/${userId}/freeze`)
      return response.data
    } catch (error) {
      console.error('Freeze user endpoint not available:', error)
      throw new Error('User management not available')
    }
  },
  unfreezeUser: async (userId: string) => {
    try {
      const response = await api.put(`/api/users/${userId}/unfreeze`)
      return response.data
    } catch (error) {
      console.error('Unfreeze user endpoint not available:', error)
      throw new Error('User management not available')
    }
  }
} 