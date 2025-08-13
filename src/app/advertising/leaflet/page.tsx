"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Distributors from "./components/distributors"; // импорт компонента

interface City {
  id: number;
  name: string;
  _count: { orders: number };
  value: string;
}

export default function LeafletPage() {
  const [activeTab, setActiveTab] = useState<"leaflet" | "distributors">("leaflet");
  const [data, setData] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (activeTab === "leaflet") {
      setLoading(true);
      fetch(`/api/leaflet/page`)
        .then((res) => {
          if (!res.ok) throw new Error("Ошибка загрузки данных");
          return res.json();
        })
        .then((data) => setData(data))
        .finally(() => setLoading(false));
    }
  }, [activeTab]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Листовки</h1>

      {/* Вкладки */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab("leaflet")}
          className={`px-4 py-2 rounded ${
            activeTab === "leaflet" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Листовки
        </button>
        <button
          onClick={() => setActiveTab("distributors")}
          className={`px-4 py-2 rounded ${
            activeTab === "distributors" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Разносчики
        </button>
      </div>

      {/* Кнопка добавления */}
      {activeTab === "leaflet" && (
        <button
          onClick={() => router.push("/advertising/leaflet/new")}
          className="mb-4 rounded bg-green-600 px-4 py-2 text-white transition hover:bg-green-700"
        >
          Добавить листовку
        </button>
      )}
      {activeTab === "distributors" && (
        <button
          onClick={() => router.push("/advertising/distributors/new")}
          className="mb-4 rounded bg-green-600 px-4 py-2 text-white transition hover:bg-green-700"
        >
          Добавить разносчика
        </button>
      )}

      {/* Контент */}
      {activeTab === "leaflet" ? (
        loading ? (
          <p className="p-4">Загрузка...</p>
        ) : (
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2">ID</th>
                <th className="border px-4 py-2">Название</th>
                <th className="border px-4 py-2">Кол-во заказов</th>
                <th className="border px-4 py-2">Кол-во</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr
                  key={item.id}
                  className="cursor-pointer hover:bg-gray-200 transition"
                  onClick={() => router.push(`/leaflet/${item.id}`)}
                >
                  <td className="border px-4 py-2">{item.id}</td>
                  <td className="border px-4 py-2">{item.name}</td>
                  <td className="border px-4 py-2">{item._count.orders}</td>
                  <td className="border px-4 py-2">{item.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      ) : (
        <Distributors />
      )}
    </div>
  );
}
