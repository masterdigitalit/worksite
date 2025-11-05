"use client";

import { useEffect, useState, useCallback } from "react";
import { apiClient } from "lib/api-client";

interface Log {
  id: string;
  whoDid: string | null;
  whatHappend: string | null;
  type: 'workers' | 'orders' | 'leaflets' | 'cities' | 'system'| 'distributors';
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Log[];
}

// Хук для debounce
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    type: '',
    search: '',
    days: ''
  });
  
  // Debounce для поиска (500ms задержка)
  const debouncedSearch = useDebounce(filters.search, 500);
  
  // Пагинация
  const [pagination, setPagination] = useState({
    count: 0,
    next: null as string | null,
    previous: null as string | null,
    page: 1,
    pageSize: 20
  });

  // Загрузка логов с учетом фильтров и пагинации
  const loadLogs = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      
      // Параметры фильтрации
      if (filters.type) params.append('type', filters.type);
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (filters.days) params.append('days', filters.days);
      
      // Параметры пагинации
      params.append('page', page.toString());
      params.append('page_size', pagination.pageSize.toString());
      
      const queryString = params.toString();
      const url = queryString ? `/api/v1/logs/?${queryString}` : '/api/v1/logs/';
      
      const response = await apiClient.get<PaginatedResponse>(url);
      
      setLogs(response.results);
      setPagination(prev => ({
        ...prev,
        count: response.count,
        next: response.next,
        previous: response.previous,
        page: page
      }));
      
    } catch (error: any) {
      console.error('Failed to load logs:', error);
      setError(error.message || "Ошибка загрузки логов");
    } finally {
      setLoading(false);
    }
  }, [filters.type, debouncedSearch, filters.days, pagination.pageSize]);

  // Загрузка при изменении фильтров (с debounce для поиска)
  useEffect(() => {
    loadLogs(1); // Сбрасываем на первую страницу при изменении фильтров
  }, [loadLogs]);

  // Обработчики пагинации
  const handleNextPage = () => {
    if (pagination.next) {
      const nextPage = pagination.page + 1;
      loadLogs(nextPage);
    }
  };

  const handlePrevPage = () => {
    if (pagination.previous) {
      const prevPage = pagination.page - 1;
      loadLogs(prevPage);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    setPagination(prev => ({ ...prev, pageSize: newSize, page: 1 }));
  };

  // Эффект для изменения размера страницы
  useEffect(() => {
    loadLogs(1);
  }, [pagination.pageSize, loadLogs]);

  // Сброс фильтров
  const handleResetFilters = () => {
    setFilters({ type: '', search: '', days: '' });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Обработчик изменения поиска
  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
    // Не вызываем loadLogs здесь - сработает useEffect с debounce
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'workers': return 'bg-blue-100 text-blue-800';
      case 'orders': return 'bg-green-100 text-green-800';
      case 'leaflets': return 'bg-yellow-100 text-yellow-800';
      case 'cities': return 'bg-purple-100 text-purple-800';
      case 'system': return 'bg-red-100 text-red-800';
      case 'distributors': return 'bg-yellow-400 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'workers': return 'Работники';
      case 'orders': return 'Заказы';
      case 'leaflets': return 'Листовки';
      case 'cities': return 'Города';
      case 'system': return 'Система';
      case 'distributors': return 'Разносчики';
      
      default: return type;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  // Расчет общего количества страниц
  const totalPages = Math.ceil(pagination.count / pagination.pageSize);

  if (loading && logs.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold mb-4">Логи системы</h1>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Загрузка логов...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-6">Логи системы</h1>

      {/* Фильтры */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Тип лога</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Все типы</option>
              <option value="workers">Работники</option>
              <option value="orders">Заказы</option>
              <option value="leaflets">Листовки</option>
              <option value="cities">Города</option>
              <option value="system">Система</option>
                 <option value="distributors">Разносчики</option>
              distributors
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Поиск {debouncedSearch && debouncedSearch !== filters.search && "⏳"}
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Поиск по действию или пользователю..."
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Период</label>
            <select
              value={filters.days}
              onChange={(e) => setFilters(prev => ({ ...prev, days: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Все время</option>
              <option value="1">Последние 24 часа</option>
              <option value="7">Последние 7 дней</option>
              <option value="30">Последние 30 дней</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleResetFilters}
              className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition"
            >
              Сбросить
            </button>
          </div>
        </div>
      </div>

      {/* Пагинация - верхняя */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
        <div className="text-sm text-gray-600">
          Показано {logs.length} из {pagination.count} записей
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">На странице:</label>
            <select
              value={pagination.pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="p-1 border border-gray-300 rounded text-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={!pagination.previous}
              className={`px-3 py-1 rounded text-sm ${
                pagination.previous 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Назад
            </button>
            
            <span className="text-sm text-gray-600">
              Страница {pagination.page} из {totalPages}
            </span>
            
            <button
              onClick={handleNextPage}
              disabled={!pagination.next}
              className={`px-3 py-1 rounded text-sm ${
                pagination.next 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Вперед
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
          {error}
          <button 
            onClick={() => loadLogs(1)}
            className="ml-4 text-red-800 underline hover:text-red-900"
          >
            Попробовать снова
          </button>
        </div>
      )}

      {/* Таблица логов */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {logs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Логи не найдены</p>
            {filters.type || filters.search || filters.days ? (
              <button 
                onClick={handleResetFilters}
                className="mt-2 text-blue-600 underline hover:text-blue-700"
              >
                Показать все логи
              </button>
            ) : null}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Тип</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Кто выполнил</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Что произошло</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Дата</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(log.type)}`}>
                        {getTypeLabel(log.type)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">
                        {log.whoDid || 'Не указано'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">
                        {log.whatHappend || 'Не указано'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(log.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Пагинация - нижняя */}
      {logs.length > 0 && (
        <div className="flex justify-center items-center mt-6">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={!pagination.previous}
              className={`px-4 py-2 rounded ${
                pagination.previous 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Назад
            </button>
            
            <span className="px-4 py-2 text-sm text-gray-600">
              {pagination.page} из {totalPages}
            </span>
            
            <button
              onClick={handleNextPage}
              disabled={!pagination.next}
              className={`px-4 py-2 rounded ${
                pagination.next 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Вперед
            </button>
          </div>
        </div>
      )}

      {loading && logs.length > 0 && (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Загрузка...</span>
        </div>
      )}
    </div>
  );
}