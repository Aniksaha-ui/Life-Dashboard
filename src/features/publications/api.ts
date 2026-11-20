import { getCookie } from "../../utils/cookie";
import { useAuthStore } from "../../stores/authStore";
import { endUnauthenticatedSession, isUnauthenticatedResponse } from "../../utils/session";
import type { Publication, PublicationValues } from "./types";

const baseUrl = () => (import.meta.env.VITE_BASE_URL as string | undefined)?.replace(/\/+$/, "") ?? "";
const token = () => getCookie("session_id") || useAuthStore.getState().token;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const auth = token();
  if (!baseUrl() || !auth) throw new Error("Your session is missing. Please sign in again.");
  const response = await fetch(`${baseUrl()}${path}`, { ...init, headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: `Bearer ${auth}`, ...init?.headers } });
  const payload = await response.json().catch(() => null);
  if (isUnauthenticatedResponse(response, payload)) { endUnauthenticatedSession(); throw new Error("Your session has expired. Please sign in again."); }
  if (!response.ok || payload?.isExecute !== "success") throw new Error(payload?.msg || payload?.message || "Unable to complete the publication request.");
  return (payload?.data ?? payload) as T;
}

export const listPublications = () => request<Publication[] | { data?: Publication[] }>("/publications?per_page=100").then((response) => Array.isArray(response) ? response : response.data ?? []);
export const createPublication = (values: PublicationValues) => request<Publication>("/publications", { method: "POST", body: JSON.stringify(values) });
export const updatePublication = (id: string | number, values: PublicationValues) => request<Publication>(`/publications/${id}`, { method: "PUT", body: JSON.stringify(values) });
export const deletePublication = (id: string | number) => request<void>(`/publications/${id}`, { method: "DELETE" });
