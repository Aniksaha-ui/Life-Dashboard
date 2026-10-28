import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { User } from "../features/auth/types";

interface AuthState {
  // User Data
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  // 2FA Flow State
  loginId: string | null;
  sessionToken: string | null;
  otpSentTo: string | null;
  requires2FA: boolean;

  // Forgot Password Flow State
  forgotPasswordEmail: string | null;
  forgotPasswordOtpSessionToken: string | null;
  forgotPasswordExpiresAt: string | null;
  forgotPasswordSentTo: string | null;

  // Actions
  setLoginFlow: (data: {
    loginId: string;
    sessionToken: string;
    otpSentTo?: string;
    requires2FA: boolean;
  }) => void;
  setForgotPasswordFlow: (data: {
    email: string;
    otpSessionToken: string;
    expiresAt?: string;
    sentTo?: string;
  }) => void;
  clearForgotPasswordFlow: () => void;
  setAuth: (data: {
    user: User;
    token?: string | null;
    isAuthenticated: boolean;
  }) => void;
  clearAuth: () => void;
  setSessionToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loginId: null,
      sessionToken: null,
      otpSentTo: null,
      requires2FA: false,
      forgotPasswordEmail: null,
      forgotPasswordOtpSessionToken: null,
      forgotPasswordExpiresAt: null,
      forgotPasswordSentTo: null,

      setLoginFlow: (data) =>
        set({
          loginId: data.loginId,
          sessionToken: data.sessionToken,
          otpSentTo: data.otpSentTo || null,
          requires2FA: data.requires2FA,
        }),

      setForgotPasswordFlow: (data) =>
        set({
          forgotPasswordEmail: data.email,
          forgotPasswordOtpSessionToken: data.otpSessionToken,
          forgotPasswordExpiresAt: data.expiresAt || null,
          forgotPasswordSentTo: data.sentTo || null,
        }),

      clearForgotPasswordFlow: () =>
        set({
          forgotPasswordEmail: null,
          forgotPasswordOtpSessionToken: null,
          forgotPasswordExpiresAt: null,
          forgotPasswordSentTo: null,
        }),

      setAuth: (data) =>
        set({
          user: data.user,
          token: data.token ?? null,
          isAuthenticated: data.isAuthenticated,
          requires2FA: false,
          sessionToken: null, // Clear temp token after success
        }),

      clearAuth: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          loginId: null,
          sessionToken: null,
          otpSentTo: null,
          requires2FA: false,
          forgotPasswordEmail: null,
          forgotPasswordOtpSessionToken: null,
          forgotPasswordExpiresAt: null,
          forgotPasswordSentTo: null,
        }),

      setSessionToken: (token) => set({ sessionToken: token }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage), // Using localStorage to share session across tabs
    },
  ),
);
