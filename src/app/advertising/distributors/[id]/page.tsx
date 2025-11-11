"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { apiClient } from "lib/api-client";
import { s3Service } from "lib/s3-service";

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

interface DistributorDocument {
  id: number;
  name: string;
  file_url: string;
  file_key?: string;
  file_name?: string;
  file_size?: string;
  uploaded_at: string;
}

interface DistributorPhoto {
  id: number;
  name: string;
  file_url: string;
  file_name?: string;
  file_size?: string;
  uploaded_at: string;
  distributor: number;
}

export default function DistributorPage({ params }: { params: Promise<{ id: string }> }) {
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);
  const [distributorData, setDistributorData] = useState<DistributorWithStats | null>(null);
  const [tab, setTab] = useState<"info" | "documents" | "photos">("info");
  const [loading, setLoading] = useState(true);
  const [leaflets, setLeaflets] = useState<Leaflet[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [paymentStats, setPaymentStats] = useState<PaymentStats>({
    totalForPayment: 0,
    totalDone: 0
  });
  
  // Состояния для загрузки документов
  const [documents, setDocuments] = useState<DistributorDocument[]>([]);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState("");
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Состояния для загрузки фото
  const [photos, setPhotos] = useState<DistributorPhoto[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoName, setPhotoName] = useState("");
  const [showPhotoUploadForm, setShowPhotoUploadForm] = useState(false);
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState<string | null>(null);

  const router = useRouter();

  // Разрешаем params
  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

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
    if (!resolvedParams) return;

    const loadDistributor = async () => {
      try {
        const data = await apiClient.get<DistributorWithStats>(
          `/api/v1/distributors/${resolvedParams.id}/stats/`
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
  }, [resolvedParams]);

  // Загрузка документов распространителя
  const loadDocuments = async () => {
    if (!resolvedParams) return;
    
    try {
      const docs = await s3Service.getDistributorDocuments(parseInt(resolvedParams.id));
      setDocuments(docs);
    } catch (err: any) {
      console.error("Ошибка загрузки документов:", err);
      setDocuments([]);
    }
  };

  // Загрузка фото распространителя
  const loadPhotos = async () => {
    if (!resolvedParams) return;
    
    try {
      const response = await apiClient.get<{
        distributor: string;
        photos_count: number;
        photos: DistributorPhoto[];
      }>(`/api/v1/distributors/${resolvedParams.id}/photos/`);
      
      setPhotos(response.photos);
    } catch (err: any) {
      console.error("Ошибка загрузки фото:", err);
      setPhotos([]);
    }
  };

  useEffect(() => {
    if (tab === "documents" && resolvedParams) {
      loadDocuments();
    } else if (tab === "photos" && resolvedParams) {
      loadPhotos();
    }
  }, [tab, resolvedParams]);

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

  // Функции для загрузки документов
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!documentName) {
        setDocumentName(file.name.split('.')[0]);
      }
    }
  };

  const uploadDocument = async () => {
    if (!selectedFile || !documentName.trim() || !resolvedParams) {
      toast.error("Выберите файл и укажите название документа");
      return;
    }

    setUploadingDocument(true);
    try {
      await s3Service.uploadDistributorDocument(
        parseInt(resolvedParams.id), 
        selectedFile, 
        documentName.trim()
      );
      
      await loadDocuments();
      setSelectedFile(null);
      setDocumentName("");
      setShowUploadForm(false);
      toast.success("Документ успешно загружен!");
    } catch (error: any) {
      console.error("Error uploading document:", error);
      toast.error(`Ошибка при загрузке документа: ${error.message}`);
    } finally {
      setUploadingDocument(false);
    }
  };

  const deleteDocument = async (documentId: number) => {
    if (!resolvedParams) return;
    
    if (!confirm("Вы уверены, что хотите удалить этот документ?")) {
      return;
    }

    try {
      await s3Service.deleteDistributorDocument(
        parseInt(resolvedParams.id), 
        documentId
      );
      await loadDocuments();
      toast.success("Документ успешно удален!");
    } catch (error: any) {
      console.error("Error deleting document:", error);
      toast.error("Ошибка при удалении документа");
    }
  };

  // Функции для загрузки фото
  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Проверяем что это изображение
      if (!file.type.startsWith('image/')) {
        toast.error("Пожалуйста, выберите файл изображения");
        return;
      }
      
      setSelectedPhoto(file);
      
      // Создаем превью
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      if (!photoName) {
        setPhotoName(file.name.split('.')[0]);
      }
    }
  };

