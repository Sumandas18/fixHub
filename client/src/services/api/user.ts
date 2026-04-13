import { apiClient } from './axios';

export const userApi = {
  getProfile: async () => {
    const res = await apiClient.get('/user/profile');
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
