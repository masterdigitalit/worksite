"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
  given : number;
  returned:number;
}

export default function LeafletOrderPage() {
  const { id } = useParams();

  const [order, setOrder] = useState<LeafletOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [finishStep, setFinishStep] = useState<null | "partial">(null);
  const [submitting, setSubmitting] = useState(false);

  const [partialDistributed, setPartialDistributed] = useState<number | null>(null);
  const [partialReturned, setPartialReturned] = useState<number | null>(null);

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
  async function finishOrder(success: boolean, partialData?: { distributed: number; returned: number }) {
    if (!id || submitting) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/distribution/complete/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          partialData
            ? { success, ...partialData }
            : { success }
        ),
      });

      if (!res.ok) throw new Error("Ошибка завершения заказа");

      const updated = await res.json();
      setOrder(updated);
      setFinishStep(null);
      setPartialDistributed(null);
      setPartialReturned(null);
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

      {order.state !== "IN_PROCESS" && (
        <>
        <p><strong>Заработал:</strong> {order.distributorProfit || "-"}</p>
        <p><strong>Раздал:</strong> {order.given || "-"}</p>
        <p><strong>Вернул:</strong> {order.returned || "-"}</p>
</>
      )}

      {order.wasBack && <p>Листовки вернули</p>}

      {order.state === "IN_PROCESS" && (
        <div className="mt-4">
          {finishStep === null && (
            <div className="space-x-2">
              <button
                onClick={() => finishOrder(true)}
                className="px-4 py-2 bg-green-600 text-white rounded"
                disabled={submitting}
              >
                ✅ Раздал всё
              </button>
              <button
                onClick={() => setFinishStep("partial")}
                className="px-4 py-2 bg-yellow-600 text-white rounded"
                disabled={submitting}
              >
                📦 Частично
              </button>
            </div>
          )}

          {finishStep === "partial" && (
            <div className="space-y-2 mt-3">
              <input
                type="number"
                placeholder="Сколько раздал"
                className="border p-2 w-full rounded"
                value={partialDistributed ?? ""}
                onChange={(e) => setPartialDistributed(Number(e.target.value))}
              />
              <input
                type="number"
                placeholder="Сколько вернул"
                className="border p-2 w-full rounded"
                value={partialReturned ?? ""}
                onChange={(e) => setPartialReturned(Number(e.target.value))}
              />
              <div className="space-x-2">
                <button
                  onClick={() => {
                    if (
                      partialDistributed === null ||
                      partialReturned === null ||
                      isNaN(partialDistributed) ||
                      isNaN(partialReturned)
                    ) {
                      alert("Заполните оба поля!");
                      return;
                    }
                    finishOrder(false, {
                      distributed: partialDistributed,
                      returned: partialReturned,
                    });
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                  disabled={submitting}
                >
                  Отправить
                </button>
                <button
                  onClick={() => {
                    setFinishStep(null);
                    setPartialDistributed(null);
                    setPartialReturned(null);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded"
                >
                  Отмена
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
