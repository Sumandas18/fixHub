'use client';

import { useEffect, useState, useRef } from 'react';
import { CalendarDays, Star, TrendingUp, CheckCircle, Clock, Wrench, ArrowRight, Loader2, AlertCircle, Upload, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { providerApi } from '@/services/api/provider';
import { adminApi } from '@/services/api/admin'; // To fetch services for the dropdown
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { containerVariants, fadeUpVariant, scaleUpVariant } from '@/lib/animations';
import { useAuthStore } from '@/store/useAuthStore';

const recentReviews = [
  { customer: 'Rahul Sharma', rating: 5, review: 'Excellent work, very professional!',   date: '2 days ago' },
  { customer: 'Priya Mehta',  rating: 5, review: 'Fixed the issue quickly. Highly recommended.', date: '5 days ago' },
  { customer: 'Amit Verma',   rating: 4, review: 'Good service, came on time.',            date: '1 week ago' },
];

const quickActions = [
  { label: 'View Bookings',     desc: 'Manage all requests',   href: '/provider/bookings',  iconClass: 'blue',   icon: CalendarDays },
  { label: 'My Services',       desc: 'Edit rates & details',  href: '/provider/services',  iconClass: 'green',  icon: Wrench       },
  { label: 'Reviews & Ratings', desc: 'See customer feedback', href: '/provider/reviews',   iconClass: 'purple', icon: Star         },
];

export default function ProviderDashboardPage() {
  const { user } = useAuthStore();

  const router = useRouter();
  const redirectedRef = useRef(false); // guard against repeated redirects
  const [data, setData] = useState({
    bookings: [],
  });
  const [providerProfile, setProviderProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Complete Profile Modal State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [servicesList, setServicesList] = useState<any[]>([]);
  const [profileForm, setProfileForm] = useState({ service_id: '', experience: '', charges_per_hour: '', service_area_zip: '' });
  const [profileImg, setProfileImg] = useState<File | null>(null);
  const [profileImgPreview, setProfileImgPreview] = useState<string | null>(null);
  const [submittingProfile, setSubmittingProfile] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    console.log("DASHBOARD LOADED");
    let cancelled = false;

    const loadData = async () => {
      try {
        // Dashboard NEVER redirects — just loads data
        const bookingsData = await providerApi.getBookings();
        if (!cancelled) setData({ bookings: bookingsData.data || [] });

        const providerData = await providerApi.getServices();
        const providerProfile = (providerData.data || [])[0] || null;
        if (!cancelled) {
          setProviderProfile(providerProfile);
          console.log('Provider Profile Loaded:', providerProfile);
          console.log('Charges per hour:', providerProfile?.charges_per_hour);
        }

        const servicesData = await adminApi.getServices();
        if (!cancelled) setServicesList(servicesData.data || []);

      } catch (err) {
        console.error("Dashboard Load Error: ", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadData();
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
    
    setSubmittingProfile(true);
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
      toast.success('Profile completed successfully! Awaiting approval.');
      
      // Update local storage user state optimistically
      if (user) {
        useAuthStore.setState({ user: { ...user, isProfileCompleted: true, providerStatus: 'pending' } });
      }
      setShowProfileModal(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to complete profile');
    } finally {
      setSubmittingProfile(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 16 }}>
        <Loader2 size={32} color="#1c4ed8" className="al-spin" />
        <p style={{ color: '#64748b' }}>Loading dashboard data...</p>
      </div>
    );
  }

  const isProfileIncomplete = user && !user.isProfileCompleted;
  const isProfilePending = user && user.isProfileCompleted && user.providerStatus === 'pending';
  const isProfileRejected = user && user.isProfileCompleted && user.providerStatus === 'rejected';

  // ── FULL PAGE ONBOARDING FOR INCOMPLETE PROFILE ──
  if (isProfileIncomplete) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', margin: '-20px' }}>
        {/* Animated Gradient Background */}
        <div style={{ position: 'absolute', top: -100, left: -200, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle,rgba(28,78,216,0.15) 0%,transparent 70%)', filter: 'blur(60px)', animation: 'blobA 10s ease-in-out infinite alternate', zIndex: 0 }} />
        <div style={{ position: 'absolute', bottom: -100, right: -200, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle,rgba(168,85,247,0.15) 0%,transparent 70%)', filter: 'blur(60px)', animation: 'blobB 12s ease-in-out infinite alternate', zIndex: 0 }} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ position: 'relative', zIndex: 1, background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)', padding: '50px 40px', borderRadius: 24, textAlign: 'center', maxWidth: 440, boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}
        >
          <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg,rgba(28,78,216,0.2),rgba(124,58,237,0.2))', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Wrench size={30} color="#60a5fa" />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9', marginBottom: 12 }}>Welcome to FixHub!</h2>
          <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, marginBottom: 32 }}>
            Please fill this form to authorize yourself. We need a few more details about your expertise before you can start accepting jobs.
          </p>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 8px 24px rgba(28,78,216,0.4)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowProfileModal(true)}
            style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg,#1c4ed8 0%,#7c3aed 100%)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
          >
            Complete Profile
          </motion.button>
        </motion.div>

        {/* ── Complete Profile Modal (matches normal rendering logic) ── */}
        <AnimatePresence>
          {showProfileModal && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                style={{ width: '100%', maxWidth: 540, background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, boxShadow: '0 32px 80px rgba(0,0,0,0.7)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}
              >
                <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Complete Your Profile</h2>
                    <p style={{ fontSize: 13, color: '#94a3b8' }}>Provide your service details to start receiving bookings.</p>
                  </div>
                  <button onClick={() => setShowProfileModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={20} /></button>
                </div>

                <div style={{ padding: '24px', overflowY: 'auto' }}>
                  <form id="profileForm" onSubmit={handleCompleteProfile} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div className="pv-field">
                      <label className="pv-label">Service Category *</label>
                      <select className="pv-select" required value={profileForm.service_id} onChange={(e) => setProfileForm({ ...profileForm, service_id: e.target.value })} style={{ width: '100%' }}>
                        <option value="" disabled>Select your expertise...</option>
                        {servicesList.map(s => <option key={s._id} value={s._id}>{s.service_name}</option>)}
                      </select>
                    </div>

                    <div style={{ display: 'flex', gap: 16 }}>
                      <div className="pv-field" style={{ flex: 1 }}>
                        <label className="pv-label">Experience *</label>
                        <input type="text" className="pv-input" placeholder="e.g. 5 Years" required value={profileForm.experience} onChange={(e) => setProfileForm({ ...profileForm, experience: e.target.value })} />
                      </div>
                      <div className="pv-field" style={{ flex: 1 }}>
                        <label className="pv-label">Rate (₹ / hr) *</label>
                        <input type="number" className="pv-input" placeholder="e.g. 400" required value={profileForm.charges_per_hour} onChange={(e) => setProfileForm({ ...profileForm, charges_per_hour: e.target.value })} />
                      </div>
                    </div>

                    <div className="pv-field">
                      <label className="pv-label">Service Area ZIP Code *</label>
                      <input type="text" className="pv-input" placeholder="e.g. 700001" required value={profileForm.service_area_zip} onChange={(e) => setProfileForm({ ...profileForm, service_area_zip: e.target.value })} />
                    </div>

                    <div className="pv-field">
                      <label className="pv-label">Profile Avatar / Image <span style={{ fontWeight: 400, color: '#64748b', textTransform: 'none' }}>(Optional)</span></label>
                      <input type="file" ref={fileRef} hidden accept="image/*" onChange={handleFileChange} />
                      <div onClick={() => fileRef.current?.click()} style={{ border: '2px dashed rgba(255,255,255,0.1)', borderRadius: 12, padding: profileImgPreview ? '12px' : '24px', textAlign: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.02)' }}>
                        {profileImgPreview ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <img src={profileImgPreview} alt="Preview" style={{ width: 60, height: 60, borderRadius: 10, objectFit: 'cover' }} />
                            <div style={{ textAlign: 'left' }}>
                              <p style={{ fontSize: 14, color: '#fff', fontWeight: 600 }}>{profileImg?.name}</p>
                              <p style={{ fontSize: 12, color: '#60a5fa' }}>Click to change</p>
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                            <Upload color="#64748b" size={24} />
                            <p style={{ fontSize: 14, color: '#94a3b8' }}>Click to upload your profile avatar</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </form>
                </div>

                <div style={{ padding: '20px 24px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                  <button type="button" onClick={() => setShowProfileModal(false)} className="pv-btn pv-btn-ghost">Cancel</button>
                  <button type="submit" form="profileForm" disabled={submittingProfile} className="pv-btn pv-btn-primary">
                    {submittingProfile ? <Loader2 className="al-spin" size={16} /> : 'Submit Profile'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <style>{`
          @keyframes blobA { 0%{transform:translate(0,0) scale(1)} 100%{transform:translate(40px,40px) scale(1.1)} }
          @keyframes blobB { 0%{transform:translate(0,0) scale(1)} 100%{transform:translate(-30px,-20px) scale(1.05)} }
        `}</style>
      </div>
    );
  }

  // Calculate dynamic stats
  const totalBookings = data.bookings.length;
  const completedJobs = data.bookings.filter((b: any) => b.status === 'completed').length;
  const pendingRequests = data.bookings.filter((b: any) => b.status === 'pending').length;

  const providerRate = Number(providerProfile?.charges_per_hour || 0);
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);

  const completedBookings = data.bookings.filter((b: any) => b.status === 'completed');
  const completedThisMonth = completedBookings.filter((b: any) => {
    const when = new Date(b.scheduled_date);
    return when >= startOfMonth && when <= now;
  });
  const completedThisWeek = completedBookings.filter((b: any) => {
    const when = new Date(b.scheduled_date);
    return when >= weekAgo && when <= now;
  });

  // Debug logging
  console.log('ProviderRate:', providerRate);
  console.log('Completed bookings count:', completedBookings.length);
  console.log('Completed this month:', completedThisMonth.length);
  console.log('Provider Profile:', providerProfile);

  const totalEarningsThisMonth = completedThisMonth.length * providerRate;
  const thisWeekEarnings = completedThisWeek.length * providerRate;

  const pendingAmount = pendingRequests * providerRate;

  const avgRating = recentReviews.length
    ? (recentReviews.reduce((sum, review) => sum + review.rating, 0) / recentReviews.length).toFixed(1)
    : '0.0';

  const stats = [
    { label: 'Total Bookings',     value: totalBookings.toString(),   change: '+8%',  trend: 'up',   icon: CalendarDays, accent: 'blue'   },
    { label: 'Completed Jobs',     value: completedJobs.toString(),   change: '+11%', trend: 'up',   icon: CheckCircle,  accent: 'green'  },
    { label: 'Avg. Rating',        value: avgRating,                  change: '+0.2', trend: 'up',   icon: Star,         accent: 'purple' },
    { label: 'Pending Requests',   value: pendingRequests.toString(), change: '-2',   trend: 'down', icon: Clock,        accent: 'orange' },
  ];

  // Format upcoming bookings (including completed ones)
  const upcomingBookings = [...data.bookings]
    .sort((a: any, b: any) => new Date(b.scheduled_date).getTime() - new Date(a.scheduled_date).getTime())
    .slice(0, 4)
    .map((b: any) => ({
      id: b._id.substring(b._id.length - 6).toUpperCase(),
      customer: b.customer?.user_name || b.customer?.name || 'Unknown',
      service: b.service?.service_name || 'Booked Service',
      time: `${new Date(b.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${b.scheduled_time}`,
      status: b.status,
    }));

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      {/* Earnings strip */}
      <div className="pv-earnings-strip">
        <div className="pv-earnings-main">
          <p className="pv-earnings-label">Total Earnings This Month</p>
          <p className="pv-earnings-value">{providerRate > 0 ? `₹${totalEarningsThisMonth.toLocaleString('en-IN')}` : '₹0'}</p>
          <p className="pv-earnings-period">{now.toLocaleString('default', { month: 'long', year: 'numeric' })} · {completedJobs} jobs completed</p>
        </div>
        <div className="pv-earnings-breakdown">
          <div className="pv-earn-item">
            <p className="pv-earn-item-value">{providerRate > 0 ? `₹${thisWeekEarnings.toLocaleString('en-IN')}` : '₹0'}</p>
            <p className="pv-earn-item-label">This Week</p>
          </div>
          <div className="pv-earn-item">
            <p className="pv-earn-item-value">{providerRate > 0 ? `₹${pendingAmount.toLocaleString('en-IN')}` : '₹0'}</p>
            <p className="pv-earn-item-label">Pending</p>
          </div>
          <div className="pv-earn-item">
            <p className="pv-earn-item-value">{avgRating} ★</p>
            <p className="pv-earn-item-label">Avg Rating</p>
          </div>
        </div>
      </div>

      {/* Settings Warnings */}
      <AnimatePresence>
        {isProfilePending && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24, padding: '16px 20px', background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
            <Clock color="#facc15" size={24} />
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#facc15' }}>Profile Under Review</p>
              <p style={{ fontSize: 13, color: '#fef08a' }}>Your profile has been submitted and is awaiting admin approval. You can still modify your details inside "My Services".</p>
            </div>
          </motion.div>
        )}

        {isProfileRejected && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24, padding: '16px 20px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
            <AlertCircle color="#f87171" size={24} />
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#f87171' }}>Profile Rejected</p>
              <p style={{ fontSize: 13, color: '#fca5a5' }}>Your profile application was rejected. Please contact support.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <motion.div variants={fadeUpVariant} className="pv-page-header">
        <div>
          <h1 className="pv-page-title">Provider Dashboard</h1>
          {user?.providerStatus === 'approved' && (
             <span style={{ display: 'inline-block', padding: '4px 8px', background: 'rgba(74, 222, 128, 0.15)', color: '#4ade80', borderRadius: 6, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
                ✓ VERIFIED PROVIDER
             </span>
          )}
          <p className="pv-page-subtitle">Good morning! You have {pendingRequests} pending requests.</p>
        </div>
        <Link href="/provider/bookings">
          <button className="pv-btn pv-btn-primary" disabled={isProfileIncomplete || isProfilePending || isProfileRejected}>
            <CalendarDays size={15} /> View All Bookings
          </button>
        </Link>
      </motion.div>

      {/* Stats */}
      <motion.div variants={containerVariants} className="pv-stats">
        {stats.map((s) => (
          <motion.div variants={fadeUpVariant} whileHover={{ scale: 1.02 }} key={s.label} className="pv-stat-card">
            <div className="pv-stat-top">
              <div className={`pv-stat-icon ${s.accent}`}><s.icon size={20} /></div>
              <span className={`pv-stat-change ${s.trend}`}>
                {s.trend === 'up' ? <TrendingUp size={12} /> : '▼'} {s.change}
              </span>
            </div>
            <p className="pv-stat-value">{s.value}</p>
            <p className="pv-stat-label">{s.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Main 2-col grid */}
      <div className="pv-grid-2col">

        {/* Upcoming Bookings */}
        <motion.div variants={fadeUpVariant} className="pv-card">
          <div className="pv-card-header">
            <h2 className="pv-card-title">Upcoming Bookings</h2>
            <Link href="/provider/bookings" className="pv-card-action">View All →</Link>
          </div>
          <table className="pv-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Service</th>
                <th>Scheduled</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {upcomingBookings.length === 0 ? (
                <tr><td colSpan={5} style={{textAlign:'center', color:'#64748b', padding: '40px 0'}}>No upcoming bookings found.</td></tr>
              ) : upcomingBookings.map((b) => (
                <tr key={b.id}>
                  <td style={{ color: '#60a5fa', fontWeight: 600, fontFamily: 'monospace' }}>{b.id}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="pv-avatar" style={{ width: 28, height: 28, fontSize: 12, background: 'linear-gradient(135deg,#1c4ed8,#7c3aed)' }}>
                        {b.customer[0]}
                      </div>
                      {b.customer}
                    </div>
                  </td>
                  <td>{b.service}</td>
                  <td style={{ color: '#64748b', fontSize: 13 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Clock size={12} /> {b.time}
                    </span>
                  </td>
                  <td><span className={`pv-badge ${b.status}`}>{b.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Quick Actions */}
          <motion.div variants={fadeUpVariant} className="pv-card">
            <div className="pv-card-header">
              <h2 className="pv-card-title">Quick Actions</h2>
            </div>
            <div className="pv-quick-actions">
              {quickActions.map((qa) => (
                <Link key={qa.href} href={qa.href} className="pv-quick-action-item">
                  <div className={`pv-qa-icon ${qa.iconClass}`}><qa.icon size={17} /></div>
                  <div style={{ flex: 1 }}>
                    <p className="pv-qa-label">{qa.label}</p>
                    <p className="pv-qa-desc">{qa.desc}</p>
                  </div>
                  <ArrowRight size={15} color="#334155" />
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Recent Reviews (Mock) */}
          <motion.div variants={fadeUpVariant} className="pv-card">
            <div className="pv-card-header">
              <h2 className="pv-card-title">Recent Reviews</h2>
            </div>
            <div style={{ padding: '8px 0' }}>
              {recentReviews.map((r, i) => (
                <div key={i} style={{ padding: '12px 20px', borderBottom: i < recentReviews.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>{r.customer}</p>
                    <span style={{ color: '#fbbf24', fontSize: 12 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  </div>
                  <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>{r.review}</p>
                  <p style={{ fontSize: 11, color: '#334155', marginTop: 4 }}>{r.date}</p>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
}
