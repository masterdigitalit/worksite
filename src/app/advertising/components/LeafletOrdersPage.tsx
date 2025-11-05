"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { apiClient } from "lib/api-client";



interface Leaflet {
  id: string; // было string
  name: string;
}

interface City {
  id: string; // было string
  name: string;
}


type ProfitType = "MKD" | "CHS";
type LeafletOrderState = "IN_PROCESS" | "DONE" | "DECLINED" | "CANCELLED" | "FORPAYMENT";

interface LeafletOrder {
  id: number;
  profitType: ProfitType;
  profitType_display: string;
  quantity: number;
  leafletId: string; 
  cityId: string; 
  distributorId: number;
  state: LeafletOrderState;
  state_display: string;
  createdAt: string;
  doneAt: string | null;
  distributorProfit: string | null;
  createdBy: string | null;
  squareNumber: string | null;
}

interface LeafletOrdersPageProps {
  fullName: string;
}

export default function LeafletOrdersPage({ fullName }: LeafletOrdersPageProps) {
  const [leafletOrders, setLeafletOrders] = useState<LeafletOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [leaflets, setLeaflets] = useState<Leaflet[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [profitType, setProfitType] = useState<ProfitType>("MKD");
  const [quantity, setQuantity] = useState(1);
  const [leafletId, setLeafletId] = useState<string>("");
  const [cityId, setCityId] = useState<string>("");
  const [distributorId, setDistributorId] = useState<number | null>(null);
  const [squareNumber, setSquareNumber] = useState<string>("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLeaflet, setSelectedLeaflet] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedDistributor, setSelectedDistributor] = useState<string>("");
  const [selectedProfitType, setSelectedProfitType] = useState<string>("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const [filterState, setFilterState] = useState<LeafletOrderState | "ALL">("ALL");

  useEffect(() => {
    const urlState = searchParams.get("status") as LeafletOrderState | null;
    if (urlState) {
      setFilterState(urlState);
    } else {
      setFilterState("ALL");
    }
  }, [searchParams]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [ordersRes, leafletsRes, citiesRes, distributorsRes] = await Promise.all([
          apiClient.get<LeafletOrder[]>("/api/v1/leaflet-orders/"),
          apiClient.get<Leaflet[]>("/api/v1/leaflets/"),
          apiClient.get<City[]>("/api/v1/cities/"),
          apiClient.get<Distributor[]>("/api/v1/distributors/"),
        ]);

        setLeafletOrders(ordersRes);
        setLeaflets(leafletsRes);
        setCities(citiesRes);
        setDistributors(distributorsRes);
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("Ошибка при загрузке данных");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);


  console.log(leafletOrders, leaflets)


// Исправляем функции getLeafletName и getCityName
const getLeafletName = (leafletId: string): string => {
  const leaflet = leaflets.find(l => l.id === leafletId);
  return leaflet?.name || `Листовка #${leafletId}`;
};

const getCityName = (cityId: string): string => {
  const city = cities.find(c => c.id === cityId);
  return city?.name || `Город #${cityId}`;
};

  const getDistributorName = (distributorId: number): string => {
    const distributor = distributors.find(d => d.id === distributorId);
    return distributor?.fullName || `Дистрибьютор #${distributorId}`;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profitType || !quantity || !leafletId || !cityId || !distributorId) {
      alert("Заполните все обязательные поля");
      return;
    }

    try {
      const newOrder = await apiClient.post<LeafletOrder>("/api/v1/leaflet-orders/", {
        profitType,
        quantity,
        leafletId,
        cityId,
        distributorId,
        squareNumber: squareNumber || undefined,
      });

      setLeafletOrders([newOrder, ...leafletOrders]);
      setShowModal(false);
      setProfitType("MKD");
      setQuantity(1);
      setLeafletId("");
      setCityId("");
      setDistributorId(null);
      setSquareNumber("");
      alert("Заказ успешно создан!");
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Ошибка при создании заказа");
    }
  }

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

  const filteredOrders = leafletOrders.filter(order => {
    const matchesStatus = filterState === "ALL" || order.state === filterState;
    const matchesSearch = searchTerm === "" || 
      order.squareNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.createdBy?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLeaflet = selectedLeaflet === "" || getLeafletName(order.leafletId).toLowerCase().includes(selectedLeaflet.toLowerCase());
    const matchesCity = selectedCity === "" || getCityName(order.cityId).toLowerCase().includes(selectedCity.toLowerCase());
    const matchesDistributor = selectedDistributor === "" || getDistributorName(order.distributorId).toLowerCase().includes(selectedDistributor.toLowerCase());
    const matchesProfitType = selectedProfitType === "" || order.profitType === selectedProfitType;

    return matchesStatus && matchesSearch && matchesLeaflet && matchesCity && matchesDistributor && matchesProfitType;
  });

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedLeaflet("");
    setSelectedCity("");
    setSelectedDistributor("");
    setSelectedProfitType("");
    setFilterState("ALL");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Загрузка заказов листовок...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8">
        {showModal && (
          <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowModal(false)}></div>
            <div className="fixed top-1/2 left-1/2 w-full max-w-lg bg-white rounded-2xl shadow-xl p-6 z-50 transform -translate-x-1/2 -translate-y-1/2" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Новый заказ листовок</h2>
              <p className="text-sm text-gray-500 mb-6">Создаёт заказ: <span className="font-semibold text-blue-600">{fullName}</span></p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Тип прибыли*</label>
                  <select className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" value={profitType} onChange={(e) => setProfitType(e.target.value as ProfitType)}>
                    <option value="MKD">Многоквартирный дом (МКД)</option>
                    <option value="CHS">Частный жилой сектор (ЧС)</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Количество*</label>
                  <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Номер площади/блока</label>
                  <input type="text" value={squareNumber} onChange={(e) => setSquareNumber(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" placeholder="Введите номер площади или блока" />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Листовка*</label>
                  <select className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" value={leafletId} onChange={(e) => setLeafletId(e.target.value)}>
                    <option value="">Выберите листовку</option>
                    {leaflets.map((l) => (<option key={l.id} value={l.id}>{l.name}</option>))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Город*</label>
                  <select className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" value={cityId} onChange={(e) => setCityId(e.target.value)}>
                    <option value="">Выберите город</option>
                    {cities.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Дистрибьютор*</label>
                  <select className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" value={distributorId || ""} onChange={(e) => setDistributorId(Number(e.target.value))}>
                    <option value="">Выберите дистрибьютора</option>
                    {distributors.map((d) => (<option key={d.id} value={d.id}>{d.fullName}</option>))}
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">Отмена</button>
                  <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">Создать заказ</button>
                </div>
              </form>
            </div>
          </>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">📋 Заказы листовок</h1>
              <p className="text-gray-600">Управление заказами на распространение листовок</p>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2" onClick={() => setShowModal(true)}>
              <span>+</span>
              <span>Новый заказ</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Поиск</label>
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" placeholder="Поиск..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Листовка</label>
              <select value={selectedLeaflet} onChange={(e) => setSelectedLeaflet(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all">
                <option value="">Все листовки</option>
                {leaflets.map((l) => (<option key={l.id} value={l.name}>{l.name}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Город</label>
              <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all">
                <option value="">Все города</option>
                {cities.map((c) => (<option key={c.id} value={c.name}>{c.name}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Тип прибыли</label>
              <select value={selectedProfitType} onChange={(e) => setSelectedProfitType(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all">
                <option value="">Все типы</option>
                <option value="MKD">МКД</option>
                <option value="CHS">ЧС</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Статус:</label>
                <select className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" value={filterState} onChange={(e) => handleFilterChange(e.target.value as LeafletOrderState | "ALL")}>
                  <option value="ALL">Все статусы</option>
                  <option value="IN_PROCESS">В процессе</option>
                  <option value="DONE">Выполнено</option>
                  <option value="DECLINED">Отклонено</option>
                  <option value="CANCELLED">Провален</option>
                  <option value="FORPAYMENT">К оплате</option>
                </select>
              </div>
              <button onClick={clearFilters} className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50">Сбросить фильтры</button>
            </div>
            <div className="text-sm text-gray-600">Найдено: {filteredOrders.length} заказов</div>
          </div>
        </div>

       {/* === Таблица заказов === */}
         {/* === Таблица заказов === */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">ID</th>
                  <th className="p-2 border">Тип прибыли</th>
                  <th className="p-2 border">Количество</th>
                  <th className="p-2 border">Листовка</th>
                  <th className="p-2 border">Город</th>
                  <th className="p-2 border">Дистрибьютор</th>
                  <th className="p-2 border">Статус</th>
                  <th className="p-2 border">Создан</th>
                  <th className="p-2 border">Прибыль</th>
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
                    <td className="p-2 border">{order.profitType_display}</td>
                    <td className="p-2 border">{order.quantity} шт.</td>
                    <td className="p-2 border">{getLeafletName((order.leafletId))}</td>
                    <td className="p-2 border">{getCityName((order.cityId))}</td>
                    <td className="p-2 border">{getDistributorName(order.distributorId)}</td>
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
                      {order.state === "DONE" && "Выполнено"}
                      {order.state === "DECLINED" && "Отклонено"}
                      {order.state === "CANCELLED" && "Отменено"}
                      {order.state === "FORPAYMENT" && "К оплате"}
                    </td>
                    <td className="p-2 border">
                      {new Date(order.createdAt).toLocaleString('ru-RU')}
                    </td>
                    <td className="p-2 border">{order.distributorProfit ? `${order.distributorProfit} ₽` : "-"}</td>
                    <td className="p-2 border">{order.createdBy || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
            </div>
      </div>
    </div>
  );
}