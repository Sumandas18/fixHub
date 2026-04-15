'use client';

import { useState, useRef, useEffect } from 'react';
import { X, ShieldCheck, RefreshCw, ChevronDown, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['confirmed', 'in-progress', 'completed', 'cancelled'];
const TABS = ['All', 'Pending', 'Accepted', 'Confirmed', 'In-Progress', 'Completed', 'Cancelled'];

type Booking = any;

export default function ProviderBookingsPage() {
  const [bookings, setBookings]         = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [activeTab, setActiveTab]       = useState('All');
  const [statusModal, setStatusModal]   = useState<Booking | null>(null);
  const [otpModal, setOtpModal]         = useState<Booking | null>(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [reason, setReason]            = useState('');
  const [otpValues, setOtpValues]      = useState(['', '', '', '']);
  const [actionLoading, setActionLoading] = useState(false);
  const otpRefs                         = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get('/booking/provider'); // Wait, the endpoint might just be /booking for provider, actually bookingRoute.js has /provider for getProviderBookings!
        // Admin accepts it, but if it has no provider_id assigned automatically (abstract booking) this depends on how abstract bookings are retrieved.
        // Assuming provider only sees their assigned or broadcasted accepted ones.
        setBookings(res.data.data || res.data || []);
      } catch (err) {
        toast.error('Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  // Show all bookings — provider needs to see pending ones to accept/reject
  const filtered = activeTab === 'All'
    ? bookings
    : bookings.filter((b) => b.status === activeTab.toLowerCase());

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
        prev.map((b) => b._id === statusModal?._id ? { ...b, status: selectedStatus } : b)
      );
      toast.success('Status updated successfully');
      setStatusModal(null);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptReject = async (id: string, status: 'accepted' | 'rejected') => {
    setActionLoading(true);
    try {
      await api.patch(`/booking/${id}`, { status });
      setBookings((prev) =>
        prev.map((b) => b._id === id ? { ...b, status } : b)
      );
      toast.success(`Booking ${status} successfully`);
    } catch {
      toast.error(`Failed to ${status} booking`);
    } finally {
      setActionLoading(false);
    }
  };

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
      await api.put('/booking/verify-otp', { otp, bookingId: otpModal?._id });
      setBookings((prev) =>
        prev.map((b) => b._id === otpModal?._id ? { ...b, otp_verified: true, status: 'in-progress' } : b)
      );
      toast.success('OTP Verified');
      setOtpModal(null);
    } catch {
      toast.error('Invalid OTP');
    } finally {
      setActionLoading(false);
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
              <th>OTP</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
               <tr>
                 <td colSpan={7} style={{ textAlign: 'center', padding: 60 }}>
                    <Loader2 size={28} className="al-spin" style={{ margin: '0 auto', color: '#60a5fa' }} />
                 </td>
               </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7}>
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
                        {(b.customer_id?.user_name || 'U')[0].toUpperCase()}
                      </div>
                      {b.customer_id?.user_name || 'Customer'}
                    </div>
                  </td>
                  <td>{b.service_id?.service_name || b.service_provider_id?.service_id?.service_name || 'Booked Service'}</td>
                  <td style={{ fontSize: 13, color: '#64748b' }}>
                    {b.scheduled_date ? new Date(b.scheduled_date).toLocaleDateString() : 'TBD'}<br />
                    <span style={{ color: '#334155', fontSize: 11 }}>{b.scheduled_time || 'TBD'}</span>
                  </td>
                  <td>
                    <span className={`pv-badge ${b.status}`}>{b.status}</span>
                  </td>
                  <td>
                    {b.otp_verified ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#4ade80', fontSize: 12, fontWeight: 600 }}>
                        <ShieldCheck size={14} /> Verified
                      </span>
                    ) : (
                      <span style={{ color: '#64748b', fontSize: 12 }}>Not verified</span>
                    )}
                  </td>
                  <td>
                    <div className="pv-actions-cell">
                      {b.status === 'pending' ? (
                        <>
                          <button
                            className="pv-btn pv-btn-success pv-btn-sm"
                            onClick={() => handleAcceptReject(b._id, 'accepted')}
                            disabled={actionLoading}
                          >
                            ✓ Accept
                          </button>
                          <button
                            className="pv-btn pv-btn-danger pv-btn-sm"
                            onClick={() => handleAcceptReject(b._id, 'rejected')}
                            disabled={actionLoading}
                          >
                            ✗ Reject
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="pv-btn pv-btn-ghost pv-btn-sm"
                            onClick={() => openStatusModal(b)}
                            disabled={b.status === 'completed' || b.status === 'rejected'}
                          >
                            <ChevronDown size={13} /> Status
                          </button>
                          {!b.otp_verified && b.status !== 'cancelled' && b.status !== 'completed' && b.status !== 'rejected' && (
                            <button
                              className="pv-btn pv-btn-otp pv-btn-sm"
                              onClick={() => openOtpModal(b)}
                            >
                              <ShieldCheck size={13} /> OTP
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
      {statusModal && (
        <div className="pv-modal-overlay" onClick={() => setStatusModal(null)}>
          <div className="pv-modal" onClick={(e) => e.stopPropagation()}>
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
                <p style={{ fontSize: 13, color: '#475569' }}>{statusModal.service_id?.service_name || statusModal.service_provider_id?.service_id?.service_name || 'Booked Service'}</p>
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
          </div>
        </div>
      )}

      {/* ── OTP Verify Modal ── */}
      {otpModal && (
        <div className="pv-modal-overlay" onClick={() => setOtpModal(null)}>
          <div className="pv-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pv-modal-header">
              <h3 className="pv-modal-title">Verify Booking OTP</h3>
              <button className="pv-modal-close" onClick={() => setOtpModal(null)}><X size={16} /></button>
            </div>
            <div className="pv-modal-body">
              <p className="pv-otp-hint">
                Ask the customer for their <strong style={{ color: '#f1f5f9' }}>4-digit OTP</strong> to confirm the job has started.
                <br />Booking: <strong style={{ color: '#60a5fa' }}>{otpModal._id.substring(otpModal._id.length - 6).toUpperCase()}</strong> · {otpModal.customer_id?.name || 'Customer'}
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
                Didn't receive?
                <button onClick={() => {}}>
                  <RefreshCw size={12} style={{ display: 'inline', marginRight: 4 }} />
                  Resend OTP
                </button>
              </p>
            </div>
            <div className="pv-modal-footer">
              <button className="pv-btn pv-btn-ghost" onClick={() => setOtpModal(null)} disabled={actionLoading}>Cancel</button>
              <button
                className="pv-btn pv-btn-primary"
                onClick={handleOtpVerify}
                disabled={otpValues.join('').length < 4 || actionLoading}
                style={{ opacity: otpValues.join('').length < 4 ? 0.5 : 1 }}
              >
                {actionLoading ? <Loader2 size={15} className="al-spin" /> : <><ShieldCheck size={15} /> Verify OTP</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
