'use client';

import React from 'react';
import { useUserStore } from '@/store/userStore';
import { Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProviderPendingPage() {
  const { user, logout } = useUserStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
      minHeight: '100vh', background: '#0B0F1A', color: '#f1f5f9', padding: 20, textAlign: 'center'
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', 
        borderRadius: 20, padding: 40, maxWidth: 460, width: '100%'
      }}>
        <Clock size={48} color="#eab308" style={{ marginBottom: 20, marginLeft: 'auto', marginRight: 'auto' }} />
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Account Under Review</h1>
        <p style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.6, marginBottom: 30 }}>
          Your account is currently under review by our admin team. You will be able to access your dashboard and manage bookings once you have been approved.
        </p>
        <button 
          onClick={handleLogout}
          style={{
            padding: '10px 24px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 50, color: '#f1f5f9', fontSize: 14, fontWeight: 600, cursor: 'pointer'
          }}
        >
          Logout and check back later
        </button>
      </div>
    </div>
  );
}
