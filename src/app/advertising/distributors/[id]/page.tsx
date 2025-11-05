"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import DocumentsTabContent from "./DocumentsTabContent";
import { apiClient } from "lib/api-client";

interface DistributorStats {
  totalProfit: number;
  totalGiven: number;
  totalReturned: number;
  totalStolen: number;
  totalOrders: number;
  deliveryPercent: number;
}

interface Distributor {
  id: number;
  fullName: string;
  phone: string;
  telegram: string;
  invitedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

interface LeafletOrder {
  id: number;
  profitType: string;
  profitType_display: string;
  quantity: number;
  leafletId: string;
  cityId: string;
  distributorId: number;
  state: string;
  state_display: string;
  createdAt: string;
  doneAt: string | null;
  distributorProfit: string | null;
  returned: number | null;
  given: number | null;
  createdBy: string | null;
  squareNumber: string | null;
  paymentPhoto: string | null;
}

interface Leaflet {
  id: string;
  name: string;
}

interface City {
  id: string;
  name: string;
}

interface DistributorWithStats {
  distributor: Distributor;
  stats: DistributorStats;
  recentOrders: LeafletOrder[];
}

interface PaymentStats {
  totalForPayment: number;
  totalDone: number;
}

export default function DistributorPage({ params }: { params: { id: string } }) {
  const [distributorData, setDistributorData] = useState<DistributorWithStats | null>(null);
  const [tab, setTab] = useState<"info" | "documents">("info");
  const [loading, setLoading] = useState(true);
  const [leaflets, setLeaflets] = useState<Leaflet[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [paymentStats, setPaymentStats] = useState<PaymentStats>({
    totalForPayment: 0,
    totalDone: 0
  });
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        const [leafletsRes, citiesRes] = await Promise.all([
          apiClient.get<Leaflet[]>("/api/v1/leaflets/"),
          apiClient.get<City[]>("/api/v1/cities/"),
        ]);

        setLeaflets(leafletsRes);
        setCities(citiesRes);
        
      } catch (err: any) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    const loadDistributor = async () => {
      try {
        const data = await apiClient.get<DistributorWithStats>(
          `/api/v1/distributors/${params.id}/stats/`
        );
        setDistributorData(data);
      } catch (err: any) {
        console.error("Ошибка загрузки:", err);
        toast.error("Ошибка загрузки распространителя");
      } finally {
        setLoading(false);
      }
    };

    loadDistributor();
  }, [params.id]);

  useEffect(() => {
    if (distributorData?.recentOrders) {
      let totalForPayment = 0;
      let totalDone = 0;

      distributorData.recentOrders.forEach(order => {
        const profit = parseFloat(order.distributorProfit || "0");
        if (order.state === "FORPAYMENT") {
          totalForPayment += profit;
        } else if (order.state === "DONE") {
          totalDone += profit;
        }
      });

      setPaymentStats({
        totalForPayment: Math.round(totalForPayment),
        totalDone: Math.round(totalDone)
      });
    }
  }, [distributorData]);

  const getLeafletName = (leafletId: string): string => {
    const leaflet = leaflets.find(l => l.id === leafletId);
    return leaflet?.name || `Листовка #${leafletId}`;
  };

  const getCityName = (cityId: string): string => {
    const city = cities.find(c => c.id === cityId);
    return city?.name || `Город #${cityId}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Скопировано в буфер обмена");
  };

  const translateStatus = (state: string) => {
    const statusMap: Record<string, string> = {
      IN_PROCESS: "🟡 В процессе",
      DONE: "🟢 Выполнено",
      DECLINED: "🔴 Отклонено",
      CANCELLED: "⚫ Отменено",
      FORPAYMENT: "💲 К оплате",
    };
    return statusMap[state] || state;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Загрузка распространителя...</p>
        </div>
      </div>
    );
  }

  if (!distributorData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Распространитель не найден</h1>
          <p className="text-gray-600 mb-4">Распространитель с ID {params.id} не существует</p>
          <button
            onClick={() => router.push('/advertising/distributors')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Вернуться к списку
          </button>
        </div>
      </div>
    );
  }

  const { distributor, stats, recentOrders } = distributorData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ToastContainer position="top-right" autoClose={2000} hideProgressBar />

        {/* Заголовок */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                👤 Распространитель: <span className="text-blue-600">{distributor.fullName}</span>
              </h1>
              <p className="text-gray-600">Детальная информация и статистика</p>
            </div>
            <button
              onClick={() => router.push('/advertising/distributors')}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              ← Назад к списку
            </button>
          </div>
        </div>

        {/* Табы */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex gap-3">
            <button
              className={`px-6 py-3 rounded-lg transition-all flex items-center gap-2 ${
                tab === "info" 
                  ? "bg-blue-600 text-white shadow-lg" 
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
              onClick={() => setTab("info")}
            >
              <span>ℹ</span>
              <span>Информация</span>
            </button>
            <button
              className={`px-6 py-3 rounded-lg transition-all flex items-center gap-2 ${
                tab === "documents" 
                  ? "bg-blue-600 text-white shadow-lg" 
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
              onClick={() => setTab("documents")}
            >
              <span>📄</span>
              <span>Документы</span>
            </button>
          </div>
        </div>

        {tab === "info" && (
          <div className="space-y-6">
            {/* Основная информация */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">📋 Основная информация</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">ФИО:</span>
                    <span className="font-semibold text-gray-900">{distributor.fullName}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Телефон:</span>
                    <a 
                      href={`tel:${distributor.phone}`} 
                      className="text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      {distributor.phone}
                    </a>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Telegram:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{distributor.telegram}</span>
                      <button
                        className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                        onClick={() => copyToClipboard(distributor.telegram)}
                      >
                        Копировать
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Пригласил:</span>
                    <span className="font-semibold">{distributor.invitedBy || "-"}</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                <div>Создан: {formatDate(distributor.createdAt)}</div>
                <div>Обновлён: {formatDate(distributor.updatedAt)}</div>
              </div>
            </div>

            {/* Статистика */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">📊 Статистика</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-700">{stats.totalProfit} ₽</div>
                  <div className="text-sm text-green-800 mt-1">Общая прибыль</div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-blue-700">{stats.totalGiven}</div>
                  <div className="text-sm text-blue-800 mt-1">Раздано</div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-orange-700">{stats.totalReturned}</div>
                  <div className="text-sm text-orange-800 mt-1">Возвращено</div>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-red-700">{stats.totalStolen}</div>
                  <div className="text-sm text-red-800 mt-1">Украдено</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-purple-700">{stats.deliveryPercent}%</div>
                  <div className="text-sm text-purple-800 mt-1">Процент доставки</div>
                </div>
              </div>
            </div>

            {/* Статистика оплаты */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">💰 Статистика оплаты</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-6 text-center">
                  <div className="text-2xl font-bold text-yellow-700">{paymentStats.totalForPayment} ₽</div>
                  <div className="text-sm text-yellow-800 mt-2">Прибыль на оплату</div>
                  <div className="text-xs text-yellow-600 mt-1">(Статус: К оплате)</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6 text-center">
                  <div className="text-2xl font-bold text-green-700">{paymentStats.totalDone} ₽</div>
                  <div className="text-sm text-green-800 mt-2">Выплаченная прибыль</div>
                  <div className="text-xs text-green-600 mt-1">(Статус: Выполнено)</div>
                </div>
              </div>
            </div>

            {/* Последние заказы */}
            {recentOrders.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">📦 Последние заказы</h2>
                  <span className="text-sm text-gray-500">Всего заказов: {stats.totalOrders}</span>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse bg-white text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-left">
                        <th className="px-4 py-3 border-b font-semibold text-gray-700">ID</th>
                        <th className="px-4 py-3 border-b font-semibold text-gray-700">Тип прибыли</th>
                        <th className="px-4 py-3 border-b font-semibold text-gray-700">Кол-во</th>
                        <th className="px-4 py-3 border-b font-semibold text-gray-700">Раздано</th>
                        <th className="px-4 py-3 border-b font-semibold text-gray-700">Возврат</th>
                        <th className="px-4 py-3 border-b font-semibold text-gray-700">Прибыль</th>
                        <th className="px-4 py-3 border-b font-semibold text-gray-700">Листовка</th>
                        <th className="px-4 py-3 border-b font-semibold text-gray-700">Город</th>
                        <th className="px-4 py-3 border-b font-semibold text-gray-700">Статус</th>
                        <th className="px-4 py-3 border-b font-semibold text-gray-700">Создан</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr
                          key={order.id}
                          onClick={() => router.push(`/advertising/${order.id}`)}
                          className="cursor-pointer hover:bg-blue-50 transition-colors border-b"
                        >
                          <td className="px-4 py-3 text-blue-600 font-medium">{order.id}</td>
                          <td className="px-4 py-3">{order.profitType}</td>
                          <td className="px-4 py-3">{order.quantity} шт.</td>
                          <td className="px-4 py-3">{order.given || 0}</td>
                          <td className="px-4 py-3">{order.returned || 0}</td>
                          <td className="px-4 py-3 font-semibold">
                            {order.distributorProfit ? `${order.distributorProfit} ₽` : "-"}
                          </td>
                          <td className="px-4 py-3">{getLeafletName(order.leafletId)}</td>
                          <td className="px-4 py-3">{getCityName(order.cityId)}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              order.state === "DONE" || order.state === "FORPAYMENT" 
                                ? "bg-green-100 text-green-800"
                                : order.state === "IN_PROCESS"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-red-100 text-red-800"
                            }`}>
                              {translateStatus(order.state)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500">{formatDate(order.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {stats.totalOrders > 10 && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => router.push(`/distributors/${distributor.id}/orders`)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Показать все заказы ({stats.totalOrders})
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {tab === "documents" && <DocumentsTabContent distributorId={distributor.id} />}
      </div>
    </div>
  );
}