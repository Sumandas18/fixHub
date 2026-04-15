'use client';

import { useEffect, useState } from 'react';
import { Loader2, ShieldCheck, Search, Mail, Trash2, Lock, Unlock, Shield } from 'lucide-react';
import { adminApi } from '@/services/api/admin';
import { apiClient } from '@/services/api/axios';
import { useAuthStore } from '@/store/useAuthStore';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { containerVariants, fadeUpVariant } from '@/lib/animations';

export default function AdminManagementPage() {
  const { user } = useAuthStore();
  const loggedInAdminId = user?.user_id || (user as any)?._id;

  const [admins, setAdmins]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await adminApi.getAdmins();
        setAdmins(res.data || []);
      } catch {
        toast.error('Failed to load admins');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (id === String(loggedInAdminId)) {
      toast.error('You cannot delete your own account');
      return;
    }
    if (!confirm(`Delete admin "${name}"? This action cannot be undone.`)) return;

    setActionLoading(id + '_del');
    try {
      await apiClient.delete(`/admin/delete/${id}`);
      setAdmins((prev) => prev.filter((a) => a._id !== id));
      toast.success('Admin deleted successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete admin');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBlockUnblock = async (id: string, isBlocked: boolean, name: string) => {
    if (id === String(loggedInAdminId)) {
      toast.error('You cannot block your own account');
      return;
    }
    const action = isBlocked ? 'unblock' : 'block';
    if (!confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} admin "${name}"?`)) return;

    setActionLoading(id + '_block');
    try {
      const res = await apiClient.put(`/admin/status/${id}`);
      setAdmins((prev) =>
        prev.map((a) => a._id === id ? { ...a, isBlocked: res.data.isBlocked } : a)
      );
      toast.success(`Admin ${res.data.isBlocked ? 'blocked' : 'unblocked'} successfully`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Failed to ${action} admin`);
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = admins.filter((a) =>
    (a.user_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (a.user_email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <div className="dashboard-page-header">
        <h1 className="dashboard-page-title">Admin Management</h1>
        <p className="dashboard-page-subtitle">
          All registered admins — <strong style={{ color: '#eb5e28' }}>{admins.length}</strong> total ·&nbsp;
          <strong style={{ color: '#4ade80' }}>{admins.filter(a => !a.isBlocked).length}</strong> active ·&nbsp;
          <strong style={{ color: '#f87171' }}>{admins.filter(a => a.isBlocked).length}</strong> blocked
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
                <th>Admin</th>
                <th>Email</th>
                <th>Verified</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: '#64748b', padding: 40 }}>
                    <ShieldCheck size={32} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.3 }} />
                    No admins found
                  </td>
                </tr>
              ) : filtered.map((a, i) => {
                const isSelf = String(a._id) === String(loggedInAdminId);
                return (
                  <tr key={a._id}>
                    <td style={{ color: '#4a5568', fontFamily: 'monospace' }}>{i + 1}</td>
                    <td>
                      <div className="td-name">
                        <div className="td-avatar" style={{ background: isSelf ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#eb5e28,#1c4ed8)', position: 'relative' }}>
                          {(a.user_name || 'A')[0].toUpperCase()}
                        </div>
                        <div>
                          <span style={{ fontWeight: 600, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 5 }}>
                            {a.user_name || '—'}
                            {isSelf && (
                              <span style={{ fontSize: 10, background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 20, padding: '1px 7px', fontWeight: 600 }}>
                                You
                              </span>
                            )}
                          </span>
                          <span style={{ fontSize: 11, color: '#475569' }}>{a.first_name || ''} {a.last_name || ''}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Mail size={13} color="#4a5568" />
                        <span style={{ color: '#94a3b8' }}>{a.user_email || '—'}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${a.isVerified ? 'confirmed' : 'pending'}`}>
                        {a.isVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                        background: a.isBlocked ? 'rgba(239,68,68,0.1)' : 'rgba(74,222,128,0.1)',
                        color: a.isBlocked ? '#f87171' : '#4ade80',
                        border: `1px solid ${a.isBlocked ? 'rgba(239,68,68,0.25)' : 'rgba(74,222,128,0.25)'}`
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: a.isBlocked ? '#f87171' : '#4ade80' }} />
                        {a.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {/* Block / Unblock */}
                        <button
                          className={`btn btn-sm ${a.isBlocked ? 'btn-success' : 'btn-warning'}`}
                          disabled={isSelf || actionLoading === a._id + '_block'}
                          onClick={() => handleBlockUnblock(a._id, a.isBlocked, a.user_name)}
                          title={isSelf ? 'Cannot block yourself' : a.isBlocked ? 'Unblock admin' : 'Block admin'}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 10px',
                            background: a.isBlocked ? 'rgba(74,222,128,0.12)' : 'rgba(251,191,36,0.12)',
                            border: a.isBlocked ? '1px solid rgba(74,222,128,0.25)' : '1px solid rgba(251,191,36,0.25)',
                            color: a.isBlocked ? '#4ade80' : '#fbbf24', borderRadius: 7,
                            cursor: isSelf ? 'not-allowed' : 'pointer', opacity: isSelf ? 0.45 : 1,
                            fontSize: 12, fontWeight: 600
                          }}
                        >
                          {actionLoading === a._id + '_block'
                            ? <Loader2 size={12} className="al-spin" />
                            : a.isBlocked ? <><Unlock size={12} /> Unblock</> : <><Lock size={12} /> Block</>
                          }
                        </button>

                        {/* Delete */}
                        <button
                          className="btn btn-danger btn-sm"
                          disabled={isSelf || actionLoading === a._id + '_del'}
                          onClick={() => handleDelete(a._id, a.user_name)}
                          title={isSelf ? 'Cannot delete yourself' : 'Delete admin'}
                          style={{ opacity: isSelf ? 0.45 : 1, cursor: isSelf ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        >
                          {actionLoading === a._id + '_del'
                            ? <Loader2 size={12} className="al-spin" />
                            : <><Trash2 size={12} /> Delete</>
                          }
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </motion.div>
    </motion.div>
  );
}
