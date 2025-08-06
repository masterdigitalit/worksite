"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Step =
  | "fullName"
  | "phone"
  | "address"
  | "city"
  | "problem"
  | "arriveDate"
  | "visitType"
  | "callRequired"
  | "isProfessional"
  | "equipmentType"
  | "paymentType"
  | "review";

const steps: Step[] = [
  "fullName",
  "phone",
  "address",
  "city",
  "problem",
  "arriveDate",
  "visitType",
  "callRequired",
  "isProfessional",
  "equipmentType",
  "paymentType",
  "review",
];

const payLabels: Record<string, string> = {
  HIGH: "Высокая",
  MEDIUM: "Средняя",
  LOW: "Низкая",
};

const stepLabels: Record<Step, string> = {
  fullName: "ФИО",
  phone: "Телефон",
  address: "Адрес",
  city: "Город",
  problem: "Проблема",
  arriveDate: "Дата и время",
  visitType: "Тип визита",
  callRequired: "Нужен звонок?",
  isProfessional: "Профессионал?",
  equipmentType: "Оборудование",
  paymentType: "Степень оплаты",
  review: "Обзор",
};

function formatPhone(input: string): string {
  const digits = input.replace(/\D/g, "").replace(/^8/, "7");
  if (digits.length !== 11 || !digits.startsWith("7")) return input;
  const match = digits.match(/^(\d)(\d{3})(\d{3})(\d{2})(\d{2})$/);
  return match ? `+${match[1]}(${match[2]})${match[3]}-${match[4]}-${match[5]}` : input;
}

