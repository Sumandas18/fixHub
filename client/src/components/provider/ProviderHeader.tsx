'use client';

import { Bell, Search } from 'lucide-react';

export default function ProviderHeader() {
  return (
    <header className="pv-header">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 8,
          padding: '7px 14px',
          width: 260,
        }}
      >
        <Search size={15} color="#4a5568" />
        <input
          type="text"
          placeholder="Search bookings, services..."
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#94a3b8',
            fontSize: 13,
            width: '100%',
          }}
        />
      </div>

      <div className="pv-header-right">
        <button
          style={{
            width: 36, height: 36,
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#64748b',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            cursor: 'pointer',
            position: 'relative',
          }}
        >
          <Bell size={17} />
          <span
            style={{
              position: 'absolute', top: 7, right: 7,
              width: 7, height: 7,
              background: '#60a5fa',
              borderRadius: '50%',
              border: '1.5px solid #161b27',
            }}
          />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="pv-avatar" style={{ width: 36, height: 36, fontSize: 14 }}>K</div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9', lineHeight: 1.3 }}>Kiran Singh</p>
            <p style={{ fontSize: 11, color: '#4a5568' }}>kiran@fixhub.com</p>
          </div>
        </div>
      </div>
    </header>
  );
}
