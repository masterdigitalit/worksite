'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Document {
  id: number;
  url: string;
  type: string;
}

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
  paymentType: string;
  documents?: Array<Document>;
  masterId?: number | null;
  received?: number | null;
  outlay?: number | null;
  receivedworker?: number | null;
}

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Ожидает' },
  { value: 'ON_THE_WAY', label: 'В пути' },
  { value: 'IN_PROGRESS', label: 'В работе' },
  { value: 'IN_PROGRESS_SD', label: 'В работе (СД)' },
  { value: 'DECLINED', label: 'Отклонён' },
  { value: 'CANCEL_CC', label: 'Отмена (Колл-центр)' },
  { value: 'CANCEL_BRANCH', label: 'Отмена (Филиал)' },
  { value: 'DONE', label: 'Завершён' },
];

const VISIT_TYPE_OPTIONS = [
  { value: 'FIRST', label: 'Первичный' },
  { value: 'GARAGE', label: 'Гараж' },
  { value: 'REPEAT', label: 'Повторный' },
];

const PAYMENT_TYPE_OPTIONS = [
  { value: 'HIGH', label: 'Высокая' },
  { value: 'MEDIUM', label: 'Средняя' },
  { value: 'LOW', label: 'Низкая' },
];
function formatDateToLocalDatetimeInput(dateStr: string | Date): string {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;

  const pad = (n: number) => n.toString().padStart(2, '0');

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours() -3);
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}


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
  type = 'text',
  options,
  onChange,
}: {
  title: string;
  name: keyof Order;
  value: any;
  type?: 'text' | 'number' | 'date' | 'datetime-local' | 'select' | 'checkbox' | 'textarea';
  options?: { value: string; label: string }[];
  onChange: (name: keyof Order, value: any) => void;
}) {
  const isFinance = [
    'Клиент заплатил',
    'Затраты',
    'Чистая прибыль',
    'Зп работника',
    'Выплата',
    'Прибыль',
  ].includes(title);

  const baseInputClasses =
    "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 transition-shadow duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-400 focus:border-blue-500 shadow-sm";

  const selectClasses = baseInputClasses + " pr-10 cursor-pointer";

  return (
    <div className={`mb-6 rounded-xl border border-gray-300 bg-white p-5 shadow-sm text-sm ${isFinance ? 'bg-gray-50' : ''}`}>
      <label className="block mb-2 font-semibold text-gray-700">{title}</label>

      {type === 'select' && options ? (
        <select
          className={selectClasses}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : type === 'checkbox' ? (
        <div className="flex items-center space-x-3">
          <input
            id={name}
            type="checkbox"
            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-400"
            checked={value}
            onChange={(e) => onChange(name, e.target.checked)}
          />
          <label htmlFor={name} className="text-gray-700 select-none">
            {value ? 'Да' : 'Нет'}
          </label>
        </div>
      ) : type === 'textarea' ? (
        <textarea
          className={baseInputClasses + " resize-y min-h-[100px]"}
          value={value ?? ''}
          onChange={(e) => onChange(name, e.target.value)}
        />
      ) : (
        <input
          type={type}
          className={baseInputClasses}
          value={value ?? ''}
          onChange={(e) => onChange(name, e.target.value)}
        />
      )}
    </div>
  );
}

export default function EditOrderPage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [updatedFields, setUpdatedFields] = useState<Partial<Order>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchOrder() {
    try {
      const res = await fetch(`/api/orders/${params.id}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Ошибка загрузки');
      }
      const data = await res.json();
      setOrder(data);
      setUpdatedFields({});
      setError(null);
    } catch (err: any) {
      setError(err.message);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  function handleFieldChange(name: keyof Order, value: any) {
    setOrder((prev) => (prev ? { ...prev, [name]: value } : prev));
    setUpdatedFields((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSave() {
    if (!order) return;

    try {
      const res = await fetch(`/api/orders/${order.id}/update`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedFields),
      });

      if (!res.ok) {
        const err = await res.json();
        alert("Ошибка при сохранении: " + err.error || res.statusText);
        return;
      }

      const updated = await res.json();
      console.log("Успешно обновлено:", updated);
      setUpdatedFields({});
    } catch (err) {
      console.error("Ошибка отправки:", err);
      alert("Не удалось сохранить изменения");
    }
  }

  if (loading) return <div className="p-6">Загрузка...</div>;
  if (error) return <div className="p-6 text-red-500">Ошибка: {error}</div>;
  if (!order) return null;
  console.log(order.arriveDate)

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Редактирование заказа #{order.id}</h1>

      <EditableInfoBlock title="ФИО клиента" name="fullName" value={order.fullName} onChange={handleFieldChange} />
      <EditableInfoBlock title="Телефон" name="phone" value={order.phone} onChange={handleFieldChange} />
      <EditableInfoBlock title="Адрес" name="address" value={order.address} onChange={handleFieldChange} />
<EditableInfoBlock
  title="Дата визита"
  name="arriveDate"
  value={formatDateToLocalDatetimeInput(order.arriveDate)}

            type="datetime-local"

  onChange={(name, value) =>
    handleFieldChange(name,  preserveUserInputAsUTC(value))
  }
/>


      <EditableInfoBlock title="Тип визита" name="visitType" type="select" options={VISIT_TYPE_OPTIONS} value={order.visitType} onChange={handleFieldChange} />
      <EditableInfoBlock title="Статус заказа" name="status" type="select" options={STATUS_OPTIONS} value={order.status} onChange={handleFieldChange} />
      <EditableInfoBlock title="Описание проблемы" name="problem" type="textarea" value={order.problem || ''} onChange={handleFieldChange} />
      <EditableInfoBlock title="Город" name="city" value={order.city} onChange={handleFieldChange} />
      <EditableInfoBlock title="Прибор" name="equipmentType" value={order.equipmentType} onChange={handleFieldChange} />
      <EditableInfoBlock title="Нужен звонок" name="callRequired" type="checkbox" value={order.callRequired} onChange={handleFieldChange} />
      <EditableInfoBlock title="Тип прибыли" name="paymentType" type="select" options={PAYMENT_TYPE_OPTIONS} value={order.paymentType} onChange={handleFieldChange} />

      <button
        onClick={handleSave}
        disabled={Object.keys(updatedFields).length === 0}
        className={`mt-8 w-full rounded-xl px-6 py-3 font-semibold transition-colors duration-300 ${
          Object.keys(updatedFields).length === 0
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        Сохранить
      </button>
    </div>
  );
}
