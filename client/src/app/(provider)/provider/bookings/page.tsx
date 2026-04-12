'use client';

import { useState, useRef } from 'react';
import { X, ShieldCheck, RefreshCw, ChevronDown } from 'lucide-react';

const PLACEHOLDER_BOOKINGS = [
  { id: 'BK-101', customer: 'Rahul Sharma',  service: 'Wiring Fix',         date: 'Apr 12, 2026', time: '10:00 AM', status: 'confirmed',   otp_verified: false },
  { id: 'BK-102', customer: 'Priya Mehta',   service: 'Panel Installation',  date: 'Apr 12, 2026', time: '02:00 PM', status: 'in-progress', otp_verified: true  },
  { id: 'BK-103', customer: 'Amit Verma',    service: 'AC Power Issue',      date: 'Apr 13, 2026', time: '09:30 AM', status: 'pending',     otp_verified: false },
  { id: 'BK-104', customer: 'Sunita Rao',    service: 'Socket Replacement',  date: 'Apr 14, 2026', time: '11:00 AM', status: 'confirmed',   otp_verified: false },
  { id: 'BK-105', customer: 'Kiran Joshi',   service: 'MCB Repair',          date: 'Apr 10, 2026', time: '03:00 PM', status: 'completed',   otp_verified: true  },
  { id: 'BK-106', customer: 'Deepa Nair',    service: 'Fan Installation',    date: 'Apr 09, 2026', time: '01:00 PM', status: 'cancelled',   otp_verified: false },
];

const STATUS_OPTIONS = ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'];
const TABS = ['All', 'Pending', 'Confirmed', 'In-Progress', 'Completed', 'Cancelled'];

type Booking = typeof PLACEHOLDER_BOOKINGS[0];

export default function ProviderBookingsPage() {
  const [bookings, setBookings]         = useState(PLACEHOLDER_BOOKINGS);
  const [activeTab, setActiveTab]       = useState('All');
  const [statusModal, setStatusModal]   = useState<Booking | null>(null);
  const [otpModal, setOtpModal]         = useState<Booking | null>(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [reason, setReason]            = useState('');
  const [otpValues, setOtpValues]      = useState(['', '', '', '']);
  const otpRefs                         = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  const filtered = activeTab === 'All'
    ? bookings
    : bookings.filter((b) => b.status === activeTab.toLowerCase().replace('-', '-'));

  const openStatusModal = (b: Booking) => {
    setSelectedStatus(b.status);
    setReason('');
    setStatusModal(b);
  };

  const handleStatusUpdate = () => {
    setBookings((prev) =>
      prev.map((b) => b.id === statusModal?.id ? { ...b, status: selectedStatus } : b)
    );
    setStatusModal(null);
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

  const handleOtpVerify = () => {
    const otp = otpValues.join('');
    if (otp.length < 4) return;
    // Integrate with API: POST /booking/verify-otp { otp, bookingId }
    setBookings((prev) =>
      prev.map((b) => b.id === otpModal?.id ? { ...b, otp_verified: true, status: 'in-progress' } : b)
    );
    setOtpModal(null);
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
            {filtered.length === 0 ? (
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
                <tr key={b.id}>
                  <td style={{ color: '#60a5fa', fontWeight: 600, fontFamily: 'monospace' }}>{b.id}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="pv-avatar" style={{ width: 28, height: 28, fontSize: 12 }}>
                        {b.customer[0]}
                      </div>
                      {b.customer}
                    </div>
                  </td>
                  <td>{b.service}</td>
                  <td style={{ fontSize: 13, color: '#64748b' }}>
                    {b.date}<br />
                    <span style={{ color: '#334155', fontSize: 11 }}>{b.time}</span>
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
                      <button
                        className="pv-btn pv-btn-ghost pv-btn-sm"
                        onClick={() => openStatusModal(b)}
                      >
                        <ChevronDown size={13} /> Status
                      </button>
                      {!b.otp_verified && b.status !== 'cancelled' && b.status !== 'completed' && (
                        <button
                          className="pv-btn pv-btn-otp pv-btn-sm"
                          onClick={() => openOtpModal(b)}
                        >
                          <ShieldCheck size={13} /> OTP
                        </button>
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
                  {statusModal.id} · {statusModal.customer}
                </p>
                <p style={{ fontSize: 13, color: '#475569' }}>{statusModal.service}</p>
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
              <button className="pv-btn pv-btn-ghost" onClick={() => setStatusModal(null)}>Cancel</button>
              <button className="pv-btn pv-btn-primary" onClick={handleStatusUpdate}>Update Status</button>
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
                <br />Booking: <strong style={{ color: '#60a5fa' }}>{otpModal.id}</strong> · {otpModal.customer}
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
              <button className="pv-btn pv-btn-ghost" onClick={() => setOtpModal(null)}>Cancel</button>
              <button
                className="pv-btn pv-btn-primary"
                onClick={handleOtpVerify}
                disabled={otpValues.join('').length < 4}
                style={{ opacity: otpValues.join('').length < 4 ? 0.5 : 1 }}
              >
                <ShieldCheck size={15} /> Verify OTP
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
