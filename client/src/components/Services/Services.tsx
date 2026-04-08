'use client';

import React, { useEffect, useState } from 'react';
import styles from './Services.module.css';
import ServiceCard from './ServiceCard';
import { motion } from 'framer-motion';
import api from '@/lib/api';

// Static fallback services
const FALLBACK_SERVICES = [
  { id: '1', title: 'Home Appliance Repair', description: 'AC, Refrigerator, Washing machine & Microwave repair.', target: 'Daily need, high conversion service', icon: '🔌' },
  { id: '2', title: 'Electrical Services', description: 'Wiring, switch fixing, fan installation & short circuits.', target: 'Emergency & fast booking', icon: '⚡' },
  { id: '3', title: 'Plumbing Services', description: 'Pipe leakage, tap repair, bathroom fittings & tank cleaning.', target: 'Very high demand service', icon: '🚿' },
  { id: '4', title: 'Home Cleaning Services', description: 'Full home, sofa, bathroom & kitchen deep cleaning.', target: 'Available on subscription model', icon: '🧹' },
  { id: '5', title: 'Home Maintenance & Handyman', description: 'Furniture repair, lock fixing & small home fixes.', target: 'All-in-one category', icon: '🔐' },
  { id: '6', title: 'Bike & Car Services', description: 'Bike servicing, car repair, battery jumpstart & emergency help.', target: 'On-Demand roadside help', icon: '🛵' },
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
  const [services, setServices] = useState<ServiceItem[]>(FALLBACK_SERVICES);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get('/service');
        const data = res.data.data || res.data.services || res.data;
        if (Array.isArray(data) && data.length > 0) {
          setServices(data.map(mapApiService));
        }
        // If empty, keeps the fallback static data
      } catch {
        // Network error – keep static fallback silently
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
          Explore our wide range of professional, on-demand services designed to make your life easier and more comfortable.
        </motion.p>
      </div>

      <div className={styles.grid}>
        {services.map((service, index) => (
          <ServiceCard key={service.id} service={service} index={index} />
        ))}
      </div>
    </section>
  );
}
