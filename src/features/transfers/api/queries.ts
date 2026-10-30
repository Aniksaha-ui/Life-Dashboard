import { getCookie } from "../../../utils/cookie";
import { useAuthStore } from "../../../stores/authStore";
import {
  endUnauthenticatedSession,
  isUnauthenticatedResponse,
} from "../../../utils/session";

const baseUrl = () =>
  (import.meta.env.VITE_BASE_URL as string | undefined)?.replace(/\/+$/, "") ??
  "";
const getToken = () => {
  const token = getCookie("session_id") || useAuthStore.getState().token;
  if (token) return token;
  try {
    return (
      JSON.parse(
        localStorage.getItem("travel-agency-admin-auth-session") || "null",
      )?.token || null
    );
  } catch {
    return null;
  }
};
const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const token = getToken();
  if (!baseUrl() || !token)
    throw new Error("Your session is missing. Please sign in again.");
  const response = await fetch(`${baseUrl()}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  });
  const payload = await response.json().catch(() => null);
  if (isUnauthenticatedResponse(response, payload)) {
    endUnauthenticatedSession();
    throw new Error("Your session has expired. Please sign in again.");
  }
  const status = payload?.isExecute ?? payload?.isExecture;
  const successful =
    status === undefined ||
    status === null ||
    status === "" ||
    status === true ||
    String(status).toLowerCase() === "success";
  if (!response.ok || !successful)
    throw new Error(
      payload?.msg ||
        payload?.message ||
        "Unable to complete the transfer request.",
    );
  return (payload?.data ?? payload) as T;
};
export const getTransfers = () => request<any[]>("/transfers");
export const getAccounts = () => request<any[]>("/accounts");
export const createTransfer = (payload: object) =>
  request("/transfers", { method: "POST", body: JSON.stringify(payload) });
export const withdrawToCash = (payload: object) =>
  request("/transfers/withdraw-to-cash", {
    method: "POST",
    body: JSON.stringify(payload),
  });
export const updateTransfer = (id: string | number, payload: object) =>
  request(`/transfers/${id}`, { method: "PUT", body: JSON.stringify(payload) });
