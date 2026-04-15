'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Shield, Key, X, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';

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
    verified: false,
  });

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || user.user_name || 'Provider User',
        email: user.email || user.user_email || 'No email provided',
        verified: user.isVerified || true,
      });
    }
  }, [user]);

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

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1e293b' }}>Provider Settings</h1>
        <p style={{ color: '#64748b' }}>Manage your provider profile and security.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem' }}>
        {/* Profile Info */}
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              {profile.name[0] || 'P'}
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a' }}>{profile.name}</h2>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Service Provider</p>
            
            <div style={{ marginTop: '1.5rem', width: '100%', padding: '0.75rem', background: profile.verified ? '#f0fdf4' : '#fff7ed', border: `1px solid ${profile.verified ? '#bbf7d0' : '#fed7aa'}`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Shield size={16} color={profile.verified ? '#16a34a' : '#ea580c'} />
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: profile.verified ? '#16a34a' : '#ea580c' }}>
                {profile.verified ? 'Account Verified' : 'Unverified Account'}
              </span>
            </div>
          </div>
        </div>

        {/* Security Matrix */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>Personal Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.25rem', textTransform: 'uppercase' }}><User size={12} style={{ display: 'inline', marginRight: 4 }} />Full Name</label>
                <p style={{ fontSize: '0.9375rem', color: '#0f172a', padding: '0.5rem 0' }}>{profile.name}</p>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.25rem', textTransform: 'uppercase' }}><Mail size={12} style={{ display: 'inline', marginRight: 4 }} />Email Address</label>
                 <p style={{ fontSize: '0.9375rem', color: '#0f172a', padding: '0.5rem 0' }}>{profile.email}</p>
              </div>
            </div>
          </div>

          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
             <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>Security</h3>
             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '0.9375rem', fontWeight: 500, color: '#0f172a' }}>Update Password</p>
                  <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Ensure your account is using a long, random password.</p>
                </div>
                <button 
                  onClick={() => setShowPasswordModal(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.5rem 1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 500, color: '#0f172a', cursor: 'pointer' }}
                >
                  <Key size={14} /> Change Password
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setShowPasswordModal(false)}>
          <div style={{ width: '100%', maxWidth: '400px', background: '#fff', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a' }}>Update Password</h3>
              <button style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }} onClick={() => setShowPasswordModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleUpdatePassword}>
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ position: 'relative' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#475569', marginBottom: '0.25rem' }}>Current Password</label>
                  <input type={showOld ? "text" : "password"} required style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.875rem', paddingRight: '2.5rem' }} value={pwdData.oldPassword} onChange={(e) => setPwdData({...pwdData, oldPassword: e.target.value})} />
                  <button type="button" onClick={() => setShowOld(!showOld)} style={{ position: 'absolute', right: '0.75rem', top: '1.75rem', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                    {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#475569', marginBottom: '0.25rem' }}>New Password</label>
                  <input type={showNew ? "text" : "password"} required style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.875rem', paddingRight: '2.5rem' }} value={pwdData.newPassword} onChange={(e) => setPwdData({...pwdData, newPassword: e.target.value})} />
                  <button type="button" onClick={() => setShowNew(!showNew)} style={{ position: 'absolute', right: '0.75rem', top: '1.75rem', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#475569', marginBottom: '0.25rem' }}>Confirm New Password</label>
                  <input type={showConf ? "text" : "password"} required style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.875rem', paddingRight: '2.5rem' }} value={pwdData.confirmPassword} onChange={(e) => setPwdData({...pwdData, confirmPassword: e.target.value})} />
                  <button type="button" onClick={() => setShowConf(!showConf)} style={{ position: 'absolute', right: '0.75rem', top: '1.75rem', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                    {showConf ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div style={{ padding: '1rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" style={{ padding: '0.5rem 1rem', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 500, color: '#475569', cursor: 'pointer' }} onClick={() => setShowPasswordModal(false)}>Cancel</button>
                <button type="submit" style={{ padding: '0.5rem 1rem', background: '#10b981', border: 'none', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 500, color: '#fff', cursor: pwdLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }} disabled={pwdLoading}>
                  {pwdLoading ? <Loader2 size={14} className="usr-spin" /> : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
