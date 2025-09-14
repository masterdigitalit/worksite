'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewWorkerPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [telegramUsername, setTelegramUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !phone) {
      setError("Заполните обязательные поля: имя и телефон");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/workers/new", {
        method: "POST",
        body: JSON.stringify({ fullName, phone, telegramUsername }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Ошибка при создании");
      }

      router.push("/admin/workers");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-xl font-semibold mb-4">Добавить работника</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label>ФИО *</label>
          <input
            className="w-full p-2 border rounded"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Телефон *</label>
          <input
            className="w-full p-2 border rounded"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Telegram (необязательно)</label>
          <input
            className="w-full p-2 border rounded"
            value={telegramUsername}
            onChange={(e) => setTelegramUsername(e.target.value)}
          />
        </div>

        {error && <p className="text-red-500">{error}</p>}

        <button
          type="submit"
          className="w-full p-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? "Создание..." : "Создать"}
        </button>
      </form>
    </div>
  );
}