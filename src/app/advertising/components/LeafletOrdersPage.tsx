"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { apiClient } from "lib/api-client";
import {
  Plus,
  Search,
  Filter,
  X,
  Building,
  Home,
  Package,
  MapPin,
  User,
  Calendar,
  DollarSign,
  FileText,
  TrendingUp,
  Sparkles
} from "lucide-react";

interface Leaflet {
  id: string;
  name: string;
}

interface City {
  id: string;
  name: string;
}

interface Distributor {
  id: number;
  fullName: string;
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

const statusConfig = {
  IN_PROCESS: { label: "В процессе", color: "text-orange-600", bgColor: "bg-orange-100", borderColor: "border-orange-200" },
  DONE: { label: "Выполнено", color: "text-green-600", bgColor: "bg-green-100", borderColor: "border-green-200" },
  DECLINED: { label: "Отклонено", color: "text-red-600", bgColor: "bg-red-100", borderColor: "border-red-200" },
  CANCELLED: { label: "Отменено", color: "text-gray-600", bgColor: "bg-gray-100", borderColor: "border-gray-200" },
  FORPAYMENT: { label: "К оплате", color: "text-blue-600", bgColor: "bg-blue-100", borderColor: "border-blue-200" },
};

const profitTypeConfig = {
  MKD: { label: "МКД", icon: Building, color: "text-purple-600", bgColor: "bg-purple-100" },
  CHS: { label: "ЧС", icon: Home, color: "text-indigo-600", bgColor: "bg-indigo-100" },
};

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
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

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
        {/* Модальное окно создания заказа */}
        {showModal && (
          <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowModal(false)}></div>
            <div className="fixed top-1/2 left-1/2 w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6 z-50 transform -translate-x-1/2 -translate-y-1/2 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Новый заказ листовок</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="bg-blue-50 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 text-blue-700">
                  <Sparkles className="w-4 h-4" />
                  <p className="text-sm font-medium">Создаёт заказ: <span className="font-semibold">{fullName}</span></p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block mb-3 text-sm font-semibold text-gray-700">Тип прибыли *</label>
                    <select 
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white"
                      value={profitType} 
                      onChange={(e) => setProfitType(e.target.value as ProfitType)}
                    >
                      <option value="MKD">🏢 Многоквартирный дом (МКД)</option>
                      <option value="CHS">🏡 Частный жилой сектор (ЧС)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-3 text-sm font-semibold text-gray-700">Количество *</label>
                    <input 
                      type="number" 
                      min={1} 
                      value={quantity} 
                      onChange={(e) => setQuantity(Number(e.target.value))} 
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
                    />
                  </div>

                  <div>
                    <label className="block mb-3 text-sm font-semibold text-gray-700">Номер площади/блока</label>
                    <input 
                      type="text" 
                      value={squareNumber} 
                      onChange={(e) => setSquareNumber(e.target.value)} 
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
                      placeholder="Введите номер площади или блока" 
                    />
                  </div>

                  <div>
                    <label className="block mb-3 text-sm font-semibold text-gray-700">Листовка *</label>
                    <select 
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white"
                      value={leafletId} 
                      onChange={(e) => setLeafletId(e.target.value)}
                    >
                      <option value="">Выберите листовку</option>
                      {leaflets.map((l) => (<option key={l.id} value={l.id}>{l.name}</option>))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-3 text-sm font-semibold text-gray-700">Город *</label>
                    <select 
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white"
                      value={cityId} 
                      onChange={(e) => setCityId(e.target.value)}
                    >
                      <option value="">Выберите город</option>
                      {cities.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-3 text-sm font-semibold text-gray-700">Дистрибьютор *</label>
                    <select 
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white"
                      value={distributorId || ""} 
                      onChange={(e) => setDistributorId(Number(e.target.value))}
                    >
                      <option value="">Выберите дистрибьютора</option>
                      {distributors.map((d) => (<option key={d.id} value={d.id}>{d.fullName}</option>))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)} 
                    className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                  >
                    Отмена
                  </button>
                  <button 
                    type="submit" 
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Создать заказ
                  </button>
                </div>
              </form>
            </div>
          </>
        )}

