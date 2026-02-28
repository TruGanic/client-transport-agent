const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_API_KEY = process.env.EXPO_PUBLIC_SUPABASE_API_KEY!;

const headers = {
  apikey: SUPABASE_API_KEY,
  "Content-Type": "application/json",
};

// ─── Response Types ──────────────────────────────────────────────────
export interface SupabaseUser {
  id: string;
  email: string;
  phone?: string;
  user_metadata?: {
    username?: string;
    full_name?: string;
    [key: string]: unknown;
  };
  created_at?: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: SupabaseUser;
}

export interface AuthError {
  message: string;
  status?: number;
}

// ─── Service ─────────────────────────────────────────────────────────
export const AuthService = {
  /**
   * Sign up a new user.
   * POST /auth/v1/signup
   */
  async signUp(params: {
    email: string;
    password: string;
    username: string;
    mobile: string;
  }): Promise<{ data: AuthSession | null; error: AuthError | null }> {
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          email: params.email,
          password: params.password,
          data: {
            username: params.username,
            mobile: params.mobile,
          },
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        return {
          data: null,
          error: {
            message:
              json.error_description ||
              json.msg ||
              json.message ||
              "Sign up failed",
            status: res.status,
          },
        };
      }

      return { data: json as AuthSession, error: null };
    } catch (e: any) {
      return {
        data: null,
        error: {
          message: e.message || "Network error. Please check your connection.",
        },
      };
    }
  },

  /**
   * Sign in with email + password.
   * POST /auth/v1/token?grant_type=password
   */
  async signIn(params: {
    email: string;
    password: string;
  }): Promise<{ data: AuthSession | null; error: AuthError | null }> {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            email: params.email,
            password: params.password,
          }),
        },
      );

      const json = await res.json();

      if (!res.ok) {
        return {
          data: null,
          error: {
            message:
              json.error_description ||
              json.msg ||
              json.message ||
              "Invalid credentials",
            status: res.status,
          },
        };
      }

      return { data: json as AuthSession, error: null };
    } catch (e: any) {
      return {
        data: null,
        error: {
          message: e.message || "Network error. Please check your connection.",
        },
      };
    }
  },

  /**
   * Refresh an expired access token.
   * POST /auth/v1/token?grant_type=refresh_token
   */
  async refreshSession(
    refreshToken: string,
  ): Promise<{ data: AuthSession | null; error: AuthError | null }> {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ refresh_token: refreshToken }),
        },
      );

      const json = await res.json();

      if (!res.ok) {
        return {
          data: null,
          error: {
            message:
              json.error_description ||
              json.msg ||
              "Session expired. Please sign in again.",
            status: res.status,
          },
        };
      }

      return { data: json as AuthSession, error: null };
    } catch (e: any) {
      return {
        data: null,
        error: { message: e.message || "Network error" },
      };
    }
  },

  /**
   * Sign out (invalidate refresh token server-side).
   * POST /auth/v1/logout
   */
  async signOut(accessToken: string): Promise<void> {
    try {
      await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
        method: "POST",
        headers: {
          ...headers,
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch {
      // Silent fail — local state will be cleared regardless
    }
  },
};
