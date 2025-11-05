import { redirect } from "next/navigation";
import { cookies } from 'next/headers';
import { jwtAuthService } from "lib/jwt-auth";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Импортируем наши серверные функции (их нужно будет переписать под Django API)
import { getGoal } from "@/server/api/target/get";
import { getTodayStats } from "@/server/api/stats/getDailyStats";
import { getMonthStats } from "@/server/api/stats/getMonthStats";
import { getProfitStats } from "@/server/api/stats/getProfitStats";
import { getStatusCounts } from "@/server/api/stats/countByStatus";
import { getLeafletOrderStats } from "@/server/api/stats/page/leafletStat";
import Link from "next/link";

// UI configs (остаются без изменений)
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

const statusesUILeaflet = {
  IN_PROCESS: { label: "В процессе", color: "text-yellow-600" },
  FORPAYMENT: { label: "Ожидает оплаты", color: "text-orange-600" },
  DONE: { label: "Выполнено", color: "text-green-600" },
  CANCELLED: { label: "Отменено", color: "text-gray-500" },
  DECLINED: { label: "Отклонено", color: "text-red-600" },
};

// Функция для получения пользователя из токена
async function getCurrentUser() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('access_token')?.value;
  
  if (!accessToken) {
    return null;
  }

  try {
    // Здесь нужно будет реализовать запрос к Django API для получения профиля
    // Пока используем данные из localStorage (через клиентский компонент)
    const userData = cookieStore.get('user_data')?.value;
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    return null;
  }
}

export default async function AdminPage() {
  const user = await getCurrentUser();
  
  // Если нет пользователя, редиректим на логин
  if (!user) {
    redirect("/login");
  }

  // Проверяем роль пользователя
  if (user.role !== 'ADMIN') {
    if (user.role === 'MANAGER') {
      redirect("/advertising");
    } else {
      redirect("/unauthorized");
    }
  }

  const fullName =
    user.username === "Апти"
      ? "Салам Алейкум Апти"
      : "Привет, " + (user.fullName || "Админ");

  // Получаем данные (пока оставляем старые функции, но их нужно будет переписать)
  const [targetRaw, todayStats, monthStats, profitStats, statusCounts, leafletStats] =
    await Promise.all([
      getGoal(),
      getTodayStats(),
      getMonthStats(),
      getProfitStats(),
      getStatusCounts(),
      getLeafletOrderStats(),
    ]);

  const target = targetRaw;

  const avgCheckall = profitStats.count
    ? Math.round(profitStats.received / profitStats.count)
    : 0;

  const avgProfitall = profitStats.count
    ? Math.round((profitStats.received - profitStats.outlay) / profitStats.count)
    : 0;

  return (
    <div className="min-h-screen flex flex-col">
     
      <main className="flex-1 p-6 bg-gray-50">
        <div className="space-y-6">
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

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-lg font-bold mb-4">📦 Статистика по листовкам</h2>

            <div className="space-y-2 text-gray-700">
              {/* Ссылки по статусам */}
              <div className="space-y-1">
                {Object.entries(statusesUILeaflet).map(([key, { label, color }]) => (
                  <Link
                    key={key}
                    href={`/advertising?status=${key}`}
                    className="flex justify-between items-center py-1 text-sm hover:underline transition border-t-1 border-gray-100"
                  >
                    <span>{label}</span>
                    <span className={`${color} font-semibold`}>
                      {leafletStats[key as keyof typeof leafletStats] || 0}
                    </span>
                  </Link>
                ))}
              </div>

              {/* Итоговая часть */}
              <div className="pt-3 text-sm space-y-1 border-t-2 border-gray-300">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">💰 Всего к выплате:</span>
                  <span className="text-orange-600 font-semibold">
                    {leafletStats.totalDistributorProfitTOpay.toLocaleString()} ₽
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">✅ Выплачено:</span>
                  <span className="text-green-600 font-semibold">
                    {leafletStats.totalDistributorProfitPaid.toLocaleString()} ₽
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </main>
    </div>
  );
}

// Компонент карточки статистики (без изменений)
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