'use client';

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { apiClient } from "lib/api-client"; 
import { useRouter } from 'next/navigation';
import { useAuth } from "contexts/AuthContext"; // добавь useAuth

interface Goal {
  id: string;
  all: number | null;
  month: number | null;
  day: number | null;
  created_at: string;
  updated_at: string;
}

export default function TargetForm() {
  const [all, setAll] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [initial, setInitial] = useState({ all: "", month: "", day: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentGoal, setCurrentGoal] = useState<Goal | null>(null);

  const { isAuthenticated, loading: authLoading } = useAuth(); // добавь useAuth
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

      let response: Goal;

      if (currentGoal && currentGoal.id !== 'default') {
        // Обновляем существующую цель
        response = await apiClient.put(`/api/v1/goals/${currentGoal.id}/`, payload);
      } else {
        // Создаем новую цель
        response = await apiClient.post('/api/v1/goals/', payload);
      }

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

  if (authLoading || loading) {
    return <p className="text-center py-10">Загрузка...</p>;
  }

  if (!isAuthenticated) {
    return null; // Редирект уже произойдет
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
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {submitting ? "Сохранение..." : "Сохранить цели"}
        </button>

        {/* Текущие значения */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-700 mb-2">Текущие цели:</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>📊 Общая: <span className="font-semibold">{currentGoal?.all?.toLocaleString() || 'Не установлена'}</span></p>
            <p>🗓️ Месяц: <span className="font-semibold">{currentGoal?.month?.toLocaleString() || 'Не установлена'}</span></p>
            <p>📆 День: <span className="font-semibold">{currentGoal?.day?.toLocaleString() || 'Не установлена'}</span></p>
          </div>
        </div>
      </form>
    </div>
  );
}