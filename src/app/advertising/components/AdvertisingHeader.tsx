'use client';
import { SessionProvider } from "next-auth/react";
import CheckValidSession from "@/app/admin/components/useCheckValidSession";
import Link from "next/link";
import { useState } from "react";

export default function AdvertisingHeader({
  fullName,
  visibility,
  session
}: {
  fullName: string;
  visibility: string;
   session:string
}) {
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  return (
    
    <header className="bg-gray-900 text-white px-6 py-4 shadow relative z-50">
       <SessionProvider><CheckValidSession /></SessionProvider>
      <div className="flex justify-between items-center">
        {/* Кнопка бургер-меню */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-white text-xl z-50 relative"
        >
          ☰
        </button>

        {/* Навигация для десктопа */}
        <nav className="hidden md:flex md:gap-6 md:items-center text-sm">
      
                   <Link href="/advertising/leaflet"  className="hover:text-blue-300 transition">📰 Листовки</Link>
                       <Link href="/advertising" className="hover:text-blue-300 transition">Листопад</Link>
                               <Link href="/advertising/statistics" className="hover:text-blue-300 transition">Статистика</Link>
                       {session.user.role ==="admin"&& <Link href="/admin" className="hover:text-blue-300 transition">Назад на админку</Link> }
                       
       
        </nav>

        {/* Блок пользователя + выход */}
        <form
          action="/api/auth/signout"
          method="POST"
          className="flex items-center gap-3 ml-auto"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs uppercase">
              {fullName?.[0] ?? "?"}
            </div>
            <span className="text-sm hidden md:inline">{fullName ?? "?"}</span>
          </div>
          <button
            type="submit"
            className="text-sm text-red-300 hover:text-red-500 transition"
          >
            ⬅ Выйти
          </button>
        </form>
      </div>

      {/* Мобильное меню + оверлей */}
      <div
  className={`fixed top-0 left-0 w-full h-screen bg-gray-900 text-white 
  flex flex-col gap-6 px-6 py-10 text-lg transform transition-all 
  duration-300 ease-in-out z-40
  ${open ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 pointer-events-none"}
  md:hidden justify-center items-center text-center`}
>

        <Link href="/advertising/leaflet"  className="hover:text-blue-300 transition">📰 Листовки</Link>
                       <Link href="/advertising" className="hover:text-blue-300 transition">Листопад</Link>
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
