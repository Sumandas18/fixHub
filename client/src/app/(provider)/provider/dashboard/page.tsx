'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, Star, TrendingUp, CheckCircle, Clock, Wrench, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { providerApi } from '@/services/api/provider';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { containerVariants, fadeUpVariant } from '@/lib/animations';

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
  const [data, setData] = useState({
    bookings: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const bookingsData = await providerApi.getBookings();
        setData({
          bookings: bookingsData.data || [],
        });
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 16 }}>
        <Loader2 size={32} color="#1c4ed8" className="al-spin" />
        <p style={{ color: '#64748b' }}>Loading dashboard data...</p>
      </div>
    );
  }

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
      customer: b.customer_id?.name || 'Unknown',
      service: 'Service ID: ' + (b.service_provider_id?.toString()?.substring(0, 5) || '..'), // Will expand backend to populate this later
      time: `${new Date(b.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${b.scheduled_time}`,
      status: b.status,
    }));

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      {/* Earnings strip (Mocked due to lack of explicit earnings calc endpoint) */}
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

      {/* Page Header */}
      <motion.div variants={fadeUpVariant} className="pv-page-header">
        <div>
          <h1 className="pv-page-title">Provider Dashboard</h1>
          <p className="pv-page-subtitle">Good morning! You have {pendingRequests} pending requests.</p>
        </div>
        <Link href="/provider/bookings">
          <button className="pv-btn pv-btn-primary">
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
                <tr><td colSpan={5} style={{textAlign:'center', color:'#64748b'}}>No upcoming bookings found.</td></tr>
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
                <div
                  key={i}
                  style={{
                    padding: '12px 20px',
                    borderBottom: i < recentReviews.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  }}
                >
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
