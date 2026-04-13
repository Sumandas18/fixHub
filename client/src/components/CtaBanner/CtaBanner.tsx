'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function CtaBanner() {
  return (
    <section style={{ padding:'90px 5%', background:'#0B0F1A', position:'relative', overflow:'hidden' }}>
      {/* Blobs */}
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at center, rgba(168,85,247,0.12) 0%, rgba(59,130,246,0.08) 50%, transparent 70%)', pointerEvents:'none' }} />

      <motion.div
        initial={{ opacity:0, y:30 }}
        whileInView={{ opacity:1, y:0 }}
        viewport={{ once:true }}
        transition={{ duration:0.7 }}
        style={{
          position:'relative', zIndex:1,
          maxWidth:780, margin:'0 auto', textAlign:'center',
          padding:'64px 40px',
          background:'rgba(255,255,255,0.025)',
          border:'1px solid rgba(255,255,255,0.07)',
          borderRadius:28,
          backdropFilter:'blur(20px)',
          boxShadow:'0 0 80px rgba(168,85,247,0.1)',
        }}
      >
        <p style={{ fontSize:12, fontWeight:700, color:'#a78bfa', letterSpacing:'1.5px', textTransform:'uppercase', marginBottom:20 }}>Get Started Today</p>
        <h2 style={{ fontFamily:'Outfit,sans-serif', fontSize:'clamp(2rem,5vw,3rem)', fontWeight:800, color:'#fff', lineHeight:1.15, marginBottom:18, letterSpacing:-0.5 }}>
          Your Next Repair is{' '}
          <span style={{ background:'linear-gradient(135deg,#a855f7,#3b82f6,#ec4899)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            One Click Away
          </span>
        </h2>
        <p style={{ fontSize:16, color:'#64748b', marginBottom:40, maxWidth:480, margin:'0 auto 40px' }}>
          Join thousands of customers who trust FixHub for fast, professional, and transparent home & vehicle repair.
        </p>
        <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
          <Link href="/login" className="hero-btn-primary" style={{ textDecoration:'none', display:'inline-flex', alignItems:'center', gap:8, padding:'14px 32px', fontSize:15, fontWeight:700, color:'#fff', background:'linear-gradient(135deg,#a855f7,#3b82f6,#ec4899)', borderRadius:50, boxShadow:'0 6px 24px rgba(168,85,247,0.35)', transition:'all 0.25s ease' }}>
            Book a Service <ArrowRight size={16} />
          </Link>
          <Link href="/about" style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'14px 32px', fontSize:15, fontWeight:600, color:'#94a3b8', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:50, transition:'all 0.25s ease' }}>
            Learn More
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
