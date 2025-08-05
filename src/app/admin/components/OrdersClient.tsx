"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";

const visitTypeLabels = {
  FIRST: "Первичный",
  GARAGE: "Гарантийный",
  REPEAT: "Повторный",
};

const visitTypeRowColors = {
  FIRST: "bg-pink-100",
  REPEAT: "bg-teal-100",
  GARAGE: "bg-slate-100",
};

const statusLabels = {
  PENDING: "Ожидает",
  ON_THE_WAY: "В пути",
  IN_PROGRESS: "В работе",
  IN_PROGRESS_SD: "В работе (СД)",
  DECLINED: "Отклонён",
  CANCEL_CC: "Отмена (Колл-центр)",
  CANCEL_BRANCH: "Отмена (Филиал)",
  DONE: "Завершён",
};

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  ON_THE_WAY: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-orange-100 text-orange-800",
  IN_PROGRESS_SD: "bg-orange-200 text-orange-900",
  DECLINED: "bg-red-100 text-red-800",
  CANCEL_CC: "bg-red-200 text-red-900",
  CANCEL_BRANCH: "bg-red-300 text-red-900",
  DONE: "bg-green-100 text-green-800",
};

const hiddenStatuses = ["DECLINED", "CANCEL_CC", "CANCEL_BRANCH", "DONE"];

function isOverdue(dateStr: string) {
  const today = new Date().toISOString().slice(0, 10);
  const dateOnly = new Date(dateStr).toISOString().slice(0, 10);
  return dateOnly < today;
}

function canHighlight(status: string) {
  return ["PENDING", "ON_THE_WAY"].includes(status);
}

type OrdersClientProps = {
  visibility: "FULL" | "MINIMAL" | "PARTIAL";
};

export default function OrdersClient({ visibility }: OrdersClientProps) {
  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [visitType, setVisitType] = useState("");
  const [arriveDateFrom, setArriveDateFrom] = useState("");
  const [arriveDateTo, setArriveDateTo] = useState("");

  const router = useRouter();

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
        setFiltered(data);
      });
  }, []);

useEffect(() => {
  const filtered = orders.filter((o) => {
    const orderStatus = o.status?.trim(); // Защита от undefined и лишних пробелов
		console.log(orderStatus, visibility)

    // Скрыть определённые статусы при MINIMAL
    if (visibility === "MINIMAL" && hiddenStatuses.includes(orderStatus)) {
      return false;
    }

    if (search.startsWith("#")) {
      const idSearch = search.slice(1);
      return o.id.toString().includes(idSearch);
    }

    const matchesSearch =
      o.fullName.toLowerCase().includes(search.toLowerCase()) ||
      o.phone.includes(search) ||
      o.address.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = !status || orderStatus === status;
    const matchesVisitType = !visitType || o.visitType === visitType;

    const orderDate = new Date(o.arriveDate).toISOString().slice(0, 10);
    const matchesFrom = !arriveDateFrom || orderDate >= arriveDateFrom;
    const matchesTo = !arriveDateTo || orderDate <= arriveDateTo;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesVisitType &&
      matchesFrom &&
      matchesTo
    );
  });

  setFiltered(filtered);
}, [search, status, visitType, arriveDateFrom, arriveDateTo, orders, visibility]);


  return (
    <div className="space-y-4 p-4">
      <button
        onClick={() => router.push("/admin/orders/new")}
        className="mb-4 rounded bg-green-600 px-4 py-2 text-white transition hover:bg-green-700"
      >
        Добавить заказ
      </button>

      <div className="flex flex-col flex-wrap gap-2 md:flex-row">
        <input
          placeholder="Поиск (ФИО, адрес, телефон, #ID)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded border p-2 md:w-1/3"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full rounded border p-2 md:w-1/4"
        >
          <option value="">Все статусы</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <select
          value={visitType}
          onChange={(e) => setVisitType(e.target.value)}
          className="w-full rounded border p-2 md:w-1/4"
        >
          <option value="">Все типы</option>
          {Object.entries(visitTypeLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={arriveDateFrom}
          onChange={(e) => setArriveDateFrom(e.target.value)}
          className="w-full rounded border p-2 md:w-1/4"
        />
        <input
          type="date"
          value={arriveDateTo}
          onChange={(e) => setArriveDateTo(e.target.value)}
          className="w-full rounded border p-2 md:w-1/4"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead className="bg-gray-200 text-left">
            <tr>
              <th className="w-12 border p-2 text-center">ID</th>
              <th className="w-max border p-2 whitespace-nowrap">ФИО</th>
              <th className="border p-2">Телефон</th>
              <th className="border p-2">Адрес</th>
              <th className="border p-2">Тип</th>
              <th className="border p-2">Статус</th>
              <th className="border p-2">Дата визита</th>
              <th className="border p-2">Город</th>
              <th className="border p-2">Прибор</th>
              <th className="border p-2">Прибыль</th>
              <th className="border p-2">Затраты</th>
              <th className="border p-2">Оплата</th>
              <th className="border p-2">📞</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => {
              const highlight = canHighlight(order.status);
              const overdue = highlight && isOverdue(order.arriveDate);

              return (
                <tr
                  key={order.id}
                  className="cursor-pointer border-b hover:bg-gray-100"
                  onClick={() => router.push(`/admin/orders/${order.id}`)}
                >
                  <td className="border p-2 text-center">{order.id}</td>
                  <td className="truncate overflow-hidden border p-2 whitespace-nowrap">
                    {order.fullName}
                  </td>
                  <td className="border p-2">{order.phone}</td>
                  <td className="max-w-[12rem] truncate overflow-hidden border p-2 whitespace-nowrap">
                    {order.address}
                  </td>
                  <td className={clsx("border p-2 text-center", visitTypeRowColors[order.visitType])}>
                    {visitTypeLabels[order.visitType] || order.visitType}
                  </td>
                  <td className={clsx("border p-2 font-medium", statusColors[order.status] || "")}>
                    {statusLabels[order.status] || order.status}
                  </td>
                  <td className="border p-2 text-center">
                    {overdue && <div className="text-red-600 font-bold text-xs">Просрочено</div>}
                    {new Date(order.arriveDate).toISOString().replace("T", " ").slice(0, 16)}
                  </td>
                  <td className="border p-2">{order.city}</td>
                  <td className="border p-2">{order.equipmentType}</td>
                  <td className="border p-2 text-center">
                    {order.received && order.outlay != null && order.receivedworker != null
                      ? order.received - order.outlay - order.receivedworker
                      : "-"}
                  </td>
                  <td className="border p-2 text-center">{order.outlay ?? "-"}</td>
                  <td className="border p-2 text-center">{order.received ?? "-"}</td>
                  <td className="border p-2 text-center">
                    {order.callRequired ? "✅" : "❌"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
