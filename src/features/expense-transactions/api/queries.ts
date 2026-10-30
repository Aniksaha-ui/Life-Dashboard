import { getCookie } from "../../../utils/cookie";
import { useAuthStore } from "../../../stores/authStore";
import {
  endUnauthenticatedSession,
  isUnauthenticatedResponse,
} from "../../../utils/session";

const baseUrl = () =>
  (import.meta.env.VITE_BASE_URL as string | undefined)?.replace(/\/+$/, "") ??
  "";
const token = () => {
  const inMemoryToken =
    getCookie("session_id") || useAuthStore.getState().token;
  if (inMemoryToken) return inMemoryToken;

  try {
    return (
      JSON.parse(
        window.localStorage.getItem("travel-agency-admin-auth-session") ||
          "null",
      )?.token || null
    );
  } catch {
    return null;
  }
};

const getErrorMessage = (payload: unknown, fallback: string) => {
  if (!payload || typeof payload !== "object") return fallback;
  const body = payload as {
    message?: string;
    msg?: string;
    error?: string;
    errors?: Record<string, string | string[]>;
  };
  const validationError =
    body.errors && Object.values(body.errors).flat().find(Boolean);
  return validationError || body.msg || body.message || body.error || fallback;
};

const isSuccessfulExecution = (payload: unknown) => {
  if (!payload || typeof payload !== "object") return true;
  const status =
    (payload as { isExecute?: unknown; isExecture?: unknown }).isExecute ??
    (payload as { isExecture?: unknown }).isExecture;
  if (status === undefined || status === null || status === "") return true;
  return typeof status === "boolean"
    ? status
    : String(status).trim().toLowerCase() === "success";
};
const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  if (!baseUrl()) throw new Error("VITE_BASE_URL is not configured.");
  const accessToken = token();
  if (!accessToken)
    throw new Error("Your session is missing. Please sign in again.");
  const isFormData = init?.body instanceof FormData;
  const response = await fetch(`${baseUrl()}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(!isFormData ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${accessToken}`,
      ...init?.headers,
    },
  });
  const payload = await response.json().catch(() => null);
  if (isUnauthenticatedResponse(response, payload)) {
    endUnauthenticatedSession();
    throw new Error("Your session has expired. Please sign in again.");
  }
  if (!response.ok || !isSuccessfulExecution(payload))
    throw new Error(
      getErrorMessage(payload, "Unable to complete the transaction request."),
    );
  return (payload?.data ?? payload) as T;
};
export const getLedger = () => request<any[]>("/transactions");
export const getAccounts = () => request<any[]>("/accounts");
export const getCategories = () => request<any[]>("/categories");
export const createLedgerEntry = (type: string, payload: object) =>
  request(`/transactions/${type.toLowerCase()}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

const canTryNextUpdateEndpoint = (error: unknown) => {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  return (
    message.includes("could not be found") ||
    message.includes("not supported for route") ||
    message.includes("supported methods") ||
    message.includes("not found")
  );
};

export const updateLedgerEntry = async (
  id: string | number,
  payload: object,
) => {
  const candidates: Array<{ path: string; method: "PUT" | "PATCH" | "POST" }> =
    [
      { path: `/transactions/${id}`, method: "PUT" },
      { path: `/transactions/${id}`, method: "PATCH" },
      { path: `/transactions/update/${id}`, method: "PUT" },
      { path: `/transactions/update/${id}`, method: "PATCH" },
      { path: `/transactions/update/${id}`, method: "POST" },
    ];
  let lastError: unknown;

  for (const candidate of candidates) {
    try {
      return await request(candidate.path, {
        method: candidate.method,
        body: JSON.stringify(payload),
      });
    } catch (error) {
      lastError = error;
      if (!canTryNextUpdateEndpoint(error)) throw error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Unable to update transaction.");
};
export const createBulkLedgerEntries = (transactions: object[]) =>
  request("/transactions/bulk", {
    method: "POST",
    body: JSON.stringify({ transactions }),
  });
export const scanReceipt = (file: File) => {
  const body = new FormData();
  body.append("receipt", file);
  return request<any>("/transactions/scan-receipt", { method: "POST", body });
};
