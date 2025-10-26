"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import DocumentsTabContent from "./DocumentsTabContent";

interface LeafletOrder {
  id: number;
  profitType: string;
  quantity: number;
  leafletId: number;
  cityId: number;
  state: string;
  distributorProfit: string;
  returned: number;
  given: number;
  createdBy: string;
  createdAt: string;
  doneAt: string;
}

interface DistributorStats {
  totalProfit: number;
  totalGiven: number;
  totalReturned: number;
  totalStolen: number;
  deliveryPercent: number;
}

interface Distributor {
  id: number;
  fullName: string;
  phone: string;
  telegram: string;
  createdAt: string;
  updatedAt: string;
  leafletOrders?: LeafletOrder[];
  stats?: DistributorStats;
}

export default function DistributorPage({ params }: { params: { id: string } }) {
  const [distributor, setDistributor] = useState<Distributor | null>(null);
  const [tab, setTab] = useState<"info" | "documents">("info");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  console.log(distributor)

  useEffect(() => {
    const loadDistributor = async () => {
      try {
        const res = await fetch(`/api/distributors/getDistributor?id=${params.id}`);
        if (!res.ok) throw new Error("Ошибка загрузки");
        const data = await res.json();
        setDistributor(data);
      } catch (err) {
        console.error("Ошибка загрузки:", err);
        toast.error("Ошибка загрузки распространителя");
      } finally {
        setLoading(false);
      }
    };

    loadDistributor();
  }, [params.id]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Скопировано в буфер обмена");
  };

  if (loading) return <p className="p-6 text-gray-500">Загрузка...</p>;
  if (!distributor) return <p className="p-6 text-red-500">Распространитель не найден</p>;

  return (
    <div className="p-6">
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />

      <h1 className="text-2xl font-bold mb-4">
        Распространитель: <span className="text-blue-700">{distributor.fullName}</span>
      </h1>

      <div className="flex gap-3 mb-6">
        <button
          className={`px-4 py-2 rounded-lg transition ${
            tab === "info" ? "bg-blue-600 text-white shadow" : "bg-gray-200 hover:bg-gray-300"
          }`}
          onClick={() => setTab("info")}
        >
          ℹ Инфо
        </button>
        <button
          className={`px-4 py-2 rounded-lg transition ${
            tab === "documents" ? "bg-blue-600 text-white shadow" : "bg-gray-200 hover:bg-gray-300"
          }`}
          onClick={() => setTab("documents")}
        >
          📄 Документы
        </button>
      </div>

      {tab === "info" && (
        <div className="space-y-4 bg-gray-50 rounded-lg p-4 shadow-sm">
          <div className="space-y-2">
            <p><strong>Full Name:</strong> {distributor.fullName}</p>
            <p>
              <strong>Телефон:</strong>{" "}
              <a href={`tel:${distributor.phone}`} className="text-blue-600 hover:underline">
                {distributor.phone}
              </a>
            </p>
            <p className="flex items-center gap-2">
              <strong>Telegram:</strong> <span>{distributor.telegram}</span>
              <button
                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                onClick={() => copyToClipboard(distributor.telegram)}
              >
                Скопировать
              </button>
            </p>
            <p><strong>Создан:</strong> {new Date(distributor.createdAt).toLocaleString()}</p>
            <p><strong>Обновлён:</strong> {new Date(distributor.updatedAt).toLocaleString()}</p>
          </div>

          {distributor.leafletOrders && distributor.leafletOrders.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">📦 Разносы</h2>
              <div className="overflow-x-auto rounded-lg border">
                <table className="min-w-full border-collapse bg-white text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-left">
                      <th className="px-3 py-2 border">ID</th>
                      <th className="px-3 py-2 border">Тип прибыли</th>
                      <th className="px-3 py-2 border">Кол-во</th>
                      <th className="px-3 py-2 border">Раздано</th>
                      <th className="px-3 py-2 border">Возврат</th>
                      <th className="px-3 py-2 border">Прибыль</th>
                      <th className="px-3 py-2 border">Листовка</th>
                      <th className="px-3 py-2 border">Город</th>
                      <th className="px-3 py-2 border">Статус</th>
                      <th className="px-3 py-2 border">Создано</th>
                      <th className="px-3 py-2 border">Завершено</th>
                      <th className="px-3 py-2 border">Создатель</th>
                    </tr>
                  </thead>
                  <tbody>
                    {distributor.leafletOrders.map((order) => (
                      <tr
                        key={order.id}
                        onClick={() => router.push(`/advertising/${order.id}`)}
                        className="cursor-pointer hover:bg-blue-50 transition-colors"
                      >
                        <td className="px-3 py-2 border text-blue-700 font-medium">{order.id}</td>
                        <td className="px-3 py-2 border">{order.profitType}</td>
                        <td className="px-3 py-2 border">{order.quantity}</td>
                        <td className="px-3 py-2 border">{order.given}</td>
                        <td className="px-3 py-2 border">{order.returned}</td>
                        <td className="px-3 py-2 border">{order.distributorProfit}</td>
                        <td className="px-3 py-2 border">{order.leaflet.name}</td>
                        <td className="px-3 py-2 border">{order.city.name}</td>
                        <td className="px-3 py-2 border text-green-700 font-medium">{order.state}</td>
                        <td className="px-3 py-2 border">{new Date(order.createdAt).toLocaleString()}</td>
                        <td className="px-3 py-2 border">{new Date(order.doneAt).toLocaleString()}</td>
                        <td className="px-3 py-2 border">{order.createdBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {distributor.stats && (
                <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div className="bg-white shadow rounded-lg p-3 text-center border">
                    <p className="text-sm text-gray-500">💰 Прибыль</p>
                    <p className="text-lg font-bold text-green-700">{distributor.stats.totalProfit} ₽</p>
                  </div>
                  <div className="bg-white shadow rounded-lg p-3 text-center border">
                    <p className="text-sm text-gray-500">📬 Раздано</p>
                    <p className="text-lg font-bold">{distributor.stats.totalGiven}</p>
                  </div>
                  <div className="bg-white shadow rounded-lg p-3 text-center border">
                    <p className="text-sm text-gray-500">↩ Вернуто</p>
                    <p className="text-lg font-bold">{distributor.stats.totalReturned}</p>
                  </div>
                  <div className="bg-white shadow rounded-lg p-3 text-center border">
                    <p className="text-sm text-gray-500">❌ Украдено</p>
                    <p className="text-lg font-bold text-red-600">{distributor.stats.totalStolen}</p>
                  </div>
                  <div className="bg-white shadow rounded-lg p-3 text-center border">
                    <p className="text-sm text-gray-500">📈 Процент разноса</p>
                    <p className="text-lg font-bold text-blue-700">{distributor.stats.deliveryPercent}%</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {tab === "documents" && <DocumentsTabContent distributorId={distributor.id} />}
    </div>
  );
}
