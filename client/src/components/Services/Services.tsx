'use client';

import React, { useEffect, useState } from 'react';
import styles from './Services.module.css';
import ServiceCard from './ServiceCard';
import { motion } from 'framer-motion';
import Link from 'next/link';
import api from '@/lib/api';
import { ArrowRight } from 'lucide-react';

// Only 3 featured services shown on the landing page
const FEATURED_SERVICES = [
  { id: '1', title: 'Home Repair', description: 'AC, refrigerator, washing machine & appliance repair by certified technicians.', target: 'Daily need, high conversion', icon: '🔌' },
  { id: '2', title: 'Electrical', description: 'Wiring, switch fixing, fan installation & short circuit repairs done safely.', target: 'Emergency & fast booking', icon: '⚡' },
  { id: '3', title: 'Plumbing', description: 'Pipe leakage, tap repair, bathroom fittings & tank cleaning — done right.', target: 'Very high demand service', icon: '🚿' },
];

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  target: string;
  icon: string;
}

function mapApiService(s: any): ServiceItem {
  return {
    id: s._id || s.id,
    title: s.service_name || s.name || s.title,
    description: s.service_description || s.description,
    target: s.is_active ? 'Available now' : 'Coming soon',
    icon: '🔧',
  };
}

export default function Services() {
  const [services, setServices] = useState<ServiceItem[]>(FEATURED_SERVICES);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get('/service');
        const data = res.data.data || res.data.services || res.data;
        if (Array.isArray(data) && data.length > 0) {
          // Show only first 3 from API on the landing page
          setServices(data.slice(0, 3).map(mapApiService));
        }
      } catch {
        // Keep static fallback silently
      }
    };
    fetchServices();
  }, []);

  return (
    <section id="services" className={styles.servicesSection}>
      <div className={styles.header}>
        <motion.h2
          className={styles.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Our <span className="gradient-text">Premium Services</span>
        </motion.h2>
        <motion.p
          className={styles.subtitle}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Professional, on-demand services designed to make your life easier.
        </motion.p>
      </div>

      {/* 3-card grid — centered */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, maxWidth: 960, margin: '0 auto' }}>
        {services.map((service, index) => (
          <ServiceCard key={service.id} service={service} index={index} />
        ))}
      </div>

      {/* View All button */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
        style={{ textAlign: 'center', marginTop: 40 }}
      >
        <Link
          href="/services"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '13px 32px',
            fontSize: 14,
            fontWeight: 700,
            color: '#fff',
            background: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 60%)',
            borderRadius: 50,
            textDecoration: 'none',
            boxShadow: '0 4px 20px rgba(168,85,247,0.3)',
            transition: 'all 0.25s ease',
          }}
        >
          View All Services <ArrowRight size={16} />
        </Link>
      </motion.div>
    </section>
  );
}
