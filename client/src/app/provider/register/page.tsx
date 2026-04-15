'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, Lock, User, Phone, Check, Eye, EyeOff, Loader2, UploadCloud, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

const fadeVariant = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
};

export default function ProviderRegisterPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [step, setStep] = useState<1 | 2>(1); // 1: Form, 2: OTP
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  
  // Visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    user_name: '',
    user_email: '',
    user_contact: '',
    service_id: '',
    experience: '',
    user_password: '',
    confirm_password: '',
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [otp, setOtp] = useState('');

  // Fetch Services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get('/service');
        if (res.data && res.data.data) {
          setServices(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load services', err);
      }
    };
    fetchServices();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 1024 * 1024) {
        return toast.error('Image must be less than 1MB');
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage) return toast.error('Profile image is required');
    if (!formData.service_id) return toast.error('Please select a service');
    if (formData.user_password.length < 8) return toast.error('Password must be at least 8 characters');
    if (formData.user_password !== formData.confirm_password) return toast.error('Passwords do not match');

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('user_name', formData.user_name);
      fd.append('user_email', formData.user_email);
      fd.append('user_contact', formData.user_contact);
      fd.append('user_password', formData.user_password);
      fd.append('service_id', formData.service_id);
      fd.append('experience', formData.experience);
      fd.append('document', selectedImage);

      const res = await api.post('/provider/register', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success(res.data.message || 'OTP sent to your email');
      setStep(2);
    } catch (error: any) {
      toast.error(error.response?.data?.message?.[0] || error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 4) return toast.error('Please enter a valid OTP');

    setLoading(true);
    try {
      await api.post('/user/verify', {
        email: formData.user_email,
        otp: otp
      });
      
      toast.success('Provider registration successful!');
      router.push('/provider/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0f172a' }}>
      {/* Left Design Section */}
      <div style={{ flex: 1, display: 'none', '@media (min-width: 1024px)': { display: 'block' }, position: 'relative', overflow: 'hidden', padding: '4rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' } as any}>
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Image src="/logo/FixHublogo.png" alt="FixHub Logo" width={140} height={42} style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
          
          <div style={{ marginTop: 'auto', marginBottom: 'auto' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: 700, color: '#fff', lineHeight: 1.2, marginBottom: '1.5rem' }}>
              Join as a Professional.
            </h1>
            <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.8)', maxWidth: '400px', lineHeight: 1.6 }}>
              Connect with thousands of customers, manage your bookings seamlessly, and grow your independent business.
            </p>
          </div>
        </div>
        {/* Abstract Background Shapes */}
        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '500px', height: '500px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(80px)' }}></div>
        <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '600px', height: '600px', background: 'rgba(0,0,0,0.2)', borderRadius: '50%', filter: 'blur(100px)' }}></div>
      </div>

      {/* Right Form Section */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: '500px' }}>
          
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div key="form" variants={fadeVariant} initial="hidden" animate="visible" exit="exit">
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>Create Account</h2>
                  <p style={{ color: '#94a3b8' }}>Fill out the form below to register as a Provider.</p>
                </div>

                <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  
                  {/* Image Upload */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      style={{ width: 100, height: 100, borderRadius: '50%', border: '2px dashed #475569', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)', cursor: 'pointer', overflow: 'hidden', position: 'relative' }}
                    >
                      {imagePreview ? (
                        <Image src={imagePreview} alt="Preview" fill style={{ objectFit: 'cover' }} />
                      ) : (
                        <UploadCloud size={24} color="#64748b" />
                      )}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Upload Profile Image (Max 1MB)</p>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} style={{ display: 'none' }} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {/* Name */}
                    <div className="usr-field">
                      <label className="usr-label">Full Name</label>
                      <div style={{ position: 'relative' }}>
                        <User size={16} style={{ position: 'absolute', left: 14, top: 14, color: '#64748b' }} />
                        <input required type="text" className="usr-input" placeholder="John Doe" value={formData.user_name} onChange={(e) => setFormData({...formData, user_name: e.target.value})} style={{ paddingLeft: 40 }} />
                      </div>
                    </div>
                    {/* Phone */}
                    <div className="usr-field">
                      <label className="usr-label">Phone Number</label>
                       <div style={{ position: 'relative' }}>
                        <Phone size={16} style={{ position: 'absolute', left: 14, top: 14, color: '#64748b' }} />
                        <input required type="tel" className="usr-input" placeholder="9876543210" value={formData.user_contact} onChange={(e) => setFormData({...formData, user_contact: e.target.value})} style={{ paddingLeft: 40 }} />
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="usr-field">
                    <label className="usr-label">Email Address</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} style={{ position: 'absolute', left: 14, top: 14, color: '#64748b' }} />
                      <input required type="email" className="usr-input" placeholder="john@example.com" value={formData.user_email} onChange={(e) => setFormData({...formData, user_email: e.target.value})} style={{ paddingLeft: 40 }} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {/* Service */}
                    <div className="usr-field">
                      <label className="usr-label">Select Service</label>
                       <div style={{ position: 'relative' }}>
                        <Briefcase size={16} style={{ position: 'absolute', left: 14, top: 14, color: '#64748b' }} />
                        <select required className="usr-input" value={formData.service_id} onChange={(e) => setFormData({...formData, service_id: e.target.value})} style={{ paddingLeft: 40, appearance: 'none', background: '#1e293b' }}>
                          <option value="" disabled>Select...</option>
                          {services.map(s => (
                            <option key={s._id} value={s._id}>{s.service_name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                     {/* Experience */}
                    <div className="usr-field">
                      <label className="usr-label">Experience (Years)</label>
                      <input required type="text" className="usr-input" placeholder="e.g. 5 Years" value={formData.experience} onChange={(e) => setFormData({...formData, experience: e.target.value})} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {/* Password */}
                    <div className="usr-field" style={{ position: 'relative' }}>
                      <label className="usr-label">Password</label>
                      <Lock size={16} style={{ position: 'absolute', left: 14, top: 35, color: '#64748b', zIndex: 2 }} />
                      <input required type={showPassword ? "text" : "password"} className="usr-input" placeholder="••••••••" value={formData.user_password} onChange={(e) => setFormData({...formData, user_password: e.target.value})} style={{ paddingLeft: 40, paddingRight: 40 }} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: 35, background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {/* Confirm */}
                    <div className="usr-field" style={{ position: 'relative' }}>
                      <label className="usr-label">Confirm Password</label>
                      <Lock size={16} style={{ position: 'absolute', left: 14, top: 35, color: '#64748b', zIndex: 2 }} />
                      <input required type={showConfirm ? "text" : "password"} className="usr-input" placeholder="••••••••" value={formData.confirm_password} onChange={(e) => setFormData({...formData, confirm_password: e.target.value})} style={{ paddingLeft: 40, paddingRight: 40 }} />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: 12, top: 35, background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="usr-btn" style={{ width: '100%', background: 'linear-gradient(135deg, #10b981, #059669)', marginTop: '1rem', height: 48, fontSize: '1rem' }} disabled={loading}>
                    {loading ? <Loader2 size={18} className="usr-spin" /> : 'Register & Verify Email'}
                  </button>

                  <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.875rem', marginTop: '1rem' }}>
                    Already have an account? <Link href="/provider/login" style={{ color: '#10b981', fontWeight: 500, textDecoration: 'none' }}>Log in</Link>
                  </p>
                </form>
              </motion.div>
            ) : (
              <motion.div key="otp" variants={fadeVariant} initial="hidden" animate="visible" exit="exit" style={{ textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                  <Mail size={28} color="#10b981" />
                </div>
                <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>Verify your email</h2>
                <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>We've sent a 4-digit OTP to <strong>{formData.user_email}</strong>. Entering it below completes your registration.</p>

                <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
                  <input 
                    type="text" 
                    maxLength={4}
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    style={{ background: '#1e293b', border: '2px solid #334155', borderRadius: '12px', fontSize: '2rem', color: '#fff', textAlign: 'center', letterSpacing: '0.5em', padding: '1rem', width: '200px', outline: 'none' }}
                  />

                  <button type="submit" className="usr-btn" style={{ width: '100%', maxWidth: '200px', background: 'linear-gradient(135deg, #10b981, #059669)', height: 48, fontSize: '1rem' }} disabled={loading}>
                    {loading ? <Loader2 size={18} className="usr-spin" /> : 'Verify Account'}
                  </button>
                </form>

                <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', marginTop: '2rem', fontSize: '0.875rem' }}>
                  ← Back to Registration
                </button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
