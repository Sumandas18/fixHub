import React from 'react';
import { Loader2 } from 'lucide-react';

export default function UserLoading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '32px', background: '#0f1117' }}>
      
      {/* Hero Skeleton */}
      <div style={{ 
        background: 'rgba(255,255,255,0.02)', 
        border: '1px solid var(--glass-border)', 
        borderRadius: 20, 
        padding: '44px 40px', 
        marginBottom: 32, 
        textAlign: 'center', 
        animation: 'pulse 1.5s infinite' 
      }}>
        <div style={{ height: 36, width: '40%', background: 'rgba(255,255,255,0.06)', borderRadius: 8, margin: '0 auto 12px' }} />
        <div style={{ height: 16, width: '60%', background: 'rgba(255,255,255,0.03)', borderRadius: 4, margin: '0 auto 24px' }} />
        <div style={{ height: 48, width: '100%', maxWidth: 560, background: 'rgba(255,255,255,0.05)', borderRadius: 12, margin: '0 auto' }} />
      </div>

      {/* Grid Skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '18px', marginBottom: '32px' }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} style={{ height: 260, background: 'var(--glass-bg)', backdropFilter: 'blur(16px)', border: '1px solid var(--glass-border)', borderRadius: 14, animation: 'pulse 1.5s infinite' }} />
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', opacity: 0.5, marginTop: 40 }}>
        <Loader2 className="usr-spin" size={32} color="#eb5e28" />
      </div>
    </div>
  );
}