// Функции для загрузки фото через s3Service
const uploadPhoto = async () => {
  if (!selectedPhoto || !resolvedParams) {
    toast.error("Выберите фото для загрузки");
    return;
  }

  setUploadingPhoto(true);
  try {
    // Используем s3Service для загрузки фото
    await s3Service.uploadDistributorPhoto(
      parseInt(resolvedParams.id), 
      selectedPhoto, 
      photoName.trim() || `Фото ${distributor.fullName}`
    );
    
    await loadPhotos();
    setSelectedPhoto(null);
    setPhotoName("");
    setSelectedPhotoPreview(null);
    setShowPhotoUploadForm(false);
    toast.success("Фото успешно загружено!");
  } catch (error: any) {
    console.error("Error uploading photo:", error);
    toast.error(`Ошибка при загрузке фото: ${error.message}`);
  } finally {
    setUploadingPhoto(false);
  }
};

const deletePhoto = async (photoId: number) => {
  if (!resolvedParams) return;
  
  if (!confirm("Вы уверены, что хотите удалить это фото?")) {
    return;
  }

  try {
    await s3Service.deleteDistributorPhoto(
      parseInt(resolvedParams.id), 
      photoId
    );
    await loadPhotos();
    toast.success("Фото успешно удалено!");
  } catch (error: any) {
    console.error("Error deleting photo:", error);
    toast.error("Ошибка при удалении фото");
  }
};

