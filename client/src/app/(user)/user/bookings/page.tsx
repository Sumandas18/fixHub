'use client';

import { useEffect, useState } from 'react';
import { Star, X, Loader2 } from 'lucide-react';
import { userApi } from '@/services/api/user';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { containerVariants, fadeUpVariant, scaleUpVariant } from '@/lib/animations';

const TABS = ['All', 'Upcoming', 'Accepted', 'Completed', 'Cancelled', 'Rejected'];

export default function UserBookingsPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [ratingVal, setRatingVal] = useState(0);
  const [reviewText, setReviewText] = useState('');
  
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await userApi.getBookings();
        setBookings(res.data || []);
      } catch (err) {
        toast.error('Failed to load your bookings');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const filtered = bookings.filter((b) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Upcoming') return b.status === 'pending' || b.status === 'confirmed' || b.status === 'in-progress';
    if (activeTab === 'Accepted') return b.status === 'accepted';
    if (activeTab === 'Completed') return b.status === 'completed';
    if (activeTab === 'Cancelled') return b.status === 'cancelled';
    if (activeTab === 'Rejected') return b.status === 'rejected';
    return true;
  });

  const getStatusColor = (s: string) => {
    if (s === 'pending') return '#eab308'; // yellow
    if (s === 'accepted' || s === 'confirmed') return '#22c55e'; // green
    if (s === 'rejected' || s === 'cancelled') return '#ef4444'; // red
    if (s === 'completed') return '#3b82f6'; // blue
    return '#94a3b8';
  };

  const getStatusText = (s: string) => {
    if (s === 'pending') return 'Waiting for approval';
    if (s === 'accepted') return 'Accepted';
    if (s === 'rejected') return 'Rejected';
    if (s === 'completed') return 'Completed';
    return s;
  };

  const handleRate = () => {
    if (selectedBooking) {
      selectedBooking.rating = ratingVal;
      toast.success('Review submitted successfully!');
      setSelectedBooking(null);
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={fadeUpVariant} className="usr-page-header">
        <h1 className="usr-page-title">My Bookings</h1>
        <p className="usr-page-subtitle">Track your upcoming services and review completed ones.</p>
      </motion.div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`usr-cat-pill ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
            style={{ padding: '8px 20px' }}
          >
            {tab}
          </button>
        ))}
      </div>

      <motion.div variants={fadeUpVariant} className="usr-card">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40}}>
             <Loader2 className="usr-spin" size={24} color="#eb5e28" />
          </div>
        ) : (
          <table className="usr-table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Provider</th>
                <th>Date & Time</th>
                <th>Price</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="usr-empty">
                      <div className="usr-empty-icon">📅</div>
                      <p className="usr-empty-text">No bookings found for this category.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <p style={{ fontWeight: 600, color: '#f1f5f9' }}>{b.service_provider_id?.service_id?.service_name || b.service_id?.service_name || 'Booked Service'}</p>
                      <p style={{ fontSize: 12, color: '#64748b', fontFamily: 'monospace' }}>{b._id.substring(b._id.length - 6).toUpperCase()}</p>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#eb5e28,#1c4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>
                          {(b.service_provider_id?.provider_id?.name || 'A')[0]}
                        </div>
                        {b.service_provider_id?.provider_id?.name || 'Awaiting Provider'}
                      </div>
                    </td>
                    <td style={{ color: '#94a3b8' }}>
                      {new Date(b.scheduled_date || b.createdAt).toLocaleDateString('en-US')}<br />
                      <span style={{ fontSize: 12, color: '#64748b' }}>{b.scheduled_time || 'TBD'}</span>
                    </td>
                    <td style={{ fontWeight: 600, color: '#4ade80' }}>{b.service_provider_id?.charges_per_hour ? `₹${b.service_provider_id.charges_per_hour}` : 'TBD'}</td>
                    <td>
                      <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: `${getStatusColor(b.status)}20`, color: getStatusColor(b.status), textTransform: 'capitalize' }}>
                        {getStatusText(b.status)}
                      </span>
                    </td>
                    <td>
                      {b.status === 'confirmed' && b.otp && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <span style={{ fontSize: 11, color: '#64748b' }}>Share OTP:</span>
                          <div style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: 6, letterSpacing: '2px', fontWeight: 700, color: '#f1f5f9', display: 'inline-block', width: 'fit-content' }}>
                            {b.otp}
                          </div>
                        </div>
                      )}
                      {b.status === 'completed' && !b.rating && (
                        <button className="usr-btn usr-btn-blue usr-btn-sm" onClick={() => { setSelectedBooking(b); setRatingVal(0); setReviewText(''); }}>
                          <Star size={13} /> Rate Service
                        </button>
                      )}
                      {b.status === 'completed' && b.rating > 0 && (
                        <div style={{ color: '#fbbf24', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Star size={14} fill="#fbbf24" /> {b.rating}/5
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </motion.div>

      {/* Rating Modal */}
      <AnimatePresence>
      {selectedBooking && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="usr-book-overlay" onClick={() => setSelectedBooking(null)}>
          <motion.div variants={scaleUpVariant} initial="hidden" animate="visible" exit="hidden" className="usr-book-modal" onClick={(e) => e.stopPropagation()}>
            <div className="usr-book-modal-header">
              <h3 className="usr-book-modal-title">Rate Service</h3>
              <button className="usr-modal-close" onClick={() => setSelectedBooking(null)}><X size={16} /></button>
            </div>
            <div className="usr-book-modal-body">
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 13, color: '#64748b' }}>Provider</p>
                <p style={{ fontSize: 16, fontWeight: 600, color: '#f1f5f9' }}>{selectedBooking.service_provider_id?.provider_id?.name || 'Provider'}</p>
                <p style={{ fontSize: 13, color: '#94a3b8' }}>{selectedBooking.service_provider_id?.service_id?.service_name || 'Booked Service'}</p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                <div className="usr-star-row">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`usr-star ${star <= ratingVal ? 'filled' : 'empty'}`}
                      onClick={() => setRatingVal(star)}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <div className="usr-field">
                <label className="usr-label">Write a review (optional)</label>
                <textarea
                  className="usr-input"
                  rows={4}
                  placeholder="How was your experience?"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>
            <div className="usr-book-modal-footer">
              <button className="usr-btn usr-btn-ghost" onClick={() => setSelectedBooking(null)}>Cancel</button>
              <button className="usr-btn usr-btn-primary" disabled={ratingVal === 0} onClick={handleRate}>
                Submit Review
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </motion.div>
  );
}
