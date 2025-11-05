"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "lib/api-client";

interface DistributorFormData {
  fullName: string;
  phone: string;
  telegram: string;

}

export default function NewDistributorPage() {
  const [formData, setFormData] = useState<DistributorFormData>({
    fullName: "",
    phone: "",
    telegram: "",

  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName.trim()) {
      setError("ФИО обязательно");
      return;
    }

    if (!formData.phone.trim()) {
      setError("Телефон обязателен");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const payload = {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        telegram: formData.telegram.trim(),
       
      };

      await apiClient.post("/api/v1/distributors/", payload);
      
      router.push("/advertising/distributors");
      router.refresh();
    } catch (error: any) {
      console.error('Failed to create distributor:', error);
      setError(error.message || "Ошибка создания дистрибьютора");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof DistributorFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (error) setError(null);
  };

  const handleCancel = () => {
    router.push("/advertising/distributors");
  };

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">👥 Добавление дистрибьютора</h1>
          <button
            onClick={handleCancel}
            className="rounded bg-gray-600 px-4 py-2 text-white transition hover:bg-gray-700"
          >
            Назад к списку
          </button>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-md p-6">
          {error && (
            <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ФИО */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
                ФИО *
              </label>
              <input
                type="text"
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                placeholder="Введите полное имя..."
                className="w-full p-3 border border-gray-600 bg-gray-700 text-white rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={saving}
              />
            </div>

            {/* Телефон */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                Телефон *
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+7 (XXX) XXX-XX-XX"
                className="w-full p-3 border border-gray-600 bg-gray-700 text-white rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={saving}
              />
            </div>

            {/* Telegram */}
            <div>
              <label htmlFor="telegram" className="block text-sm font-medium text-gray-300 mb-2">
                Telegram
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 border border-r-0 border-gray-600 bg-gray-600 text-gray-300 rounded-l">
                  @
                </span>
                <input
                  type="text"
                  id="telegram"
                  value={formData.telegram}
                  onChange={(e) => handleChange('telegram', e.target.value)}
                  placeholder="username"
                  className="flex-1 p-3 border border-gray-600 bg-gray-700 text-white rounded-r focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={saving}
                />
              </div>
            </div>

            {/* Пригласил */}
      

            {/* Кнопки действий */}
            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 border border-gray-600 text-gray-300 rounded hover:bg-gray-700 transition disabled:opacity-50"
                disabled={saving}
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={saving || !formData.fullName.trim() || !formData.phone.trim()}
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Создание...
                  </span>
                ) : (
                  "Создать дистрибьютора"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}