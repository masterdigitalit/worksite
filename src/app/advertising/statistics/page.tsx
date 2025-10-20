"use client";

import { useEffect, useState } from "react";

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
    flyersNotReturned: number;
  };
  totalFlyers: number;
};

export default function StatisticsPage() {
  const [stats, setStats] = useState<FlyersStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/leaflet/statistics", { cache: "no-store" });
        if (!res.ok) throw new Error("Ошибка загрузки данных");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Ошибка при загрузке статистики:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) return <p className="text-center mt-10">Загрузка...</p>;
  if (!stats) return <p className="text-center mt-10 text-red-500">Ошибка загрузки данных</p>;

  const avgFlyersPerOrder = stats.month.ordersCount
    ? (stats.month.flyersDelivered / stats.month.ordersCount).toFixed(2)
    : "—";

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white shadow p-6 rounded-xl">
      <h1 className="text-2xl font-bold text-center mb-6">📋 Отчёт по листовкам</h1>

      {/* Сегодня */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Общее количество листовок:</h2>
        <p>Дата: {stats.date} 📆</p>
        <p>Промоутеров: {stats.today.promoters}</p>
        <p>Количество выданной рекламы: {stats.today.flyersIssued}</p>
        <p>Количество разнесенной рекламы: {stats.today.flyersDelivered}</p>
      </div>

      {/* За месяц */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Отчёт за месяц:</h2>
        <p>Количество выданной рекламы: {stats.month.flyersIssued}</p>
        <p>Количество разнесенной рекламы: {stats.month.flyersDelivered}</p>
        <p>Общее количество листовок: {stats.totalFlyers}</p>
        <p>Общее количество возврата: {stats.month.flyersReturned}</p>
        <p>Промоутеров за месяц: {stats.month.promoters}</p>
        <p>Кол-во заказов за месяц: {stats.month.ordersCount}</p>
        <p>Не возвращено: {stats.month.flyersNotReturned}</p>
        <p className="text-indigo-600 font-medium">
          Среднее количество листовок на 1 заказ: <b>{Math.round(avgFlyersPerOrder)}</b>
        </p>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={() => {
            const report = `
Общее количество листовок:
Дата: ${stats.date} 📆
Промоутеров: ${stats.today.promoters}
Количество выданной рекламы: ${stats.today.flyersIssued}
Количество разнесенной рекламы: ${stats.today.flyersDelivered}

Отчёт за месяц:
Количество выданной рекламы: ${stats.month.flyersIssued}
Количество разнесенной рекламы: ${stats.month.flyersDelivered}
Общее количество листовок: ${stats.totalFlyers}
Общее количество возврата: ${stats.month.flyersReturned}
Промоутеров за месяц: ${stats.month.promoters}
Кол-во заказов за месяц: ${stats.month.ordersCount}
Не возвращено: ${stats.month.flyersNotReturned}
Среднее количество листовок на 1 заказ: ${Math.round(avgFlyersPerOrder)}
            `.trim();

            navigator.clipboard.writeText(report);
            alert("Отчёт скопирован в буфер обмена ✅");
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition"
        >
          📋 Скопировать отчёт
        </button>
      </div>
    </div>
  );
}
