'use client';

import { useEffect, useState } from 'react';
import { Loader2, UserCheck, Search, CheckCircle, XCircle, Shield, ShieldOff, FileText, X } from 'lucide-react';
import { adminApi } from '@/services/api/admin';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { containerVariants, fadeUpVariant, scaleUpVariant } from '@/lib/animations';

export default function AdminProvidersPage() {
  const [providers, setProviders]         = useState<any[]>([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Document preview modal
  const [docModal, setDocModal] = useState<{ url: string; name: string } | null>(null);

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

  /* ── Approve / Reject ── */
  const handleApprove = async (id: string, action: 'approve' | 'reject') => {
    setActionLoading(id + action);
    try {
      await adminApi.approveProvider(id, action);
      setProviders(prev =>
        prev.map(p =>
          p._id === id
            ? { ...p, service: { ...p.service, status: action === 'approve' ? 'approved' : 'rejected' } }
            : p
        )
      );
      toast.success(`Provider ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
    } catch {
      toast.error(`Failed to ${action} provider`);
    } finally {
      setActionLoading(null);
    }
  };

  /* ── Block / Unblock ── */
  const handleBlockUnblock = async (id: string, isCurrentlyBlocked: boolean) => {
    setActionLoading(id + 'block');
    try {
      await adminApi.blockUnblockProvider(id);
      setProviders(prev =>
        prev.map(p => p._id === id ? { ...p, isBlocked: !p.isBlocked } : p)
      );
      toast.success(`Provider ${isCurrentlyBlocked ? 'unblocked' : 'blocked'} successfully`);
    } catch {
      toast.error('Failed to update provider status');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = providers.filter(p =>
    (p.user_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.user_email || '').toLowerCase().includes(search.toLowerCase())
  );
console.log(docModal,filtered);

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
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." style={{ background: 'none', border: 'none', outline: 'none', color: '#94a3b8', fontSize: 13, width: '100%' }} />
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
                <th>Approval</th>
                <th>Account</th>
                <th>Document</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', color: '#64748b', padding: 40 }}>
                    <UserCheck size={32} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.3 }} />
                    No providers found
                  </td>
                </tr>
              ) : filtered.map((p, i) => (
                <tr key={p._id}>
                  <td style={{ color: '#4a5568', fontFamily: 'monospace' }}>{i + 1}</td>
                  <td>
                    <div className="td-name">
                      <div className="td-avatar">{(p.user_name || 'P')[0].toUpperCase()}</div>
                      <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{p.user_name || '—'}</span>
                    </div>
                  </td>
                  <td style={{ color: '#94a3b8' }}>{p.user_email || '—'}</td>
                  <td style={{ color: '#94a3b8' }}>{p.user_contact || '—'}</td>
                  <td style={{ color: '#94a3b8' }}>{p.service?.experience || '—'}</td>

                  {/* Approval Status */}
                  <td>
                    <span className={`badge ${
                      p.service?.status === 'approved' ? 'confirmed' :
                      p.service?.status === 'rejected' ? 'blocked' : 'pending'
                    }`}>
                      {p.service?.status
                        ? p.service.status.charAt(0).toUpperCase() + p.service.status.slice(1)
                        : 'Pending'
                      }
                    </span>
                  </td>

                  {/* Account Status */}
                  <td>
                    <span className={`badge ${p.isBlocked ? 'blocked' : 'active'}`}>
                      {p.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>

                  {/* Document Preview */}
                  <td>
                    {p.doc_url ? (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setDocModal({ url: p.doc_url, name: p.user_name })}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
                      >
                        <FileText size={12} /> View Doc
                      </button>
                    ) : (
                      <span style={{ color: '#475569', fontSize: 12 }}>—</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {/* Approve / Reject */}
                      {p.service?.status === 'pending' ? (
                        <>
                          <button className="btn btn-success btn-sm" disabled={actionLoading === p._id + 'approve'} onClick={() => handleApprove(p._id, 'approve')}>
                            {actionLoading === p._id + 'approve' ? <Loader2 size={12} className="al-spin" /> : <CheckCircle size={12} />}
                            Approve
                          </button>
                          <button className="btn btn-danger btn-sm" disabled={actionLoading === p._id + 'reject'} onClick={() => handleApprove(p._id, 'reject')}>
                            {actionLoading === p._id + 'reject' ? <Loader2 size={12} className="al-spin" /> : <XCircle size={12} />}
                            Reject
                          </button>
                        </>
                      ) : (
                        <button className="btn btn-secondary btn-sm" disabled={!!actionLoading} onClick={() => handleApprove(p._id, p.service?.status === 'approved' ? 'reject' : 'approve')}>
                          {p.service?.status === 'approved' ? <><XCircle size={12} /> Revoke</> : <><CheckCircle size={12} /> Re-approve</>}
                        </button>
                      )}

                      {/* Block / Unblock */}
                      <button
                        className={`btn btn-sm ${p.isBlocked ? 'btn-success' : 'btn-danger'}`}
                        disabled={actionLoading === p._id + 'block'}
                        onClick={() => handleBlockUnblock(p._id, p.isBlocked)}
                      >
                        {actionLoading === p._id + 'block'
                          ? <Loader2 size={12} className="al-spin" />
                          : p.isBlocked
                            ? <><Shield size={12} /> Unblock</>
                            : <><ShieldOff size={12} /> Block</>
                        }
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>

      {/* ── Document Preview Modal ── */}
      <AnimatePresence>
        {docModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setDocModal(null)}
            style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          >
            <motion.div
              variants={scaleUpVariant} initial="hidden" animate="visible" exit="hidden"
              onClick={e => e.stopPropagation()}
              style={{ width: '90%', maxWidth: 700, background: 'rgba(17,24,39,0.97)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}
            >
              {/* Modal header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <FileText size={18} color="#eb5e28" />
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>
                    Document — {docModal.name}
                  </p>
                </div>
                <button onClick={() => setDocModal(null)} style={{ width: 32, height: 32, border: 'none', background: 'rgba(255,255,255,0.06)', borderRadius: 8, color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={15} />
                </button>
              </div>
              {/* Document preview */}
              <div style={{ padding: 16, maxHeight: '70vh', overflow: 'auto' }}>
                {docModal.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                  <img src={docModal.url} alt="Provider document" style={{ width: '100%', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }} />
                ) : (
                  <iframe
                    src={docModal.url}
                    title="Provider document"
                    style={{ width: '100%', height: '60vh', border: 'none', borderRadius: 10 }}
                  />
                )}
              </div>
              <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.07)', textAlign: 'right' }}>
                <a href={docModal.url} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                  <FileText size={13} /> Open in New Tab
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
