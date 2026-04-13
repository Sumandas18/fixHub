import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
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

          const token = response.access_token || response.token;
          const userData = response.data || response.user;
          // Ensure role is embedded in the user object
          const userWithRole = { ...userData, role };

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
        // Clear State
        set({ user: null, token: null, role: null });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage', 
      partialize: (state) => ({ user: state.user, role: state.role, token: state.token }), 
    }
  )
);
