"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiClient } from "lib/api-client";

interface LeafletFormData {
  name: string;
  value: string;
}

interface Leaflet {
  id: string;
  name: string;
  value: number | null;
  createdAt: string;
  updatedAt: string;
}

export default function EditLeafletPage() {
  const [formData, setFormData] = useState<LeafletFormData>({
    name: "",
    value: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leaflet, setLeaflet] = useState<Leaflet | null>(null);

  const router = useRouter();
  const params = useParams();
  const leafletId = params.id as string;

  useEffect(() => {
    if (leafletId) {
      loadLeaflet();
    }
  }, [leafletId]);

  const loadLeaflet = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const leafletData = await apiClient.get<Leaflet>(`/api/v1/leaflets/${leafletId}/`);
      setLeaflet(leafletData);
      
      setFormData({
        name: leafletData.name,
        value: leafletData.value?.toString() || "",
      });
    } catch (error: any) {
      console.error('Failed to load leaflet:', error);
      setError(error.message || "Ошибка загрузки листовки");
    } finally {
      setLoading(false);
    }
  };

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

      await apiClient.put(`/api/v1/leaflets/${leafletId}/`, payload);
      
      router.push("/advertising/leaflet");
      router.refresh();
    } catch (error: any) {
      console.error('Failed to update leaflet:', error);
      setError(error.message || "Ошибка обновления листовки");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof LeafletFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (error) setError(null);
  };

  const handleCancel = () => {
    router.push("/advertising/leaflet");
  };

  const handleDelete = async () => {
    if (!confirm("Вы уверены, что хотите удалить эту листовку?")) {
      return;
    }

    try {
      setSaving(true);
      await apiClient.delete(`/api/v1/leaflets/${leafletId}/`);
      
      router.push("/advertising/leaflet");
      router.refresh();
    } catch (error: any) {
      console.error('Failed to delete leaflet:', error);
      setError(error.message || "Ошибка удаления листовки");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">📰 Редактирование листовки</h1>
            <button
              onClick={handleCancel}
              className="rounded bg-gray-600 px-4 py-2 text-white transition hover:bg-gray-700"
            >
              Назад
            </button>
          </div>
          <div className="bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-400">Загрузка листовки...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !leaflet) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">📰 Редактирование листовки</h1>
            <button
              onClick={handleCancel}
              className="rounded bg-gray-600 px-4 py-2 text-white transition hover:bg-gray-700"
            >
              Назад
            </button>
          </div>
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded">
            {error}
            <div className="mt-4 space-x-2">
              <button 
                onClick={loadLeaflet}
                className="bg-red-800 text-white px-4 py-2 rounded hover:bg-red-700 transition"
              >
                Попробовать снова
              </button>
              <button 
                onClick={handleCancel}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
              >
                Вернуться к списку
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">📰 Редактирование листовки</h1>
            {leaflet && (
              <p className="text-sm text-gray-400 mt-1">
                ID: {leaflet.id} • Создана: {new Date(leaflet.createdAt).toLocaleDateString('ru-RU')}
              </p>
            )}
          </div>
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
                Стоимость
              </label>
              <input
                type="number"
                id="value"
                value={formData.value}
                onChange={(e) => handleChange('value', e.target.value)}
                placeholder="Введите стоимость в рублях..."
                min="0"
                step="0.01"
                className="w-full p-3 border border-gray-600 bg-gray-700 text-white rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={saving}
              />
              <p className="mt-1 text-sm text-gray-400">
                Оставьте поле пустым, если стоимость не указана
              </p>
            </div>

            {/* Кнопки действий */}
            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50"
              >
                {saving ? "Удаление..." : "Удалить листовку"}
              </button>

              <div className="flex space-x-4">
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
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Сохранение...
                    </span>
                  ) : (
                    "Сохранить изменения"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}