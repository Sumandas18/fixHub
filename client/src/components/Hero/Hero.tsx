'use client';

import React from 'react';
import styles from './Hero.module.css';
import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section className={styles.hero}>
      <video
        autoPlay
        loop
        muted
        playsInline
        className={styles.videoBackground}
      >
        <source src="/landingpage/Animated_Logo_Generation.mp4" type="video/mp4" />
      </video>
      <div className={styles.overlay} />

      <div className={styles.content}>
        <motion.h1 
          className={styles.title}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Expert Home & Vehicle Repair, <span className="gradient-text">On-Demand.</span>
        </motion.h1>
        
        <motion.p 
          className={styles.subtitle}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          From AC servicing to emergency roadside help, FixHub is your all-in-one solution for reliable, fast, and professional services.
        </motion.p>
        
        <motion.div 
          className={styles.ctaGroup}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <button className={styles.primaryBtn}>Explore Services</button>
          <button className={styles.secondaryBtn}>Book an Expert</button>
        </motion.div>
      </div>
    </section>
  );
}
