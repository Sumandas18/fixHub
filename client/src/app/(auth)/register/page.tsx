'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, EyeOff, Loader2, User, Mail, Phone, Lock, ChevronDown,
  Check, X, Upload, ArrowRight
} from 'lucide-react';
import api from '@/lib/api';

/* ─── Types ──────────────────────────────────────────────── */
interface Service { _id: string; service_name: string; }

/* ─── Animation variants ─────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] as any } }),
};

/* ─── Shared input style builder ─────────────────────────── */
const inp = (focused: boolean, accentRgb = '168,85,247') => ({
  width: '100%',
  padding: '12px 15px',
  background: 'rgba(255,255,255,0.05)',
  border: `1px solid ${focused ? `rgba(${accentRgb},0.55)` : 'rgba(255,255,255,0.09)'}`,
  borderRadius: 12,
  color: '#f1f5f9',
  fontSize: 14,
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  boxShadow: focused ? `0 0 0 3px rgba(${accentRgb},0.12)` : 'none',
  boxSizing: 'border-box' as const,
});

const label = {
  display: 'block' as const,
  fontSize: 11,
  fontWeight: 700 as const,
  color: '#64748b',
  marginBottom: 7,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.6px',
};

/* ═══════════════════════════════════════════════════════════ */
export default function RegisterPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* role tab */
  const [role, setRole] = useState<'customer' | 'provider'>('customer');

  /* shared fields */
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);

  /* provider extras */
  const [experience, setExperience] = useState('');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docPreview, setDocPreview] = useState<string | null>(null);

  /* service selection */
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [selectedService, setSelectedService] = useState<string>('');
  const [dropOpen, setDropOpen] = useState(false);

  /* ui */
  const [focused, setFocused] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /* ── Fetch services on provider tab open ──────────────────── */
  useEffect(() => {
    if (role !== 'provider') return;
    if (services.length > 0) return; // already fetched
    setServicesLoading(true);
    api.get('/service')
      .then(res => {
        const data = res.data.data || res.data.services || res.data;
        if (Array.isArray(data)) {
          // Only show active services in provider registration dropdown
          const activeServices = data.filter((s: any) => s.is_active !== false);
          setServices(activeServices);
        }
      })
      .catch(() => { })
      .finally(() => setServicesLoading(false));
  }, [role]);

  /* ── Image pick ──────────────────────────────────────────── */
  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 3 * 1024 * 1024) { toast.error('File must be under 3MB'); return; }
    setDocFile(f);
    setDocPreview(URL.createObjectURL(f));
  };

  /* ── Submit ──────────────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // Prevent duplicate API calls
    if (password !== confirmPw) { toast.error('Passwords do not match!'); return; }

    setLoading(true);
    try {
      if (role === 'customer') {
        const res = await api.post('/customer/register', {
          user_name: name,
          user_email: email,
          user_contact: phone,
          user_password: password,
          user_role: 'customer',
          user_address: {
            houseOrFlatNo: '1', street: 'Main Street', area: 'Downtown',
            city: 'Cityville', state: 'State', pinCode: '000000',
          },
        });
        if (res.data.success || res.status === 201) {
          toast.success('Account created! Please verify your email.');
          router.push(`/verify?email=${encodeURIComponent(email)}&userId=${res.data.data._id}`);
        } else toast.error(res.data.message || 'Registration failed');

      } else {
        if (!selectedService) { toast.error('Please select a service'); setLoading(false); return; }
        if (!docFile) { toast.error('Please upload a document / profile image'); setLoading(false); return; }

        const fd = new FormData();
        fd.append('user_name', name);
        fd.append('user_email', email);
        fd.append('user_contact', phone);
        fd.append('user_password', password);
        fd.append('service_id', selectedService);
        fd.append('experience', experience || 'N/A');
        fd.append('document', docFile); // backend field name
        // user_address intentionally omitted — backend applies its own default address
        // when the field is absent (sending it as JSON.stringify via FormData breaks Joi validation)

        const res = await api.post('/provider/register', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (res.data.success || res.status === 201) {
          toast.success('Provider registered! Please verify your email.');
          router.push(`/verify?email=${encodeURIComponent(email)}&userId=${res.data.data._id}`);
        } else {
          console.log(res.data)
          toast.error(res.data.message || 'Registration failed');
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message?.[0] || err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const activeServices = services.filter(s => s.is_active !== false);
  const selectedServiceName = activeServices.find(s => s._id === selectedService)?.service_name;
  const accent = role === 'customer' ? '168,85,247' : '59,130,246';
  const btnGradient = role === 'customer'
    ? 'linear-gradient(135deg,#a855f7 0%,#3b82f6 100%)'
    : 'linear-gradient(135deg,#1c4ed8 0%,#7c3aed 100%)';

  /* ── Render ──────────────────────────────────────────────── */
  return (
    <div style={{ minHeight: '100vh', background: '#080c14', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 20px 40px', position: 'relative', overflow: 'hidden' }}>

      {/* Blobs */}
      <div style={{ position: 'absolute', top: -200, left: -200, width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle,rgba(168,85,247,0.13) 0%,transparent 65%)', filter: 'blur(60px)', animation: 'blobA 14s ease-in-out infinite alternate', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -150, right: -150, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle,rgba(59,130,246,0.13) 0%,transparent 65%)', filter: 'blur(60px)', animation: 'blobB 12s ease-in-out infinite alternate', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '60%', left: '30%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(236,72,153,0.07) 0%,transparent 65%)', filter: 'blur(40px)', animation: 'blobC 16s ease-in-out infinite alternate', pointerEvents: 'none' }} />

      <motion.div
        initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: '100%', maxWidth: 520, position: 'relative', zIndex: 1 }}
      >
        {/* Card */}
        <div style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '40px 36px', boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <Link href="/">
              <Image src="/logo/FixHublogo.png" alt="FixHub" width={44} height={44} style={{ borderRadius: '50%', marginBottom: 14 }} />
            </Link>
            <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: -0.5, marginBottom: 6 }}>
              Create Your Account
            </h1>
            <p style={{ fontSize: 13, color: '#64748b' }}>Join FixHub — book or provide services</p>
          </div>

          {/* Role Tabs */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 4, marginBottom: 28, gap: 4 }}>
            {(['customer', 'provider'] as const).map(r => (
              <button key={r} type="button" onClick={() => setRole(r)}
                style={{
                  flex: 1, padding: '10px', fontSize: 13, fontWeight: 700, borderRadius: 10, border: 'none', cursor: 'pointer', transition: 'all 0.25s ease',
                  background: role === r ? btnGradient : 'transparent',
                  color: role === r ? '#fff' : '#475569',
                  boxShadow: role === r ? `0 4px 16px rgba(${accent},0.3)` : 'none',
                }}>
                {r === 'customer' ? '👤 Customer' : '🔧 Provider'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Name */}
            <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
              <label style={label}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={14} color="#475569" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="John Doe"
                  style={{ ...inp(focused === 'name', accent), paddingLeft: 38 }}
                  onFocus={() => setFocused('name')} onBlur={() => setFocused(null)} />
              </div>
            </motion.div>

            {/* Email */}
            <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
              <label style={label}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={14} color="#475569" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                  style={{ ...inp(focused === 'email', accent), paddingLeft: 38 }}
                  onFocus={() => setFocused('email')} onBlur={() => setFocused(null)} />
              </div>
            </motion.div>

            {/* Phone */}
            <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
              <label style={label}>Phone Number</label>
              <div style={{ position: 'relative' }}>
                <Phone size={14} color="#475569" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} placeholder="1234567890"
                  style={{ ...inp(focused === 'phone', accent), paddingLeft: 38 }}
                  onFocus={() => setFocused('phone')} onBlur={() => setFocused(null)} />
              </div>
            </motion.div>

            {/* Provider-only: Service Select */}
            <AnimatePresence>
              {role === 'provider' && (
                <motion.div key="service" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
                  <label style={label}>Select Service *</label>
                  <div style={{ position: 'relative' }}>

                    {/* Trigger button */}
                    <button type="button"
                      onClick={() => !servicesLoading && activeServices.length > 0 && setDropOpen(!dropOpen)}
                      disabled={servicesLoading || activeServices.length === 0}
                      style={{
                        ...inp(dropOpen, accent), display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        cursor: (servicesLoading || activeServices.length === 0) ? 'not-allowed' : 'pointer',
                        textAlign: 'left' as const,
                        opacity: activeServices.length === 0 && !servicesLoading ? 0.55 : 1
                      }}
                    >
                      <span style={{ color: selectedServiceName ? '#f1f5f9' : '#475569', fontSize: 14 }}>
                        {servicesLoading
                          ? 'Loading services…'
                          : activeServices.length === 0
                            ? 'No services available currently'
                            : selectedServiceName || 'Choose a service…'}
                      </span>
                      {servicesLoading
                        ? <Loader2 size={14} className="al-spin" color={`rgb(${accent})`} />
                        : <ChevronDown size={15} color="#475569" style={{ transition: 'transform 0.2s', transform: dropOpen ? 'rotate(180deg)' : 'none' }} />
                      }
                    </button>

                    {/* No-active-services hint */}
                    {!servicesLoading && activeServices.length === 0 && services.length > 0 && (
                      <p style={{ fontSize: 11, color: '#f87171', marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <X size={11} /> All services are currently inactive. Contact an admin.
                      </p>
                    )}

                    <AnimatePresence>
                      {dropOpen && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                          style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 50, background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, overflow: 'hidden', maxHeight: 220, overflowY: 'auto', boxShadow: '0 16px 40px rgba(0,0,0,0.5)' }}>
                          {activeServices.length === 0 ? (
                            <div style={{ padding: '16px', textAlign: 'center', color: '#ef4444', fontSize: 13 }}>No active services found</div>
                          ) : activeServices.map(s => (
                            <button key={s._id} type="button" onClick={() => { setSelectedService(s._id); setDropOpen(false); }}
                              style={{ width: '100%', textAlign: 'left', padding: '11px 16px', background: selectedService === s._id ? `rgba(${accent},0.12)` : 'transparent', border: 'none', color: selectedService === s._id ? '#f1f5f9' : '#94a3b8', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, transition: 'background 0.15s' }}
                              onMouseOver={e => (e.currentTarget.style.background = `rgba(${accent},0.08)`)}
                              onMouseOut={e => (e.currentTarget.style.background = selectedService === s._id ? `rgba(${accent},0.12)` : 'transparent')}>
                              {selectedService === s._id && <Check size={13} color={`rgb(${accent})`} />}
                              {s.service_name}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Provider-only: Experience */}
            <AnimatePresence>
              {role === 'provider' && (
                <motion.div key="exp" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, delay: 0.05 }}>
                  <label style={label}>Years of Experience</label>
                  <input type="text" value={experience} onChange={e => setExperience(e.target.value)} placeholder="e.g. 3 years"
                    style={inp(focused === 'exp', accent)}
                    onFocus={() => setFocused('exp')} onBlur={() => setFocused(null)} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Provider-only: Profile Image upload */}
            <AnimatePresence>
              {role === 'provider' && (
                <motion.div
                  key="doc"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <label style={label}>Upload Document *</label>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".pdf,.doc,.docx"
                    hidden
                    onChange={handleFilePick}
                  />

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: `2px dashed rgba(${accent},0.3)`,
                      borderRadius: 14,
                      padding: '20px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: 'rgba(255,255,255,0.02)',
                      transition: 'all 0.2s',
                      position: 'relative',
                    }}
                    onMouseOver={e =>
                      ((e.currentTarget as HTMLDivElement).style.borderColor = `rgba(${accent},0.6)`)
                    }
                    onMouseOut={e =>
                      ((e.currentTarget as HTMLDivElement).style.borderColor = `rgba(${accent},0.3)`)
                    }
                  >
                    {docPreview ? (
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            border: `3px solid rgba(${accent},0.5)`,
                            background: `rgba(${accent},0.1)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: `0 0 16px rgba(${accent},0.25)`,
                          }}
                        >
                          <Upload size={28} color={`rgb(${accent})`} />
                        </div>

                        <span
                          style={{
                            fontSize: 13,
                            color: `rgb(${accent})`,
                            fontWeight: 600,
                          }}
                        >
                          Document uploaded successfully
                        </span>

                        <span style={{ fontSize: 12, color: '#64748b' }}>
                          Click to change
                        </span>
                      </motion.div>
                    ) : (
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 56,
                            height: 56,
                            borderRadius: '50%',
                            border: `2px dashed rgba(${accent},0.4)`,
                            background: `rgba(${accent},0.08)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Upload size={22} color={`rgb(${accent})`} />
                        </div>

                        <p style={{ fontSize: 13, color: '#64748b' }}>
                          Click to{' '}
                          <span style={{ color: `rgb(${accent})`, fontWeight: 600 }}>
                            Upload Document
                          </span>
                        </p>

                        <p style={{ fontSize: 11, color: '#334155' }}>
                          PDF · max 3MB
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Password */}
            <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
              <label style={label}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={14} color="#475569" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input type={showPw ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                  style={{ ...inp(focused === 'pw', accent), paddingLeft: 38, paddingRight: 44 }}
                  onFocus={() => setFocused('pw')} onBlur={() => setFocused(null)} />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#475569', cursor: 'pointer', display: 'flex' }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </motion.div>

            {/* Confirm Password */}
            <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible">
              <label style={label}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={14} color="#475569" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input type={showCpw ? 'text' : 'password'} required value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="••••••••"
                  style={{ ...inp(focused === 'cpw', accent), paddingLeft: 38, paddingRight: 44, borderColor: confirmPw && confirmPw !== password ? 'rgba(239,68,68,0.5)' : undefined }}
                  onFocus={() => setFocused('cpw')} onBlur={() => setFocused(null)} />
                <button type="button" onClick={() => setShowCpw(!showCpw)} style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#475569', cursor: 'pointer', display: 'flex' }}>
                  {showCpw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {confirmPw && confirmPw !== password && (
                <p style={{ fontSize: 11, color: '#ef4444', marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}><X size={11} /> Passwords don&apos;t match</p>
              )}
            </motion.div>

            {/* Submit */}
            <motion.button
              type="submit" disabled={loading}
              whileHover={{ scale: 1.03, boxShadow: `0 8px 28px rgba(${accent},0.45)` }}
              whileTap={{ scale: 0.97 }}
              style={{ width: '100%', padding: '13px', fontSize: 14, fontWeight: 700, color: '#fff', background: btnGradient, border: 'none', borderRadius: 12, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.65 : 1, boxShadow: `0 4px 18px rgba(${accent},0.3)`, fontFamily: 'inherit', marginTop: 4 }}
            >
              {loading ? <><Loader2 size={16} className="al-spin" /> Creating Account…</> : <>Create Account <ArrowRight size={15} /></>}
            </motion.button>
          </form>

          {/* Footer */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '24px 0' }} />
          <p style={{ textAlign: 'center', fontSize: 13, color: '#475569' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: `rgb(${accent})`, fontWeight: 700 }}>Sign In</Link>
          </p>
        </div>
      </motion.div>

      <style>{`
        @keyframes blobA { 0%{transform:translate(0,0) scale(1)} 100%{transform:translate(60px,40px) scale(1.1)} }
        @keyframes blobB { 0%{transform:translate(0,0) scale(1)} 100%{transform:translate(-50px,-40px) scale(1.08)} }
        @keyframes blobC { 0%{transform:translate(0,0) scale(1)} 100%{transform:translate(30px,20px) scale(1.05)} }
      `}</style>
    </div>
  );
}
