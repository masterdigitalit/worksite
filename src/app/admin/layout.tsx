'use client';
import AdminLayoutClient from "./components/AdminLayoutClient";
import { AuthProvider } from 'contexts/AuthContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return  <AuthProvider><AdminLayoutClient>{children}</AdminLayoutClient></AuthProvider>;
}