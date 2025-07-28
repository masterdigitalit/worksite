"use client";
import MasterTabContent from "./components/MasterTab";
import { useState, useEffect } from "react";
import DocumentsTabContent from "./components/DocumentsTab";
import ModifyTabContent from "./components/ModifyOrder";
import Link from "next/link";
const statusMap: Record<string, string> = {
  PENDING: "Ожидает",
  IN_PROGRESS: "В работе",
  COMPLETED: "Выполнен",
  CANCELLED: "Отменён",
  DECLINED: "Отменён",
  ON_THE_WAY: "В пути",
  IN_PROGRESS_SD: "В работе (СД)",
  DONE: "Выполнен",
};

const visitTypeMap: Record<string, string> = {
  FIRST: "Первичный",
  FOLLOW_UP: "Повторный",
};

const equipmentTypeMap: Record<string, string> = {
  Котёл: "Котёл",
  Кондиционер: "Кондиционер",
  Водонагреватель: "Водонагреватель",
};

interface Order {
  id: number;
  fullName: string;
  phone: string;
  address: string;
  status: string;
  problem?: string;
  arriveDate: string;
  visitType: string;
  city: string;
  campaign: string;
  equipmentType: string;
  pureCheck: number | null;
  callRequired: boolean;
  paymentType : string;
  documents?: Array<documents>;
  masterId?: number | null;
  received?: number | null;
  outlay?: number | null;
  receivedworker?: number | null;
}


const payLabels: Record<string, string> = {
 "HIGH": "Высокая",
 "MEDIUM": "Средняя" ,
 "LOW": "Низкая" ,
};
interface documents {
  id: number;
  orderId: string;
  type: string;
  url: string;
}

interface Props {
  params: { id: string };
}

type Tab = "info" | "documents" | "master" | "modify";

