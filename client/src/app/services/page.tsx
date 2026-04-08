'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import { motion } from 'framer-motion';
import '../shared.css';

const SERVICE_ICONS: Record<number, string> = {
  0: '🔌', 1: '⚡', 2: '🚿', 3: '🧹', 4: '🔐', 5: '🛵',
};

const FALLBACK_SERVICES = [
  { _id: '1', service_name: 'Home Appliance Repair', service_description: 'AC, Refrigerator, Washing machine & Microwave repair.', is_active: true },
  { _id: '2', service_name: 'Electrical Services', service_description: 'Wiring, switch fixing, fan installation & short circuits.', is_active: true },
  { _id: '3', service_name: 'Plumbing Services', service_description: 'Pipe leakage, tap repair, bathroom fittings & tank cleaning.', is_active: true },
  { _id: '4', service_name: 'Home Cleaning Services', service_description: 'Full home, sofa, bathroom & kitchen deep cleaning.', is_active: true },
  { _id: '5', service_name: 'Home Maintenance & Handyman', service_description: 'Furniture repair, lock fixing & small home fixes.', is_active: true },
  { _id: '6', service_name: 'Bike & Car Services', service_description: 'Bike servicing, car repair, battery jumpstart & emergency help.', is_active: true },
];

interface Service {
  _id: string;
  service_name: string;
  service_description: string;
  service_image_url?: string;
  is_active?: boolean;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get('/service');
        const data = res.data.data || res.data.services || res.data;
        if (Array.isArray(data) && data.length > 0) {
          setServices(data);
        } else {
          setServices(FALLBACK_SERVICES);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
        setServices(FALLBACK_SERVICES);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  return (
    <>
      <Header />
      <main className="pageContainer">
        <div className="pageHeader">
          <h1 className="pageTitle">Our Services</h1>
          <p className="pageSubtitle">Browse all available professional services in your area.</p>
        </div>

        {loading ? (
          <div className="loader">Loading services...</div>
        ) : (
          <div className="servicesGrid">
            {services.map((service, idx) => (
              <motion.div
                key={service._id}
                className="serviceCard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.07 }}
              >
                <div className="serviceImgPlaceholder">
                  <span className="serviceIcon">{SERVICE_ICONS[idx % 6] ?? '🔧'}</span>
                </div>
                <div className="serviceCardBody">
                  <h3 className="serviceName">{service.service_name}</h3>
                  <p className="serviceDesc">
                    {service.service_description.length > 110
                      ? service.service_description.substring(0, 110) + '...'
                      : service.service_description}
                  </p>
                  <div className="serviceCardFooter">
                    <span className={`serviceStatus ${service.is_active ? 'active' : 'inactive'}`}>
                      {service.is_active ? '✅ Available' : '🚫 Unavailable'}
                    </span>
                    <Link href={`/book/${service._id}`} className="viewBtn">Book Now →</Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
