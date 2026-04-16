'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  UserCheck,
  CalendarDays,
  Star,
  TrendingUp,
  ShieldCheck,
  Clock,
  Loader2,
  CheckCircle,
  X,
  FileText,
  User,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { adminApi } from '@/services/api/admin';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { containerVariants, fadeUpVariant, scaleUpVariant } from '@/lib/animations';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/** Build a full media URL from a stored path/filename */
const mediaUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  // strip leading slash if present, then prepend API_URL
  return `${API_URL}/${path.replace(/^\//, '')}`;
};

export default function AdminDashboardPage() {
  const [data, setData] = useState({
    admins: [] as any[],
    customers: [] as any[],
    providers: [] as any[],
    bookings: [] as any[],
    serviceProviders: [] as any[],
    ratings: [] as any[],
  });
  const [loading, setLoading] = useState(true);
  
  // Provider Approval Modal State
  const [approvalModal, setApprovalModal] = useState<any>(null);
  const [approvalLoading, setApprovalLoading] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [admins, customers, providers, serviceProviders, bookings, ratings] =
        await Promise.allSettled([
          adminApi.getAdmins(),
          adminApi.getCustomers(),
          adminApi.getProviders(),
          adminApi.getServiceProviders(), // Should get all providers including pending
          adminApi.getBookings(),
          adminApi.getRatings(),
        ]);

      const resolve = (r: PromiseSettledResult<any>) =>
        r.status === 'fulfilled' ? r.value?.data || [] : [];

      setData({
        admins: resolve(admins),
        customers: resolve(customers),
        providers: resolve(providers),
        serviceProviders: resolve(serviceProviders),
        bookings: resolve(bookings),
        ratings: resolve(ratings),
      });

    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleApproveReject = async (id: string, status: 'approve' | 'reject') => {
    setApprovalLoading(true);
    try {
      await adminApi.approveProvider(id, status);
      toast.success(`Provider ${status === 'approve' ? 'approved' : 'rejected'} successfully!`);
      // Fully refetch to instantly mutate tabs & badges natively without manual refreshes.
      await fetchDashboardData();
      setApprovalModal(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Failed to ${status} provider`);
    } finally {
      setApprovalLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 16 }}>
        <Loader2 size={32} color="#eb5e28" className="al-spin" />
        <p style={{ color: '#64748b' }}>Loading dashboard data...</p>
      </div>
    );
  }

  const avgRating =
    data.ratings.length > 0
      ? (data.ratings.reduce((s: number, r: any) => s + (r.rating || 0), 0) / data.ratings.length).toFixed(1)
      : '—';

  const stats = [
    { label: 'Total Customers', value: data.customers.length.toString(), change: '+12%', trend: 'up',   icon: Users,       accent: 'blue'   },
    { label: 'Total Providers', value: data.providers.length.toString(), change: '+5%',  trend: 'up',   icon: UserCheck,   accent: 'green'  },
    { label: 'Total Bookings',  value: data.bookings.length.toString(),  change: '+18%', trend: 'up',   icon: CalendarDays,accent: 'orange' },
    { label: 'Avg Rating',      value: avgRating,                        change: 'live', trend: 'up',   icon: Star,        accent: 'purple' },
  ];

  const recentBookings = [...data.bookings]
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map((b: any) => ({
      id:       b._id.slice(-6).toUpperCase(),
      customer: b.customer_id?.user_name || b.customer_id?.name || 'Unknown',
      service:  b.service_provider_id?.service_id?.service_name || b.service_id?.service_name || 'Service',
      status:   b.status,
      date:     new Date(b.scheduled_date || b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    }));

  const recentActivity = [
    { text: <><strong>System</strong> loaded fresh analytics data</>, time: 'Just now', dot: 'green' },
    { text: <><strong>{data.bookings.length} Bookings</strong> currently tracked</>, time: 'Live', dot: 'blue' },
    { text: <><strong>{data.customers.length} Customers</strong> have registered</>, time: 'Live', dot: 'purple' },
    { text: <><strong>{data.admins.length} Admins</strong> in system</>, time: 'Live', dot: 'green' },
  ];

  const pendingProviders = data.serviceProviders
    .filter((sp: any) => sp.status === 'pending' && sp.isProfileCompleted)
    .slice(0, 4)
    .map((sp: any) => ({
      ...sp,
      name:    sp.provider?.user_name || sp.provider_id?.name || 'Unknown Provider',
      email:   sp.provider?.user_email || 'No email',
      doc_url: sp.provider?.doc_url,
      service: sp.service?.service_name || 'Unknown Service',
      date:    new Date(sp.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      id:      sp.provider_id,
    }));

    // console.log(data.serviceProviders);
    
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      {/* Page Header */}
      <div className="dashboard-page-header">
        <h1 className="dashboard-page-title">Dashboard Overview</h1>
        <p className="dashboard-page-subtitle">Welcome back! Here's what's happening with FixHub today.</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((s) => (
          <motion.div variants={fadeUpVariant} whileHover={{ scale: 1.02 }} key={s.label} className="stat-card">
            <div className="stat-card-top">
              <div className={`stat-card-icon ${s.accent}`}>
                <s.icon size={22} />
              </div>
              <span className={`stat-card-change ${s.trend}`}>
                <TrendingUp size={12} />
                {s.change}
              </span>
            </div>
            <p className="stat-card-value">{s.value}</p>
            <p className="stat-card-label">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Admins count mini-card */}
      <motion.div variants={fadeUpVariant} style={{ marginBottom: 28 }}>
        <div className="data-card" style={{ display: 'inline-flex', alignItems: 'center', gap: 14, padding: '14px 22px' }}>
          <div className="stat-card-icon blue" style={{ width: 36, height: 36, borderRadius: 10 }}>
            <ShieldCheck size={18} />
          </div>
          <div>
            <p style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', lineHeight: 1 }}>{data.admins.length}</p>
            <p style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>Registered Admins</p>
          </div>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Recent Bookings Table */}
        <motion.div variants={fadeUpVariant} className="data-card">
          <div className="data-card-header">
            <h2 className="data-card-title">Recent Bookings</h2>
            <Link href="/admin/bookings">
              <button className="data-card-action">View All →</button>
            </Link>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Customer</th>
                <th>Service</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: '#64748b', padding: '40px 0' }}>No recent bookings found</td></tr>
              ) : recentBookings.map((row) => (
                <tr key={row.id}>
                  <td style={{ color: '#eb5e28', fontWeight: 600, fontFamily: 'monospace' }}>{row.id}</td>
                  <td>
                    <div className="td-name">
                      <div className="td-avatar">{row.customer[0]}</div>
                      {row.customer}
                    </div>
                  </td>
                  <td>{row.service}</td>
                  <td style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Clock size={13} /> {row.date}
                  </td>
                  <td>
                    <span className={`badge ${row.status}`}>{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Pending Provider Approvals - STEP 5 & 6 */}
          <motion.div variants={fadeUpVariant} className="data-card" style={{ border: '1px solid rgba(235, 94, 40, 0.2)' }}>
            <div className="data-card-header">
              <h2 className="data-card-title" style={{ color: '#eb5e28' }}>Pending Approvals</h2>
              <Link href="/admin/providers">
                <button className="data-card-action">View All →</button>
              </Link>
            </div>
            <div style={{ padding: '8px 0' }}>
              {pendingProviders.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '20px 0' }}>No pending approvals.</p>
              ) : pendingProviders.map((p, idx) => (
                <div
                  key={p.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '11px 22px',
                    borderBottom: idx < pendingProviders.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  }}
                >
                  <div className="td-name">
                    <div className="td-avatar" style={{ background: 'linear-gradient(135deg, #eb5e28, #f59e0b)' }}>
                      {p.name[0]}
                    </div>
                    <div>
                      <p style={{ fontSize: 13, color: '#f1f5f9', fontWeight: 600 }}>{p.name}</p>
                      <p style={{ fontSize: 11, color: '#94a3b8' }}>{p.email}</p>
                    </div>
                  </div>
                  
                  {/* Bubble Animated Approve Button */}
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: '0 4px 15px rgba(235,94,40,0.3)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setApprovalModal(p)}
                    style={{
                      background: 'linear-gradient(135deg, #eb5e28, #f59e0b)',
                      color: '#fff',
                      border: 'none',
                      padding: '6px 14px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <CheckCircle size={14} /> Review
                  </motion.button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Activity Feed */}
          <motion.div variants={fadeUpVariant} className="data-card">
            <div className="data-card-header">
              <h2 className="data-card-title">Recent Activity</h2>
            </div>
            <div className="activity-list">
              {recentActivity.map((item, idx) => (
                <div key={idx} className="activity-item">
                  <div className={`activity-dot ${item.dot}`} />
                  <div>
                    <p className="activity-text">{item.text}</p>
                    <p className="activity-time">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Approval Modal (STEP 6) ── */}
      <AnimatePresence>
        {approvalModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setApprovalModal(null)}>
            <motion.div
              variants={scaleUpVariant}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onClick={(e) => e.stopPropagation()}
              style={{ width: '100%', maxWidth: 540, background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, boxShadow: '0 32px 80px rgba(0,0,0,0.7)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}
            >
              <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Review Provider Profile</h2>
                  <p style={{ fontSize: 13, color: '#94a3b8' }}>Approve or reject this provider's application.</p>
                </div>
                <button onClick={() => setApprovalModal(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={20} /></button>
              </div>

              <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Profile Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {approvalModal.profile_img_url ? (
                    <img src={mediaUrl(approvalModal.profile_img_url) ?? ''} alt="Avatar" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.1)' }} />
                  ) : (
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #eb5e28, #f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#fff', fontWeight: 700 }}>
                      {approvalModal.name[0]}
                    </div>
                  )}
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>{approvalModal.name}</h3>
                    <p style={{ fontSize: 13, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 5 }}><User size={12} /> {approvalModal.email}</p>
                  </div>
                </div>

                {/* Details Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <p style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>Service Provided</p>
                    <p style={{ fontSize: 14, color: '#f1f5f9', fontWeight: 500 }}>{approvalModal.service}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>Experience</p>
                    <p style={{ fontSize: 14, color: '#f1f5f9', fontWeight: 500 }}>{approvalModal.experience} yr.</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>Hourly Rate</p>
                    <p style={{ fontSize: 14, color: '#f1f5f9', fontWeight: 500 }}>₹{approvalModal.charges_per_hour}/hr</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>Service Zip Code</p>
                    <p style={{ fontSize: 14, color: '#f1f5f9', fontWeight: 500 }}>{approvalModal.service_area_zip?.[0] || 'N/A'}</p>
                  </div>
                </div>

                {/* ID Document */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                   <p style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>Uploaded Legal ID / Proof Document</p>
                   {(() => {
                     const url = mediaUrl(approvalModal.doc_url);
                     if (!url) return <p style={{ fontSize: 13, color: '#ef4444' }}>No document uploaded</p>;
                     const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
                     return isImage ? (
                       <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                         <img src={url} alt="Provider document" style={{ width: '100%', maxHeight: 280, objectFit: 'cover', display: 'block' }} />
                         <a href={url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', background: 'rgba(59,130,246,0.1)', color: '#60a5fa', fontSize: 12, textDecoration: 'none' }}>
                           <ExternalLink size={13} /> Open full image
                         </a>
                       </div>
                     ) : (
                       <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                         <iframe src={url} title="Provider document" style={{ width: '100%', height: 260, border: 'none', background: '#fff' }} />
                         <a href={url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', background: 'rgba(59,130,246,0.1)', color: '#60a5fa', fontSize: 12, textDecoration: 'none' }}>
                           <FileText size={13} /> Open in new tab
                         </a>
                       </div>
                     );
                   })()}
                </div>

              </div>

              <div style={{ padding: '20px 24px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="button" onClick={() => handleApproveReject(approvalModal.id, 'reject')} disabled={approvalLoading} className="pv-btn pv-btn-danger">
                  {approvalLoading ? <Loader2 className="al-spin" size={16} /> : '✗ Reject'}
                </button>
                <button type="button" onClick={() => handleApproveReject(approvalModal.id, 'approve')} disabled={approvalLoading} className="pv-btn pv-btn-success" style={{ background: '#22c55e', color: '#fff' }}>
                  {approvalLoading ? <Loader2 className="al-spin" size={16} /> : '✓ Accept'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