export default function OrderPage({ params }: Props) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("info");
  const [showModal, setShowModal] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  async function fetchOrder() {
    try {
      const res = await fetch(`/api/orders/${params.id}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Ошибка загрузки");
      }
      const data = await res.json();
      setOrder(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    fetchOrder();
  }, [params.id]);

const copyText = order
  ? `Заявка #${order.id} ${visitTypeMap[order.visitType] || order.visitType}
${new Date(order.arriveDate).toISOString().replace("T", " ").slice(0, 16)} 
${order.city}
${order.address}
${order.problem}
${order.phone} ${order.fullName}

`.trim()
  : "";
// ${order.campaign ? `Листовка ${order.campaign}` : ""}

  const handleCopy = () => {
    if (!copyText) return;
    navigator.clipboard.writeText(copyText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  async function handleCancelOrder() {
    if (!order) return;
    setCanceling(true);
    setCancelError(null);
    try {
      const res = await fetch(`/api/orders/${order.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "DECLINED" }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Ошибка отмены заказа");
      }

      const updatedOrder = await res.json();
      setOrder(updatedOrder);
      setShowModal(false);
    } catch (err: any) {
      setCancelError(err.message);
    } finally {
      setCanceling(false);
    }
  }

  if (loading) return <p className="p-6 text-center">Загрузка заказа...</p>;
  if (error) return <p className="p-6 text-center text-red-600">{error}</p>;
  if (!order) return <p className="p-6 text-center">Заказ не найден</p>;

  return (
    <div className="mx-auto mt-8 max-w-3xl rounded-md bg-white p-6 shadow-md">
      <div className="mb-6 flex items-center justify-between border-b pb-3">
        <h1 className="text-3xl font-semibold">Заказ #{order.id}</h1>
        <button
          onClick={handleCopy}
          className="rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
        >
          {copied ? "Скопировано!" : "Скопировать данные"}
        </button>
      </div>

      <div className="mb-6 flex items-center justify-between border-b pb-2">
        <div className="flex space-x-6">
          <TabButton active={activeTab === "info"} onClick={() => setActiveTab("info")}>
            Инфо
          </TabButton>
          <TabButton active={activeTab === "documents"} onClick={() => setActiveTab("documents")}>
            Документы
          </TabButton>
          {order.masterId && (
            <TabButton active={activeTab === "master"} onClick={() => setActiveTab("master")}>
              Мастер
            </TabButton>
          )}
        </div>
        <button
          className="text-sm rounded bg-red-600 px-3 py-1.5 text-white hover:bg-red-700 transition"
          onClick={() => setShowModal(true)}
          disabled={order.status === "DECLINED" || canceling}
          title={order.status === "DECLINED" ? "Заказ уже отменён" : ""}
        >
          Отменить заказ
        </button>
      </div>

      {activeTab === "info" && <InfoTabContent order={order} setActiveTab={setActiveTab} />}
      {activeTab === "documents" && <DocumentsTabContent documentsPhoto={order.documents} orderId={order.id} />}
      {activeTab === "master" && <MasterTabContent masterId={order.masterId} />}
      {activeTab === "modify" && <ModifyTabContent order={order} setTab={setActiveTab} refetch={fetchOrder} />}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="rounded-lg bg-white p-6 shadow-lg max-w-sm w-full">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">Вы уверены?</h2>
            <p className="mb-6 text-gray-600">Вы действительно хотите отменить заказ #{order.id}?</p>
            {cancelError && <p className="mb-4 text-center text-red-600">{cancelError}</p>}
            <div className="flex justify-end space-x-4">
              <button
                className="rounded bg-gray-300 px-4 py-2 text-gray-800 hover:bg-gray-400"
                onClick={() => {
                  if (!canceling) setShowModal(false);
                }}
                disabled={canceling}
              >
                Отмена
              </button>
              <button
                className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-60"
                onClick={handleCancelOrder}
                disabled={canceling}
              >
                {canceling ? "Отмена..." : "Подтвердить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TabButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`border-b-2 pb-2 transition ${
        active ? "border-blue-600 font-semibold text-blue-600" : "border-transparent text-gray-600 hover:text-gray-900"
      }`}
    >
      {children}
    </button>
  );
}

function InfoTabContent({ order, setActiveTab }: { order: Order; setActiveTab: (tab: Tab) => void }) {
  const isDone = order.status === "DONE" || order.status === "COMPLETED";
  const isPending = order.status === "PENDING";

  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-4 text-gray-800 md:grid-cols-2">
      <InfoBlock title="ФИО" value={order.fullName} />
      <InfoBlock title="Телефон" value={order.phone} />
      <InfoBlock title="Адрес" value={order.address} />
      <InfoBlock title="Статус" value={statusMap[order.status] || order.status} />
  <InfoBlock
  title="Дата визита"
  value={new Date(order.arriveDate)
    .toISOString()
    .replace("T", " ")
    .slice(0, 16)} // 2025-07-27 20:00
/>

      <InfoBlock title="Тип визита" value={visitTypeMap[order.visitType] || order.visitType} />
      <InfoBlock title="Город" value={order.city} />
      <InfoBlock title="Прибор" value={equipmentTypeMap[order.equipmentType] || order.equipmentType} />

      {!isPending && isDone && (
        <>
          <InfoBlock title="Клиент заплатил" value={order.received?.toLocaleString() + " ₽" || "-"} />
          <InfoBlock title="Затраты" value={order.outlay !== null ? order.outlay.toLocaleString() + " ₽" : "-"} />
          <InfoBlock title="Зп работника" value={order.receivedworker !== null ? order.receivedworker.toLocaleString() + " ₽" : "-"} />
          <InfoBlock
            title="Чистая прибыль"
            value={
              order.received != null && order.receivedworker != null && order.outlay != null
                ? (order.received - order.receivedworker - order.outlay).toLocaleString() + " ₽"
                : "-"
            }
          />
        </>
      )}
         <InfoBlock title="Нужен звонок" value={order.callRequired ? "✅ Да" : "❌ Нет"} />
                  <InfoBlock title="Тип прибыли" value={payLabels[order.paymentType]} />
           <InfoBlock title="Описание проблемы" value={order.problem} />

 
  

{["PENDING", "ON_THE_WAY", "IN_PROGRESS", "IN_PROGRESS_SD"].includes(order.status) && (
  <div className="mt-6">
    <button
      className="w-full rounded bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 transition mb-3"
      onClick={() => setActiveTab("modify")}
    >
      {{
        PENDING: "Назначить работника",
        ON_THE_WAY: "Работник на месте",
        IN_PROGRESS: "Закрыть заказ",
        IN_PROGRESS_SD: "Закрыть заказ",
      }[order.status]}
    </button>
  </div>
)}

{/* Кнопка редактирования — вне зависимости от статуса */}
<div className="mt-0">
  <Link
    href={`/admin/orders/${order.id}/edit`}
    className="block w-full text-center rounded bg-yellow-500 px-5 py-2 text-white hover:bg-yellow-600 transition"
  >
    ✏️ Редактировать заказ
  </Link>
</div>


    </div>
  );
}

function InfoBlock({ title, value }: { title: string; value: string }) {
  const isFinance = ["Клиент заплатил", "Затраты", "Чистая прибыль", "Зп работника", "Выплата", "Прибыль"].includes(title);
  return (
    <div className={`mb-3 rounded-lg border p-3 text-sm ${isFinance ? "bg-gray-100" : ""}`}>
      <h2 className="mb-1 font-semibold">{title}</h2>
      <p className="text-base">{value}</p>
    </div>
  );
}
