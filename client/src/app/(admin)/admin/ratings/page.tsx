'use client';

import { useEffect, useState } from 'react';
import { Loader2, Star, Search, Trash2 } from 'lucide-react';
import { adminApi } from '@/services/api/admin';
import { apiClient } from '@/services/api/axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { containerVariants, fadeUpVariant } from '@/lib/animations';

function StarRow({ value }: { value: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={13}
          fill={s <= value ? '#fbbf24' : 'transparent'}
          color={s <= value ? '#fbbf24' : '#4a5568'}
        />
      ))}
    </div>
  );
}

export default function AdminRatingsPage() {
  const [ratings, setRatings]   = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await adminApi.getRatings();
        setRatings(res.data || []);
      } catch {
        toast.error('Failed to load ratings');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this rating?')) return;
    setDeleting(id);
    try {
      await apiClient.delete(`/rating/rating/${id}`);
      setRatings((prev) => prev.filter((r) => r._id !== id));
      toast.success('Rating deleted');
    } catch {
      toast.error('Failed to delete rating');
    } finally {
      setDeleting(null);
    }
  };

  const avgRating =
    ratings.length > 0
      ? (ratings.reduce((s, r) => s + (r.rating || 0), 0) / ratings.length).toFixed(1)
      : '—';

  const filtered = ratings.filter((r) => {
    const q = search.toLowerCase();
    return (
      (r.customer_id?.name || '').toLowerCase().includes(q) ||
      (r.service_provider_id?.service_id?.service_name || '').toLowerCase().includes(q) ||
      (r.review || '').toLowerCase().includes(q)
    );
  });

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <div className="dashboard-page-header">
        <h1 className="dashboard-page-title">Ratings & Reviews</h1>
        <p className="dashboard-page-subtitle">
          All platform reviews — <strong style={{ color: '#eb5e28' }}>{ratings.length}</strong> total ·{' '}
          <Star size={13} style={{ display: 'inline', verticalAlign: 'middle' }} color="#fbbf24" />{' '}
          <strong style={{ color: '#fbbf24' }}>{avgRating}</strong> avg
        </p>
      </div>

      {/* Search */}
      <motion.div variants={fadeUpVariant} style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '9px 16px', maxWidth: 360 }}>
          <Search size={15} color="#4a5568" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer, service, review..."
            style={{ background: 'none', border: 'none', outline: 'none', color: '#94a3b8', fontSize: 13, width: '100%' }}
          />
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
                <th>#</th>
                <th>Customer</th>
                <th>Service</th>
                <th>Rating</th>
                <th>Review</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: '#64748b', padding: 40 }}>
                    <Star size={32} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.3 }} />
                    No ratings found
                  </td>
                </tr>
              ) : filtered.map((r, i) => (
                <tr key={r._id}>
                  <td style={{ color: '#4a5568', fontFamily: 'monospace' }}>{i + 1}</td>
                  <td>
                    <div className="td-name">
                      <div className="td-avatar">{(r.customer_id?.name || 'U')[0].toUpperCase()}</div>
                      <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{r.customer_id?.name || '—'}</span>
                    </div>
                  </td>
                  <td style={{ color: '#94a3b8' }}>
                    {r.service_provider_id?.service_id?.service_name || '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <StarRow value={r.rating || 0} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#fbbf24' }}>{r.rating}/5</span>
                    </div>
                  </td>
                  <td style={{ color: '#94a3b8', maxWidth: 220 }}>
                    <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: 13 }}>
                      {r.review || <span style={{ color: '#4a5568' }}>No review text</span>}
                    </span>
                  </td>
                  <td style={{ color: '#64748b', fontSize: 13 }}>
                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      disabled={deleting === r._id}
                      onClick={() => handleDelete(r._id)}
                    >
                      <Trash2 size={12} />
                      {deleting === r._id ? '...' : 'Delete'}
                    </button>
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
