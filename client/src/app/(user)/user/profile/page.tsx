'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Shield, Edit2, Key, Check } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { containerVariants, fadeUpVariant } from '@/lib/animations';

export default function UserProfilePage() {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    verified: false,
  });

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || user.user_name || 'Guest User',
        email: user.email || user.user_email || 'No email provided',
        phone: user.contact || user.user_contact || 'No phone provided',
        address: user.address?.city ? `${user.address.street || ''}, ${user.address.city}, ${user.address.state}` : 'No address provided',
        verified: user.isVerified || false,
      });
    }
  }, [user]);

  const handleSave = () => {
    setIsEditing(false);
    toast.success('Profile updated successfully (Mock)');
    // Add API call here
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={fadeUpVariant} className="usr-page-header">
        <h1 className="usr-page-title">My Profile</h1>
        <p className="usr-page-subtitle">Manage your personal information and security settings.</p>
      </motion.div>

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
              <button className="usr-btn usr-btn-ghost">
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
    </motion.div>
  );
}
