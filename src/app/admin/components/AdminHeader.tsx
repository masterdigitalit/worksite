'use client';

import { useState } from 'react';
import Link from 'next/link';
import { jwtAuthService } from 'lib/jwt-auth';
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
  ChevronDown,
  Bell,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react';
import { useTheme } from '@/app/providers/ThemeProvider';

interface AdminHeaderProps {
  fullName: string;
  visibility: string;
}

export default function AdminHeader({ fullName, visibility }: AdminHeaderProps) {
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

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
    <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Логотип и бургер-меню */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden p-2 rounded-md hover:bg-accent"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <Link href="/admin" className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <div className="h-5 w-5 bg-primary rounded"></div>
              </div>
              <span className="font-bold text-lg">Админ</span>
            </Link>
          </div>

          {/* Навигация для десктопа */}
          <nav className="hidden md:flex items-center gap-1">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent transition-colors"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
            
            {visibility === "FULL" && adminItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent transition-colors"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Правая часть: тема и профиль */}
          <div className="flex items-center gap-2">
            {/* Переключатель темы */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md hover:bg-accent transition-colors"
              title={`Тема: ${theme === 'light' ? 'Светлая' : theme === 'dark' ? 'Тёмная' : 'Новогодняя'}`}
            >
              {theme === 'light' && <Sun className="h-5 w-5" />}
              {theme === 'dark' && <Moon className="h-5 w-5" />}
              {theme === 'holiday' && <Sparkles className="h-5 w-5 text-yellow-500" />}
            </button>

            {/* Профиль пользователя */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-accent transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                  {fullName?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium">{fullName || 'Пользователь'}</p>
                  <p className="text-xs text-muted-foreground">Администратор</p>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-popover border rounded-lg shadow-lg p-2 z-50">
                  <div className="px-3 py-2 border-b">
                    <p className="font-semibold">{fullName}</p>
                    <p className="text-xs text-muted-foreground">Администратор</p>
                  </div>
                  
                  <div className="py-2 border-t">
                    <Link
                      href="/admin/profile"
                      className="flex items-center gap-2 px-3 py-2 rounded hover:bg-accent text-sm"
                    >
                      <UserCog className="h-4 w-4" />
                      Настройки профиля
                    </Link>
                    <button
                      onClick={() => jwtAuthService.logout()}
                      className="flex items-center gap-2 w-full px-3 py-2 rounded hover:bg-destructive/20 text-destructive text-sm"
                    >
                      <LogOut className="h-4 w-4" />
                      Выйти из системы
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Мобильное меню */}
      {open && (
        <div className="md:hidden border-t">
          <div className="container mx-auto px-4 py-4 space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors"
                onClick={() => setOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
            
            {visibility === "FULL" && (
              <>
                <div className="pt-4 mt-4 border-t">
                  <p className="px-3 text-xs font-semibold text-muted-foreground uppercase mb-2">
                    Администрирование
                  </p>
                  {adminItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}