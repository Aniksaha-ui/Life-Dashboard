import { getCookie } from "../../../utils/cookie";
import { useAuthStore } from "../../../stores/authStore";
import { endUnauthenticatedSession, isUnauthenticatedResponse } from "../../../utils/session";
import type { ExperienceApiItem, ExperienceFormValues, ExperiencePayload } from "../types";

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
  if (!response.ok || payload?.isExecute !== "success") throw new Error(payload?.msg || payload?.message || "Unable to complete the experience request.");
  return (payload?.data ?? payload) as T;
};

export interface ExperienceCollection { rows: ExperienceApiItem[]; pagination: { currentPage: number; lastPage: number; total: number; from: number; to: number }; }

export async function getExperiences(page = 1, search = ""): Promise<ExperienceCollection> {
  const params = new URLSearchParams({ page: String(page), per_page: "15" });
  if (search.trim()) params.set("search", search.trim());
  const response = await request<ExperienceApiItem[] | { data?: ExperienceApiItem[]; current_page?: number; last_page?: number; total?: number; from?: number; to?: number }>(`/experiences?${params}`);
  if (Array.isArray(response)) return { rows: response, pagination: { currentPage: 1, lastPage: 1, total: response.length, from: response.length ? 1 : 0, to: response.length } };
  const rows = response.data ?? [];
  return { rows, pagination: { currentPage: response.current_page ?? 1, lastPage: response.last_page ?? 1, total: response.total ?? rows.length, from: response.from ?? 0, to: response.to ?? rows.length } };
}

export const getExperience = (id: string | number) => request<ExperienceApiItem>(`/experiences/${id}`);
const toPayload = (values: ExperienceFormValues): ExperiencePayload => ({ ...values, is_current: values.is_current ? "1" : "0", status: Number(values.status) });
export const createExperience = (values: ExperienceFormValues) => request<ExperienceApiItem>("/experiences", { method: "POST", body: JSON.stringify(toPayload(values)) });
export const updateExperience = (id: string | number, values: ExperienceFormValues) => request<ExperienceApiItem>(`/experiences/${id}`, { method: "PUT", body: JSON.stringify(toPayload(values)) });
export const deleteExperience = (id: string | number) => request<void>(`/experiences/${id}`, { method: "DELETE" });
