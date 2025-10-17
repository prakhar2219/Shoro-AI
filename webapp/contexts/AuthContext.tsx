'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
  _id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'editor' | 'user';
  active: boolean;
  lastLogin?: Date;
  profileImage?: string;
  phoneNumber?: string;
  department?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
  hasRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedToken = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          setAccessToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Verify token is still valid by fetching current user
          await fetchCurrentUser(storedToken);
        }
      } catch (error) {
        console.error('Error loading user:', error);
        // Clear invalid data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const fetchCurrentUser = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }

      const data = await response.json();
      setUser(data.data.user);
      localStorage.setItem('user', JSON.stringify(data.data.user));
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  };

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      const { user: userData, accessToken: token } = data.data || data;

      setUser(userData);
      setAccessToken(token);

      // Store in localStorage
      localStorage.setItem('accessToken', token);
      localStorage.setItem('user', JSON.stringify(userData));

      // Redirect based on role
      if (userData.role === 'super_admin' || userData.role === 'admin' || userData.role === 'editor') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  }, [API_BASE_URL, router]);

  const signup = useCallback(async (email: string, password: string, name: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      const { user: userData, accessToken: token } = data.data || data;

      setUser(userData);
      setAccessToken(token);

      // Store in localStorage
      localStorage.setItem('accessToken', token);
      localStorage.setItem('user', JSON.stringify(userData));

      router.push('/');
    } catch (error: any) {
      console.error('Signup error:', error);
      throw error;
    }
  }, [API_BASE_URL, router]);

  const logout = useCallback(async () => {
    try {
      // Call logout endpoint to clear server session
      if (accessToken) {
        await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      router.push('/login');
    }
  }, [API_BASE_URL, accessToken, router]);

  const updateUser = useCallback(async (data: Partial<User>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/users/updateMe`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Update failed');
      }

      const updatedUser = result.data.user;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error: any) {
      console.error('Update user error:', error);
      throw error;
    }
  }, [API_BASE_URL, accessToken]);

  const hasRole = useCallback((roles: string[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  }, [user]);

  const value = {
    user,
    accessToken,
    loading,
    login,
    signup,
    logout,
    updateUser,
    isAuthenticated: !!user,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
