'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Loader2, Wrench, CalendarDays, Star, DollarSign, Zap } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import '../../admin/login/admin-login.css';

const features = [
  { icon: CalendarDays, label: 'Manage Bookings',  desc: 'Accept, track & complete jobs' },
  { icon: DollarSign,   label: 'Track Earnings',   desc: 'Monitor your revenue in real-time' },
  { icon: Star,         label: 'View Ratings',     desc: 'See customer feedback & reviews' },
  { icon: Wrench,       label: 'Update Services',  desc: 'Edit your offerings & availability' },
];

const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as any } },
};
const stagger: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function ProviderLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
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

  return (
    <div className="al-page">
      {/* Left — branding (blue accent) */}
      <motion.div
        className="al-brand"
        style={{ background: 'linear-gradient(160deg, rgba(28,78,216,0.2) 0%, rgba(124,58,237,0.12) 50%, rgba(11,15,25,1) 100%)' }}
        initial="hidden" animate="visible" variants={stagger}
      >
        <div className="al-brand-inner">
          <motion.div variants={fadeUp} className="al-brand-logo-wrap">
            <Image src="/logo/FixHublogo.png" alt="FixHub" width={140} height={40} style={{ objectFit: 'contain' }} />
          </motion.div>

          <motion.p variants={fadeUp} className="al-brand-tagline">
            Manage your service requests, track earnings, and control your schedule in one place.
          </motion.p>

          <motion.div variants={stagger} className="al-features-list">
            {features.map(({ icon: Icon, label, desc }) => (
              <motion.div key={label} variants={fadeUp} className="al-feature-item">
                <div className="al-feature-icon" style={{ background: 'linear-gradient(135deg, rgba(28,78,216,0.2), rgba(124,58,237,0.15))', color: '#60a5fa' }}>
                  <Icon size={16} />
                </div>
                <div>
                  <p className="al-feature-label">{label}</p>
                  <p className="al-feature-desc">{desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Right — form */}
      <div className="al-form-side">
        <motion.div className="al-card" initial="hidden" animate="visible" variants={stagger}>
          <motion.div variants={fadeUp} className="al-card-top">
            <div className="al-role-badge" style={{ color: '#60a5fa', background: 'rgba(96,165,250,0.1)', borderColor: 'rgba(96,165,250,0.2)' }}>
              <Zap size={13} style={{ display: 'inline', marginRight: 5 }} />
              Provider Panel
            </div>
            <h1 className="al-title">Sign In</h1>
            <p className="al-subtitle">Enter your provider credentials</p>
          </motion.div>

          <motion.form variants={fadeUp} onSubmit={handleSubmit} className="al-form">
            <div className="al-field">
              <label className="al-label" htmlFor="prov-email">Email Address</label>
              <input
                id="prov-email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="provider@example.com"
                className="al-input"
                style={{ borderColor: 'rgba(96,165,250,0.1)' }}
              />
            </div>

            <div className="al-field">
              <label className="al-label" htmlFor="prov-password">Password</label>
              <div className="al-input-wrap">
                <input
                  id="prov-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="al-input"
                />
                <button type="button" className="al-eye-btn" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="al-submit"
              disabled={loading}
              style={{ background: 'linear-gradient(135deg, #1c4ed8 0%, #7c3aed 100%)', boxShadow: '0 4px 16px rgba(28,78,216,0.3)' }}
            >
              {loading ? (
                <><Loader2 size={16} className="al-spin" /> Signing In...</>
              ) : 'Sign In to Provider Area'}
            </button>
          </motion.form>

          <div className="al-divider" />
          <p className="al-footer">
            Not a provider?&nbsp;
            <a href="/login" className="al-link">Customer Login</a>
            <span style={{ color: '#334155', margin: '0 6px' }}>·</span>
            <a href="/admin/login" className="al-link">Admin Login</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
