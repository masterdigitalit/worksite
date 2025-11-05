'use client';
import { useEffect, useState } from "react";
import { apiClient } from "lib/api-client";
import { 
  User, 
  Phone, 
  MessageCircle, 
  TrendingUp, 
  CheckCircle, 
  DollarSign,
  Star,
  Award,
  Calendar,
  MapPin
} from "lucide-react";

type Worker = {
  id: number;
  full_name: string;
  telegram_username?: string | null;
  phone: string;
  orders_completed: number;
  total_earned: number;
  rating?: number;
  specialization?: string;
  experience?: string;
  last_active?: string;
};

export default function MasterTabContent({ masterId }: { masterId?: number | null }) {
  const [worker, setWorker] = useState<Worker | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  console.log(worker)

  useEffect(() => {
    if (!masterId) return;
    
    const fetchWorker = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.get<Worker>(`/api/v1/workers/${masterId}/`);
        setWorker(data);
      } catch (err) {
        console.error('Failed to fetch worker:', err);
        setError(err instanceof Error ? err.message : 'Ошибка загрузки мастера');
      } finally {
        setLoading(false);
      }
    };

    fetchWorker();
  }, [masterId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Неизвестно';
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  if (!masterId) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 text-center">
        <User className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-yellow-800 mb-2">Мастер не назначен</h3>
        <p className="text-yellow-700">Для этого заказа еще не назначен исполнитель</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">Загрузка информации о мастере...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
        <User className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-red-800 mb-2">Ошибка загрузки</h3>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
        <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Мастер не найден</h3>
        <p className="text-gray-600">Информация о мастере недоступна</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <User className="w-8 h-8 text-blue-600" />
          Информация о мастере
        </h2>
        <p className="text-gray-600">Детальная информация и контакты исполнителя</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Основная информация */}
        <div className="lg:col-span-2 space-y-6">
          {/* Профиль мастера */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-6 h-6 text-blue-600" />
              Профиль мастера
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoBlock 
                title="ФИО" 
                value={worker.full_name} 
                icon={<User className="w-5 h-5" />}
              />
              <InfoBlock 
                title="Телефон" 
                value={worker.phone} 
                icon={<Phone className="w-5 h-5" />}
              />
              {worker.telegram_username && (
                <InfoBlock 
                  title="Telegram" 
                  value={`@${worker.telegram_username}`} 
                  icon={<MessageCircle className="w-5 h-5" />}
                />
              )}
              {worker.specialization && (
                <InfoBlock 
                  title="Специализация" 
                  value={worker.specialization} 
                  icon={<Award className="w-5 h-5" />}
                />
              )}
              {worker.experience && (
                <InfoBlock 
                  title="Опыт работы" 
                  value={worker.experience} 
                  icon={<Calendar className="w-5 h-5" />}
                />
              )}
              {worker.last_active && (
                <InfoBlock 
                  title="Последняя активность" 
                  value={formatDate(worker.last_active)} 
                  icon={<MapPin className="w-5 h-5" />}
                />
              )}
            </div>
          </div>

          {/* Статистика */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-green-600" />
              Статистика выполнения
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatBlock 
                title="Завершено заказов" 
                value={worker.orders_completed.toString()} 
                icon={<CheckCircle className="w-6 h-6" />}
                accent="blue"
              />
              <StatBlock 
                title="Всего заработано" 
                value={formatCurrency(worker.total_earned)} 
                icon={<DollarSign className="w-6 h-6" />}
                accent="green"
              />
              {worker.rating && (
                <StatBlock 
                  title="Рейтинг" 
                  value={worker.rating.toString()} 
                  icon={<Star className="w-6 h-6" />}
                  accent="yellow"
                />
              )}
            </div>
          </div>
        </div>

        {/* Боковая панель с действиями */}
        <div className="space-y-6">
          {/* Контакты */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Контакты
            </h3>
            <div className="space-y-3">
              <button 
                onClick={() => window.open(`tel:${worker.phone}`)}
                className="w-full bg-white text-blue-600 px-4 py-3 rounded-xl hover:bg-blue-50 transition-all duration-200 flex items-center justify-center gap-2 font-semibold shadow-lg"
              >
                <Phone className="w-5 h-5" />
                Позвонить
              </button>
              
              {worker.telegram_username && (
                <button 
                  onClick={() => window.open(`https://t.me/${worker.telegram_username}`, '_blank')}
                  className="w-full bg-white text-blue-600 px-4 py-3 rounded-xl hover:bg-blue-50 transition-all duration-200 flex items-center justify-center gap-2 font-semibold shadow-lg"
                >
                  <MessageCircle className="w-5 h-5" />
                  Написать в Telegram
                </button>
              )}
            </div>
          </div>

          {/* Дополнительная информация */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Быстрые действия</h3>
            <div className="space-y-3">
              <button 
                onClick={() => navigator.clipboard.writeText(worker.phone)}
                className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm"
              >
                <Phone className="w-4 h-4" />
                Скопировать телефон
              </button>
              
              {worker.telegram_username && (
                <button 
                  onClick={() => navigator.clipboard.writeText(worker.telegram_username!)}
                  className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  Скопировать Telegram
                </button>
              )}
              
              <button 
                onClick={() => navigator.clipboard.writeText(worker.fullName)}
                className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm"
              >
                <User className="w-4 h-4" />
                Скопировать ФИО
              </button>
            </div>
          </div>

          {/* ID мастера */}
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-600">ID мастера</p>
            <p className="text-lg font-mono font-semibold text-gray-800">{worker.id}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Компонент для информационных блоков
function InfoBlock({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h4 className="font-semibold text-gray-700 text-sm">{title}</h4>
      </div>
      <p className="text-gray-900 font-medium">{value}</p>
    </div>
  );
}

// Компонент для статистических блоков
function StatBlock({ title, value, icon, accent = "blue" }: { 
  title: string; 
  value: string; 
  icon: React.ReactNode;
  accent?: "blue" | "green" | "yellow" | "red";
}) {
  const accentColors = {
    blue: "text-blue-600 bg-blue-50 border-blue-200",
    green: "text-green-600 bg-green-50 border-green-200",
    yellow: "text-yellow-600 bg-yellow-50 border-yellow-200",
    red: "text-red-600 bg-red-50 border-red-200"
  };

  return (
    <div className={`rounded-xl border p-4 text-center ${accentColors[accent]}`}>
      <div className="flex justify-center mb-2">
        {icon}
      </div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-sm font-medium text-gray-600">{title}</div>
    </div>
  );
}