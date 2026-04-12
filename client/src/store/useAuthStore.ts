import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { User, Role, LoginParams } from '@/types/auth';
import { authApi } from '@/services/api/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  role: Role | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginParams, role: Role) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      role: null,
      isLoading: false,
      error: null,

      login: async (credentials, role) => {
        try {
          set({ isLoading: true, error: null });

          let response;
          if (role === 'admin') {
            response = await authApi.adminLogin(credentials);
          } else if (role === 'provider') {
            response = await authApi.providerLogin(credentials);
          } else {
            response = await authApi.customerLogin(credentials);
          }

          const { token, user: userData } = response;
          // Ensure role is embedded in the user object
          const userWithRole = { ...userData, role };

          // 1. Save to cookies for Next.js Middleware Route Protection
          Cookies.set('token', token, { expires: 7, secure: process.env.NODE_ENV === 'production' });
          Cookies.set('role', role, { expires: 7, secure: process.env.NODE_ENV === 'production' });

          // 2. Save state
          set({
            user: userWithRole,
            token,
            role,
            isLoading: false,
          });
        } catch (error: any) {
          const errMsg = error.response?.data?.message || 'Login failed. Please check your credentials.';
          set({ error: errMsg, isLoading: false });
          throw error; // Re-throw to allow component-level error handling (e.g., Toast)
        }
      },

      logout: () => {
        // Clear Cookies
        Cookies.remove('token');
        Cookies.remove('role');

        // Clear State
        set({ user: null, token: null, role: null });
        
        // Let the application or component handle redirects upon logout checking state
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage', // unique name for localStorage persist
      // Zustand Persist uses localStorage by default. 
      // This is purely for UI hydration of the `user` object.
      // The `token` & `role` for routing security are managed strictly by Cookies as enforced.
      partialize: (state) => ({ user: state.user, role: state.role }), 
    }
  )
);
