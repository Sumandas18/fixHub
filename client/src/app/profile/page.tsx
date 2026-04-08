'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import api from '@/lib/api';
import { useUserStore } from '@/store/userStore';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import styles from './Profile.module.css';
import '../shared.css';

interface Booking {
  _id: string;
  status: string;
  scheduled_date: string;
  scheduled_time: string;
  service_provider_id: {
    _id: string;
    profile_img_url?: string;
  };
}

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, logout } = useUserStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!isAuthenticated) return;
      try {
        const res = await api.get('/booking/customer');
        setBookings(res.data.data || []);
      } catch (error) {
        console.error('Failed to fetch bookings', error);
      } finally {
        setLoadingBookings(false);
      }
    };
    fetchBookings();
  }, [isAuthenticated]);

  const handleCancelBooking = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.put(`/booking/cancel/${id}`);
      toast.success('Booking cancelled');
      // Update local state
      setBookings(bookings.map(b => b._id === id ? { ...b, status: 'cancelled' } : b));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    }
  };

  if (isLoading || !isAuthenticated) {
    return (
      <>
        <Header />
        <div className="pageContainer"><div className="loader">Loading...</div></div>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className={`pageContainer ${styles.profileContainer}`}>
        <div className={styles.sidebar}>
          <div className={styles.avatar}>
            {user?.name ? user.name.charAt(0).toUpperCase() : ''}
          </div>
          <h2 className={styles.userName}>{user?.name}</h2>
          <p className={styles.userEmail}>{user?.email}</p>
          <div className={styles.divider}></div>
          <nav className={styles.navMenu}>
            <button className={`${styles.navItem} ${styles.active}`}>My Bookings</button>
            <button className={styles.navItem} onClick={() => alert('Change password feature coming soon!')}>Settings</button>
            <button className={`${styles.navItem} ${styles.logoutText}`} onClick={handleLogout}>Logout</button>
          </nav>
        </div>

        <div className={styles.content}>
          <h2 className={styles.sectionTitle}>My Bookings</h2>
          
          {loadingBookings ? (
            <div className="loader">Loading your bookings...</div>
          ) : bookings.length > 0 ? (
            <div className={styles.bookingsList}>
              {bookings.map((booking) => (
                <div key={booking._id} className={styles.bookingCard}>
                  <div className={styles.bookingHeader}>
                    <span className={`${styles.statusBadge} ${styles[booking.status]}`}>
                      {booking.status.toUpperCase()}
                    </span>
                    <span className={styles.date}>
                      {new Date(booking.scheduled_date).toLocaleDateString()} at {booking.scheduled_time}
                    </span>
                  </div>
                  <div className={styles.bookingActions}>
                    {(booking.status === 'pending' || booking.status === 'confirmed') && (
                      <button 
                        onClick={() => handleCancelBooking(booking._id)} 
                        className={styles.cancelBtn}
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="emptyState">
              You don't have any bookings yet.
              <br />
              <button onClick={() => router.push('/services')} className={styles.browseBtn}>Browse Services</button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
