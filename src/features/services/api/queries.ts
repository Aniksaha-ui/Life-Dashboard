import { getCookie } from "../../../utils/cookie";
import { useAuthStore } from "../../../stores/authStore";
import { endUnauthenticatedSession, isUnauthenticatedResponse } from "../../../utils/session";
import type { ServiceApiItem, ServiceFormValues } from "../types";

const STORAGE_KEY = "travel-agency-admin-auth-session";
const baseUrl = () => (import.meta.env.VITE_BASE_URL as string | undefined)?.replace(/\/+$/, "") ?? "";

const getToken = () => {
  const token = getCookie("session_id") || useAuthStore.getState().token;
  if (token) return token;
  try { return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null")?.token || null; } catch { return null; }
};

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const token = getToken();
  if (!baseUrl() || !token) throw new Error("Your session is missing. Please sign in again.");
  const response = await fetch(`${baseUrl()}${path}`, { ...init, headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...init?.headers } });
  const payload = await response.json().catch(() => null);
  if (isUnauthenticatedResponse(response, payload)) { endUnauthenticatedSession(); throw new Error("Your session has expired. Please sign in again."); }
  if (!response.ok || payload?.isExecute !== "success") throw new Error(payload?.msg || payload?.message || "Unable to complete the service request.");
  return (payload?.data ?? payload) as T;
};

export interface ServiceCollection { rows: ServiceApiItem[]; pagination: { currentPage: number; lastPage: number; total: number; from: number; to: number }; }

export async function getServices(page = 1, search = ""): Promise<ServiceCollection> {
  const params = new URLSearchParams({ page: String(page), per_page: "100" });
  if (search.trim()) params.set("search", search.trim());
  const response = await request<ServiceApiItem[] | { data?: ServiceApiItem[]; current_page?: number; last_page?: number; total?: number; from?: number; to?: number }>(`/services?${params}`);
  if (Array.isArray(response)) return { rows: response, pagination: { currentPage: 1, lastPage: 1, total: response.length, from: response.length ? 1 : 0, to: response.length } };
  const rows = response.data ?? [];
  return { rows, pagination: { currentPage: response.current_page ?? 1, lastPage: response.last_page ?? 1, total: response.total ?? rows.length, from: response.from ?? 0, to: response.to ?? rows.length } };
}

const toPayload = (values: ServiceFormValues) => ({ ...values, image_url: values.image_url.trim() || null, status: Number(values.status) });
export const createService = (values: ServiceFormValues) => request<ServiceApiItem>("/services", { method: "POST", body: JSON.stringify(toPayload(values)) });
export const updateService = (id: string | number, values: ServiceFormValues) => request<ServiceApiItem>(`/services/${id}`, { method: "PUT", body: JSON.stringify(toPayload(values)) });
export const deleteService = (id: string | number) => request<void>(`/services/${id}`, { method: "DELETE" });
