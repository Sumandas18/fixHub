'use client';

import { useEffect, useState } from 'react';
import { Loader2, MessageSquare, Search, Send, X, CheckCircle, XCircle, Mail } from 'lucide-react';
import { adminApi } from '@/services/api/admin';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { containerVariants, fadeUpVariant, scaleUpVariant } from '@/lib/animations';

const STATUS_FILTER = ['all', 'completed', 'rejected'] as const;

export default function AdminContactPage() {
  const [contacts, setContacts]           = useState<any[]>([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState('');
  const [activeFilter, setActiveFilter]   = useState<'all' | 'completed' | 'rejected'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Reply modal
  const [replyModal, setReplyModal] = useState<any | null>(null);
  const [replyText, setReplyText]   = useState('');
  const [replying, setReplying]     = useState(false);

  /* ── Fetch ── */
  const fetchContacts = async (status: typeof activeFilter = activeFilter) => {
    setLoading(true);
    try {
      const res = await adminApi.getContacts(status);
      setContacts(res.data || []);
    } catch {
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchContacts('all'); }, []);

  const handleFilterChange = (f: typeof activeFilter) => {
    setActiveFilter(f);
    fetchContacts(f);
  };

  /* ── Reply ── */
  const openReply = (contact: any) => {
    setReplyModal(contact);
    setReplyText('');
  };

  const handleReply = async () => {
    if (!replyModal || !replyText.trim()) return;
    setReplying(true);
    try {
      await adminApi.replyContact(replyModal._id, replyText.trim());
      setContacts(prev =>
        prev.map(c => c._id === replyModal._id ? { ...c, status: 'completed', reply: replyText.trim() } : c)
      );
      toast.success('Reply sent successfully!');
      setReplyModal(null);
    } catch {
      toast.error('Failed to send reply');
    } finally {
      setReplying(false);
    }
  };

  /* ── Deny ── */
  const handleDeny = async (id: string) => {
    setActionLoading(id);
    try {
      await adminApi.denyContact(id);
      setContacts(prev =>
        prev.map(c => c._id === id ? { ...c, status: 'rejected' } : c)
      );
      toast.success('Message closed');
    } catch {
      toast.error('Failed to close message');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = contacts.filter(c =>
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.message || '').toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = (s: string) => {
    if (s === 'completed') return { badge: 'confirmed', label: 'Replied' };
    if (s === 'rejected') return { badge: 'blocked', label: 'Closed' };
    return { badge: 'pending', label: 'Pending' };
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      {/* Header */}
      <div className="dashboard-page-header">
        <h1 className="dashboard-page-title">Contact Messages</h1>
        <p className="dashboard-page-subtitle">
          User enquiries — <strong style={{ color: '#eb5e28' }}>{contacts.length}</strong> total
        </p>
      </div>

      {/* Filter tabs */}
      <motion.div variants={fadeUpVariant} style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {STATUS_FILTER.map(f => (
          <button
            key={f}
            onClick={() => handleFilterChange(f)}
            style={{
              padding: '7px 16px', fontSize: 12, fontWeight: 600, borderRadius: 8, cursor: 'pointer',
              border: '1px solid', transition: 'all 0.2s',
              background: activeFilter === f ? '#eb5e28' : 'rgba(255,255,255,0.04)',
              color: activeFilter === f ? '#fff' : '#64748b',
              borderColor: activeFilter === f ? '#eb5e28' : 'rgba(255,255,255,0.08)',
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}

        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '7px 14px', marginLeft: 'auto', minWidth: 260 }}>
          <Search size={14} color="#4a5568" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search messages…" style={{ background: 'none', border: 'none', outline: 'none', color: '#94a3b8', fontSize: 13, width: '100%' }} />
        </div>
      </motion.div>

      {/* Table */}
      <motion.div variants={fadeUpVariant} className="data-card">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <Loader2 size={28} color="#eb5e28" className="al-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>
            <MessageSquare size={36} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
            <p>No messages found</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Subject</th>
                <th>Message</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => {
                const { badge, label } = statusColor(c.status || 'pending');
                return (
                  <tr key={c._id}>
                    <td style={{ color: '#4a5568', fontFamily: 'monospace' }}>{i + 1}</td>
                    <td>
                      <div className="td-name">
                        <div className="td-avatar">{(c.name || 'U')[0].toUpperCase()}</div>
                        <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{c.name || '—'}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8' }}>
                        <Mail size={12} color="#4a5568" />
                        {c.email || '—'}
                      </div>
                    </td>
                    <td style={{ color: '#94a3b8', maxWidth: 140 }}>
                      <span style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {c.subject || '—'}
                      </span>
                    </td>
                    <td style={{ color: '#94a3b8', maxWidth: 200 }}>
                      <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {c.message || '—'}
                      </span>
                    </td>
                    <td><span className={`badge ${badge}`}>{label}</span></td>
                    <td style={{ color: '#64748b', fontSize: 12 }}>
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </td>
                    <td>
                      {c.status === 'pending' || !c.status ? (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => openReply(c)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
                          >
                            <Send size={12} /> Reply
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            disabled={actionLoading === c._id}
                            onClick={() => handleDeny(c._id)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
                          >
                            {actionLoading === c._id ? <Loader2 size={12} className="al-spin" /> : <XCircle size={12} />}
                            Close
                          </button>
                        </div>
                      ) : c.status === 'completed' ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#4ade80', fontSize: 12, fontWeight: 600 }}>
                          <CheckCircle size={13} /> Replied
                        </span>
                      ) : (
                        <span style={{ color: '#475569', fontSize: 12 }}>Closed</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </motion.div>

      {/* ── Reply Modal ── */}
      <AnimatePresence>
        {replyModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setReplyModal(null)}
            style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          >
            <motion.div
              variants={scaleUpVariant} initial="hidden" animate="visible" exit="hidden"
              onClick={e => e.stopPropagation()}
              style={{ width: '100%', maxWidth: 540, background: 'rgba(17,24,39,0.97)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, boxShadow: '0 32px 80px rgba(0,0,0,0.6)', overflow: 'hidden' }}
            >
              {/* Modal header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#eb5e28,#d2501e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Send size={16} color="#fff" />
                  </div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>Reply to Message</p>
                    <p style={{ fontSize: 12, color: '#64748b' }}>From: {replyModal.name} ({replyModal.email})</p>
                  </div>
                </div>
                <button onClick={() => setReplyModal(null)} style={{ width: 32, height: 32, border: 'none', background: 'rgba(255,255,255,0.06)', borderRadius: 8, color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={15} />
                </button>
              </div>

              {/* Message preview */}
              <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8 }}>Original Message</p>
                <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.7, padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                  {replyModal.message}
                </p>
              </div>

              {/* Reply box */}
              <div style={{ padding: '20px 24px' }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8 }}>Your Reply *</label>
                <textarea
                  rows={5}
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Type your reply here…"
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#f1f5f9', fontSize: 14, outline: 'none', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(235,94,40,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>

              {/* Footer */}
              <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button onClick={() => setReplyModal(null)} className="btn btn-secondary" disabled={replying} style={{ fontFamily: 'inherit' }}>
                  Cancel
                </button>
                <button
                  onClick={handleReply}
                  disabled={!replyText.trim() || replying}
                  className="btn btn-primary"
                  style={{ fontFamily: 'inherit', minWidth: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, opacity: (!replyText.trim() || replying) ? 0.6 : 1 }}
                >
                  {replying ? <><Loader2 size={14} className="al-spin" /> Sending…</> : <><Send size={14} /> Send Reply</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
