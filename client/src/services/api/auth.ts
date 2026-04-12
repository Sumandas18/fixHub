import { apiClient } from './axios';
import { LoginParams, AuthResponse } from '@/types/auth';

/**
 * Encapsulates all Auth-related API calls
 */
export const authApi = {
  // ----------- ADMIN Auth -----------
  adminLogin: async (data: LoginParams): Promise<AuthResponse> => {
    const res = await apiClient.post('/admin/login', {
      user_email: data.email,
      user_password: data.password,
    });
    return res.data;
  },

  // ----------- PROVIDER Auth -----------
  providerLogin: async (data: LoginParams): Promise<AuthResponse> => {
    const res = await apiClient.post('/provider/login', {
      user_email: data.email,
      user_password: data.password,
    });
    return res.data;
  },

  // ----------- CUSTOMER (USER) Auth -----------
  customerLogin: async (data: LoginParams): Promise<AuthResponse> => {
    const res = await apiClient.post('/customer/login', {
      user_email: data.email,
      user_password: data.password,
    });
    return res.data;
  },

  // Example profile fetch helper (to be used after login if user data isn't complete)
  getProfile: async () => {
    const res = await apiClient.get('/user/profile');
    return res.data;
  }
};
