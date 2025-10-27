"use client";

import  InProcessActions from './components/inprocess';
import DoneSummary from "./components/done";
import ForPaymentActions from "./components/forpayment"
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
  const statusMap: Record<string, string> = {
    IN_PROCESS: "🟡 В работе",
    SUCCESS: "🟢 Выполнен",
    DECLINED: "🟠 Провален",
    CANCELLED: "⚫ Отменён",
      FORPAYMENT: "💲 На оплату",
  };

  return statusMap[state] || state;
};

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );

  if (error) return <p className="p-4 text-red-600 font-semibold">{error}</p>;
  if (!order) return <p className="p-4">Заказ не найден</p>;
  console.log(order)

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
         <p><strong>Создал:</strong> {order.createdBy || "-"}</p>
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
     {order.state === "DONE" && (
  <DoneSummary
    given={order.given}
    order={order}
    returned={order.returned}
    profit={order.distributorProfit}
  />
)}

     {order.state === "FORPAYMENT" && (
  <ForPaymentActions orderId={order.id} onUploaded={() => window.location.reload()} />
)}

      {/* === Действия (если заказ в работе) === */}
    {order.state === "IN_PROCESS" && (
  <InProcessActions submitting={submitting} onFinish={finishOrder} />
)}
    </div>
  );
}