export default function AddNewOrderPage({ shouldValidate = true }: { shouldValidate?: boolean }) {
  const [cities, setCities] = useState([]);
  console.log(cities)


  useEffect(() => {
    fetch('/api/city/all')
      .then((res) => res.json())
      .then(setCities)
      
   
  }, []);
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    problem: "",
    arriveDate: "",
    visitType: "",
    callRequired: false,
    isProfessional: false,
    equipmentType: "",
    paymentType: "",
  });
  console.log(form)

  const step = steps[stepIndex];

  const handleNext = () => {
    const errorMsg = validateStep(step);
    if (shouldValidate && errorMsg) {
      setError(errorMsg);
      return;
    }
    setError(null);
    if (stepIndex < steps.length - 1) {
      setStepIndex((i) => i + 1);
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) {
      setStepIndex((i) => i - 1);
      setError(null);
    }
  };

  const handleChange = (field: keyof typeof form, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: Step): string | null => {
    const required = (val: string) => (!val.trim() ? "Поле не может быть пустым" : null);

    switch (step) {
      case "fullName":
        return required(form.fullName);
      case "phone": {
        const cleaned = form.phone.replace(/\D/g, "");
        const valid = cleaned.length === 11 && cleaned.startsWith("7");
        return !valid ? "Введите корректный номер" : null;
      }
      case "address":
        return required(form.address);
      case "city":
        
        return required(form.city);
      case "problem":
        return required(form.problem);
      case "arriveDate":
        return !form.arriveDate
          ? "Выберите дату"
          : new Date(form.arriveDate) < new Date()
          ? "Дата должна быть в будущем"
          : null;
      case "visitType":
        return required(form.visitType);
      case "equipmentType":
        return required(form.equipmentType);
      case "paymentType":
        return required(form.paymentType);
      default:
        return null;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      function preserveUserInputAsUTC(datetimeStr: string): Date {
        const [datePart, timePart] = datetimeStr.split("T");
        const [year, month, day] = datePart.split("-").map(Number);
        const [hour, minute] = timePart.split(":").map(Number);
        return new Date(Date.UTC(year, month - 1, day, hour, minute));
      }

      const body = {
        ...form,
        arriveDate: preserveUserInputAsUTC(form.arriveDate),
        cityId: form.city, 
        city:form.city
      };

      const response = await fetch("/api/orders/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Ошибка при создании");

      const created = await response.json();
      setSubmitSuccess(true);
      setForm({
        fullName: "",
        phone: "",
        address: "",
        city: "",
        problem: "",
        arriveDate: "",
        visitType: "",
        callRequired: false,
        isProfessional: false,
        equipmentType: "",
        paymentType: "",
      });
      setStepIndex(0);

      setTimeout(() => {
        router.push(`/admin/orders/${created.id}`);
      }, 1000);
    } catch (e) {
      alert("Произошла ошибка");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    const textInput = (field: keyof typeof form, label: string, type = "text", placeholder?: string) => (
      <InputStep
        label={label}
        value={form[field]}
        type={type}
        placeholder={placeholder}
        onChange={(val) =>
          handleChange(
            field,
            field === "phone" ? formatPhone(val) : val
          )
        }
        onEnter={handleNext}
      />
    );

    switch (step) {
      case "fullName":
        return textInput("fullName", "ФИО клиента");
      case "phone":
        return textInput("phone", "Телефон", "tel", "+7(999)123-45-67");
      case "address":
        return textInput("address", "Адрес");
      case "city":
        return  (<SelectStep
  label="Город"
  options={cities.map((el) => ({
    value: String(el.id), // <-- обязательно строкой
    label: el.name,
  }))}
  value={form.city}
  onChange={(val) => handleChange("city", val)} // val = ID города
/>)
      case "problem":
        return textInput("problem", "Описание проблемы");
      case "arriveDate":
        return textInput("arriveDate", "Дата и время прибытия", "datetime-local");
      case "visitType":
        return (
          <SelectStep
            label="Тип визита"
            value={form.visitType}
            onChange={(val) => handleChange("visitType", val)}
            options={[
              { value: "FIRST", label: "Первичный визит" },
              { value: "GARAGE", label: "Гарантия" },
              { value: "REPEAT", label: "Повторный визит" },
            ]}
          />
        );
      case "callRequired":
        return (
          <CheckboxStep
            label="Требуется звонок клиенту?"
            checked={form.callRequired}
            onChange={(val) => handleChange("callRequired", val)}
          />
        );
      case "isProfessional":
        return (
          <CheckboxStep
            label="Профессиональный заказ?"
            checked={form.isProfessional}
            onChange={(val) => handleChange("isProfessional", val)}
          />
        );
      case "equipmentType":
        return textInput("equipmentType", "Прибор");
      case "paymentType":
        return (
          <SelectStep
            label="Тип прибыли"
            options={[
              { value: "HIGH", label: "Высокая" },
              { value: "MEDIUM", label: "Средняя" },
              { value: "LOW", label: "Низкая" },
            ]}
            value={form.paymentType}
            onChange={(val) => handleChange("paymentType", val)}
          />
        );
      
      case "review":
        return (
          <div className="space-y-4">
            <h2 className="mb-2 text-xl font-bold">Проверьте данные</h2>
            <div className="space-y-2 rounded border bg-white p-4 text-sm shadow-sm">
              <ReviewItem label="ФИО">{form.fullName}</ReviewItem>
              <ReviewItem label="Телефон">{form.phone}</ReviewItem>
              <ReviewItem label="Адрес">{form.address}</ReviewItem>
              <ReviewItem label="Город">{cities.find(city => city.id === parseInt( form.city))?.name || "Не найдено"}</ReviewItem>
              <ReviewItem label="Описание проблемы">{form.problem}</ReviewItem>
              <ReviewItem label="Дата визита">
                {form.arriveDate ? new Date(form.arriveDate).toLocaleString() : ""}
              </ReviewItem>
              <ReviewItem label="Тип визита">{form.visitType}</ReviewItem>
              <ReviewItem label="Требуется звонок">{form.callRequired ? "Да" : "Нет"}</ReviewItem>
              <ReviewItem label="Профессиональный заказ">{form.isProfessional ? "Да" : "Нет"}</ReviewItem>
              <ReviewItem label="Прибор">{form.equipmentType}</ReviewItem>
              <ReviewItem label="Тип прибыли">{payLabels[form.paymentType]}</ReviewItem>
            </div>
          </div>
        );
    }
  };

  const progressPercent = Math.round((stepIndex / (steps.length - 1)) * 100);

  return (
    <div className="mx-auto max-w-md space-y-6 p-6">
      <h1 className="text-center text-2xl font-bold">➕ Новый заказ</h1>

      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      <div className="mb-2 text-center text-sm text-gray-500">
        Шаг {stepIndex + 1} из {steps.length}: {stepLabels[step]}
      </div>

      {submitSuccess && (
        <div className="rounded bg-green-100 p-4 text-center text-green-800">
          Заказ успешно создан! Перенаправление...
        </div>
      )}

      {error && (
        <div className="rounded bg-red-100 p-3 text-sm text-red-800">{error}</div>
      )}

      {renderStep()}

      <div className="mt-4 flex justify-between">
        <button
          type="button"
          className="rounded bg-gray-300 px-4 py-2 text-gray-800 hover:bg-gray-400 disabled:opacity-50"
          onClick={handleBack}
          disabled={stepIndex === 0}
        >
          Назад
        </button>

        {step === "review" ? (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            {isSubmitting ? "Создание..." : "Создать"}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Далее
          </button>
        )}
      </div>
    </div>
  );
}

function InputStep({
  label,
  value,
  onChange,
  onEnter,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  onEnter?: () => void;
  type?: string;
  placeholder?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div>
      <label className="mb-1 block font-medium">{label}</label>
      <input
        ref={inputRef}
        type={type}
        placeholder={placeholder}
        className="w-full rounded border px-3 py-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onEnter) onEnter();
        }}
      />
    </div>
  );
}

function SelectStep({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="mb-1 block font-medium">{label}</label>
      <select
        className="w-full rounded border px-3 py-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Выберите...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function CheckboxStep({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <div className="flex items-center space-x-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5"
      />
      <label className="text-sm">{label}</label>
    </div>
  );
}

function ReviewItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-between border-b py-1">
      <span className="text-gray-500">{label}</span>
      <span className="max-w-[60%] text-right font-medium">{children}</span>
    </div>
  );
}
