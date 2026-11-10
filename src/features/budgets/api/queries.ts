import { getCookie } from "../../../utils/cookie";
import { useAuthStore } from "../../../stores/authStore";
import {
  endUnauthenticatedSession,
  isUnauthenticatedResponse,
} from "../../../utils/session";
import type { BudgetApiItem, BudgetFormValues, CategoryOption } from "../types";

const STORAGE_KEY = "travel-agency-admin-auth-session";

const baseUrl = () =>
  (import.meta.env.VITE_BASE_URL as string | undefined)?.replace(/\/+$/, "") ||
  "";

const getToken = () => {
  const token = getCookie("session_id") || useAuthStore.getState().token;
  if (token) return token;

  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null")?.token;
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

  if (!response.ok || payload?.isExecute === false || payload?.isExecture === false)
    throw new Error(payload?.message || "Unable to complete the budget request.");

  return (payload?.data ?? payload) as T;
};

export async function getBudgets(date: string): Promise<BudgetApiItem[]> {
  const response = await request<BudgetApiItem[] | { budgets?: BudgetApiItem[] }>(
    `/budgets?date=${encodeURIComponent(date)}`,
  );
  return Array.isArray(response) ? response : response?.budgets ?? [];
}

export const getCategories = () => request<CategoryOption[]>("/categories");

export const createBudget = (values: BudgetFormValues) =>
  request("/budgets", {
    method: "POST",
    body: JSON.stringify({ ...values, amount: Number(values.amount) }),
  });

export const updateBudget = (id: string | number, values: BudgetFormValues) =>
  request(`/budgets/${id}`, {
    method: "PUT",
    body: JSON.stringify({ ...values, amount: Number(values.amount) }),
  });

export const deleteBudget = (id: string | number) =>
  request(`/budgets/${id}`, { method: "DELETE" });
