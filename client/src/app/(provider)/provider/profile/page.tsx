'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Shield, Key, X, Loader2, Eye, EyeOff, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const statusConfig = {
  approved: {
    icon: CheckCircle,
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.1)',
    border: 'rgba(34,197,94,0.25)',
    label: 'Approved — Active on Platform'
  },
  pending: {
    icon: Clock,
    color: '#eab308',
    bg: 'rgba(234,179,8,0.1)',
    border: 'rgba(234,179,8,0.25)',
    label: 'Pending Admin Approval'
  },
  rejected: {
    icon: AlertCircle,
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.1)',
    border: 'rgba(239,68,68,0.25)',
    label: 'Application Rejected'
  },
};

export default function ProviderProfilePage() {
  const { user } = useAuthStore();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdData, setPwdData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConf, setShowConf] = useState(false);

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    contact: '',
    verified: false,
    providerStatus: '' as 'approved' | 'pending' | 'rejected' | '',
  });

  useEffect(() => {
    if (user) {
      setProfile({
        name: (user as any).name || (user as any).user_name || 'Provider User',
        email: (user as any).email || (user as any).user_email || 'No email provided',
        contact: (user as any).user_contact || (user as any).phone || '',
        verified: (user as any).isVerified ?? true,
        providerStatus: (user as any).providerStatus || '',
      });
    }
  }, [user]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwdData.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    if (pwdData.newPassword !== pwdData.confirmPassword) return toast.error('Passwords do not match');
    setPwdLoading(true);
    try {
      await api.patch('/provider/password', {
        oldPassword: pwdData.oldPassword,
        newPassword: pwdData.newPassword,
      });
      toast.success('Password updated successfully');
      setShowPasswordModal(false);
      setPwdData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setPwdLoading(false);
    }
  };

  const status = statusConfig[profile.providerStatus as keyof typeof statusConfig] ?? null;

  return (
    <div style={{ padding: '2rem', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f1f5f9' }}>Provider Settings</h1>
        <p style={{ color: '#64748b', marginTop: 4 }}>Manage your provider profile and security settings.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 1fr) 2fr', gap: '2rem', alignItems: 'start' }}>
        {/* Profile Info Card */}
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem' }}>
            
            {/* Avatar */}
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '2rem', fontWeight: 'bold', boxShadow: '0 0 20px rgba(16,185,129,0.3)' }}>
              {profile.name[0] || 'P'}
            </div>
            
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f1f5f9' }}>{profile.name}</h2>
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Service Provider</p>
            </div>

            {/* Dynamic Status Badge */}
            {status ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                style={{ 
                  width: '100%', padding: '0.75rem', 
                  background: status.bg, 
                  border: `1px solid ${status.border}`, 
                  borderRadius: '12px', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' 
                }}
              >
                <status.icon size={16} color={status.color} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: status.color }}>
                  {status.label}
                </span>
              </motion.div>
            ) : (
              <div style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Shield size={16} color="#64748b" />
                <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#64748b' }}>Account Verified</span>
              </div>
            )}
          </div>
        </div>

        {/* Details + Security */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Personal Info */}
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#f1f5f9', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Personal Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.25rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <User size={11} /> Full Name
                </label>
                <p style={{ fontSize: '0.9375rem', color: '#f1f5f9', padding: '0.5rem 0' }}>{profile.name}</p>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.25rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Mail size={11} /> Email Address
                </label>
                <p style={{ fontSize: '0.9375rem', color: '#f1f5f9', padding: '0.5rem 0' }}>{profile.email}</p>
              </div>
              {profile.contact && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Contact</label>
                  <p style={{ fontSize: '0.9375rem', color: '#f1f5f9', padding: '0.5rem 0' }}>{profile.contact}</p>
                </div>
              )}
            </div>
          </div>

          {/* Security */}
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#f1f5f9', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Security</h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#f1f5f9' }}>Update Password</p>
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: 4 }}>Keep your account secure with a strong password.</p>
              </div>
              <motion.button 
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => setShowPasswordModal(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.625rem 1.25rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600, color: '#f1f5f9', cursor: 'pointer' }}
              >
                <Key size={14} /> Change Password
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(5,8,15,0.85)', backdropFilter: 'blur(8px)' }} onClick={() => setShowPasswordModal(false)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            style={{ width: '100%', maxWidth: '420px', background: '#0f172a', borderRadius: '20px', boxShadow: '0 24px 60px rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }} 
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#f8fafc' }}>Update Password</h3>
              <button style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }} onClick={() => setShowPasswordModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleUpdatePassword}>
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { label: 'Current Password', key: 'oldPassword', show: showOld, toggle: () => setShowOld(!showOld) },
                  { label: 'New Password', key: 'newPassword', show: showNew, toggle: () => setShowNew(!showNew) },
                  { label: 'Confirm Password', key: 'confirmPassword', show: showConf, toggle: () => setShowConf(!showConf) },
                ].map(({ label, key, show, toggle }) => (
                  <div key={key} style={{ position: 'relative' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#94a3b8', marginBottom: '0.375rem' }}>{label}</label>
                    <input 
                      type={show ? 'text' : 'password'} required 
                      style={{ width: '100%', padding: '0.625rem 2.5rem 0.625rem 0.875rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '0.9rem', color: '#f1f5f9', outline: 'none' }} 
                      value={(pwdData as any)[key]} 
                      onChange={(e) => setPwdData({...pwdData, [key]: e.target.value})} 
                    />
                    <button type="button" onClick={toggle} style={{ position: 'absolute', right: '0.75rem', top: '2.25rem', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                      {show ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                ))}
              </div>
              <div style={{ padding: '1rem 1.5rem', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 500, color: '#94a3b8', cursor: 'pointer' }} onClick={() => setShowPasswordModal(false)}>Cancel</button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} type="submit" style={{ padding: '0.5rem 1.25rem', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600, color: '#fff', cursor: pwdLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }} disabled={pwdLoading}>
                  {pwdLoading ? <Loader2 size={14} className="al-spin" /> : 'Update Password'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
