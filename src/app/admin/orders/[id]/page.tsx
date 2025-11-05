"use client";
import MasterTabContent from "./components/MasterTab";
import { useState, useEffect } from "react";
import DocumentsTabContent from "./components/DocumentsTab";
import ModifyTabContent from "./components/ModifyOrder";
import Link from "next/link";
import { apiClient } from "lib/api-client";
import { 
  Copy, 
  RotateCcw, 
  Edit, 
  User, 
  FileText, 
  Settings, 
  X, 
  CheckCircle,
  MapPin,
  Calendar,
  Building,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Phone,
  Home,
  ClipboardList,
  Sparkles,
  Target,
  Clock,
  Archive
} from "lucide-react";

const statusMap: Record<string, string> = {
  PENDING: "Ожидает",
  ASSIGNED: "Назначен",
  IN_PROGRESS: "В работе",
  COMPLETED: "Завершен",
  CANCELLED: "Отменен",
  DECLINED: "Отменён",
};

const visitTypeMap: Record<string, string> = {
  FIRST: "Первичный",
  REPEAT: "Повторный",
  CHECK: "Проверка",
};

const payLabels: Record<string, string> = {
  "HIGH": "Высокая",
  "MEDIUM": "Средняя",
  "LOW": "Низкая",
};

interface City {
  id: number;
  name: string;
}

interface Leaflet {
  id: number;
  name: string;
  value?: string;
}

interface Worker {
  id: number;
  fullName: string;
  phone: string;
  telegramUsername?: string;
  ordersCompleted?: number;
  totalEarned?: number;
}

interface Document {
  id: number;
  name: string;
  file: string;
  uploaded_at: string;
}

interface Order {
  id: number;
  full_name: string;
  phone: string;
  address: string;
  status: string;
  problem: string;
  arrive_date: string;
  visit_type: string;
  city: City;
  leaflet: Leaflet | null;
  payment_type: string;
  documents: Document[];
  master: Worker | null;
  received: string | null;
  outlay: string | null;
  received_worker: string | null;
  branch_comment?: string;
  call_center_note?: string;
  date_created: string;
  date_started: string | null;
  date_done: string | null;
  is_notificated: boolean;
  was_time_changed: number;
  
  // Display fields from serializer
  status_display?: string;
  visit_type_display?: string;
  payment_type_display?: string;
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
      setLoading(true);
      setError(null);
      const data = await apiClient.get<Order>(`/api/v1/orders/${params.id}/`);
      setOrder(data);
    } catch (err: any) {
      console.error("Failed to load order:", err);
      setError(err.message || "Ошибка загрузки заказа");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  const copyText = order
    ? `Заявка #${order.id} ${visitTypeMap[order.visit_type] || order.visit_type}
${new Date(order.arrive_date)
          .toISOString()
          .replace("T", " ")
          .slice(0, 16)} 
${order.city?.name}
${order.address}
${order.problem}
${order.phone} ${order.full_name}
Листовка - ${order.leaflet?.name || 'Не указана'}

`.trim()
    : "";

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
      const updatedOrder = await apiClient.patch<Order>(
        `/api/v1/orders/${order.id}/decline/`,
        { status: "CANCELLED" }
      );
      
      setOrder(updatedOrder);
      setShowModal(false);
    } catch (err: any) {
      console.error("Failed to cancel order:", err);
      setCancelError(err.message || "Ошибка отмены заказа");
    } finally {
      setCanceling(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">Загрузка заказа...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Ошибка</h1>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Попробовать снова
        </button>
      </div>
    </div>
  );

  if (!order) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Заказ не найден</h1>
        <p className="text-gray-600 mb-4">Заказ с ID {params.id} не существует</p>
        <Link
          href="/admin/orders"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-block"
        >
          Вернуться к списку
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Заголовок */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                📋 Заказ #{order.id}
              </h1>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  order.status === "COMPLETED" ? "bg-green-100 text-green-800 border border-green-200" :
                  order.status === "CANCELLED" || order.status === "DECLINED" ? "bg-red-100 text-red-800 border border-red-200" :
                  "bg-orange-100 text-orange-800 border border-orange-200"
                }`}>
                  {order.status_display || statusMap[order.status] || order.status}
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-600">
                  {order.visit_type_display || visitTypeMap[order.visit_type] || order.visit_type}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Табы */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-wrap gap-3">
            <TabButton active={activeTab === "info"} onClick={() => setActiveTab("info")}>
              <ClipboardList className="w-4 h-4" />
              Основная информация
            </TabButton>
            <TabButton active={activeTab === "documents"} onClick={() => setActiveTab("documents")}>
              <FileText className="w-4 h-4" />
              Документы
            </TabButton>
            {order.master && (
              <TabButton active={activeTab === "master"} onClick={() => setActiveTab("master")}>
                <User className="w-4 h-4" />
                Мастер
              </TabButton>
            )}
            <TabButton active={activeTab === "modify"} onClick={() => setActiveTab("modify")}>
              <Settings className="w-4 h-4" />
              Управление
            </TabButton>
          </div>
        </div>

        {/* Контент табов */}
        {activeTab === "info" && (
          <InfoTabContent 
            order={order} 
            setActiveTab={setActiveTab}
            onCopy={handleCopy}
            copied={copied}
            onCancel={() => setShowModal(true)}
            canceling={canceling}
          />
        )}
        {activeTab === "documents" && <DocumentsTabContent documents={order.documents} orderId={order.id} />}
        {activeTab === "master" && order.master && <MasterTabContent masterId={order.master.id} />}
        {activeTab === "modify" && <ModifyTabContent order={order} setTab={setActiveTab} refetch={fetchOrder} />}

        {/* Модальное окно отмены */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl p-6 shadow-xl max-w-sm w-full mx-4">
              <div className="text-center mb-4">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Вы уверены?</h2>
                <p className="text-gray-600">Вы действительно хотите отменить заказ #{order.id}?</p>
              </div>
              {cancelError && (
                <p className="text-center text-red-600 bg-red-50 py-2 rounded-lg mb-4">
                  {cancelError}
                </p>
              )}
              <div className="flex gap-3">
                <button
                  className="flex-1 bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors border border-gray-300"
                  onClick={() => {
                    if (!canceling) setShowModal(false);
                  }}
                  disabled={canceling}
                >
                  Отмена
                </button>
                <button
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
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
    </div>
  );
}

function TabButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all border ${
        active 
          ? "bg-blue-50 text-blue-700 border-blue-200 shadow-md" 
          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
      }`}
    >
      {children}
    </button>
  );
}

