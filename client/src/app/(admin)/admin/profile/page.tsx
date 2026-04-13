'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Shield, Key, X, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { apiClient } from '@/services/api/axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { containerVariants, fadeUpVariant, scaleUpVariant } from '@/lib/animations';

export default function AdminProfilePage() {
  const { user } = useAuthStore();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pwdLoading, setPwdLoading]   = useState(false);
  const [pwdData, setPwdData]         = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [showOld, setShowOld]         = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [showConf, setShowConf]       = useState(false);

  const [profile, setProfile] = useState({ name: '', email: '', verified: false });

  useEffect(() => {
    if (user) {
      setProfile({
        name:     user.name || (user as any).user_name || 'Admin User',
        email:    user.email || (user as any).user_email || 'No email',
        verified: (user as any).isVerified || false,
      });
    }
  }, [user]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwdData.newPassword.length < 6) return toast.error('New password must be at least 6 characters');
    if (pwdData.newPassword !== pwdData.confirmPassword) return toast.error('New passwords do not match');
    setPwdLoading(true);
    try {
      await apiClient.patch('/admin/password', {
        oldPassword: pwdData.oldPassword,
        newPassword: pwdData.newPassword,
        confirmPassword: pwdData.confirmPassword,
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

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      {/* Header */}
      <div className="dashboard-page-header">
        <h1 className="dashboard-page-title">Admin Profile</h1>
        <p className="dashboard-page-subtitle">Manage your admin account and security settings.</p>
      </div>

      <motion.div variants={fadeUpVariant} style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24 }}>
        {/* Left: Avatar card */}
        <div className="data-card" style={{ padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,#eb5e28,#1c4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 32, fontWeight: 700, marginBottom: 16 }}>
            {(profile.name[0] || 'A').toUpperCase()}
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>{profile.name}</h2>
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>Administrator</p>

          {profile.verified ? (
            <div style={{ padding: '10px 16px', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8, width: '100%', justifyContent: 'center' }}>
              <Shield size={15} color="#4ade80" />
              <span style={{ fontSize: 13, color: '#4ade80', fontWeight: 600 }}>Account Verified</span>
            </div>
          ) : (
            <div style={{ padding: '10px 16px', background: 'rgba(235,94,40,0.08)', border: '1px solid rgba(235,94,40,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8, width: '100%', justifyContent: 'center' }}>
              <Shield size={15} color="#eb5e28" />
              <span style={{ fontSize: 13, color: '#eb5e28', fontWeight: 600 }}>Unverified Account</span>
            </div>
          )}
        </div>

        {/* Right: Info + Security */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Personal Info */}
          <div className="data-card">
            <div className="data-card-header">
              <h2 className="data-card-title">Personal Information</h2>
            </div>
            <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <User size={12} /> Full Name
                </p>
                <p style={{ fontSize: 15, color: '#f1f5f9', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>{profile.name}</p>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Mail size={12} /> Email Address
                </p>
                <p style={{ fontSize: 15, color: '#f1f5f9', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>{profile.email}</p>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="data-card">
            <div className="data-card-header">
              <h2 className="data-card-title">Security</h2>
            </div>
            <div style={{ padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#f1f5f9', marginBottom: 4 }}>Password</p>
                <p style={{ fontSize: 13, color: '#64748b' }}>Update your admin account password.</p>
              </div>
              <button
                className="btn btn-secondary"
                onClick={() => setShowPasswordModal(true)}
              >
                <Key size={14} /> Change Password
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
            onClick={() => setShowPasswordModal(false)}
          >
            <motion.div
              variants={scaleUpVariant} initial="hidden" animate="visible" exit="hidden"
              style={{ width: '100%', maxWidth: 420, background: '#161b27', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 48px rgba(0,0,0,0.5)', overflow: 'hidden' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#f1f5f9' }}>Update Password</h3>
                <button style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }} onClick={() => setShowPasswordModal(false)}><X size={16} /></button>
              </div>
              <form onSubmit={handleUpdatePassword}>
                <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[
                    { label: 'Current Password', key: 'oldPassword' as const, show: showOld, toggle: () => setShowOld(!showOld) },
                    { label: 'New Password',     key: 'newPassword' as const, show: showNew, toggle: () => setShowNew(!showNew) },
                    { label: 'Confirm Password', key: 'confirmPassword' as const, show: showConf, toggle: () => setShowConf(!showConf) },
                  ].map(({ label, key, show, toggle }) => (
                    <div key={key} style={{ position: 'relative' }}>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.6px' }}>{label}</label>
                      <input
                        type={show ? 'text' : 'password'}
                        required
                        value={pwdData[key]}
                        onChange={(e) => setPwdData({ ...pwdData, [key]: e.target.value })}
                        style={{ width: '100%', padding: '10px 40px 10px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 14, color: '#f1f5f9', outline: 'none', boxSizing: 'border-box' }}
                      />
                      <button type="button" onClick={toggle} style={{ position: 'absolute', right: 12, top: 34, background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                        {show ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '14px 22px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowPasswordModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={pwdLoading}>
                    {pwdLoading ? <Loader2 size={14} className="al-spin" /> : 'Update Password'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
