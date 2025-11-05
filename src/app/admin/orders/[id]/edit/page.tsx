"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { apiClient } from "lib/api-client";

interface Order {
  id: number;
  full_name: string;
  phone: string;
  address: string;
  arrive_date: string;
  city: string | null;
  status: string;
  visit_type: string;
  equipment_type: string;
  call_required: boolean;
  problem?: string;
  leaflet: string | null;
  payment_type: string;
  master: string | null;
  received?: number | null;
  outlay?: number | null;
  received_worker?: number | null;
}

interface Worker {
  id: string;
  full_name: string;
  phone: string;
  telegram_username?: string | null;
  orders_completed: number;
  total_earned: number;
}

interface City {
  id: string;
  name: string;
}

interface Leaflet {
  id: string;
  name: string;
  value?: number;
}

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Ожидает" },
  { value: "ON_THE_WAY", label: "В пути" },
  { value: "IN_PROGRESS", label: "В работе" },
  { value: "IN_PROGRESS_SD", label: "В работе (СД)" },
  { value: "DECLINED", label: "Отклонён" },
  { value: "CANCEL_CC", label: "Отмена (Колл-центр)" },
  { value: "CANCEL_BRANCH", label: "Отмена (Филиал)" },
  { value: "COMPLETED", label: "Завершён" },
];

const VISIT_TYPE_OPTIONS = [
  { value: "FIRST", label: "Первичный" },
  { value: "GARAGE", label: "Гарантия" },
  { value: "REPEAT", label: "Повторный" },
];

const PAYMENT_TYPE_OPTIONS = [
  { value: "HIGH", label: "Высокая" },
  { value: "MEDIUM", label: "Средняя" },
  { value: "LOW", label: "Низкая" },
];

