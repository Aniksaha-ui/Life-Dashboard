import { getCookie } from "../../../utils/cookie";
import {
  endUnauthenticatedSession,
  isUnauthenticatedResponse,
} from "../../../utils/session";
import { useAuthStore } from "../../../stores/authStore";

const baseUrl = () =>
  (import.meta.env.VITE_BASE_URL as string | undefined)?.replace(/\/+$/, "") ??
  "";

const getToken = () => {
  const token = getCookie("session_id") || useAuthStore.getState().token;
  if (token) return token;

  try {
    return JSON.parse(
      localStorage.getItem("travel-agency-admin-auth-session") || "null",
    )?.token;
  } catch {
    return null;
  }
};

export async function getReport(
  endpoint: string,
  filters: { fromDate?: string; toDate?: string; granularity?: string },
) {
  const token = getToken();
  if (!baseUrl() || !token)
    throw new Error("Your session is missing. Please sign in again.");

  const params = new URLSearchParams();
  if (filters.fromDate) params.set("from_date", filters.fromDate);
  if (filters.toDate) params.set("to_date", filters.toDate);
  if (filters.granularity) params.set("granularity", filters.granularity);
  const path = params.size ? `${endpoint}?${params}` : endpoint;
  const response = await fetch(`${baseUrl()}${path}`, {
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
  });
  const payload = await response.json().catch(() => null);

  if (isUnauthenticatedResponse(response, payload)) {
    endUnauthenticatedSession();
    throw new Error("Your session has expired. Please sign in again.");
  }
  if (
    !response.ok ||
    payload?.isExecute === false ||
    payload?.isExecture === false
  )
    throw new Error(
      payload?.message || payload?.msg || "Unable to load the report.",
    );

  return payload?.data ?? payload;
}
