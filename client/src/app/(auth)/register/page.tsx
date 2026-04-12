'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import styles from '../Auth.module.css';
import api from '@/lib/api';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contactNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/customer/register', {
        user_name: formData.name,
        user_email: formData.email,
        user_contact: formData.contactNumber,
        user_password: formData.password,
        user_role: 'customer',
        user_address: {
          houseOrFlatNo: '1',
          street: 'Main Street',
          area: 'Downtown',
          city: 'Cityville',
          state: 'State',
          pinCode: '000000'
        }
      });
      
      if (res.data.success || res.status === 201) {
        toast.success('Account created! Please verify your email.');
        router.push(`/verify?email=${encodeURIComponent(formData.email)}&userId=${res.data.data._id}`);
      } else {
        toast.error(res.data.message || 'Registration failed');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <h1 className={styles.title}>Create Account</h1>
          <p className={styles.subtitle}>Join FixHub to book professional services</p>

          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Full Name</label>
              <input type="text" name="name" className={styles.input} value={formData.name} onChange={handleChange} required placeholder="John Doe" />
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Email Address</label>
              <input type="email" name="email" className={styles.input} value={formData.email} onChange={handleChange} required placeholder="you@example.com" />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Contact Number</label>
              <input type="text" name="contactNumber" className={styles.input} value={formData.contactNumber} onChange={handleChange} required placeholder="1234567890" />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Password</label>
              <div className={styles.passwordWrapper}>
                <input type={showPassword ? "text" : "password"} name="password" className={styles.input} value={formData.password} onChange={handleChange} required placeholder="••••••••" />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Confirm Password</label>
              <div className={styles.passwordWrapper}>
                <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" className={styles.input} value={formData.confirmPassword} onChange={handleChange} required placeholder="••••••••" />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Creating...' : 'Sign Up'}
            </button>
          </form>

          <div className={styles.footer}>
            Already have an account? 
            <Link href="/login" className={styles.link}>Sign In</Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
