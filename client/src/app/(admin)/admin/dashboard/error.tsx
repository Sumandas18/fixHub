'use client';

export default function AdminDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '60vh', gap: 16, padding: 28,
    }}>
      <div style={{ fontSize: 48 }}>⚠️</div>
      <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 22, fontWeight: 700, color: '#f1f5f9' }}>
        Something went wrong
      </h2>
      <p style={{ fontSize: 14, color: '#64748b', textAlign: 'center', maxWidth: 380 }}>
        {error.message || 'An unexpected error occurred while loading the dashboard.'}
      </p>
      <button
        onClick={reset}
        style={{
          padding: '9px 20px', background: '#eb5e28', color: '#fff',
          border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer',
        }}
      >
        Try Again
      </button>
    </div>
  );
}
