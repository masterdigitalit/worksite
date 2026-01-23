'use client';
import { apiClient } from "lib/api-client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import { useAuth } from "contexts/AuthContext";

import { useUser } from "./components/AdminLayoutClient";
import {
  Users,
  Package,
  TrendingUp,
  DollarSign,
  Target,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Sparkles,
  BarChart3,
  Receipt,
  Wallet,
  Building,
  Phone,
  MapPin,
  ClipboardList,
  ArrowRight
} from "lucide-react";

// Импортируем только интерфейсы
import type {
  StatsData,
  ProfitStatsData,
  GoalData,
  LeafletStatsData,
  StatusCounts,
  StatCardProps,
  StatusGroupCardProps
} from "@/types/admin";

// UI configs (остаются в компоненте)
const statusesUI = {
  PENDING: { label: "Ожидает", color: "text-muted-foreground", bgColor: "bg-muted", icon: Clock },
  ON_THE_WAY: { label: "В пути", color: "text-blue-600", bgColor: "bg-blue-100", icon: MapPin },
  IN_PROGRESS: { label: "В работе", color: "text-orange-600", bgColor: "bg-orange-100", icon: Users },
  IN_PROGRESS_SD: { label: "В работе + SD", color: "text-orange-500", bgColor: "bg-orange-50", icon: Users },
  CANCELLED: { label: "Отменен", color: "text-red-500", bgColor: "bg-red-100", icon: XCircle },
  COMPLETED: { label: "Завершён", color: "text-green-600", bgColor: "bg-green-100", icon: CheckCircle },
};

const statusGroupMap = {
  waiting: ["PENDING", "ON_THE_WAY"],
  inProgress: ["IN_PROGRESS", "IN_PROGRESS_SD"],
  finished: ["COMPLETED", "CANCELLED"],
};

const groupTitleMap = {
  waiting: "Ожидают начала",
  inProgress: "В процессе",
  finished: "Завершённые / Отменённые",
};

const statusesUILeaflet = {
  IN_PROCESS: { label: "В процессе", color: "text-yellow-600", bgColor: "bg-yellow-100", icon: Clock },
  FORPAYMENT: { label: "Ожидает оплаты", color: "text-orange-600", bgColor: "bg-orange-100", icon: DollarSign },
  DONE: { label: "Выполнено", color: "text-green-600", bgColor: "bg-green-100", icon: CheckCircle },
  CANCELLED: { label: "Отменено", color: "text-muted-foreground", bgColor: "bg-muted", icon: XCircle },
  DECLINED: { label: "Отклонено", color: "text-red-600", bgColor: "bg-red-100", icon: AlertCircle },
};

// Заглушки по умолчанию (остаются в компоненте)
const defaultStatsData: StatsData = {
  profit: 0,
  count: 0,
  received: 0,
  outlay: 0,
  receivedworker: 0
};

const defaultProfitStatsData: ProfitStatsData = {
  totalProfit: 0,
  receivedworker: 0,
  outlay: 0,
  count: 0,
  received: 0
};

const defaultGoalData: GoalData = {
  day: 100000,
  month: 3000000,
  all: 10000000
};

const defaultLeafletStatsData: LeafletStatsData = {
  IN_PROCESS: 0,
  FORPAYMENT: 0,
  DONE: 0,
  CANCELLED: 0,
  DECLINED: 0,
  totalDistributorProfitTOpay: 0,
  totalDistributorProfitPaid: 0
};

const defaultStatusCounts: StatusCounts = {
  PENDING: 0,
  ON_THE_WAY: 0,
  IN_PROGRESS: 0,
  IN_PROGRESS_SD: 0,
  CANCELLED: 0,
  COMPLETED: 0
};

