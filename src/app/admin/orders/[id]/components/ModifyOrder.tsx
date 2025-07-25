"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  order: {
    id: number;
    status: string;
  };
}

interface Worker {
  id: number;
  fullName: string;
}

export default function ModifyTabContent({ order, setTab, refetch }: Props) {
  const router = useRouter();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/workers/getworkers")
      .then((res) => res.json())
      .then((data) => setWorkers(data))
      .catch((err) => console.error("Ошибка загрузки работников:", err));
  }, []);

  const handleAssign = async () => {
    const worker = workers.find(
      (w) => w.fullName.toLowerCase() === inputValue.toLowerCase()
    );
    if (!worker) return;

    setLoading(true);
    try {
      await fetch(`/api/orders/${order.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          masterId: worker.id,
          status: "ON_THE_WAY",
        }),
      });

  		refetch()
			setTab('info')
    } catch (err) {
      console.error("Ошибка назначения работника:", err);
    } finally {
      setLoading(false);
    }
  };

  if (order.status !== "PENDING") return null;

  return (
    <div className="space-y-4 mt-6">
      <label className="block mb-2 text-sm font-medium text-gray-700">
        Назначить работника
      </label>

      <input
        list="workers"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Введите или выберите работника"
        className="w-full rounded border px-4 py-2"
      />
      <datalist id="workers">
        {workers.map((worker) => (
          <option key={worker.id} value={worker.fullName} />
        ))}
      </datalist>

      <button
        onClick={handleAssign}
        disabled={!inputValue || loading}
        className="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 transition disabled:opacity-50"
      >
        {loading ? "Назначение..." : "Назначить"}
      </button>
    </div>
  );
}
