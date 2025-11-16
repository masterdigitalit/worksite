// lib/s3-service.ts
import { jwtAuthService } from './jwt-auth';

const isProduction = process.env.NEXT_PUBLIC_MODE  === 'production';

export const API_BASE_URL = isProduction 
  ? process.env.NEXT_PUBLIC_API
  : 'http://localhost:8000';




export const MINIO_URL = isProduction 
  ? process.env.NEXT_PUBLIC_API
  : 'http://localhost:9000';


interface OrderDocument {
  id: number;
  name: string;
  file_url: string;
  file_key?: string;
  file_name?: string;
  file_size?: string;
  uploaded_at: string;
}

interface UploadResponse {
  id: number;
  name: string;
  file_url: string;
  file_key?: string;
  file_name?: string;
  file_size?: string;
  uploaded_at: string;
}

class S3Service {
  private baseUrl = '/api/v1';

  /**
   * Универсальный метод для выполнения запросов с JWT авторизацией
   */
  private async requestWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    let accessToken = jwtAuthService.getAccessToken();
    
    if (!accessToken) {
      throw new Error('No authentication token');
    }

    // ФИКС: Собираем полный URL правильно
    const fullUrl = `${API_BASE_URL}${url}`;

    console.log('S3Service Request:', fullUrl, options.method); // Для отладки

