'use client';

import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function TargetForm() {
  const [all, setAll] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [initial, setInitial] = useState({ all: "", month: "", day: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/goal/get")
      .then(res => res.json())
      .then(data => {
        setAll(data.all?.toString() ?? "");
        setMonth(data.month?.toString() ?? "");
        setDay(data.day?.toString() ?? "");
        setInitial({
          all: data.all?.toString() ?? "",
          month: data.month?.toString() ?? "",
          day: data.day?.toString() ?? "",
        });
      })
      .catch(() => toast.error("Ошибка загрузки целей"))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (all === initial.all && month === initial.month && day === initial.day) {
      toast.info("Нет изменений для сохранения");
      return;
    }

    const payload: any = {};
    if (all !== initial.all) payload.all = Number(all);
    if (month !== initial.month) payload.month = Number(month);
    if (day !== initial.day) payload.day = Number(day);

    const res = await fetch("/api/goal/set", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      toast.success("Цель обновлена");
      setInitial({ all, month, day });
    } else {
      toast.error("Ошибка при обновлении");
    }
  };

  if (loading) return <p className="text-center py-10">Загрузка...</p>;

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-10 space-y-5">
      <h2 className="text-xl font-semibold text-center">Установить цель</h2>

      <div>
        <label className="block text-sm font-medium mb-1">Всего</label>
        <input
          type="number"
          placeholder="Глобальная цель"
          value={all}
          onChange={(e) => setAll(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Месяц</label>
        <input
          type="number"
          placeholder="Цель на месяц"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">День</label>
        <input
          type="number"
          placeholder="Цель на день"
          value={day}
          onChange={(e) => setDay(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
      >
        Сохранить
      </button>
    </form>
  );
}
