'use client';

import { Bell, Search } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export default function AdminHeader() {
  const { user } = useAuthStore();
  const displayName  = user?.name || (user as any)?.user_name || 'Admin User';
  const displayEmail = user?.email || (user as any)?.user_email || 'admin@fixhub.com';
  const displayInitial = (displayName[0] || 'A').toUpperCase();

  return (
    <header className="admin-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
            padding: '7px 14px',
            width: '260px',
          }}
        >
          <Search size={15} color="#4a5568" />
          <input
            type="text"
            placeholder="Search anything..."
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#94a3b8',
              fontSize: '13px',
              width: '100%',
            }}
          />
        </div>
      </div>

      <div className="admin-header-right">
        <button className="header-notification-btn">
          <Bell size={17} />
          <span className="header-notification-dot" />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="sidebar-avatar" style={{ width: 36, height: 36, fontSize: 14 }}>
            {displayInitial}
          </div>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#f1f5f9', lineHeight: 1.3 }}>{displayName}</p>
            <p style={{ fontSize: '11px', color: '#4a5568' }}>{displayEmail}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
