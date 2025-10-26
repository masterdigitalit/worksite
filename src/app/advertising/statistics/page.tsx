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
    flyersIssued: number;
    flyersDelivered: number;
    totalFlyers: number;
    flyersReturned: number;
  };
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

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white shadow p-6 rounded-xl font-sans">
      <h1 className="text-2xl font-bold text-center mb-6">📋 Отчёт по листовкам</h1>

      {/* Сегодня */}
      <div className="mb-6">
        <p>Дата {stats.date} 📆</p>
        <p>Промоутеров: {stats.today.promoters}</p>
        <p>Количество выданной рекламы: {stats.today.flyersIssued}</p>
        <p>Количество разнесенной рекламы: {stats.today.flyersDelivered}</p>
      </div>

      {/* Общее количество */}
      <div className="mb-6">
        <p className="font-semibold mt-2">Общее количество:</p>
        <p>Количество выданной рекламы: {stats.month.flyersIssued}</p>
        <p>Количество разнесенной рекламы: {stats.month.flyersDelivered}</p>
        <p>Общее количество листовок: {stats.month.totalFlyers}</p>
        <p>Общее количество возврата: {stats.month.flyersReturned}</p>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={() => {
            if (!stats) return;
            const report = `
Дата ${stats.date} 📆
Промоутеров: ${stats.today.promoters}
Количество выданной рекламы: ${stats.today.flyersIssued}
Количество разнесенной рекламы: ${stats.today.flyersDelivered}

Общее количество:
Количество выданной рекламы: ${stats.month.flyersIssued}
Количество разнесенной рекламы: ${stats.month.flyersDelivered}
Общее количество листовок: ${stats.month.totalFlyers}
Общее количество возврата: ${stats.month.flyersReturned}
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
