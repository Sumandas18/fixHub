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
  confirmBooking: async (id: string, status: string) => {
    const res = await apiClient.put(`/booking/status/${id}`, {
      status
    });
    return res.data;
  },
  cancelBooking: async (id: string, reason: string) => {
    const res = await apiClient.put(`/booking/cancel/${id}`, {
      status: 'rejected',
      cancellation_reason: reason
    });
    return res.data;
  },
  verifyOTP: async ({ otp, bookingId }: { otp: string, bookingId: string }) => {
    const res = await apiClient.put(`/booking/verify-otp`, {
      otp, bookingId
    });
    return res.data;
  },
  resendOTP: async ({ bookingId }: { bookingId: string }) => {
    const res = await apiClient.put(`/booking/resend-otp`, {
      bookingId
    });
    return res.data;
  },
  addRating: async ({ booking_id, stars, service_description }: { booking_id: string, stars: number, service_description: string }) => {
    const res = await apiClient.post(`/rating/create`, {
      booking_id, stars, service_description
    });
    return res.data;
  },
  getServices: async () => {
    const res = await apiClient.get('/service-provider');
    return res.data;
  },
  completeProfile: async (formData: FormData) => {
    const res = await apiClient.patch('/service-provider/complete-profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  }
};
