'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import styles from './Services.module.css';
import { motion, useInView } from 'framer-motion';

interface ServiceProps {
  service: {
    id: string | number;
    title: string;
    description: string;
    target: string;
    icon: string;
  };
  index: number;
}

export default function ServiceCard({ service, index }: ServiceProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const inView = useInView(cardRef, { once: true, margin: '-100px' });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <motion.div
      ref={cardRef}
      className={styles.card}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <div className={styles.iconWrapper}>{service.icon}</div>
      <h3 className={styles.cardTitle}>{service.title}</h3>
      <p className={styles.cardDescription}>{service.description}</p>

      <div className={styles.cardFooter}>
        <span className={styles.targetLabel}>{service.target}</span>
        <Link href={`/book/${service.id}`} className={styles.arrow}>Book →</Link>
      </div>
    </motion.div>
  );
}
