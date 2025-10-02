"use client";

import { useEffect, useState } from "react";

interface Log {
  id: number;
  whoDid: string | null;
  whatHappend: string | null;
  type: string;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [filterType, setFilterType] = useState("");
  const [filterWho, setFilterWho] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      const res = await fetch("/api/logs");
      if (res.ok) {
        setLogs(await res.json());
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesType = filterType === "" || log.type === filterType;
    const matchesWho =
      filterWho === "" ||
      (log.whoDid ?? "").toLowerCase().includes(filterWho.toLowerCase());
    return matchesType && matchesWho;
  });

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Журнал действий</h1>

      {/* Фильтры */}
      <div className="flex gap-4 mb-6">
        <div className="flex flex-col w-1/2">
          <label className="text-sm font-medium mb-1">Тип действия</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="">Все</option>
            <option value="advertising">Реклама</option>
            <option value="orders">Заказы</option>
            <option value="accounts">Аккаунты</option>
          </select>
        </div>

        <div className="flex flex-col w-1/2">
          <label className="text-sm font-medium mb-1">Кто сделал</label>
          <input
            type="text"
            placeholder="Введите имя"
            value={filterWho}
            onChange={(e) => setFilterWho(e.target.value)}
            className="border rounded-lg px-3 py-2"
          />
        </div>
      </div>

      {/* Список логов */}
      <div className="space-y-2">
        {filteredLogs.map((log) => (
          <div
            key={log.id}
            className="border rounded-lg p-3 shadow-sm bg-gray-50"
          >
            <div className="flex justify-between">
              <span className="font-semibold text-blue-600">{log.type}</span>
              <span className="text-sm text-gray-500">#{log.id}</span>
            </div>
            <div className="mt-1">
              <p>
                <span className="font-medium">Кто:</span>{" "}
                {log.whoDid ?? "—"}
              </p>
              <p>
                <span className="font-medium">Что сделал:</span>{" "}
                <div
                  dangerouslySetInnerHTML={{ __html: log.whatHappend ?? "" }}
                />
              </p>
            </div>
          </div>
        ))}

        {filteredLogs.length === 0 && (
          <p className="text-gray-500">Нет записей по выбранным фильтрам.</p>
        )}
      </div>
    </div>
  );
}
