"use client";

import { useEffect, useState, useCallback } from "react";
import { signOut } from "next-auth/react";

// Функции для работы с куками
function setCookie(name: string, value: string, minutes: number) {
  const expires = new Date(Date.now() + minutes * 60 * 1000).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/`;
}

function getCookie(name: string) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

export default function IdleWatcher({ fullName }: { fullName: string }) {
  const [showModal, setShowModal] = useState(false);
  const [lastActivity, setLastActivity] = useState<number>(() => {
    const saved = getCookie("lastActivity");
    return saved ? parseInt(saved, 10) : Date.now();
  });

  // Сбрасываем таймер активности
  const resetActivity = useCallback(() => {
    const now = Date.now();
    setLastActivity(now);
    setCookie("lastActivity", now.toString(), 60); // сохраняем в куку на 60 минут
  }, []);

  useEffect(() => {
    const events = ["mousemove", "keydown", "click", "scroll"];
    events.forEach((e) => window.addEventListener(e, resetActivity));

    const interval = setInterval(() => {
      const last = parseInt(getCookie("lastActivity") || `${Date.now()}`, 10);
      if (Date.now() - last > 30 * 60 * 1000) {
        setShowModal(true);
      }
    }, 60 * 1000); // проверяем каждую минуту

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetActivity));
      clearInterval(interval);
    };
  }, [resetActivity]);

  // Автовыход через 5 минут после модалки
  // useEffect(() => {
  //   if (!showModal) return;
  //   const timer = setTimeout(() => signOut({ callbackUrl: "/login" }), 5 * 60 * 1000);
  //   return () => clearTimeout(timer);
  // }, [showModal]);

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-2">
          Вы ещё здесь, {fullName}?
        </h2>
        <p className="mb-4 text-gray-600">
          Прошло 30 минут бездействия. Продолжить работу или выйти?
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => {
              setShowModal(false);
              resetActivity(); // обновляем cookie
            }}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Продолжить
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300"
          >
            Сменить аккаунт
          </button>
        </div>
      </div>
    </div>
  );
}
