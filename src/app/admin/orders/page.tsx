"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const visitTypeLabels = {
  FIRST: "Первичный",
  GARAGE: "Гарантийный",
  REPEAT: "Повторный",
};

const statusLabels = {
  PENDING: "Ожидает",
  ON_THE_WAY: "В пути",
  IN_PROGRESS: "В процессе",
  IN_PROGRESS_SD: "В процессе (СД)",
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

const visitTypes = [
  { label: "Все", value: "" },
  { label: "Первичный", value: "FIRST" },
  { label: "Гарантийный", value: "GARAGE" },
  { label: "Повторный", value: "REPEAT" },
];

const statuses = [
  { label: "Все", value: "" },
  { label: "Ожидает", value: "PENDING" },
  { label: "В пути", value: "ON_THE_WAY" },
  { label: "В процессе", value: "IN_PROGRESS" },
  { label: "В процессе (СД)", value: "IN_PROGRESS_SD" },
  { label: "Отклонён", value: "DECLINED" },
  { label: "Отмена (Колл-центр)", value: "CANCEL_CC" },
  { label: "Отмена (Филиал)", value: "CANCEL_BRANCH" },
  { label: "Завершён", value: "DONE" },
];

function isOverdue(date) {
  const now = new Date();
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d < now;
}

function canHighlight(status) {
  const takenStatuses = ["PENDING", "ON_THE_WAY"];
  return takenStatuses.includes(status);
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [visitType, setVisitType] = useState("");
  const [arriveDateFrom, setArriveDateFrom] = useState("");
  const [arriveDateTo, setArriveDateTo] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const statusFromParams = searchParams.get("status") || "";
    const visitTypeFromParams = searchParams.get("visitType") || "";
    setStatus(statusFromParams);
    setVisitType(visitTypeFromParams);
  }, [searchParams]);

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
      const matchesSearch =
        o.fullName.toLowerCase().includes(search.toLowerCase()) ||
        o.phone.includes(search) ||
        o.address.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = !status || o.status === status;
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
  }, [search, status, visitType, arriveDateFrom, arriveDateTo, orders]);

  return (
    <div className="space-y-4 p-4">
      <button
        onClick={() => router.push("/admin/orders/new")}
        className="mb-4 rounded bg-green-600 px-4 py-2 text-white transition hover:bg-green-700"
      >
        Добавить заказ
      </button>

      <style>
        {`
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
          .blinking-red {
            color: red;
            animation: blink 1s infinite;
            font-weight: bold;
          }
          .overdue-label {
            color: red;
            font-weight: 700;
            font-size: 0.75rem;
            margin-bottom: 2px;
          }
        `}
      </style>

      <div className="flex flex-col flex-wrap gap-2 md:flex-row">
        <input
          placeholder="Поиск (ФИО, адрес, телефон)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded border p-2 md:w-1/3"
        />

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            router.push(
              `/admin/orders?status=${e.target.value}&visitType=${visitType}`,
            );
          }}
          className="w-full rounded border p-2 md:w-1/4"
        >
          {statuses.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <select
          value={visitType}
          onChange={(e) => {
            setVisitType(e.target.value);
            router.push(
              `/admin/orders?status=${status}&visitType=${e.target.value}`,
            );
          }}
          className="w-full rounded border p-2 md:w-1/4"
        >
          {visitTypes.map((v) => (
            <option key={v.value} value={v.value}>
              {v.label}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={arriveDateFrom}
          onChange={(e) => setArriveDateFrom(e.target.value)}
          className="w-full rounded border p-2 md:w-1/4"
          placeholder="Дата от"
        />
        <input
          type="date"
          value={arriveDateTo}
          onChange={(e) => setArriveDateTo(e.target.value)}
          className="w-full rounded border p-2 md:w-1/4"
          placeholder="Дата до"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead className="bg-gray-200 text-left">
            <tr>
              <th className="border p-2">ФИО</th>
              <th className="border p-2">Телефон</th>
              <th className="border p-2">Адрес</th>
              <th className="border p-2">Тип</th>
              <th className="border p-2">Статус</th>
              <th className="border p-2">Дата визита</th>
              <th className="border p-2">Город</th>
              <th className="border p-2">Прибор</th>
              <th className="border p-2">Прибыль</th>
              <th className="border p-2">Затраты</th>
              <th className="border p-2">Нужен звонок</th>
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
                  <td className="border p-4">{order.fullName}</td>
                  <td className="border p-2">{order.phone}</td>
                  <td className="border p-2">{order.address}</td>
                  <td className="border p-2">
                    {visitTypeLabels[order.visitType] || order.visitType}
                  </td>
                  <td
                    className={`border p-2 font-medium ${statusColors[order.status] || ""}`}
                  >
                    {statusLabels[order.status] || order.status}
                  </td>
                  <td className="border p-2">
                    {overdue && <div className="overdue-label">Просрочено</div>}
                    <div className={overdue ? "blinking-red" : ""}>
                      {new Date(order.arriveDate).toLocaleString("ru-RU", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </td>
                  <td className="border p-2">{order.city}</td>
                  <td className="border p-2">{order.equipmentType}</td>
                  <td className="border p-2">
                    {order.received - order.outlay - order.receivedworker ??
                      "-"}
                  </td>
                  <td className="border p-2">{order.outlay ?? "-"}</td>
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
