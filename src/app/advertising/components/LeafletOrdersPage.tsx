"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Leaflet {
  id: number;
  name: string;
}

interface City {
  id: number;
  name: string;
}

interface Distributor {
  id: number;
  fullName: string;
}

type ProfitType = "МКД" | "ЧС";
type LeafletOrderState = "IN_PROCESS" | "DONE" | "DECLINED";

interface LeafletOrdersPageProps {
  fullName: string;
}

export default function LeafletOrdersPage({ fullName }: LeafletOrdersPageProps) {
  const [leafletOrders, setLeafletOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [leaflets, setLeaflets] = useState<Leaflet[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [distributors, setDistributors] = useState<Distributor[]>([]);

  const [showModal, setShowModal] = useState(false);

  const [profitType, setProfitType] = useState<ProfitType>("МКД");
  const [quantity, setQuantity] = useState(1);
  const [leafletId, setLeafletId] = useState<number | null>(null);
  const [cityId, setCityId] = useState<number | null>(null);
  const [distributorId, setDistributorId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const [ordersRes, leafletsRes, citiesRes, distributorsRes] = await Promise.all([
        fetch("/api/distribution/getAll"),
        fetch("/api/leaflet/all"),
        fetch("/api/city/all"),
        fetch("/api/distributors/all"),
      ]);
      const orders = await ordersRes.json();
      const leafletsData = await leafletsRes.json();
      const citiesData = await citiesRes.json();
      const distributorsData = await distributorsRes.json();

      setLeafletOrders(orders);
      setLeaflets(leafletsData);
      setCities(citiesData);
      setDistributors(distributorsData);
      setLoading(false);
    }
    fetchData();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!profitType || !quantity || !leafletId || !cityId || !distributorId || !fullName) {
      alert("Заполните все поля");
      return;
    }

    try {
      const res = await fetch("/api/distribution/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profitType,
          quantity,
          leafletId,
          cityId,
          distributorId,
          fullName,
        }),
      });

      if (!res.ok) throw new Error("Ошибка при добавлении");

      const newOrder = await res.json();
      setLeafletOrders([newOrder, ...leafletOrders]);
      setShowModal(false);

      setProfitType("МКД");
      setQuantity(1);
      setLeafletId(null);
      setCityId(null);
      setDistributorId(null);
    } catch {
      alert("Ошибка при добавлении заказа");
    }
  }

  if (loading) return <p>Загрузка...</p>;

  return (
    <div className="p-4 relative">
            {showModal && (
        <>
          {/* Фон */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setShowModal(false)}
          ></div>

          {/* Модалка */}
          <div
            className="fixed top-1/2 left-1/2 w-full max-w-lg bg-white rounded shadow-lg p-6 z-50"
            style={{ transform: "translate(-50%, -50%)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-4">Новый заказ листовки</h2>
						 <p className="text-sm text-gray-500 mb-4">
              Создаёт заказ: <span className="font-semibold">{fullName}</span>
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Profit Type */}
              <div>
                <label className="block mb-1 font-semibold">Тип прибыли*</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={profitType}
                  onChange={(e) => setProfitType(e.target.value as ProfitType)}
                  required
                >
                  <option value="MKD">МКД (много квартирный дом)</option>
                  <option value="CHS">ЧС (частный сектор)</option>
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label className="block mb-1 font-semibold">Количество*</label>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>

              {/* Leaflet */}
              <div>
                <label className="block mb-1 font-semibold">Листовка*</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={leafletId ?? ""}
                  onChange={(e) => setLeafletId(Number(e.target.value))}
                  required
                >
                  <option value="" disabled>
                    Выберите листовку
                  </option>
                  {leaflets.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* City */}
              <div>
                <label className="block mb-1 font-semibold">Город*</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={cityId ?? ""}
                  onChange={(e) => setCityId(Number(e.target.value))}
                  required
                >
                  <option value="" disabled>
                    Выберите город
                  </option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Distributor */}
              <div>
                <label className="block mb-1 font-semibold">Разносчик*</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={distributorId ?? ""}
                  onChange={(e) => setDistributorId(Number(e.target.value))}
                  required
                >
                  <option value="" disabled>
                    Выберите разносчика
                  </option>
                  {distributors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.fullName}
                    </option>
                  ))}
                </select>
              </div>

          
            
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Добавить
                </button>
              </div>
            </form>
          </div>
        </>
      )}
      <h1 className="text-xl font-bold mb-4">Заказы листовок</h1>

      <button
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={() => setShowModal(true)}
      >
        Добавить листопад
      </button>

      {/* Таблица для десктопа */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Тип прибыли</th>
              <th className="p-2 border">Количество</th>
              <th className="p-2 border">Листовка</th>
              <th className="p-2 border">Город</th>
              <th className="p-2 border">Разносчик</th>
              <th className="p-2 border">Статус</th>
              <th className="p-2 border">Создан</th>
              <th className="p-2 border">Заработал</th>
              <th className="p-2 border">Создал</th>
            </tr>
          </thead>
          <tbody>
            {leafletOrders.map((order) => (
              <tr
                key={order.id}
                className="cursor-pointer hover:bg-gray-200 transition"
                onClick={() => router.push(`/advertising/${order.id}`)}
              >
                <td className="p-2 border">{order.id}</td>
                <td className="p-2 border">{order.profitType}</td>
                <td className="p-2 border">{order.quantity}</td>
                <td className="p-2 border">{order.leaflet?.name || "-"}</td>
                <td className="p-2 border">{order.city?.name || "-"}</td>
                <td className="p-2 border">{order.distributor?.fullName || "-"}</td>
                <td
                  className={`p-2 border font-semibold ${
                    order.state === "IN_PROCESS" && "text-orange-500"
                  } ${order.state === "DONE" && "text-green-600"} ${
                    order.state === "DECLINED" && "text-red-500"
                  }`}
                >
                  {order.state === "IN_PROCESS" && "В процессе"}
                  {order.state === "DONE" && "Успешно"}
                  {order.state === "DECLINED" && "Провалено"}
                </td>
                <td className="p-2 border">{new Date(order.createdAt).toLocaleString()}</td>
                <td className="p-2 border">{order.distributorProfit || "-"}</td>
                <td className="p-2 border">{order.createdBy || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Карточки для мобильных */}
      <div className="grid gap-4 md:hidden">
        {leafletOrders.map((order) => (
          <div
            key={order.id}
            className="border rounded p-4 shadow-sm cursor-pointer hover:bg-gray-50"
            onClick={() => router.push(`/advertising/${order.id}`)}
          >
            <p>
              <span className="font-semibold">ID:</span> {order.id}
            </p>
            <p>
              <span className="font-semibold">Тип прибыли:</span> {order.profitType}
            </p>
            <p>
              <span className="font-semibold">Количество:</span> {order.quantity}
            </p>
            <p>
              <span className="font-semibold">Листовка:</span> {order.leaflet?.name || "-"}
            </p>
            <p>
              <span className="font-semibold">Город:</span> {order.city?.name || "-"}
            </p>
            <p>
              <span className="font-semibold">Разносчик:</span>{" "}
              {order.distributor?.fullName || "-"}
            </p>
            <p>
              <span className="font-semibold">Статус:</span>{" "}
              {order.state === "IN_PROCESS" && (
                <span className="text-orange-500">В процессе</span>
              )}
              {order.state === "DONE" && <span className="text-green-600">Успешно</span>}
              {order.state === "DECLINED" && <span className="text-red-500">Провалено</span>}
            </p>
            <p>
              <span className="font-semibold">Создан:</span>{" "}
              {new Date(order.createdAt).toLocaleString()}
            </p>
            <p>
              <span className="font-semibold">Заработал:</span>{" "}
              {order.distributorProfit || "-"}
            </p>
            <p>
              <span className="font-semibold">Создал:</span> {order.createdBy || "-"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
