import { getCookie } from "../../../utils/cookie";
import { useAuthStore } from "../../../stores/authStore";
import type { AccountApiItem, AccountFormValues } from "../types";

const baseUrl = () =>
  (import.meta.env.VITE_BASE_URL as string | undefined)?.replace(/\/+$/, "") ??
  "";
const EXPENSE_AUTH_STORAGE_KEY = "travel-agency-admin-auth-session";

const getAccessToken = () => {
  const cookieToken = getCookie("session_id");
  if (cookieToken) return cookieToken;

  const storeToken = useAuthStore.getState().token;
  if (storeToken) return storeToken;

  try {
    return (
      JSON.parse(
        window.localStorage.getItem(EXPENSE_AUTH_STORAGE_KEY) || "null",
      )?.token || null
    );
  } catch {
    return null;
  }
};

const accountRequest = async <T>(
  path: string,
  init?: RequestInit,
): Promise<T> => {
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
  if (!response.ok)
    throw new Error(
      payload?.message || "Unable to complete the account request.",
    );
  if (payload?.isExecute === false || payload?.isExecture === false)
    throw new Error(
      payload?.message || "Unable to complete the account request.",
    );
  return (payload?.data ?? payload) as T;
};

export const getAccounts = () => accountRequest<AccountApiItem[]>("/accounts");
export const getAccount = (id: string | number) =>
  accountRequest<AccountApiItem>(`/accounts/${id}`);

const toPayload = (values: AccountFormValues, isEditing: boolean) => {
  const payload: Record<string, string | boolean | null> = {
    name: values.name.trim(),
    type: values.type,
    institution_name: values.institution_name.trim() || null,
    is_active: values.is_active === "1",
    low_balance_threshold: values.low_balance_threshold.trim() || null,
  };
  if (!isEditing && values.opening_balance.trim())
    payload.opening_balance = values.opening_balance.trim();
  if (!isEditing && values.opening_balance_date)
    payload.opening_balance_date = values.opening_balance_date;
  return payload;
};

export const createAccount = (values: AccountFormValues) =>
  accountRequest("/accounts", {
    method: "POST",
    body: JSON.stringify(toPayload(values, false)),
  });
export const updateAccount = (id: string | number, values: AccountFormValues) =>
  accountRequest(`/accounts/${id}`, {
    method: "PUT",
    body: JSON.stringify(toPayload(values, true)),
  });
