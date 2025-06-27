import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL

export const api = axios.create({
  baseURL,
  withCredentials: true,
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
    const response = await api.get('/api/users/admin/stats')
    return response.data
  },
  getUsers: async (page = 1, limit = 10) => {
    const response = await api.get('/api/users', {
      params: { page, limit }
    })
    return response.data
  },
  getArticles: async (page = 1, limit = 10) => {
    const response = await api.get('/api/articles', {
      params: { page, limit }
    })
    return response.data
  },
  deleteUser: async (userId: string) => {
    const response = await api.delete(`/api/users/${userId}`)
    return response.data
  },
  deleteArticle: async (articleId: string) => {
    const response = await api.delete(`/api/articles/${articleId}`)
    return response.data
  },
  freezeUser: async (userId: string) => {
    const response = await api.put(`/api/users/${userId}/freeze`)
    return response.data
  },
  unfreezeUser: async (userId: string) => {
    const response = await api.put(`/api/users/${userId}/unfreeze`)
    return response.data
  }
} 