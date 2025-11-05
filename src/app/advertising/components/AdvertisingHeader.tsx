'use client';

import { useAuth } from 'contexts/AuthContext';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import {
  Menu,
  X,
  Home,
  BarChart3,
  Users,
  FileText,
  Leaf,
  LogOut,
  User,
  ChevronDown,
  Settings,
  ArrowLeft
} from "lucide-react";

export default function AdvertisingHeader({
  fullName,
}: {
  fullName: string;
}) {
  const { logout, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const closeMenu = () => setOpen(false);

  // Закрытие меню при клике вне области
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Кастомный курсор для MANAGER роли
  useEffect(() => {
    if (user?.role === 'MANAGER') {
      document.body.style.cursor = "url('/penis_animated.ani'), url('/penis.cur'), auto";
    }

    return () => {
      document.body.style.cursor = '';
    };
  }, [user?.role]);

  const handleLogout = () => {
    logout();
  };

  const navigationItems = [
    { href: "/advertising/leaflet", icon: FileText, label: "Листовки" },
    { href: "/advertising/distributors", icon: Users, label: "Разносчики" },
    { href: "/advertising", icon: Leaf, label: "Листопад" },
    { href: "/advertising/statistics", icon: BarChart3, label: "Статистика" },
  ];

  return (
    <header className="bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg border-b border-gray-700 relative z-50">      <div className="flex justify-between items-center px-4 py-3 sm:px-6">
        {/* Бургер-меню для мобильных */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
          aria-label="Открыть меню"
        >
          {open ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>

        {/* Логотип/Название */}
        <div className="flex items-center gap-2 mr:10px">
          <Leaf className="w-6 h-6 text-green-300 " />
          <span className="text-lg font-bold bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent">
            Листопад
          </span>
        </div>

        {/* Навигация для десктопа */}
        <nav className="hidden md:flex items-center gap-1">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-green-700 transition-all duration-200 group"
            >
              <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
          
          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-blue-600 transition-all duration-200 group ml-2"
            >
              <ArrowLeft className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">Админка</span>
            </Link>
          )}
        </nav>

        {/* Блок пользователя */}
        <div className="flex items-center gap-4 ml-auto" ref={menuRef}>
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 group"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                {fullName?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-medium">{fullName ?? "Пользователь"}</div>
                <div className="text-xs text-green-300 capitalize">
                  {user?.role?.toLowerCase() || 'менеджер'}
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Выпадающее меню пользователя */}
            {userMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-green-800 rounded-lg shadow-xl border border-green-700 py-2 z-50">
                <div className="px-4 py-2 border-b border-green-700">
                  <div className="text-sm font-medium text-white">{fullName}</div>
                  <div className="text-xs text-green-300 capitalize">
                    {user?.role?.toLowerCase() || 'менеджер'}
                  </div>
                </div>
                
                <Link
                  href="/advertising/profile"
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-white hover:bg-green-700 transition-colors duration-200"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <User className="w-4 h-4" />
                  Профиль
                </Link>
                
                <Link
                  href="/advertising/settings"
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-white hover:bg-green-700 transition-colors duration-200"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <Settings className="w-4 h-4" />
                  Настройки
                </Link>

                <div className="border-t border-green-700 mt-1 pt-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-300 hover:bg-red-600 hover:text-white transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    Выйти из системы
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Мобильное меню */}
      <div
        className={`fixed top-0 left-0 w-80 h-screen bg-gradient-to-b from-green-900 to-emerald-900 text-white 
        flex flex-col gap-1 p-4 transform transition-all duration-300 ease-in-out z-40
        ${open ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 pointer-events-none"}
        md:hidden`}
      >
        {/* Заголовок мобильного меню */}
        <div className="flex items-center justify-between p-4 border-b border-green-700 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-semibold">
              {fullName?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div>
              <div className="font-semibold">{fullName}</div>
              <div className="text-sm text-green-300 capitalize">
                {user?.role?.toLowerCase() || 'менеджер'}
              </div>
            </div>
          </div>
          <button
            onClick={closeMenu}
            className="p-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Основная навигация */}
        <div className="space-y-1">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMenu}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-green-700 transition-all duration-200 group"
            >
              <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Ссылка на админку */}
        {user?.role === "ADMIN" && (
          <div className="mt-4 pt-4 border-t border-green-700">
            <Link
              href="/admin"
              onClick={closeMenu}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-600 transition-all duration-200 group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Вернуться в админку</span>
            </Link>
          </div>
        )}

        {/* Дополнительные ссылки и выход в мобильном меню */}
        <div className="mt-auto pt-4 border-t border-green-700 space-y-1">
          <Link
            href="/advertising/profile"
            onClick={closeMenu}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-green-700 transition-all duration-200"
          >
            <User className="w-5 h-5" />
            <span className="font-medium">Профиль</span>
          </Link>
          
          <Link
            href="/advertising/settings"
            onClick={closeMenu}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-green-700 transition-all duration-200"
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Настройки</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-red-600 text-red-300 hover:text-white transition-all duration-200 group"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Выйти из системы</span>
          </button>
        </div>
      </div>

      {/* Оверлей при открытом меню */}
      {open && (
        <div
          onClick={closeMenu}
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-30 md:hidden"
        />
      )}
    </header>
  );
}