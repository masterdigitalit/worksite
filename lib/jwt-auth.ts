const isProduction = process.env.NEXT_PUBLIC_MODE === 'production';
console.log(process.env.NEXT_PUBLIC_MODE)
export const API_BASE_URL = isProduction 
  ? process.env.NEXT_PUBLIC_API
  : 'http://localhost:8000';

export interface User {
  id: string;
  username: string;
  role: string;
  fullName?: string;
  telegramUsername?: string;
  phone?: string;
  visibility: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  tokens?: {
    access: string;
    refresh: string;
  };
}

class JwtAuthService  {
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Добавляем credentials для cookies
    const config = {
      credentials: 'include' as RequestCredentials, // Важно для сессий!
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async login(username: string, password: string): Promise<AuthResponse> {
    const data = await this.request('/api/v1/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    // Сохраняем пользователя в localStorage для фронтенда
    this.setUser(data.user);
    
    // Для JWT сохраняем токены (если используешь)
    if (data.tokens) {
      this.setTokens(data.tokens);
    }

    return data;
  }

  async register(userData: {
    username: string;
    password: string;
    password_confirm: string;
    role: string;
    fullName?: string;
    telegramUsername?: string;
    phone?: string;
    visibility?: string;
  }): Promise<AuthResponse> {
    const data = await this.request('/api/v1/auth/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    this.setUser(data.user);
    
    if (data.tokens) {
      this.setTokens(data.tokens);
    }

    return data;
  }

  async getProfile(): Promise<User> {
    return await this.request('/api/v1/auth/profile/', {
      method: 'GET',
    });
  }

  async checkAuth(): Promise<boolean> {
    try {
      await this.getProfile();
      return true;
    } catch (error) {
      return false;
    }
  }

  // Методы для работы с пользователем
  setUser(user: User) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  getUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }

  // Методы для JWT (если используешь)
  setTokens(tokens: { access: string; refresh: string }) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
    }
  }

  getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }

    // Делаем запрос на logout для очистки сессии
    fetch(`${API_BASE_URL}/api/v1/auth/logout/`, {
      method: 'POST',
      credentials: 'include',
    }).finally(() => {
      window.location.href = '/login';
    });
  }

  isAuthenticated(): boolean {
    // Проверяем наличие пользователя в localStorage
    return !!this.getUser();
  }
}
export const jwtAuthService = new JwtAuthService();