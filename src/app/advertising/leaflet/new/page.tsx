"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "lib/api-client";

interface LeafletFormData {
  name: string;
  value: string;
}

export default function NewLeafletPage() {
  const [formData, setFormData] = useState<LeafletFormData>({
    name: "",
    value: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError("Название листовки обязательно");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const payload = {
        name: formData.name.trim(),
        value: formData.value ? parseFloat(formData.value) : null,
      };

      await apiClient.post("/api/v1/leaflets/", payload);
      
      router.push("/advertising/leaflet");
      router.refresh();
    } catch (error: any) {
      console.error('Failed to create leaflet:', error);
      setError(error.message || "Ошибка создания листовки");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof LeafletFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Очищаем ошибку при изменении поля
    if (error) setError(null);
  };

  const handleCancel = () => {
    router.push("/advertising/leaflet");
  };

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">📰 Создание листовки</h1>
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
            {/* Название листовки */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Название листовки *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Введите название листовки..."
                className="w-full p-3 border border-gray-600 bg-gray-700 text-white rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={saving}
              />
            </div>

            {/* Стоимость */}
            <div>
              <label htmlFor="value" className="block text-sm font-medium text-gray-300 mb-2">
                Кол-во
              </label>
              <input
                type="number"
                id="value"
                value={formData.value}
                onChange={(e) => handleChange('value', e.target.value)}
                placeholder="Кол-во..."
                min="0"
                step="0.01"
                className="w-full p-3 border border-gray-600 bg-gray-700 text-white rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={saving}
              />
             
            </div>

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
                disabled={saving || !formData.name.trim()}
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Создание...
                  </span>
                ) : (
                  "Создать листовку"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}