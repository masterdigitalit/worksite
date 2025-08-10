"use client";
import { useEffect, useState } from "react";

interface DistributorDocument {
  id: number;
  type: string;
  url: string;
}

interface Distributor {
  id: number;
  fullName: string;
  phone: string;
  telegram?: string;
  state: "IN_PROCESS" | "DONE";
  documents: DistributorDocument[]; // массив документов
}

export default function DistributorsPage() {
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/distributors/all")
      .then(res => res.json())
      .then(data => {
        setDistributors(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Загрузка...</p>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Разносчики</h1>
      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Имя</th>
            <th className="p-2 border">Телефон</th>
            <th className="p-2 border">Telegram</th>
            <th className="p-2 border">Документы</th>
          </tr>
        </thead>
        <tbody>
          {distributors.map(d => (
            <tr key={d.id}>
              <td className="p-2 border">{d.id}</td>
              <td className="p-2 border">{d.fullName}</td>
              <td className="p-2 border">{d.phone}</td>
              <td className="p-2 border">{d.telegram || "-"}</td>
              <td className="p-2 border text-center">
                {d.documents && d.documents.length > 0 ? "✅" : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
