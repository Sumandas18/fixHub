'use client';

import { useEffect, useState } from 'react';
import { Loader2, CalendarDays, Search, Clock } from 'lucide-react';
import { adminApi } from '@/services/api/admin';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { containerVariants, fadeUpVariant } from '@/lib/animations';
import { CheckCircle, XCircle } from 'lucide-react';

const STATUS_TABS = ['All', 'pending', 'accepted', 'rejected', 'confirmed', 'completed', 'cancelled'];

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [tab, setTab]           = useState('All');
  const [actionLoading, setActionLoading] = useState<string | null>(null); // kept for future extension

  useEffect(() => {
    const load = async () => {
      try {
        const res = await adminApi.getBookings();
        setBookings(res.data || []);
      } catch {
        toast.error('Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Admin only views bookings — accept/reject is done by providers

  const filtered = bookings
    .filter((b) => tab === 'All' || b.status === tab)
    .filter((b) => {
      const q = search.toLowerCase();
      return (
        (b.customer_id?.user_name || '').toLowerCase().includes(q) ||
        (b.service_provider_id?.service_id?.service_name || '').toLowerCase().includes(q) ||
        b._id.toLowerCase().includes(q)
      );
    });

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <div className="dashboard-page-header">
        <h1 className="dashboard-page-title">Bookings</h1>
        <p className="dashboard-page-subtitle">
          All platform bookings — <strong style={{ color: '#eb5e28' }}>{bookings.length}</strong> total
        </p>
      </div>

      {/* Filters row */}
      <motion.div variants={fadeUpVariant} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 20 }}>
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '9px 16px', minWidth: 280 }}>
          <Search size={15} color="#4a5568" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search booking, customer, service..."
            style={{ background: 'none', border: 'none', outline: 'none', color: '#94a3b8', fontSize: 13, width: '100%' }}
          />
        </div>

        {/* Status tabs */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {STATUS_TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '7px 14px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: tab === t ? '#eb5e28' : 'rgba(255,255,255,0.05)',
                color: tab === t ? '#fff' : '#64748b',
                transition: 'all 0.15s',
              }}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div variants={fadeUpVariant} className="data-card">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <Loader2 size={28} color="#eb5e28" className="al-spin" />
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Customer</th>
                <th>Service</th>
                <th>Provider</th>
                <th>Date & Time</th>
                <th>Price/hr</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: '#64748b', padding: 40 }}>
                    <CalendarDays size={32} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.3 }} />
                    No bookings found
                  </td>
                </tr>
              ) : filtered.map((b) => (
                <tr key={b._id}>
                  <td style={{ color: '#eb5e28', fontWeight: 600, fontFamily: 'monospace', fontSize: 13 }}>
                    {b._id.slice(-6).toUpperCase()}
                  </td>
                  <td>
                    <div className="td-name">
                      <div className="td-avatar">{(b.customer_id?.user_name || 'U')[0].toUpperCase()}</div>
                      <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{b.customer_id?.user_name || '—'}</span>
                    </div>
                  </td>
                  <td style={{ color: '#94a3b8' }}>
                    {b.service_provider_id?.service_id?.service_name || b.service_id?.service_name || 'Booked Service'}
                  </td>
                  <td style={{ color: '#94a3b8' }}>
                    {b.service_provider_id?.provider_id?.name || 'Awaiting Provider'}
                  </td>
                  <td style={{ color: '#64748b', fontSize: 13 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Clock size={12} />
                      {b.scheduled_date ? new Date(b.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                      {b.scheduled_time ? ` · ${b.scheduled_time}` : ''}
                    </div>
                  </td>
                  <td style={{ color: '#4ade80', fontWeight: 600 }}>
                    ₹{b.service_provider_id?.charges_per_hour ?? '—'}
                  </td>
                  <td>
                    <span className={`badge ${b.status}`}>{b.status}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: 12, color: '#64748b', fontStyle: 'italic' }}>Managed by provider</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>
    </motion.div>
  );
}
