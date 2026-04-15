'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { ArrowRight, Star, Zap, Shield, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';

const fadeUp = {
  hidden:   { opacity: 0, y: 30 },
  visible:  { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = {
  hidden:   {},
  visible:  { transition: { staggerChildren: 0.12 } },
};

export default function Hero() {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, [pathname]);

  if (!mounted) return null;

  return (
    <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden', background: '#0B0F1A', paddingTop: 80, paddingBottom: 48 }}>

      {/* ── Animated blobs ── */}
      <div className="blob blob-purple" />
      <div className="blob blob-blue" />
      <div className="blob blob-pink" />
      <div className="blob blob-orange" />

      {/* ── Noise overlay ── */}
      <div style={{ position:'absolute', inset:0, backgroundImage:'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.03\'/%3E%3C/svg%3E")', pointerEvents:'none', zIndex:1, opacity:0.4 }} />

      {/* ── Content ── */}
      <div style={{ position:'relative', zIndex:2, width:'100%', maxWidth:1200, margin:'0 auto', padding:'0 5%', display:'grid', gridTemplateColumns:'1fr 1fr', gap:60, alignItems:'center' }}>

        {/* LEFT */}
        <motion.div variants={stagger} initial="hidden" animate="visible">
          {/* Badge */}
          <motion.div variants={fadeUp} style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 16px', background:'rgba(168,85,247,0.1)', border:'1px solid rgba(168,85,247,0.25)', borderRadius:50, marginBottom:24 }}>
            <Zap size={13} color="#a855f7" />
            <span style={{ fontSize:12, fontWeight:700, color:'#a855f7', letterSpacing:'0.5px', textTransform:'uppercase' }}>On-Demand Repair Experts</span>
          </motion.div>

          {/* Heading */}
          <motion.h1 variants={fadeUp} style={{ fontFamily:'Outfit,sans-serif', fontSize:'clamp(2.4rem,5vw,3.8rem)', fontWeight:800, color:'#fff', lineHeight:1.12, letterSpacing:-1.5, marginBottom:20 }}>
            Home & Vehicle Repair,{' '}
            <span style={{ background:'linear-gradient(135deg,#a855f7 0%,#3b82f6 50%,#ec4899 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              On-Demand.
            </span>
          </motion.h1>

          {/* Sub */}
          <motion.p variants={fadeUp} style={{ fontSize:16, color:'#94a3b8', lineHeight:1.75, marginBottom:36, maxWidth:480 }}>
            From AC servicing to emergency roadside help — FixHub connects you with
            verified, background-checked professionals in minutes.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fadeUp} style={{ display:'flex', gap:14, flexWrap:'wrap', marginBottom:40 }}>
            <Link href="/#services" className="hero-btn-primary">
              Explore Services <ArrowRight size={16} />
            </Link>
            <Link href="/login" className="hero-btn-secondary">
              Book Now
            </Link>
          </motion.div>

          {/* Trust row */}
          <motion.div variants={fadeUp} style={{ display:'flex', gap:24, flexWrap:'wrap' }}>
            {[
              { icon: Star,   label: '4.9★ Rating', sub: '12k+ reviews' },
              { icon: Shield, label: 'Verified Pros', sub: 'Background checked' },
              { icon: Zap,    label: 'Fast Booking', sub: 'Under 2 minutes' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:'rgba(168,85,247,0.1)', border:'1px solid rgba(168,85,247,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Icon size={15} color="#a855f7" />
                </div>
                <div>
                  <p style={{ fontSize:13, fontWeight:700, color:'#f1f5f9', lineHeight:1 }}>{label}</p>
                  <p style={{ fontSize:11, color:'#64748b', marginTop:2 }}>{sub}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* RIGHT — floating image + video */}
        <motion.div
          initial={{ opacity:0, x:40 }}
          animate={{ opacity:1, x:0 }}
          transition={{ duration:0.9, delay:0.3, ease:[0.22,1,0.36,1] }}
          style={{ position:'relative', display:'flex', flexDirection:'column', alignItems:'center', gap:0 }}
        >
          {/* Glow ring */}
          <div style={{ position:'absolute', width:420, height:420, borderRadius:'50%', background:'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)', zIndex:0 }} />

          {/* Floating card behind image */}
          <motion.div
            animate={{ y: [0, -14, 0] }}
            transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
            style={{ position:'relative', zIndex:1 }}
          >
            <div style={{ borderRadius:28, overflow:'hidden', border:'1.5px solid rgba(168,85,247,0.25)', boxShadow:'0 30px 80px rgba(0,0,0,0.5), 0 0 60px rgba(168,85,247,0.15)', background:'rgba(255,255,255,0.04)', backdropFilter:'blur(16px)', padding:10 }}>
              <Image
                src="/hero-technician.png"
                alt="Professional technician"
                width={360}
                height={360}
                style={{ borderRadius:20, objectFit:'cover', display:'block' }}
                priority
              />
            </div>

            {/* Floating badge 1 */}
            <motion.div animate={{ y:[0,-6,0] }} transition={{ repeat:Infinity, duration:3, ease:'easeInOut', delay:0.5 }}
              style={{ position:'absolute', top:20, left:-30, background:'rgba(11,15,25,0.9)', backdropFilter:'blur(12px)', border:'1px solid rgba(168,85,247,0.2)', borderRadius:14, padding:'10px 16px', display:'flex', alignItems:'center', gap:10, boxShadow:'0 8px 20px rgba(0,0,0,0.4)' }}>
              <span style={{ fontSize:20 }}>🌟</span>
              <div>
                <p style={{ fontSize:13, fontWeight:700, color:'#f1f5f9', lineHeight:1 }}>4.9 / 5</p>
                <p style={{ fontSize:11, color:'#64748b' }}>Customer Rating</p>
              </div>
            </motion.div>

            {/* Floating badge 2 */}
            <motion.div animate={{ y:[0,8,0] }} transition={{ repeat:Infinity, duration:3.5, ease:'easeInOut', delay:1 }}
              style={{ position:'absolute', bottom:30, right:-30, background:'rgba(11,15,25,0.9)', backdropFilter:'blur(12px)', border:'1px solid rgba(59,130,246,0.2)', borderRadius:14, padding:'10px 16px', display:'flex', alignItems:'center', gap:10, boxShadow:'0 8px 20px rgba(0,0,0,0.4)' }}>
              <span style={{ fontSize:20 }}>⚡</span>
              <div>
                <p style={{ fontSize:13, fontWeight:700, color:'#f1f5f9', lineHeight:1 }}>50k+ Jobs</p>
                <p style={{ fontSize:11, color:'#64748b' }}>Completed</p>
              </div>
            </motion.div>
          </motion.div>

          {/* ── Small video preview below illustration ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            style={{ marginTop: 16, width: 360, position: 'relative', zIndex: 2, flexShrink: 0 }}
          >
            <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 24px rgba(59,130,246,0.1)', background: 'rgba(0,0,0,0.35)', position: 'relative' }}>
              <video
                key={pathname}
                autoPlay muted loop playsInline
                style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }}
              >
                <source src="/landingpage/Animated_Logo_Generation.mp4" type="video/mp4" />
              </video>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div animate={{ y:[0,8,0] }} transition={{ repeat:Infinity, duration:2 }}
        style={{ position:'absolute', bottom:28, left:'50%', transform:'translateX(-50%)', zIndex:3, color:'#475569', display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
        <span style={{ fontSize:11, letterSpacing:'0.8px', textTransform:'uppercase' }}>Scroll</span>
        <ChevronDown size={16} />
      </motion.div>

      <style>{`
        .blob {
          position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.18; z-index: 0; pointer-events: none;
          animation: blobFloat 12s ease-in-out infinite alternate;
        }
        .blob-purple { width:600px; height:600px; top:-100px; left:-150px; background:#a855f7; animation-duration:14s; }
        .blob-blue   { width:500px; height:500px; top:100px; right:-100px; background:#3b82f6; animation-duration:12s; animation-delay:2s; }
        .blob-pink   { width:400px; height:400px; bottom:-50px; left:30%; background:#ec4899; animation-duration:10s; animation-delay:4s; }
        .blob-orange { width:300px; height:300px; bottom:100px; right:20%; background:#f97316; opacity:0.1; animation-duration:16s; animation-delay:1s; }
        @keyframes blobFloat { 0%{ transform:translate(0,0) scale(1); } 100%{ transform:translate(40px,30px) scale(1.08); } }

        .hero-btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 13px 28px; font-size: 14px; font-weight: 700; color: #fff;
          background: linear-gradient(135deg, #a855f7 0%, #3b82f6 60%, #ec4899 100%);
          border-radius: 50px; border: none; cursor: pointer;
          box-shadow: 0 6px 24px rgba(168,85,247,0.35);
          transition: all 0.25s ease;
        }
        .hero-btn-primary:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(168,85,247,0.5); }

        .hero-btn-secondary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 13px 28px; font-size: 14px; font-weight: 600; color: #f1f5f9;
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);
          border-radius: 50px; cursor: pointer; backdrop-filter: blur(12px);
          transition: all 0.25s ease;
        }
        .hero-btn-secondary:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.25); transform: translateY(-3px); }

        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; text-align: center; }
          .hero-right { display: none; }
        }
      `}</style>
    </section>
  );
}