        {/* Заголовок и кнопка создания */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">📋 Заказы листовок</h1>
              <p className="text-gray-600 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Управление заказами на распространение листовок
              </p>
            </div>
            <button 
              className="bg-gradient-to-br from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center gap-2 font-semibold shadow-lg"
              onClick={() => setShowModal(true)}
            >
              <Plus className="w-5 h-5" />
              Новый заказ
            </button>
          </div>

          {/* Фильтры */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Search className="w-4 h-4" />
                Поиск
              </label>
              <input 
                type="text" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
                placeholder="По номеру площади или создателю..." 
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Листовка
              </label>
              <select 
                value={selectedLeaflet} 
                onChange={(e) => setSelectedLeaflet(e.target.value)} 
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white"
              >
                <option value="">Все листовки</option>
                {leaflets.map((l) => (<option key={l.id} value={l.name}>{l.name}</option>))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Город
              </label>
              <select 
                value={selectedCity} 
                onChange={(e) => setSelectedCity(e.target.value)} 
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white"
              >
                <option value="">Все города</option>
                {cities.map((c) => (<option key={c.id} value={c.name}>{c.name}</option>))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Тип прибыли
              </label>
              <select 
                value={selectedProfitType} 
                onChange={(e) => setSelectedProfitType(e.target.value)} 
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white"
              >
                <option value="">Все типы</option>
                <option value="MKD">🏢 МКД</option>
                <option value="CHS">🏡 ЧС</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Статус
              </label>
              <select 
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white" 
                value={filterState} 
                onChange={(e) => handleFilterChange(e.target.value as LeafletOrderState | "ALL")}
              >
                <option value="ALL">Все статусы</option>
                <option value="IN_PROCESS">В процессе</option>
                <option value="DONE">Выполнено</option>
                <option value="DECLINED">Отклонено</option>
                <option value="CANCELLED">Провален</option>
                <option value="FORPAYMENT">К оплате</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between pt-4 border-t border-gray-200">
            <button 
              onClick={clearFilters} 
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors border border-gray-300 rounded-xl hover:bg-gray-50 flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Сбросить фильтры
            </button>
            <div className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-xl">
              Найдено: <span className="font-semibold text-blue-600">{filteredOrders.length}</span> заказов
            </div>
          </div>
        </div>

        {/* Таблица заказов */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Заказы не найдены</h3>
              <p className="text-gray-600 mb-6">Попробуйте изменить параметры фильтрации</p>
              <button 
                onClick={clearFilters}
                className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-colors"
              >
                Сбросить фильтры
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Тип</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Кол-во</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Листовка</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Город</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Дистрибьютор</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Статус</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Создан</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Заработал</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Создал</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => {
                    const ProfitIcon = profitTypeConfig[order.profitType].icon;
                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-blue-50 transition-colors cursor-pointer group"
                        onClick={() => router.push(`/advertising/${order.id}`)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">#{order.id}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-lg ${profitTypeConfig[order.profitType].bgColor}`}>
                              <ProfitIcon className={`w-4 h-4 ${profitTypeConfig[order.profitType].color}`} />
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {profitTypeConfig[order.profitType].label}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">{order.quantity} шт.</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{getLeafletName(order.leafletId)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900">{getCityName(order.cityId)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900">{getDistributorName(order.distributorId)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusConfig[order.state].bgColor} ${statusConfig[order.state].color} ${statusConfig[order.state].borderColor}`}>
                            {statusConfig[order.state].label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {order.distributorProfit ? (
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-semibold text-green-600">
                                {order.distributorProfit} ₽
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{order.createdBy || "-"}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}