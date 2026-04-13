'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import { Shield, Users, Zap, Target, Heart, Globe } from 'lucide-react';

const values = [
  { icon: Shield, title: 'Trust & Safety',   desc: 'Every provider is background verified, trained, and insured.',  color: '#a855f7' },
  { icon: Zap,    title: 'Speed',             desc: 'Bookings confirmed instantly. Pros arrive within 60 minutes.',   color: '#3b82f6' },
  { icon: Heart,  title: 'Customer First',    desc: 'We measure success by your satisfaction, not just completions.', color: '#ec4899' },
  { icon: Globe,  title: 'Nationwide Reach',  desc: 'Serving 50+ cities and growing — bringing quality to everyone.',color: '#f97316' },
  { icon: Users,  title: 'Community',         desc: 'Empowering local technicians to build sustainable livelihoods.', color: '#10b981' },
  { icon: Target, title: 'Excellence',        desc: 'We use data and feedback to continuously improve every job.',    color: '#f59e0b' },
];

const fadeUp = {
  hidden:  { opacity:0, y:30 },
  visible: { opacity:1, y:0, transition:{ duration:0.6 } },
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main style={{ background:'#0B0F1A', minHeight:'100vh', paddingTop:80 }}>

        {/* Hero */}
        <section style={{ position:'relative', padding:'100px 5% 80px', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:-200, right:-200, width:700, height:700, borderRadius:'50%', background:'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 65%)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', bottom:-100, left:-100, width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 65%)', pointerEvents:'none' }} />

          <motion.div initial="hidden" animate="visible" variants={{ visible:{ transition:{ staggerChildren:0.12 } } }}
            style={{ maxWidth:780, margin:'0 auto', textAlign:'center', position:'relative', zIndex:1 }}>
            <motion.div variants={fadeUp} style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'5px 16px', background:'rgba(168,85,247,0.08)', border:'1px solid rgba(168,85,247,0.2)', borderRadius:50, marginBottom:20 }}>
              <span style={{ fontSize:11, fontWeight:700, color:'#a78bfa', letterSpacing:'0.8px', textTransform:'uppercase' }}>Our Story</span>
            </motion.div>
            <motion.h1 variants={fadeUp} style={{ fontFamily:'Outfit,sans-serif', fontSize:'clamp(2.2rem,5vw,3.5rem)', fontWeight:800, color:'#fff', lineHeight:1.15, marginBottom:20, letterSpacing:-0.5 }}>
              Built to Make{' '}
              <span style={{ background:'linear-gradient(90deg,#a855f7,#3b82f6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                Repairs Effortless
              </span>
            </motion.h1>
            <motion.p variants={fadeUp} style={{ fontSize:17, color:'#64748b', lineHeight:1.8, maxWidth:620, margin:'0 auto 36px' }}>
              FixHub was founded with one mission: make professional home and vehicle repair services accessible, fast, and completely stress-free for every household.
            </motion.p>
            <motion.p variants={fadeUp} style={{ fontSize:15, color:'#475569', lineHeight:1.8, maxWidth:620, margin:'0 auto' }}>
              We saw that finding reliable, fairly-priced repair professionals was broken — plagued by scams, no-shows, and inconsistent quality. FixHub changes that by building a trusted marketplace where customers get transparent pricing and vetted experts, while skilled technicians get steady, well-paying work.
            </motion.p>
          </motion.div>
        </section>

        {/* Values */}
        <section style={{ padding:'80px 5%', maxWidth:1200, margin:'0 auto' }}>
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} style={{ textAlign:'center', marginBottom:52 }}>
            <h2 style={{ fontFamily:'Outfit,sans-serif', fontSize:'clamp(1.6rem,3.5vw,2.4rem)', fontWeight:800, color:'#fff', marginBottom:12 }}>
              Our <span style={{ background:'linear-gradient(90deg,#ec4899,#f97316)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Core Values</span>
            </h2>
            <p style={{ color:'#64748b', fontSize:15 }}>The principles that guide every decision we make at FixHub.</p>
          </motion.div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:20 }}>
            {values.map((v, i) => (
              <motion.div key={v.title}
                initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.08 }}
                whileHover={{ y:-5, borderColor:`${v.color}30` }}
                style={{ padding:'26px 24px', background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:18, display:'flex', gap:16, alignItems:'flex-start', transition:'all 0.3s ease' }}>
                <div style={{ width:44, height:44, borderRadius:12, background:`${v.color}15`, border:`1px solid ${v.color}25`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <v.icon size={20} color={v.color} />
                </div>
                <div>
                  <h3 style={{ fontSize:15, fontWeight:700, color:'#f1f5f9', marginBottom:8 }}>{v.title}</h3>
                  <p style={{ fontSize:13.5, color:'#64748b', lineHeight:1.6 }}>{v.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding:'60px 5% 100px', textAlign:'center' }}>
          <motion.div initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }}>
            <p style={{ fontSize:16, color:'#64748b', marginBottom:24 }}>Ready to experience the difference?</p>
            <Link href="/login" style={{ display:'inline-flex', alignItems:'center', gap:10, padding:'14px 36px', fontSize:15, fontWeight:700, color:'#fff', background:'linear-gradient(135deg,#a855f7,#3b82f6)', borderRadius:50, boxShadow:'0 6px 24px rgba(168,85,247,0.3)', textDecoration:'none', transition:'all 0.25s ease' }}>
              Get Started Free
            </Link>
          </motion.div>
        </section>
      </main>
      <Footer />
    </>
  );
}
