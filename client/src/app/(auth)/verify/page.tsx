'use client';

import React, { useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api';

const fadeUp = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as any } },
};

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const userId = searchParams.get('userId') || '';
  
  const [otpValues, setOtpValues] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const otpRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  const handleOtpInput = (idx: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otpValues];
    next[idx] = val.slice(-1);
    setOtpValues(next);
    if (val && idx < 3) {
      otpRefs[idx + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpValues[idx] && idx > 0) {
      otpRefs[idx - 1].current?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = otpValues.join('');
    if (otp.length < 4) {
      toast.error('Please enter the 4-digit OTP');
      return;
    }

    // Guard against 'undefined' string from bad query params
    const safeUserId = (userId && userId !== 'undefined') ? userId : undefined;
    const safeEmail  = (email  && email  !== 'undefined') ? email  : undefined;

    if (!safeUserId && !safeEmail) {
      toast.error('Verification details missing. Please register again.');
      return;
    }

    setLoading(true);
    try {
      const payload: Record<string, string> = { otp };
      if (safeUserId) payload.userId = safeUserId;
      if (safeEmail)  payload.email  = safeEmail;

      const res = await api.post('/user/verify', payload);
      if (res.data.success || res.status === 200) {
        toast.success('Email verified successfully! You can now log in.');
        router.push('/login');
      } else {
        toast.error(res.data.message || 'Verification failed');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setOtpValues(['', '', '', '']);
    const safeUserId = (userId && userId !== 'undefined') ? userId : undefined;
    const safeEmail  = (email  && email  !== 'undefined') ? email  : undefined;
    if (!safeUserId && !safeEmail) return;
    try {
      const payload: Record<string, string> = {};
      if (safeUserId) payload.userId = safeUserId;
      if (safeEmail)  payload.email  = safeEmail;
      const res = await api.post('/user/resend', payload);
      if (res.data.success || res.status === 200) {
        toast.success('OTP resent successfully!');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }} style={{ width: '100%', maxWidth: 420 }}>
        <motion.div variants={fadeUp} style={{ marginBottom: 32, textAlign: 'center' }}>
          <Image src="/logo/FixHublogo.png" alt="FixHub" width={140} height={40} style={{ objectFit: 'contain', marginBottom: 24, margin: '0 auto' }} />
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: '#10b981', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 20, padding: '5px 14px', marginBottom: 16 }}>
            <ShieldCheck size={12} /> Email Verification
          </div>
          <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 30, fontWeight: 800, color: '#f1f5f9', marginBottom: 6, letterSpacing: -0.5 }}>Verify Your Account</h1>
          <p style={{ fontSize: 14, color: '#64748b' }}>
            We've sent a 4-digit OTP to <br />
            <strong style={{ color: '#e2e8f0' }}>{email || 'your email'}</strong>
          </p>
        </motion.div>

        <motion.form variants={fadeUp} onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            {[0, 1, 2, 3].map((idx) => (
              <input
                key={idx}
                ref={otpRefs[idx]}
                type="text"
                maxLength={1}
                inputMode="numeric"
                value={otpValues[idx]}
                onChange={(e) => handleOtpInput(idx, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                style={{
                  width: 54,
                  height: 64,
                  fontSize: 24,
                  fontWeight: 600,
                  textAlign: 'center',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  borderRadius: 12,
                  color: '#eb5e28',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.1s'
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(235,94,40,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(235,94,40,0.08)'; e.target.style.transform = 'scale(1.05)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.09)'; e.target.style.boxShadow = 'none'; e.target.style.transform = 'scale(1)'; }}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || otpValues.join('').length < 4}
            style={{ width: '100%', padding: 13, fontSize: 14, fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none', borderRadius: 10, cursor: (loading || otpValues.join('').length < 4) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: (loading || otpValues.join('').length < 4) ? 0.6 : 1, boxShadow: '0 4px 16px rgba(16,185,129,0.25)', fontFamily: 'inherit', transition: 'opacity 0.2s, transform 0.2s' }}
          >
            {loading ? <><Loader2 size={16} className="al-spin" /> Verifying...</> : 'Verify Email'}
          </button>
        </motion.form>

        <motion.div variants={fadeUp} style={{ marginTop: 28, textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: '#475569' }}>
            Didn't receive the code?{' '}
            <button type="button" onClick={handleResend} style={{ background: 'none', border: 'none', color: '#eb5e28', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
              Resend OTP
            </button>
          </p>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '20px 0' }} />
          <Link href="/login" style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>
            Back to Login
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0b0f19' }}>
      <Suspense fallback={<div style={{ display:'flex', flex:1, alignItems:'center', justifyContent:'center', color:'#64748b' }}><Loader2 className="al-spin"/></div>}>
        <VerifyForm />
      </Suspense>
    </div>
  );
}
