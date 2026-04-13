'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Mail, Lock, User, Phone, Briefcase, MapPin, Calendar, X, Loader2, UploadCloud, ShieldCheck, Eye, EyeOff, Building } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

const fadeVariant = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.98, y: -10, transition: { duration: 0.2 } }
};

export default function AdminLandingPage() {
  const router = useRouter();

  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<1 | 2>(1); // 1 = Form, 2 = Verify OTP
  const [loading, setLoading] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const sigInputRef = useRef<HTMLInputElement>(null);

  const [profileImg, setProfileImg] = useState<File | null>(null);
  const [sigImg, setSigImg] = useState<File | null>(null);
  const [previewProfile, setPreviewProfile] = useState<string | null>(null);
  const [previewSig, setPreviewSig] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    user_email: '', // Personal Email
    phone_number: '',
    company_email: '',
    street1: '',
    street2: '',
    city: '',
    state: '',
    country: '',
    zip: '',
    services_overview: '',
    establishment_date: '',
    user_password: ''
  });

  const [otp, setOtp] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'signature') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 1024 * 1024) return toast.error('Image must be less than 1MB');
      
      if (type === 'profile') {
        setProfileImg(file);
        setPreviewProfile(URL.createObjectURL(file));
      } else {
        setSigImg(file);
        setPreviewSig(URL.createObjectURL(file));
      }
    }
  };

  const submitFormPhase1 = async () => {
    if (!formData.first_name || !formData.user_email || !formData.user_password) {
      return toast.error('Please fill required fields (First Name, Personal Email, Password)');
    }
    setLoading(true);
    try {
      const fd = new FormData();
      const full_user_name = [formData.first_name, formData.middle_name, formData.last_name].filter(Boolean).join(' ');
      fd.append('user_name', full_user_name);
      
      // Concat Address correctly without dummy JSON logic
      const addressString = [formData.street1, formData.street2, formData.city, formData.state, formData.country, formData.zip].filter(Boolean).join(', ');
      fd.append('office_address', addressString);

      // Append standard fields
      fd.append('user_email', formData.user_email);
      fd.append('user_password', formData.user_password);
      fd.append('first_name', formData.first_name);
      fd.append('middle_name', formData.middle_name);
      fd.append('last_name', formData.last_name);
      fd.append('phone_number', formData.phone_number);
      fd.append('company_email', formData.company_email);
      fd.append('services_overview', formData.services_overview);
      fd.append('establishment_date', formData.establishment_date);
      
      if (profileImg) fd.append('profile_img', profileImg);
      if (sigImg) fd.append('signature_img', sigImg);

      await api.post('/admin/register', fd, { headers: { 'Content-Type': 'multipart/form-data' }});
      
      toast.success('Registration saved. Provide the 4-digit OTP.');
      setStep(2);
    } catch (error: any) {
      toast.error(error.response?.data?.message?.[0] || error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const submitOTPPhase2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) return toast.error('Invalid OTP');
    
    setLoading(true);
    try {
      await api.post('/admin/verify', { email: formData.user_email, otp });
      toast.success('Admin Registration Complete!');
      setShowModal(false);
      router.push('/admin/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  // Custom premium style for inputs
  const inputStyle = {
    background: 'rgba(15, 23, 42, 0.4)', 
    border: '1px solid rgba(255,255,255,0.1)', 
    borderRadius: '12px', 
    color: '#f1f5f9',
    padding: '0.875rem 1rem',
    fontSize: '0.95rem',
    width: '100%',
    outline: 'none',
    transition: 'all 0.2s',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#94a3b8',
    marginBottom: '0.5rem',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0b0f19', overflow: 'hidden', position: 'relative' }}>
      
      {/* Dynamic Background */}
      <div className="bg-mesh" style={{ position: 'absolute', inset: 0, zIndex: 0 }}></div>

      {/* Landing CTA */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} style={{ textAlign: 'center', maxWidth: 800, padding: '2rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
            <div style={{ background: 'rgba(99,102,241,0.1)', padding: '1rem', borderRadius: '50%', border: '1px solid rgba(99,102,241,0.2)' }}>
              <ShieldCheck size={56} color="#8b5cf6" />
            </div>
          </div>
          
          <h1 style={{ fontSize: '4rem', fontWeight: 800, color: '#fff', lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>
            Welcome to <span className="gradient-text-purple">FixHub Admin</span>
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#94a3b8', marginBottom: '3rem', maxWidth: 600, margin: '0 auto 3rem auto', lineHeight: 1.6 }}>
            Command operations, verify incoming services, and scale the ecosystem elegantly from one premium dashboard.
          </p>
          
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            {/* PRIMARY: Login */}
            <button
              onClick={() => router.push('/admin/login')}
              style={{
                background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                color: '#fff',
                border: 'none',
                padding: '1.25rem 3rem',
                fontSize: '1.125rem',
                fontWeight: 700,
                borderRadius: '50px',
                cursor: 'pointer',
                boxShadow: '0 10px 30px -5px rgba(139,92,246,0.5)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
              onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <ShieldCheck size={20} />
              Login as Admin
            </button>

            {/* SECONDARY: Register */}
            <button
              onClick={() => setShowModal(true)}
              style={{
                background: 'transparent',
                color: '#a78bfa',
                border: '1px solid rgba(139,92,246,0.35)',
                padding: '1.25rem 2.5rem',
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: '50px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(139,92,246,0.1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Register as Admin
            </button>
          </div>
        </motion.div>
      </div>

      {/* Powerful Layout Modal */}
      <AnimatePresence>
        {showModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(5,8,15,0.85)', backdropFilter: 'blur(16px)', padding: '1.5rem' }}>
            <motion.div variants={fadeVariant} initial="hidden" animate="visible" exit="exit" style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', width: '100%', maxWidth: '1000px', maxHeight: '95vh', overflowY: 'auto', boxShadow: '0 40px 100px -20px rgba(0,0,0,0.8)', position: 'relative' }}>
              
              <div style={{ position: 'sticky', top: 0, background: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(12px)', padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                   <div style={{ padding: '8px', background: 'rgba(99,102,241,0.1)', borderRadius: '12px' }}>
                     <ShieldCheck size={24} color="#8b5cf6" />
                   </div>
                   <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#f8fafc' }}>
                     {step === 1 ? 'Admin Registration' : 'Verify Email'}
                   </h2>
                </div>
                <button onClick={() => setShowModal(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', padding: '8px', borderRadius: '50%', color: '#94a3b8', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background='rgba(255,255,255,0.1)'} onMouseOut={(e) => e.currentTarget.style.background='rgba(255,255,255,0.05)'}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ padding: '2rem' }}>
                {step === 1 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                    
                    {/* 1. PERSONAL INFO SECTION */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <User size={18} color="#8b5cf6" />
                        <h3 style={{ fontSize: '1.125rem', color: '#e2e8f0', fontWeight: 600 }}>1. Personal Info</h3>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        <div>
                          <label style={labelStyle}>First Name *</label>
                          <input required type="text" name="first_name" value={formData.first_name} onChange={handleChange} style={inputStyle} className="premium-input" placeholder="Enter first name" />
                        </div>
                        <div>
                          <label style={labelStyle}>Middle Name</label>
                          <input type="text" name="middle_name" value={formData.middle_name} onChange={handleChange} style={inputStyle} className="premium-input" placeholder="Enter middle name" />
                        </div>
                        <div>
                          <label style={labelStyle}>Last Name</label>
                          <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} style={inputStyle} className="premium-input" placeholder="Enter last name" />
                        </div>
                        <div style={{ position: 'relative' }}>
                          <label style={labelStyle}>Personal Email *</label>
                           <Mail size={16} style={{ position: 'absolute', left: 16, top: 40, color: '#64748b' }} />
                          <input required type="email" name="user_email" value={formData.user_email} onChange={handleChange} style={{...inputStyle, paddingLeft: 44}} className="premium-input" placeholder="your@email.com" />
                        </div>
                        <div style={{ position: 'relative' }}>
                          <label style={labelStyle}>Phone Number</label>
                          <Phone size={16} style={{ position: 'absolute', left: 16, top: 40, color: '#64748b' }} />
                          <input type="tel" name="phone_number" value={formData.phone_number} onChange={handleChange} style={{...inputStyle, paddingLeft: 44}} className="premium-input" placeholder="e.g. +1 234 567 890" />
                        </div>
                      </div>
                    </div>

                    <div style={{ height: 1, width: '100%', background: 'rgba(255,255,255,0.05)' }}></div>

                    {/* 2. COMPANY INFO SECTION */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <Building size={18} color="#8b5cf6" />
                        <h3 style={{ fontSize: '1.125rem', color: '#e2e8f0', fontWeight: 600 }}>2. Company Info</h3>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        <div>
                          <label style={labelStyle}>Company Email</label>
                           <input type="email" name="company_email" value={formData.company_email} onChange={handleChange} style={inputStyle} className="premium-input" placeholder="hello@company.com" />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                           <label style={labelStyle}>Office Address</label>
                           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                             <input type="text" name="street1" value={formData.street1} onChange={handleChange} style={inputStyle} className="premium-input" placeholder="Street Address 1" />
                             <input type="text" name="street2" value={formData.street2} onChange={handleChange} style={inputStyle} className="premium-input" placeholder="Street Address 2 (Optional)" />
                             <input type="text" name="city" value={formData.city} onChange={handleChange} style={inputStyle} className="premium-input" placeholder="City" />
                             <input type="text" name="state" value={formData.state} onChange={handleChange} style={inputStyle} className="premium-input" placeholder="State/Province" />
                             <input type="text" name="country" value={formData.country} onChange={handleChange} style={inputStyle} className="premium-input" placeholder="Country" />
                             <input type="text" name="zip" value={formData.zip} onChange={handleChange} style={inputStyle} className="premium-input" placeholder="Zip / Postal Code" />
                           </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ height: 1, width: '100%', background: 'rgba(255,255,255,0.05)' }}></div>

                    {/* 3. COMPANY DETAILS SECTION */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <Briefcase size={18} color="#8b5cf6" />
                        <h3 style={{ fontSize: '1.125rem', color: '#e2e8f0', fontWeight: 600 }}>3. Company Details</h3>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', '@media (max-width: 768px)': { gridTemplateColumns: '1fr' } } as any}>
                        <div>
                          <label style={labelStyle}>Services Overview</label>
                          <textarea name="services_overview" value={formData.services_overview} onChange={handleChange} style={{...inputStyle, resize: 'vertical', minHeight: '100px'}} className="premium-input" placeholder="Describe the overarching service verticals..."></textarea>
                        </div>
                        <div>
                          <label style={labelStyle}>Establishment Date</label>
                          <div style={{ position: 'relative' }}>
                             <Calendar size={16} style={{ position: 'absolute', left: 16, top: 16, color: '#64748b' }} />
                             <input type="date" name="establishment_date" value={formData.establishment_date} onChange={handleChange} style={{...inputStyle, paddingLeft: 44, colorScheme: 'dark'}} className="premium-input" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ height: 1, width: '100%', background: 'rgba(255,255,255,0.05)' }}></div>

                     {/* 4. SECURITY */}
                     <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <Lock size={18} color="#8b5cf6" />
                        <h3 style={{ fontSize: '1.125rem', color: '#e2e8f0', fontWeight: 600 }}>4. Security</h3>
                      </div>

                      <div style={{ maxWidth: 400 }}>
                        <label style={labelStyle}>Password *</label>
                        <div style={{ position: 'relative' }}>
                          <Lock size={16} style={{ position: 'absolute', left: 16, top: 15, color: '#64748b' }} />
                          <input required type={showPassword ? 'text' : 'password'} name="user_password" value={formData.user_password} onChange={handleChange} style={{...inputStyle, paddingLeft: 44, paddingRight: 44}} className="premium-input" placeholder="Create a strong password" />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: 12, background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 4 }}>
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                     </div>

                    <div style={{ height: 1, width: '100%', background: 'rgba(255,255,255,0.05)' }}></div>

                    {/* 5. UPLOADS */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <UploadCloud size={18} color="#8b5cf6" />
                        <h3 style={{ fontSize: '1.125rem', color: '#e2e8f0', fontWeight: 600 }}>5. Uploads</h3>
                      </div>

                      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          <label style={labelStyle}>Profile Image (Max 1MB)</label>
                          <div onClick={() => profileInputRef.current?.click()} style={{ width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.02)', border: '2px dashed rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', position: 'relative', transition: 'all 0.2s' }} className="hover-glow">
                            {previewProfile ? <Image src={previewProfile} alt="Profile" fill style={{ objectFit: 'cover' }} /> : <User size={28} color="#64748b" />}
                          </div>
                          <input type="file" hidden ref={profileInputRef} accept="image/*" onChange={(e) => handleImageChange(e, 'profile')} />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          <label style={labelStyle}>Signature Upload (Max 1MB)</label>
                          <div onClick={() => sigInputRef.current?.click()} style={{ width: 220, height: 100, borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '2px dashed rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', position: 'relative', transition: 'all 0.2s' }} className="hover-glow">
                            {previewSig ? <Image src={previewSig} alt="Sig" fill style={{ objectFit: 'contain', padding: 8 }} /> : (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.5 }}>
                                <UploadCloud size={24} color="#f8fafc" />
                                <span style={{ fontSize: '0.75rem', marginTop: 8, color: '#f8fafc' }}>Click to upload</span>
                              </div>
                            )}
                          </div>
                          <input type="file" hidden ref={sigInputRef} accept="image/*" onChange={(e) => handleImageChange(e, 'signature')} />
                        </div>
                      </div>
                    </div>

                    {/* SUBMIT BUTTON ROW */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', position: 'sticky', bottom: 0, background: '#0f172a', margin: '0 -2rem -2rem -2rem', padding: '1.5rem 2rem', borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
                       <button onClick={submitFormPhase1} disabled={loading} style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)', color: '#fff', border: 'none', padding: '1rem 3rem', borderRadius: '12px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 15px -3px rgba(139,92,246,0.5)', transition: 'all 0.2s' }} onMouseOver={(e) => {if(!loading) e.currentTarget.style.transform='translateY(-2px)'}} onMouseOut={(e) => e.currentTarget.style.transform='translateY(0)'}>
                          {loading ? <Loader2 size={18} className="usr-spin" /> : 'Send OTP to Personal Email'}
                       </button>
                    </div>

                  </div>
                ) : (
                  <motion.form key="otp" variants={fadeVariant} initial="hidden" animate="visible" exit="exit" onSubmit={submitOTPPhase2} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 2rem' }}>
                     <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', boxShadow: '0 0 40px rgba(139,92,246,0.2)' }}>
                        <Mail size={36} color="#a855f7" />
                      </div>
                      <h3 style={{ fontSize: '2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '1rem', letterSpacing: '-0.02em' }}>Verify Personal Email</h3>
                      <p style={{ color: '#94a3b8', marginBottom: '3rem', fontSize: '1.125rem', textAlign: 'center' }}>Enter the secure 4-digit OTP sent to <br/><strong style={{ color: '#fff' }}>{formData.user_email}</strong></p>

                      <input 
                        type="text" 
                        maxLength={4}
                        required
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        style={{ background: 'rgba(15,23,42,0.8)', border: '2px solid rgba(139,92,246,0.3)', borderRadius: '16px', fontSize: '3rem', color: '#fff', textAlign: 'center', letterSpacing: '0.4em', padding: '1rem 2rem', outline: 'none', marginBottom: '3rem', fontWeight: 600, boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)' }}
                      />

                      <button type="submit" disabled={loading} style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)', color: '#fff', border: 'none', padding: '1.25rem 4rem', borderRadius: '50px', fontSize: '1.125rem', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 10px 25px -5px rgba(139,92,246,0.5)', transition: 'all 0.2s' }} onMouseOver={(e) => {if(!loading) e.currentTarget.style.transform='translateY(-2px)'}} onMouseOut={(e) => e.currentTarget.style.transform='translateY(0)'}>
                         {loading ? <Loader2 size={18} className="usr-spin" /> : 'Complete Secure Registration'}
                      </button>
                  </motion.form>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <style dangerouslySetInnerHTML={{__html: `
        .premium-input:focus {
          border-color: rgba(139,92,246, 0.5) !important;
          box-shadow: 0 0 0 3px rgba(139,92,246, 0.15) !important;
          background: rgba(15,23,42, 0.8) !important;
        }
        .hover-glow:hover {
          border-color: rgba(139,92,246, 0.4) !important;
          background: rgba(255,255,255,0.05) !important;
        }
      `}} />
    </div>
  );
}
