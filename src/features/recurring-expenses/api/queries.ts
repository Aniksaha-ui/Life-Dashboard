import { getCookie } from "../../../utils/cookie";
import {
  endUnauthenticatedSession,
  isUnauthenticatedResponse,
} from "../../../utils/session";
import { useAuthStore } from "../../../stores/authStore";

const baseUrl = () =>
  (import.meta.env.VITE_BASE_URL as string | undefined)?.replace(/\/+$/, "") ||
  "";
const getToken = () =>
  getCookie("session_id") ||
  useAuthStore.getState().token ||
  JSON.parse(localStorage.getItem("travel-agency-admin-auth-session") || "null")
    ?.token;

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
  if (!response.ok || status === false)
    throw new Error(
      payload?.message ||
        payload?.msg ||
        "Unable to complete the recurring expense request.",
    );
  return (payload?.data ?? payload) as T;
};

export const getRecurringExpenses = () => request<any[]>("/recurring-expenses");
export const getAccounts = () => request<any[]>("/accounts");
export const getCategories = () => request<any[]>("/categories");
export const createRecurringExpense = (payload: object) =>
  request("/recurring-expenses", {
    method: "POST",
    body: JSON.stringify(payload),
  });
export const updateRecurringExpense = (id: string | number, payload: object) =>
  request(`/recurring-expenses/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
export const runRecurringExpense = (id: string | number) =>
  request(`/recurring-expenses/${id}/run`, {
    method: "POST",
    body: JSON.stringify({}),
  });
export const runDueRecurringExpenses = (through_date: string) =>
  request("/recurring-expenses/run-due", {
    method: "POST",
    body: JSON.stringify({ through_date }),
  });