const setMainPhoto = async (photoId: number) => {
  if (!resolvedParams) return;
  
  try {
    await s3Service.setMainDistributorPhoto(
      parseInt(resolvedParams.id), 
      photoId
    );
    await loadPhotos();
    toast.success("Фото установлено как основное!");
  } catch (error: any) {
    console.error("Error setting main photo:", error);
    toast.error("Ошибка при установке основного фото");
  }
};

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
          <p className="text-gray-600 mb-4">Распространитель с ID {resolvedParams?.id} не существует</p>
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
            <button
              className={`px-6 py-3 rounded-lg transition-all flex items-center gap-2 ${
                tab === "photos" 
                  ? "bg-blue-600 text-white shadow-lg" 
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
              onClick={() => setTab("photos")}
            >
              <span>🖼️</span>
              <span>Фото</span>
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

        {tab === "documents" && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">📄 Документы распространителя</h2>
              <button
                onClick={() => setShowUploadForm(!showUploadForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <span>📎</span>
                <span>Загрузить документ</span>
              </button>
            </div>

            {/* Форма загрузки документа */}
            {showUploadForm && (
              <div className="bg-gray-50 rounded-xl p-6 mb-6 border-2 border-dashed border-gray-300">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Загрузка нового документа</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Название документа
                    </label>
                    <input
                      type="text"
                      value={documentName}
                      onChange={(e) => setDocumentName(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      placeholder="Введите название документа"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Выберите файл
                    </label>
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Поддерживаются изображения, PDF, Word, Excel (макс. 10MB)
                    </p>
                  </div>

                  {selectedFile && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        Выбран файл: <strong>{selectedFile.name}</strong> 
                        ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={uploadDocument}
                      disabled={uploadingDocument || !selectedFile || !documentName.trim()}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {uploadingDocument ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Загрузка...</span>
                        </>
                      ) : (
                        <>
                          <span>📤</span>
                          <span>Загрузить</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowUploadForm(false);
                        setSelectedFile(null);
                        setDocumentName("");
                      }}
                      className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Список документов */}
            {documents.length > 0 ? (
              <div className="space-y-4">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 font-bold">📄</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{doc.name}</h4>
                        <p className="text-sm text-gray-500">
                          Загружен: {formatDate(doc.uploaded_at)}
                          {doc.file_size && ` • ${doc.file_size}`}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-100 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                      >
                        👁️ Просмотреть
                      </a>
                      
                      <button
                        onClick={() => copyToClipboard(doc.file_url)}
                        className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                      >
                        📋 Копировать ссылку
                      </button>
                      
                      <button
                        onClick={() => deleteDocument(doc.id)}
                        className="bg-red-100 text-red-600 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                      >
                        🗑️ Удалить
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📄</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Документов пока нет</h3>
                <p className="text-gray-500 mb-4">
                  Загрузите первый документ для этого распространителя
                </p>
                <button
                  onClick={() => setShowUploadForm(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Загрузить документ
                </button>
              </div>
            )}
          </div>
        )}

        {tab === "photos" && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">🖼️ Фото распространителя</h2>
              <button
                onClick={() => setShowPhotoUploadForm(!showPhotoUploadForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <span>📷</span>
                <span>Загрузить фото</span>
              </button>
            </div>

            {/* Форма загрузки фото */}
            {showPhotoUploadForm && (
              <div className="bg-gray-50 rounded-xl p-6 mb-6 border-2 border-dashed border-gray-300">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Загрузка нового фото</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Название фото (опционально)
                    </label>
                    <input
                      type="text"
                      value={photoName}
                      onChange={(e) => setPhotoName(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      placeholder="Введите название фото"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Выберите фото
                    </label>
                    <input
                      type="file"
                      onChange={handlePhotoSelect}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      accept="image/*"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Поддерживаются JPG, PNG, GIF (макс. 15MB)
                    </p>
                  </div>

                  {selectedPhotoPreview && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800 mb-2">Предпросмотр:</p>
                      <img 
                        src={selectedPhotoPreview} 
                        alt="Превью" 
                        className="max-w-xs rounded-lg mx-auto"
                      />
                    </div>
                  )}

                  {selectedPhoto && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-800">
                        Выбрано фото: <strong>{selectedPhoto.name}</strong> 
                        ({(selectedPhoto.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={uploadPhoto}
                      disabled={uploadingPhoto || !selectedPhoto}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {uploadingPhoto ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Загрузка...</span>
                        </>
                      ) : (
                        <>
                          <span>📤</span>
                          <span>Загрузить фото</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowPhotoUploadForm(false);
                        setSelectedPhoto(null);
                        setPhotoName("");
                        setSelectedPhotoPreview(null);
                      }}
                      className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Галерея фото */}
            {photos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {photos.map((photo, index) => (
                  <div
                    key={photo.id}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="aspect-w-16 aspect-h-12 bg-gray-100">
                      <img
                        src={photo.file_url}
                        alt={photo.name}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          // Если изображение не загружается, показываем заглушку
                          e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='14' fill='%239ca3af'%3EФото%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    </div>
                    
                    <div className="p-4">
                      <h4 className="font-medium text-gray-900 mb-2">{photo.name}</h4>
                      <p className="text-sm text-gray-500 mb-3">
                        Загружено: {formatDate(photo.uploaded_at)}
                        {photo.file_size && ` • ${photo.file_size}`}
                      </p>
                      
                      <div className="flex gap-2 flex-wrap">
                        <a
                          href={photo.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-100 text-blue-600 px-3 py-1 rounded text-sm font-medium hover:bg-blue-200 transition-colors"
                        >
                          👁️ Открыть
                        </a>
                        
                        <button
                          onClick={() => copyToClipboard(photo.file_url)}
                          className="bg-gray-100 text-gray-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-200 transition-colors"
                        >
                          📋 Ссылка
                        </button>
                        
                        {index !== 0 && (
                          <button
                            onClick={() => setMainPhoto(photo.id)}
                            className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded text-sm font-medium hover:bg-yellow-200 transition-colors"
                          >
                            ⭐ Сделать главной
                          </button>
                        )}
                        
                        {index === 0 && (
                          <span className="bg-green-100 text-green-600 px-3 py-1 rounded text-sm font-medium">
                            ✅ Главное фото
                          </span>
                        )}
                        
                        <button
                          onClick={() => deletePhoto(photo.id)}
                          className="bg-red-100 text-red-600 px-3 py-1 rounded text-sm font-medium hover:bg-red-200 transition-colors"
                        >
                          🗑️ Удалить
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🖼️</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Фото пока нет</h3>
                <p className="text-gray-500 mb-4">
                  Загрузите первое фото для этого распространителя
                </p>
                <button
                  onClick={() => setShowPhotoUploadForm(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Загрузить фото
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}