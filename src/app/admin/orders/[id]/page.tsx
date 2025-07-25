"use client";
import MasterTabContent from "./components/MasterTab";
import { useState, useEffect } from "react";
import DocumentsTabContent from "./components/DocumentsTab";
import ModifyTabContent from "./components/ModifyOrder";

const statusMap: Record<string, string> = {
  PENDING: "Ожидает",
  IN_PROGRESS: "В работе",
  COMPLETED: "Выполнен",
  CANCELLED: "Отменён",
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
  arriveDate: string;
  visitType: string;
  city: string;
  campaign: string;
  equipmentType: string;
  clientPrice: number | null;
  workerPrice: number | null;
  pureCheck: number | null;
  callRequired: boolean;
  documents?: Array<documents>;
  masterId?: number | null;
  received?: number | null;
  outlay?: number | null;
  receivedworker?: number | null;
}

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
    async function fetchOrder(){
   
    try {
      const res = await   fetch(`/api/orders/${params.id}`)
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
      // setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetch(`/api/orders/${params.id}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Ошибка загрузки");
        }
        return res.json();
      })
      .then((data) => {
        setOrder(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
        setOrder(null);
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  const copyText = order
    ? `
Заказ #${order.id}
ФИО: ${order.fullName}
Телефон: ${order.phone}
Адрес: ${order.address}
Статус: ${statusMap[order.status] || order.status}
Дата визита: ${new Date(order.arriveDate).toLocaleString()}
Тип визита: ${visitTypeMap[order.visitType] || order.visitType}
Город: ${order.city}
Компания: ${order.campaign}
Оборудование: ${equipmentTypeMap[order.equipmentType] || order.equipmentType}
Клиент заплатил: ${order.received?.toLocaleString() ?? "-"} ₽
Выплата: ${order.outlay !== null ? order.outlay.toLocaleString() + " ₽" : "-"}
Прибыль: ${order.receivedworker !== null ? order.receivedworker.toLocaleString() + " ₽" : "-"}
Нужен звонок: ${order.callRequired ? "Да" : "Нет"}
` : "";

  const handleCopy = () => {
    if (!copyText) return;
    navigator.clipboard.writeText(copyText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

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

      <div className="mb-6 flex space-x-6 border-b">
        <TabButton active={activeTab === "info"} onClick={() => setActiveTab("info")}>Инфо</TabButton>
        <TabButton active={activeTab === "documents"} onClick={() => setActiveTab("documents")}>Документы</TabButton>
        {order.masterId && (
          <TabButton active={activeTab === "master"} onClick={() => setActiveTab("master")}>Мастер</TabButton>
        )}
      </div>

      {activeTab === "info" && <InfoTabContent order={order} setActiveTab={setActiveTab} />}
      {activeTab === "documents" && <DocumentsTabContent documentsPhoto={order.documents} orderId={order.id} />}
      {activeTab === "master" && <MasterTabContent masterId={order.masterId} />}
      {activeTab === "modify" && <ModifyTabContent order={order}  setTab={setActiveTab} refetch={fetchOrder}/>}
    </div>
  );
}

function TabButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`border-b-2 pb-2 transition ${active ? "border-blue-600 font-semibold text-blue-600" : "border-transparent text-gray-600 hover:text-gray-900"}`}
    >
      {children}
    </button>
  );
}

function InfoTabContent({ order, setActiveTab }: { order: Order; setActiveTab: (tab: Tab) => void }) {
  const isDone = order.status === "DONE";
  const isPending = order.status === "PENDING";

  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-4 text-gray-800 md:grid-cols-2">
      <InfoBlock title="ФИО" value={order.fullName} />
      <InfoBlock title="Телефон" value={order.phone} />
      <InfoBlock title="Адрес" value={order.address} />
      <InfoBlock title="Статус" value={statusMap[order.status] || order.status} />
      <InfoBlock title="Дата визита" value={new Date(order.arriveDate).toLocaleString()} />
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
            value={order.received != null && order.receivedworker != null && order.outlay != null ? (order.received - order.receivedworker - order.outlay).toLocaleString() + " ₽" : "-"}
          />
        </>
      )}

      <div className="md:col-span-2">
        <h2 className="mb-1 text-lg font-medium">Нужен звонок</h2>
        <p className="text-base">{order.callRequired ? "✅ Да" : "❌ Нет"}</p>
      </div>

      {["PENDING", "ON_THE_WAY", "IN_PROGRESS", "IN_PROGRESS_SD"].includes(order.status) && (
  <div className="mt-6 text-center">
    <button
      className="rounded bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 transition"
      onClick={() => {
        setActiveTab("modify");
        // Здесь можно добавить другие действия под каждый статус
      }}
    >
      {{
        PENDING: "Назначить работника",
        ON_THE_WAY: "Работник в пути",
        IN_PROGRESS: "Работник на месте",
        IN_PROGRESS_SD: "Подтвердить выполнение",
      }[order.status]}
    </button>
  </div>
)}

    </div>
  );
}

function InfoBlock({ title, value }: { title: string; value: string }) {
  const isFinance = ["Клиент заплатил", "Затраты", "Чистая прибыль", "Зп работника", "Выплата", "Прибыль"].includes(title);
  return (
    <div>
      <h2 className="mb-1 text-lg font-medium">{title}</h2>
      <p className={`text-base ${isFinance ? "font-semibold text-black" : ""}`}>{value}</p>
    </div>
  );
}
