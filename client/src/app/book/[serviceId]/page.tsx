'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/useAuthStore';
import styles from './Booking.module.css';
import '../../shared.css';

export default function BookingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const serviceId = params.serviceId as string;
  const providerId = searchParams.get('provider');

  const { user, isLoading } = useAuthStore();

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState(''); // Just for UI, backend doesn't store currently
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      toast.error('You must be logged in to book an expert.');
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!providerId || !date || !time) {
      toast.error('Please fill out all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/booking', {
        service_provider_id: providerId,
        scheduled_date: date,
        scheduled_time: time
      });

      if (res.data.success || res.status === 201) {
        toast.success('Booking created successfully!');
        router.push('/profile');
      } else {
        toast.error(res.data.message || 'Failed to create booking');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Something went wrong. Is this time already booked?');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || !user) return <div className="pageContainer"><div className="loader">Authenticating...</div></div>;

  return (
    <>
      <Header />
      <main className="pageContainer">
        <div className={styles.bookingBox}>
          <h1 className="pageTitle" style={{ fontSize: '2rem' }}>Complete Your Booking</h1>
          <p className="pageSubtitle" style={{ marginBottom: '2rem' }}>Select your preferred date and time for the service.</p>
          
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label>Service Date *</label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                min={new Date().toISOString().split('T')[0]} 
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label>Time Slot *</label>
              <select value={time} onChange={(e) => setTime(e.target.value)} required>
                <option value="">Select a time</option>
                <option value="09:00 AM">09:00 AM</option>
                <option value="10:00 AM">10:00 AM</option>
                <option value="11:00 AM">11:00 AM</option>
                <option value="12:00 PM">12:00 PM</option>
                <option value="02:00 PM">02:00 PM</option>
                <option value="04:00 PM">04:00 PM</option>
                <option value="06:00 PM">06:00 PM</option>
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label>Additional Notes (Optional)</label>
              <textarea 
                rows={4} 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special instructions?"
              />
            </div>

            <button type="submit" disabled={submitting || !providerId} className={styles.submitBtn}>
              {submitting ? 'Confirming...' : 'Confirm Booking'}
            </button>

            {!providerId && (
              <p className={styles.errorText}>Missing Provider ID. Please go back and select an expert.</p>
            )}
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
