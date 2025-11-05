"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "lib/api-client";

interface City {
  id: string;  // Изменил на string (UUID)
  name: string;
  orders_count: number;  // Изменил структуру под Django
  createdAt: string;
  updatedAt: string;
}

export default function CityPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  console.log(cities)

  useEffect(() => {
    loadCities();
  }, []);

  const loadCities = async () => {
    try {
      setLoading(true);
      setError(null);
      const citiesData = await apiClient.get<City[]>('/api/v1/cities/');
      setCities(citiesData);
    } catch (error: any) {
      console.error('Failed to load cities:', error);
      setError(error.message || "Ошибка загрузки данных");
    } finally {
      setLoading(false);
    }
  };

  const handleCityClick = (cityId: string) => {
    router.push(`/admin/city/${cityId}`);
  };

  const handleAddCity = () => {
    router.push("/admin/city/new");
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Города и количество заказов</h1>
          <button
            onClick={handleAddCity}
            className="rounded bg-green-600 px-4 py-2 text-white transition hover:bg-green-700 disabled:opacity-50"
            disabled
          >
            Добавить город
          </button>
        </div>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Загрузка...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Города и количество заказов</h1>
          <button
            onClick={handleAddCity}
            className="rounded bg-green-600 px-4 py-2 text-white transition hover:bg-green-700"
          >
            Добавить город
          </button>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
          <button 
            onClick={loadCities}
            className="ml-4 text-red-800 underline hover:text-red-900"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Города и количество заказов</h1>
        <button
          onClick={handleAddCity}
          className="rounded bg-green-600 px-4 py-2 text-white transition hover:bg-green-700"
        >
          Добавить город
        </button>
      </div>

      {cities.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Нет добавленных городов</p>
          <button 
            onClick={handleAddCity}
            className="mt-2 text-green-600 underline hover:text-green-700"
          >
            Добавить первый город
          </button>
        </div>
      ) : (
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="border-b px-4 py-3 text-left text-sm font-semibold text-gray-700">Город</th>
                <th className="border-b px-4 py-3 text-left text-sm font-semibold text-gray-700">Кол-во заказов</th>
                <th className="border-b px-4 py-3 text-left text-sm font-semibold text-gray-700">Добавлен</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {cities.map((city) => (
                <tr
                  key={city.id}
                  className="cursor-pointer hover:bg-gray-50 transition border-b last:border-b-0"
                  onClick={() => handleCityClick(city.id)}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{city.name}</div>
                    <div className="text-sm text-gray-500">ID: {city.id.slice(0, 8)}...</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {city.orders_count || 0} заказов
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(city.createdAt).toLocaleDateString('ru-RU')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}