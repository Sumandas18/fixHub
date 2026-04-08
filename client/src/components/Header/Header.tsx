'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from './Header.module.css';
import { motion } from 'framer-motion';
import { useUserStore } from '@/store/userStore';
import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const logout = useUserStore((state) => state.logout);
  const fetchProfile = useUserStore((state) => state.fetchProfile);
  const hasFetched = useRef(false);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  useEffect(() => {
    if (!hasFetched.current) {
      fetchProfile();
      hasFetched.current = true;
    }
  }, [fetchProfile]);

  return (
    <motion.header 
      className={styles.header}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={styles.logoContainer}>
        <Link href="/">
          <Image 
            src="/logo/FixHublogo.png" 
            alt="FixHub Logo" 
            width={50} 
            height={50} 
            className={styles.logo}
            priority
          />
        </Link>
      </div>
      
      <nav className={styles.nav}>
        <Link href="/services" className={styles.navLink}>Services</Link>
        <Link href="/about" className={styles.navLink}>About</Link>
        <Link href="/contact" className={styles.navLink}>Contact</Link>
        
        {isAuthenticated ? (
          <div className={styles.authLinks}>
            <Link href="/profile" className={styles.navLink}>Dashboard</Link>
            <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
          </div>
        ) : (
          <Link href="/login" className={styles.ctaButton}>Login / Register</Link>
        )}
      </nav>
    </motion.header>
  );
}
