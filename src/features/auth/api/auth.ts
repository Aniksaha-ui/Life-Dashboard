import { useApiMutation } from "../../../hooks/useApi";
import { api } from "../../../lib/api/client";
import { useAuthStore } from "../../../stores/authStore";
import { setCookie } from "../../../utils/cookie";
import { requestLogin, type ExpenseLoginResponse } from "./login";
import type { LoginFormValues } from "../validation/loginValidation";
import type {
  ChangePasswordResponseData,
  ForgotPasswordRequestOtpResponseData,
  ForgotPasswordResetResponseData,
  LoginResponseData,
  Verify2FAResponseData,
} from "../types";

const SESSION_COOKIE_DAYS = 45;
const EXPENSE_AUTH_STORAGE_KEY = "travel-agency-admin-auth-session";

const resolveExpenseLoginSession = (payload: ExpenseLoginResponse | null) => {
  const session = payload?.data ?? payload;
  const token = session?.token ?? payload?.access_token;

  if (!token || !session?.user) {
    throw new Error("Login response was missing token or user data.");
  }

  return { token, user: session.user };
};

/**
 * Mutation for user login
 */
export const useLoginMutation = (options?: {
  onSuccess?: (data: LoginResponseData | null) => void;
  onError?: (error: Error) => void;
}) => {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useApiMutation<ExpenseLoginResponse | null, LoginFormValues>(
    (credentials) => requestLogin(credentials.email, credentials.password),
    {
      ...options,
      showErrorToast: false,
      onSuccess: (data) => {
        const session = resolveExpenseLoginSession(data);
        setCookie("session_id", session.token, SESSION_COOKIE_DAYS);
        window.localStorage.setItem(
          EXPENSE_AUTH_STORAGE_KEY,
          JSON.stringify({ token: session.token, user: session.user }),
        );
        setAuth({
          user: session.user,
          token: session.token,
          isAuthenticated: true,
        });
        options?.onSuccess?.(data as LoginResponseData | null);
      },
    },
  );
};

/**
 * Mutation for OTP verification (2FA)
 */
export const useVerifyOTPMutation = (options?: {
  onSuccess?: (data: Verify2FAResponseData | null) => void;
  onError?: (error: Error) => void;
}) => {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useApiMutation<
    Verify2FAResponseData | null,
    {
      session_token: string;
      otp: string;
      device_fingerprint: string;
      trustDevice: boolean;
    }
  >(
    (variables) =>
      api.post<Verify2FAResponseData>(
        "/auth/verify-2fa",
        {
          session_token: variables.session_token,
          otp_code: variables.otp,
          device_fingerprint: variables.device_fingerprint,
          is_trust_device: variables.trustDevice,
        },
        { showErrorToast: false },
      ),
    {
      ...options,
      showErrorToast: false,
      onSuccess: (data) => {
        if (data?.session_id) {
          setCookie("session_id", data.session_id, SESSION_COOKIE_DAYS);
        }
        if (data?.device_trust_token) {
          setCookie("device_trust_token", data.device_trust_token, 30);
        }

        if (data?.user) {
          // Sync to Zustand store
          setAuth({
            user: data.user,
            isAuthenticated: true,
          });
        }

        if (options?.onSuccess) options.onSuccess(data);
      },
    },
  );
};

/**
 * Mutation for resending OTP
 */
export const useResendOTPMutation = (options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}) => {
  return useApiMutation(
    (variables: { session_token: string }) =>
      api.post("/auth/resend-otp", { session_token: variables.session_token }),
    options,
  );
};

/**
 * Mutation for changing password
 */
export const useChangePasswordMutation = (options?: {
  onSuccess?: (data: ChangePasswordResponseData | null) => void;
  onError?: (error: Error) => void;
}) => {
  return useApiMutation<
    ChangePasswordResponseData | null,
    {
      current_password: string;
      new_password: string;
      new_password_confirmation: string;
    }
  >(
    (variables) =>
      api.post<ChangePasswordResponseData>(
        "/auth/change-password",
        {
          current_password: variables.current_password,
          new_password: variables.new_password,
          new_password_confirmation: variables.new_password_confirmation,
        },
        { showErrorToast: false },
      ),
    {
      ...options,
      showErrorToast: false,
    },
  );
};

/**
 * Mutation for forgot password OTP request
 */
export const useForgotPasswordRequestOtpMutation = (options?: {
  onSuccess?: (data: ForgotPasswordRequestOtpResponseData | null) => void;
  onError?: (error: Error) => void;
}) => {
  const setForgotPasswordFlow = useAuthStore(
    (state) => state.setForgotPasswordFlow,
  );

  return useApiMutation<
    ForgotPasswordRequestOtpResponseData | null,
    { email: string }
  >(
    (variables) =>
      api.post<ForgotPasswordRequestOtpResponseData>(
        "/auth/forgot-password/request-otp",
        {
          email: variables.email,
        },
        { showErrorToast: false },
      ),
    {
      ...options,
      showErrorToast: false,
      onSuccess: (data, variables) => {
        if (data?.otp_session_token) {
          setForgotPasswordFlow({
            email: variables.email,
            otpSessionToken: data.otp_session_token,
            expiresAt: data.expires_at,
            sentTo: data.email_sent_to,
          });
        }
        options?.onSuccess?.(data);
      },
    },
  );
};

/**
 * Mutation for forgot password reset
 */
export const useForgotPasswordResetMutation = (options?: {
  onSuccess?: (data: ForgotPasswordResetResponseData | null) => void;
  onError?: (error: Error) => void;
}) => {
  return useApiMutation<
    ForgotPasswordResetResponseData | null,
    {
      otp_session_token: string;
      otp_code: string;
      new_password: string;
      new_password_confirmation: string;
    }
  >(
    (variables) =>
      api.post<ForgotPasswordResetResponseData>(
        "/auth/forgot-password/reset-password",
        variables,
        {
          showErrorToast: false,
        },
      ),
    {
      ...options,
      showErrorToast: false,
    },
  );
};
