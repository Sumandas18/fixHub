'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Loader2, Zap, CalendarDays, Star, DollarSign, Wrench, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import '../../admin/login/admin-login.css';

const fadeUp: Variants = {
  hidden:   { opacity: 0, y: 22 },
  visible:  { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as any } },
};
const stagger: Variants = {
  hidden:   {},
  visible:  { transition: { staggerChildren: 0.09 } },
};

const features = [
  { icon: CalendarDays, label: 'Manage Bookings',  desc: 'Accept, track & complete jobs easily' },
  { icon: DollarSign,   label: 'Track Earnings',   desc: 'Monitor revenue in real-time' },
  { icon: Star,         label: 'View Ratings',     desc: 'Read customer feedback & reviews' },
  { icon: Wrench,       label: 'Update Services',  desc: 'Edit offerings & availability' },
];

export default function ProviderLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { login, isLoading: loading } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email: form.email, password: form.password }, 'provider');
      toast.success('Welcome back, Provider!');
      router.replace('/provider/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    }
  };

  const inputBase = (field: string) => ({
    width: '100%',
    padding: '13px 16px',
    background: 'rgba(255,255,255,0.05)',
    border: `1px solid ${focusedField === field ? 'rgba(96,165,250,0.55)' : 'rgba(255,255,255,0.09)'}`,
    borderRadius: 12,
    color: '#f1f5f9',
    fontSize: 14,
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxShadow: focusedField === field ? '0 0 0 3px rgba(59,130,246,0.12)' : 'none',
    boxSizing: 'border-box' as const,
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#080c14', position: 'relative', overflow: 'hidden' }}>

      {/* ── Animated blob background ── */}
      <div style={{ position:'absolute', top:-200, left:-200, width:700, height:700, borderRadius:'50%', background:'radial-gradient(circle, rgba(124,58,237,0.13) 0%, transparent 65%)', filter:'blur(60px)', animation:'blobA 14s ease-in-out infinite alternate', pointerEvents:'none', zIndex:0 }} />
      <div style={{ position:'absolute', bottom:-150, right:-150, width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle, rgba(28,78,216,0.13) 0%, transparent 65%)', filter:'blur(60px)', animation:'blobB 12s ease-in-out infinite alternate', pointerEvents:'none', zIndex:0 }} />
      <div style={{ position:'absolute', top:'40%', left:'50%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(236,72,153,0.06) 0%, transparent 65%)', filter:'blur(40px)', animation:'blobC 16s ease-in-out infinite alternate', pointerEvents:'none', zIndex:0 }} />

      {/* ── LEFT PANEL ── */}
      <motion.div
        initial="hidden" animate="visible" variants={stagger}
        className="login-left-panel"
        style={{
          width: '44%', minHeight: '100vh', position: 'relative', zIndex: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '60px 48px',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{ position:'absolute', inset:0, background:'rgba(255,255,255,0.015)', backdropFilter:'blur(2px)', zIndex:0 }} />

        <div style={{ position:'relative', zIndex:1, maxWidth:380, width:'100%' }}>
          <motion.div variants={fadeUp} style={{ marginBottom: 36 }}>
            <Link href="/">
              <Image src="/logo/FixHublogo.png" alt="FixHub" width={48} height={48} style={{ borderRadius:'50%', marginBottom:20 }} />
            </Link>
            <h1 style={{ fontFamily:'Outfit,sans-serif', fontSize:'clamp(1.8rem,3vw,2.4rem)', fontWeight:800, color:'#fff', letterSpacing:-0.5, marginBottom:10, lineHeight:1.15 }}>
              Provider <span style={{ background:'linear-gradient(90deg,#60a5fa,#a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Portal</span>
            </h1>
            <p style={{ fontSize:14, color:'#64748b', lineHeight:1.7 }}>
              Manage your service requests, track earnings, and grow your business.
            </p>
          </motion.div>

          <motion.div variants={stagger} style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {features.map(({ icon: Icon, label, desc }) => (
              <motion.div
                key={label} variants={fadeUp}
                whileHover={{ scale: 1.03, boxShadow:'0 0 20px rgba(96,165,250,0.12)' }}
                style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 18px', background:'rgba(255,255,255,0.04)', backdropFilter:'blur(12px)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, cursor:'default', transition:'all 0.25s ease' }}
              >
                <div style={{ width:38, height:38, borderRadius:10, background:'linear-gradient(135deg,rgba(28,78,216,0.2),rgba(124,58,237,0.15))', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Icon size={17} color="#60a5fa" />
                </div>
                <div>
                  <p style={{ fontSize:13, fontWeight:700, color:'#f1f5f9', marginBottom:2 }}>{label}</p>
                  <p style={{ fontSize:12, color:'#475569' }}>{desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* ── RIGHT PANEL ── */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 24px', position:'relative', zIndex:1 }}>
        <motion.div
          initial={{ opacity:0, y:28 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:0.55, ease:[0.22,1,0.36,1] }}
          style={{ width:'100%', maxWidth:420, background:'rgba(255,255,255,0.04)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:24, padding:'40px 36px', boxShadow:'0 24px 64px rgba(0,0,0,0.4)' }}
        >
          {/* Badge */}
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:11, fontWeight:700, letterSpacing:'0.8px', textTransform:'uppercase', color:'#60a5fa', background:'rgba(96,165,250,0.1)', border:'1px solid rgba(96,165,250,0.2)', borderRadius:20, padding:'5px 14px', marginBottom:20 }}>
            <Zap size={12} /> Provider Login
          </div>
          <h2 style={{ fontFamily:'Outfit,sans-serif', fontSize:26, fontWeight:800, color:'#f1f5f9', marginBottom:6, letterSpacing:-0.5 }}>Sign In</h2>
          <p style={{ fontSize:13, color:'#64748b', marginBottom:28 }}>Enter your provider credentials to continue</p>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:18 }}>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#94a3b8', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.5px' }}>Email Address</label>
              <input
                id="prov-email" type="email" required
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="provider@example.com" style={inputBase('email')}
                onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
              />
            </div>

            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#94a3b8', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.5px' }}>Password</label>
              <div style={{ position:'relative' }}>
                <input
                  id="prov-password" type={showPassword ? 'text' : 'password'} required
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••" style={{ ...inputBase('password'), paddingRight: 46 }}
                  onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position:'absolute', right:13, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'#475569', cursor:'pointer', display:'flex', transition:'color 0.15s' }}
                  onMouseOver={(e) => (e.currentTarget.style.color = '#60a5fa')}
                  onMouseOut={(e) => (e.currentTarget.style.color = '#475569')}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit" disabled={loading}
              whileHover={{ scale: 1.03, boxShadow:'0 8px 28px rgba(28,78,216,0.45)' }}
              whileTap={{ scale: 0.97 }}
              style={{ width:'100%', padding:'13px', fontSize:14, fontWeight:700, color:'#fff', background:'linear-gradient(135deg, #1c4ed8 0%, #7c3aed 100%)', border:'none', borderRadius:12, cursor: loading ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, opacity: loading ? 0.65 : 1, boxShadow:'0 4px 18px rgba(28,78,216,0.3)', fontFamily:'inherit', transition:'opacity 0.2s', marginTop:4 }}
            >
              {loading ? <><Loader2 size={16} className="al-spin" /> Signing in...</> : <>Sign In <ArrowRight size={15} /></>}
            </motion.button>
          </form>

          <div style={{ height:1, background:'rgba(255,255,255,0.06)', margin:'24px 0' }} />
          <p style={{ textAlign:'center', fontSize:13, color:'#475569' }}>
            Not a provider?{' '}
            <Link href="/login" style={{ color:'#60a5fa', fontWeight:700 }}>Customer Login</Link>
          </p>
        </motion.div>
      </div>

      <style>{`
        @keyframes blobA { 0%{transform:translate(0,0) scale(1)} 100%{transform:translate(60px,40px) scale(1.1)} }
        @keyframes blobB { 0%{transform:translate(0,0) scale(1)} 100%{transform:translate(-50px,-40px) scale(1.08)} }
        @keyframes blobC { 0%{transform:translate(-50%,0) scale(1)} 100%{transform:translate(-50%,30px) scale(1.05)} }
        @media(max-width:768px){ .login-left-panel{ display:none !important; } }
      `}</style>
    </div>
  );
}
