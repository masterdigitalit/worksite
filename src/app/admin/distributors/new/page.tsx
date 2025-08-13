"use client";

import { useState } from "react";

export default function NewDistributorPage() {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    telegram: "",
    state: "IN_PROCESS",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/distributors/new", {
      method: "POST",
      body: JSON.stringify(form),
    });

    if (res.ok) {
      alert("Разносчик добавлен!");
      setForm({ fullName: "", phone: "", telegram: "", state: "IN_PROCESS" });
    } else {
      alert("Ошибка при добавлении");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Добавить разносчика</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="border p-2 w-full"
          placeholder="ФИО"
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          required
        />
        <input
          className="border p-2 w-full"
          placeholder="Телефон"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          required
        />
        <input
          className="border p-2 w-full"
          placeholder="Telegram"
          name="telegram"
          value={form.telegram}
          onChange={handleChange}
        />
       
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Добавить
        </button>
      </form>
    </div>
  );
}
