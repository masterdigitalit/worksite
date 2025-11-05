'use client';

import CheckValidSession from "./useCheckValidSession";
import { SessionProvider } from "next-auth/react";
import { jwtAuthService } from 'lib/jwt-auth'
import Link from "next/link";
import { useState } from "react";
import {
  Menu,
  X,
  Home,
  Package,
  Users,
  BarChart3,
  DollarSign,
  Leaf,
  Building,
  Monitor,
  Target,
  UserCog,
  LogOut,
  User,
  ChevronDown
} from "lucide-react";

export default function AdminHeader({
  fullName,
  visibility,
}: {
  fullName: string;
  visibility: string;
}) {
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  const navigationItems = [
    { href: "/admin", icon: Home, label: "Главная" },
    { href: "/admin/orders", icon: Package, label: "Заказы" },
    { href: "/admin/workers", icon: Users, label: "Работники" },
    { href: "/admin/statistics", icon: BarChart3, label: "Статистика" },
    { href: "/admin/finance", icon: DollarSign, label: "Финансы" },
    { href: "/advertising", icon: Leaf, label: "Листопад" },
  ];

  const adminItems = [
    { href: "/admin/city", icon: Building, label: "Города" },
    { href: "/admin/logs", icon: Monitor, label: "Логи" },
    { href: "/admin/target", icon: Target, label: "Цель" },
    { href: "/admin/managers", icon: UserCog, label: "Менеджеры" },
  ];

  return (
    <header className="bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg border-b border-gray-700 relative z-50">
      <SessionProvider>
        <CheckValidSession />
      </SessionProvider>
      
      <div className="flex justify-between items-center px-4 py-3 sm:px-6">
        {/* Бургер-меню для мобильных */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 rounded-lg hover:bg-gray-700 transition-colors duration-200"
          aria-label="Открыть меню"
        >
          {open ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>

        {/* Навигация для десктопа */}
        <nav className="hidden md:flex items-center gap-1">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-700 transition-all duration-200 group"
            >
              <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
          
          {visibility === "FULL" && (
            <>
              {adminItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-blue-600 transition-all duration-200 group"
                >
                  <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              ))}
            </>
          )}
        </nav>

        {/* Блок пользователя */}
        <div className="flex items-center gap-4 ml-auto">
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200 group"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                {fullName?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-medium">{fullName ?? "Пользователь"}</div>
                <div className="text-xs text-gray-300">Администратор</div>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Выпадающее меню пользователя */}
            {userMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-700">
                  <div className="text-sm font-medium text-white">{fullName}</div>
                  <div className="text-xs text-gray-400">Администратор</div>
                </div>
               
                  <button
                  onClick={()=>jwtAuthService.logout()}
                
                    
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-300 hover:bg-red-600 hover:text-white transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    Выйти из системы
                  </button>
               
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Мобильное меню */}
      <div
        className={`fixed top-0 left-0 w-80 h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white 
        flex flex-col gap-1 p-4 transform transition-all duration-300 ease-in-out z-40
        ${open ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 pointer-events-none"}
        md:hidden`}
      >
        {/* Заголовок мобильного меню */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
              {fullName?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div>
              <div className="font-semibold">{fullName}</div>
              <div className="text-sm text-gray-300">Администратор</div>
            </div>
          </div>
          <button
            onClick={closeMenu}
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
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
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 transition-all duration-200 group"
            >
              <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Админские разделы */}
        {visibility === "FULL" && (
          <>
            <div className="mt-6 mb-2 px-4">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Администрирование
              </div>
            </div>
            <div className="space-y-1">
              {adminItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-600 transition-all duration-200 group"
                >
                  <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* Выход в мобильном меню */}
        <div className="mt-auto pt-4 border-t border-gray-700">
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-red-600 text-red-300 hover:text-white transition-all duration-200 group"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Выйти из системы</span>
            </button>
          </form>
        </div>
      </div>

      {/* Оверлей при открытом меню */}
      {open && (
        <div
          onClick={closeMenu}
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-30 md:hidden"
        />
      )}

      {/* Закрытие выпадающего меню при клике вне его */}
      {userMenuOpen && (
        <div
          onClick={() => setUserMenuOpen(false)}
          className="fixed inset-0 z-40"
        />
      )}
    </header>
  );
}