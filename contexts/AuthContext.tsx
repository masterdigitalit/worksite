'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

import { jwtAuthService, User, AuthResponse } from 'lib/jwt-auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<AuthResponse>;
  register: (userData: any) => Promise<AuthResponse>;
  logout: () => void;
  isAuthenticated: boolean;
  checkAndRefreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Функция для проверки и обновления токена
  const checkAndRefreshToken = useCallback(async (): Promise<boolean> => {
    // Если уже в процессе обновления, ждем
    if (isRefreshing) {
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (!isRefreshing) {
            clearInterval(checkInterval);
            resolve(true);
          }
        }, 100);
      });
    }

    const token = jwtAuthService.getAccessToken();
    if (!token) {
      return false;
    }

    try {
      // Пробуем получить профиль - если токен валиден, все ок
      const userProfile = await jwtAuthService.getProfile();
      setUser(userProfile);
      jwtAuthService.setUser(userProfile);
      return true;
    } catch (error: any) {
      // Если токен невалиден (401 или ошибка токена), пробуем обновить
      if (error.message.includes('401') || error.message.includes('token') || error.message.includes('authentication')) {
        console.log('Access token expired, attempting refresh...');
        
        setIsRefreshing(true);
        try {
          // Обновляем access token
          await jwtAuthService.refreshToken();
          
          // Получаем профиль с новым токеном
          const userProfile = await jwtAuthService.getProfile();
          setUser(userProfile);
          jwtAuthService.setUser(userProfile);
          
          console.log('Token refreshed successfully');
          return true;
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          // Если refresh не удался - разлогиниваем
          logout();
          return false;
        } finally {
          setIsRefreshing(false);
        }
      } else {
        // Другие ошибки (network, server errors)
        console.error('Auth check failed:', error);
        return false;
      }
    }
  }, [isRefreshing]);

  // Инициализация авторизации при загрузке
  const initializeAuth = useCallback(async () => {
    try {
      const token = jwtAuthService.getAccessToken();
      const savedUser = jwtAuthService.getUser();

      if (token && savedUser) {
        // Проверяем валидность токена
        const isValid = await checkAndRefreshToken();
        if (!isValid) {
          jwtAuthService.logout();
        }
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      jwtAuthService.logout();
    } finally {
      setLoading(false);
    }
  }, [checkAndRefreshToken]);

  // Периодическая проверка токена (каждые 10 минут)
  useEffect(() => {
    const interval = setInterval(async () => {
      if (jwtAuthService.isAuthenticated() && !isRefreshing) {
        await checkAndRefreshToken();
      }
    }, 10 * 60 * 1000); // 10 минут

    return () => clearInterval(interval);
  }, [checkAndRefreshToken, isRefreshing]);

  // Проверка при фокусе окна (когда пользователь возвращается к вкладке)
  useEffect(() => {
    const handleFocus = async () => {
      if (jwtAuthService.isAuthenticated() && !isRefreshing) {
        await checkAndRefreshToken();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [checkAndRefreshToken, isRefreshing]);

  // Инициализация при монтировании
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = async (username: string, password: string): Promise<AuthResponse> => {
    setLoading(true);
    try {
      const data = await jwtAuthService.login(username, password);
      setUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any): Promise<AuthResponse> => {
    setLoading(true);
    try {
      const data = await jwtAuthService.register(userData);
      setUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    jwtAuthService.logout();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading: loading || isRefreshing,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    checkAndRefreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}