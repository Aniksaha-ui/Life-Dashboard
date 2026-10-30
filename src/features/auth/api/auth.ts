import { useApiMutation } from "../../../hooks/useApi";
import { useAuthStore } from "../../../stores/authStore";
import { setCookie } from "../../../utils/cookie";
import type { LoginFormValues } from "../validation/loginValidation";
import { requestLogin, type ExpenseLoginResponse } from "./login";

const SESSION_COOKIE_DAYS = 45;
const EXPENSE_AUTH_STORAGE_KEY = "travel-agency-admin-auth-session";

const resolveSession = (payload: ExpenseLoginResponse | null) => {
  const session = payload?.data ?? payload;
  const token = session?.token ?? payload?.access_token;

  if (!token || !session?.user) {
    throw new Error("Login response was missing token or user data.");
  }

  return { token, user: session.user };
};

export const useLoginMutation = (options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useApiMutation<ExpenseLoginResponse | null, LoginFormValues>(
    (credentials) => requestLogin(credentials.email, credentials.password),
    {
      ...options,
      showErrorToast: false,
      onSuccess: (data) => {
        const session = resolveSession(data);
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
        options?.onSuccess?.();
      },
    },
  );
};
