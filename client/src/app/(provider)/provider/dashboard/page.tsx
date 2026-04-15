'use client';

import { useEffect, useState, useRef } from 'react';
import { CalendarDays, Star, TrendingUp, CheckCircle, Clock, Wrench, ArrowRight, Loader2, AlertCircle, Plus, Upload, X } from 'lucide-react';
import Link from 'next/link';
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
  const { user, setUser } = useAuthStore();
  const [data, setData] = useState({
    bookings: [],
  });
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
    const fetchDashboardData = async () => {
      try {
        const bookingsData = await providerApi.getBookings();
        setData({
          bookings: bookingsData.data || [],
        });
        
        // Fetch services in case they need to complete profile
        if (user && !user.isProfileCompleted) {
            const servicesData = await adminApi.getServices();
            setServicesList(servicesData.data || []);
        }
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    if (user) {
        fetchDashboardData();
    }
  }, [user]);

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
      // Backend expects an array or string for service_area_zip. We'll send it as a single string (which becomes one entry)
      fd.append('service_area_zip', profileForm.service_area_zip);
      if (profileImg) {
        fd.append('profile-pic', profileImg);
      }

      await providerApi.completeProfile(fd);
      toast.success('Profile completed successfully! Awaiting approval.');
      
      // Update local storage user state optimistically
      if (user) {
        setUser({ ...user, isProfileCompleted: true, providerStatus: 'pending' });
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

  // If user hasn't completed their profile, show a strong banner
  const isProfileIncomplete = user && !user.isProfileCompleted;
  const isProfilePending = user && user.isProfileCompleted && user.providerStatus === 'pending';
  const isProfileRejected = user && user.isProfileCompleted && user.providerStatus === 'rejected';

  // Calculate dynamic stats
  const totalBookings = data.bookings.length;
  const completedJobs = data.bookings.filter((b: any) => b.status === 'completed').length;
  const pendingRequests = data.bookings.filter((b: any) => b.status === 'pending').length;
  const avgRating = "4.8"; // Hardcoded till rating logic is attached

  const stats = [
    { label: 'Total Bookings',     value: totalBookings.toString(),   change: '+8%',  trend: 'up',   icon: CalendarDays, accent: 'blue'   },
    { label: 'Completed Jobs',     value: completedJobs.toString(),   change: '+11%', trend: 'up',   icon: CheckCircle,  accent: 'green'  },
    { label: 'Avg. Rating',        value: avgRating,                  change: '+0.2', trend: 'up',   icon: Star,         accent: 'purple' },
    { label: 'Pending Requests',   value: pendingRequests.toString(), change: '-2',   trend: 'down', icon: Clock,        accent: 'orange' },
  ];

  // Format upcoming bookings
  const upcomingBookings = [...data.bookings]
    .filter((b: any) => b.status === 'confirmed' || b.status === 'pending' || b.status === 'in-progress')
    .sort((a: any, b: any) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime())
    .slice(0, 4)
    .map((b: any) => ({
      id: b._id.substring(b._id.length - 6).toUpperCase(),
      customer: b.customer_id?.user_name || b.customer_id?.name || 'Unknown',
      service: b.service_id?.service_name || b.service_provider_id?.service_id?.service_name || 'Booked Service',
      time: `${new Date(b.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${b.scheduled_time}`,
      status: b.status,
    }));

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      {/* Earnings strip */}
      <div className="pv-earnings-strip">
        <div className="pv-earnings-main">
          <p className="pv-earnings-label">Total Earnings This Month</p>
          <p className="pv-earnings-value">₹28,450</p>
          <p className="pv-earnings-period">April 2026 · {completedJobs} jobs completed</p>
        </div>
        <div className="pv-earnings-breakdown">
          <div className="pv-earn-item">
            <p className="pv-earn-item-value">₹6,200</p>
            <p className="pv-earn-item-label">This Week</p>
          </div>
          <div className="pv-earn-item">
            <p className="pv-earn-item-value">₹1,800</p>
            <p className="pv-earn-item-label">Pending</p>
          </div>
          <div className="pv-earn-item">
            <p className="pv-earn-item-value">{avgRating} ★</p>
            <p className="pv-earn-item-label">Avg Rating</p>
          </div>
        </div>
      </div>

      {/* Profile Status Warnings */}
      <AnimatePresence>
        {isProfileIncomplete && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24, padding: '16px 20px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <AlertCircle color="#f87171" size={24} />
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#f87171' }}>Profile Incomplete!</p>
                <p style={{ fontSize: 13, color: '#fca5a5' }}>You won't be visible to customers until you complete your profile setup.</p>
              </div>
            </div>
            <button onClick={() => setShowProfileModal(true)} className="pv-btn pv-btn-primary" style={{ background: '#ef4444', border: 'none', boxShadow: '0 4px 14px rgba(239,68,68,0.4)', color: '#fff' }}>
              Complete Profile
            </button>
          </motion.div>
        )}

        {isProfilePending && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24, padding: '16px 20px', background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
            <Clock color="#facc15" size={24} />
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#facc15' }}>Profile Under Review</p>
              <p style={{ fontSize: 13, color: '#fef08a' }}>Your profile has been submitted and is awaiting admin approval.</p>
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

      {/* ── Complete Profile Modal ── */}
      <AnimatePresence>
        {showProfileModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowProfileModal(false)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
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
                  
                  {/* Service Selection */}
                  <div className="pv-field">
                    <label className="pv-label">Service Category *</label>
                    <select
                      className="pv-select"
                      required
                      value={profileForm.service_id}
                      onChange={(e) => setProfileForm({ ...profileForm, service_id: e.target.value })}
                      style={{ width: '100%' }}
                    >
                      <option value="" disabled>Select your expertise...</option>
                      {servicesList.map(s => (
                        <option key={s._id} value={s._id}>{s.service_name}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: 16 }}>
                    <div className="pv-field" style={{ flex: 1 }}>
                      <label className="pv-label">Experience *</label>
                      <input
                        type="text"
                        className="pv-input"
                        placeholder="e.g. 5 Years"
                        required
                        value={profileForm.experience}
                        onChange={(e) => setProfileForm({ ...profileForm, experience: e.target.value })}
                      />
                    </div>
                    <div className="pv-field" style={{ flex: 1 }}>
                      <label className="pv-label">Rate (₹ / hr) *</label>
                      <input
                        type="number"
                        className="pv-input"
                        placeholder="e.g. 400"
                        required
                        value={profileForm.charges_per_hour}
                        onChange={(e) => setProfileForm({ ...profileForm, charges_per_hour: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="pv-field">
                    <label className="pv-label">Service Area ZIP Code *</label>
                    <input
                      type="text"
                      className="pv-input"
                      placeholder="e.g. 700001"
                      required
                      value={profileForm.service_area_zip}
                      onChange={(e) => setProfileForm({ ...profileForm, service_area_zip: e.target.value })}
                    />
                  </div>

                  <div className="pv-field">
                    <label className="pv-label">Profile Image / ID Proof <span style={{ fontWeight: 400, color: '#64748b', textTransform: 'none' }}>(Optional)</span></label>
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
                          <p style={{ fontSize: 14, color: '#94a3b8' }}>Click to upload an image</p>
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

    </motion.div>
  );
}
