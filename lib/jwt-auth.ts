const isProduction = process.env.NEXT_PUBLIC_MODE === 'production';
console.log(process.env.NEXT_PUBLIC_MODE )
export const API_BASE_URL = isProduction 
  ?  'https://tamsyam.su'
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
  tokens: {
    access: string;
    refresh: string;
  };
}

class JwtAuthService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
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

    // Сохраняем токены в localStorage И cookies
    this.setTokens(data.tokens);
    this.setUser(data.user);

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

    this.setTokens(data.tokens);
    this.setUser(data.user);

    return data;
  }

  async refreshToken(): Promise<string> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const data = await this.request('/api/v1/auth/token/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh: refreshToken }),
    });

    // Обновляем access token
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', data.access);
    }
    this.setCookie('access_token', data.access, 1); // 1 hour

    return data.access;
  }

  async getProfile(): Promise<User> {
    const token = this.getAccessToken();
    
    if (!token) {
      throw new Error('No authentication token');
    }

    return await this.request('/api/v1/auth/profile/', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  // Методы для работы с токенами
  setTokens(tokens: { access: string; refresh: string }) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      localStorage.setItem('user', JSON.stringify(tokens.user));
    }
    
    // Сохраняем в cookies для серверных компонентов
    this.setCookie('access_token', tokens.access, 1); // 1 hour
    this.setCookie('refresh_token', tokens.refresh, 7 * 24); // 7 days
    this.setCookie('user_data', JSON.stringify(tokens.user), 7 * 24); // 7 days
  }

  getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refresh_token');
    }
    return null;
  }

  setUser(user: User) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
    this.setCookie('user_data', JSON.stringify(user), 7 * 24);
  }

  getUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }

    
    // Удаляем cookies
    this.deleteCookie('access_token');
    this.deleteCookie('refresh_token');
    this.deleteCookie('user_data');
    window.location.reload();
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  // Вспомогательные методы для работы с cookies
  private setCookie(name: string, value: string, hours: number) {
    if (typeof document !== 'undefined') {
      const expires = new Date();
      expires.setTime(expires.getTime() + hours * 60 * 60 * 1000);
      document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
    }
  }

  private deleteCookie(name: string) {
    if (typeof document !== 'undefined') {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    }
  }
}

export const jwtAuthService = new JwtAuthService();