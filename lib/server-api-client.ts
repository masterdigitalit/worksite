import { cookies } from 'next/headers';

const API_BASE_URL = 'http://localhost:8000';

class ServerApiClient {
  private async getAuthHeaders() {
    const cookieStore = cookies();
    const accessToken = cookieStore.get('access_token')?.value;
    
    if (!accessToken) {
      throw new Error('No authentication token');
    }

    return {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  // Функция для получения пользователя из cookies
  async getCurrentUser() {
    const cookieStore = cookies();
    const userData = cookieStore.get('user_data')?.value;
    
    if (!userData) {
      return null;
    }

    try {
      return JSON.parse(userData);
    } catch (error) {
      return null;
    }
  }

  async get(url: string) {
    const headers = await this.getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication failed');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async post(url: string, data: any) {
    const headers = await this.getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

export const serverApiClient = new ServerApiClient();