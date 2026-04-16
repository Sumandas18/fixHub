'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Loader2, ArrowRight, Zap, CheckCircle } from 'lucide-react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useUserStore } from '@/store/userStore';
import { useRouter } from 'next/navigation';

/* ─── Icon map ────────────────────────────────────────────── */
const ICONS = ['🔌', '⚡', '🚿', '🧹', '🔐', '🛵', '🔧', '🏠', '❄️', '🚗', '🪟', '💡'];
const GRAD = [
  ['#a855f7', '#3b82f6'], ['#3b82f6', '#06b6d4'], ['#06b6d4', '#10b981'],
  ['#f97316', '#ef4444'], ['#ec4899', '#a855f7'], ['#10b981', '#3b82f6'],
  ['#f59e0b', '#f97316'], ['#8b5cf6', '#ec4899'], ['#3b82f6', '#a855f7'],
  ['#ef4444', '#f97316'], ['#06b6d4', '#a855f7'], ['#a855f7', '#ec4899'],
];

/* ─── Fallback (minimum 6) ────────────────────────────────── */
const FALLBACK = [
  { _id: 'f1', service_name: 'Home Appliance Repair', service_description: 'AC, refrigerator, washing machine & microwave repair by certified technicians.', is_active: true },
  { _id: 'f2', service_name: 'Electrical Services',   service_description: 'Wiring, switch fixing, fan installation & short circuit repairs done safely.', is_active: true },
  { _id: 'f3', service_name: 'Plumbing Services',     service_description: 'Pipe leakage, tap repair, bathroom fittings & tank cleaning done right.', is_active: true },
  { _id: 'f4', service_name: 'Home Cleaning',         service_description: 'Full home, sofa, bathroom & kitchen deep cleaning on any schedule.', is_active: true },
  { _id: 'f5', service_name: 'Home Maintenance',      service_description: 'Furniture repair, lock fixing & all small home maintenance tasks.', is_active: true },
  { _id: 'f6', service_name: 'Bike & Car Services',   service_description: 'Bike servicing, car repair, battery jumpstart & emergency roadside help.', is_active: true },
];

interface Service {
  _id: string;
  service_name: string;
  service_description: string;
  service_image_url?: string;
  is_active?: boolean;
}

const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as any } }),
};

