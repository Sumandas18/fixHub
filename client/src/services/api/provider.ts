import { apiClient } from './axios';

export const providerApi = {
  getStats: async () => {
    // Wait, the backend doesn't have an explicit `/provider/stats` root endpoint, 
    // so we fetch bookings and aggregate them on the frontend for providers.
    const res = await apiClient.get('/booking/provider');
    return res.data;
  },
  getBookings: async () => {
    const res = await apiClient.get('/booking/provider');
    return res.data;
  },
  getServices: async () => {
    const res = await apiClient.get('/service-provider');
    return res.data;
  },
};
