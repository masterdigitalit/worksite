"use client";

import React, { useState } from "react";
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
  "review",
];

const stepLabels: Record<Step, string> = {
  fullName: "ФИО",
  phone: "Телефон",
  address: "Адрес",
  city: "Город",
  problem: "Проблема",
  arriveDate: "Дата",
  visitType: "Тип визита",
  callRequired: "Звонок",
  isProfessional: "Проф.",
  equipmentType: "Оборудование",
  review: "Обзор",
};

export default function AddNewOrderPage({
  shouldValidate = true,
}: {
  shouldValidate?: boolean;
}) {
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
  });

  const step = steps[stepIndex];

  const handleNext = () => {
    const errorMsg = validateStep(step);
    if (shouldValidate && errorMsg) {
      setError(errorMsg);
      return;
    }
    setError(null);
    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1);
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
      setError(null);
    }
  };

  const handleChange = (field: keyof typeof form, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: Step): string | null => {
    const required = (val: string) =>
      !val.trim() ? "Поле не может быть пустым" : null;

    switch (step) {
      case "fullName":
        return required(form.fullName);
      case "phone":
        return !/^(\+7|8)\d{10}$/.test(form.phone)
          ? "Введите корректный номер (например, +79991234567)"
          : null;
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

  // Считаем, что пользователь имел в виду это время в своей форме
  // и сохраняем как UTC напрямую, без локального смещения
  return new Date(Date.UTC(year, month - 1, day, hour, minute));
}


   

    const body = {
      ...form,
      arriveDate: preserveUserInputAsUTC(form.arriveDate),
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
    switch (step) {
      case "fullName":
        return (
          <InputStep
            label="ФИО клиента"
            value={form.fullName}
            onChange={(val) => handleChange("fullName", val)}
          />
        );
      case "phone":
        return (
          <InputStep
            label="Телефон"
            value={form.phone}
            onChange={(val) => handleChange("phone", val)}
            placeholder="+79991234567"
          />
        );
      case "address":
        return (
          <InputStep
            label="Адрес"
            value={form.address}
            onChange={(val) => handleChange("address", val)}
          />
        );
      case "city":
        return (
          <InputStep
            label="Город"
            value={form.city}
            onChange={(val) => handleChange("city", val)}
          />
        );
      case "problem":
        return (
          <InputStep
            label="Описание проблемы"
            value={form.problem}
            onChange={(val) => handleChange("problem", val)}
          />
        );
      case "arriveDate":
        return (
          <InputStep
            label="Дата и время прибытия"
            type="datetime-local"
            value={form.arriveDate}
            onChange={(val) => handleChange("arriveDate", val)}
          />
        );
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
        return (
          <InputStep
            label="Прибор"
            value={form.equipmentType}
            onChange={(val) => handleChange("equipmentType", val)}
          />
        );
      case "review":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-2">Проверьте данные</h2>
            <div className="bg-white border rounded shadow-sm p-4 space-y-2 text-sm">
              <ReviewItem label="ФИО">{form.fullName}</ReviewItem>
              <ReviewItem label="Телефон">{form.phone}</ReviewItem>
              <ReviewItem label="Адрес">{form.address}</ReviewItem>
              <ReviewItem label="Город">{form.city}</ReviewItem>
              <ReviewItem label="Описание проблемы">{form.problem}</ReviewItem>
              <ReviewItem label="Дата визита">
                {form.arriveDate
                  ? new Date(form.arriveDate).toLocaleString()
                  : ""}
              </ReviewItem>
              <ReviewItem label="Тип визита">{form.visitType}</ReviewItem>
              <ReviewItem label="Требуется звонок">
                {form.callRequired ? "Да" : "Нет"}
              </ReviewItem>
              <ReviewItem label="Профессиональный заказ">
                {form.isProfessional ? "Да" : "Нет"}
              </ReviewItem>
              <ReviewItem label="Прибор">
                {form.equipmentType}
              </ReviewItem>
            </div>
          </div>
        );
    }
  };

  const progressPercent = Math.round((stepIndex / (steps.length - 1)) * 100);

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-center">➕ Новый заказ</h1>

      <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
        <div
          className="bg-blue-500 h-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      <div className="text-center text-sm text-gray-500 mb-2">
        Шаг {stepIndex + 1} из {steps.length}: {stepLabels[step]}
      </div>

      {submitSuccess && (
        <div className="bg-green-100 text-green-800 p-4 rounded text-center">
          Заказ успешно создан! Перенаправление...
        </div>
      )}

      {error && (
        <div className="bg-red-100 text-red-800 p-3 rounded text-sm">
          {error}
        </div>
      )}

      {renderStep()}

      <div className="flex justify-between mt-4">
        <button
          type="button"
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded disabled:opacity-50"
          onClick={handleBack}
          disabled={stepIndex === 0}
        >
          Назад
        </button>

        {step === "review" ? (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            {isSubmitting ? "Создание..." : "Создать"}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
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
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block font-medium mb-1">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full border rounded px-3 py-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
      <label className="block font-medium mb-1">{label}</label>
      <select
        className="w-full border rounded px-3 py-2"
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
        className="w-5 h-5"
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
      <span className="font-medium text-right max-w-[60%]">{children}</span>
    </div>
  );
}
