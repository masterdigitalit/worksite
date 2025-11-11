"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "lib/api-client";
import { 
  Edit, 
  Power, 
  Search, 
  User,
  Mail,
  Phone,
  Eye,
  EyeOff,
  Calendar,
  Clock,
  Shield,
  UserPlus,
  RefreshCw,
  CheckCircle,
  XCircle
} from "lucide-react";

type Visibility = "FULL" | "LIMITED";
type Role = "ADMIN" | "ADVERTISING" | "MANAGER";

interface User {
  id: string;
  fullName: string;
  username: string;
  visibility: Visibility;
  role: Role;
  telegramUsername?: string;
  phone?: string;
  is_active: boolean;
  createdAt: string;
  last_login?: string;
  date_joined: string;
  permissions?: string[];
  all_permissions?: string[];
  role_permissions?: string[];
}

const roles = {
  ADMIN: { label: 'Админ', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  ADVERTISING: { label: 'Рекламщик', color: 'bg-green-100 text-green-800 border-green-200' },
};

const visibilityLabels = {
  FULL: { label: 'Полная', icon: Eye, color: 'text-blue-600' },
  LIMITED: { label: 'Ограниченная', icon: EyeOff, color: 'text-orange-600' }
};

// Функция для форматирования даты
const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Функция для форматирования времени относительно текущего момента
const formatRelativeTime = (dateString: string) => {
  if (!dateString) return 'никогда';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  if (diffDays > 0) {
    return `${diffDays} д. назад`;
  } else if (diffHours > 0) {
    return `${diffHours} ч. назад`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} мин. назад`;
  } else {
    return 'только что';
  }
};

export default function ManagersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "">("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Форма
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    role: "ADVERTISING" as Role,
    visibility: "FULL" as Visibility,
    telegramUsername: "",
    phone: "",
    password: "",
    password_confirm: ""
  });

  // Вычисляем, нужно ли показывать поле visibility
  const showVisibilityField = formData.role !== "ADVERTISING";

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<{ users: User[] }>("/api/v1/users/");
      setUsers(response.users);
    } catch (err: any) {
      setError(err.message || "Ошибка при загрузке пользователей");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  }

  // Фильтрация пользователей
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === "" || 
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.telegramUsername?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "" || user.role === roleFilter;
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && user.is_active) ||
      (statusFilter === "inactive" && !user.is_active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  function openForm(user?: User) {
    if (user) {
      setEditingUser(user);
      setFormData({
        fullName: user.fullName || "",
        username: user.username,
        role: user.role,
        visibility: user.visibility,
        telegramUsername: user.telegramUsername || "",
        phone: user.phone || "",
        password: "",
        password_confirm: ""
      });
    } else {
      setEditingUser(null);
      setFormData({
        fullName: "",
        username: "",
        role: "ADVERTISING",
        visibility: "FULL",
        telegramUsername: "",
        phone: "",
        password: "",
        password_confirm: ""
      });
    }
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!formData.fullName.trim()) {
      setError("Введите имя");
      return;
    }
    if (!formData.username.trim()) {
      setError("Введите username");
      return;
    }
    if (!editingUser && !formData.password.trim()) {
      setError("Введите пароль");
      return;
    }
    if (formData.password !== formData.password_confirm) {
      setError("Пароли не совпадают");
      return;
    }

    try {
      if (editingUser) {
        const updateData: any = {
          fullName: formData.fullName,
          username: formData.username,
          role: formData.role,
        };

        if (formData.role !== "ADVERTISING") {
          updateData.visibility = formData.visibility;
        }

        if (formData.telegramUsername) updateData.telegramUsername = formData.telegramUsername;
        if (formData.phone) updateData.phone = formData.phone;

        await apiClient.patch(`/api/v1/users/${editingUser.id}/`, updateData);
      } else {
        const createData: any = {
          fullName: formData.fullName,
          username: formData.username,
          role: formData.role,
          password: formData.password,
          password_confirm: formData.password_confirm,
        };

        if (formData.role !== "ADVERTISING") {
          createData.visibility = formData.visibility;
        }

        if (formData.telegramUsername) createData.telegramUsername = formData.telegramUsername;
        if (formData.phone) createData.phone = formData.phone;

        await apiClient.post("/api/v1/auth/register/", createData);
      }

      await fetchUsers();
      setShowForm(false);
    } catch (err: any) {
      setError(err.message || "Ошибка при сохранении пользователя");
      console.error("Error saving user:", err);
    }
  }

  async function handleDeactivate(user: User) {
    if (!confirm(`Вы уверены, что хотите ${user.is_active ? 'деактивировать' : 'активировать'} пользователя ${user.username}?`)) {
      return;
    }

    try {
      await apiClient.post(`/api/v1/users/${user.id}/deactivate/`);
      await fetchUsers();
    } catch (err: any) {
      setError(err.message || "Ошибка при изменении статуса пользователя");
      console.error("Error deactivating user:", err);
    }
  }

  function handleFormChange(field: keyof typeof formData, value: string) {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }

  // В таблице для ADVERTISING роли показываем прочерк вместо visibility
  const getVisibilityDisplay = (user: User) => {
    return user.role === "ADVERTISING" ? "-" : visibilityLabels[user.visibility].label;
  };

  const VisibilityIcon = ({ visibility }: { visibility: Visibility }) => {
    const IconComponent = visibilityLabels[visibility].icon;
    return <IconComponent className={`w-4 h-4 ${visibilityLabels[visibility].color}`} />;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className=" mx-auto">
        {/* Заголовок и кнопки */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Shield className="w-6 h-6 text-blue-600" />
                Управление пользователями
              </h1>
              <p className="text-gray-600 mt-1">Создание и управление учетными записями пользователей</p>
            </div>
            <button
              onClick={() => openForm()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <UserPlus className="w-4 h-4" />
              Добавить пользователя
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Панель фильтров и поиска */}
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Поиск */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Поиск по имени, username, телефону..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Фильтры */}
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as Role | "")}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Все роли</option>
                <option value="ADMIN">Админ</option>
                <option value="ADVERTISING">Рекламщик</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Все статусы</option>
                <option value="active">Активные</option>
                <option value="inactive">Неактивные</option>
              </select>

              <button
                onClick={fetchUsers}
                className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Обновить
              </button>
            </div>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                <p className="text-sm text-gray-600">Всего пользователей</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.is_active).length}
                </p>
                <p className="text-sm text-gray-600">Активных</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.role === 'ADMIN').length}
                </p>
                <p className="text-sm text-gray-600">Администраторов</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <User className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.role === 'ADVERTISING').length}
                </p>
                <p className="text-sm text-gray-600">Рекламщиков</p>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Десктоп: таблица */}
            <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Пользователь</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Роль</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Контакты</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visibility</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Активность</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{user.fullName || user.username}</p>
                              <p className="text-sm text-gray-500">@{user.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${roles[user.role].color}`}>
                            {roles[user.role].label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {user.telegramUsername && (
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600">{user.telegramUsername}</span>
                              </div>
                            )}
                            {user.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600">{user.phone}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {user.role !== "ADVERTISING" ? (
                            <div className="flex items-center gap-2">
                              <VisibilityIcon visibility={user.visibility} />
                              <span className="text-sm text-gray-600">{visibilityLabels[user.visibility].label}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">{formatDate(user.date_joined)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">{formatRelativeTime(user.last_login || '')}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.is_active 
                              ? 'bg-green-100 text-green-800 border border-green-200' 
                              : 'bg-red-100 text-red-800 border border-red-200'
                          }`}>
                            {user.is_active ? (
                              <CheckCircle className="w-3 h-3" />
                            ) : (
                              <XCircle className="w-3 h-3" />
                            )}
                            {user.is_active ? 'Активен' : 'Неактивен'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openForm(user)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                              Редактировать
                            </button>
                            <button
                              onClick={() => handleDeactivate(user)}
                              className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                                user.is_active 
                                  ? 'text-red-600 hover:bg-red-50' 
                                  : 'text-green-600 hover:bg-green-50'
                              }`}
                            >
                              <Power className="w-4 h-4" />
                              {user.is_active ? 'Деактивировать' : 'Активировать'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Мобилки: карточки */}
            <div className="lg:hidden space-y-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{user.fullName || user.username}</p>
                        <p className="text-sm text-gray-500">@{user.username}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${roles[user.role].color}`}>
                      {roles[user.role].label}
                    </span>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    {(user.telegramUsername || user.phone) && (
                      <div className="flex items-center gap-4">
                        {user.telegramUsername && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{user.telegramUsername}</span>
                          </div>
                        )}
                        {user.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{user.phone}</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium text-gray-700 mb-1">Регистрация</p>
                        <p className="text-xs text-gray-500">{formatDate(user.date_joined)}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700 mb-1">Последний вход</p>
                        <p className="text-xs text-gray-500">{formatRelativeTime(user.last_login || '')}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.is_active 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {user.is_active ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {user.is_active ? 'Активен' : 'Неактивен'}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openForm(user)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeactivate(user)}
                          className={`p-2 rounded-lg transition-colors ${
                            user.is_active 
                              ? 'text-red-600 hover:bg-red-50' 
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Форма создания/редактирования */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div
              className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  {editingUser ? <Edit className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                  {editingUser ? "Редактировать пользователя" : "Добавить пользователя"}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Полное имя</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.fullName}
                    onChange={(e) => handleFormChange('fullName', e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username (Логин)</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.username}
                    onChange={(e) => handleFormChange('username', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Роль</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.role}
                    onChange={(e) => handleFormChange('role', e.target.value as Role)}
                    required
                  >
                    <option value="ADVERTISING">Рекламщик</option>
                    <option value="ADMIN">Админ</option>
                  </select>
                </div>

                {showVisibilityField && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.visibility}
                      onChange={(e) => handleFormChange('visibility', e.target.value as Visibility)}
                      required
                    >
                      <option value="FULL">Полная</option>
                      <option value="LIMITED">Ограниченная</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Телеграм username</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.telegramUsername}
                    onChange={(e) => handleFormChange('telegramUsername', e.target.value)}
                    placeholder="@username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.phone}
                    onChange={(e) => handleFormChange('phone', e.target.value)}
                    placeholder="+7 XXX XXX XX XX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Пароль {editingUser && "(оставьте пустым, чтобы не менять)"}
                  </label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.password}
                    onChange={(e) => handleFormChange('password', e.target.value)}
                    required={!editingUser}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Подтверждение пароля</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.password_confirm}
                    onChange={(e) => handleFormChange('password_confirm', e.target.value)}
                    required={!editingUser}
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => setShowForm(false)}
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingUser ? "Обновить" : "Создать"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}