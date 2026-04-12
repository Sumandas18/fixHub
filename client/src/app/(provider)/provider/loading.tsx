import React from 'react';
import { Loader2 } from 'lucide-react';

export default function ProviderLoading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '28px', background: '#0f1117' }}>
      {/* Header Skeleton */}
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ height: 32, width: 220, background: 'rgba(255,255,255,0.05)', borderRadius: 8, marginBottom: 8, animation: 'pulse 1.5s infinite' }} />
          <div style={{ height: 16, width: 300, background: 'rgba(255,255,255,0.03)', borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
        </div>
        <div style={{ height: 36, width: 120, background: 'rgba(255,255,255,0.05)', borderRadius: 8, animation: 'pulse 1.5s infinite' }} />
      </div>

      {/* Grid Skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '18px', marginBottom: '28px' }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ height: 100, background: 'var(--glass-bg)', backdropFilter: 'blur(16px)', border: '1px solid var(--glass-border)', borderRadius: 16, animation: 'pulse 1.5s infinite' }} />
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', opacity: 0.5, marginTop: 40 }}>
        <Loader2 className="pv-spin" size={32} color="#1c4ed8" />
      </div>
    </div>
  );
}
