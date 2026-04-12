import { apiClient } from './axios';

export const userApi = {
  getProfile: async () => {
    // Actually the customer profile is already being fetched in useUserStore or via authApi
    // Let's use the explicit route. 
    // BUT wait, customerRoute doesn't have a specific GET /profile route defined there. The profile logic is usually part of auth context.
    const res = await apiClient.get('/customer/profile');
    return res.data;
  },
  getBookings: async () => {
    const res = await apiClient.get('/booking/customer');
    return res.data;
  },
  getServices: async () => {
    const res = await apiClient.get('/service');
    return res.data;
  },
  getProvidersByService: async (serviceId: string) => {
    const res = await apiClient.get(`/service-provider?service_id=${serviceId}`);
    return res.data;
  },
  createBooking: async (data: { service_provider_id: string, scheduled_date: string, scheduled_time: string }) => {
    const res = await apiClient.post('/booking', data);
    return res.data;
  }
};
