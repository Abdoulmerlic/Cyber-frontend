import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { adminService } from '../services/api'

interface User {
  id: string
  email: string
  name: string
  avatar?: string
  isAdmin: boolean
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      if (!token) {
        setIsLoading(false)
        return
      }

      const response = await api.get('/api/auth/me')
      const userData = response.data
      
      if (!userData.isAdmin) {
        throw new Error('Access denied. Admin privileges required.')
      }

      setUser(userData)
      setIsAuthenticated(true)
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('admin_token')
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const { token, user } = await adminService.login(email, password)
      
      if (!user.isAdmin) {
        throw new Error('Access denied. Admin privileges required.')
      }

      localStorage.setItem('admin_token', token)
      setUser(user)
      setIsAuthenticated(true)
      // Force reload to re-initialize auth state and show loader/dashboard
      window.location.href = '/admin/'
      return true
    } catch (error: any) {
      console.error('Login failed:', error)
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      } else if (error.message === 'Network Error') {
        throw new Error('Unable to connect to the server. Please check your internet connection.')
      } else if (error.response?.status === 404) {
        throw new Error('Login endpoint not found. Please contact support.')
      } else if (error.response?.status === 401) {
        throw new Error('Invalid email or password.')
      } else {
        throw new Error('An unexpected error occurred. Please try again later.')
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('admin_token')
    setUser(null)
    setIsAuthenticated(false)
    window.location.href = '/admin/login'
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  }
} 