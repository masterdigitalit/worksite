'use client';

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { apiClient } from "lib/api-client"; 
import { useRouter } from 'next/navigation';
import { useAuth } from "contexts/AuthContext";

interface Goal {
  id: number;
  day: number;
  month: number;
  all: number;
  day_label: string;
  month_label: string;
  total_label: string;
  updated_at: string;
  created_at: string;
}

export default function TargetForm() {
  const [all, setAll] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [initial, setInitial] = useState({ all: "", month: "", day: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentGoal, setCurrentGoal] = useState<Goal | null>(null);

  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  // Редирект если не авторизован
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadGoals();
    }
  }, [isAuthenticated]);

  const loadGoals = async () => {
    try {
      const goalData: Goal = await apiClient.get('/api/v1/goals/');
      setCurrentGoal(goalData);
      
      setAll(goalData.all?.toString() ?? "");
      setMonth(goalData.month?.toString() ?? "");
      setDay(goalData.day?.toString() ?? "");
      setInitial({
        all: goalData.all?.toString() ?? "",
        month: goalData.month?.toString() ?? "",
        day: goalData.day?.toString() ?? "",
      });
    } catch (error) {
      console.error('Failed to load goals:', error);
      toast.error("Ошибка загрузки целей");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Проверяем изменения
      if (all === initial.all && month === initial.month && day === initial.day) {
        toast.info("Нет изменений для сохранения");
        return;
      }

      const payload: any = {};
      if (all !== "" && all !== initial.all) payload.all = Number(all);
      if (month !== "" && month !== initial.month) payload.month = Number(month);
      if (day !== "" && day !== initial.day) payload.day = Number(day);

      // Всегда используем PUT для обновления существующей цели
      const response: Goal = await apiClient.put('/api/v1/goals/update/', payload);

      toast.success("Цель обновлена");
      setInitial({ all, month, day });
      setCurrentGoal(response);
    } catch (error: any) {
      console.error('Failed to save goals:', error);
      toast.error(error.message || "Ошибка при обновлении");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetToDefault = async () => {
    try {
      setSubmitting(true);
      const response: Goal = await apiClient.get('/api/v1/goals/');
      
      setCurrentGoal(response);
      setAll(response.all?.toString() ?? "");
      setMonth(response.month?.toString() ?? "");
      setDay(response.day?.toString() ?? "");
      setInitial({
        all: response.all?.toString() ?? "",
        month: response.month?.toString() ?? "",
        day: response.day?.toString() ?? "",
      });
      
      toast.success("Обновлено");
    } catch (error: any) {
      console.error('Failed to reset goals:', error);
      toast.error(error.message || "Ошибка при сбросе");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-10 space-y-5 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-center mb-6">🎯 Установить цели</h2>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Общая цель
          </label>
          <input
            type="number"
            placeholder="Глобальная цель в рублях"
            value={all}
            onChange={(e) => setAll(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Цель на месяц
          </label>
          <input
            type="number"
            placeholder="Цель на месяц в рублях"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Цель на день
          </label>
          <input
            type="number"
            placeholder="Цель на день в рублях"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {submitting ? "Сохранение..." : "Сохранить цели"}
          </button>
          
          <button
            type="button"
            onClick={handleResetToDefault}
            disabled={submitting}
            className="px-4 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            title="Сбросить к значениям по умолчанию"
          >
            🔄
          </button>
        </div>

        {/* Текущие значения */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-700 mb-2">Текущие цели:</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>📊 Общая: <span className="font-semibold">{currentGoal?.all?.toLocaleString('ru-RU') || 'Не установлена'} ₽</span></p>
            <p>🗓️ Месяц: <span className="font-semibold">{currentGoal?.month?.toLocaleString('ru-RU') || 'Не установлена'} ₽</span></p>
            <p>📆 День: <span className="font-semibold">{currentGoal?.day?.toLocaleString('ru-RU') || 'Не установлена'} ₽</span></p>
          </div>
          
          {currentGoal?.updated_at && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Обновлено: {new Date(currentGoal.updated_at).toLocaleString('ru-RU')}
              </p>
            </div>
          )}
        </div>

        {/* Информация о работе */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            💡 Цели используются для отображения прогресса на главной странице администратора.
            Изменения применяются сразу ко всем пользователям.
          </p>
        </div>
      </form>
    </div>
  );
}