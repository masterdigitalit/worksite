"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Order {
  id: number;
  fullName: string;
  phone: string;
  address: string;
  arriveDate: string;
  city: string;
  status: string;
  visitType: string;
  equipmentType: string;
  callRequired: boolean;
  problem?: string;
  paymentType: string;
  masterId?: number | null;
  received?: number | null;
  outlay?: number | null;
  receivedworker?: number | null;
}

interface Worker {
  id: number;
  fullName: string;
  telegramUsername?: string | null;
  phone: string;
  ordersCompleted: number;
  totalEarned: number;
}

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Ожидает" },
  { value: "ON_THE_WAY", label: "В пути" },
  { value: "IN_PROGRESS", label: "В работе" },
  { value: "IN_PROGRESS_SD", label: "В работе (СД)" },
  { value: "DECLINED", label: "Отклонён" },
  { value: "CANCEL_CC", label: "Отмена (Колл-центр)" },
  { value: "CANCEL_BRANCH", label: "Отмена (Филиал)" },
  { value: "DONE", label: "Завершён" },
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

function preserveUserInputAsUTC(datetimeStr: string): Date {
  const [datePart, timePart] = datetimeStr.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  return new Date(Date.UTC(year, month - 1, day, hour, minute));
}





function EditableInfoBlock({
  title,
  name,
  value,
  onChange,
  type = "text",
  options,
  disabled = false,
}: any) {
  const baseInputClasses =
    "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 transition-shadow duration-300 focus:outline-none focus:ring-4 focus:ring-blue-400 focus:border-blue-500 shadow-sm";

  return (
    <div className="mb-6 rounded-xl border bg-white p-5 text-sm shadow-sm">
      <label className="mb-2 block font-semibold text-gray-700">{title}</label>

      {type === "select" && options ? (
        <select
          disabled={disabled}
          className={baseInputClasses + " pr-10"}
          value={value ?? ""}
          onChange={(e) => onChange(name, e.target.value)}
        >
          <option value="">Не выбрано</option>
          {options.map((opt: any) => (
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
            className="h-5 w-5"
            checked={value}
            onChange={(e) => onChange(name, e.target.checked)}
          />
          <label htmlFor={name}>{value ? "Да" : "Нет"}</label>
        </div>
      ) : type === "textarea" ? (
        <textarea
          disabled={disabled}
          className={baseInputClasses + " min-h-[100px] resize-y"}
          value={value ?? ""}
          onChange={(e) => onChange(name, e.target.value)}
        />
      ) : (
        <input
          disabled={disabled}
          type={type}
          className={baseInputClasses}
          value={type !== "datetime-local" ? (value ?? "") : undefined}
          onChange={(e) => onChange(name, e.target.value)}
        />
      )}
    </div>
  );
}

function MasterInfo({ masterId }: { masterId?: number | null }) {
  
  const [worker, setWorker] = useState<Worker | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!masterId) return;
    setLoading(true);
    fetch(`/api/workers/${masterId}`)
      .then((res) => res.json())
      .then((data) => setWorker(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [masterId]);

  if (!masterId)
    return <p className="text-center text-gray-600">Мастер не назначен</p>;
  if (loading) return <p className="text-gray-500">Загрузка информации...</p>;
  if (!worker) return <p className="text-red-500">Мастер не найден</p>;

  return (
    <div className="mb-6 rounded-xl border bg-white p-5 text-sm shadow-sm">
      <h2 className="mb-3 text-xl font-semibold">Информация о мастере</h2>
      <p>
        <strong>ФИО:</strong> {worker.fullName}
      </p>
      <p>
        <strong>Телефон:</strong> {worker.phone}
      </p>
      {worker.telegramUsername && (
        <p>
          <strong>Telegram:</strong> {worker.telegramUsername}
        </p>
      )}
      <p>
        <strong>Завершено заказов:</strong> {worker.ordersCompleted}
      </p>
      <p>
        <strong>Всего заработано:</strong> {worker.totalEarned} ₽
      </p>
    </div>
  );
}

export default function EditOrderPage() {
  const [cities, setCities] = useState([]);

useEffect(() => {
  fetch("/api/city/all")
    .then((res) => res.json())
    .then(setCities)
    .catch(console.error);
}, []);
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [originalOrder, setOriginalOrder] = useState<Order | null>(null);
  const [updatedFields, setUpdatedFields] = useState<Partial<Order>>({});
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

  // В локальном состоянии для receivedworker храним строку для контроля ввода
  const [receivedWorkerStr, setReceivedWorkerStr] = useState<string>("");

  useEffect(() => {
    fetch(`/api/orders/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setOrder(data);
        setOriginalOrder(data);
        setReceivedWorkerStr(data.receivedworker?.toString() ?? "");
      })
      .finally(() => setLoading(false));

    fetch("/api/workers")
      .then((res) => res.json())
      .then(setWorkers);
  }, [params.id]);

  // Обновляем order при вводе в форму
  function handleFieldChange(name: keyof Order, value: any) {
    // Для полей financial приводим к числу (если пустая строка — null)
    if (["received", "outlay", "receivedworker"].includes(name)) {
      const num = value === "" ? null : Number(value);
      value = isNaN(num) ? null : num;
    }

    setOrder((prev) => (prev ? { ...prev, [name]: value } : prev));
    setUpdatedFields((prev) => ({ ...prev, [name]: value }));
  }

  // Автоматический расчет receivedworker при изменении received, outlay, paymentType
  useEffect(() => {
    if (!order) return;

    // Берём числа (если null или undefined, считаем 0)
    const r = Number(order.received ?? 0);
    const o = Number(order.outlay ?? 0);
    let percent = 0.5;

    if (order.paymentType === "LOW") percent = 0.7;
    else if (order.paymentType === "MEDIUM") percent = 0.6;
    else if (order.paymentType === "HIGH") percent = 0.5;

    const profit = r - o;
    const calculated = Math.floor(profit * percent);

    // Если profit отрицательный, не даём отрицательный receivedworker
    const finalValue = calculated > 0 ? calculated : 0;

    // Обновляем в локальном состоянии и в order
    setReceivedWorkerStr(finalValue.toString());
    setOrder((prev) => (prev ? { ...prev, receivedworker: finalValue } : prev));
    setUpdatedFields((prev) => ({ ...prev, receivedworker: finalValue }));
  }, [order?.received, order?.outlay, order?.paymentType]);

  async function handleSave() {
    if (!order || !originalOrder) return;

    const originalStatus = originalOrder.status;
    const newStatus = updatedFields.status;
    const isStatusChangedFromDone =
      originalStatus === "DONE" && newStatus && newStatus !== "DONE";

    const payload = {
      ...updatedFields,
      ...(isStatusChangedFromDone && {
        received: 0,
        outlay: 0,
        receivedworker: 0,
      }),
    };
    console.log(payload)

    const res = await fetch(`/api/orders/${order.id}/update`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      return alert("Ошибка при сохранении изменений");
    }

    const updatedOrder = await res.json();
    setOrder(updatedOrder);
    setOriginalOrder(updatedOrder);
    setUpdatedFields({});
    setReceivedWorkerStr(updatedOrder.receivedworker?.toString() ?? "");
  }

  if (loading || !order) return <p className="p-6">Загрузка...</p>;

  const isDoneOriginally = originalOrder?.status === "DONE";
    console.log(order)
  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-bold">
        Редактирование заказа #{order.id}
      </h1>

      <EditableInfoBlock
        title="ФИО клиента"
        name="fullName"
        value={order.fullName}
        onChange={handleFieldChange}
      />
      <EditableInfoBlock
        title="Телефон"
        name="phone"
        value={order.phone}
        onChange={handleFieldChange}
      />
      <EditableInfoBlock
        title="Адрес"
        name="address"
        value={order.address}
        onChange={handleFieldChange}
      />
      <EditableInfoBlock
        title="Дата визита"
        name="arriveDate"
        type="datetime-local"
        onChange={(name, value) =>
          handleFieldChange(name, preserveUserInputAsUTC(value))
        }
      />
      <EditableInfoBlock
        title="Тип визита"
        name="visitType"
        type="select"
        options={VISIT_TYPE_OPTIONS}
        value={order.visitType}
        onChange={handleFieldChange}
      />
      <EditableInfoBlock
        title="Статус заказа"
        name="status"
        type="select"
        options={STATUS_OPTIONS}
        value={order.status}
        onChange={handleFieldChange}
      />
      <EditableInfoBlock
        title="Описание проблемы"
        name="problem"
        type="textarea"
        value={order.problem || ""}
        onChange={handleFieldChange}
      />
  
      <EditableInfoBlock
  title="Город"
  name="city"
  type="select"
  options={cities.map((el) => ({
    value: String(el.id), // обязательно строка
    label: el.name,
  }))}
  value={String(order.city?.id ?? order.city)} // тут должен быть ID города
  onChange={(name, val) => handleFieldChange(name, Number(val))} // преобразуем обратно в число
/>

      <EditableInfoBlock
        title="Прибор"
        name="equipmentType"
        value={order.equipmentType}
        onChange={handleFieldChange}
      />
      <EditableInfoBlock
        title="Нужен звонок"
        name="callRequired"
        type="checkbox"
        value={order.callRequired}
        onChange={handleFieldChange}
      />
      <EditableInfoBlock
        title="Тип оплаты"
        name="paymentType"
        type="select"
        options={PAYMENT_TYPE_OPTIONS}
        value={order.paymentType}
        onChange={handleFieldChange}
      />

      <EditableInfoBlock
        title="Получено от клиента (₽)"
        name="received"
        type="number"
        value={order.received ?? ""}
        onChange={handleFieldChange}
        disabled={!isDoneOriginally}
      />
      <EditableInfoBlock
        title="Расходы (₽)"
        name="outlay"
        type="number"
        value={order.outlay ?? ""}
        onChange={handleFieldChange}
        disabled={!isDoneOriginally}
      />
      <EditableInfoBlock
        title="Выплата мастеру (₽)"
        name="receivedworker"
        type="number"
        value={receivedWorkerStr}
        onChange={(name, value) => {
          // Чтобы вручную менять receivedworker (если нужно)
          setReceivedWorkerStr(value);
          const numValue = Number(value);
          setOrder((prev) =>
            prev
              ? { ...prev, receivedworker: isNaN(numValue) ? 0 : numValue }
              : prev,
          );
          setUpdatedFields((prev) => ({
            ...prev,
            receivedworker: isNaN(numValue) ? 0 : numValue,
          }));
        }}
        disabled={!isDoneOriginally}
      />

      <EditableInfoBlock
        title="ID мастера"
        name="masterId"
        type="select"
        options={workers.map((w) => ({
          value: w.id.toString(),
          label: w.fullName,
        }))}
        value={order.masterId?.toString() ?? ""}
        onChange={(name, value) =>
          handleFieldChange(name, value ? Number(value) : null)
        }
      />

      <MasterInfo masterId={order.masterId} />

      <button
        onClick={handleSave}
        disabled={Object.keys(updatedFields).length === 0}
        className={`mt-8 w-full rounded-xl px-6 py-3 font-semibold transition-colors duration-300 ${
          Object.keys(updatedFields).length === 0
            ? "cursor-not-allowed bg-gray-400"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        Сохранить
      </button>
    </div>
  );
}
