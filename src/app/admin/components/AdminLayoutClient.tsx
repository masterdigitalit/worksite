'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from 'contexts/AuthContext';

import AdminHeader from './AdminHeader';

// Контекст для пользователя
const UserContext = createContext<any>(null);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within AdminLayout');
  }
  return context;
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-primary mx-auto"></div>
          <p className="mt-6 text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <UserContext.Provider value={user}>
      <div className="min-h-screen bg-background">
        <AdminHeader
          fullName={user.username ?? "?"}
          visibility={user.visibility}
        />
        
        <main className="container mx-auto px-4 py-6">
          {children}
        </main>
        
      
      </div>
    </UserContext.Provider>
  );
}