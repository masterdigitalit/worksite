"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "lib/api-client";

interface Distributor {
  id: string;
  fullName: string;
  phone: string;
  telegram: string;
  invitedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export default function DistributorsPage() {
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const router = useRouter();

  useEffect(() => {
    loadDistributors();
  }, [search]);

  const loadDistributors = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      const url = `/api/v1/distributors/${params}`.replace(/\/?(\?|$)/, '/$1');
      
      const distributorsData = await apiClient.get<Distributor[]>(url);
      setDistributors(distributorsData);
    } catch (error: any) {
      console.error('Failed to load distributors:', error);
      setError(error.message || "Ошибка загрузки дистрибьюторов");
    } finally {
      setLoading(false);
    }
  };

  const handleAddDistributor = () => {
    router.push("/advertising/distributors/new");
  };

  const handleDistributorClick = (distributorId: string) => {
    router.push(`/advertising/distributors/${distributorId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  if (loading && distributors.length === 0) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-white">👥 Дистрибьюторы</h1>
          <button
            onClick={handleAddDistributor}
            className="rounded bg-green-600 px-4 py-2 text-white transition hover:bg-green-700 disabled:opacity-50"
            disabled
          >
            Добавить дистрибьютора
          </button>
        </div>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Загрузка дистрибьюторов...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">👥 Дистрибьюторы</h1>
        <button
          onClick={handleAddDistributor}
          className="rounded bg-green-600 px-4 py-2 text-white transition hover:bg-green-700"
        >
          Добавить дистрибьютора
        </button>
      </div>

      {/* Поиск */}
      <div className="bg-gray-800 p-4 rounded-lg shadow-md mb-6">
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Поиск дистрибьюторов
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по имени, телефону или telegram..."
              className="flex-1 p-2 border border-gray-600 bg-gray-700 text-white rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
              >
                Сбросить
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-4">
          {error}
          <button 
            onClick={loadDistributors}
            className="ml-4 text-red-300 underline hover:text-red-100"
          >
            Попробовать снова
          </button>
        </div>
      )}

      {/* Таблица дистрибьюторов */}
      <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
        {distributors.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            {search ? (
              <>
                <p>Дистрибьюторы не найдены</p>
                <button 
                  onClick={() => setSearch("")}
                  className="mt-2 text-blue-400 underline hover:text-blue-300"
                >
                  Показать всех дистрибьюторов
                </button>
              </>
            ) : (
              <>
                <p>Нет добавленных дистрибьюторов</p>
                <button 
                  onClick={handleAddDistributor}
                  className="mt-2 text-green-400 underline hover:text-green-300"
                >
                  Добавить первого дистрибьютора
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">ФИО</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Телефон</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Telegram</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Пригласил</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Добавлен</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-600">
                {distributors.map((distributor) => (
                  <tr
                    key={distributor.id}
                    className="cursor-pointer hover:bg-gray-700 transition"
                    onClick={() => handleDistributorClick(distributor.id)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{distributor.fullName}</div>
                      <div className="text-sm text-gray-400">ID: {distributor.id}</div>
                    </td>
                    <td className="px-4 py-3 text-white">
                      {distributor.phone}
                    </td>
                    <td className="px-4 py-3">
                      {distributor.telegram ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900 text-blue-200">
                          @{distributor.telegram}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">Не указан</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {distributor.invitedBy || "Не указан"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {formatDate(distributor.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {loading && distributors.length > 0 && (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-400">Обновление...</span>
        </div>
      )}
    </div>
  );
}