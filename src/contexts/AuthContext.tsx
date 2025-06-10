import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { AxiosError } from 'axios';

interface User {
  id: string;
  _id: string;
  username: string;
  email: string;
  profilePicture?: string;
  bio?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Function to update last active timestamp
  const updateLastActive = () => {
    if (token) {
      localStorage.setItem('lastActive', Date.now().toString());
    }
  };

  // Function to check if session is expired
  const checkSessionExpiry = () => {
    const lastActive = localStorage.getItem('lastActive');
    if (lastActive) {
      const timeSinceLastActive = Date.now() - parseInt(lastActive);
      if (timeSinceLastActive > INACTIVITY_TIMEOUT) {
        logout();
      }
    }
  };

  // Add event listeners for user activity
  useEffect(() => {
    if (token) {
      const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
      const handleActivity = () => updateLastActive();

      activityEvents.forEach(event => {
        window.addEventListener(event, handleActivity);
      });

      // Check session expiry every minute
      const expiryCheckInterval = setInterval(checkSessionExpiry, 60000);

      return () => {
        activityEvents.forEach(event => {
          window.removeEventListener(event, handleActivity);
        });
        clearInterval(expiryCheckInterval);
      };
    }
  }, [token]);

  // Load persisted auth state on mount
  useEffect(() => {
    const loadPersistedAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        const lastActive = localStorage.getItem('lastActive');
        
        if (storedToken && storedUser) {
          // Check if session is expired
          if (lastActive) {
            const timeSinceLastActive = Date.now() - parseInt(lastActive);
            if (timeSinceLastActive > INACTIVITY_TIMEOUT) {
              throw new Error('Session expired');
            }
          }

          // Set the token in state and API instance
          setToken(storedToken);
          const parsedUser = JSON.parse(storedUser);
          setUser({ ...parsedUser, _id: parsedUser._id || parsedUser.id });
          
          // Verify the token is still valid
          try {
            await api.auth.getCurrentUser();
            // Update last active timestamp
            updateLastActive();
          } catch (error) {
            throw new Error('Token verification failed');
          }
        }
      } catch (error) {
        // Clear invalid or expired data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('lastActive');
        setToken(null);
        setUser(null);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    loadPersistedAuth();
  }, [navigate]);

  const login = (userData: User, authToken: string) => {
    setIsLoading(true);
    try {
      // Ensure _id is set for compatibility
      const userWithId = { ...userData, _id: userData._id || userData.id };
      setUser(userWithId);
      setToken(authToken);
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(userWithId));
      updateLastActive();
      navigate('/', { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.auth.register({ username, email, password });
      const { token, user } = response.data;
      login(user, token);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string; errors: string[] }>;
      if (axiosError.response?.data?.errors) {
        throw new Error(axiosError.response.data.errors[0]);
      }
      throw new Error(axiosError.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.auth.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear stored data regardless of logout API success
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('lastActive');
      setUser(null);
      setToken(null);
      navigate('/login');
      setIsLoading(false);
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    loading,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
