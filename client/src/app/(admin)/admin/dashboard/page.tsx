'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  UserCheck,
  CalendarDays,
  Star,
  TrendingUp,
  TrendingDown,
  Wrench,
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
    customers: [],
    providers: [],
    bookings: [],
    serviceProviders: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [customers, providers, serviceProviders, bookings] = await Promise.all([
          adminApi.getCustomers(),
          adminApi.getProviders(),
          adminApi.getServiceProviders(),
          adminApi.getBookings(),
        ]);
        
        setData({
          customers: customers.data || [],
          providers: providers.data || [],
          serviceProviders: serviceProviders.data || [],
          bookings: bookings.data || [],
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
        <Loader2 size={32} color="#eb5e28" className="al-spin" />
        <p style={{ color: '#64748b' }}>Loading dashboard data...</p>
      </div>
    );
  }

  // Calculate dynamic stats
  const activeProvidersCount = data.providers.filter((p: any) => p.isAvailable).length;
  // Hardcoded rating since rating endpoint was not requested. Can evolve later.
  const averageRating = "4.8";

  const stats = [
    { label: 'Total Customers',  value: data.customers.length.toString(), change: '+12%', trend: 'up',   icon: Users,        accent: 'blue'   },
    { label: 'Total Providers', value: data.providers.length.toString(), change: '+5%',  trend: 'up',   icon: UserCheck,    accent: 'green'  },
    { label: 'Total Bookings',   value: data.bookings.length.toString(), change: '+18%', trend: 'up',   icon: CalendarDays, accent: 'orange' },
    { label: 'Average Rating',   value: averageRating,   change: '-0.1', trend: 'down', icon: Star,         accent: 'purple' },
  ];

  // Map backend bookings structure
  const recentBookings = [...data.bookings]
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map((b: any) => ({
      id: b._id.substring(b._id.length - 6).toUpperCase(),
      customer: b.customer_id?.name || 'Unknown',
      service: b.service_provider_id?.service_id?.service_name || 'Booked Service',
      status: b.status,
      date: new Date(b.scheduled_date || b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }));

  // Mock activity since it's an aggregation not explicitly defined by standard routes
  const recentActivity = [
    { text: <><strong>System</strong> loaded fresh analytics data</>, time: 'Just now', dot: 'green' },
    { text: <><strong>{data.bookings.length} Bookings</strong> currently tracked</>, time: 'Live', dot: 'blue' },
    { text: <><strong>{data.customers.length} Customers</strong> have registered</>, time: 'Live', dot: 'purple' },
  ];

  // Filter pending service providers
  const pendingProviders = data.serviceProviders
    .filter((sp: any) => sp.status === 'pending')
    .slice(0, 4)
    .map((sp: any) => ({
      name: sp.provider_id?.name || 'Unknown Provider',
      service: sp.service_id?.service_name || 'Unknown Service',
      date: new Date(sp.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      id: sp._id
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
                {s.trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {s.change}
              </span>
            </div>
            <p className="stat-card-value">{s.value}</p>
            <p className="stat-card-label">{s.label}</p>
          </motion.div>
        ))}
      </div>

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
                <tr><td colSpan={5} style={{textAlign:'center', color:'#64748b'}}>No recent bookings found</td></tr>
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
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: '#4a5568', marginRight: 4 }}>{p.date}</span>
                    <button className="btn btn-success btn-sm">Approve</button>
                    <button className="btn btn-danger btn-sm">Reject</button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
}
