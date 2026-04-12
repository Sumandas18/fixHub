export default function Loading() {
  return (
    <div style={{ padding: 28 }}>
      <div style={{ width: '100%', height: 120, borderRadius: 14, background: 'rgba(255,255,255,0.05)', marginBottom: 28, animation: 'pulse 1.5s infinite' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18, marginBottom: 28 }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ height: 110, borderRadius: 14, background: 'rgba(255,255,255,0.05)', animation: 'pulse 1.5s infinite' }} />
        ))}
      </div>
      <div style={{ height: 320, borderRadius: 14, background: 'rgba(255,255,255,0.05)', animation: 'pulse 1.5s infinite' }} />
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </div>
  );
}
