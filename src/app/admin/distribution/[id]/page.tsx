"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface LeafletOrder {
  id: number;
  profitType: string;
  quantity: number;
  leaflet: { name: string } | null;
  city: { name: string } | null;
  distributor: { fullName: string } | null;
  state: string;
  createdAt: string;
}

export default function LeafletOrderPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<LeafletOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function fetchOrder() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/distribution/${id}`);
        if (!res.ok) {
          throw new Error(`Ошибка: ${res.status}`);
        }
        const data = await res.json();
        setOrder(data);
      } catch (err: any) {
        setError(err.message || "Ошибка при загрузке");
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [id]);

  if (loading) return <p className="p-4">Загрузка...</p>;
  if (error) return <p className="p-4 text-red-600">Ошибка: {error}</p>;
  if (!order) return <p className="p-4">Заказ не найден</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Заказ №{order.id}</h1>

      <p><strong>Тип прибыли:</strong> {order.profitType}</p>
      <p><strong>Количество:</strong> {order.quantity}</p>
      <p><strong>Листовка:</strong> {order.leaflet?.name || "-"}</p>
      <p><strong>Город:</strong> {order.city?.name || "-"}</p>
      <p><strong>Разносчик:</strong> {order.distributor?.fullName || "-"}</p>
      <p><strong>Статус:</strong> {order.state === "IN_PROCESS" ? "В процессе" : "Выполнено"}</p>
      <p><strong>Создан:</strong> {new Date(order.createdAt).toLocaleString()}</p>
    </div>
  );
}
