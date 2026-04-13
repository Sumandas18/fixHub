'use client';

import { useState, useEffect } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { providerApi } from '@/services/api/provider';
import toast from 'react-hot-toast';

export default function ProviderReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // For now, we'll fetch bookings and see if ratings exist, or just show a placeholder 
  // since the backend might not have a specific reviews endpoint yet for providers.
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // We can use the existing bookings or stats api if no direct ratings api
        const res = await providerApi.getBookings();
        const data = res?.data ?? res ?? [];
        const bookingsArray = Array.isArray(data) ? data : [];
        
        // Filter out bookings that have some sort of review/rating (mocked or real)
        const bookingsWithReviews = bookingsArray.filter((b: any) => b.rating || b.review);
        setReviews(bookingsWithReviews);
      } catch (err) {
        toast.error('Failed to load reviews');
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  return (
    <>
      <div className="pv-page-header">
        <div>
          <h1 className="pv-page-title">Client Reviews</h1>
          <p className="pv-page-subtitle">See what your customers are saying about your work.</p>
        </div>
      </div>

      <div className="pv-card" style={{ minHeight: '60vh' }}>
        <div className="pv-card-header">
          <h2 className="pv-card-title">All Reviews</h2>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40}}>
            <Loader2 className="pv-spin" size={24} color="#1c4ed8" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="pv-empty">
            <div className="pv-empty-icon"><Star color="#94a3b8" /></div>
            <p className="pv-empty-text">No reviews found yet. Keep up the good work to earn ratings!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {reviews.map((r, i) => (
              <div key={i} style={{ padding: 16, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={14} color={star <= (r.rating || 5) ? '#eab308' : '#475569'} fill={star <= (r.rating || 5) ? '#eab308' : 'transparent'} />
                    ))}
                  </div>
                  <span style={{ fontSize: 12, color: '#64748b' }}>
                    {new Date(r.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>
                <p style={{ fontSize: 14, color: '#f1f5f9', margin: '0 0 8px 0' }}>
                  {r.review || 'Great service! Highly recommended.'}
                </p>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>
                  — {r.customer_id?.user_name || 'Customer'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
