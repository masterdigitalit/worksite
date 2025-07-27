import { getServerSession } from "next-auth";
import { authOptions } from "@/server/api/auth/auth";

import Link from "next/link";
import clsx from "clsx";

import { getTodayStats } from "@/server/api/stats/getDailyStats";
import { getMonthStats } from "@/server/api/stats/getMonthStats";
import { getProfitStats } from "@/server/api/stats/getProfitStats";
import { getStatusCounts } from "@/server/api/stats/countByStatus";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
const fullName =
  session?.user?.fullName === "Апти"
    ? "Салам Алейкум Апти"
    : 'Привет, '+session?.user?.fullName || 'Привет, '+"Админ";
    console.log(session?.user?.fullName)


  const [todayStats, monthStats, profitStats, statusCounts] = await Promise.all([
    getTodayStats(),
    getMonthStats(),
    getProfitStats(),
    getStatusCounts(),
  ]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold"> {fullName}</h1>

      {/* Первая строка: статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="📆 За сегодня"
          total={todayStats.profit}
          count={todayStats.count}
          received={todayStats.received}
          outlay={todayStats.outlay}
          receivedworker={todayStats.receivedworker}
          type="day"
        />

        <StatCard
          title="🗓️ За месяц"
          total={monthStats.profit}
          count={monthStats.count}
          received={monthStats.received}
          outlay={monthStats.outlay}
          receivedworker={monthStats.receivedworker}
              type="month"
        />

        <div className="p-4 border rounded-lg shadow">
          <h2 className="text-xl font-bold mb-2">💎 Чистая прибыль</h2>
          <p className="text-3xl text-green-600 font-bold mb-2">{profitStats.totalProfit} ₽</p>

          <div className="text-sm text-gray-600 space-y-1 mt-2">
            <p>💸 Зарплата сотрудников: <span className="font-semibold">{profitStats.receivedworker} ₽</span></p>
            <p>🧾 Расходы на закуп: <span className="font-semibold">{profitStats.outlay} ₽</span></p>
          </div>
        </div>
      </div>

      {/* Вторая строка: статусы заказов сгруппированные */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {Object.entries(statusGroupMap).map(([groupKey, statuses]) => {
    const totalCount = statuses.reduce(
      (acc, status) => acc + (statusCounts[status] || 0),
      0
    );

    return (
      <div key={groupKey} className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-lg font-bold mb-4">{groupTitleMap[groupKey]}</h2>

        <p className="text-5xl font-extrabold mb-4 text-blue-700">{totalCount}</p>

        <div className="space-y-1 text-gray-700">
          {statuses.map((status) => (
            <Link
              key={status}
              href={`/admin/orders?status=${status}`}
              className="flex justify-between items-center hover:underline"
            >
              <span>{statusesUI[status].label}</span>
              <span className={`${statusesUI[status].color} font-semibold text-1.2xl`}>
                {statusCounts[status] || 0}
              </span>
            </Link>
          ))}
        </div>
      </div>
    );
  })}
</div>
    </div>
  );
}

// Компонент карточки статистики
function StatCard({
  title,
  total,
  count,
  received,
  outlay,
  receivedworker,
  type,
}: {
  title: string;
  total: number;
  count: number;
  received: number;
  outlay: number;
  receivedworker: number;
  type: string;
}) {
  let profitPercent = 0;
  let costPercent = 0;
  let base = 0;

  switch (type) {
    case "day": {
      base = 30000;
      profitPercent = Math.round((total / base) * 100);
      costPercent = Math.min(100 - profitPercent, 100);
      break;
    }

    case "month": {
      base = 1000000;
      profitPercent = Math.round((total / base) * 100);
      costPercent = Math.min(100 - profitPercent, 100);
      break;
    }

    default: {
      console.warn("Неизвестный тип:", type);
      profitPercent = 0;
      costPercent = 0;
      break;
    }
  }

  return (
    <div className="p-4 border rounded-lg shadow">
      <h2 className="text-xl font-bold mb-2">{title}</h2>

      {/* Сумма закрытия */}
      <p className="text-xl text-black-500 mb-2">
        Cумма закрытия - {received} ₽
      </p>

      {/* Прогресс-бар: прибыль vs затраты */}
      <div className="w-full bg-gray-200 rounded-full h-4 mb-4 flex overflow-hidden relative group">
        <div
          className="bg-green-500 h-4 transition-all duration-300"
          style={{ width: `${profitPercent}%` }}
        >
          {/* Tooltip */}
          <div className="absolute left-0 -top-8 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none">
            Прибыль: {profitPercent}% от цели ({base.toLocaleString("ru-RU")} ₽)
          </div>
        </div>
        <div
          className="bg-red-400 h-4 transition-all duration-300"
          style={{ width: `${costPercent}%` }}
        />
      </div>

      {/* Детализация */}
      <div className="text-sm text-gray-700 space-y-1">
        <p>
          📈 Прибыль: <span className="text-green-600 font-semibold">{total} ₽</span>
        </p>
        <p>
          📦 Заказов: <span className="font-semibold">{count}</span>
        </p>
        <p>
          🏢 Расходы офис/закуп: <span className="text-red-600 font-semibold">{outlay} ₽</span>
        </p>
        <p>
          👷 Зарплата сотрудников:{" "}
          <span className="text-orange-600 font-semibold">{receivedworker} ₽</span>
        </p>
      </div>
    </div>
  );
}



// UI для статусов
const statusesUI: Record<string, { label: string; color: string }> = {
  PENDING: { label: "🕓 Ожидает", color: "text-gray-600" },
  ON_THE_WAY: { label: "🚗 В пути", color: "text-blue-600" },
  IN_PROGRESS: { label: "🔧 В работе", color: "text-orange-600" },
  IN_PROGRESS_SD: { label: "📷 В работе + SD", color: "text-orange-500" },
  DECLINED: { label: "❌ Отказ", color: "text-red-500" },
  CANCEL_CC: { label: "📞 Отмена (ЦЦ)", color: "text-red-400" },
  CANCEL_BRANCH: { label: "🏢 Отмена (Филиал)", color: "text-red-400" },
  DONE: { label: "✅ Завершён", color: "text-green-600" },
};

// Группировка статусов
const statusGroupMap: Record<string, string[]> = {
  waiting: ["PENDING", "ON_THE_WAY"],
  inProgress: ["IN_PROGRESS", "IN_PROGRESS_SD"],
  finished: ["DONE", "DECLINED", "CANCEL_CC", "CANCEL_BRANCH"],
};

const groupTitleMap: Record<string, string> = {
  waiting: "📦 Ожидают начала",
  inProgress: "🔧 В процессе",
  finished: "✅ Завершённые / Отменённые",
};
