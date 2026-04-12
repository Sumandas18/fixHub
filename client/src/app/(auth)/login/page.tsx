'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Loader2, Wrench, Home, Zap, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';

const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as any } },
};
const stagger: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login, isLoading: loading } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password }, 'user');
      toast.success('Successfully logged in!');
      router.push('/user/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0b0f19' }}>

      {/* Left — decorative panel */}
      <motion.div
        initial="hidden" animate="visible" variants={stagger}
        style={{
          width: '44%',
          minHeight: '100vh',
          background: 'linear-gradient(160deg, rgba(235,94,40,0.14) 0%, rgba(139,92,246,0.1) 60%, rgba(11,15,25,1) 100%)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 50px',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="usr-login-brand"
      >
        {/* Glow orbs */}
        <div style={{ position: 'absolute', top: -120, left: -120, width: 440, height: 440, background: 'radial-gradient(circle, rgba(235,94,40,0.1) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, right: -80, width: 320, height: 320, background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 360, width: '100%' }}>
          <motion.div variants={fadeUp} style={{ marginBottom: 28 }}>
            <Image src="/logo/FixHublogo.png" alt="FixHub" width={140} height={40} style={{ objectFit: 'contain' }} />
          </motion.div>

          <motion.p variants={fadeUp} style={{ fontSize: 15, color: '#64748b', lineHeight: 1.75, maxWidth: 320, marginBottom: 36 }}>
            Book trusted home and vehicle repair experts — fast, reliable, and right at your doorstep.
          </motion.p>

          <motion.div variants={stagger} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { icon: Home,    label: 'Home Services',    desc: 'Plumbing, carpentry, cleaning & more' },
              { icon: Zap,     label: 'Fast Booking',     desc: 'Book in under 2 minutes' },
              { icon: Shield,  label: 'Verified Experts', desc: 'Background-checked service providers' },
            ].map(({ icon: Icon, label, desc }) => (
              <motion.div
                key={label}
                variants={fadeUp}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 16px',
                  background: 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 12,
                  transition: 'border-color 0.2s',
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 9, background: 'linear-gradient(135deg, rgba(235,94,40,0.2), rgba(28,78,216,0.15))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#eb5e28', flexShrink: 0 }}>
                  <Icon size={16} />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9', marginBottom: 2 }}>{label}</p>
                  <p style={{ fontSize: 12, color: '#475569' }}>{desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Right — form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <motion.div initial="hidden" animate="visible" variants={stagger} style={{ width: '100%', maxWidth: 420 }}>
          <motion.div variants={fadeUp} style={{ marginBottom: 32 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: '#eb5e28', background: 'rgba(235,94,40,0.1)', border: '1px solid rgba(235,94,40,0.2)', borderRadius: 20, padding: '5px 14px', marginBottom: 16 }}>
              <Wrench size={12} /> Customer Login
            </div>
            <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 30, fontWeight: 800, color: '#f1f5f9', marginBottom: 6, letterSpacing: -0.5 }}>Welcome Back</h1>
            <p style={{ fontSize: 14, color: '#64748b' }}>Sign in to your FixHub account</p>
          </motion.div>

          <motion.form variants={fadeUp} onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 10, color: '#f1f5f9', fontSize: 14, outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s, box-shadow 0.2s' }}
                onFocus={e => { e.target.style.borderColor = 'rgba(235,94,40,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(235,94,40,0.08)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.09)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ width: '100%', padding: '12px 46px 12px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 10, color: '#f1f5f9', fontSize: 14, outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s, box-shadow 0.2s' }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(235,94,40,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(235,94,40,0.08)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.09)'; e.target.style.boxShadow = 'none'; }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#475569', cursor: 'pointer', display: 'flex', transition: 'color 0.15s' }}
                  onMouseOver={e => (e.currentTarget.style.color = '#eb5e28')}
                  onMouseOut={e => (e.currentTarget.style.color = '#475569')}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: 13, fontSize: 14, fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg, #eb5e28 0%, #c94f1c 100%)', border: 'none', borderRadius: 10, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.6 : 1, boxShadow: '0 4px 16px rgba(235,94,40,0.25)', fontFamily: 'inherit', transition: 'opacity 0.2s, transform 0.2s, box-shadow 0.2s', marginTop: 4 }}
            >
              {loading ? <><Loader2 size={16} className="al-spin" /> Signing in...</> : 'Sign In'}
            </button>
          </motion.form>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '28px 0' }} />
          <p style={{ textAlign: 'center', fontSize: 13, color: '#475569' }}>
            Don&apos;t have an account?{' '}
            <Link href="/register" style={{ color: '#eb5e28', fontWeight: 600 }}>Sign Up</Link>
            <span style={{ color: '#334155', margin: '0 8px' }}>·</span>
            <Link href="/admin/login" style={{ color: '#64748b', fontWeight: 500 }}>Admin</Link>
          </p>
        </motion.div>
      </div>

      {/* Hide brand panel on mobile */}
      <style>{`@media (max-width:768px) { .usr-login-brand { display: none !important; } }`}</style>
    </div>
  );
}
