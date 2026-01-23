"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Order {
  id: number;
  problem: string;
  arriveDate: string;
  fullName: string;
  phone: string;
  address: string;
  visitType: string;
  callRequired: boolean;
  isProfessional: boolean;
  equipmentType: string;
  paymentType?: string | null;

  city: {
    id: string;
    name: string;
  } ;

  leaflet: {
    id: string;
    name: string;
  } ;
}

import { PageProps } from "next";

interface OrderPageParams {
  id: string;
}

export default function RepeatOrderPage({ params, searchParams }: PageProps<OrderPageParams>) {

  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [problem, setProblem] = useState("");
  const [arriveDate, setArriveDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function fetchOrder() {
    try {
      const res = await fetch(`/api/orders/${params.id}`);
      if (!res.ok) throw new Error("Ошибка загрузки заказа");
      const data = await res.json();
      setOrder(data);
      setProblem(data.problem || "");
      setArriveDate(
        data.arriveDate
          ? new Date(data.arriveDate).toISOString().slice(0, 16) // yyyy-MM-ddTHH:mm
          : ""
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  async function handleSubmit() {
    if (!order) return;
    setSubmitting(true);

    try {
      function preserveUserInputAsUTC(datetimeStr: string): Date {
        const [datePart, timePart] = datetimeStr.split("T");
        const [year, month, day] = datePart.split("-").map(Number);
        const [hour, minute] = timePart.split(":").map(Number);
        return new Date(Date.UTC(year, month - 1, day, hour, minute));
      }

      // формируем новый объект заказа без city/leaflet/id

     
      const body = {
        fullName: order.fullName,
        phone: order.phone,
        address: order.address,
        city: order.city.id ,
        leaflet: order.leaflet.id ,
        problem,
        arriveDate: preserveUserInputAsUTC(arriveDate),
        visitType: order.visitType,
        callRequired: order.callRequired,
        isProfessional: order.isProfessional,
        equipmentType: order.equipmentType,
        status: "PENDING",
        paymentType: order.paymentType,
      };
       console.log(body)

      const response = await fetch("/api/orders/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Ошибка при создании заказа");

      const created = await response.json();
      router.push(`/admin/orders/${created.id}`);
    } catch (e) {
      console.error(e);
      alert("Ошибка при создании заказа");
    } finally {
      setSubmitting(false);
    }
  }
console.log(order)
  if (loading) return <p className="p-6 text-center">Загрузка...</p>;
  if (!order) return <p className="p-6 text-center text-red-600">Заказ не найден</p>;

  return (
    <div className="mx-auto max-w-md space-y-6 p-6">
      <h1 className="text-center text-2xl font-bold">
        🔄 Повтор заказа #{order.id}
      </h1>

      <div>
        <label className="mb-1 block font-medium">Дата и время визита</label>
        <input
          type="datetime-local"
          value={arriveDate}
          onChange={(e) => setArriveDate(e.target.value)}
          required
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block font-medium">Описание проблемы</label>
        <textarea
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          required
          className="w-full rounded border px-3 py-2"
          rows={4}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
      >
        {submitting ? "Создание..." : "Создать повторный заказ"}
      </button>
    </div>
  );
}