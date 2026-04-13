'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Loader2, ShieldCheck, BarChart3, Users, CheckCircle, Calendar } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import './admin-login.css';

import type { Variants } from 'framer-motion';

const features = [
  { icon: BarChart3, label: 'Analytics Dashboard', desc: 'Real-time platform insights' },
  { icon: Users,     label: 'User Management',     desc: 'Customers & providers control' },
  { icon: CheckCircle, label: 'Provider Approvals', desc: 'Review and verify providers' },
  { icon: Calendar,  label: 'Booking Control',     desc: 'Full booking visibility' },
];

const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as any } },
};
const stagger: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading: loading } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email: form.email, password: form.password }, 'admin');
      toast.success('Welcome back, Admin!');
      router.replace('/admin/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    }
  };

  return (
    <div className="al-page">
      {/* Left side — branding */}
      <motion.div className="al-brand" initial="hidden" animate="visible" variants={stagger}>
        <div className="al-brand-inner">
          <motion.div variants={fadeUp} className="al-brand-logo-wrap">
            <Image src="/logo/FixHublogo.png" alt="FixHub" width={140} height={40} style={{ objectFit: 'contain' }} />
          </motion.div>

          <motion.p variants={fadeUp} className="al-brand-tagline">
            Command centre for managing services, providers, customers, and bookings across the platform.
          </motion.p>

          <motion.div variants={stagger} className="al-features-list">
            {features.map(({ icon: Icon, label, desc }) => (
              <motion.div key={label} variants={fadeUp} className="al-feature-item">
                <div className="al-feature-icon">
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

      {/* Right side — form */}
      <div className="al-form-side">
        <motion.div className="al-card" initial="hidden" animate="visible" variants={stagger}>
          <motion.div variants={fadeUp} className="al-card-top">
            <div className="al-role-badge">
              <ShieldCheck size={13} style={{ display: 'inline', marginRight: 5 }} />
              Admin Panel
            </div>
            <h1 className="al-title">Sign In</h1>
            <p className="al-subtitle">Enter your administrator credentials</p>
          </motion.div>

          <motion.form variants={fadeUp} onSubmit={handleSubmit} className="al-form">
            <div className="al-field">
              <label className="al-label" htmlFor="admin-email">Email Address</label>
              <input
                id="admin-email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="admin@fixhub.com"
                className="al-input"
              />
            </div>

            <div className="al-field">
              <label className="al-label" htmlFor="admin-password">Password</label>
              <div className="al-input-wrap">
                <input
                  id="admin-password"
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

            <button id="admin-login-submit" type="submit" className="al-submit" disabled={loading}>
              {loading ? (
                <><Loader2 size={16} className="al-spin" /> Signing In...</>
              ) : 'Sign In to Admin Panel'}
            </button>
          </motion.form>

          <div className="al-divider" />
          <p className="al-footer">
            <a href="/admin" className="al-link">← Return to Admin Home</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
