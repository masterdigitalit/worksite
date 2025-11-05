"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { PieBlock } from "./components/PieBlockStat";
import { apiClient } from "lib/api-client";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

type StatsItem = {
  month: string;
  profit: number;
  received: number;
  outlay: number;
  receivedworker: number;
  wastimechanged: number;
  count: number;
};

type PaymentTypeItem = {
  type: string;
  count: number;
};

type VisitTypeItem = {
  type: string;
  count: number;
};

type AvailableYearMonth = {
  year: number;
  months: number[];
};

type StatisticsResponse = {
  monthlyStats: StatsItem[];
  paymentTypesSummary: PaymentTypeItem[];
  visitTypeSummary: VisitTypeItem[];
};

const paymentTypeMap: Record<string, string> = {
  CASH: "Наличные",
  CARD: "Карта", 
  TRANSFER: "Перевод",
};

const visitTypeMap: Record<string, string> = {
  URGENT: "Срочный",
  PLANNED: "Плановый",
  CONSULTATION: "Консультация",
};

export default function StatisticsPage() {
  const [data, setData] = useState<StatsItem[]>([]);
  const [paymentTypes, setPaymentTypes] = useState<PaymentTypeItem[]>([]);
  const [visitType, setVisitType] = useState<VisitTypeItem[]>([]);
  const [availableDates, setAvailableDates] = useState<AvailableYearMonth[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [showReceived, setShowReceived] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"charts" | "numbers">("charts");
  const [loading, setLoading] = useState<boolean>(true);

  // Загрузка доступных периодов
  useEffect(() => {
    const fetchAvailablePeriods = async () => {
      try {
        setLoading(true);
        const data = await apiClient.get<AvailableYearMonth[]>("/api/v1/orders/statistics/periods/");
        
        setAvailableDates(data.sort((a, b) => b.year - a.year));
        
        if (data.length > 0) {
          setSelectedYear(data[0].year.toString());
        }
      } catch (error) {
        console.error("Ошибка загрузки доступных дат:", error);
        alert("Ошибка загрузки доступных дат");
      } finally {
        setLoading(false);
      }
    };

    fetchAvailablePeriods();
  }, []);

  // Загрузка статистики при изменении фильтров
  useEffect(() => {
    const fetchStatistics = async () => {
      if (!selectedYear) return;

      try {
        setLoading(true);
        
        let url = `/api/v1/orders/statistics/?year=${selectedYear}`;
        if (selectedMonth !== "") {
          url += `&month=${selectedMonth}`;
        }

        const result = await apiClient.get<StatisticsResponse>(url);
        
        setData(result.monthlyStats || []);
        setPaymentTypes(result.paymentTypesSummary || []);
        setVisitType(result.visitTypeSummary || []);
      } catch (error) {
        console.error("Ошибка загрузки статистики:", error);
        alert("Ошибка загрузки статистики");
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [selectedYear, selectedMonth]);

  // Добавляем вычисление средних значений в данные
  const dataWithAverages = data.map(item => ({
    ...item,
    avgCheck: item.count > 0 ? Math.round(item.received / item.count) : 0,
    avgProfitPerOrder: item.count > 0 ? Math.round(item.profit / item.count) : 0,
  }));

  const translatedPayments = paymentTypes.map((item) => ({
    ...item,
    type: paymentTypeMap[item.type] || item.type,
  }));

  const translatedVisits = visitType.map((item) => ({
    ...item,
    type: visitTypeMap[item.type] || item.type,
  }));

  const monthsMap = [
    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
  ];

  const selectedYearMonths = availableDates.find((d) => d.year.toString() === selectedYear)?.months ?? [];

  // Расчет общей статистики
  const totalStats = data.reduce((acc, item) => ({
    totalProfit: acc.totalProfit + item.profit,
    totalReceived: acc.totalReceived + item.received,
    totalOrders: acc.totalOrders + item.count,
    totalTransfers: acc.totalTransfers + item.wastimechanged,
    totalOutlay: acc.totalOutlay + item.outlay,
  }), { totalProfit: 0, totalReceived: 0, totalOrders: 0, totalTransfers: 0, totalOutlay: 0 });

  if (loading && data.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Загрузка статистики...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className=" px-4 sm:px-6 lg:px-8">
        {/* Заголовок и общая статистика */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Аналитика заказов</h1>
          <p className="text-gray-600 mb-6">Детальная статистика по завершенным заказам</p>
          
          {/* Карточки общей статистики - теперь 5 окошек */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-4 border border-blue-100">
              <div className="text-2xl font-bold text-blue-600">{totalStats.totalOrders}</div>
              <div className="text-sm text-gray-500">Всего заказов</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border border-green-100">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(totalStats.totalReceived).toLocaleString()} ₽
              </div>
              <div className="text-sm text-gray-500">Общая выручка</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border border-purple-100">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(totalStats.totalProfit).toLocaleString()} ₽
              </div>
              <div className="text-sm text-gray-500">Чистая прибыль</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border border-orange-100">
              <div className="text-2xl font-bold text-orange-600">{totalStats.totalTransfers}</div>
              <div className="text-sm text-gray-500">Перенесено заказов</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border border-red-100">
              <div className="text-2xl font-bold text-red-600">
                {Math.round(totalStats.totalOutlay).toLocaleString()} ₽
              </div>
              <div className="text-sm text-gray-500">Общие расходы</div>
            </div>
          </div>
        </div>

        {/* Панель управления */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Год:</label>
                <select
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(e.target.value);
                    setSelectedMonth("");
                  }}
                  disabled={loading}
                >
                  {availableDates.map((item) => (
                    <option key={item.year} value={item.year.toString()}>
                      {item.year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Месяц:</label>
                <select
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Все месяцы</option>
                  {selectedYearMonths.map((m) => (
                    <option key={m} value={m.toString()}>
                      {monthsMap[m]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showReceived"
                  checked={showReceived}
                  onChange={(e) => setShowReceived(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={loading}
                />
                <label htmlFor="showReceived" className="ml-2 text-sm text-gray-700">
                  Показывать выручку и средний чек
                </label>
              </div>

              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab("charts")}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    activeTab === "charts"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  📈 Графики
                </button>
                <button
                  onClick={() => setActiveTab("numbers")}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    activeTab === "numbers"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  🔢 Цифры
                </button>
              </div>
            </div>
          </div>

          {loading && data.length > 0 && (
            <div className="flex justify-center items-center py-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-gray-600">Обновление данных...</span>
            </div>
          )}
        </div>

        {activeTab === "charts" ? (
          <>
            {/* Основной график */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {selectedMonth ? "Динамика по дням" : "Динамика по месяцам"}
              </h2>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dataWithAverages} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fill: '#6B7280' }}
                      axisLine={{ stroke: '#E5E7EB' }}
                    />
                    <YAxis 
                      tick={{ fill: '#6B7280' }}
                      axisLine={{ stroke: '#E5E7EB' }}
                      tickFormatter={(value) => `${value.toLocaleString()} ₽`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      dot={<CustomDot />}
                      name="Прибыль"
                      activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                    />
                    {showReceived && (
                      <>
                        <Line
                          type="monotone"
                          dataKey="received"
                          stroke="#10B981"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          name="Выручка"
                          activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="avgCheck"
                          stroke="#8B5CF6"
                          strokeWidth={2}
                          strokeDasharray="3 3"
                          name="Средний чек"
                          activeDot={{ r: 6, stroke: '#8B5CF6', strokeWidth: 2 }}
                        />
                      </>
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Круговые диаграммы и дополнительная статистика */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <PieBlock 
                  title="📊 Типы оплаты" 
                  data={translatedPayments}
                  colors={COLORS}
                />
                <PieBlock 
                  title="🚗 Типы выездов" 
                  data={translatedVisits}
                  colors={COLORS.slice().reverse()}
                />
              </div>

              {/* Дополнительная статистика */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Ключевые метрики</h3>
                <div className="space-y-4">
                  {dataWithAverages.slice(-5).reverse().map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">{item.month}</span>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-green-600">
                          {Math.round(item.profit).toLocaleString()} ₽
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.count} заказов • {item.avgCheck?.toLocaleString()} ₽/чек
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Табличное представление */
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Детальная статистика</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Период
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Заказы
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Выручка
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Прибыль
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Средний чек
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Расходы
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Переносы
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dataWithAverages.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.month}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                        {Math.round(item.received).toLocaleString()} ₽
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-semibold">
                        {Math.round(item.profit).toLocaleString()} ₽
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600 font-semibold">
                        {item.avgCheck?.toLocaleString()} ₽
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                        {Math.round(item.outlay).toLocaleString()} ₽
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600">
                        {item.wastimechanged}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-4 space-y-2">
        <p className="font-bold text-gray-900 text-sm border-b pb-2">{label}</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          <span className="text-gray-600">Выручка:</span>
          <span className="font-semibold text-green-600 text-right">{data.received.toLocaleString()} ₽</span>
          
          <span className="text-gray-600">Прибыль:</span>
          <span className="font-semibold text-blue-600 text-right">{data.profit.toLocaleString()} ₽</span>
          
          <span className="text-gray-600">Заказов:</span>
          <span className="font-semibold text-right">{data.count}</span>
          
          <span className="text-gray-600">Средний чек:</span>
          <span className="font-semibold text-purple-600 text-right">{data.avgCheck?.toLocaleString()} ₽</span>
          
          <span className="text-gray-600">Средняя прибыль:</span>
          <span className="font-semibold text-right">
            {data.avgProfitPerOrder?.toLocaleString()} ₽
          </span>
          
          <span className="text-gray-600">Расходы:</span>
          <span className="font-semibold text-red-600 text-right">{data.outlay.toLocaleString()} ₽</span>
          
          <span className="text-gray-600">Переносы:</span>
          <span className="font-semibold text-orange-600 text-right">{data.wastimechanged}</span>
        </div>
      </div>
    );
  }
  return null;
};

const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;
  const transfers = payload.wastimechanged || 0;

  if (transfers === 0) {
    return (
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill="#3B82F6"
        stroke="#fff"
        strokeWidth={2}
        className="drop-shadow-sm"
      />
    );
  }

  const maxTransfers = 10;
  const clamped = Math.min(transfers, maxTransfers);
  const alpha = 0.3 + (clamped / maxTransfers) * 0.7;

  return (
    <circle
      cx={cx}
      cy={cy}
      r={6}
      fill={`rgba(239, 68, 68, ${alpha.toFixed(2)})`}
      stroke="#fff"
      strokeWidth={2}
      className="drop-shadow-sm"
    />
  );
};