"use client";
import { useState } from "react";

interface Props {
  orderId: number;
  onUploaded: () => void;
}

export default function ForPaymentActions({ orderId, onUploaded }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      alert("Выбери фото!");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`/api/distribution/pay/${orderId}`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      alert("Ошибка загрузки!");
      setLoading(false);
      return;
    }

    alert("Фото успешно загружено!");
    onUploaded();
    setLoading(false);
  };

  return (
    <div className="mt-8 space-y-4">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="block w-full text-sm border rounded-lg p-2"
      />

      <button
        onClick={handleUpload}
        disabled={loading}
        className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60"
      >
        {loading ? "Загрузка..." : "💸 Отправить оплату"}
      </button>
    </div>
  );
}
