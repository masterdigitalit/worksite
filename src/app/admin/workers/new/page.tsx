"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { apiClient } from "lib/api-client";

export default function NewWorkerPage() {
  const [formData, setFormData] = useState({
    full_name: "",
    telegram_username: "",
    phone: ""
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация
    if (!formData.full_name.trim()) {
      toast.error("Введите полное имя работника");
      return;
    }

    if (!formData.phone.trim()) {
      toast.error("Введите номер телефона");
      return;
    }

    // Простая валидация телефона
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]+$/;
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      toast.error("Введите корректный номер телефона");
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/api/v1/workers/', {
        full_name: formData.full_name.trim(),
        telegram_username: formData.telegram_username.trim() || null,
        phone: formData.phone.trim()
      });
      
      toast.success("Работник успешно добавлен");
      router.push("/admin/workers");
    } catch (error: any) {
      console.error('Failed to create worker:', error);
      toast.error(error.message || "Ошибка при добавлении работника");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/workers");
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-card rounded-lg shadow-md p-6 border border-border">
          <h1 className="text-2xl font-bold text-foreground mb-6">Добавить нового работника</h1>
          
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
                placeholder="Введите полное имя работника"
                className="w-full p-3 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={loading}
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
                  placeholder="username"
                  className="flex-1 p-3 border border-input bg-background text-foreground rounded-r-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={loading}
                />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Необязательное поле. Только имя пользователя без @
              </p>
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
                placeholder="+7 (999) 123-45-67"
                className="w-full p-3 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={loading}
                required
              />
              <p className="mt-1 text-sm text-muted-foreground">
                Формат: +7 (999) 123-45-67 или 89991234567
              </p>
            </div>

            {/* Кнопки */}
            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary text-primary-foreground py-3 px-4 rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-2"></div>
                    Добавление...
                  </div>
                ) : (
                  "Добавить работника"
                )}
              </button>
              
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 bg-muted text-foreground py-3 px-4 rounded-lg hover:bg-muted/80 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Отмена
              </button>
            </div>
          </form>

          {/* Информация о полях */}
          <div className="mt-8 p-4 bg-primary/10 rounded-lg border border-primary/20">
            <h3 className="font-medium text-primary mb-2">Информация:</h3>
            <ul className="text-sm text-primary space-y-1">
              <li>• Поля помеченные * обязательны для заполнения</li>
              <li>• Telegram username можно добавить позже</li>
              <li>• Статистика заказов и заработка будет обновляться автоматически</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}