interface InfoTabContentProps {
  order: Order;
  setActiveTab: (tab: Tab) => void;
  onCopy: () => void;
  copied: boolean;
  onCancel: () => void;
  canceling: boolean;
}

function InfoTabContent({ order, setActiveTab, onCopy, copied, onCancel, canceling }: InfoTabContentProps) {
  const isDone = order.status === "COMPLETED";
  const isPending = order.status === "PENDING";

  // Функции для преобразования финансовых данных
  const parseDecimal = (value: string | null): number => {
    if (!value) return 0;
    return parseFloat(value) || 0;
  };

  const received = parseDecimal(order.received);
  const outlay = parseDecimal(order.outlay);
  const receivedWorker = parseDecimal(order.received_worker);
  const netProfit = received - receivedWorker - outlay;

  return (
    <div className="space-y-6">
      {/* Основная информация */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-blue-600" />
          Основная информация
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <InfoBlock title="ФИО" value={order.full_name} icon={<User className="w-5 h-5" />} />
          <InfoBlock title="Телефон" value={order.phone} icon={<Phone className="w-5 h-5" />} />
          <InfoBlock title="Адрес" value={order.address} icon={<Home className="w-5 h-5" />} />
          <InfoBlock title="Статус" value={order.status_display || statusMap[order.status] || order.status} icon={<CheckCircle className="w-5 h-5" />} />
          <InfoBlock
            title="Дата визита"
            value={  new Date(order.arrive_date)
          .toISOString()
          .replace("T", " ")
          .slice(0, 16)}
            icon={<Calendar className="w-5 h-5" />}
          />
          <InfoBlock title="Тип визита" value={order.visit_type_display || visitTypeMap[order.visit_type] || order.visit_type} icon={<MapPin className="w-5 h-5" />} />
          <InfoBlock title="Город" value={order.city.name} icon={<Building className="w-5 h-5" />} />
          <InfoBlock title="Тип оплаты" value={order.payment_type_display || payLabels[order.payment_type] || order.payment_type} icon={<DollarSign className="w-5 h-5" />} />
          <InfoBlock title="Листовка" value={order.leaflet?.name || 'Не указана'} icon={<FileText className="w-5 h-5" />} />
        </div>
      </div>

      {/* Описание проблемы */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <AlertCircle className="w-6 h-6 text-orange-600" />
          Описание проблемы
        </h2>
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
          <p className="text-gray-800 whitespace-pre-wrap">{order.problem}</p>
        </div>
      </div>

      {/* Комментарии */}
      {(order.branch_comment || order.call_center_note) && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Archive className="w-6 h-6 text-gray-600" />
            Комментарии
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {order.branch_comment && (
              <InfoBlock title="Комментарий филиала" value={order.branch_comment} icon={<Building className="w-5 h-5" />} />
            )}
            {order.call_center_note && (
              <InfoBlock title="Заметка колл-центра" value={order.call_center_note} icon={<Phone className="w-5 h-5" />} />
            )}
          </div>
        </div>
      )}

      {/* Финансовая информация */}
      {!isPending && isDone && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
            Финансовая информация
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <InfoBlock 
              title="Клиент заплатил" 
              value={received ? received.toLocaleString() + " ₽" : "-"} 
              icon={<DollarSign className="w-5 h-5" />}
              accent="green"
            />
            <InfoBlock 
              title="Затраты" 
              value={outlay ? outlay.toLocaleString() + " ₽" : "-"} 
              icon={<DollarSign className="w-5 h-5" />}
              accent="red"
            />
            <InfoBlock 
              title="ЗП работника" 
              value={receivedWorker ? receivedWorker.toLocaleString() + " ₽" : "-"} 
              icon={<DollarSign className="w-5 h-5" />}
              accent="blue"
            />
            <InfoBlock 
              title="Чистая прибыль"
              value={netProfit ? netProfit.toLocaleString() + " ₽" : "-"}
              icon={<TrendingUp className="w-5 h-5" />}
              accent={netProfit >= 0 ? "green" : "red"}
            />
          </div>
        </div>
      )}

      {/* Кнопки управления */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Основное действие */}
        {["PENDING", "ON_THE_WAY", "IN_PROGRESS","IN_PROGRESS_SD"].includes(order.status) && (
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3 mb-3">
              <Target className="w-6 h-6" />
              <h3 className="text-lg font-semibold">Основное действие</h3>
            </div>
            <p className="text-blue-100 mb-4 text-sm">
              {{
                PENDING: "Назначьте работника для выполнения заказа",
                ON_THE_WAY: "Подтвердите, что работник прибыл на место",
                IN_PROGRESS: "Завершите заказ и укажите финансовые результаты",
                IN_PROGRESS_SD: "Завершите заказ СД",
              }[order.status]}
            </p>
            <button
              className="w-full bg-white text-blue-600 px-5 py-3 rounded-xl hover:bg-blue-50 transition-all duration-200 flex items-center justify-center gap-2 font-semibold shadow-lg"
              onClick={() => setActiveTab("modify")}
            >
              <Settings className="w-5 h-5" />
              {{
                PENDING: "Назначить работника",
                ON_THE_WAY: "Работник на месте",
                IN_PROGRESS: "Закрыть заказ",
                IN_PROGRESS_SD: "Закрыть заказ СД",
              }[order.status]}
            </button>
          </div>
        )}

        {/* Дополнительные действия */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Действия
          </h3>
          <div className="space-y-3">
            <button
              onClick={onCopy}
              className="w-full bg-white text-blue-600 px-5 py-3 rounded-xl hover:bg-blue-50 transition-all duration-200 flex items-center justify-center gap-2 font-semibold shadow-lg border border-blue-200"
            >
              {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              {copied ? "Скопировано!" : "Скопировать данные"}
            </button>

            <Link
              href={`/admin/orders/new/repeat/${order.id}`}
              className="w-full bg-white text-blue-600 px-5 py-3 rounded-xl hover:bg-blue-50 transition-all duration-200 flex items-center justify-center gap-2 font-semibold shadow-lg border border-blue-200 text-center"
            >
              <RotateCcw className="w-5 h-5" />
              Повторить заказ
            </Link>

            {order.status !== "COMPLETED" && order.status !== "CANCELLED" && order.status !== "DECLINED" && (
              <button
                onClick={onCancel}
                disabled={canceling}
                className="w-full bg-white text-red-600 px-5 py-3 rounded-xl hover:bg-red-50 transition-all duration-200 flex items-center justify-center gap-2 font-semibold shadow-lg border border-red-200"
              >
                <X className="w-5 h-5" />
                {canceling ? "Отмена..." : "Отменить заказ"}
              </button>
            )}
          </div>
        </div>

        {/* Редактирование */}
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <Edit className="w-6 h-6" />
            <h3 className="text-lg font-semibold">Редактирование</h3>
          </div>
          <p className="text-yellow-100 mb-4 text-sm">
            Измените основную информацию о заказе
          </p>
          <Link
            href={`/admin/orders/${order.id}/edit`}
            className="w-full bg-white text-yellow-600 px-5 py-3 rounded-xl hover:bg-yellow-50 transition-all duration-200 flex items-center justify-center gap-2 font-semibold shadow-lg text-center"
          >
            <Edit className="w-5 h-5" />
            Редактировать заказ
          </Link>
        </div>
      </div>
    </div>
  );
}

function InfoBlock({ title, value, icon, accent = "gray" }: { title: string; value: string; icon?: React.ReactNode; accent?: "gray" | "green" | "red" | "blue" }) {
  const accentColors = {
    gray: "border-gray-200 bg-white",
    green: "border-green-200 bg-green-50",
    red: "border-red-200 bg-red-50", 
    blue: "border-blue-200 bg-blue-50"
  };

  const textColors = {
    gray: "text-gray-900",
    green: "text-green-900",
    red: "text-red-900",
    blue: "text-blue-900"
  };

  return (
    <div className={`rounded-xl border p-4 ${accentColors[accent]}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h3 className="font-semibold text-gray-700 text-sm">{title}</h3>
      </div>
      <p className={`text-base font-medium ${textColors[accent]}`}>{value || "-"}</p>
    </div>
  );
}