"use client";

import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import DocumentsTabContent from "./DocumentsTabContent";

interface Distributor {
  id: number;
  fullName: string;
  phone: string;
  telegram: string;

  createdAt: string;
  updatedAt: string;
}

export default function DistributorPage({ params }: { params: { id: string } }) {
  const [distributor, setDistributor] = useState<Distributor | null>(null);
  const [tab, setTab] = useState<"info" | "documents">("info");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDistributor = async () => {
      try {
        const res = await fetch(`/api/distributors/getDistributor?id=${params.id}`);
        if (!res.ok) throw new Error("Ошибка загрузки");
        const data = await res.json();
        setDistributor(data);
      } catch (err) {
        console.error("Ошибка загрузки:", err);
        toast.error("Ошибка загрузки распространителя");
      } finally {
        setLoading(false);
      }
    };

    loadDistributor();
  }, [params.id]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Скопировано в буфер обмена");
  };

  if (loading) {
    return <p className="p-6 text-gray-500">Загрузка...</p>;
  }

  if (!distributor) {
    return <p className="p-6 text-red-500">Распространитель не найден</p>;
  }

  return (
    <div className="p-6">
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
      
      <h1 className="text-2xl font-bold mb-4">
        Распространитель: <span className="text-blue-700">{distributor.fullName}</span>
      </h1>

      <div className="flex gap-3 mb-6">
        <button
          className={`px-4 py-2 rounded-lg transition ${
            tab === "info" ? "bg-blue-600 text-white shadow" : "bg-gray-200 hover:bg-gray-300"
          }`}
          onClick={() => setTab("info")}
        >
          ℹ Инфо
        </button>
        <button
          className={`px-4 py-2 rounded-lg transition ${
            tab === "documents" ? "bg-blue-600 text-white shadow" : "bg-gray-200 hover:bg-gray-300"
          }`}
          onClick={() => setTab("documents")}
        >
          📄 Документы
        </button>
      </div>

      {tab === "info" && (
        <div className="space-y-2 bg-gray-50 rounded-lg p-4 shadow-sm">
          <p>
            <strong>Full Name:</strong> {distributor.fullName}
          </p>
          <p>
            <strong>Телефон:</strong>{" "}
            <a href={`tel:${distributor.phone}`} className="text-blue-600 hover:underline">
              {distributor.phone}
            </a>
          </p>
          <p className="flex items-center gap-2">
            <strong>Telegram:</strong> <span>{distributor.telegram}</span>
            <button
              className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              onClick={() => copyToClipboard(distributor.telegram)}
            >
              Скопировать
            </button>
          </p>
        
          <p>
            <strong>Создан:</strong> {new Date(distributor.createdAt).toLocaleString()}
          </p>
          <p>
            <strong>Обновлён:</strong> {new Date(distributor.updatedAt).toLocaleString()}
          </p>
        </div>
      )}

      {tab === "documents" && <DocumentsTabContent distributorId={distributor.id} />}
    </div>
  );
}
