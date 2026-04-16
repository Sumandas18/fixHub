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
  const [saveLoading, setSaveLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [pwdData, setPwdData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConf, setShowConf] = useState(false);

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    verified: false,
    address: {
      houseOrFlatNo: '',
      buildingName: '',
      street: '',
      area: '',
      landmark: '',
      city: '',
      district: '',
      state: '',
      pinCode: '',
      country: 'India',
    }
  });

  const formatAddress = (address: any) => {
    if (!address) return 'No address provided';
    const value = `${address.houseOrFlatNo ? address.houseOrFlatNo + ', ' : ''}${address.buildingName ? address.buildingName + ', ' : ''}${address.street || ''}${address.area ? ', ' + address.area : ''}${address.city ? ', ' + address.city : ''}${address.state ? ', ' + address.state : ''}${address.pinCode ? ', ' + address.pinCode : ''}`.replace(/^(, )+|(, )+$/g, '');
    return value || 'No address provided';
  };

  // Fetch live profile data from GET /user/profile; fall back to Zustand store
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await userApi.getProfile();
        const u = res.data || res;
        const addressSource = u.user_address || u.address || {};
        setProfile({
          name: u.user_name || u.name || user?.name || 'Guest User',
          email: u.user_email || u.email || user?.email || 'No email provided',
          phone: u.user_contact || u.contact || user?.contact || 'No phone provided',
          address: {
            houseOrFlatNo: addressSource.houseOrFlatNo || '',
            buildingName: addressSource.buildingName || '',
            street: addressSource.street || '',
            area: addressSource.area || '',
            landmark: addressSource.landmark || '',
            city: addressSource.city || '',
            district: addressSource.district || '',
            state: addressSource.state || '',
            pinCode: addressSource.pinCode || '',
            country: addressSource.country || 'India',
          },
          verified: u.isVerified ?? user?.isVerified ?? false,
        });
      } catch {
        // Fallback: populate from Zustand store
        if (user) {
          const fallbackAddress = user.user_address || user.address || {};
          setProfile({
            name: user.user_name || user.name || 'Guest User',
            email: user.user_email || user.email || 'No email provided',
            phone: user.user_contact || user.contact || 'No phone provided',
            address: {
              houseOrFlatNo: fallbackAddress.houseOrFlatNo || '',
              buildingName: fallbackAddress.buildingName || '',
              street: fallbackAddress.street || '',
              area: fallbackAddress.area || '',
              landmark: fallbackAddress.landmark || '',
              city: fallbackAddress.city || '',
              district: fallbackAddress.district || '',
              state: fallbackAddress.state || '',
              pinCode: fallbackAddress.pinCode || '',
              country: fallbackAddress.country || 'India',
            },
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

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      const payload: any = {
        user_name: profile.name,
        user_contact: profile.phone,
        user_address: profile.address,
      };

      const res = await userApi.updateProfile(payload);
      const updated = res.data || res;

      setProfile((current) => ({
        ...current,
        name: updated.user_name || updated.name || current.name,
        email: updated.user_email || updated.email || current.email,
        phone: updated.user_contact || updated.contact || current.phone,
        address: {
          houseOrFlatNo: updated.user_address?.houseOrFlatNo || current.address.houseOrFlatNo,
          buildingName: updated.user_address?.buildingName || current.address.buildingName,
          street: updated.user_address?.street || current.address.street,
          area: updated.user_address?.area || current.address.area,
          landmark: updated.user_address?.landmark || current.address.landmark,
          city: updated.user_address?.city || current.address.city,
          district: updated.user_address?.district || current.address.district,
          state: updated.user_address?.state || current.address.state,
          pinCode: updated.user_address?.pinCode || current.address.pinCode,
          country: updated.user_address?.country || current.address.country,
        },
      }));
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaveLoading(false);
    }
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
                <button className="usr-btn usr-btn-primary usr-btn-sm" onClick={handleSave} disabled={saveLoading}>
                  {saveLoading ? 'Saving...' : (<><Check size={13} /> Save Changes</>)}
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
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label className="usr-label">House / Flat No.</label>
                      <input
                        className="usr-input"
                        value={profile.address.houseOrFlatNo}
                        onChange={(e) => setProfile({ ...profile, address: { ...profile.address, houseOrFlatNo: e.target.value } })}
                      />
                    </div>
                    <div>
                      <label className="usr-label">Building Name</label>
                      <input
                        className="usr-input"
                        value={profile.address.buildingName}
                        onChange={(e) => setProfile({ ...profile, address: { ...profile.address, buildingName: e.target.value } })}
                      />
                    </div>
                    <div>
                      <label className="usr-label">Street</label>
                      <input
                        className="usr-input"
                        value={profile.address.street}
                        onChange={(e) => setProfile({ ...profile, address: { ...profile.address, street: e.target.value } })}
                      />
                    </div>
                    <div>
                      <label className="usr-label">Area / Locality</label>
                      <input
                        className="usr-input"
                        value={profile.address.area}
                        onChange={(e) => setProfile({ ...profile, address: { ...profile.address, area: e.target.value } })}
                      />
                    </div>
                    <div>
                      <label className="usr-label">Landmark</label>
                      <input
                        className="usr-input"
                        value={profile.address.landmark}
                        onChange={(e) => setProfile({ ...profile, address: { ...profile.address, landmark: e.target.value } })}
                      />
                    </div>
                    <div>
                      <label className="usr-label">District</label>
                      <input
                        className="usr-input"
                        value={profile.address.district}
                        onChange={(e) => setProfile({ ...profile, address: { ...profile.address, district: e.target.value } })}
                      />
                    </div>
                    <div>
                      <label className="usr-label">City</label>
                      <input
                        className="usr-input"
                        value={profile.address.city}
                        onChange={(e) => setProfile({ ...profile, address: { ...profile.address, city: e.target.value } })}
                      />
                    </div>
                    <div>
                      <label className="usr-label">State</label>
                      <input
                        className="usr-input"
                        value={profile.address.state}
                        onChange={(e) => setProfile({ ...profile, address: { ...profile.address, state: e.target.value } })}
                      />
                    </div>
                    <div>
                      <label className="usr-label">PIN Code</label>
                      <input
                        className="usr-input"
                        value={profile.address.pinCode}
                        onChange={(e) => setProfile({ ...profile, address: { ...profile.address, pinCode: e.target.value } })}
                      />
                    </div>
                    <div>
                      <label className="usr-label">Country</label>
                      <input
                        className="usr-input"
                        value={profile.address.country}
                        onChange={(e) => setProfile({ ...profile, address: { ...profile.address, country: e.target.value } })}
                      />
                    </div>
                  </div>
                ) : (
                  <p style={{ fontSize: 15, color: '#f1f5f9', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)', lineHeight: 1.5 }}>
                    {formatAddress(profile.address)}
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





