"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface City {
  id: number;
  name: string;
  _count: { orders: number };
}

export default function CityPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/city/page")
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка загрузки данных");
        return res.json();
      })
      .then((data) => setCities(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-4">Загрузка...</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Города и количество заказов</h1>
			 <button
        onClick={() => router.push("/admin/city/new")}
        className="mb-4 rounded bg-green-600 px-4 py-2 text-white transition hover:bg-green-700"
      >
        Добавить город
      </button>
      <table className="min-w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Город</th>
            <th className="border px-4 py-2">Кол-во заказов</th>
          </tr>
        </thead>
        <tbody>
          {cities.map((city) => (
            <tr
              key={city.id}
              className="cursor-pointer hover:bg-gray-200 transition"
              onClick={() => router.push(`/city/${city.id}`)}
            >
              <td className="border px-4 py-2">{city.id}</td>
              <td className="border px-4 py-2">{city.name}</td>
              <td className="border px-4 py-2">{city._count.orders}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