    // Первый запрос с текущим токеном
    let response = await fetch(fullUrl, {
      ...options,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        ...options.headers,
      },
    });

    // Если токен истек (401 ошибка), пробуем обновить
    if (response.status === 401) {
      try {
        // Обновляем access token
        accessToken = await jwtAuthService.refreshToken();
        
        // Повторяем запрос с новым токеном
        response = await fetch(fullUrl, {
          ...options,
          headers: {
            'Authorization': `Bearer ${accessToken}`,
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

  // ========== МЕТОДЫ ДЛЯ ОБЫЧНЫХ ЗАКАЗОВ ==========

  /**
   * Загружает документ для заказа
   */
  async uploadDocument(orderId: number, file: File, name?: string): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (name) {
      formData.append('name', name);
    }

    const response = await this.requestWithAuth(
      `${this.baseUrl}/orders/${orderId}/upload-document/`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Document upload failed: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  /**
   * Загружает фото для заказа (специализированный метод)
   */
  async uploadPhoto(orderId: number, file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('photo', file);

    const response = await this.requestWithAuth(
      `${this.baseUrl}/orders/${orderId}/upload-photo/`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Photo upload failed: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  /**
   * Получает все документы заказа
   */
  async getOrderDocuments(orderId: number): Promise<OrderDocument[]> {
    const response = await this.requestWithAuth(
      `${this.baseUrl}/orders/${orderId}/documents/`
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Get documents failed: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  /**
   * Удаляет документ заказа
   */
  async deleteOrderDocument(orderId: number, documentId: number): Promise<void> {
    const response = await this.requestWithAuth(
      `${this.baseUrl}/orders/${orderId}/documents/${documentId}/delete/`,
      {
        method: 'DELETE',
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Delete document failed: ${response.status} - ${errorText}`);
    }
  }

  // ========== МЕТОДЫ ДЛЯ ЗАКАЗОВ ЛИСТОВОК ==========

  /**
   * Загружает документ для заказа листовок
   */
  async uploadLeafletOrderDocument(orderId: number, file: File, name?: string): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (name) {
      formData.append('name', name);
    }

    const response = await this.requestWithAuth(
      `${this.baseUrl}/leaflet-orders/${orderId}/upload-document/`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Leaflet order document upload failed: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  /**
   * Загружает фото для заказа листовок
   */
  async uploadLeafletOrderPhoto(orderId: number, file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('photo', file);

    const response = await this.requestWithAuth(
      `${this.baseUrl}/leaflet-orders/${orderId}/upload-photo/`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Leaflet order photo upload failed: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  /**
   * Загружает фото оплаты для заказа листовок
   */
  async uploadLeafletOrderPaymentPhoto(orderId: number, file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('photo', file);

    const response = await this.requestWithAuth(
      `${this.baseUrl}/leaflet-orders/${orderId}/upload-payment-photo/`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Payment photo upload failed: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  /**
   * Получает все документы заказа листовок
   */
  async getLeafletOrderDocuments(orderId: number): Promise<OrderDocument[]> {
    const response = await this.requestWithAuth(
      `${this.baseUrl}/leaflet-orders/${orderId}/documents/`
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Get leaflet order documents failed: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  /**
   * Удаляет документ заказа листовок
   */
  async deleteLeafletOrderDocument(orderId: number, documentId: number): Promise<void> {
    const response = await this.requestWithAuth(
      `${this.baseUrl}/leaflet-orders/${orderId}/documents/${documentId}/delete/`,
      {
        method: 'DELETE',
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Delete leaflet order document failed: ${response.status} - ${errorText}`);
    }
  }

  // ========== УНИВЕРСАЛЬНЫЕ МЕТОДЫ ==========

  /**
   * Универсальный метод загрузки для обычных заказов
   */
  async uploadFile(orderId: number, file: File, customName?: string): Promise<UploadResponse> {
    const isImage = file.type.startsWith('image/');
    
    if (isImage) {
      return this.uploadPhoto(orderId, file);
    } else {
      return this.uploadDocument(orderId, file, customName || file.name);
    }
  }

  /**
   * Универсальный метод загрузки для заказов листовок
   */
  async uploadLeafletOrderFile(orderId: number, file: File, customName?: string): Promise<UploadResponse> {
    const isImage = file.type.startsWith('image/');
    
    if (isImage) {
      return this.uploadLeafletOrderPhoto(orderId, file);
    } else {
      return this.uploadLeafletOrderDocument(orderId, file, customName || file.name);
    }
  }

  /**
   * Загружает несколько файлов для обычных заказов
   */
  async uploadMultipleFiles(orderId: number, files: File[]): Promise<UploadResponse[]> {
    const uploadPromises = files.map(file => this.uploadFile(orderId, file));
    return Promise.all(uploadPromises);
  }

  /**
   * Загружает несколько файлов для заказов листовок
   */
  async uploadMultipleLeafletOrderFiles(orderId: number, files: File[]): Promise<UploadResponse[]> {
    const uploadPromises = files.map(file => this.uploadLeafletOrderFile(orderId, file));
    return Promise.all(uploadPromises);
  }

  /**
   * Получает URL для прямого доступа к файлу в MinIO
   */
  getFileUrl(fileKeyOrUrl: string): string {
    // Если это уже полный URL, возвращаем как есть
    if (fileKeyOrUrl.startsWith('http')) {
      return fileKeyOrUrl;
    }
    
    // Если это ключ файла (например: 'photos/order_documents/...')
    if (fileKeyOrUrl.startsWith('photos/')) {
      return `${MINIO_URL}/${fileKeyOrUrl}`;
    }
    
    // Для других случаев
    return `${MINIO_URL}/photos/${fileKeyOrUrl}`;
  }







async uploadDistributorDocument(distributorId: number, file: File, name?: string): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  if (name) {
  formData.append('photo', file); 
  }

  const response = await this.requestWithAuth(
    `${this.baseUrl}/distributors/${distributorId}/photos/upload/`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Distributor document upload failed: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Получает все документы распространителя
 */
async getDistributorDocuments(distributorId: number): Promise<OrderDocument[]> {
  const response = await this.requestWithAuth(
    `${this.baseUrl}/distributors/${distributorId}/photos/`
  );
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Get distributor documents failed: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Удаляет документ распространителя
 */
async deleteDistributorDocument(distributorId: number, documentId: number): Promise<void> {
  const response = await this.requestWithAuth(
    `${this.baseUrl}/distributors/${distributorId}/photos/${documentId}/delete/`,
    {
      method: 'DELETE',
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Delete distributor document failed: ${response.status} - ${errorText}`);
  }
}


// В lib/s3-service.ts, добавьте эти методы:

// ========== МЕТОДЫ ДЛЯ ФОТО РАСПРОСТРАНИТЕЛЕЙ ==========

/**
 * Загружает фото для распространителя
 */
async uploadDistributorPhoto(distributorId: number, file: File, name?: string): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('photo', file);
  if (name) {
    formData.append('name', name);
  }

  const response = await this.requestWithAuth(
    `${this.baseUrl}/distributors/${distributorId}/photos/upload/`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Distributor photo upload failed: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Получает все фото распространителя
 */
async getDistributorPhotos(distributorId: number): Promise<OrderDocument[]> {
  const response = await this.requestWithAuth(
    `${this.baseUrl}/distributors/${distributorId}/photos/`
  );
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Get distributor photos failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.photos || [];
}

/**
 * Удаляет фото распространителя
 */
async deleteDistributorPhoto(distributorId: number, photoId: number): Promise<void> {
  const response = await this.requestWithAuth(
    `${this.baseUrl}/distributors/${distributorId}/photos/${photoId}/`,
    {
      method: 'DELETE',
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Delete distributor photo failed: ${response.status} - ${errorText}`);
  }
}

/**
 * Устанавливает фото как основное
 */
async setMainDistributorPhoto(distributorId: number, photoId: number): Promise<void> {
  const response = await this.requestWithAuth(
    `${this.baseUrl}/distributors/${distributorId}/photos/${photoId}/set-main/`,
    {
      method: 'POST',
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Set main distributor photo failed: ${response.status} - ${errorText}`);
  }
}




}

export const s3Service = new S3Service();