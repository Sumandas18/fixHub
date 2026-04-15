import { apiClient } from './axios';

export const adminApi = {
  // ── Admin Management ──────────────────────────────────────────────────────
  getAdmins: async () => {
    const res = await apiClient.get('/admin');
    return res.data;
  },

  // ── Customers ─────────────────────────────────────────────────────────────
  getCustomers: async () => {
    const res = await apiClient.get('/customer');
    return res.data;
  },

  // ── Providers ─────────────────────────────────────────────────────────────
  getProviders: async () => {
    const res = await apiClient.get('/provider');
    return res.data;
  },
  approveProvider: async (id: string, status: 'approve' | 'reject') => {
    const res = await apiClient.patch(`/provider/${id}`, { status: status === 'approve' ? 'approved' : 'rejected' });
    return res.data;
  },

  // ── Services ──────────────────────────────────────────────────────────────
  getServices: async () => {
    const res = await apiClient.get('/service');
    return res.data;
  },

  createService: async (formData: FormData) => {
    const res = await apiClient.post('/service/add', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  deleteService: async (id: string) => {
    const res = await apiClient.delete(`/service/delete/${id}`);
    return res.data;
  },

  toggleService: async (id: string) => {
    const res = await apiClient.put(`/service/status/${id}`);
    return res.data;
  },

  setServiceStatus: async (id: string, status: 'active' | 'inactive') => {
    const res = await apiClient.patch(`/service/status/${id}`, { status });
    return res.data;
  },

  // ── Service-Provider links (admin approval queue) ──────────────────────
  getServiceProviders: async () => {
    const res = await apiClient.get('/service-provider/all');
    return res.data;
  },

  // ── Bookings ──────────────────────────────────────────────────────────────
  getBookings: async () => {
    const res = await apiClient.get('/booking');
    return res.data;
  },
  
  setBookingStatus: async (id: string, status: 'accepted' | 'rejected') => {
    const res = await apiClient.patch(`/booking/${id}`, { status });
    return res.data;
  },

  // ── Ratings (public — no auth required) ──────────────────────────────────
  getRatings: async () => {
    const res = await apiClient.get('/rating');
    return res.data;
  },
};
