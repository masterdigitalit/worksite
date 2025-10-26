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
  state: string;
  createdAt: string;
  distributorProfit: number | null;
  given: number | null;
  returned: number | null;
  squareNumber: string | null;
}

export default function LeafletOrderPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<LeafletOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [finishMode, setFinishMode] = useState<null | "partial">(null);
  const [submitting, setSubmitting] = useState(false);

  const [partialDistributed, setPartialDistributed] = useState<number | "">("");
  const [partialReturned, setPartialReturned] = useState<number | "">("");

  // === Загрузка данных ===
  useEffect(() => {
    if (!id) return;

    async function fetchOrder() {
      try {
        const res = await fetch(`/api/distribution/${id}`);
        if (!res.ok) throw new Error("Ошибка при загрузке данных");
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

  // === Завершение заказа ===
  async function finishOrder(state: string, extraData?: { distributed?: number; returned?: number }) {
    console.log("📤 Отправка данных:", {
  id,
  state,
  distributed: extraData?.distributed,
  returned: extraData?.returned,
});
    if (!id || submitting) return;
    setSubmitting(true);

    try {
      const body = { state, ...extraData };
      console.log(body)

      console.log("📤 Отправка:", body);

      const res = await fetch(`/api/distribution/complete/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Ошибка обновления заказа");
      }

      const updated = await res.json();
      setOrder(updated);
      setFinishMode(null);
      setPartialDistributed("");
      setPartialReturned("");
    } catch (err: any) {
      alert(err.message || "Ошибка выполнения действия");
    } finally {
      setSubmitting(false);
    }
  }

  // === Перевод статуса ===
  const translateStatus = (state: string) => {
    switch (state) {
      case "IN_PROCESS":
        return "🟡 В работе";
      case "SUCCESS":
        return "🟢 Выполнен";
      case "":
        return "🟠 Частично";
      case "CANCELLED":
        return "⚫ Отменён";
      default:
        return state;
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );

  if (error) return <p className="p-4 text-red-600 font-semibold">{error}</p>;
  if (!order) return <p className="p-4">Заказ не найден</p>;

  // === Основной интерфейс ===
  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-2xl shadow">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">📄 Заказ №{order.id}</h1>
        {/* <Link
          href={`/advertising/${order.id}/edit`}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          ✏️ Редактировать
        </Link> */}
      </div>

      <div className="grid grid-cols-2 gap-4 text-gray-800">
        <p><strong>Тип прибыли:</strong> {order.profitType}</p>
        <p><strong>Количество:</strong> {order.quantity}</p>
        <p><strong>Листовка:</strong> {order.leaflet?.name || "-"}</p>
        <p><strong>Город:</strong> {order.city?.name || "-"}</p>
        <p><strong>Номер блока:</strong> {order.squareNumber || "-"}</p>
        <p>
          <strong>Разносчик:</strong>{" "}
          {order.distributor ? (
            <Link href={`/advertising/distributors/${order.distributor.id}`} className="text-blue-600 hover:underline">
              {order.distributor.fullName}
            </Link>
          ) : (
            "-"
          )}
        </p>
        <p><strong>Статус:</strong> {translateStatus(order.state)}</p>
        <p><strong>Создан:</strong> {new Date(order.createdAt).toLocaleString()}</p>
      </div>

      {/* === Блок результатов === */}
      {order.state !== "IN_PROCESS" && (
        <div className="mt-6 p-4 bg-gray-50 border rounded-xl">
          <h2 className="font-semibold mb-2 text-lg">📊 Результаты</h2>
          <p><strong>Раздал:</strong> {order.given ?? "-"}</p>
          <p><strong>Вернул:</strong> {order.returned ?? "-"}</p>
          <p><strong>Заработал:</strong> {order.distributorProfit ?? "-"}</p>
        </div>
      )}

      {/* === Действия (если заказ в работе) === */}
      {order.state === "IN_PROCESS" && (
        <div className="mt-8 space-y-4">
          {finishMode === null && (
            <div className="flex gap-3">
              <button
                onClick={() => finishOrder("success")}
                className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                disabled={submitting}
              >
                <CheckCircle className="w-5 h-5" /> Раздал всё
              </button>

              <button
                onClick={() => setFinishMode("partial")}
                className="flex items-center gap-2 px-5 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                disabled={submitting}
              >
                <Package className="w-5 h-5" /> Частично
              </button>

              <button
                onClick={() => finishOrder("cancelled")}
                className="flex items-center gap-2 px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                disabled={submitting}
              >
                <XCircle className="w-5 h-5" /> Отмена
              </button>
            </div>
          )}

          {finishMode === "partial" && (
            <div className="space-y-3">
              <input
                type="number"
                placeholder="Сколько раздал"
                className="border p-3 w-full rounded-lg focus:ring focus:ring-blue-200"
                value={partialDistributed}
                onChange={(e) => setPartialDistributed(e.target.value ? Number(e.target.value) : "")}
              />
              <input
                type="number"
                placeholder="Сколько вернул"
                className="border p-3 w-full rounded-lg focus:ring focus:ring-blue-200"
                value={partialReturned}
                onChange={(e) => setPartialReturned(e.target.value ? Number(e.target.value) : "")}
              />

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (partialDistributed === "" || partialReturned === "") {
                      alert("Заполни оба поля");
                      return;
                    }
                    finishOrder("", {
                      distributed: Number(partialDistributed),
                      returned: Number(partialReturned),
                    });
                  }}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  disabled={submitting}
                >
                  Отправить
                </button>

                <button
                  onClick={() => {
                    setFinishMode(null);
                    setPartialDistributed("");
                    setPartialReturned("");
                  }}
                  className="px-5 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
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
