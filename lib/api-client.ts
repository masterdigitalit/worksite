import { jwtAuthService } from './jwt-auth';
const isProduction = process.env.NEXT_PUBLIC_MODE  === 'production';

export const API_BASE_URL = isProduction 
  ?  'https://tamsyam.su'
  : 'http://localhost:8000';

class ApiClient {
    private async getWhoDid(): Promise<string> {
        try {
            const userData = await jwtAuthService.getProfile();
            return userData?.username || 'unknown';
        } catch (error) {
            console.error('Error getting user profile:', error);
            return 'unknown';
        }
    }

    private shouldAddWhoDid(url: string, method: string): boolean {
        // Добавляем whoDid для операций с заказами, работниками и другими важными действиями
        const orderEndpoints = [
            '/orders/', '/order/',
            '/decline/', '/complete/', '/status/',
            '/set-pending-to-on-the-way/', '/set-on-the-way-to-in-progress/',
            '/set-progress-sd/'
        ];
        
        const workerEndpoints = [
            '/workers/', '/worker/'
        ];
        
        const isOrderOperation = orderEndpoints.some(endpoint => url.includes(endpoint));
        const isWorkerOperation = workerEndpoints.some(endpoint => url.includes(endpoint));
        
        return (isOrderOperation || isWorkerOperation) && 
               (method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE');
    }

    private async enhanceDataWithWhoDid(url: string, method: string, data: any): Promise<any> {
        if (this.shouldAddWhoDid(url, method)) {
            const whoDid = await this.getWhoDid();
            return {
                ...data,
                whoDid: whoDid
            };
        }
        return data;
    }

    private async requestWithAuthRetry(url: string, options: RequestInit = {}): Promise<Response> {
        let accessToken = jwtAuthService.getAccessToken();
        
        if (!accessToken) {
            throw new Error('No authentication token');
        }

        // Первый запрос с текущим токеном
        let response = await fetch(API_BASE_URL + url, {
            ...options,
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        // Если токен истек (401 ошибка), пробуем обновить
        if (response.status === 401) {
            try {
                // Обновляем access token
                accessToken = await jwtAuthService.refreshToken();
                
                // Повторяем запрос с новым токеном
                response = await fetch(API_BASE_URL + url, {
                    ...options,
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                        ...options.headers,
                    },
                });
            } catch (refreshError) {
                // Если refresh не удался - разлогиниваем
                jwtAuthService.logout();
                window.location.href = '/login';
                throw new Error('Session expired. Please login again.');
            }
        }

        return response;
    }

    async get<T = any>(url: string, options: RequestInit = {}): Promise<T> {
        const response = await this.requestWithAuthRetry(url, {
            ...options,
            method: 'GET',
        });
        return response.json();
    }

    async post<T = any>(url: string, data: any, options: RequestInit = {}): Promise<T> {
        const enhancedData = await this.enhanceDataWithWhoDid(url, 'POST', data);
        
        const response = await this.requestWithAuthRetry(url, {
            ...options,
            method: 'POST',
            body: JSON.stringify(enhancedData),
        });
        return response.json();
    }

    async put<T = any>(url: string, data: any, options: RequestInit = {}): Promise<T> {
        const enhancedData = await this.enhanceDataWithWhoDid(url, 'PUT', data);
        
        const response = await this.requestWithAuthRetry(url, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(enhancedData),
        });
        return response.json();
    }

    async patch<T = any>(url: string, data: any, options: RequestInit = {}): Promise<T> {
        const enhancedData = await this.enhanceDataWithWhoDid(url, 'PATCH', data);
        
        const response = await this.requestWithAuthRetry(url, {
            ...options,
            method: 'PATCH',
            body: JSON.stringify(enhancedData),
        });
        return response.json();
    }

    async delete<T = any>(url: string, options: RequestInit = {}): Promise<T> {
        // Для DELETE запросов передаем whoDid в body если нужно
        let body = undefined;
        if (this.shouldAddWhoDid(url, 'DELETE')) {
            const whoDid = await this.getWhoDid();
            body = JSON.stringify({ whoDid });
        }
        
        const response = await this.requestWithAuthRetry(url, {
            ...options,
            method: 'DELETE',
            body: body,
        });
        return response.json();
    }

    // Специальные методы для частых операций
    async completeOrder<T = any>(orderId: number, data: any): Promise<T> {
        return this.patch(`/api/v1/orders/${orderId}/complete/`, data);
    }

    async declineOrder<T = any>(orderId: number): Promise<T> {
        return this.patch(`/api/v1/orders/${orderId}/decline/`, {});
    }

    async updateOrderStatus<T = any>(orderId: number, status: string, additionalData: any = {}): Promise<T> {
        return this.patch(`/api/v1/orders/${orderId}/`, {
            status,
            ...additionalData
        });
    }
}

export const apiClient = new ApiClient();