'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter, usePathname } from 'next/navigation';

export default function ProviderGuard({ children }: { children: React.ReactNode }) {
  const { user, role } = useAuthStore();
  const isAuthenticated = Boolean(user && role);
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!isAuthenticated) {
      router.push('/provider/login');
      return;
    }

    if (user?.role === 'provider' || user?.user_role === 'provider') {
      const status = user?.providerDetails?.status;
      if (status !== 'approved' && pathname !== '/provider/pending') {
        router.push('/provider/pending');
      } else if (status === 'approved' && pathname === '/provider/pending') {
        router.push('/provider/dashboard');
      }
    }
  }, [user, isAuthenticated, router, pathname, mounted]);

  if (!mounted) return null; // avoid hydration mismatch

  const status = user?.providerDetails?.status;
  if ((status !== 'approved') && pathname !== '/provider/pending') {
    return null; // hide content while redirecting
  }

  return <>{children}</>;
}
