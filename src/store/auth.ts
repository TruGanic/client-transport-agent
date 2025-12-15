import { create } from "zustand";

interface AuthState {
  isLoggedIn: boolean;
  user?: { id: string; name: string };
  login: (user: { id: string; name: string }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  user: undefined,
  login: (user) => set({ isLoggedIn: true, user }),
  logout: () => set({ isLoggedIn: false, user: undefined }),
}));
