'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import './admin.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    // Read auth state from Zustand's persisted localStorage key
    try {
      const raw = localStorage.getItem('auth-storage');
      if (!raw) {
        router.push('/admin/login');
        return;
      }
      const parsed = JSON.parse(raw);
      const token = parsed?.state?.token;
      const role  = parsed?.state?.role;

      if (!token || role !== 'admin') {
        router.push('/admin/login');
      }
    } catch {
      router.push('/admin/login');
    }
  }, [router]);

  return (
    <div className="admin-shell">
      <AdminSidebar />
      <div className="admin-main">
        <AdminHeader />
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}
