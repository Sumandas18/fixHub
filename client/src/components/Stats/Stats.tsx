'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

function CountUp({ end, suffix = '' }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
    const steps = 60;
    const increment = end / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, end]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

const stats = [
  { value: 50000, suffix: '+', label: 'Jobs Completed',     color: '#a855f7' },
  { value: 12000, suffix: '+', label: 'Happy Customers',    color: '#3b82f6' },
  { value: 1500,  suffix: '+', label: 'Verified Providers', color: '#ec4899' },
  { value: 99,    suffix: '%', label: 'Satisfaction Rate',  color: '#f97316' },
];

export default function Stats() {
  return (
    <section style={{ padding:'80px 5%', background:'linear-gradient(135deg, rgba(168,85,247,0.05) 0%, rgba(59,130,246,0.05) 50%, rgba(236,72,153,0.05) 100%)', borderTop:'1px solid rgba(255,255,255,0.04)', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ maxWidth:1200, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:40 }}>
        {stats.map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity:0, y:20 }}
            whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }}
            transition={{ duration:0.5, delay:i*0.1 }}
            style={{ textAlign:'center' }}>
            <p style={{ fontFamily:'Outfit,sans-serif', fontSize:'clamp(2.5rem,5vw,3.5rem)', fontWeight:800, lineHeight:1, marginBottom:10, background:`linear-gradient(135deg, ${s.color}, ${s.color}99)`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              <CountUp end={s.value} suffix={s.suffix} />
            </p>
            <p style={{ fontSize:15, fontWeight:600, color:'#94a3b8' }}>{s.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
