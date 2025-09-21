"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Package, Loader2 } from "lucide-react";

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
  given: number;
  returned: number;
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

  useEffect(() => {
    if (!id) return;
    fetch(`/api/distribution/${id}`)
      .then((res) => res.json())
      .then((data) => setOrder(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function finishOrder(success: boolean, partialData?: { distributed: number; returned: number }) {
    if (!id || submitting) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/distribution/complete/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(partialData ? { success, ...partialData } : { success }),
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
        return "🟡 В РАБОТЕ";
      case "DONE":
        return "🟢 ВЫПОЛНЕН";
      case "DECLINED":
        return "🔴 ПРОВАЛЕН";
      default:
        return status;
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );

  if (error) return <p className="p-4 text-red-600 font-semibold">Ошибка: {error}</p>;
  if (!order) return <p className="p-4">Заказ не найден</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-2xl shadow-md">
  <div className="flex items-center justify-between mb-6">
    <h1 className="text-3xl font-extrabold">📄 Заказ №{order.id}</h1>
    <Link
     href={`/advertising/${order.id}/edit`}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
    >
      ✏️ Редактировать
    </Link>
  </div>
      <div className="grid grid-cols-2 gap-4 text-gray-700">
        <p><span className="font-semibold">Тип прибыли:</span> {order.profitType}</p>
        <p><span className="font-semibold">Количество:</span> {order.quantity}</p>
        <p><span className="font-semibold">Листовка:</span> {order.leaflet?.name || "-"}</p>
        <p><span className="font-semibold">Город:</span> {order.city?.name || "-"}</p>
        <p>
          <span className="font-semibold">Разносчик:</span>{" "}
          {order.distributor ? (
            <Link
              href={`/advertising/distributors/${order.distributor.id}`}
              className="text-blue-600 hover:underline font-medium"
            >
              {order.distributor.fullName}
            </Link>
          ) : (
            "-"
          )}
        </p>
        <p><span className="font-semibold">Статус:</span> {translateStatus(order.state)}</p>
       
      </div>
           <div className="mt-4 text-gray-700">
       <p><span className="font-semibold">Создан:</span> {new Date(order.createdAt).toLocaleString()}</p>
</div>
      {order.state !== "IN_PROCESS" && (
        <div className="mt-6 p-4 border rounded-lg bg-gray-50">
          <h2 className="font-bold text-lg mb-2">📊 Результаты</h2>
          <p><strong>Заработал:</strong> {order.distributorProfit || "-"}</p>
          <p><strong>Раздал:</strong> {order.given || "-"}</p>
          <p><strong>Вернул:</strong> {order.returned || "-"}</p>
        </div>
      )}

      {order.state === "IN_PROCESS" && (
        <div className="mt-6 space-y-4">
          {finishStep === null && (
            <div className="flex gap-3">
              <button
                onClick={() => finishOrder(true)}
                className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
                disabled={submitting}
              >
                <CheckCircle className="w-5 h-5" /> Раздал всё
              </button>
              <button
                onClick={() => setFinishStep("partial")}
                className="flex items-center gap-2 px-5 py-2 bg-yellow-500 text-white rounded-lg shadow hover:bg-yellow-600 transition"
                disabled={submitting}
              >
                <Package className="w-5 h-5" /> Частично
              </button>
              <button
                onClick={() => finishOrder(false, { distributed: 0, returned: order.quantity })}
                className="flex items-center gap-2 px-5 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition"
                disabled={submitting}
              >
                <XCircle className="w-5 h-5" /> Отмена
              </button>
            </div>
          )}

          {finishStep === "partial" && (
            <div className="space-y-3">
              <input
                type="number"
                placeholder="Сколько раздал"
                className="border p-3 w-full rounded-lg focus:ring focus:ring-blue-200"
                value={partialDistributed ?? ""}
                onChange={(e) => setPartialDistributed(Number(e.target.value))}
              />
              <input
                type="number"
                placeholder="Сколько вернул"
                className="border p-3 w-full rounded-lg focus:ring focus:ring-blue-200"
                value={partialReturned ?? ""}
                onChange={(e) => setPartialReturned(Number(e.target.value))}
              />
              <div className="flex gap-3">
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
                    finishOrder(false, { distributed: partialDistributed, returned: partialReturned });
                  }}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
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
                  className="px-5 py-2 bg-gray-600 text-white rounded-lg shadow hover:bg-gray-700 transition"
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
