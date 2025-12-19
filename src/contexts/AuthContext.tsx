import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { apiService } from '../services/api';

export interface User {
  id: string;
  email: string;
  name: string;
  userType: 'brand' | 'influencer';
  avatar?: string;
  isEmailVerified: boolean;
  profile?: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, userType: 'brand' | 'influencer', avatar?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'stratix_token';
const USER_KEY = 'stratix_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from storage on mount
  useEffect(() => {
    const storedToken = sessionStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        // Verify token is still valid by fetching current user
        refreshUser().catch(() => {
          // If refresh fails, clear storage
          logout();
        });
      } catch (error) {
        logout();
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await apiService.post<{ user: User; token: string }>('/auth/login', {
        email,
        password,
      });

      if (response.success && response.data) {
        const { user: userData, token: authToken } = response.data;
        setUser(userData);
        setToken(authToken);
        sessionStorage.setItem(TOKEN_KEY, authToken);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      throw new Error(errorMessage);
    }
  };

  const signup = async (
    email: string,
    password: string,
    name: string,
    userType: 'brand' | 'influencer',
    avatar?: string
  ): Promise<void> => {
    try {
      const response = await apiService.post<{ user: User; token: string }>('/auth/signup', {
        email,
        password,
        name,
        userType,
        avatar,
      });

      if (response.success && response.data) {
        const { user: userData, token: authToken } = response.data;
        setUser(userData);
        setToken(authToken);
        sessionStorage.setItem(TOKEN_KEY, authToken);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
      } else {
        throw new Error(response.message || 'Signup failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Signup failed';
      throw new Error(errorMessage);
    }
  };

  const logout = (): void => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    // Redirect to login page
    window.location.href = '/login';
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const response = await apiService.get<{ user: User }>('/auth/me');
      if (response.success && response.data) {
        const userData = response.data.user;
        setUser(userData);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
      }
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    signup,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

