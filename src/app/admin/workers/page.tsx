"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Worker = {
  id: number;
  fullName: string;
  telegramUsername?: string;
  phone: string;
  ordersCompleted: number;
  totalEarned: number;
  createdAt: string;
  updatedAt: string;
};

type Manager = {
  id: string;
  username: string;
  fullName?: string;
  telegramUsername?: string;
  phone?: string;
  role: string;
  createdAt?: string;
};

export default function WorkersPage() {
  const [tab, setTab] = useState<"workers" | "managers">("workers");
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [filter, setFilter] = useState({
    fullName: "",
    phone: "",
    telegramUsername: "",
  });

  useEffect(() => {
    const endpoint = tab === "workers" ? "/api/workers" : "/api/managers";
    fetch(endpoint)
      .then((res) => res.json())
      .then((data) => {
        if (tab === "workers") setWorkers(data);
        else setManagers(data);
      })
      .catch(console.error);
  }, [tab]);

  const filteredWorkers = workers.filter((w) => {
    return (
      (!filter.fullName || w.fullName.toLowerCase().includes(filter.fullName.toLowerCase())) &&
      (!filter.phone || w.phone.includes(filter.phone)) &&
      (!filter.telegramUsername ||
        (w.telegramUsername ?? "").toLowerCase().includes(filter.telegramUsername.toLowerCase()))
    );
  });

  const filteredManagers = managers.filter((m) => {
    return (
      (!filter.fullName ||
        (m.fullName ?? "").toLowerCase().includes(filter.fullName.toLowerCase()) ||
        m.username.toLowerCase().includes(filter.fullName.toLowerCase())) &&
      (!filter.phone || (m.phone ?? "").includes(filter.phone)) &&
      (!filter.telegramUsername ||
        (m.telegramUsername ?? "").toLowerCase().includes(filter.telegramUsername.toLowerCase()))
    );
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">👥 Сотрудники</h1>

      {/* Add Button */}
      <div>
        <Link
          href={tab === "workers" ? "/admin/workers/new" : "/admin/managers/new"}
          className="inline-block bg-black text-white text-sm font-medium px-4 py-2 rounded hover:bg-gray-800 transition"
        >
          {tab === "workers" ? "➕ Добавить работника" : "➕ Добавить менеджера"}
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          className={`px-4 py-2 font-medium border-b-2 ${
            tab === "workers" ? "border-black" : "border-transparent text-gray-500"
          }`}
          onClick={() => setTab("workers")}
        >
          Работники
        </button>
        <button
          className={`px-4 py-2 font-medium border-b-2 ${
            tab === "managers" ? "border-black" : "border-transparent text-gray-500"
          }`}
          onClick={() => setTab("managers")}
        >
          Менеджеры
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow p-4">
        <table className="min-w-full table-fixed text-sm text-left">
          <thead className="bg-gray-100 text-xs font-semibold text-gray-600">
            <tr>
              <th className="px-2 py-1 w-[40px]">ID</th>
              <th className="px-2 py-1 w-[200px]">
                <input
                  placeholder="ФИО / Имя пользователя"
                  value={filter.fullName}
                  onChange={(e) => setFilter({ ...filter, fullName: e.target.value })}
                  className="w-full p-1 border rounded text-xs"
                />
              </th>
              <th className="px-2 py-1 w-[140px]">
                <input
                  placeholder="Телеграм"
                  value={filter.telegramUsername}
                  onChange={(e) =>
                    setFilter({ ...filter, telegramUsername: e.target.value })
                  }
                  className="w-full p-1 border rounded text-xs"
                />
              </th>
              <th className="px-2 py-1 w-[140px]">
                <input
                  placeholder="Телефон"
                  value={filter.phone}
                  onChange={(e) => setFilter({ ...filter, phone: e.target.value })}
                  className="w-full p-1 border rounded text-xs"
                />
              </th>

              {tab === "workers" ? (
                <>
                  <th className="px-2 py-2 w-[100px] text-center">Заказов</th>
                  <th className="px-2 py-2 w-[120px] text-center">Заработано</th>
                  <th className="px-2 py-2 w-[120px] text-center">Создан</th>
                </>
              ) : (
                <>
                  <th className="px-2 py-2 w-[120px]">Роль</th>
                  <th className="px-2 py-2 w-[120px] text-center">Создан</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {tab === "workers"
              ? filteredWorkers.map((w) => (
                  <tr
                    key={w.id}
                    className="border-t border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-2 py-2">{w.id}</td>
                    <td className="px-2 py-2 truncate">{w.fullName}</td>
                    <td className="px-2 py-2 truncate">
                      {w.telegramUsername ? `${w.telegramUsername}` : "—"}
                    </td>
                    <td className="px-2 py-2 truncate">{w.phone}</td>
                    <td className="px-2 py-2 text-center">{w.ordersCompleted}</td>
                    <td className="px-2 py-2 text-center">{w.totalEarned} ₽</td>
                    <td className="px-2 py-2 text-center">
                      {new Date(w.createdAt).toLocaleDateString("ru-RU")}
                    </td>
                  </tr>
                ))
              : filteredManagers.map((m) => (
                  <tr
                    key={m.id}
                    className="border-t border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-2 py-2">{m.id}</td>
                    <td className="px-2 py-2 truncate">{m.fullName ?? m.username}</td>
                    <td className="px-2 py-2 truncate">
                      {m.telegramUsername ? `${m.telegramUsername}` : "—"}
                    </td>
                    <td className="px-2 py-2 truncate">{m.phone ?? "—"}</td>
                    <td className="px-2 py-2">{m.role}</td>
                    <td className="px-2 py-2 text-center">
                      {m.createdAt ? new Date(m.createdAt).toLocaleDateString("ru-RU") : "—"}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
