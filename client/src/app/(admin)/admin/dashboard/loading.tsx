export default function AdminDashboardLoading() {
  return (
    <div style={{ padding: '28px' }}>
      {/* Page header skeleton */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ width: 220, height: 28, borderRadius: 6, background: 'rgba(255,255,255,0.07)', marginBottom: 8, animation: 'pulse 1.5s infinite' }} />
        <div style={{ width: 320, height: 16, borderRadius: 4, background: 'rgba(255,255,255,0.05)', animation: 'pulse 1.5s infinite' }} />
      </div>
      {/* Stats skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, marginBottom: 28 }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ height: 120, borderRadius: 14, background: 'rgba(255,255,255,0.05)', animation: 'pulse 1.5s infinite' }} />
        ))}
      </div>
      {/* Table skeleton */}
      <div style={{ height: 340, borderRadius: 14, background: 'rgba(255,255,255,0.05)', animation: 'pulse 1.5s infinite' }} />
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
    </div>
  );
}
