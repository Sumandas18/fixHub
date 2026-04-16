'use client';

import { useState, useRef, useEffect } from 'react';
import { X, ShieldCheck, RefreshCw, ChevronDown, Loader2, CheckCircle, XCircle } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { scaleUpVariant } from '@/lib/animations';
import { providerApi } from '@/services/api/provider';

const STATUS_OPTIONS = ['accepted', 'in-progress', 'rejected'];
const TABS = ['All', 'Pending', 'Accepted', 'Completed', 'Rejected'];

type Booking = any;

export default function ProviderBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  // Modals
  const [statusModal, setStatusModal] = useState<Booking | null>(null);
  const [otpModal, setOtpModal] = useState<Booking | null>(null);
  const [rejectModal, setRejectModal] = useState<Booking | null>(null);

  // Form states
  const [selectedStatus, setSelectedStatus] = useState('');
  const [reason, setReason] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [otpValues, setOtpValues] = useState(['', '', '', '']);
  const [actionLoading, setActionLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const otpRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await providerApi.getBookings();
        setBookings(res.data.data || res.data || []);
      } catch (err) {
        toast.error('Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const filtered = activeTab === 'All'
    ? bookings
    : bookings.filter((b) => b.status === activeTab.toLowerCase());

  /* ── Status Modal ── */
  const openStatusModal = (b: Booking) => {
    setSelectedStatus(b.status === 'accepted' ? 'confirmed' : b.status);
    setReason('');
    setStatusModal(b);
  };

  const handleStatusUpdate = async () => {
    if (!statusModal) return;
    setActionLoading(true);
    try {
      await api.put(`/booking/status/${statusModal._id}`, { status: selectedStatus, reason });
      setBookings((prev) =>
        prev.map((b) => b._id === statusModal._id ? { ...b, status: selectedStatus } : b)
      );
      toast.success('Status updated successfully');
      setStatusModal(null);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Mark Complete -> triggers OTP ── */
  const handleMarkComplete = async (id: string) => {
    setActionLoading(true);
    try {
      await providerApi.confirmBooking(id, status = 'completed');

      const b = bookings.find((b) => b._id === id);
      toast.success('OTP sent to customer');
      openOtpModal(b);
    } catch {
      toast.error('Failed to mark complete');
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Accept / Reject ── */
  const handleAccept = async (id: string) => {
    setActionLoading(true);
    try {
      await providerApi.confirmBooking(id, status = 'confirmed');

      setBookings((prev) =>
        prev.map((b) =>
          b._id === id ? { ...b, status: 'accepted' } : b
        )
      );

      toast.success('Booking accepted successfully');
    } catch {
      toast.error('Failed to accept booking');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectModal) return;

    setActionLoading(true);
    try {
      await providerApi.cancelBooking(rejectModal._id, rejectReason);

      setBookings((prev) =>
        prev.map((b) =>
          b._id === rejectModal._id
            ? { ...b, status: 'rejected' }
            : b
        )
      );

      toast.success('Booking rejected');
      setRejectModal(null);
    } catch {
      toast.error('Failed to reject booking');
    } finally {
      setActionLoading(false);
    }
  };

  /* ── OTP Flow ── */
  const openOtpModal = (b: Booking) => {
    setOtpValues(['', '', '', '']);
    setOtpModal(b);
  };

  const handleOtpInput = (idx: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otpValues];
    next[idx] = val.slice(-1);
    setOtpValues(next);
    if (val && idx < 3) otpRefs[idx + 1].current?.focus();
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpValues[idx] && idx > 0) {
      otpRefs[idx - 1].current?.focus();
    }
  };

  const handleOtpVerify = async () => {
    const otp = otpValues.join('');
    if (otp.length < 4) return;
    setActionLoading(true);
    try {

      await providerApi.verifyOTP({ otp, bookingId: otpModal?._id });;

      setBookings((prev) =>
        prev.map((b) => b._id === otpModal?._id ? { ...b, otp_verified: true, status: 'completed' } : b)
      );
      toast.success('Service Completed');
      setOtpModal(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!otpModal || resendLoading) return;
    setResendLoading(true);
    setOtpValues(['', '', '', '']);
    try {
      await providerApi.resendOTP({ bookingId: otpModal?._id });

      toast.success('OTP resent successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <>
      <div className="pv-page-header">
        <div>
          <h1 className="pv-page-title">Bookings</h1>
          <p className="pv-page-subtitle">Manage customer bookings, update status, and verify OTPs.</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="pv-filter-tabs" style={{ marginBottom: 22 }}>
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`pv-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="pv-card">
        <table className="pv-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Customer</th>
              <th>Service</th>
              <th>Scheduled</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 60 }}>
                  <Loader2 size={28} className="al-spin" style={{ margin: '0 auto', color: '#60a5fa' }} />
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="pv-empty">
                    <div className="pv-empty-icon">📅</div>
                    <p className="pv-empty-text">No bookings found for this filter.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((b) => (
                <tr key={b._id}>
                  <td style={{ color: '#60a5fa', fontWeight: 600, fontFamily: 'monospace' }}>{b._id.substring(b._id.length - 6).toUpperCase()}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="pv-avatar" style={{ width: 28, height: 28, fontSize: 12 }}>
                        {(b.customer?.user_name || 'U')[0].toUpperCase()}
                      </div>
                      {b.customer?.user_name || 'Customer'}
                    </div>
                  </td>
                  <td>{b.service?.service_name || 'Booked Service'}</td>
                  <td style={{ fontSize: 13, color: '#64748b' }}>
                    {b.scheduled_date ? new Date(b.scheduled_date).toLocaleDateString() : 'TBD'}<br />
                    <span style={{ color: '#334155', fontSize: 11 }}>{b.scheduled_time || 'TBD'}</span>
                  </td>
                  <td>
                    <span className={`pv-badge ${b.status}`}>{b.status}</span>
                  </td>
                  <td>
                    <div className="pv-actions-cell" style={{ gap: 8 }}>
                      {b.status === 'pending' ? (
                        <>
                          <button
                            className="pv-btn pv-btn-success pv-btn-sm"
                            onClick={() => handleAccept(b._id)}
                            disabled={actionLoading}
                          >
                            <CheckCircle size={13} /> Accept
                          </button>
                          <button
                            className="pv-btn pv-btn-danger pv-btn-sm"
                            onClick={() => { setRejectModal(b); setRejectReason(''); }}
                            disabled={actionLoading}
                          >
                            <XCircle size={13} /> Reject
                          </button>
                        </>
                      ) : (
                        <>
                          {/* Specific Complete Action */}
                          {b.status === 'accepted' && (
                            <button
                              className="pv-btn pv-btn-otp pv-btn-sm"
                              onClick={() => handleMarkComplete(b._id)}
                              disabled={actionLoading}
                            >
                              <ShieldCheck size={13} /> Complete
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Status Update Modal ── */}
      <AnimatePresence>
        {statusModal && (
          <div className="pv-modal-overlay" onClick={() => setStatusModal(null)}>
            <motion.div variants={scaleUpVariant} initial="hidden" animate="visible" exit="hidden" className="pv-modal" onClick={(e) => e.stopPropagation()}>
              <div className="pv-modal-header">
                <h3 className="pv-modal-title">Update Booking Status</h3>
                <button className="pv-modal-close" onClick={() => setStatusModal(null)}><X size={16} /></button>
              </div>
              <div className="pv-modal-body">
                <div style={{ marginBottom: 10 }}>
                  <p style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>Booking</p>
                  <p style={{ fontSize: 15, fontWeight: 600, color: '#f1f5f9' }}>
                    {statusModal._id.substring(statusModal._id.length - 6).toUpperCase()} · {statusModal.customer_id?.name || 'Customer'}
                  </p>
                </div>

                <div className="pv-field" style={{ marginTop: 18 }}>
                  <label className="pv-label">New Status</label>
                  <select
                    className="pv-select"
                    style={{ width: '100%' }}
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>

                {(selectedStatus === 'cancelled') && (
                  <div className="pv-field">
                    <label className="pv-label">Reason (optional)</label>
                    <textarea
                      className="pv-input"
                      rows={3}
                      placeholder="Reason for cancellation..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                )}
              </div>
              <div className="pv-modal-footer">
                <button className="pv-btn pv-btn-ghost" onClick={() => setStatusModal(null)} disabled={actionLoading}>Cancel</button>
                <button className="pv-btn pv-btn-primary" onClick={handleStatusUpdate} disabled={actionLoading}>
                  {actionLoading ? <Loader2 size={15} className="al-spin" /> : 'Update Status'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Reject Modal ── */}
      <AnimatePresence>
        {rejectModal && (
          <div className="pv-modal-overlay" onClick={() => setRejectModal(null)}>
            <motion.div variants={scaleUpVariant} initial="hidden" animate="visible" exit="hidden" className="pv-modal" onClick={(e) => e.stopPropagation()}>
              <div className="pv-modal-header">
                <h3 className="pv-modal-title" style={{ color: '#f87171' }}>Reject Request</h3>
                <button className="pv-modal-close" onClick={() => setRejectModal(null)}><X size={16} /></button>
              </div>
              <div className="pv-modal-body">
                <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16 }}>
                  Are you sure you want to reject this booking? You can provide a reason to the customer.
                </p>
                <div className="pv-field">
                  <label className="pv-label">Reason for Rejection <span style={{ color: '#64748b', fontWeight: 400 }}>(Optional)</span></label>
                  <textarea
                    className="pv-input"
                    rows={4}
                    placeholder="E.g., Fully booked, issue out of scope..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>
              <div className="pv-modal-footer">
                <button className="pv-btn pv-btn-ghost" onClick={() => setRejectModal(null)} disabled={actionLoading}>Cancel</button>
                <button className="pv-btn pv-btn-danger" onClick={handleRejectSubmit} disabled={actionLoading}>
                  {actionLoading ? <Loader2 size={15} className="al-spin" /> : 'Reject Booking'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── OTP Verify Modal ── */}
      <AnimatePresence>
        {otpModal && (
          <div className="pv-modal-overlay" onClick={() => setOtpModal(null)}>
            <motion.div variants={scaleUpVariant} initial="hidden" animate="visible" exit="hidden" className="pv-modal" onClick={(e) => e.stopPropagation()}>
              <div className="pv-modal-header">
                <h3 className="pv-modal-title" style={{ color: '#4ade80' }}>Verify OTP to Complete</h3>
                <button className="pv-modal-close" onClick={() => setOtpModal(null)}><X size={16} /></button>
              </div>
              <div className="pv-modal-body">
                <p className="pv-otp-hint">
                  Ask the customer for their <strong style={{ color: '#f1f5f9' }}>4-digit OTP</strong> to confirm the job is formally completed.
                  <br />Booking: <strong style={{ color: '#60a5fa' }}>{otpModal._id.substring(otpModal._id.length - 6).toUpperCase()}</strong>
                </p>

                <div className="pv-otp-boxes">
                  {[0, 1, 2, 3].map((idx) => (
                    <input
                      key={idx}
                      ref={otpRefs[idx]}
                      type="text"
                      maxLength={1}
                      inputMode="numeric"
                      className="pv-otp-box"
                      value={otpValues[idx]}
                      onChange={(e) => handleOtpInput(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    />
                  ))}
                </div>

                <p className="pv-otp-resend">
                  Customer didn't receive it?
                  <button onClick={handleResendOtp} disabled={resendLoading}>
                    <RefreshCw size={12} style={{ display: 'inline', marginRight: 4 }} className={resendLoading ? 'al-spin' : ''} />
                    {resendLoading ? 'Sending...' : 'Resend OTP'}
                  </button>
                </p>
              </div>
              <div className="pv-modal-footer">
                <button className="pv-btn pv-btn-ghost" onClick={() => setOtpModal(null)} disabled={actionLoading}>Cancel</button>
                <button
                  className="pv-btn pv-btn-primary"
                  onClick={handleOtpVerify}
                  disabled={otpValues.join('').length < 4 || actionLoading}
                  style={{ opacity: otpValues.join('').length < 4 ? 0.5 : 1, background: '#1c4ed8', boxShadow: 'none' }}
                >
                  {actionLoading ? <Loader2 size={15} className="al-spin" /> : <><ShieldCheck size={15} /> Verify OTP</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
