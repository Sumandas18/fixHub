import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface UserState {
  user: any;
  isAuthenticated: boolean;
  setUser: (user: any) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
