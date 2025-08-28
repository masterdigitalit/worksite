"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Leaflet {
  id: number;
  name: string;
  value: number;
  description?: string;
}

export default function LeafletIdPage() {
  const { id } = useParams();
  const [leaflet, setLeaflet] = useState<Leaflet | null>(null);
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState<number | "">("");

  const fetchLeaflet = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/leaflet/${id}`);
      if (res.ok) {
        const data = await res.json();
        setLeaflet(data);
        setValue(data.value);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const saveQuantity = async () => {
    if (!id || value === "") return;
    try {
      const res = await fetch(`/api/leaflet/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: Number(value) }),
      });
      if (res.ok) fetchLeaflet();
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchLeaflet();
  }, [id]);

  if (loading) return <p className="text-center mt-6">Загрузка...</p>;
  if (!leaflet) return <p className="text-center mt-6">Не найдено</p>;

  return (
    <div className="p-6 max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-gray-800">{leaflet.name}</h1>

        {leaflet.description && (
          <p className="text-gray-600">{leaflet.description}</p>
        )}

        <div className="flex gap-2 items-center mt-4">
          <input
            type="number"
            className="w-full border rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={value}
            onChange={(e) => setValue(e.target.value === "" ? "" : Number(e.target.value))}
          />
          <button
            onClick={saveQuantity}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Сохранить
          </button>
        </div>

        <p className="mt-2 text-gray-700">
          Текущее количество:{" "}
          <span className="font-semibold text-blue-600">{leaflet.value}</span>
        </p>
      </div>
    </div>
  );
}
