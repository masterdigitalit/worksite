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

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

// Переводим ключи на русский
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

  useEffect(() => {
    fetch("/api/statistics/monthly")
      .then((res) => res.json())
      .then(({ monthlyStats, paymentTypesSummary, visitTypeSummary }) => {
        setData(monthlyStats);
        setPaymentTypes(paymentTypesSummary);
        setVisitType(visitTypeSummary);
      })
      .catch(() => alert("Ошибка загрузки статистики"));
  }, []);

  // Добавляем переведённые типы
  const translatedPayments = paymentTypes.map((item) => ({
    ...item,
    type: paymentTypeMap[item.type] || item.type,
  }));

  const translatedVisits = visitType.map((item) => ({
    ...item,
    type: visitTypeMap[item.type] || item.type,
  }));

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
      <h1 className="mb-6 text-center text-2xl font-bold">
        📊 Статистика заказов по месяцам
      </h1>

      {/* Верхний линейный график */}
      <div className="rounded bg-white p-6 shadow mb-8" style={{ width: "100%", height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 50, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="profit" stroke="#4f46e5" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Нижний блок с двумя круговыми диаграммами */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "2rem",
          flexWrap: "wrap",
        }}
      >
        <div className="rounded bg-white p-6 shadow" style={{ flex: "1 1 300px", height: 300 }}>
          <h2 className="text-center mb-4 font-semibold">Тип оплаты</h2>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={translatedPayments}
                dataKey="count"
                nameKey="type"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {translatedPayments.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded bg-white p-6 shadow" style={{ flex: "1 1 300px", height: 300 }}>
          <h2 className="text-center mb-4 font-semibold">Тип выезда</h2>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={translatedVisits}
                dataKey="count"
                nameKey="type"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {translatedVisits.map((entry, index) => (
                  <Cell key={`cell-visit-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}


const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const avgCheck = data.count ? Math.round(data.received / data.count) : 0;
    const avgProfit = data.count ? Math.round(data.profit / data.count) : 0;

    return (
      <div className="space-y-1 rounded bg-white p-4 text-sm shadow">
        <p className="font-bold">{label}</p>
        <p>
          📈 Сумма закрытия:{" "}
          <span className="font-semibold text-green-600">
            {data.received} ₽
          </span>
        </p>
        <p>
          📈 Прибыль:{" "}
          <span className="font-semibold text-green-600">
            {data.profit} ₽
          </span>
        </p>
        <p>
          📦 Заказов: <span className="font-semibold">{data.count}</span>
        </p>
        <p>
          📊 Средний чек:{" "}
          <span className="font-semibold text-blue-700">{avgCheck} ₽</span>
        </p>
        <p>
          💰 Чистый средний чек:{" "}
          <span className="font-semibold text-green-600">{avgProfit} ₽</span>
        </p>
        <p>
          🏢 Расходы:{" "}
          <span className="font-semibold text-red-600">{data.outlay} ₽</span>
        </p>
        <p>
          🕛 Заказов перенесено:{" "}
          <span className="font-semibold text-red-600">
            {data.wastimechanged}
          </span>
        </p>
        <p>
          👷 Зарплата:{" "}
          <span className="font-semibold text-orange-600">
            {data.receivedworker} ₽
          </span>
        </p>
      </div>
    );
  }

  return null;
};
