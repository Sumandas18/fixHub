'use client';
import { motion } from 'framer-motion';
import { Search, UserCheck, Wrench, CheckCircle } from 'lucide-react';

const steps = [
  { num:'01', icon: Search,     title: 'Browse Services',   desc: 'Choose from a wide range of home and vehicle repair services tailored to your needs.', color: '#a855f7' },
  { num:'02', icon: UserCheck,  title: 'Pick a Pro',        desc: 'View verified provider profiles, ratings, and availability. Select your preferred expert.', color: '#3b82f6' },
  { num:'03', icon: Wrench,     title: 'Get it Done',       desc: 'Your pro arrives on time, completes the job, and you pay securely in-app.', color: '#ec4899' },
  { num:'04', icon: CheckCircle,title: 'Rate & Review',     desc: 'Share your experience to help other customers and reward great service providers.', color: '#f97316' },
];

const fadeUp = {
  hidden:  { opacity:0, y:30 },
  visible: { opacity:1, y:0, transition:{ duration:0.6, ease:[0.22,1,0.36,1] } },
};

export default function HowItWorks() {
  return (
    <section id="how-it-works" style={{ padding:'100px 5%', background:'#0B0F1A', position:'relative', overflow:'hidden' }}>
      {/* Subtle gradient */}
      <div style={{ position:'absolute', top:-200, right:-200, width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle, rgba(168,85,247,0.07) 0%, transparent 65%)', pointerEvents:'none' }} />

      <motion.div initial="hidden" whileInView="visible" viewport={{ once:true }} variants={{ visible:{ transition:{ staggerChildren:0.12 } } }}
        style={{ maxWidth:1200, margin:'0 auto' }}>

        {/* Header */}
        <motion.div variants={fadeUp} style={{ textAlign:'center', marginBottom:64 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'5px 16px', background:'rgba(59,130,246,0.08)', border:'1px solid rgba(59,130,246,0.2)', borderRadius:50, marginBottom:16 }}>
            <span style={{ fontSize:11, fontWeight:700, color:'#60a5fa', letterSpacing:'0.8px', textTransform:'uppercase' }}>Simple Process</span>
          </div>
          <h2 style={{ fontFamily:'Outfit,sans-serif', fontSize:'clamp(1.8rem,4vw,2.8rem)', fontWeight:800, color:'#fff', marginBottom:14, letterSpacing:-0.5 }}>
            How <span style={{ background:'linear-gradient(90deg,#3b82f6,#a855f7)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>FixHub Works</span>
          </h2>
          <p style={{ color:'#64748b', fontSize:16, maxWidth:500, margin:'0 auto' }}>Four simple steps to get any home or vehicle repair done professionally.</p>
        </motion.div>

        {/* Steps grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:24, position:'relative' }}>
          {/* Connecting line (desktop) */}
          <div style={{ position:'absolute', top:52, left:'12.5%', right:'12.5%', height:1, background:'linear-gradient(90deg, #a855f7, #3b82f6, #ec4899, #f97316)', opacity:0.2, zIndex:0 }} />

          {steps.map((s, i) => (
            <motion.div key={s.num} variants={fadeUp} whileHover={{ y:-6, boxShadow:`0 20px 50px rgba(0,0,0,0.4), 0 0 20px ${s.color}20` }}
              style={{ position:'relative', zIndex:1, padding:28, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:20, backdropFilter:'blur(12px)', transition:'all 0.3s ease', cursor:'default' }}>
              {/* Number badge */}
              <div style={{ fontSize:11, fontWeight:800, color:s.color, letterSpacing:'1px', marginBottom:16, fontFamily:'Outfit,sans-serif' }}>{s.num}</div>
              {/* Icon */}
              <div style={{ width:48, height:48, borderRadius:14, background:`${s.color}18`, border:`1px solid ${s.color}30`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:18 }}>
                <s.icon size={22} color={s.color} />
              </div>
              <h3 style={{ fontSize:17, fontWeight:700, color:'#f1f5f9', marginBottom:10 }}>{s.title}</h3>
              <p style={{ fontSize:14, color:'#64748b', lineHeight:1.65 }}>{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
