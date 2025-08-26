'use client';
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

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

  const disableAll = async () => {
    await fetch(`/api/manager/sessions`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: id }),
    });
    fetchSessions();
  };

  useEffect(() => {
    fetchSessions();
  }, [id]);
  console.log(sessions)

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Сессии пользователя {id}</h1>

      <button
        onClick={disableAll}
        className="mb-4 px-4 py-2 bg-red-600 text-white rounded"
      >
        Отключить все сессии
      </button>

      {loading ? (
        <p>Загрузка...</p>
      ) : (
        <div className="space-y-4">
          {sessions.map((s) => (
            <div
              key={s.id}
              className={`p-4 border rounded-lg shadow-sm flex justify-between items-center ${
                s.valid ? "bg-green-50" : "bg-gray-200"
              }`}
            >
              <div>
                <p><b>Token:</b> {s.token}</p>
                <p><b>IP:</b> {s.ip || "—"}</p>
                <p><b>UA:</b> {s.userAgent || "—"}</p>
                {s.latitude && s.longitude && (
                  <p>
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
                  <b>Создана:</b> {new Date(s.createdAt).toLocaleString()}
                </p>
                <p>
                  <b>Истекает:</b> {new Date(s.expiresAt).toLocaleString()}
                </p>
              </div>
              {s.valid && (
                <button
                  onClick={() => disableSession(s.token)}
                  className="px-3 py-1 bg-red-500 text-white rounded"
                >
                  Отключить
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
