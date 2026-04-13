'use client';
import { motion } from 'framer-motion';
import { ShieldCheck, Clock, Star, Headphones, CreditCard, MapPin } from 'lucide-react';

const reasons = [
  { icon: ShieldCheck, title: 'Verified Professionals',  desc: 'Every provider is background-checked, trained, and certified.',        color: '#a855f7' },
  { icon: Clock,       title: 'Fast Response Time',       desc: 'Get a professional to your door in as little as 60 minutes.',          color: '#3b82f6' },
  { icon: Star,        title: 'Top-Rated Quality',        desc: '4.9★ average rating across all 50,000+ completed jobs.',               color: '#f59e0b' },
  { icon: Headphones,  title: '24/7 Customer Support',   desc: 'Our support team is available round the clock to assist you.',         color: '#ec4899' },
  { icon: CreditCard,  title: 'Transparent Pricing',     desc: 'No hidden fees. See the exact price before you confirm your booking.', color: '#10b981' },
  { icon: MapPin,      title: 'Nationwide Coverage',     desc: 'We operate across 50+ cities and expand regularly.',                   color: '#f97316' },
];

const fadeUp = {
  hidden:  { opacity:0, y:30 },
  visible: { opacity:1, y:0, transition:{ duration:0.6 } },
};

export default function WhyUs() {
  return (
    <section style={{ padding:'100px 5%', background:'#0d1120', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', bottom:-100, left:-100, width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(236,72,153,0.06) 0%, transparent 65%)', pointerEvents:'none' }} />

      <motion.div initial="hidden" whileInView="visible" viewport={{ once:true }} variants={{ visible:{ transition:{ staggerChildren:0.1 } } }}
        style={{ maxWidth:1200, margin:'0 auto' }}>

        <motion.div variants={fadeUp} style={{ textAlign:'center', marginBottom:60 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'5px 16px', background:'rgba(236,72,153,0.08)', border:'1px solid rgba(236,72,153,0.2)', borderRadius:50, marginBottom:16 }}>
            <span style={{ fontSize:11, fontWeight:700, color:'#f472b6', letterSpacing:'0.8px', textTransform:'uppercase' }}>Why Choose Us</span>
          </div>
          <h2 style={{ fontFamily:'Outfit,sans-serif', fontSize:'clamp(1.8rem,4vw,2.8rem)', fontWeight:800, color:'#fff', marginBottom:14 }}>
            The <span style={{ background:'linear-gradient(90deg,#ec4899,#a855f7)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>FixHub Difference</span>
          </h2>
          <p style={{ color:'#64748b', fontSize:16, maxWidth:500, margin:'0 auto' }}>We don't just connect you with repairmen — we guarantee world-class service.</p>
        </motion.div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:20 }}>
          {reasons.map((r) => (
            <motion.div key={r.title} variants={fadeUp} whileHover={{ y:-5, borderColor:`${r.color}40` }}
              style={{ padding:'28px 26px', background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:18, backdropFilter:'blur(12px)', display:'flex', gap:18, alignItems:'flex-start', transition:'all 0.3s ease', cursor:'default' }}>
              <div style={{ width:46, height:46, borderRadius:13, background:`${r.color}15`, border:`1px solid ${r.color}25`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <r.icon size={21} color={r.color} />
              </div>
              <div>
                <h3 style={{ fontSize:15, fontWeight:700, color:'#f1f5f9', marginBottom:8 }}>{r.title}</h3>
                <p style={{ fontSize:13.5, color:'#64748b', lineHeight:1.65 }}>{r.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