const normalizeImageSrc = (src?: string) => {
  if (!src) return '';
  const trimmed = src.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')) {
    return trimmed;
  }
  return `/${trimmed.replace(/^\/+/, '')}`;
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading]   = useState(true);
  const [bookingSvc, setBookingSvc] = useState<string | null>(null);

  const { isAuthenticated, user } = useUserStore();
  const router = useRouter();

  const handleBook = async (serviceId: string) => {
    if (!isAuthenticated) {
        toast.error('Please log in as a customer to book services');
        router.push('/login');
        return;
    }
    if (user?.role !== 'customer' && user?.user_role !== 'customer') {
        toast.error('Only customers can book services');
        return;
    }
    
    setBookingSvc(serviceId);
    try {
        await api.post('/booking', {
            customerId: user.id || user._id || user.user_id,
            serviceId,
            status: 'pending'
        });
        toast.success('Booking request sent');
    } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to submit booking');
    } finally {
        setBookingSvc(null);
    }
  };

  useEffect(() => {
    api.get('/service')
      .then(res => {
        const data = res.data.data || res.data.services || res.data;
        if (Array.isArray(data)) {
          // Only show active services to customers
          const activeData = data.filter((s: any) => s.is_active !== false);
          if (activeData.length >= 6) {
            setServices(activeData);
          } else if (activeData.length > 0) {
            const merged = [...activeData];
            FALLBACK.forEach(f => {
              if (merged.length < 6) merged.push(f);
            });
            setServices(merged);
          } else {
            setServices(FALLBACK);
          }
        } else {
          setServices(FALLBACK);
        }
      })
      .catch(() => setServices(FALLBACK))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Header />
      <main style={{ minHeight: '100vh', background: '#0B0F1A', paddingTop: 80 }}>

        {/* ── Page Hero ── */}
        <section style={{ position: 'relative', padding: '70px 5% 60px', overflow: 'hidden' }}>
          <div style={{ position:'absolute', top:-200, right:-100, width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle,rgba(168,85,247,0.1) 0%,transparent 65%)', filter:'blur(60px)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', bottom:-100, left:-100, width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle,rgba(59,130,246,0.08) 0%,transparent 65%)', filter:'blur(60px)', pointerEvents:'none' }} />

          <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}
            style={{ textAlign:'center', position:'relative', zIndex:1 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'5px 16px', background:'rgba(168,85,247,0.08)', border:'1px solid rgba(168,85,247,0.2)', borderRadius:50, marginBottom:18 }}>
              <Zap size={12} color="#a855f7" />
              <span style={{ fontSize:11, fontWeight:700, color:'#a855f7', letterSpacing:'0.8px', textTransform:'uppercase' }}>All Services</span>
            </div>
            <h1 style={{ fontFamily:'Outfit,sans-serif', fontSize:'clamp(2rem,5vw,3rem)', fontWeight:800, color:'#fff', marginBottom:14, letterSpacing:-0.5 }}>
              Professional Services{' '}
              <span style={{ background:'linear-gradient(90deg,#a855f7,#3b82f6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>On Demand</span>
            </h1>
            <p style={{ fontSize:16, color:'#64748b', maxWidth:520, margin:'0 auto' }}>
              Browse all available repair &amp; maintenance services. Book a verified expert in minutes.
            </p>
          </motion.div>
        </section>

        {/* ── Services Grid ── */}
        <section style={{ padding: '0 5% 100px', maxWidth: 1200, margin: '0 auto' }}>
          {loading ? (
            <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:12, padding:'80px 0', color:'#a855f7' }}>
              <Loader2 size={22} className="al-spin" />
              <span style={{ fontSize:15, color:'#64748b' }}>Loading services…</span>
            </div>
          ) : (
            <>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:24 }}>
                {services.map((svc, idx) => {
                  const [c1, c2] = GRAD[idx % GRAD.length];
                  const icon = ICONS[idx % ICONS.length];
                  return (
                    <motion.div
                      key={svc._id}
                      custom={idx % 3}
                      variants={fadeUp}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      whileHover={{ y: -6, boxShadow: `0 20px 50px rgba(0,0,0,0.4), 0 0 20px ${c1}18` }}
                      style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:20, overflow:'hidden', display:'flex', flexDirection:'column', transition:'all 0.3s ease', cursor:'default' }}
                    >
                      {/* Icon banner */}
                      <div style={{ height:130, background:`linear-gradient(135deg,${c1}18,${c2}14)`, borderBottom:'1px solid rgba(255,255,255,0.04)', display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
                        {normalizeImageSrc(svc.service_image_url) ? (
                          <Image src={normalizeImageSrc(svc.service_image_url)} alt={svc.service_name} fill style={{ objectFit:'cover', opacity:0.7 }} />
                        ) : (
                          <div style={{ width:64, height:64, borderRadius:18, background:`linear-gradient(135deg,${c1}30,${c2}20)`, border:`1px solid ${c1}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:30 }}>
                            {icon}
                          </div>
                        )}
                        {/* Available badge */}
                        {svc.is_active !== false && (
                          <div style={{ position:'absolute', top:12, right:12, display:'flex', alignItems:'center', gap:5, background:'rgba(74,222,128,0.12)', border:'1px solid rgba(74,222,128,0.25)', borderRadius:20, padding:'3px 10px' }}>
                            <CheckCircle size={11} color="#4ade80" />
                            <span style={{ fontSize:10, fontWeight:700, color:'#4ade80' }}>Available</span>
                          </div>
                        )}
                      </div>

                      {/* Body */}
                      <div style={{ padding:'22px 22px 20px', flex:1, display:'flex', flexDirection:'column' }}>
                        <h3 style={{ fontSize:16, fontWeight:700, color:'#f1f5f9', marginBottom:10, lineHeight:1.3 }}>{svc.service_name}</h3>
                        <p style={{ fontSize:13, color:'#64748b', lineHeight:1.65, flex:1, marginBottom:20 }}>
                          {svc.service_description
                            ? svc.service_description.length > 100
                              ? svc.service_description.slice(0, 100) + '…'
                              : svc.service_description
                            : 'Professional service available on demand.'}
                        </p>
                        <button
                          onClick={() => handleBook(svc._id)}
                          disabled={bookingSvc === svc._id}
                          style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'9px 18px', fontSize:13, fontWeight:700, color:'#fff', background:`linear-gradient(135deg,${c1},${c2})`, border: 'none', cursor: bookingSvc === svc._id ? 'not-allowed' : 'pointer', borderRadius:50, textDecoration:'none', boxShadow:`0 4px 14px ${c1}30`, transition:'all 0.25s ease', alignSelf:'flex-start' }}
                        >
                          {bookingSvc === svc._id ? <Loader2 size={13} className="al-spin" /> : <>Book Now <ArrowRight size={13} /></>}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <motion.div initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.5, delay:0.2 }}
                style={{ textAlign:'center', marginTop:52, color:'#475569', fontSize:14 }}>
                {services.length} services available &mdash;{' '}
                <Link href="/login" style={{ color:'#a855f7', fontWeight:700 }}>Login to book</Link>
              </motion.div>
            </>
          )}
        </section>
      </main>

      <style>{`
        @media (max-width: 900px) {
          .services-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media (max-width: 600px) {
          .services-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <Footer />
    </>
  );
}
