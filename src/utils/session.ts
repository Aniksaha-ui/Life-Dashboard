import { toast } from "react-hot-toast";
import { useAuthStore } from "../stores/authStore";
import { removeCookie } from "./cookie";

const EXPENSE_AUTH_STORAGE_KEY = "travel-agency-admin-auth-session";
const AUTH_EXCLUDED_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/verify-2fa",
];

let isLoggingOut = false;
let isFetchInterceptorInstalled = false;

const isExcludedAuthUrl = (url: string): boolean =>
  AUTH_EXCLUDED_PATHS.some((path) => url.includes(path));

const extractUrl = (input: RequestInfo | URL): string => {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.toString();
  return input.url;
};

/**
 * Clears all auth tokens/stores and redirects to /login once when a 401 occurs.
 */
export const endUnauthenticatedSession = (
  message = "Your session has expired. Please sign in again.",
) => {
  removeCookie("session_id");
  window.localStorage.removeItem(EXPENSE_AUTH_STORAGE_KEY);
  useAuthStore.getState().clearAuth();

  if (window.location.pathname === "/login") {
    isLoggingOut = false;
    return;
  }

  if (isLoggingOut) return;
  isLoggingOut = true;

  toast.error(message, { id: "session-expired" });
  window.location.replace("/login");
};

export const isUnauthenticatedResponse = (
  response: Response,
  payload?: unknown,
): boolean => {
  if (response.status === 401) return true;
  if (response.ok || response.status === 403) return false;
  if (!payload || typeof payload !== "object") return false;

  const message = String(
    (payload as { message?: string; msg?: string; error?: string }).message ??
      (payload as { msg?: string }).msg ??
      (payload as { error?: string }).error ??
      "",
  ).toLowerCase();

  return /unauthenticated|invalid token|token expired/.test(message);
};

/**
 * Global fetch safeguard: any 401 response outside auth login/register
 * endpoints automatically logs the user out and redirects to /login.
 */
export const installGlobalAuthFetchInterceptor = () => {
  if (isFetchInterceptorInstalled || typeof window === "undefined") return;
  isFetchInterceptorInstalled = true;

  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const response = await originalFetch(input, init);

    if (response.status === 401 && !isExcludedAuthUrl(extractUrl(input))) {
      endUnauthenticatedSession();
    }

    return response;
  };
};
