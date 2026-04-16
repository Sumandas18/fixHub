'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Clock, Loader2, Upload, X, ShieldAlert } from 'lucide-react';
import { providerApi } from '@/services/api/provider';
import { adminApi } from '@/services/api/admin';
import { authApi } from '@/services/api/auth';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const fadeVariant = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

export default function ProviderPendingPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const fetchedRef = useRef(false);

  const [loading, setLoading] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [servicesList, setServicesList] = useState<any[]>([]);
  
  // Profile Form state
  const [profileForm, setProfileForm] = useState({
    service_id: '',
    experience: '',
    charges_per_hour: '',
    service_area_zip: ''
  });
  const [profileImg, setProfileImg] = useState<File | null>(null);
  const [profileImgPreview, setProfileImgPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    const initData = async () => {
      try {
        const freshUserRes = await authApi.getProfile();
        if (cancelled) return;
        const freshUser = freshUserRes.data || freshUserRes;
        
        if (!freshUser) return;

        // Non-provider role → kick to home
        if (freshUser.user_role !== 'provider') {
          router.replace('/');
          return;
        }

        // Already approved: redirect without loop (only if not already on dashboard)
        if (freshUser.providerStatus === 'approved') {
          router.replace('/provider/dashboard');
          return;
        }

        // Update store with fresh data
        useAuthStore.setState({ user: freshUser });

        const servicesData = await adminApi.getServices();
        if (!cancelled) setServicesList(servicesData.data || []);
      } catch (err) {
        console.error('Failed to grab data', err);
      }
    };
    initData();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setProfileImg(e.target.files[0]);
      setProfileImgPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.service_id || !profileForm.experience || !profileForm.charges_per_hour || !profileForm.service_area_zip) {
      toast.error('Please fill all required fields');
      return;
    }
    
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('service_id', profileForm.service_id);
      fd.append('experience', profileForm.experience);
      fd.append('charges_per_hour', profileForm.charges_per_hour);
      fd.append('service_area_zip', profileForm.service_area_zip);
      if (profileImg) {
        fd.append('profile-pic', profileImg);
      }

      await providerApi.completeProfile(fd);
      toast.success('Profile submitted. Waiting for admin approval');
      
      // Update global user state
      if (user) {
        useAuthStore.setState({ user: { ...user, isProfileCompleted: true, providerStatus: 'pending' } });
      }
      setShowProfileModal(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit profile');
    } finally {
      setLoading(false);
    }
  };

  const isProfileIncomplete = user && !user.isProfileCompleted;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
      minHeight: '100vh', background: '#0B0F1A', color: '#f1f5f9', padding: '2rem', textAlign: 'center',
      position: 'relative', overflow: 'hidden'
    }}>
      {/* Animated subtle background blobs */}
      <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      <div style={{ position: 'absolute', bottom: -100, left: -100, width: 400, height: 400, background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)', filter: 'blur(40px)' }} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', 
          borderRadius: 24, padding: '3rem 2rem', maxWidth: 480, width: '100%',
          backdropFilter: 'blur(16px)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', zIndex: 10
        }}
      >
        {isProfileIncomplete ? (
           <>
             <ShieldAlert size={56} color="#a855f7" style={{ marginBottom: 20, marginLeft: 'auto', marginRight: 'auto' }} />
             <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 16, background: 'linear-gradient(90deg, #c084fc, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
               Finish Setup
             </h1>
             <p style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.6, marginBottom: 32 }}>
               To accept jobs on FixHub, you must finalize your profile details. Connect your service to your area to start receiving booking requests!
             </p>
             
             <motion.button 
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={() => setShowProfileModal(true)}
               style={{
                 padding: '1rem 2rem', 
                 background: 'linear-gradient(135deg, #a855f7, #3b82f6)', 
                 border: 'none',
                 borderRadius: 50, color: '#fff', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer',
                 boxShadow: '0 0 24px rgba(168,85,247,0.5)',
                 animation: 'glowPulse 2s infinite alternate',
                 width: '100%',
                 display: 'flex', alignItems: 'center', justifyContent: 'center'
               }}
             >
               Complete Profile to Get Approved
             </motion.button>
           </>
        ) : (
           <>
             <Clock size={56} color="#eab308" style={{ marginBottom: 20, marginLeft: 'auto', marginRight: 'auto' }} />
             <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 12 }}>Account Under Review</h1>
             <p style={{ color: '#94a3b8', fontSize: 16, lineHeight: 1.6, marginBottom: 30 }}>
               Profile submitted, waiting for admin approval. We will notify you via email as soon as your account is activated.
             </p>
           </>
        )}
      </motion.div>

      {/* ── MODAL FORM ── */}
      <AnimatePresence>
        {showProfileModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(5,8,15,0.85)', backdropFilter: 'blur(8px)', padding: 16 }}>
            <motion.div variants={fadeVariant as any} initial="hidden" animate="visible" exit="exit" style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, width: '100%', maxWidth: 500, overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.6)' }}>
              
              {/* Header */}
              <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f8fafc' }}>Complete Profile Details</h3>
                <button onClick={() => setShowProfileModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={20} /></button>
              </div>

              {/* Form */}
              <form onSubmit={handleCompleteProfile} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.875rem', color: '#cbd5e1' }}>Select Service Category *</label>
                  <select required value={profileForm.service_id} onChange={(e) => setProfileForm({...profileForm, service_id: e.target.value})} style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#f8fafc', fontSize: '0.95rem', outline: 'none' }}>
                    <option value="" disabled>Choose a service...</option>
                    {servicesList.map(s => <option key={s._id} value={s._id}>{s.service_name}</option>)}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: '0.875rem', color: '#cbd5e1' }}>Years of Exp *</label>
                    <input required type="number" min="0" value={profileForm.experience} onChange={(e) => setProfileForm({...profileForm, experience: e.target.value})} placeholder="e.g. 5" style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#f8fafc', fontSize: '0.95rem', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: '0.875rem', color: '#cbd5e1' }}>Rate per hour ($) *</label>
                    <input required type="number" min="1" value={profileForm.charges_per_hour} onChange={(e) => setProfileForm({...profileForm, charges_per_hour: e.target.value})} placeholder="e.g. 45" style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#f8fafc', fontSize: '0.95rem', outline: 'none' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.875rem', color: '#cbd5e1' }}>Service Area ZIP *</label>
                  <input required type="text" value={profileForm.service_area_zip} onChange={(e) => setProfileForm({...profileForm, service_area_zip: e.target.value})} placeholder="e.g. 10001, All over City" style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#f8fafc', fontSize: '0.95rem', outline: 'none' }} />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.875rem', color: '#cbd5e1' }}>Profile Image Upload</label>
                  <div onClick={() => fileRef.current?.click()} style={{ width: '100%', height: 100, border: '2px dashed rgba(168,85,247,0.3)', borderRadius: 12, background: 'rgba(168,85,247,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
                    {profileImgPreview ? (
                      <img src={profileImgPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                        <Upload size={24} color="#a855f7" />
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Click to upload image</span>
                      </div>
                    )}
                  </div>
                  <input type="file" ref={fileRef} accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                </div>

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit" 
                  disabled={loading} 
                  style={{ width: '100%', padding: '0.875rem', marginTop: 8, background: 'linear-gradient(135deg, #a855f7, #3b82f6)', border: 'none', borderRadius: 12, color: '#fff', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                >
                  {loading ? <Loader2 size={20} className="al-spin" /> : 'Complete Registration'}
                </motion.button>
              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes glowPulse { 
          0% { box-shadow: 0 0 15px rgba(168,85,247,0.4); } 
          100% { box-shadow: 0 0 30px rgba(168,85,247,0.8); } 
        }
        .al-spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  );
}
