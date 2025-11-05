'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from 'contexts/AuthContext';
import AdvertisingHeader from './components/AdvertisingHeader';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AdvertisingLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    
    // ЕДИНАЯ проверка ролей - используем только MANAGER и ADMIN
    if (!loading && user && user.role !== 'ADVERTISING' && user.role !== 'ADMIN') {
      router.push('/unauthorized');
    }
  }, [loading, isAuthenticated, user, router]);
    console.log(user)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // ЕДИНАЯ проверка здесь тоже - только MANAGER и ADMIN
  if (!isAuthenticated || (user?.role !== 'ADVERTISING' && user?.role !== 'ADMIN')) {
    return null;
  }

  return (
    <div className="min-h-screen ">
      <AdvertisingHeader
        fullName={user.username ?? "?"}
        
      />
      <main className="min-h-screen ">
        {children}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </main>
    </div>
  );
}