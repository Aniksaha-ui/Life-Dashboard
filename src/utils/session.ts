import { useAuthStore } from "../stores/authStore";
import { removeCookie } from "./cookie";

const EXPENSE_AUTH_STORAGE_KEY = "travel-agency-admin-auth-session";

export const endUnauthenticatedSession = () => {
  removeCookie("session_id");
  window.localStorage.removeItem(EXPENSE_AUTH_STORAGE_KEY);
  useAuthStore.getState().clearAuth();

  if (window.location.pathname !== "/login") {
    window.location.replace("/login");
  }
};

export const isUnauthenticatedResponse = (
  response: Response,
  payload: unknown,
) => {
  if (response.status === 401 || response.status === 403) return true;
  if (!payload || typeof payload !== "object") return false;

  const message = String(
    (payload as { message?: string; msg?: string; error?: string }).message ??
      (payload as { msg?: string }).msg ??
      (payload as { error?: string }).error ??
      "",
  ).toLowerCase();

  return /unauthenticated|unauthorized|invalid token|token expired/.test(
    message,
  );
};
