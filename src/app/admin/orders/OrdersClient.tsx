"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";
import { apiClient } from "lib/api-client";

const visitTypeLabels = {
  FIRST: "Первичный",
  GARAGE: "Гарантийный",
  REPEAT: "Повторный",
};

const statusLabels = {
  PENDING: "Ожидает",
  ON_THE_WAY: "В пути",
  IN_PROGRESS: "В работе",
  IN_PROGRESS_SD: "В работе (СД)",
  DECLINED: "Отклонён",
  CANCEL_CC: "Отмена (Колл-центр)",
  CANCEL_BRANCH: "Отмена (Филиал)",
  COMPLETED: "Завершён",
};

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  ON_THE_WAY: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-orange-100 text-orange-800",
  IN_PROGRESS_SD: "bg-orange-200 text-orange-900",
  CANCELLED: "bg-red-100 text-red-800",
  CANCEL_CC: "bg-red-200 text-red-900",
  CANCEL_BRANCH: "bg-red-300 text-red-900",
  COMPLETED: "bg-green-100 text-green-800",
};

const hiddenStatuses = ["DECLINED", "CANCEL_CC", "CANCEL_BRANCH", "COMPLETED"];

function isOverdue(dateStr: string) {
  const today = new Date().toISOString().slice(0, 10);
  const dateOnly = new Date(dateStr).toISOString().slice(0, 10);
  return dateOnly < today;
}

function canHighlight(status: string) {
  return ["PENDING", "ON_THE_WAY"].includes(status);
}

interface Order {
  id: number;
  full_name: string;
  phone: string;
  address: string;
  visit_type: string;
  status: string;
  arrive_date: string;
  city: {
    name: string;
  };
  received: number | null;
  outlay: number | null;
  received_worker: number | null;
}

type OrdersClientProps = {
  visibility: "FULL" | "MINIMAL" | "PARTIAL";
};

export default function OrdersClient({ visibility }: OrdersClientProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filtered, setFiltered] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [visitType, setVisitType] = useState("");
  const [arriveDateFrom, setArriveDateFrom] = useState("");
  const [arriveDateTo, setArriveDateTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  // --- Авто подстановка фильтров из URL ---
  useEffect(() => {
    setStatus(searchParams.get("status") || "");
    setVisitType(searchParams.get("visitType") || "");
    setSearch(searchParams.get("search") || "");
    setArriveDateFrom(searchParams.get("arriveDateFrom") || "");
    setArriveDateTo(searchParams.get("arriveDateTo") || "");
  }, [searchParams]);

  // --- Загрузка заказов через api-client ---
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.get<Order[]>("/api/v1/orders/");
        setOrders(data);
        setFiltered(data);
      } catch (error: any) {
        console.error("Failed to load orders:", error);
        setError(error.message || "Ошибка загрузки заказов");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);
console.log(orders)
  // --- Фильтрация заказов ---
  useEffect(() => {
    const filteredOrders = orders.filter((o) => {
      const orderStatus = o.status?.trim();
      if (visibility === "MINIMAL" && hiddenStatuses.includes(orderStatus)) return false;

      if (search.startsWith("#")) return o.id.toString().includes(search.slice(1));

      const matchesSearch =
        o.full_name.toLowerCase().includes(search.toLowerCase()) ||
        o.phone.includes(search) ||
        o.address.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = !status || orderStatus === status;
      const matchesVisitType = !visitType || o.visit_type === visitType;

      const orderDate = new Date(o.arrive_date).toISOString().slice(0, 10);
      const matchesFrom = !arriveDateFrom || orderDate >= arriveDateFrom;
      const matchesTo = !arriveDateTo || orderDate <= arriveDateTo;

      return matchesSearch && matchesStatus && matchesVisitType && matchesFrom && matchesTo;
    });

    setFiltered(filteredOrders);
  }, [search, status, visitType, arriveDateFrom, arriveDateTo, orders, visibility]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Загрузка заказов...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">📋 Заказы</h1>
        <button
          onClick={() => router.push("/admin/orders/new")}
          className="rounded bg-green-600 px-4 py-2 text-white transition hover:bg-green-700"
        >
          Добавить заказ
        </button>
      </div>

      {error && (
        <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-6">
          {error}
          <button 
            onClick={() => window.location.reload()}
            className="ml-4 text-red-300 underline hover:text-red-100"
          >
            Попробовать снова
          </button>
        </div>
      )}

      {/* Фильтры */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Поиск
            </label>
            <input
              placeholder="ФИО, адрес, телефон, #ID"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Статус
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Все статусы</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Тип визита
            </label>
            <select
              value={visitType}
              onChange={(e) => setVisitType(e.target.value)}
              className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Все типы</option>
              {Object.entries(visitTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Дата с
              </label>
              <input
                type="date"
                value={arriveDateFrom}
                onChange={(e) => setArriveDateFrom(e.target.value)}
                className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Дата по
              </label>
              <input
                type="date"
                value={arriveDateTo}
                onChange={(e) => setArriveDateTo(e.target.value)}
                className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Таблица */}
      <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">ФИО</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Телефон</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Адрес</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Тип</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Статус</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Дата визита</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Город</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Прибыль</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Затраты</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Оплата</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-600">
              {filtered.map((order) => {
                const highlight = canHighlight(order.status);
                const overdue = highlight && isOverdue(order.arrive_date);

                // Расчет прибыли
                const profit = order.received && order.outlay != null && order.received_worker != null
                  ? order.received - order.outlay - order.received_worker
                  : null;

                return (
                  <tr
                    key={order.id}
                    className="cursor-pointer hover:bg-gray-700 transition"
                    onClick={() => router.push(`/admin/orders/${order.id}`)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">#{order.id}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{order.full_name}</div>
                    </td>
                    <td className="px-4 py-3 text-white">{order.phone}</td>
                    <td className="px-4 py-3">
                      <div className="text-white text-sm max-w-xs truncate">
                        {order.address}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-300">
                        {visitTypeLabels[order.visit_type as keyof typeof visitTypeLabels] || order.visit_type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={clsx(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        statusColors[order.status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"
                      )}>
                        {statusLabels[order.status as keyof typeof statusLabels] || order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-white">
                        { new Date(order.arrive_date)
          .toISOString()
          .replace("T", " ")
          .slice(0, 16)}
                      </div>
                      {overdue && (
                        <div className="text-xs text-red-400 mt-1">Просрочено</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {order.city?.name || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-green-400">
                        {profit !== null ? `${profit} ₽` : "-"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-red-400">
                      {order.outlay ? `${order.outlay} ₽` : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-blue-400">
                      {order.received ? `${order.received} ₽` : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-400">
            {search || status || visitType || arriveDateFrom || arriveDateTo 
              ? "Заказы по вашему запросу не найдены" 
              : "Заказы не найдены"
            }
          </div>
        )}
      </div>
    </div>
  );
}