import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  AuthService,
  AuthSession,
  SupabaseUser,
} from "../services/auth.service";

// ─── Storage Keys ────────────────────────────────────────────────────
const AUTH_STORAGE_KEY = "auth-session";

// ─── State Shape ─────────────────────────────────────────────────────
interface AuthState {
  // State
  isLoggedIn: boolean;
  isLoading: boolean;
  user: SupabaseUser | null;
  accessToken: string | null;
  refreshToken: string | null;

  // Auth Actions
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  signUp: (params: {
    email: string;
    password: string;
    username: string;
    mobile: string;
  }) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;

  // Session Management
  setSession: (session: AuthSession) => void;
  clearSession: () => void;
  refreshSession: () => Promise<boolean>;

  // Hydration flag
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // ─── Initial State ───────────────────────────────────────
      isLoggedIn: false,
      isLoading: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      _hasHydrated: false,

      setHasHydrated: (state) => set({ _hasHydrated: state }),

      // ─── Set Session Helper ──────────────────────────────────
      setSession: (session) =>
        set({
          isLoggedIn: true,
          user: session.user,
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
        }),

      clearSession: () =>
        set({
          isLoggedIn: false,
          user: null,
          accessToken: null,
          refreshToken: null,
        }),

      // ─── Sign In ────────────────────────────────────────────
      signIn: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data, error } = await AuthService.signIn({ email, password });

          if (error || !data) {
            set({ isLoading: false });
            return {
              success: false,
              error: error?.message || "Sign in failed",
            };
          }

          get().setSession(data);
          set({ isLoading: false });
          return { success: true };
        } catch (e: any) {
          set({ isLoading: false });
          return { success: false, error: e.message || "Unexpected error" };
        }
      },

      // ─── Sign Up ────────────────────────────────────────────
      signUp: async (params) => {
        set({ isLoading: true });
        try {
          const { data, error } = await AuthService.signUp(params);

          if (error || !data) {
            set({ isLoading: false });
            return {
              success: false,
              error: error?.message || "Sign up failed",
            };
          }

          // Some Supabase setups require email confirmation before session is returned
          if (data.access_token) {
            get().setSession(data);
          }

          set({ isLoading: false });
          return { success: true };
        } catch (e: any) {
          set({ isLoading: false });
          return { success: false, error: e.message || "Unexpected error" };
        }
      },

      // ─── Sign Out ───────────────────────────────────────────
      signOut: async () => {
        const token = get().accessToken;
        if (token) {
          await AuthService.signOut(token);
        }
        get().clearSession();
      },

      // ─── Refresh Token ──────────────────────────────────────
      refreshSession: async () => {
        const token = get().refreshToken;
        if (!token) return false;

        const { data, error } = await AuthService.refreshSession(token);
        if (error || !data) {
          get().clearSession();
          return false;
        }

        get().setSession(data);
        return true;
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
