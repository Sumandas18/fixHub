'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import { useUserStore } from '@/store/userStore';
import toast from 'react-hot-toast';
import '../shared.css';
import './ServiceDetail.css';

interface Service {
  _id: string;
  name: string;
  description: string;
  category: string;
  serviceImg?: string;
  basePrice?: number;
}

interface Provider {
  _id: string;
  provider_id: string; // The user object ID of the professional
  service_id: string;
  service_area_zip: string;
  experience: number;
  charges_per_hour: number;
  profile_img_url?: string;
  isAvailable: boolean;
}

export default function ServiceDetail() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { isAuthenticated } = useUserStore();

  const [service, setService] = useState<Service | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const servRes = await api.get(`/service/${id}`);
        // Adjust dependent on API response shape
        setService(servRes.data.service || servRes.data.data || servRes.data);

        // Fetch all providers, then filter by this service id
        // Since getProviderWise relies on admin/provider role, we manually filter from 'all'
        const provRes = await api.get(`/service-provider/all`);
        const allProviders = provRes.data.data || provRes.data;
        if (Array.isArray(allProviders)) {
          setProviders(allProviders.filter((p: Provider) => p.service_id === id && p.isAvailable !== false));
        }
      } catch (error) {
        console.error('Error fetching service:', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetails();
  }, [id]);

  const handleBookClick = (providerId: string) => {
    if (!isAuthenticated) {
      toast.error('Please log in to book an expert');
      router.push('/login');
      return;
    }
    router.push(`/book/${id}?provider=${providerId}`);
  };

  return (
    <>
      <Header />
      <main className="pageContainer">
        {loading ? (
          <div className="loader">Loading details...</div>
        ) : service ? (
          <div className="serviceDetailWrap">
            <div className="serviceHero" style={{ backgroundImage: `url(${service.serviceImg || ''})` }}>
              <div className="serviceHeroOverlay">
                <h1 className="pageTitle">{service.name}</h1>
                <p className="pageSubtitle">{service.category}</p>
                {service.basePrice && <p className="largePrice">Starts from ${service.basePrice}</p>}
              </div>
            </div>

            <div className="serviceContent">
              <section className="serviceAbout">
                <h2>About this Service</h2>
                <p>{service.description}</p>
              </section>

              <section className="providersList">
                <h2>Available Experts</h2>
                {providers.length > 0 ? (
                  <div className="servicesGrid">
                    {providers.map((p) => (
                      <div key={p._id} className="providerCard">
                        <div className="providerHeader">
                          <div className="avatar">
                            {p.profile_img_url ? (
                              <img src={p.profile_img_url} alt="Provider" />
                            ) : (
                              <div className="avatarInitials">EX</div>
                            )}
                          </div>
                          <div>
                            <h3>Expert</h3>
                            <p>{p.experience} years exp</p>
                          </div>
                        </div>
                        <div className="providerBody">
                          <p><strong>Rate:</strong> ${p.charges_per_hour}/hr</p>
                          <p><strong>Zip Area:</strong> {p.service_area_zip}</p>
                        </div>
                        <button 
                          onClick={() => handleBookClick(p._id)}
                          className="bookBtn"
                        >
                          Book Now
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="emptyState">No experts are currently available for this service.</p>
                )}
              </section>
            </div>
          </div>
        ) : (
          <div className="emptyState">Service not found.</div>
        )}
      </main>
      <Footer />
    </>
  );
}
