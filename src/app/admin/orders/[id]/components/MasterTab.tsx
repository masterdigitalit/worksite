

'use client';
import { useEffect, useState } from "react";


type Worker = {
  id: number;
  fullName: string;
  telegramUsername?: string | null;
  phone: string;
  ordersCompleted: number;
  totalEarned: number;
};

export default function MasterTabContent({ masterId }: { masterId?: number | null }) {
  const [worker, setWorker] = useState<Worker | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!masterId) return;
  try{
    setLoading(true);
    fetch(`/api/workers/${masterId}`)
      .then((res) => res.json())
      .then((data) => setWorker(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }
  catch{

  }
  }, [masterId]);

  if (!masterId) {
    return <p className="text-center text-gray-600">Мастер не назначен</p>;
  }

  if (loading) return <p className="text-gray-500">Загрузка информации...</p>;
  if (!worker) return <p className="text-red-500">Мастер не найден</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Информация о мастере</h2>
      <p><strong>ФИО:</strong> {worker.fullName}</p>
      <p><strong>Телефон:</strong> {worker.phone}</p>
      {worker.telegramUsername && (
        <p><strong>Telegram:</strong> {worker.telegramUsername}</p>
      )}
      <p><strong>Завершено заказов:</strong> {worker.ordersCompleted}</p>
      <p><strong>Всего заработано:</strong> {worker.totalEarned} ₽</p>
    </div>
  );
}