export default function AdminPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const user = useUser();
  
  const [statusCounts, setStatusCounts] = useState<StatusCounts>(defaultStatusCounts);
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState<GoalData>(defaultGoalData);
  const [todayStats, setTodayStats] = useState<StatsData>(defaultStatsData);
  const [monthStats, setMonthStats] = useState<StatsData>(defaultStatsData);
  const [profitStats, setProfitStats] = useState<ProfitStatsData>(defaultProfitStatsData);
  const [leafletStats, setLeafletStats] = useState<LeafletStatsData>(defaultLeafletStatsData);
  console.log(user)

  // Редирект если не авторизован
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!authLoading && user) {
      if (user.role !== 'ADMIN') {
        if (user.role === 'MANAGER') {
          router.push("/advertising");
        } else {
          // router.push("/unauthorized");
        }
        return;
      }
      loadData();
    }
  }, [isAuthenticated, authLoading, user, router]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [
        targetData,
        todayStatsData,
        monthStatsData,
        profitStatsData,
        statusCountsData,
        leafletStatsData
      ] = await Promise.all([
        getGoal(),
        getTodayStats(),
        getMonthStats(),
        getProfitStats(),
        getStatusCounts(),
        getLeafletOrderStats()
      ]);

      // Используем данные из API или заглушки
      setTarget(targetData || defaultGoalData);
      setTodayStats(todayStatsData || defaultStatsData);
      setMonthStats(monthStatsData || defaultStatsData);
      setProfitStats(profitStatsData || defaultProfitStatsData);
      setStatusCounts(statusCountsData || defaultStatusCounts);
      setLeafletStats(leafletStatsData || defaultLeafletStatsData);

    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error("Ошибка загрузки данных");
      // При ошибке используем заглушки
      setTarget(defaultGoalData);
      setTodayStats(defaultStatsData);
      setMonthStats(defaultStatsData);
      setProfitStats(defaultProfitStatsData);
      setStatusCounts(defaultStatusCounts);
      setLeafletStats(defaultLeafletStatsData);
    } finally {
      setLoading(false);
    }
  };

  // Безопасные функции для получения данных
  const getStatusCounts = async (): Promise<StatusCounts> => {
    try {
      const response = await apiClient.get('/api/v1/status-counts/');
      return response || defaultStatusCounts;
    } catch (error) {
      console.error('Error fetching status counts:', error);
      return defaultStatusCounts;
    }
  };

  const getGoal = async (): Promise<GoalData> => {
    try {
      const response = await apiClient.get('/api/v1/goals/');
      return {
        day: response?.day || defaultGoalData.day,
        month: response?.month || defaultGoalData.month,
        all: response?.all || defaultGoalData.all
      };
    } catch (error) {
      console.error('Error fetching goals:', error);
      return defaultGoalData;
    }
  };

  const getTodayStats = async (): Promise<StatsData> => {
    try {
      const response = await apiClient.get('/api/v1/stats/today/');
      return response || defaultStatsData;
    } catch (error) {
      console.error('Error fetching today stats:', error);
      return defaultStatsData;
    }
  };

  const getMonthStats = async (): Promise<StatsData> => {
    try {
      const response = await apiClient.get('/api/v1/stats/month/');
      return response || defaultStatsData;
    } catch (error) {
      console.error('Error fetching month stats:', error);
      return defaultStatsData;
    }
  };

  const getProfitStats = async (): Promise<ProfitStatsData> => {
    try {
      const response = await apiClient.get('/api/v1/stats/profit/');
      return response || defaultProfitStatsData;
    } catch (error) {
      console.error('Error fetching profit stats:', error);
      return defaultProfitStatsData;
    }
  };
  
  const getLeafletOrderStats = async (): Promise<LeafletStatsData> => {
    try {
      const response = await apiClient.get('/api/v1/leaflet-stats/');
      return response || defaultLeafletStatsData;
    } catch (error) {
      console.error('Error fetching leaflet stats:', error);
      return defaultLeafletStatsData;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/80 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-lg">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const fullName = user.fullName === "Апти" 
    ? "Салам Алейкум Апти" 
    : `Привет, ${user.fullName || "Админ"}`;

  // Безопасные вычисления
  const avgCheckall = profitStats?.count && profitStats.count > 0
    ? Math.round(profitStats.received / profitStats.count)
    : 0;

  const avgProfitall = profitStats?.count && profitStats.count > 0
    ? Math.round((profitStats.received - profitStats.outlay) / profitStats.count)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
      <div className="container mx-auto px-4 py-8">
        {/* Заголовок */}
        <div className="bg-card rounded-2xl shadow-lg p-6 mb-8 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{fullName}</h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Обзор статистики и метрик
              </p>
            </div>
            <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">Админ панель</span>
            </div>
          </div>
        </div>

        {/* Цели и метрики */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <StatCard 
            title="📆 За сегодня" 
            stats={todayStats} 
            target={target?.day || 0} 
            icon={<Calendar className="w-6 h-6" />}
          />
          <StatCard 
            title="🗓️ За месяц" 
            stats={monthStats} 
            target={target?.month || 0} 
            icon={<Calendar className="w-6 h-6" />}
          />
          
          <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl shadow-lg p-6 text-primary-foreground">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6" />
              <h2 className="text-xl font-bold">💎 Чистая прибыль</h2>
            </div>
            <p className="text-3xl font-bold mb-4">
              {(profitStats?.totalProfit || 0).toLocaleString()} ₽
            </p>
            
            <div className="space-y-2 text-primary-foreground/90">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  Зарплата мастеров:
                </span>
                <span className="font-semibold">
                  {(profitStats?.receivedworker || 0).toLocaleString()} ₽
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <Receipt className="w-4 h-4" />
                  Расходы:
                </span>
                <span className="font-semibold">
                  {(profitStats?.outlay || 0).toLocaleString()} ₽
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Средний чек:
                </span>
                <span className="font-semibold">{avgCheckall.toLocaleString()} ₽</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Чистый средний чек:
                </span>
                <span className="font-semibold">{avgProfitall.toLocaleString()} ₽</span>
              </div>
            </div>
          </div>
        </div>

        {/* Статусы заказов */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {Object.entries(statusGroupMap).map(([groupKey, statuses]) => {
            const totalCount = statuses.reduce(
              (acc, status) => acc + (statusCounts[status] || 0),
              0
            );

            return (
              <StatusGroupCard 
                key={groupKey}
                groupKey={groupKey}
                statuses={statuses}
                totalCount={totalCount}
                statusCounts={statusCounts}
              />
            );
          })}
        </div>

        {/* Статистика по листовкам */}
        <div className="bg-card rounded-2xl shadow-lg p-6 mb-8 border border-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <FileText className="w-6 h-6 text-accent" />
              📦 Статистика по листовкам
            </h2>
            <Link 
              href="/advertising"
              className="flex items-center gap-2 text-primary hover:text-primary/80 font-semibold"
            >
              Перейти к листовкам
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ссылки по статусам */}
            <div className="space-y-3">
              {Object.entries(statusesUILeaflet).map(([key, { label, color, bgColor, icon: Icon }]) => (
                <Link
                  key={key}
                  href={`/advertising?status=${key}`}
                  className="flex justify-between items-center p-4 rounded-xl border border-border hover:border-primary/50 hover:shadow-md transition-all duration-200 group bg-card"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${bgColor}`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <span className="font-medium text-foreground group-hover:text-primary">{label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-bold ${color}`}>
                      {(leafletStats[key as keyof Omit<LeafletStatsData, 'totalDistributorProfitTOpay' | 'totalDistributorProfitPaid'>] || 0).toLocaleString()}
                    </span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                  </div>
                </Link>
              ))}
            </div>

            {/* Финансовая часть */}
            <div className="bg-gradient-to-br from-accent to-accent/80 rounded-xl p-6 text-accent-foreground">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Финансы разносчиков
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-accent/60 rounded-lg">
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Всего к выплате:
                  </span>
                  <span className="font-bold text-lg">
                    {(leafletStats?.totalDistributorProfitTOpay || 0).toLocaleString()} ₽
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-500/80 rounded-lg">
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Выплачено:
                  </span>
                  <span className="font-bold text-lg">
                    {(leafletStats?.totalDistributorProfitPaid || 0).toLocaleString()} ₽
                  </span>
                </div>
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
    </div>
  );
}

