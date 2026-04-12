import { apiClient } from './axios';

export const adminApi = {
  getCustomers: async () => {
    const res = await apiClient.get('/customer');
    return res.data;
  },
  getProviders: async () => {
    const res = await apiClient.get('/provider');
    return res.data;
  },
  getServiceProviders: async () => {
    // This endpoint fetches the detailed service provider links (approvals)
    const res = await apiClient.get('/service-provider/all');
    return res.data;
  },
  getBookings: async () => {
    const res = await apiClient.get('/booking');
    return res.data;
  },
};
