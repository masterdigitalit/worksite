'use client';
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MapPin, Clock, Globe, Smartphone, Shield, Trash2, Power } from "lucide-react";

interface Session {
  id: string;
  token: string;
  valid: boolean;
  createdAt: string;
  expiresAt: string;
  latitude?: number | null;
  longitude?: number | null;
  userAgent?: string | null;
  ip?: string | null;
}

export default function ManagerSessionsPage() {
  const { id } = useParams();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/manager/sessions?userId=${id}`);
      const data = await res.json();
      setSessions(data);
    } catch (e) {
      console.error("Ошибка загрузки:", e);
    }
    setLoading(false);
  };

  const disableSession = async (token: string) => {
    await fetch(`/api/manager/sessions`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    fetchSessions();
  };

  const deleteUser = async () => {
    await fetch(`/api/manager/delete`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchSessions();
  };

  useEffect(() => {
    fetchSessions();
  }, [id]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Сессии пользователя {id}</h1>
        <button
          onClick={deleteUser}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition"
        >
          <Trash2 size={18} /> Удалить пользователя
        </button>
      </div>

      {loading ? (
        <p>Загрузка...</p>
      ) : (
        <div className="grid gap-4">
          {sessions.map((s) => (
            <div
              key={s.id}
              className={`p-5 rounded-2xl shadow flex justify-between items-start transition border 
                ${s.valid ? "bg-white border-green-300" : "bg-gray-100 border-gray-300"}`}
            >
              <div className="space-y-2 text-sm">
                <p className="font-mono text-xs break-all">
                  <Shield size={14} className="inline mr-1 text-gray-500" /> 
                  <b>Token:</b> {s.token}
                </p>
                <p>
                  <Globe size={14} className="inline mr-1 text-gray-500" /> 
                  <b>IP:</b> {s.ip || "—"}
                </p>
                <p>
                  <Smartphone size={14} className="inline mr-1 text-gray-500" /> 
                  <b>UA:</b> {s.userAgent || "—"}
                </p>
                {s.latitude && s.longitude && (
                  <p>
                    <MapPin size={14} className="inline mr-1 text-gray-500" /> 
                    <b>Координаты:</b>{" "}
                    <a
                      href={`https://yandex.ru/maps/?pt=${s.longitude},${s.latitude}&z=16&l=map`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      {s.latitude.toFixed(5)}, {s.longitude.toFixed(5)}
                    </a>
                  </p>
                )}
                <p>
                  <Clock size={14} className="inline mr-1 text-gray-500" /> 
                  <b>Создана:</b> {new Date(s.createdAt).toLocaleString()}
                </p>
                <p>
                  <Clock size={14} className="inline mr-1 text-gray-500" /> 
                  <b>Истекает:</b> {new Date(s.expiresAt).toLocaleString()}
                </p>
              </div>

              {s.valid ? (
                <button
                  onClick={() => disableSession(s.token)}
                  className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition"
                >
                  <Power size={16} /> Отключить
                </button>
              ) : (
                <span className="px-3 py-1 text-xs rounded bg-gray-300 text-gray-700">Выключена</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
