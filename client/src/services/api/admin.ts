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

  /** Toggle block / unblock for a customer or any user */
  blockUnblockUser: async (id: string) => {
    const res = await apiClient.put(`/user/status/${id}`);
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

  /** Toggle block / unblock for a provider user */
  blockUnblockProvider: async (id: string) => {
    const res = await apiClient.put(`/user/status/${id}`);
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

  /** Update service name / description */
  updateService: async (id: string, data: { service_name: string; service_description: string }) => {
    const res = await apiClient.patch(`/service/${id}`, data);
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

  // ── Service-Provider links ─────────────────────────────────────────────────
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

  // ── Contact Messages ───────────────────────────────────────────────────────
  /** Fetch all contact messages (all / completed / rejected) */
  getContacts: async (status: 'all' | 'completed' | 'rejected' = 'all') => {
    const res = await apiClient.get(`/contact/${status}`);
    return res.data;
  },

  /** Send a reply to a contact message */
  replyContact: async (messageId: string, reply: string) => {
    const res = await apiClient.put(`/contact/reply/${messageId}`, { reply });
    return res.data;
  },

  /** Deny / close a contact message without replying */
  denyContact: async (messageId: string) => {
    const res = await apiClient.put(`/contact/deny/${messageId}`);
    return res.data;
  },

  // ── Ratings ───────────────────────────────────────────────────────────────
  getRatings: async () => {
    const res = await apiClient.get('/rating');
    return res.data;
  },
};
