'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Shield, Edit2, Key, Check, X, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { userApi } from '@/services/api/user';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { containerVariants, fadeUpVariant, scaleUpVariant } from '@/lib/animations';

export default function UserProfilePage() {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [pwdData, setPwdData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConf, setShowConf] = useState(false);

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    verified: false,
  });

  // Fetch live profile data from GET /user/profile; fall back to Zustand store
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await userApi.getProfile();
        const u = res.data || res;
        setProfile({
          name: u.name || u.user_name || user?.name || 'Guest User',
          email: u.email || u.user_email || user?.email || 'No email provided',
          phone: u.contact || u.user_contact || user?.contact || 'No phone provided',
          address: u.address?.city
            ? `${u.address.street || ''}, ${u.address.city}, ${u.address.state}`
            : 'No address provided',
          verified: u.isVerified ?? user?.isVerified ?? false,
        });
      } catch {
        // Fallback: populate from Zustand store
        if (user) {
          setProfile({
            name: user.name || user.user_name || 'Guest User',
            email: user.email || user.user_email || 'No email provided',
            phone: user.contact || user.user_contact || 'No phone provided',
            address: user.address?.city
              ? `${user.address.street || ''}, ${user.address.city}, ${user.address.state}`
              : 'No address provided',
            verified: user.isVerified || false,
          });
        }
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = () => {
    setIsEditing(false);
    toast.success('Profile updated successfully (Mock)');
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwdData.newPassword.length < 6) {
      return toast.error('New password must be at least 6 characters');
    }
    if (pwdData.newPassword !== pwdData.confirmPassword) {
      return toast.error('New passwords do not match');
    }
    setPwdLoading(true);
    try {
      await api.patch('/user/password', {
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

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={fadeUpVariant} className="usr-page-header">
        <h1 className="usr-page-title">My Profile</h1>
        <p className="usr-page-subtitle">Manage your personal information and security settings.</p>
      </motion.div>

      {profileLoading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40vh', flexDirection: 'column', gap: 16 }}>
          <Loader2 size={28} color="#eb5e28" className="usr-spin" />
          <p style={{ color: '#64748b', fontSize: 14 }}>Loading your profile...</p>
        </div>
      ) : (
        <>
      <motion.div variants={fadeUpVariant} className="usr-profile-grid">
        {/* Left Col: Overview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="usr-profile-card">
            <div className="usr-profile-avatar">{profile.name?.[0] || 'U'}</div>
            <h2 className="usr-profile-name">{profile.name}</h2>
            <p className="usr-profile-email">{profile.email}</p>
            
            <div className="usr-profile-stat">
              <div className="usr-profile-stat-item">
                <p className="usr-profile-stat-value">12</p>
                <p className="usr-profile-stat-label">Bookings</p>
              </div>
              <div className="usr-profile-stat-item">
                <p className="usr-profile-stat-value">4.8</p>
                <p className="usr-profile-stat-label">Rating Given</p>
              </div>
            </div>
            
            {profile.verified ? (
              <div style={{ marginTop: 24, padding: '12px 16px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                <Shield size={16} color="#4ade80" />
                <span style={{ fontSize: 13, color: '#4ade80', fontWeight: 600 }}>Account Verified</span>
              </div>
            ) : (
              <div style={{ marginTop: 24, padding: '12px 16px', background: 'rgba(235,94,40,0.1)', border: '1px solid rgba(235,94,40,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                <Shield size={16} color="#eb5e28" />
                <span style={{ fontSize: 13, color: '#eb5e28', fontWeight: 600 }}>Unverified Account</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Details Matrix */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Personal Info */}
          <div className="usr-card">
            <div className="usr-card-header">
              <h2 className="usr-card-title">Personal Information</h2>
              {!isEditing ? (
                <button className="usr-btn usr-btn-ghost usr-btn-sm" onClick={() => setIsEditing(true)}>
                  <Edit2 size={13} /> Edit Profile
                </button>
              ) : (
                <button className="usr-btn usr-btn-primary usr-btn-sm" onClick={handleSave}>
                  <Check size={13} /> Save Changes
                </button>
              )}
            </div>
            
            <div style={{ padding: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                <div>
                  <label className="usr-label"><User size={13} style={{ display: 'inline', marginRight: 6 }} />Full Name</label>
                  {isEditing ? (
                    <input className="usr-input" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                  ) : (
                    <p style={{ fontSize: 15, color: '#f1f5f9', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>{profile.name}</p>
                  )}
                </div>
                <div>
                  <label className="usr-label"><Mail size={13} style={{ display: 'inline', marginRight: 6 }} />Email Address</label>
                  {isEditing ? (
                    <input className="usr-input" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} disabled style={{ opacity: 0.5 }} />
                  ) : (
                    <p style={{ fontSize: 15, color: '#f1f5f9', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>{profile.email}</p>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label className="usr-label"><Phone size={13} style={{ display: 'inline', marginRight: 6 }} />Phone Number</label>
                {isEditing ? (
                  <input className="usr-input" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                ) : (
                  <p style={{ fontSize: 15, color: '#f1f5f9', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>{profile.phone}</p>
                )}
              </div>

              <div>
                <label className="usr-label"><MapPin size={13} style={{ display: 'inline', marginRight: 6 }} />Saved Address</label>
                {isEditing ? (
                  <textarea className="usr-input" rows={3} value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} style={{ resize: 'vertical' }} />
                ) : (
                  <p style={{ fontSize: 15, color: '#f1f5f9', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)', lineHeight: 1.5 }}>
                    {profile.address}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="usr-card">
            <div className="usr-card-header">
              <h2 className="usr-card-title">Security & Authentication</h2>
            </div>
            <div style={{ padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#f1f5f9', marginBottom: 4 }}>Password</p>
                <p style={{ fontSize: 13, color: '#64748b' }}>Manage your account password</p>
              </div>
              <button className="usr-btn usr-btn-ghost" onClick={() => setShowPasswordModal(true)}>
                <Key size={14} /> Update Password
              </button>
            </div>
             <div style={{ padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#f1f5f9', marginBottom: 4 }}>Two-Factor Authentication</p>
                <p style={{ fontSize: 13, color: '#64748b' }}>Add an extra layer of security to your account.</p>
              </div>
              <button className="usr-btn usr-btn-blue">
                Enable 2FA
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="usr-book-overlay" onClick={() => setShowPasswordModal(false)}>
            <motion.div variants={scaleUpVariant} initial="hidden" animate="visible" exit="hidden" className="usr-book-modal" onClick={(e) => e.stopPropagation()}>
              <div className="usr-book-modal-header">
                <h3 className="usr-book-modal-title">Update Password</h3>
                <button className="usr-modal-close" onClick={() => setShowPasswordModal(false)}><X size={16} /></button>
              </div>
              <form onSubmit={handleUpdatePassword}>
                <div className="usr-book-modal-body">
                  <div className="usr-field" style={{ position: 'relative' }}>
                    <label className="usr-label">Current Password</label>
                    <input type={showOld ? "text" : "password"} required className="usr-input" value={pwdData.oldPassword} onChange={(e) => setPwdData({...pwdData, oldPassword: e.target.value})} style={{ paddingRight: 40 }} />
                    <button type="button" onClick={() => setShowOld(!showOld)} style={{ position: 'absolute', right: 12, top: 32, background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                      {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <div className="usr-field" style={{ position: 'relative' }}>
                    <label className="usr-label">New Password</label>
                    <input type={showNew ? "text" : "password"} required className="usr-input" value={pwdData.newPassword} onChange={(e) => setPwdData({...pwdData, newPassword: e.target.value})} style={{ paddingRight: 40 }} />
                    <button type="button" onClick={() => setShowNew(!showNew)} style={{ position: 'absolute', right: 12, top: 32, background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                      {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <div className="usr-field" style={{ position: 'relative' }}>
                    <label className="usr-label">Confirm New Password</label>
                    <input type={showConf ? "text" : "password"} required className="usr-input" value={pwdData.confirmPassword} onChange={(e) => setPwdData({...pwdData, confirmPassword: e.target.value})} style={{ paddingRight: 40 }} />
                    <button type="button" onClick={() => setShowConf(!showConf)} style={{ position: 'absolute', right: 12, top: 32, background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                      {showConf ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="usr-book-modal-footer">
                  <button type="button" className="usr-btn usr-btn-ghost" onClick={() => setShowPasswordModal(false)}>Cancel</button>
                  <button type="submit" className="usr-btn usr-btn-primary" disabled={pwdLoading}>
                    {pwdLoading ? <Loader2 size={14} className="usr-spin" /> : 'Update Password'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </>
      )}
    </motion.div>
  );
}





