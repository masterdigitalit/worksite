'use client';

import { useEffect, useState, createContext, useContext } from 'react'; // Убрали React из импорта
import { useRouter } from 'next/navigation';
import { useAuth } from 'contexts/AuthContext';
import AdminHeader from './AdminHeader';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Создаем контекст для пользователя
const UserContext = createContext<any>(null);

// Хук для использования пользователя в дочерних компонентах
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a AdminLayoutClient');
  }
  return context;
};

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
    console.log(user)
    
    if (!loading && user && user.role !== 'ADMIN') {
      if (user.role === 'MANAGER') {
        router.push('/advertising');
      } else {
        router.push('/unauthorized');
      }
    }
  }, [loading, isAuthenticated, user, router]);

  if (loading || !isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <UserContext.Provider value={user}>
      <div className="min-h-screen flex flex-col">
        <AdminHeader
          fullName={user.username ?? "?"}
          visibility={user.visibility}
        />
        <main className="flex-1 bg-gray-50">
          {children}
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            closeOnClick
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
        </main>
      </div>
    </UserContext.Provider>
  );
}