function formatDateForInput(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function EditableInfoBlock({
  title,
  name,
  value,
  onChange,
  type = "text",
  options,
  disabled = false,
  required = false,
  className = "",
}: {
  title: string;
  name: string;
  value: any;
  onChange: (name: string, value: any) => void;
  type?: string;
  options?: Array<{ value: string; label: string }>;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}) {
  const baseInputClasses = "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 transition-shadow duration-300 focus:outline-none focus:ring-4 focus:ring-blue-400 focus:border-blue-500 shadow-sm disabled:bg-gray-100 disabled:cursor-not-allowed";

  return (
    <div className={`mb-6 rounded-xl border bg-white p-5 text-sm shadow-sm ${className}`}>
      <label className="mb-2 block font-semibold text-gray-700">
        {title}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {type === "select" && options ? (
        <select
          disabled={disabled}
          className={`${baseInputClasses} pr-10`}
          value={value ?? ""}
          onChange={(e) => onChange(name, e.target.value)}
          required={required}
        >
          <option value="">Не выбрано</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : type === "checkbox" ? (
        <div className="flex items-center space-x-3">
          <input
            id={name}
            type="checkbox"
            disabled={disabled}
            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            checked={!!value}
            onChange={(e) => onChange(name, e.target.checked)}
          />
          <label htmlFor={name} className="text-gray-700">
            {value ? "Да" : "Нет"}
          </label>
        </div>
      ) : type === "textarea" ? (
        <textarea
          disabled={disabled}
          className={`${baseInputClasses} min-h-[100px] resize-y`}
          value={value ?? ""}
          onChange={(e) => onChange(name, e.target.value)}
          required={required}
        />
      ) : (
        <input
          disabled={disabled}
          type={type}
          className={baseInputClasses}
          value={value ?? ""}
          onChange={(e) => onChange(name, e.target.value)}
          required={required}
        />
      )}
    </div>
  );
}

function MasterInfo({ masterId }: { masterId?: string | null }) {
  const [worker, setWorker] = useState<Worker | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!masterId) return;
    
    const fetchWorker = async () => {
      setLoading(true);
      try {
        const workerData = await apiClient.get<Worker>(`/api/v1/workers/${masterId}/`);
        setWorker(workerData);
      } catch (error) {
        console.error('Error fetching worker:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorker();
  }, [masterId]);

  if (!masterId) {
    return (
      <div className="mb-6 rounded-xl border border-orange-200 bg-orange-50 p-5 text-sm">
        <p className="text-center text-orange-600">Мастер не назначен</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-5 text-sm">
        <p className="text-center text-blue-600">Загрузка информации о мастере...</p>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-5 text-sm">
        <p className="text-center text-red-600">Мастер не найден</p>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-5 text-sm shadow-sm">
      <h2 className="mb-3 text-lg font-semibold text-gray-800">Информация о мастере</h2>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div>
          <strong className="text-gray-700">ФИО:</strong> {worker.full_name}
        </div>
        <div>
          <strong className="text-gray-700">Телефон:</strong> {worker.phone}
        </div>
        {worker.telegram_username && (
          <div className="sm:col-span-2">
            <strong className="text-gray-700">Telegram:</strong> @{worker.telegram_username}
          </div>
        )}
        <div>
          <strong className="text-gray-700">Завершено заказов:</strong> {worker.orders_completed}
        </div>
        <div>
          <strong className="text-gray-700">Всего заработано:</strong> {worker.total_earned.toLocaleString()} ₽
        </div>
      </div>
    </div>
  );
}

function FinancialInfo({ order, onFieldChange, isCompletedOriginally }: {
  order: Order;
  onFieldChange: (name: keyof Order, value: any) => void;
  isCompletedOriginally: boolean;
}) {
  const calculateWorkerPayment = (received: number, outlay: number, paymentType: string): number => {
    const profit = received - outlay;
    if (profit <= 0) return 0;

    let percent = 0.5;
    if (paymentType === "LOW") percent = 0.7;
    else if (paymentType === "MEDIUM") percent = 0.6;

    return Math.floor(profit * percent);
  };

  const workerPayment = calculateWorkerPayment(
    Number(order.received ?? 0),
    Number(order.outlay ?? 0),
    order.payment_type
  );

  return (
    <div className="mb-6 rounded-xl border border-purple-200 bg-purple-50 p-5">
      <h2 className="mb-4 text-lg font-semibold text-gray-800">Финансовая информация</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <EditableInfoBlock
          title="Получено от клиента (₽)"
          name="received"
          type="number"
          value={order.received ?? ""}
          onChange={onFieldChange}
          disabled={!isCompletedOriginally}
          className="mb-0"
        />
        <EditableInfoBlock
          title="Расходы (₽)"
          name="outlay"
          type="number"
          value={order.outlay ?? ""}
          onChange={onFieldChange}
          disabled={!isCompletedOriginally}
          className="mb-0"
        />
        <EditableInfoBlock
          title="Выплата мастеру (₽)"
          name="received_worker"
          type="number"
          value={order.received_worker ?? workerPayment}
          onChange={onFieldChange}
          disabled={!isCompletedOriginally}
          className="mb-0"
        />
      </div>
      {!isCompletedOriginally && (
        <p className="mt-3 text-sm text-gray-600">
          Финансовые поля доступны для редактирования только после завершения заказа
        </p>
      )}
    </div>
  );
}

export default function EditOrderPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [leaflets, setLeaflets] = useState<Leaflet[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [order, setOrder] = useState<Order | null>(null);
  const [originalOrder, setOriginalOrder] = useState<Order | null>(null);
  const [updatedFields, setUpdatedFields] = useState<Partial<Order>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Параллельно загружаем все данные с правильными endpoints
        const [citiesData, leafletsData, workersData, orderData] = await Promise.all([
          apiClient.get<City[]>('/api/v1/cities/'),
          apiClient.get<Leaflet[]>('/api/v1/leaflets/'),
          apiClient.get<Worker[]>('/api/v1/workers/'),
          apiClient.get<Order>(`/api/v1/orders/${params.id}/`)
        ]);

        setCities(citiesData);
        setLeaflets(leafletsData);
        setWorkers(workersData);
        setOrder(orderData);
        setOriginalOrder(orderData);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Ошибка загрузки данных');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  function handleFieldChange(name: keyof Order, value: any) {
    if (!order) return;

    // Обработка числовых полей
    if (["received", "outlay", "received_worker"].includes(name)) {
      value = value === "" ? null : Number(value);
      if (isNaN(value)) value = null;
    }

    // Обработка boolean полей
    if (name === "call_required") {
      value = Boolean(value);
    }

    const updatedOrder = { ...order, [name]: value };
    setOrder(updatedOrder);
    setUpdatedFields(prev => ({ ...prev, [name]: value }));
  }

  async function handleSave() {
    if (!order || !originalOrder || Object.keys(updatedFields).length === 0) return;

    setSaving(true);
    try {
      const originalStatus = originalOrder.status;
      const newStatus = updatedFields.status;
      const isStatusChangedFromCompleted = originalStatus === "COMPLETED" && newStatus && newStatus !== "COMPLETED";

      const payload = {
        ...updatedFields,
        ...(isStatusChangedFromCompleted && {
          received: 0,
          outlay: 0,
          received_worker: 0,
        }),
      };

      // Используем правильный endpoint для обновления
      const updatedOrder = await apiClient.patch<Order>(`/api/v1/orders/${order.id}/`, payload);
      
      setOrder(updatedOrder);
      setOriginalOrder(updatedOrder);
      setUpdatedFields({});
      toast.success("Изменения успешно сохранены");
      
    } catch (error) {
      console.error('Save error:', error);
      toast.error("Ошибка при сохранении изменений");
    } finally {
      setSaving(false);
    }
  }

  async function handleQuickAction(action: 'complete' | 'decline' | 'start_progress') {
    if (!order) return;

    try {
      let updatedOrder: Order;

      switch (action) {
        case 'complete':
          updatedOrder = await apiClient.patch<Order>(`/api/v1/orders/${order.id}/complete/`, {
            received: order.received || 0,
            outlay: order.outlay || 0,
            received_worker: order.received_worker || 0,
            master_id: order.master
          });
          break;
        
        case 'decline':
          updatedOrder = await apiClient.patch<Order>(`/api/v1/orders/${order.id}/decline/`, {});
          break;
        
        case 'start_progress':
          updatedOrder = await apiClient.patch<Order>(`/api/v1/orders/${order.id}/set-on-the-way-to-in-progress/`, {});
          break;
        
        default:
          return;
      }

      setOrder(updatedOrder);
      setOriginalOrder(updatedOrder);
      setUpdatedFields({});
      toast.success(`Заказ ${getActionLabel(action)}`);
      
    } catch (error) {
      console.error(`${action} error:`, error);
      toast.error(`Ошибка при ${getActionLabel(action, true)}`);
    }
  }

  function getActionLabel(action: string, isError = false): string {
    const labels: { [key: string]: { success: string; error: string } } = {
      complete: { success: 'завершен', error: 'завершении' },
      decline: { success: 'отклонен', error: 'отклонении' },
      start_progress: { success: 'переведен в работу', error: 'переводе в работу' }
    };
    
    return isError ? labels[action]?.error || 'выполнении действия' : labels[action]?.success || 'обновлен';
  }

  function handleCancel() {
    if (Object.keys(updatedFields).length > 0) {
      if (!confirm('Есть несохраненные изменения. Выйти без сохранения?')) {
        return;
      }
    }
    router.back();
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка данных заказа...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">Заказ не найден</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Назад
          </button>
        </div>
      </div>
    );
  }

  const isCompletedOriginally = originalOrder?.status === "COMPLETED";
  const hasChanges = Object.keys(updatedFields).length > 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4">
        {/* Заголовок и действия */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Редактирование заказа #{order.id}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Статус: <span className="font-medium">{STATUS_OPTIONS.find(s => s.value === order.status)?.label}</span>
            </p>
          </div>
          
          {/* Быстрые действия */}
          <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
            {order.status === 'ON_THE_WAY' && (
              <button
                onClick={() => handleQuickAction('start_progress')}
                className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
              >
                Начать работу
              </button>
            )}
            {order.status === 'IN_PROGRESS' && (
              <button
                onClick={() => handleQuickAction('complete')}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                Завершить
              </button>
            )}
            {!['COMPLETED', 'DECLINED', 'CANCEL_CC', 'CANCEL_BRANCH'].includes(order.status) && (
              <button
                onClick={() => handleQuickAction('decline')}
                className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
              >
                Отклонить
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Основная информация */}
          <div className="lg:col-span-2 space-y-6">
            {/* Основные поля */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-800">Основная информация</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <EditableInfoBlock
                    title="ФИО клиента"
                    name="full_name"
                    value={order.full_name}
                    onChange={handleFieldChange}
                    required
                  />
                  <EditableInfoBlock
                    title="Телефон"
                    name="phone"
                    value={order.phone}
                    onChange={handleFieldChange}
                    required
                  />
                </div>
                
                <EditableInfoBlock
                  title="Адрес"
                  name="address"
                  value={order.address}
                  onChange={handleFieldChange}
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <EditableInfoBlock
                    title="Дата визита"
                    name="arrive_date"
                    type="datetime-local"
                    value={formatDateForInput(order.arrive_date)}
                    onChange={(name, value) => handleFieldChange(name, value)}
                  />
                  <EditableInfoBlock
                    title="Тип визита"
                    name="visit_type"
                    type="select"
                    options={VISIT_TYPE_OPTIONS}
                    value={order.visit_type}
                    onChange={handleFieldChange}
                  />
                </div>

                <EditableInfoBlock
                  title="Описание проблемы"
                  name="problem"
                  type="textarea"
                  value={order.problem || ""}
                  onChange={handleFieldChange}
                />
              </div>
            </div>

            {/* Детали заказа */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-800">Детали заказа</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <EditableInfoBlock
                    title="Статус заказа"
                    name="status"
                    type="select"
                    options={STATUS_OPTIONS}
                    value={order.status}
                    onChange={handleFieldChange}
                  />
                  <EditableInfoBlock
                    title="Тип оплаты"
                    name="payment_type"
                    type="select"
                    options={PAYMENT_TYPE_OPTIONS}
                    value={order.payment_type}
                    onChange={handleFieldChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <EditableInfoBlock
                    title="Город"
                    name="city"
                    type="select"
                    options={cities.map((city) => ({
                      value: city.id,
                      label: city.name,
                    }))}
                    value={order.city || ""}
                    onChange={handleFieldChange}
                  />
                  <EditableInfoBlock
                    title="Листовка"
                    name="leaflet"
                    type="select"
                    options={leaflets.map((leaflet) => ({
                      value: leaflet.id,
                      label: leaflet.name + (leaflet.value ? ` (${leaflet.value} )` : ''),
                    }))}
                    value={order.leaflet || ""}
                    onChange={handleFieldChange}
                  />
                </div>

                <EditableInfoBlock
                  title="Тип оборудования"
                  name="equipment_type"
                  value={order.equipment_type}
                  onChange={handleFieldChange}
                />

                <EditableInfoBlock
                  title="Требуется звонок"
                  name="call_required"
                  type="checkbox"
                  value={order.call_required}
                  onChange={handleFieldChange}
                />
              </div>
            </div>

            {/* Финансовая информация */}
            <FinancialInfo
              order={order}
              onFieldChange={handleFieldChange}
              isCompletedOriginally={isCompletedOriginally}
            />
          </div>

          {/* Боковая панель */}
          <div className="space-y-6">
            {/* Мастер */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Назначение мастера</h2>
              <EditableInfoBlock
                title="Мастер"
                name="master"
                type="select"
                options={workers.map((w) => ({
                  value: w.id,
                  label: `${w.full_name} (${w.phone})`,
                }))}
                value={order.master || ""}
                onChange={handleFieldChange}
                className="mb-0"
              />
            </div>

            {/* Информация о мастере */}
            <MasterInfo masterId={order.master} />

            {/* Действия */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Действия</h2>
              <div className="space-y-3">
                <button
                  onClick={handleSave}
                  disabled={!hasChanges || saving}
                  className={`w-full px-4 py-3 rounded-lg font-semibold transition-colors duration-300 ${
                    !hasChanges || saving
                      ? "bg-gray-400 cursor-not-allowed text-gray-700"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {saving ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Сохранение...
                    </>
                  ) : (
                    "Сохранить изменения"
                  )}
                </button>

                <button
                  onClick={handleCancel}
                  className="w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Отмена
                </button>

                {hasChanges && (
                  <p className="text-sm text-orange-600 text-center">
                    Есть несохраненные изменения
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}