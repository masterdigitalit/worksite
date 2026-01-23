"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "lib/api-client";
import { toast } from "react-toastify";
import { validatePhone, formatPhone, normalizePhone } from "utils/phone-utils";
import 'react-toastify/dist/ReactToastify.css';

interface City {
  id: string;
  name: string;
}

interface Worker {
  id: string;
  full_name: string;
  phone: string;
  telegramUsername?: string;
  ordersCompleted: number;
  totalEarned: number;
}

interface Leaflet {
  id: string;
  name: string;
  value?: number;
}

interface OrderFormData {
  address: string;
  full_name: string;
  phone: string;
  problem: string;
  arrive_date: string;
  visit_type: string;
  branch_comment: string;
  call_center_note: string;
  city: string | null;
  master: string | null;
  leaflet: string | null;
  payment_type: string;
}

export default function NewOrderPage() {
  const [formData, setFormData] = useState<OrderFormData>({
    address: "",
    full_name: "",
    phone: "",
    problem: "",
    arrive_date: "",
    visit_type: "FIRST",
    branch_comment: "",
    call_center_note: "",
    city: null,
    master: null,
    leaflet: null,
    payment_type: "HIGH",
  });

  const [cities, setCities] = useState<City[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [leaflets, setLeaflets] = useState<Leaflet[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    loadDropdownData();
  }, []);

  const loadDropdownData = async () => {
    try {
      setLoading(true);
      
      const [citiesData, workersData, leafletsData] = await Promise.all([
        apiClient.get<City[]>('/api/v1/cities/'),
        apiClient.get<Worker[]>('/api/v1/workers/'),
        apiClient.get<Leaflet[]>('/api/v1/leaflets/')
      ]);

      setCities(citiesData);
      setWorkers(workersData);
      setLeaflets(leafletsData);
    } catch (error: any) {
      console.error('Failed to load dropdown data:', error);
      toast.error("Ошибка загрузки данных для формы");
    } finally {
      setLoading(false);
    }
  };

  // Обработчик изменения телефона с валидацией
  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    setFormData(prev => ({ ...prev, phone: formatted }));
    
    // Валидация в реальном времени
    const error = validatePhone(formatted);
    setPhoneError(error);
    
    if (error) {
      setError(null);
    }
  };

  const validateForm = (): string | null => {
    // Обязательные поля
    if (!formData.address.trim()) return "Адрес обязателен для заполнения";
    if (!formData.full_name.trim()) return "ФИО обязательно для заполнения";
    if (!formData.phone.trim()) return "Телефон обязателен для заполнения";
    if (!formData.arrive_date) return "Дата прибытия обязательна";

    // Проверка телефона
    const phoneValidationError = validatePhone(formData.phone);
    if (phoneValidationError) {
      return phoneValidationError;
    }

    // Проверка даты (должна быть в будущем)
    const selectedDate = new Date(formData.arrive_date);
    const now = new Date();
    
    if (selectedDate <= now) {
      return "Дата прибытия должна быть в будущем";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация формы
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const payload = {
        address: formData.address.trim(),
        full_name: formData.full_name.trim(),
        phone: normalizePhone(formData.phone), // Нормализуем телефон для сервера
        problem: formData.problem.trim(),
        arrive_date: formData.arrive_date,
        visit_type: formData.visit_type,
        branch_comment: formData.branch_comment.trim() || null,
        call_center_note: formData.call_center_note.trim() || null,
        city: formData.city,
        master: formData.master,
        leaflet: formData.leaflet,
        payment_type: formData.payment_type,
      };

      console.log('Sending payload:', payload);

      const response = await apiClient.post("/api/v1/orders/", payload);
      console.log('Order created successfully:', response);
      
      toast.success("Заказ успешно создан!");
      
      // Задержка перед переходом чтобы пользователь увидел сообщение
      setTimeout(() => {
        router.push("/admin/orders");
        router.refresh();
      }, 1000);
      
    } catch (error: any) {
      console.error('Failed to create order:', error);
      
      // Обработка ошибок API
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (typeof errorData === 'object') {
          // Обработка ошибок валидации Django
          const errorMessages = Object.values(errorData).flat().join(', ');
          toast.error(`Ошибка валидации: ${errorMessages}`);
        } else if (typeof errorData === 'string') {
          toast.error(errorData);
        } else {
          toast.error("Ошибка при создании заказа");
        }
      } else if (error.response?.status === 500) {
        toast.error("Внутренняя ошибка сервера");
      } else {
        toast.error(error.message || "Ошибка создания заказа");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof OrderFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (error) setError(null);
  };

  const handleCancel = () => {
    router.push("/orders");
  };

  if (loading) {
    return (
      <div className="p-6 bg-background min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-foreground">📋 Создание заказа</h1>
            <button
              onClick={handleCancel}
              className="rounded bg-muted px-4 py-2 text-foreground transition hover:bg-muted/80"
            >
              Назад к списку
            </button>
          </div>
          <div className="bg-card rounded-lg p-8 text-center border border-border">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Загрузка данных...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-background min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">📋 Создание заказа</h1>
          <button
            onClick={handleCancel}
            className="rounded bg-muted px-4 py-2 text-foreground transition hover:bg-muted/80"
          >
            Назад к списку
          </button>
        </div>

        <div className="bg-card rounded-lg shadow-md p-6 border border-border">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Основная информация */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Основная информация
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    ФИО клиента *
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => handleChange('full_name', e.target.value)}
                    placeholder="Введите ФИО клиента..."
                    className="w-full p-3 border border-input bg-background text-foreground rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                    disabled={saving}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Телефон *
                    {phoneError && (
                      <span className="text-red-500 dark:text-red-400 text-xs ml-2">({phoneError})</span>
                    )}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="+7 (XXX) XXX-XX-XX"
                    className={`w-full p-3 border ${
                      phoneError ? 'border-red-500' : 'border-input'
                    } bg-background text-foreground rounded focus:ring-2 focus:ring-primary focus:border-transparent`}
                    disabled={saving}
                  />
                  {!phoneError && formData.phone && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      ✓ Формат корректен
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Адрес *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="Введите адрес..."
                    className="w-full p-3 border border-input bg-background text-foreground rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                    disabled={saving}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Проблема *
                  </label>
                  <textarea
                    required={true}
                    value={formData.problem}
                    onChange={(e) => handleChange('problem', e.target.value)}
                    placeholder="Опишите проблему..."
                    rows={3}
                    className="w-full p-3 border border-input bg-background text-foreground rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                    disabled={saving}
                  />
                </div>
              </div>

              {/* Дополнительная информация */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Дополнительная информация
                </h3>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-foreground">
                      Дата прибытия *
                    </label>
                  </div>
                  <input
                    type="datetime-local"
                    value={formData.arrive_date}
                    onChange={(e) => handleChange('arrive_date', e.target.value)}
                    className="w-full p-3 border border-input bg-background text-foreground rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                    disabled={saving}
                    min={new Date().toISOString().slice(0, 16)} // Запрет выбора прошедших дат
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Город *
                  </label>
                  <select
                    required={true}
                    value={formData.city || ""}
                    onChange={(e) => handleChange('city', e.target.value || null)}
                    className="w-full p-3 border border-input bg-background text-foreground rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                    disabled={saving}
                  >
                    <option value="">Выберите город</option>
                    {cities.map(city => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Мастер
                  </label>
                  <select
                    value={formData.master || ""}
                    onChange={(e) => handleChange('master', e.target.value || null)}
                    className="w-full p-3 border border-input bg-background text-foreground rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                    disabled={saving}
                  >
                    <option value="">Выберите мастера</option>
                    {workers.map(worker => (
                      <option key={worker.id} value={worker.id}>
                        {worker.full_name} ({worker.phone})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Листовка *
                  </label>
                  <select
                    required={true}
                    value={formData.leaflet || ""}
                    onChange={(e) => handleChange('leaflet', e.target.value || null)}
                    className="w-full p-3 border border-input bg-background text-foreground rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                    disabled={saving}
                  >
                    <option value="">Выберите листовку</option>
                    {leaflets.map(leaflet => (
                      <option key={leaflet.id} value={leaflet.id}>
                        {leaflet.name} {leaflet.value && `(${leaflet.value} ₽)`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Тип визита
                  </label>
                  <select
                    value={formData.visit_type}
                    onChange={(e) => handleChange('visit_type', e.target.value)}
                    className="w-full p-3 border border-input bg-background text-foreground rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                    disabled={saving}
                  >
                    <option value="FIRST">Первичный</option>
                    <option value="REPEAT">Повторный</option>
                    <option value="CHECK">Проверка</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Тип оплаты
                  </label>
                  <select
                    value={formData.payment_type}
                    onChange={(e) => handleChange('payment_type', e.target.value)}
                    className="w-full p-3 border border-input bg-background text-foreground rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                    disabled={saving}
                  >
                    <option value="LOW">Низкий</option>
                    <option value="MEDIUM">Средний</option>
                    <option value="HIGH">Высокий</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Комментарии */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                Комментарии
              </h3>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Комментарий филиала
                </label>
                <textarea
                  value={formData.branch_comment}
                  onChange={(e) => handleChange('branch_comment', e.target.value)}
                  placeholder="Комментарий от филиала..."
                  rows={2}
                  className="w-full p-3 border border-input bg-background text-foreground rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Заметка колл-центра
                </label>
                <textarea
                  value={formData.call_center_note}
                  onChange={(e) => handleChange('call_center_note', e.target.value)}
                  placeholder="Заметка от колл-центра..."
                  rows={2}
                  className="w-full p-3 border border-input bg-background text-foreground rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={saving}
                />
              </div>
            </div>

            {/* Кнопки действий */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-border">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 border border-input text-foreground bg-background rounded hover:bg-muted transition disabled:opacity-50"
                disabled={saving}
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={saving || !formData.address.trim() || !formData.full_name.trim() || !formData.phone.trim() || !formData.arrive_date || phoneError !== null}
                className="px-6 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                    Создание...
                  </span>
                ) : (
                  "Создать заказ"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}