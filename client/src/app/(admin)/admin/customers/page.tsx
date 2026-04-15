'use client';

import { useEffect, useState } from 'react';
import { Loader2, Users, Mail, Phone, Search, ShieldOff, Shield } from 'lucide-react';
import { adminApi } from '@/services/api/admin';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { containerVariants, fadeUpVariant } from '@/lib/animations';

export default function AdminCustomersPage() {
  const [customers, setCustomers]         = useState<any[]>([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await adminApi.getCustomers();
        setCustomers(res.data || []);
      } catch {
        toast.error('Failed to load customers');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* ── Block / Unblock ── */
  const handleBlockUnblock = async (id: string, isCurrentlyBlocked: boolean) => {
    setActionLoading(id);
    try {
      await adminApi.blockUnblockUser(id);
      // Optimistic update
      setCustomers(prev =>
        prev.map(c => c._id === id ? { ...c, isBlocked: !c.isBlocked } : c)
      );
      toast.success(`Customer ${isCurrentlyBlocked ? 'unblocked' : 'blocked'} successfully`);
    } catch {
      toast.error('Failed to update customer status');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = customers.filter((c) =>
    (c.user_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.user_email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      {/* Header */}
      <div className="dashboard-page-header">
        <h1 className="dashboard-page-title">Customers</h1>
        <p className="dashboard-page-subtitle">
          All registered customers — <strong style={{ color: '#eb5e28' }}>{customers.length}</strong> total
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

      {/* Table */}
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
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Verified</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: '#64748b', padding: 40 }}>
                    <Users size={32} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.3 }} />
                    No customers found
                  </td>
                </tr>
              ) : filtered.map((c, i) => (
                <tr key={c._id}>
                  <td style={{ color: '#4a5568', fontFamily: 'monospace' }}>{i + 1}</td>
                  <td>
                    <div className="td-name">
                      <div className="td-avatar">
                        {(c.user_name || 'C')[0].toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{c.user_name || '—'}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Mail size={13} color="#4a5568" />
                      {c.user_email || '—'}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Phone size={13} color="#4a5568" />
                      {c.user_contact || '—'}
                    </div>
                  </td>
                  <td>
                    {c.isVerified
                      ? <span className="badge confirmed"><Shield size={11} /> Verified</span>
                      : <span className="badge pending"><ShieldOff size={11} /> Unverified</span>
                    }
                  </td>
                  <td>
                    <span className={`badge ${c.isBlocked ? 'blocked' : 'active'}`}>
                      {c.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  {/* ── Block / Unblock Action ── */}
                  <td>
                    <button
                      className={`btn btn-sm ${c.isBlocked ? 'btn-success' : 'btn-danger'}`}
                      disabled={actionLoading === c._id}
                      onClick={() => handleBlockUnblock(c._id, c.isBlocked)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
                    >
                      {actionLoading === c._id
                        ? <Loader2 size={12} className="al-spin" />
                        : c.isBlocked
                          ? <><Shield size={12} /> Unblock</>
                          : <><ShieldOff size={12} /> Block</>
                      }
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
