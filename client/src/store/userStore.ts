import { create } from 'zustand';
import Cookies from 'js-cookie';
import api from '@/lib/api';

interface User {
  _id: string;
  name: string;
  email: string;
  contactNumber?: string;
  role: string;
}

// Raw shape returned by the backend JWT / login response
interface RawApiUser {
  user_id?: string;
  _id?: string;
  user_name?: string;
  name?: string;
  user_email?: string;
  email?: string;
  user_role?: string;
  role?: string;
  user_contact?: string;
}

function mapUser(raw: RawApiUser): User {
  return {
    _id: raw.user_id || raw._id || '',
    name: raw.user_name || raw.name || '',
    email: raw.user_email || raw.email || '',
    role: raw.user_role || raw.role || '',
    contactNumber: raw.user_contact,
  };
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setToken: (token: string, rawUser: RawApiUser) => void;
  logout: () => void;
  fetchProfile: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isAuthenticated: !!Cookies.get('token'),
  isLoading: true,

  setToken: (token, rawUser) => {
    Cookies.set('token', token, { expires: 7 });
    set({ user: mapUser(rawUser), isAuthenticated: true });
  },

  logout: () => {
    Cookies.remove('token');
    set({ user: null, isAuthenticated: false });
  },

  fetchProfile: async () => {
    try {
      set({ isLoading: true });
      const token = Cookies.get('token');
      if (!token) {
        set({ isAuthenticated: false, user: null, isLoading: false });
        return;
      }
      const res = await api.get('/customer/profile');
      const raw: RawApiUser = res.data.data || res.data.profile || res.data;
      set({ user: mapUser(raw), isAuthenticated: true, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch profile', error);
      Cookies.remove('token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
