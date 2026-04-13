'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  UserCheck,
  CalendarDays,
  Star,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Clock,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { adminApi } from '@/services/api/admin';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { containerVariants, fadeUpVariant } from '@/lib/animations';

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

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [admins, customers, providers, serviceProviders, bookings, ratings] =
          await Promise.allSettled([
            adminApi.getAdmins(),
            adminApi.getCustomers(),
            adminApi.getProviders(),
            adminApi.getServiceProviders(),
            adminApi.getBookings(),
            adminApi.getRatings(),
          ]);

        // Use allSettled so one failure doesn't block everything
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

        // Toast only if a call truly failed
        const failed = [admins, customers, providers, serviceProviders, bookings, ratings].filter(
          (r) => r.status === 'rejected'
        );
        if (failed.length > 0) toast.error('Some data failed to load');
      } catch {
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
      customer: b.customer_id?.name || 'Unknown',
      service:  b.service_provider_id?.service_id?.service_name || 'Service',
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
    .filter((sp: any) => sp.status === 'pending')
    .slice(0, 4)
    .map((sp: any) => ({
      name:    sp.provider_id?.name || 'Unknown Provider',
      service: sp.service_id?.service_name || 'Unknown Service',
      date:    new Date(sp.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      id:      sp._id,
    }));

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
                <tr><td colSpan={5} style={{ textAlign: 'center', color: '#64748b' }}>No recent bookings found</td></tr>
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

          {/* Pending Provider Approvals */}
          <motion.div variants={fadeUpVariant} className="data-card">
            <div className="data-card-header">
              <h2 className="data-card-title">Pending Approvals</h2>
              <Link href="/admin/providers">
                <button className="data-card-action">View All →</button>
              </Link>
            </div>
            <div style={{ padding: '8px 0' }}>
              {pendingProviders.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '20px 0' }}>No pending approvals.</p>
              ) : pendingProviders.map((p, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '11px 22px',
                    borderBottom: idx < pendingProviders.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  }}
                >
                  <div className="td-name">
                    <div className="td-avatar">{p.name[0]}</div>
                    <div>
                      <p style={{ fontSize: 13, color: '#f1f5f9', fontWeight: 600 }}>{p.name}</p>
                      <p style={{ fontSize: 12, color: '#64748b' }}>{p.service}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: '#4a5568' }}>{p.date}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
