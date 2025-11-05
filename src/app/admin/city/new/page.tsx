"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { apiClient } from "lib/api-client";

export default function NewCityPage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Введите название города");
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/api/v1/cities/', { name: name.trim() });
      toast.success("Город успешно добавлен");
      router.push("/admin/city");
    } catch (error: any) {
      console.error('Failed to create city:', error);
      toast.error(error.message || "Ошибка при добавлении города");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-6">Добавить новый город</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Название города
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Введите название города"
            disabled={loading}
          />
        </div>
        
        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Добавление..." : "Добавить город"}
          </button>
          
          <button
            type="button"
            onClick={() => router.push("/admin/city")}
            disabled={loading}
            className="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition disabled:opacity-50"
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
}