// Компонент карточки статистики
function StatCard({ title, stats, target, icon }: StatCardProps) {
  // Безопасное извлечение данных
  const { profit = 0, count = 0, received = 0, outlay = 0, receivedworker = 0 } = stats || {};

  const base = target || 1;
  const profitPercent = Math.round((profit / base) * 100);
  const costPercent = Math.min(100 - profitPercent, 100);

  const avgCheck = count && count > 0 ? Math.round(received / count) : 0;
  const avgProfit = count && count > 0 ? Math.round((received - outlay) / count) : 0;

  return (
    <div className="bg-card rounded-2xl shadow-lg p-6 border border-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          {icon}
          {title}
        </h2>
        <Target className="w-5 h-5 text-muted-foreground" />
      </div>

      <p className="text-2xl font-bold text-foreground mb-2">
        {received.toLocaleString()} ₽
      </p>
      <p className="text-sm text-muted-foreground mb-4">Сумма закрытия</p>

      {/* Прогресс бар */}
      <div className="w-full bg-muted rounded-full h-3 mb-4 flex overflow-hidden relative group">
        <div
          className="bg-green-500 h-3 transition-all duration-300"
          style={{ width: `${profitPercent}%` }}
        >
          <div className="absolute left-0 -top-8 bg-card text-foreground text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none border border-border shadow-lg">
            Прибыль: {profitPercent}% от цели ({base.toLocaleString("ru-RU")} ₽)
          </div>
        </div>
        <div
          className="bg-red-400 h-3 transition-all duration-300"
          style={{ width: `${costPercent}%` }}
        />
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">📈 Прибыль:</span>
          <span className="font-semibold text-green-600">{profit.toLocaleString()} ₽</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">📦 Заказов:</span>
          <span className="font-semibold">{count}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">📊 Средний чек:</span>
          <span className="font-semibold text-blue-600">{avgCheck.toLocaleString()} ₽</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">💰 Чистый чек:</span>
          <span className="font-semibold text-green-600">{avgProfit.toLocaleString()} ₽</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">🏢 Расходы:</span>
          <span className="font-semibold text-red-600">{outlay.toLocaleString()} ₽</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">👷 Зарплатам мастеров:</span>
          <span className="font-semibold text-orange-600">{receivedworker.toLocaleString()} ₽</span>
        </div>
      </div>
    </div>
  );
}

// Компонент группы статусов
function StatusGroupCard({ groupKey, statuses, totalCount, statusCounts }: StatusGroupCardProps) {
  return (
    <div className="bg-card rounded-2xl shadow-lg p-6 border border-border">
      <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
        <Package className="w-5 h-5 text-primary" />
        {groupTitleMap[groupKey as keyof typeof groupTitleMap]}
      </h2>
      
      <div className="text-4xl font-bold text-primary mb-6 text-center">
        {totalCount}
      </div>

      <div className="space-y-3">
        {statuses.map((status) => {
          const statusConfig = statusesUI[status as keyof typeof statusesUI];
          const Icon = statusConfig.icon;
          
          return (
            <Link
              key={status}
              href={`/admin/orders?status=${status}`}
              className="flex justify-between items-center p-3 rounded-xl border border-border hover:border-primary/50 hover:shadow-md transition-all duration-200 group bg-card"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${statusConfig.bgColor}`}>
                  <Icon className={`w-4 h-4 ${statusConfig.color}`} />
                </div>
                <span className="text-foreground group-hover:text-primary">
                  {statusConfig.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-semibold ${statusConfig.color}`}>
                  {(statusCounts[status] || 0).toLocaleString()}
                </span>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}