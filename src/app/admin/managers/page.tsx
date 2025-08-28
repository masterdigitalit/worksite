"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Visibility = "MINIMAL" | "PARTIAL" | "ADVERTISING";
type Role = "admin" | "advertising";

interface Manager {
  id: number;
  name: string;
  username: string;
  visibility?: Visibility;
  role: Role;
  password?: string;
}

export default function ManagersPage() {
    const router = useRouter();
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingManager, setEditingManager] = useState<Manager | null>(null);

  // Форма
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<Role>("admin");
  const [visibility, setVisibility] = useState<Visibility>("MINIMAL");
  const [password, setPassword] = useState("");

  useEffect(() => {
    fetchManagers();
  }, []);

  async function fetchManagers() {
    setLoading(true);
    try {
      const res = await fetch("/api/managers");
      if (!res.ok) throw new Error("Ошибка загрузки");
      const data: Manager[] = await res.json();
      setManagers(data);
    } catch {
      alert("Ошибка при загрузке менеджеров");
    } finally {
      setLoading(false);
    }
  }

  function openForm(manager?: Manager) {
    if (manager) {
      setEditingManager(manager);
      setName(manager.name);
      setUsername(manager.username);
      setRole(manager.role);
      setVisibility(manager.visibility || "MINIMAL");
      setPassword("");
    } else {
      setEditingManager(null);
      setName("");
      setUsername("");
      setRole("admin");
      setVisibility("MINIMAL");
      setPassword("");
    }
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      alert("Введите имя");
      return;
    }
    if (!username.trim()) {
      alert("Введите username");
      return;
    }
    if (!editingManager && !password.trim()) {
      alert("Введите пароль");
      return;
    }

    try {
      const method = editingManager ? "PUT" : "POST";
      const url = editingManager ? `/api/managers/${editingManager.id}` : "/api/manager/new";

      const bodyPayload: any = { name, username, role };
      if (role !== "advertising") bodyPayload.visibility = visibility;
      if (password.trim()) bodyPayload.password = password;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });

      if (!res.ok) throw new Error("Ошибка сохранения");

      await fetchManagers();
      setShowForm(false);
    } catch {
      alert("Ошибка при сохранении менеджера");
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Менеджеры</h1>

      <button
        onClick={() => openForm()}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Добавить менеджера
      </button>

      {loading ? (
        <p>Загрузка...</p>
      ) : (
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Имя</th>
              <th className="p-2 border">Username</th>
              <th className="p-2 border">Роль</th>
              <th className="p-2 border">Visibility</th>
            
            </tr>
          </thead>
          <tbody>
            {managers.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50 cursor-pointer"    onClick={() => router.push(`/admin/managers/${m.id}`)}>
                <td className="p-2 border">{m.fullName}</td>
                <td className="p-2 border">{m.username}</td>
                <td className="p-2 border">{m.role}</td>
                <td className="p-2 border">{m.role === "advertising" ? "-" : m.visibility}</td>
       
              
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showForm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-white rounded p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4">
              {editingManager ? "Редактировать менеджера" : "Добавить менеджера"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 font-semibold">Имя</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">Username (Логин)</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">Роль</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  required
                >
                  <option value="admin">Админ</option>
                  <option value="advertising">Рекламщик</option>
                </select>
              </div>

              {role !== "advertising" && (
                <div>
                  <label className="block mb-1 font-semibold">Visibility</label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value as Visibility)}
                    required
                  >
                    <option value="PARTIAL">Админ</option>
                    <option value="MINIMAL">Минимальная</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block mb-1 font-semibold">Пароль</label>
                <input
                  type="password"
                  className="w-full border rounded px-3 py-2"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={editingManager ? "Оставьте пустым, чтобы не менять" : ""}
                  required={!editingManager}
                />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                  onClick={() => setShowForm(false)}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
