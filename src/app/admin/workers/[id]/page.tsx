"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-toastify";
import { apiClient } from "lib/api-client";

interface Worker {
  id: string;
  full_name: string;
  telegram_username: string | null;
  phone: string;
  orders_completed: number;
  total_earned: number;
  created_at: string;
  updated_at: string;
}

export default function EditWorkerPage() {
  const [worker, setWorker] = useState<Worker | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    telegram_username: "",
    phone: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const router = useRouter();
  const params = useParams();
  const workerId = params.id as string;
  console.log(worker)

  useEffect(() => {
    if (workerId) {
      loadWorker();
    }
  }, [workerId]);

  const loadWorker = async () => {
    try {
      setLoading(true);
      const workerData = await apiClient.get<Worker>(`/api/v1/workers/${workerId}/`);
      setWorker(workerData);
      setFormData({
        full_name: workerData.full_name,
        telegram_username: workerData.telegram_username || "",
        phone: workerData.phone
      });
    } catch (error: any) {
      console.error('Failed to load worker:', error);
      toast.error(error.message || "Ошибка загрузки данных работника");
      router.push("/admin/workers");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.full_name.trim()) {
      toast.error("Введите полное имя работника");
      return;
    }

    if (!formData.phone.trim()) {
      toast.error("Введите номер телефона");
      return;
    }

    setSaving(true);
    try {
      await apiClient.put(`/api/v1/workers/${workerId}/`, {
        full_name: formData.full_name.trim(),
        telegram_username: formData.telegram_username.trim() || null,
        phone: formData.phone.trim()
      });
      
      toast.success("Данные работника обновлены");
      router.push("/admin/workers");
    } catch (error: any) {
      console.error('Failed to update worker:', error);
      toast.error(error.message || "Ошибка при обновлении данных");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!worker) return;
    
    setDeleting(true);
    try {
      await apiClient.delete(`/api/v1/workers/${workerId}/`);
      
      toast.success("Работник удален");
      router.push("/admin/workers");
    } catch (error: any) {
      console.error('Failed to delete worker:', error);
      toast.error(error.message || "Ошибка при удалении работника");
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/workers");
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('ru-RU').format(amount) + ' ₽';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card rounded-lg shadow-md p-6 border border-border">
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2 text-foreground">Загрузка данных работника...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card rounded-lg shadow-md p-6 text-center border border-border">
            <p className="text-red-600 dark:text-red-400">Работник не найден</p>
            <button
              onClick={() => router.push("/admin/workers")}
              className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
            >
              Вернуться к списку
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-card rounded-lg shadow-md p-6 border border-border">
          <h1 className="text-2xl font-bold text-foreground mb-6">Редактировать работника</h1>
          
          {/* Статистика */}
          <div className="mb-6 p-4 bg-muted rounded-lg">
            <h3 className="font-medium text-foreground mb-2">Статистика работника:</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Выполнено заказов:</span>
                <span className="ml-2 font-medium text-foreground">{worker.orders_completed}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Всего заработано:</span>
                <span className="ml-2 font-medium text-green-600 dark:text-green-400">{formatMoney(worker.total_earned)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Добавлен:</span>
                <span className="ml-2 font-medium text-foreground">
                  {new Date(worker.created_at).toLocaleDateString('ru-RU')}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Обновлен:</span>
                <span className="ml-2 font-medium text-foreground">
                  {new Date(worker.updated_at).toLocaleDateString('ru-RU')}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Полное имя */}
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-foreground mb-2">
                Полное имя *
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                value={formData.full_name}
                onChange={handleChange}
                className="w-full p-3 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={saving}
                required
              />
            </div>

            {/* Telegram username */}
            <div>
              <label htmlFor="telegram_username" className="block text-sm font-medium text-foreground mb-2">
                Telegram username
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                  @
                </span>
                <input
                  id="telegram_username"
                  name="telegram_username"
                  type="text"
                  value={formData.telegram_username}
                  onChange={handleChange}
                  className="flex-1 p-3 border border-input bg-background text-foreground rounded-r-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={saving}
                  placeholder="username"
                />
              </div>
            </div>

            {/* Телефон */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                Номер телефона *
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-3 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={saving}
                required
                placeholder="+7 XXX XXX XX XX"
              />
            </div>

            {/* Кнопки */}
            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-primary text-primary-foreground py-3 px-4 rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {saving ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-2"></div>
                    Сохранение...
                  </div>
                ) : (
                  "Сохранить изменения"
                )}
              </button>
              
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="flex-1 bg-muted text-foreground py-3 px-4 rounded-lg hover:bg-muted/80 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Отмена
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                disabled={saving}
                className="flex-1 bg-red-600 text-primary-foreground py-3 px-4 rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Удалить
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Модальное окно подтверждения удаления */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-md mx-4 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Подтверждение удаления
            </h3>
            
            <p className="text-muted-foreground mb-2">
              Вы уверены, что хотите удалить работника <strong className="text-foreground">{worker.full_name}</strong>?
            </p>
            
            {worker.orders_completed > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-3 mb-4">
                <p className="text-yellow-800 dark:text-yellow-300 text-sm">
                  ⚠️ У этого работника {worker.orders_completed} выполненный(х) заказ(ов). 
                  При удалении связь с этими заказами будет потеряна.
                </p>
              </div>
            )}
            
            <p className="text-red-600 dark:text-red-400 text-sm mb-4">
              Это действие нельзя отменить.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-red-600 text-primary-foreground py-2 px-4 rounded hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                    Удаление...
                  </div>
                ) : (
                  "Удалить"
                )}
              </button>
              
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 bg-muted text-foreground py-2 px-4 rounded hover:bg-muted/80 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}