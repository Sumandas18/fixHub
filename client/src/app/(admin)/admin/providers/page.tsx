'use client';

import { useEffect, useState } from 'react';
import { Loader2, UserCheck, Search, CheckCircle, XCircle } from 'lucide-react';
import { adminApi } from '@/services/api/admin';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { containerVariants, fadeUpVariant } from '@/lib/animations';

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await adminApi.getProviders();
        setProviders(res.data || []);
      } catch {
        toast.error('Failed to load providers');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleApprove = async (id: string, action: 'approve' | 'reject') => {
    setActionLoading(id + action);
    try {
      await adminApi.approveProvider(id, action);
      setProviders((prev) =>
        prev.map((p) =>
          p._id === id ? { ...p, isApproved: action === 'approve' } : p
        )
      );
      toast.success(`Provider ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
    } catch {
      toast.error(`Failed to ${action} provider`);
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = providers.filter((p) =>
    (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <div className="dashboard-page-header">
        <h1 className="dashboard-page-title">Providers</h1>
        <p className="dashboard-page-subtitle">
          All registered providers — <strong style={{ color: '#eb5e28' }}>{providers.length}</strong> total
        </p>
      </div>

      {/* Search */}
      <motion.div variants={fadeUpVariant} style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '9px 16px', maxWidth: 360 }}>
          <Search size={15} color="#4a5568" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
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
                <th>Provider</th>
                <th>Email</th>
                <th>Contact</th>
                <th>Experience</th>
                <th>Availability</th>
                <th>Approval</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: '#64748b', padding: 40 }}>
                    <UserCheck size={32} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.3 }} />
                    No providers found
                  </td>
                </tr>
              ) : filtered.map((p, i) => (
                <tr key={p._id}>
                  <td style={{ color: '#4a5568', fontFamily: 'monospace' }}>{i + 1}</td>
                  <td>
                    <div className="td-name">
                      <div className="td-avatar">{(p.name || 'P')[0].toUpperCase()}</div>
                      <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{p.name || '—'}</span>
                    </div>
                  </td>
                  <td style={{ color: '#94a3b8' }}>{p.email || '—'}</td>
                  <td style={{ color: '#94a3b8' }}>{p.contact || '—'}</td>
                  <td style={{ color: '#94a3b8' }}>{p.experience || '—'}</td>
                  <td>
                    <span className={`badge ${p.isAvailable ? 'active' : 'pending'}`}>
                      {p.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${p.isApproved ? 'confirmed' : 'pending'}`}>
                      {p.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {!p.isApproved && (
                        <button
                          className="btn btn-success btn-sm"
                          disabled={actionLoading === p._id + 'approve'}
                          onClick={() => handleApprove(p._id, 'approve')}
                        >
                          <CheckCircle size={12} />
                          {actionLoading === p._id + 'approve' ? '...' : 'Approve'}
                        </button>
                      )}
                      <button
                        className="btn btn-danger btn-sm"
                        disabled={actionLoading === p._id + 'reject'}
                        onClick={() => handleApprove(p._id, 'reject')}
                      >
                        <XCircle size={12} />
                        {actionLoading === p._id + 'reject' ? '...' : 'Reject'}
                      </button>
                    </div>
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
