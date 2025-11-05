"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "lib/api-client";

interface Worker {
  id: string;
  full_name: string;
  telegramUsername: string | null;
  phone: string;
  orders_completed: number;
  total_earned: number;
  created_at: string;
  updated_at: string;
}

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  console.log(workers)

  const router = useRouter();

  useEffect(() => {
    loadWorkers();
  }, [search]);

  const loadWorkers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      const url = `/api/v1/workers/${params}`;
      
      const workersData = await apiClient.get<Worker[]>(url);
      setWorkers(workersData);
    } catch (error: any) {
      console.error('Failed to load workers:', error);
      setError(error.message || "Ошибка загрузки работников");
    } finally {
      setLoading(false);
    }
  };

  const handleAddWorker = () => {
    router.push("/admin/workers/new");
  };

  const handleWorkerClick = (workerId: string) => {
    router.push(`/admin/workers/${workerId}`);
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('ru-RU').format(amount) + ' ₽';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  if (loading && workers.length === 0) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Работники</h1>
          <button
            onClick={handleAddWorker}
            className="rounded bg-green-600 px-4 py-2 text-white transition hover:bg-green-700 disabled:opacity-50"
            disabled
          >
            Добавить работника
          </button>
        </div>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Загрузка работников...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Работники</h1>
        <button
          onClick={handleAddWorker}
          className="rounded bg-green-600 px-4 py-2 text-white transition hover:bg-green-700"
        >
          Добавить работника
        </button>
      </div>

      {/* Поиск */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Поиск работников
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по имени, telegram или телефону..."
              className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
              >
                Сбросить
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
          {error}
          <button 
            onClick={loadWorkers}
            className="ml-4 text-red-800 underline hover:text-red-900"
          >
            Попробовать снова
          </button>
        </div>
      )}

      {/* Таблица работников */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {workers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {search ? (
              <>
                <p>Работники не найдены</p>
                <button 
                  onClick={() => setSearch("")}
                  className="mt-2 text-blue-600 underline hover:text-blue-700"
                >
                  Показать всех работников
                </button>
              </>
            ) : (
              <>
                <p>Нет добавленных работников</p>
                <button 
                  onClick={handleAddWorker}
                  className="mt-2 text-green-600 underline hover:text-green-700"
                >
                  Добавить первого работника
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Работник</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Контакты</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Статистика</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Добавлен</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {workers.map((worker) => (
                  <tr
                    key={worker.id}
                    className="cursor-pointer hover:bg-gray-50 transition"
                    onClick={() => handleWorkerClick(worker.id)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{worker.full_name}</div>
                      <div className="text-sm text-gray-500">ID: {worker.id.slice(0, 8)}...</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{worker.phone}</div>
                      {worker.telegramUsername && (
                        <div className="text-sm text-blue-600">
                          @{worker.telegramUsername}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="font-medium text-gray-900">{worker.orders_completed}</span>
                          <span className="text-gray-500"> заказов</span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium text-green-600">{formatMoney(worker.total_earned)}</span>
                          <span className="text-gray-500"> заработано</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(worker.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {loading && workers.length > 0 && (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Обновление...</span>
        </div>
      )}
    </div>
  );
}