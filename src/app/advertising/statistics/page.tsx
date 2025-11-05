"use client";

import { useEffect, useState } from "react";
import { apiClient } from "lib/api-client";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type FlyersStats = {
  date: string;
  today: {
    promoters: number;
    flyersIssued: number;
    flyersDelivered: number;
  };
  month: {
    promoters: number;
    flyersIssued: number;
    flyersDelivered: number;
    flyersReturned: number;
    ordersCount: number;
    flyersPerOrder: number;
    totalFlyers: number;
  };
};

export default function StatisticsPage() {
  const [stats, setStats] = useState<FlyersStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        setError(null);
        
        const data = await apiClient.get<FlyersStats>("/api/v1/leaflets/stats/");
        setStats(data);
        toast.success("Статистика успешно загружена");
      } catch (err: any) {
        console.error("Ошибка при загрузке статистики:", err);
        const errorMessage = err.message || "Ошибка загрузки данных";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const copyToClipboard = () => {
    if (!stats) return;
    
    const report = `
Дата ${stats.date} 📆
Промоутеров: ${stats.today.promoters}
Количество выданной рекламы: ${stats.today.flyersIssued}
Количество разнесенной рекламы: ${stats.today.flyersDelivered}

Общее количество за месяц:
Промоутеров: ${stats.month.promoters}
Количество выданной рекламы: ${stats.month.flyersIssued}
Количество разнесенной рекламы: ${stats.month.flyersDelivered}
Количество возврата: ${stats.month.flyersReturned}
Количество заказов: ${stats.month.ordersCount}
Листовок на заказ: ${stats.month.flyersPerOrder}
Общее количество листовок: ${stats.month.totalFlyers}
    `.trim();

    navigator.clipboard.writeText(report);
    toast.success("Отчёт скопирован в буфер обмена ✅");
  };

  const refreshStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiClient.get<FlyersStats>("/api/v1/leaflets/stats/");
      setStats(data);
      toast.success("Статистика обновлена");
    } catch (err: any) {
      console.error("Ошибка при обновлении статистики:", err);
      const errorMessage = err.message || "Ошибка обновления данных";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка статистики...</p>
          </div>
        </div>
        <ToastContainer />
      </>
    );
  }

  if (error && !stats) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">❌</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Ошибка</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Попробовать снова
              </button>
              <button
                onClick={refreshStats}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Обновить
              </button>
            </div>
          </div>
        </div>
        <ToastContainer />
      </>
    );
  }

  if (!stats) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Данные не найдены</h1>
            <p className="text-gray-600 mb-4">Не удалось загрузить статистику</p>
            <button
              onClick={refreshStats}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Попробовать снова
            </button>
          </div>
        </div>
        <ToastContainer />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {/* Заголовок с кнопкой обновления */}
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span className="text-2xl">📋</span>
                Отчёт по листовкам
              </h1>
              <button
                onClick={refreshStats}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <span>🔄</span>
                )}
                {loading ? "Обновление..." : "Обновить"}
              </button>
            </div>

            {/* Сегодня */}
            <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
              <h2 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <span className="text-xl">📅</span>
                Сегодня ({stats.date})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white rounded-lg border border-blue-100">
                  <div className="text-2xl font-bold text-blue-600">{stats.today.promoters}</div>
                  <div className="text-sm text-blue-800 font-medium">Промоутеров</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border border-blue-100">
                  <div className="text-2xl font-bold text-blue-600">{stats.today.flyersIssued}</div>
                  <div className="text-sm text-blue-800 font-medium">Выдано листовок</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border border-blue-100">
                  <div className="text-2xl font-bold text-blue-600">{stats.today.flyersDelivered}</div>
                  <div className="text-sm text-blue-800 font-medium">Разнесено листовок</div>
                </div>
              </div>
            </div>

            {/* Месяц */}
            <div className="mb-8 p-6 bg-green-50 rounded-lg border border-green-200">
              <h2 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                <span className="text-xl">📊</span>
                Статистика за месяц
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white rounded-lg border border-green-100">
                  <div className="text-2xl font-bold text-green-600">{stats.month.promoters}</div>
                  <div className="text-sm text-green-800 font-medium">Промоутеров</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border border-green-100">
                  <div className="text-2xl font-bold text-green-600">{stats.month.flyersIssued}</div>
                  <div className="text-sm text-green-800 font-medium">Выдано листовок</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border border-green-100">
                  <div className="text-2xl font-bold text-green-600">{stats.month.flyersDelivered}</div>
                  <div className="text-sm text-green-800 font-medium">Разнесено листовок</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border border-green-100">
                  <div className="text-2xl font-bold text-green-600">{stats.month.flyersReturned}</div>
                  <div className="text-sm text-green-800 font-medium">Возвращено листовок</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="text-center p-4 bg-white rounded-lg border border-green-100">
                  <div className="text-2xl font-bold text-green-600">{stats.month.ordersCount}</div>
                  <div className="text-sm text-green-800 font-medium">Количество заказов</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border border-green-100">
                  <div className="text-2xl font-bold text-green-600">{stats.month.flyersPerOrder}</div>
                  <div className="text-sm text-green-800 font-medium">Листовок на заказ</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border border-green-100">
                  <div className="text-2xl font-bold text-green-600">{stats.month.totalFlyers}</div>
                  <div className="text-sm text-green-800 font-medium">Всего листовок</div>
                </div>
              </div>
            </div>

            {/* Кнопки действий */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={copyToClipboard}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-lg shadow transition-colors flex items-center gap-2"
              >
                <span className="text-lg">📋</span>
                Скопировать отчёт
              </button>
              <button
                onClick={refreshStats}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-lg shadow transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <span>🔄</span>
                )}
                {loading ? "Обновление..." : "Обновить данные"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast контейнер */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}