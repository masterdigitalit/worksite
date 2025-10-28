"use client";
import { useRouter, useSearchParams } from "next/navigation";
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

type ProfitType = "MKD" | "CHS";
type LeafletOrderState =
  | "IN_PROCESS"
  | "DONE"
  | "DECLINED"
  | "CANCELLED"
  | "FORPAYMENT";

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

  const [profitType, setProfitType] = useState<ProfitType>("MKD");
  const [quantity, setQuantity] = useState(1);
  const [leafletId, setLeafletId] = useState<number | null>(null);
  const [cityId, setCityId] = useState<number | null>(null);
  const [distributorId, setDistributorId] = useState<number | null>(null);
  const [squareNumber, setSquareNumber] = useState<string>("");

  const router = useRouter();
  const searchParams = useSearchParams();

  const [filterState, setFilterState] = useState<LeafletOrderState | "ALL">("ALL");

  // === Получаем состояние фильтра из URL ===
  useEffect(() => {
    const urlState = searchParams.get("status") as LeafletOrderState | null;
    if (urlState && ["IN_PROCESS", "DONE", "DECLINED", "CANCELLED", "FORPAYMENT"].includes(urlState)) {
      setFilterState(urlState);
    } else {
      setFilterState("ALL");
    }
  }, [searchParams]);

  useEffect(() => {
    async function fetchData() {
      const [ordersRes, leafletsRes, citiesRes, distributorsRes] =
        await Promise.all([
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
          squareNumber,
        }),
      });

      if (!res.ok) throw new Error("Ошибка при добавлении");

      const newOrder = await res.json();
      setLeafletOrders([newOrder, ...leafletOrders]);
      setShowModal(false);

      setProfitType("MKD");
      setQuantity(1);
      setLeafletId(null);
      setCityId(null);
      setDistributorId(null);
    } catch {
      alert("Ошибка при добавлении заказа");
    }
  }

  // === Обновление фильтра и URL ===
  function handleFilterChange(value: LeafletOrderState | "ALL") {
    setFilterState(value);
    const params = new URLSearchParams(window.location.search);
    if (value === "ALL") {
      params.delete("status");
    } else {
      params.set("status", value);
    }
    router.push(`?${params.toString()}`);
  }

  const filteredOrders =
    filterState === "ALL"
      ? leafletOrders
      : leafletOrders.filter((order) => order.state === filterState);

  if (loading) return <p>Загрузка...</p>;

  return (
    <div className="p-4 relative">
      {/* === Модалка создания === */}
      {showModal && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setShowModal(false)}
          ></div>

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
              <div>
                <label className="block mb-1 font-semibold">Тип прибыли*</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={profitType}
                  onChange={(e) => setProfitType(e.target.value as ProfitType)}
                >
                  <option value="MKD">МКД</option>
                  <option value="CHS">ЧС</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 font-semibold">Количество*</label>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">Номер блока</label>
                <input
                  type="number"
                  value={squareNumber}
                  onChange={(e) => setSquareNumber(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">Листовка*</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={leafletId ?? ""}
                  onChange={(e) => setLeafletId(Number(e.target.value))}
                >
                  <option value="">Выберите листовку</option>
                  {leaflets.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 font-semibold">Город*</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={cityId ?? ""}
                  onChange={(e) => setCityId(Number(e.target.value))}
                >
                  <option value="">Выберите город</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 font-semibold">Разносчик*</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={distributorId ?? ""}
                  onChange={(e) => setDistributorId(Number(e.target.value))}
                >
                  <option value="">Выберите разносчика</option>
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

      {/* === Заголовок и фильтр === */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Заказы листовок</h1>

        <div className="flex items-center gap-2">
          <label className="font-semibold">Фильтр:</label>
          <select
            className="border rounded px-3 py-2"
            value={filterState}
            onChange={(e) => handleFilterChange(e.target.value as LeafletOrderState | "ALL")}
          >
            <option value="ALL">Все</option>
            <option value="IN_PROCESS">В процессе</option>
            <option value="DONE">Успешно</option>
            <option value="DECLINED">Провалено</option>
            <option value="CANCELLED">Отменено</option>
            <option value="FORPAYMENT">На оплату</option>
          </select>

          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => setShowModal(true)}
          >
            + Добавить
          </button>
        </div>
      </div>

      {/* === Таблица заказов === */}
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
            {filteredOrders.map((order) => (
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
                  } ${order.state === "CANCELLED" && "text-gray-400"} ${
                    order.state === "FORPAYMENT" && "text-blue-600"
                  }`}
                >
                  {order.state === "IN_PROCESS" && "В процессе"}
                  {order.state === "DONE" && "Успешно"}
                  {order.state === "DECLINED" && "Провалено"}
                  {order.state === "CANCELLED" && "Отменено"}
                  {order.state === "FORPAYMENT" && "На оплату"}
                </td>
                <td className="p-2 border">
                  {new Date(order.createdAt).toLocaleString()}
                </td>
                <td className="p-2 border">{order.distributorProfit || "-"}</td>
                <td className="p-2 border">{order.createdBy || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
