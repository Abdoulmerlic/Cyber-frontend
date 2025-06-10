import axios, { AxiosInstance, AxiosError } from "axios";

const API_URL = "https://cyber-backend-h10y8ier6-abdoulmerlics-projects.vercel.app/api";

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  withCredentials: true // Enable credentials for CORS
});

// Add request interceptor to add token to headers
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle token expiration
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const response = await axiosInstance.post('/auth/refresh-token');
        const { token } = response.data;
        localStorage.setItem('token', token);
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('lastActive');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export interface SecurityTip {
  _id: string;
  content: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface Article {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    username: string;
  };
  category: string;
  tags: string[];
  readTime: number;
  imageUrl?: string;
  videoUrl?: string;
  likes: string[];
  views: number;
  comments: {
    _id: string;
    user: {
      _id: string;
      username: string;
    };
    content: string;
    createdAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface ArticleResponse {
  articles: Article[];
  total: number;
  currentPage: number;
  totalPages: number;
}

// Create a type-safe API object
export const api = {
  articles: {
    getAll: async (params?: { category?: string; tag?: string; search?: string; page?: number; limit?: number }) => {
      const response = await axiosInstance.get('/articles', { params });
      return response.data;
    },
    getById: async (id: string) => {
      const response = await axiosInstance.get(`/articles/${id}`);
      return response.data;
    },
    create: async (formData: FormData) => {
      const response = await axiosInstance.post('/articles', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    update: async (id: string, formData: FormData) => {
      const response = await axiosInstance.put(`/articles/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    delete: async (id: string) => {
      const response = await axiosInstance.delete(`/articles/${id}`);
      return response.data;
    },
    like: async (id: string) => {
      const response = await axiosInstance.post(`/articles/${id}/like`);
      return response.data;
    },
    addComment: async (id: string, data: { content: string }) => {
      const response = await axiosInstance.post(`/articles/${id}/comments`, data);
      return response.data;
    },
    deleteComment: async (articleId: string, commentId: string) => {
      const response = await axiosInstance.delete(`/articles/${articleId}/comments/${commentId}`);
      return response.data;
    }
  },
  securityTips: {
    getAll: async (): Promise<SecurityTip[]> => {
      const response = await axiosInstance.get('/security-tips');
      return response.data;
    },
    getById: async (id: string): Promise<SecurityTip> => {
      const response = await axiosInstance.get(`/security-tips/${id}`);
      return response.data;
    },
    getRandom: async (): Promise<SecurityTip> => {
      const response = await axiosInstance.get('/security-tips/random');
      return response.data;
    }
  },
  bookmarks: {
    getAll: async (): Promise<Article[]> => {
      const response = await axiosInstance.get('/bookmarks');
      return response.data;
    },
    add: async (articleId: string): Promise<void> => {
      await axiosInstance.post(`/bookmarks/${articleId}`);
    },
    remove: async (articleId: string): Promise<void> => {
      await axiosInstance.delete(`/bookmarks/${articleId}`);
    },
    isBookmarked: async (articleId: string): Promise<boolean> => {
      try {
        await axiosInstance.get(`/bookmarks/${articleId}`);
        return true;
      } catch (error) {
        return false;
      }
    }
  },
  auth: {
    login: async (credentials: { email: string; password: string }) => {
      try {
        console.log('Attempting login to:', `${API_URL}/auth/login`);
        const response = await axiosInstance.post('/auth/login', credentials);
        console.log('Login response:', response.data);
        return response.data;
      } catch (error) {
        if (error instanceof AxiosError) {
          console.error('Login error:', error.response?.data || error.message);
        } else {
          console.error('Login error:', error);
        }
        throw error;
      }
    },
    register: async (userData: { 
      email: string; 
      password: string; 
      username: string;
    }) => {
      const response = await axiosInstance.post('/auth/register', userData);
      return response.data;
    },
    logout: async () => {
      const response = await axiosInstance.post('/auth/logout');
      return response.data;
    },
    getCurrentUser: async () => {
      const response = await axiosInstance.get('/auth/me');
      return response.data;
    },
    refreshToken: async () => {
      const response = await axiosInstance.post('/auth/refresh-token');
      return response.data;
    },
    updateProfile: async (profileData: {
      username: string;
      email: string;
      bio?: string;
      profilePicture?: string;
    }) => {
      const response = await axiosInstance.put('/auth/profile', profileData);
      return response.data;
    },
    changePassword: async (passwordData: {
      currentPassword: string;
      newPassword: string;
    }) => {
      const response = await axiosInstance.put('/auth/change-password', passwordData);
      return response.data;
    },
    deleteAccount: async () => {
      const response = await axiosInstance.delete('/auth/account');
      return response.data;
    }
  }
};
