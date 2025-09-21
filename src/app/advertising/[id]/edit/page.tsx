"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";

interface LeafletOrder {
  id: number;
  quantity: number;
}

export default function EditLeafletOrderPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<LeafletOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [quantity, setQuantity] = useState<number | "">(0);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/distribution/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setOrder(data);
        setQuantity(data.quantity);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function saveQuantity() {
    if (!order || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/distribution/${order.id}/edit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });

      if (!res.ok) throw new Error("Ошибка обновления");

      router.push(`/advertising/${order.id}`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );

  if (error) return <p className="p-4 text-red-600 font-semibold">Ошибка: {error}</p>;
  if (!order) return <p className="p-4">Заказ не найден</p>;

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-2xl shadow-md">
      <h1 className="text-2xl font-bold mb-4">✏️ Редактировать заказ №{order.id}</h1>

      <div className="mb-4">
        <label className="block font-semibold mb-2">Количество листовок:</label>
        <input
          type="number"
          className="border p-3 w-full rounded-lg focus:ring focus:ring-blue-200"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
      </div>

      <button
        onClick={saveQuantity}
        disabled={submitting}
        className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
      >
        <Save className="w-5 h-5" /> Сохранить
      </button>
    </div>
  );
}
