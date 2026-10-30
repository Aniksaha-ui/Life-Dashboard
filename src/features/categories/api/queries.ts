import { getCookie } from "../../../utils/cookie";
import { useAuthStore } from "../../../stores/authStore";
import {
  endUnauthenticatedSession,
  isUnauthenticatedResponse,
} from "../../../utils/session";
import type { CategoryApiItem, CategoryFormValues } from "../types";

const STORAGE_KEY = "travel-agency-admin-auth-session";
const baseUrl = () =>
  (import.meta.env.VITE_BASE_URL as string | undefined)?.replace(/\/+$/, "") ??
  "";

const getAccessToken = () => {
  const token = getCookie("session_id") || useAuthStore.getState().token;
  if (token) return token;
  try {
    return (
      JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null")?.token ||
      null
    );
  } catch {
    return null;
  }
};

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  if (!baseUrl()) throw new Error("VITE_BASE_URL is not configured.");
  const token = getAccessToken();
  const response = await fetch(`${baseUrl()}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
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
  ) {
    throw new Error(
      payload?.message || "Unable to complete the category request.",
    );
  }
  return (payload?.data ?? payload) as T;
};

export const getCategories = () => request<CategoryApiItem[]>("/categories");
export const createCategory = (values: CategoryFormValues) =>
  request("/categories", { method: "POST", body: JSON.stringify(values) });
export const updateCategory = (
  id: string | number,
  values: CategoryFormValues,
) =>
  request(`/categories/${id}`, { method: "PUT", body: JSON.stringify(values) });
