import { getServerSession } from "next-auth";
import { authOptions } from "@/server/api/auth/auth";


import { getGoal } from "@/server/api/target/get";
import { getTodayStats } from "@/server/api/stats/getDailyStats";
import { getMonthStats } from "@/server/api/stats/getMonthStats";
import { getProfitStats } from "@/server/api/stats/getProfitStats";
import { getStatusCounts } from "@/server/api/stats/countByStatus";
import Link from "next/link";

// UI configs
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

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  
 

  const fullName =
    session?.user?.fullName === "Апти"
      ? "Салам Алейкум Апти"
      : "Привет, " + (session?.user?.fullName || "Админ");

  const [targetRaw, todayStats, monthStats, profitStats, statusCounts] =
    await Promise.all([
      getGoal(),
      getTodayStats(),
      getMonthStats(),
      getProfitStats(),
      getStatusCounts(),
    ]);

  const target = targetRaw
  

  const avgCheckall = profitStats.count
    ? Math.round(profitStats.received / profitStats.count)
    : 0;

  const avgProfitall = profitStats.count
    ? Math.round((profitStats.received - profitStats.outlay) / profitStats.count)
    : 0;


  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">{fullName}</h1>

      {/* Цели и метрики */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="📆 За сегодня" stats={todayStats} target={target.day} />
        <StatCard title="🗓️ За месяц" stats={monthStats} target={target.month} />

        <div className="p-4 border rounded-lg shadow">
          <h2 className="text-xl font-bold mb-2">💎 Чистая прибыль</h2>
          <p className="text-3xl text-green-600 font-bold mb-2">
            {profitStats.totalProfit} ₽
          </p>

          <div className="text-sm text-gray-600 space-y-1 mt-2">
            <p>💸 Зарплата сотрудников: <span className="font-semibold">{profitStats.receivedworker} ₽</span></p>
            <p>🧾 Расходы: <span className="font-semibold">{profitStats.outlay} ₽</span></p>
            <p>📊 Средний чек: <span className="text-blue-700 font-semibold">{avgCheckall} ₽</span></p>
            <p>💰 Чистый средний чек: <span className="text-green-600 font-semibold">{avgProfitall} ₽</span></p>
          </div>
        </div>
      </div>

      {/* Статусы заказов */}
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
                    <span className={`${statusesUI[status].color} font-semibold`}>
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
  stats,
  target,
}: {
  title: string;
  stats: {
    profit: number;
    count: number;
    received: number;
    outlay: number;
    receivedworker: number;
  };
  target: number;
}) {
  const { profit, count, received, outlay, receivedworker } = stats;

  const base = target || 1;
  const profitPercent = Math.round((profit / base) * 100);
  const costPercent = Math.min(100 - profitPercent, 100);

  const avgCheck = count ? Math.round(received / count) : 0;
  const avgProfit = count ? Math.round((received - outlay) / count) : 0;

  return (
    <div className="p-4 border rounded-lg shadow">
      <h2 className="text-xl font-bold mb-2">{title}</h2>

      <p className="text-xl text-black-500 mb-2">Сумма закрытия - {received} ₽</p>

      <div className="w-full bg-gray-200 rounded-full h-4 mb-4 flex overflow-hidden relative group">
        <div
          className="bg-green-500 h-4 transition-all duration-300"
          style={{ width: `${profitPercent}%` }}
        >
          <div className="absolute left-0 -top-8 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none">
            Прибыль: {profitPercent}% от цели ({base.toLocaleString("ru-RU")} ₽)
          </div>
        </div>
        <div
          className="bg-red-400 h-4 transition-all duration-300"
          style={{ width: `${costPercent}%` }}
        />
      </div>

      <div className="text-sm text-gray-700 space-y-1">
        <p>📈 Прибыль: <span className="text-green-600 font-semibold">{profit} ₽</span></p>
        <p>📦 Заказов: <span className="font-semibold">{count}</span></p>
        <p>📊 Средний чек: <span className="text-blue-700 font-semibold">{avgCheck} ₽</span></p>
        <p>💰 Чистый средний чек: <span className="text-green-600 font-semibold">{avgProfit} ₽</span></p>
        <p>🏢 Расходы офис/закуп: <span className="text-red-600 font-semibold">{outlay} ₽</span></p>
        <p>👷 Зарплата сотрудников: <span className="text-orange-600 font-semibold">{receivedworker} ₽</span></p>
      </div>
    </div>
  );
}
