'use client';

import { useEffect, useState } from 'react';
import { Loader2, ShieldCheck, Search, Mail, Trash2 } from 'lucide-react';
import { adminApi } from '@/services/api/admin';
import { apiClient } from '@/services/api/axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { containerVariants, fadeUpVariant } from '@/lib/animations';

export default function AdminManagementPage() {
  const [admins, setAdmins]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

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

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this admin? This action cannot be undone.')) return;
    setDeleting(id);
    try {
      await apiClient.delete(`/admin/delete/${id}`);
      setAdmins((prev) => prev.filter((a) => a._id !== id));
      toast.success('Admin deleted');
    } catch {
      toast.error('Failed to delete admin');
    } finally {
      setDeleting(null);
    }
  };

  const filtered = admins.filter((a) =>
    (a.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (a.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <div className="dashboard-page-header">
        <h1 className="dashboard-page-title">Admin Management</h1>
        <p className="dashboard-page-subtitle">
          All registered admins — <strong style={{ color: '#eb5e28' }}>{admins.length}</strong> total
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
              ) : filtered.map((a, i) => (
                <tr key={a._id}>
                  <td style={{ color: '#4a5568', fontFamily: 'monospace' }}>{i + 1}</td>
                  <td>
                    <div className="td-name">
                      <div className="td-avatar" style={{ background: 'linear-gradient(135deg,#eb5e28,#1c4ed8)' }}>
                        {(a.name || 'A')[0].toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{a.name || '—'}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Mail size={13} color="#4a5568" />
                      <span style={{ color: '#94a3b8' }}>{a.email || '—'}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${a.isVerified ? 'confirmed' : 'pending'}`}>
                      {a.isVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${a.isBlocked ? 'blocked' : 'active'}`}>
                      {a.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      disabled={deleting === a._id}
                      onClick={() => handleDelete(a._id)}
                    >
                      <Trash2 size={12} />
                      {deleting === a._id ? '...' : 'Delete'}
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
