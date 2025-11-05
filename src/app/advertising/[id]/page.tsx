"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  CheckCircle, 
  XCircle, 
  Package, 
  Loader2, 
  ArrowLeft,
  Edit,
  MapPin,
  User,
  FileText,
  Check,
  X,
  AlertCircle,
  DollarSign,
  ClipboardList,
  Building,
  Home,
  Truck,
  Upload,
  Camera,
  CreditCard
} from "lucide-react";
import { apiClient } from "lib/api-client";
import { s3Service } from "lib/s3-service";

interface LeafletOrderDocument {
  id: number;
  name: string;
  file_url: string;
  file_key?: string;
  file_name?: string;
  file_size?: string;
  uploaded_at: string;
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
  documents: LeafletOrderDocument[]; // Заменяем paymentPhoto на documents
}

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

export default function LeafletOrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<LeafletOrder | null>(null);
  const [leaflets, setLeaflets] = useState<Leaflet[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showPartialForm, setShowPartialForm] = useState(false);
  const [given, setGiven] = useState<number | "">("");
  const [returned, setReturned] = useState<number | "">("");
  const [submitting, setSubmitting] = useState(false);
  
  // Состояния для оплаты
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentPhoto, setPaymentPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function fetchData() {
      try {
        setLoading(true);
        
        const [orderRes, leafletsRes, citiesRes, distributorsRes] = await Promise.all([
          apiClient.get<LeafletOrder>(`/api/v1/leaflet-orders/${id}`),
          apiClient.get<Leaflet[]>("/api/v1/leaflets/"),
          apiClient.get<City[]>("/api/v1/cities/"),
          apiClient.get<Distributor[]>("/api/v1/distributors/"),
        ]);

        setOrder(orderRes);
        setLeaflets(leafletsRes);
        setCities(citiesRes);
        setDistributors(distributorsRes);
        
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.message || "Ошибка при загрузке данных");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  // Получаем фото оплаты из документов
  const getPaymentPhoto = () => {
    if (!order?.documents) return null;
    return order.documents.find(doc => 
      doc.name.includes('Фото оплаты') || doc.name.includes('payment')
    );
  };

  const paymentPhotoDoc = getPaymentPhoto();
  const hasPaymentPhoto = !!paymentPhotoDoc;

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

  const completeOrder = async () => {
    if (!order || submitting) return;
    
    setSubmitting(true);
    try {
      const updatedOrder = await apiClient.patch<LeafletOrder>(
        `/api/v1/leaflet-orders/${order.id}/complete/`,
        { state: "success" }
      );
      setOrder(updatedOrder);
      alert("✅ Заказ завершен! Переведен в статус 'К оплате'");
    } catch (error: any) {
      console.error("Error completing order:", error);
      alert("❌ Ошибка при завершении заказа");
    } finally {
      setSubmitting(false);
    }
  };

  const completePartialOrder = async () => {
    if (!order || submitting || given === "" || returned === "") {
      alert("⚠️ Заполните все поля");
      return;
    }

    if (given < 0 || returned < 0) {
      alert("❌ Количество не может быть отрицательным");
      return;
    }

    if (Number(given) + Number(returned) > order.quantity) {
      alert("❌ Сумма разданных и возвращенных не может превышать общее количество");
      return;
    }

    setSubmitting(true);
    try {
      const updatedOrder = await apiClient.patch<LeafletOrder>(
        `/api/v1/leaflet-orders/${order.id}/complete/`,
        {
          state: "partial",
          distributed: Number(given),
          returned: Number(returned)
        }
      );
      setOrder(updatedOrder);
      setShowPartialForm(false);
      setGiven("");
      setReturned("");
      alert("✅ Заказ завершен частично! Переведен в статус 'К оплате'");
    } catch (error: any) {
      console.error("Error completing partial order:", error);
      alert("❌ Ошибка при завершении заказа");
    } finally {
      setSubmitting(false);
    }
  };

  const declineOrder = async () => {
    if (!order || submitting) return;
    
    if (!confirm("❓ Вы уверены, что заказ провален? (не раздали и не вернули)")) {
      return;
    }

    setSubmitting(true);
    try {
      const updatedOrder = await apiClient.patch<LeafletOrder>(
        `/api/v1/leaflet-orders/${order.id}/complete/`,
        { state: "declined" }
      );
      setOrder(updatedOrder);
      alert("⚠️ Заказ отмечен как проваленный");
    } catch (error: any) {
      console.error("Error declining order:", error);
      alert("❌ Ошибка при отметке заказа");
    } finally {
      setSubmitting(false);
    }
  };

  const cancelOrder = async () => {
    if (!order || submitting) return;
    
    if (!confirm("❓ Вы уверены, что хотите отменить заказ? Все листовки будут возвращены.")) {
      return;
    }

    setSubmitting(true);
    try {
      const updatedOrder = await apiClient.patch<LeafletOrder>(
        `/api/v1/leaflet-orders/${order.id}/cancel/`,
        { returned: order.quantity }
      );
      setOrder(updatedOrder);
      alert("✅ Заказ отменен! Все листовки возвращены");
    } catch (error: any) {
      console.error("Error cancelling order:", error);
      alert("❌ Ошибка при отмене заказа");
    } finally {
      setSubmitting(false);
    }
  };

  // Функции для оплаты с использованием S3 сервиса
  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Проверяем что это изображение
      if (!file.type.startsWith('image/')) {
        alert('❌ Пожалуйста, выберите файл изображения');
        return;
      }
      
      // Проверяем размер файла (максимум 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('❌ Размер файла не должен превышать 10MB');
        return;
      }
      
      setPaymentPhoto(file);
      
      // Создаем превью
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Для загрузки фото оплаты
  const uploadPaymentPhoto = async () => {
    if (!paymentPhoto || !order) return;
    
    setUploadingPhoto(true);
    try {
      // Используем S3 сервис для загрузки фото оплаты как документа
      await s3Service.uploadLeafletOrderDocument(
        order.id, 
        paymentPhoto, 
        `Фото оплаты заказа #${order.id}`
      );
      
      // Обновляем данные заказа чтобы получить обновленный список документов
      const updatedOrder = await apiClient.get<LeafletOrder>(
        `/api/v1/leaflet-orders/${order.id}/`
      );
      
      setOrder(updatedOrder);
      setPaymentPhoto(null);
      setPhotoPreview(null);
      setShowPaymentForm(false);
      alert("✅ Фото оплаты успешно загружено!");
    } catch (error: any) {
      console.error("Error uploading payment photo:", error);
      alert(`❌ Ошибка при загрузке фото оплаты: ${error.message}`);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const confirmPayment = async () => {
    if (!order) return;
    
   

    setSubmitting(true);
    try {
      const updatedOrder = await apiClient.patch<LeafletOrder>(
        `/api/v1/leaflet-orders/${order.id}/confirm-payment/`
      );
      setOrder(updatedOrder);
      alert("✅ Оплата подтверждена! Заказ выполнен.");
    } catch (error: any) {
      console.error("Error confirming payment:", error);
      alert("❌ Ошибка при подтверждении оплаты");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusInfo = (state: string) => {
    const statusMap = {
      IN_PROCESS: {
        text: "В процессе",
        color: "border-l-4 border-l-orange-500 bg-orange-50",
        icon: <Loader2 className="w-5 h-5 text-orange-600 animate-spin" />,
        bg: "bg-orange-500"
      },
      DONE: {
        text: "Выполнено",
        color: "border-l-4 border-l-green-500 bg-green-50",
        icon: <CheckCircle className="w-5 h-5 text-green-600" />,
        bg: "bg-green-500"
      },
      DECLINED: {
        text: "Отклонено",
        color: "border-l-4 border-l-red-500 bg-red-50",
        icon: <XCircle className="w-5 h-5 text-red-600" />,
        bg: "bg-red-500"
      },
      CANCELLED: {
        text: "Отменено",
        color: "border-l-4 border-l-gray-500 bg-gray-50",
        icon: <XCircle className="w-5 h-5 text-gray-600" />,
        bg: "bg-gray-500"
      },
      FORPAYMENT: {
        text: "К оплате",
        color: "border-l-4 border-l-blue-500 bg-blue-50",
        icon: <DollarSign className="w-5 h-5 text-blue-600" />,
        bg: "bg-blue-500"
      }
    };

    return statusMap[state as keyof typeof statusMap] || { 
      text: state, 
      color: "border-l-4 border-l-gray-500 bg-gray-50",
      icon: <Package className="w-5 h-5 text-gray-600" />,
      bg: "bg-gray-500"
    };
  };

  const getProfitTypeIcon = (profitType: string) => {
    if (profitType === "MKD") return <Building className="w-4 h-4" />;
    if (profitType === "CHS") return <Home className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка заказа...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Ошибка</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/advertising')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Назад к списку
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Заказ не найден</h1>
          <p className="text-gray-600 mb-4">Заказ с ID {id} не существует</p>
          <button
            onClick={() => router.push('/advertising')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Назад к списку
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.state);

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href="/advertising"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-4 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            К списку заказов
          </Link>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Заказ #{order.id}</h1>
              <div className="flex items-center gap-3 mt-2">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusInfo.color}`}>
                  {statusInfo.icon}
                  <span className="text-sm font-medium text-gray-900">{statusInfo.text}</span>
                </div>
                <span className="text-gray-500 text-sm">Создан: {formatDate(order.createdAt)}</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => router.push(`/advertising/${order.id}/edit`)}
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
              >
                <Edit className="w-4 h-4" />
                Редактировать
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Details Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5" />
                  Детали заказа
                </h2>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Основная информация</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 flex items-center gap-2">
                          {getProfitTypeIcon(order.profitType)}
                          Тип прибыли:
                        </span>
                        <span className="font-medium">{order.profitType_display}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          Количество:
                        </span>
                        <span className="font-medium">{order.quantity} шт.</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Листовка:
                        </span>
                        <span className="font-medium text-right">{getLeafletName(order.leafletId)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Город:
                        </span>
                        <span className="font-medium">{getCityName(order.cityId)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Дополнительная информация</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 flex items-center gap-2">
                          <Truck className="w-4 h-4" />
                          Дистрибьютор:
                        </span>
                        <span className="font-medium">{getDistributorName(order.distributorId)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Номер площади:
                        </span>
                        <span className="font-medium">{order.squareNumber || "-"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Создал:
                        </span>
                        <span className="font-medium">{order.createdBy || "-"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          Прибыль:
                        </span>
                        <span className="font-medium">{order.distributorProfit ? `${order.distributorProfit} ₽` : "-"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics Card */}
            {(order.given !== null || order.returned !== null) && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Статистика выполнения
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {order.given !== null && (
                      <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-2xl font-bold text-green-600">{order.given}</div>
                        <div className="text-sm text-green-800 font-medium">Распространено</div>
                      </div>
                    )}
                    {order.returned !== null || order.given !== order.quantity && (
                      <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="text-2xl font-bold text-orange-600">{order.returned}</div>
                        <div className="text-sm text-orange-800 font-medium">Возвращено</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Payment Photo Section */}
            {(order.state === "FORPAYMENT" || order.state === "DONE" || hasPaymentPhoto) && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    Фото оплаты
                  </h3>
                  
                  {hasPaymentPhoto ? (
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                        <img 
                          src={paymentPhotoDoc.file_url} 
                          alt="Фото оплаты" 
                          className="max-w-md rounded-lg mx-auto"
                        />
                      </div>
                      <p className="text-sm text-green-600 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Фото оплаты загружено
                      </p>
                    </div>
                  ) : (
                    // Показываем форму загрузки только если статус FORPAYMENT и нет фото
                    order.state === "FORPAYMENT" && !hasPaymentPhoto && (
                      <div className="space-y-4">
                        {!showPaymentForm ? (
                          <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                            <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 mb-4">Фото оплаты не загружено</p>
                            <button
                              onClick={() => setShowPaymentForm(true)}
                              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                            >
                              <Upload className="w-4 h-4" />
                              Загрузить фото оплаты
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoSelect}
                                className="hidden"
                                id="payment-photo"
                              />
                              <label
                                htmlFor="payment-photo"
                                className="cursor-pointer block text-center"
                              >
                                {photoPreview ? (
                                  <div className="space-y-3">
                                    <img 
                                      src={photoPreview} 
                                      alt="Превью" 
                                      className="max-w-xs rounded-lg mx-auto"
                                    />
                                    <p className="text-sm text-gray-600">Нажмите для выбора другого фото</p>
                                  </div>
                                ) : (
                                  <div className="py-8">
                                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600">Нажмите для выбора фото</p>
                                    <p className="text-sm text-gray-500 mt-1">Поддерживаются JPG, PNG (макс. 10MB)</p>
                                  </div>
                                )}
                              </label>
                            </div>
                            
                            {paymentPhoto && (
                              <div className="flex gap-2">
                                <button
                                  onClick={uploadPaymentPhoto}
                                  disabled={uploadingPhoto}
                                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                  {uploadingPhoto ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Upload className="w-4 h-4" />
                                  )}
                                  {uploadingPhoto ? "Загрузка..." : "Загрузить фото"}
                                </button>
                                
                                <button
                                  onClick={() => {
                                    setShowPaymentForm(false);
                                    setPaymentPhoto(null);
                                    setPhotoPreview(null);
                                  }}
                                  disabled={uploadingPhoto}
                                  className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                                >
                                  Отмена
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                  Статус заказа
                </h3>
                <div className={`p-4 rounded-lg ${statusInfo.color}`}>
                  <div className="flex items-center gap-3">
                    {statusInfo.icon}
                    <div>
                      <div className="font-medium text-gray-900">{statusInfo.text}</div>
                      {order.doneAt && (
                        <div className="text-sm text-gray-600 mt-1">
                          Завершен: {formatDate(order.doneAt)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Card */}
            {order.state === "IN_PROCESS" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    Действия
                  </h3>
                  
                  {!showPartialForm ? (
                    <div className="space-y-3">
                      <button
                        onClick={completeOrder}
                        disabled={submitting}
                        className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                      >
                        <Check className="w-5 h-5" />
                        {submitting ? "..." : "Раздал всё"}
                      </button>
                      
                      <button
                        onClick={() => setShowPartialForm(true)}
                        disabled={submitting}
                        className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                      >
                        <Package className="w-5 h-5" />
                        Раздал частично
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={declineOrder}
                          disabled={submitting}
                          className="bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium text-sm"
                        >
                          <XCircle className="w-4 h-4" />
                          Провален
                        </button>
                        
                        <button
                          onClick={cancelOrder}
                          disabled={submitting}
                          className="bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium text-sm"
                        >
                          <X className="w-4 h-4" />
                          Отменить
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600" />
                            Раздано листовок
                          </label>
                          <input
                            type="number"
                            min="0"
                            max={order.quantity}
                            value={given}
                            onChange={(e) => setGiven(e.target.value === "" ? "" : Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <X className="w-4 h-4 text-orange-600" />
                            Возвращено листовок
                          </label>
                          <input
                            type="number"
                            min="0"
                            max={order.quantity}
                            value={returned}
                            onChange={(e) => setReturned(e.target.value === "" ? "" : Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            placeholder="0"
                          />
                        </div>
                      </div>
                      
                      {given !== "" && returned !== "" && (
                        <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          Осталось неучтенных: {order.quantity - (Number(given) + Number(returned))} шт.
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <button
                          onClick={completePartialOrder}
                          disabled={submitting}
                          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                        >
                          <Check className="w-4 h-4" />
                          {submitting ? "..." : "Готово"}
                        </button>
                        
                        <button
                          onClick={() => {
                            setShowPartialForm(false);
                            setGiven("");
                            setReturned("");
                          }}
                          disabled={submitting}
                          className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Отмена
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Payment Actions Card */}
            {order.state === "FORPAYMENT" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-green-600" />
                    Подтверждение оплаты
                  </h3>
                  
                  <div className="space-y-3">
                    {hasPaymentPhoto ? (
                      <>
                        <p className="text-sm text-gray-600">
                          Фото оплаты загружено. Вы можете подтвердить оплату.
                        </p>
                        <button
                          onClick={confirmPayment}
                          disabled={submitting}
                          className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                        >
                          <CheckCircle className="w-5 h-5" />
                          {submitting ? "..." : "Подтвердить оплату"}
                        </button>
                      </>
                    ) : (
                      <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                        <p className="text-sm text-yellow-800">
                          Для подтверждения оплаты необходимо загрузить фото оплаты
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}