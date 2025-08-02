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
} from "recharts";
import { PieBlock } from "./components/PieBlockStat";
const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

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

const paymentTypeMap: Record<string, string> = {
  HIGH: "Низкая",
  MEDIUM: "Средняя",
  LOW: "Высокая",
};

const visitTypeMap: Record<string, string> = {
  FIRST: "Первичный",
  GARAGE: "Гарантийный",
  REPEAT: "Повторный",
};

export default function StatisticsPage() {
  const [data, setData] = useState<StatsItem[]>([]);
  const [paymentTypes, setPaymentTypes] = useState<PaymentTypeItem[]>([]);
  const [visitType, setVisitType] = useState<VisitTypeItem[]>([]);
  const [availableDates, setAvailableDates] = useState<AvailableYearMonth[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [showReceived, setShowReceived] = useState<boolean>(true);

  useEffect(() => {
    fetch("/api/statistics/periods")
      .then((res) => res.json())
      .then((data: AvailableYearMonth[]) => {
        setAvailableDates(data.sort((a, b) => b.year - a.year));
        if (data.length > 0) {
          setSelectedYear(data[0].year.toString());
        }
      })
      .catch(() => alert("Ошибка загрузки доступных дат"));
  }, []);

  useEffect(() => {
    if (!selectedYear) return;

    let url = `/api/statistics/monthly?year=${selectedYear}`;
    if (selectedMonth !== "") {
      url += `&month=${selectedMonth}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then(({ monthlyStats, paymentTypesSummary, visitTypeSummary }) => {
        setData(monthlyStats);
        setPaymentTypes(paymentTypesSummary);
        setVisitType(visitTypeSummary);
      })
      .catch(() => alert("Ошибка загрузки статистики"));
  }, [selectedYear, selectedMonth]);

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

  return (
    <div
      style={{
        width: "90vw",
        maxWidth: "100%",
        margin: "0 auto",
        padding: "0 20px",
        boxSizing: "border-box",
      }}
    >
      <h1 className="mb-4 text-center text-2xl font-bold">📊 Статистика заказов</h1>

      {/* Выбор периода и переключатель */}
      <div className="mb-6 flex flex-wrap justify-center gap-4 items-center">
        <select
          className="rounded border border-gray-300 px-4 py-2 text-sm shadow focus:border-indigo-500 focus:outline-none"
          value={selectedYear}
          onChange={(e) => {
            setSelectedYear(e.target.value);
            setSelectedMonth("");
          }}
        >
          {availableDates.map((item) => (
            <option key={item.year} value={item.year.toString()}>
              {item.year}
            </option>
          ))}
        </select>

        <select
          className="rounded border border-gray-300 px-4 py-2 text-sm shadow focus:border-indigo-500 focus:outline-none"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          <option value="">Все месяцы</option>
          {selectedYearMonths.map((m) => (
            <option key={m} value={m.toString()}>
              {monthsMap[m]}
            </option>
          ))}
        </select>
<label className="inline-flex items-center space-x-3 cursor-pointer text-sm text-gray-700">
  <input
    type="checkbox"
    checked={showReceived}
    onChange={(e) => setShowReceived(e.target.checked)}
    className="form-checkbox h-5 w-5 text-indigo-600 transition duration-150 ease-in-out"
  />
  <span className="select-none font-medium">Показывать <span className="text-indigo-600">«сумму закрытия»</span></span>
</label>

      </div>

      {/* Линейная диаграмма */}
      <div className="rounded bg-white p-6 shadow mb-8" style={{ width: "100%", height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 50, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="profit"
              stroke="#4f46e5"
              strokeWidth={3}
              dot={<CustomDot />}
              name="Прибыль"
            />
            {showReceived && (
              <Line
                type="monotone"
                dataKey="received"
                stroke="#10b981"
                strokeWidth={2}
                name="Получено"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Круговые диаграммы */}
      <div className="flex flex-wrap justify-between gap-8">
        <PieBlock title="Тип оплаты" data={translatedPayments} />
        <PieBlock title="Тип выезда" data={translatedVisits} />
      </div>
    </div>
  );
}

// function PieBlock({ title, data }: { title: string; data: { type: string; count: number }[] }) {
//   return (
//     <div className="rounded bg-white p-6 shadow" style={{ flex: "1 1 300px", height: 300 }}>
//       <h2 className="text-center mb-4 font-semibold">{title}</h2>
//       <ResponsiveContainer width="100%" height="100%">
//         <PieChart>
//           <Pie data={data} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={80} label>
//             {data.map((entry, index) => (
//               <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//             ))}
//           </Pie>
//           <Legend verticalAlign="bottom" height={36} />
//         </PieChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const avgCheck = data.count ? Math.round(data.received / data.count) : 0;
    const avgProfit = data.count ? Math.round((data.received - data.outlay) / data.count) : 0;

    return (
      <div className="space-y-1 rounded bg-white p-4 text-sm shadow">
        <p className="font-bold">{label}</p>
        <p>📈 Сумма закрытия: <span className="font-semibold text-green-600">{data.received} ₽</span></p>
        <p>📈 Прибыль: <span className="font-semibold text-green-600">{data.profit} ₽</span></p>
        <p>📦 Заказов: <span className="font-semibold">{data.count}</span></p>
        <p>📊 Средний чек: <span className="font-semibold text-blue-700">{avgCheck} ₽</span></p>
        <p>💰 Чистый средний чек: <span className="font-semibold text-green-600">{avgProfit} ₽</span></p>
        <p>🏢 Расходы: <span className="font-semibold text-red-600">{data.outlay} ₽</span></p>
        <p>🕛 Заказов перенесено: <span className="font-semibold text-red-600">{data.wastimechanged}</span></p>
        <p>👷 Зарплата: <span className="font-semibold text-orange-600">{data.receivedworker} ₽</span></p>
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
        fill="#4f46e5"
        stroke="#fff"
        strokeWidth={2}
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
      fill={`rgba(255, 0, 0, ${alpha.toFixed(2)})`}
      stroke="#fff"
      strokeWidth={2}
    />
  );
};
