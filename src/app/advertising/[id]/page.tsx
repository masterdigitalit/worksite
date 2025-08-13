"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface LeafletOrder {
  id: number;
  profitType: string;
  quantity: number;
  leaflet: { name: string; value: number } | null;
  city: { name: string } | null;
  distributor: { id: number; fullName: string } | null;
  state: "IN_PROCESS" | "DONE" | "DECLINED" | string;
  createdAt: string;
  distributorProfit: number;
  wasBack?: boolean;
}

export default function LeafletOrderPage() {
  const { id } = useParams();
  const router = useRouter();

  const [order, setOrder] = useState<LeafletOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [finishStep, setFinishStep] = useState<"start" | "fail-options" | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Загружаем заказ
  useEffect(() => {
    if (!id) return;
    fetch(`/api/distribution/${id}`)
      .then(res => res.json())
      .then(data => setOrder(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  // Завершение заказа
  async function finishOrder(success: boolean, returnedLeaflets?: boolean) {
    if (!id || submitting) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/distribution/complete/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ success, returnedLeaflets }),
      });

      if (!res.ok) throw new Error("Ошибка завершения заказа");

      const updated = await res.json();
      setOrder(updated);

    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const translateStatus = (status: string) => {
    switch (status) {
      case "IN_PROCESS":
        return "В РАБОТЕ";
      case "DONE":
        return "ВЫПОЛНЕН";
      case "DECLINED":
        return "ПРОВАЛЕН";
      default:
        return status;
    }
  };

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
      <p>
        <strong>Разносчик:</strong>{" "}
        {order.distributor ? (
          <Link
            href={`/advertising/distributors/${order.distributor.id}`}
            className="text-blue-600 hover:underline"
          >
            {order.distributor.fullName}
          </Link>
        ) : (
          "-"
        )}
      </p>
      <p><strong>Статус:</strong> {translateStatus(order.state)}</p>
      <p><strong>Создан:</strong> {new Date(order.createdAt).toLocaleString()}</p>

      {order.state === "DONE" && (
        <p><strong>Заработал:</strong> {order.distributorProfit || "-"}</p>
      )}

      {order.wasBack && <p>Листовки вернули</p>}

      {order.state === "IN_PROCESS" && (
        <div className="mt-4">
          {finishStep === null && (
            <button
              onClick={() => setFinishStep("start")}
              className="px-4 py-2 bg-blue-600 text-white rounded"
              disabled={submitting}
            >
              Завершить заказ
            </button>
          )}

          {finishStep === "start" && (
            <div className="space-x-2">
              <button
                onClick={() => finishOrder(true)}
                className="px-4 py-2 bg-green-600 text-white rounded"
                disabled={submitting}
              >
                ✅ Успешно
              </button>
              <button
                onClick={() => setFinishStep("fail-options")}
                className="px-4 py-2 bg-red-600 text-white rounded"
                disabled={submitting}
              >
                ❌ Неуспешно
              </button>
            </div>
          )}

          {finishStep === "fail-options" && (
            <div className="space-x-2">
              <button
                onClick={() => finishOrder(false, true)}
                className="px-4 py-2 bg-yellow-600 text-white rounded"
                disabled={submitting}
              >
                📦 Листовки вернули
              </button>
              <button
                onClick={() => finishOrder(false, false)}
                className="px-4 py-2 bg-gray-600 text-white rounded"
                disabled={submitting}
              >
                📦 Листовки не вернули
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
