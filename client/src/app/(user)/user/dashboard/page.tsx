'use client';

import { useEffect, useState } from 'react';
import { Search, Star, X, CalendarDays, Clock, Loader2, MapPin } from 'lucide-react';
import { userApi } from '@/services/api/user';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { containerVariants, fadeUpVariant, scaleUpVariant } from '@/lib/animations';

// We can map backend categories or just use this predefined list if the backend uses standard categories
const CATEGORIES = ['All', 'Electricity', 'Plumbing', 'Cleaning', 'Carpentry', 'Painting', 'General'];
const BANNER_COLORS = ['#fbbf24', '#60a5fa', '#a5f3fc', '#4ade80', '#fb923c', '#f9a8d4'];

const getRandomEmoji = (category: string) => {
  const map: Record<string, string> = {
    'Electricity': '⚡', 'Plumbing': '🚿', 'Cleaning': '🏠', 'Carpentry': '🪵', 'Painting': '🎨'
  };
  return map[category] || '🔧';
};

export default function UserDashboardPage() {
  const { user } = useAuthStore();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Data State
  const [services, setServices] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // Booking State
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<any | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingStep, setBookingStep] = useState<'providers' | 'form' | 'success'>('providers');
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const fetchDashboardServices = async () => {
      try {
        const res = await userApi.getServices();
        setServices(res.data || []);
      } catch (err) {
        toast.error('Failed to load services');
      } finally {
        setPageLoading(false);
      }
    };
    fetchDashboardServices();
  }, []);

  const filtered = services.filter((s) => {
    const defaultCategory = 'General'; // fallback if backend doesn't have a category
    const catMatch = activeCategory === 'All' || defaultCategory === activeCategory;
    const searchMatch = s.service_name.toLowerCase().includes(searchQuery.toLowerCase());
    return catMatch && searchMatch;
  });

  const openBooking = async (service: any) => {
    setSelectedService(service);
    setSelectedProvider(null);
    setBookingDate('');
    setBookingTime('');
    setBookingStep('providers');

    // Fetch providers for this specific service
    setProvidersLoading(true);
    try {
      const res = await userApi.getProvidersByService(service._id);
      setProviders(res.data || []);
    } catch (err) {
      toast.error('Failed to load providers');
    } finally {
      setProvidersLoading(false);
    }
  };

  const handleBook = async () => {
    if (!bookingDate || !bookingTime || !selectedProvider) return;
    setBookingLoading(true);
    // console.log(selectedProvider)
    try {
      await userApi.createBooking({
        service_provider_id: selectedProvider.provider._id,
        serviceId: selectedProvider.service._id,
        scheduled_date: bookingDate,
        scheduled_time: bookingTime
      });
      setBookingStep('success');
    } catch (error: any) {
      const errMsg = error.response?.data?.message || 'Failed to complete booking';
      toast.error(errMsg);
    } finally {
      setBookingLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 16 }}>
        <Loader2 size={32} color="#eb5e28" className="al-spin" />
        <p style={{ color: '#64748b' }}>Loading services...</p>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      {/* Hero */}
      <div className="usr-hero">
        <h1 className="usr-hero-title">What do you need fixed today?</h1>
        <p className="usr-hero-sub">Book trusted local experts for any home service — fast, easy, and reliable.</p>
        <div className="usr-hero-search">
          <Search size={17} color="#475569" />
          <input
            type="text"
            placeholder="Search services — plumbing, AC, carpenter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Category pills */}
      <div className="usr-categories">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`usr-cat-pill ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>
          {activeCategory === 'All' ? 'All Services' : activeCategory} <span style={{ fontSize: 14, color: '#64748b', fontWeight: 400 }}>({filtered.length})</span>
        </h2>
      </div>

      {/* Services grid */}
      {filtered.length === 0 ? (
        <motion.div variants={fadeUpVariant} className="usr-empty">
          <div className="usr-empty-icon">🔍</div>
          <p className="usr-empty-text">No services found. Try a different search.</p>
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} className="usr-services-grid">
          {filtered.map((s, i) => (
            <motion.div variants={fadeUpVariant} whileHover={{ scale: 1.02 }} key={s._id} className="usr-service-card" onClick={() => openBooking(s)}>
              <div className="usr-service-card-banner" style={{ background: BANNER_COLORS[i % BANNER_COLORS.length] }} />
              <div className="usr-service-card-body">
                <div className="usr-service-card-top">
                  <div className="usr-service-emoji">{getRandomEmoji('General')}</div>
                  <div className="usr-service-rating">
                    <span style={{ fontSize: 11, color: '#4ade80', fontWeight: 600 }}>Active</span>
                  </div>
                </div>
                <p className="usr-service-name">{s.service_name}</p>
                <p className="usr-service-desc">{s.service_description}</p>
                <div className="usr-service-card-footer">
                  <button className="usr-book-btn">Browse Providers</button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* ── Booking Modal ── */}
      <AnimatePresence>
        {selectedService && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="usr-book-overlay" onClick={() => setSelectedService(null)}>
            <motion.div variants={scaleUpVariant} initial="hidden" animate="visible" exit="hidden" className="usr-book-modal" onClick={(e) => e.stopPropagation()}>
              <div className="usr-book-modal-header">
                <div>
                  <p style={{ fontSize: 12, color: '#64748b', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                    GENERAL SERVICE
                  </p>
                  <h3 className="usr-book-modal-title">{selectedService.service_name}</h3>
                </div>
                <button className="usr-modal-close" onClick={() => setSelectedService(null)}><X size={16} /></button>
              </div>

              <div className="usr-book-modal-body" style={{ minHeight: 250 }}>
                {bookingStep === 'providers' && (
                  <>
                    <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
                      Select an available provider near you:
                    </p>

                    {providersLoading ? (
                      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                        <Loader2 className="usr-spin" size={24} color="#eb5e28" />
                      </div>
                    ) : providers.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '30px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: 10 }}>
                        <p style={{ color: '#94a3b8', fontSize: 14 }}>No providers available for this service right now.</p>
                      </div>
                    ) : (
                      providers.map((p) => (
                        <div
                          key={p._id}
                          onClick={() => p.isActive && setSelectedProvider(p)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '12px 14px',
                            background: selectedProvider?._id === p._id ? 'rgba(235,94,40,0.08)' : 'rgba(255,255,255,0.03)',
                            border: `1px solid ${selectedProvider?._id === p._id ? 'rgba(235,94,40,0.4)' : 'rgba(255,255,255,0.07)'}`,
                            borderRadius: 10,
                            marginBottom: 10,
                            cursor: p.isActive ? 'pointer' : 'not-allowed',
                            opacity: p.isActive ? 1 : 0.5,
                            transition: 'all 0.15s',
                          }}
                        >
                          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#eb5e28,#1c4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                            {(p.provider?.user_name || 'P')[0]}
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>{p.provider?.user_name || 'Unknown Provider'}</p>
                            <p style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                              <MapPin size={11} /> {p.experience} Exp · ₹{(p.charges_per_hour || 0).toLocaleString()} per hour
                            </p>
                          </div>
                          <div>
                            <span>{p.averageRating ?? 0} <Star size={12} fill="#fbbf24" /> </span>
                          </div>
                          {p.isAvailable
                            ? <span style={{ fontSize: 11, color: '#4ade80', fontWeight: 600, background: 'rgba(74,222,128,0.1)', padding: '2px 8px', borderRadius: 20 }}>Available</span>
                            : <span style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>Busy</span>
                          }
                        </div>
                      ))
                    )}
                  </>
                )}

                {bookingStep === 'form' && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, marginBottom: 20 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#eb5e28,#1c4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff' }}>
                        {(selectedProvider?.provider?.user_name || 'P')[0]}
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>{selectedProvider?.provider?.user_name}</p>
                        <p style={{ fontSize: 12, color: '#64748b' }}>{selectedProvider?.experience} yr. Experience</p>
                      </div>
                    </div>

                    <div className="usr-field">
                      <label className="usr-label"><CalendarDays size={13} style={{ display: 'inline', marginRight: 5 }} />Preferred Date</label>
                      <input type="date" className="usr-input" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                    </div>
                    <div className="usr-field">
                      <label className="usr-label"><Clock size={13} style={{ display: 'inline', marginRight: 5 }} />Preferred Time</label>
                      <input type="time" className="usr-input" value={bookingTime} onChange={(e) => setBookingTime(e.target.value)} />
                    </div>
                    <p style={{ fontSize: 12, color: '#64748b' }}>Price: <strong style={{ color: '#4ade80' }}>₹{(selectedProvider.charges_per_hour || 0).toLocaleString('en-IN')}</strong> per hour</p>
                  </>
                )}

                {bookingStep === 'success' && (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{ fontSize: 52, marginBottom: 16 }}>🎉</div>
                    <h3 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 20, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>Booking Confirmed!</h3>
                    <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>
                      Your booking for <strong style={{ color: '#f1f5f9' }}>{selectedService.service_name}</strong> with <strong style={{ color: '#f1f5f9' }}>{selectedProvider?.provider?.user_name}</strong> has been placed.
                    </p>
                    <p style={{ fontSize: 13, color: '#475569', marginTop: 10 }}>
                      Please check the My Bookings page to track status and view your OTP once confirmed.
                    </p>
                  </div>
                )}
              </div>

              <div className="usr-book-modal-footer">
                {bookingStep === 'providers' && (
                  <>
                    <button className="usr-btn usr-btn-ghost" onClick={() => setSelectedService(null)}>Cancel</button>
                    <button className="usr-btn usr-btn-primary" disabled={!selectedProvider} onClick={() => setBookingStep('form')}>
                      Continue →
                    </button>
                  </>
                )}
                {bookingStep === 'form' && (
                  <>
                    <button className="usr-btn usr-btn-ghost" onClick={() => setBookingStep('providers')}>← Back</button>
                    <button className="usr-btn usr-btn-primary" onClick={handleBook} disabled={bookingLoading || !bookingDate || !bookingTime}>
                      {bookingLoading ? <><Loader2 size={14} className="usr-spin" /> Booking...</> : 'Confirm Booking'}
                    </button>
                  </>
                )}
                {bookingStep === 'success' && (
                  <button className="usr-btn usr-btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setSelectedService(null)}>
                    Done
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
