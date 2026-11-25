import { useAuthStore } from "../../../stores/authStore";
import { getCookie } from "../../../utils/cookie";
import {
  endUnauthenticatedSession,
  isUnauthenticatedResponse,
} from "../../../utils/session";
import type {
  MenuItemApiItem,
  MenuItemPayload,
  MenuOptionsResponse,
} from "../types";

const STORAGE_KEY = "travel-agency-admin-auth-session";
const MENU_ENDPOINT = "/admin/menu_items";
/** The backend caps page size at 200; the screen filters client-side. */
const PAGE_SIZE = 200;

export class MenuApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "MenuApiError";
    this.status = status;
  }
}

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

/** Builds a readable error from the API payload, including field errors. */
const getErrorMessage = (payload: unknown): string => {
  const body = payload as {
    msg?: string;
    message?: string;
    errors?: Record<string, string[]>;
  } | null;
  const firstFieldError = body?.errors
    ? Object.values(body.errors)[0]?.[0]
    : undefined;

  return (
    firstFieldError ||
    body?.msg ||
    body?.message ||
    "Unable to complete the menu item request."
  );
};

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  if (!baseUrl()) throw new MenuApiError("VITE_BASE_URL is not configured.");

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
    throw new MenuApiError(
      "Your session has expired. Please sign in again.",
      401,
    );
  }
  if (
    !response.ok ||
    payload?.isExecute === "failed" ||
    payload?.isExecture === "failed"
  ) {
    throw new MenuApiError(getErrorMessage(payload), response.status);
  }

  return (payload?.data ?? payload) as T;
};

/** The list endpoint returns a Laravel paginator, or [] when empty. */
export const getMenuItems = async (): Promise<MenuItemApiItem[]> => {
  const data = await request<MenuItemApiItem[] | { data?: MenuItemApiItem[] }>(
    `${MENU_ENDPOINT}?per_page=${PAGE_SIZE}`,
  );

  return Array.isArray(data) ? data : (data?.data ?? []);
};

export const getMenuOptions = async (): Promise<MenuOptionsResponse> => {
  const data = await request<Partial<MenuOptionsResponse>>(
    `${MENU_ENDPOINT}/options`,
  );

  return {
    routes: Array.isArray(data?.routes) ? data.routes : [],
    users: Array.isArray(data?.users) ? data.users : [],
    roles: Array.isArray(data?.roles) ? data.roles : [],
  };
};

export const createMenuItem = (values: MenuItemPayload) =>
  request<MenuItemApiItem>(MENU_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(values),
  });

export const updateMenuItem = (id: number, values: MenuItemPayload) =>
  request<MenuItemApiItem>(`${MENU_ENDPOINT}/update/${id}`, {
    method: "POST",
    body: JSON.stringify(values),
  });

export const deleteMenuItem = (id: number) =>
  request<unknown>(`${MENU_ENDPOINT}/${id}`, { method: "DELETE" });

export const syncUserMenuAccess = (userId: number, paths: string[]) =>
  request<unknown>(`${MENU_ENDPOINT}/assign/user/${userId}`, {
    method: "PUT",
    body: JSON.stringify({ paths }),
  });

export const syncRoleMenuAccess = (role: string, paths: string[]) =>
  request<unknown>(`${MENU_ENDPOINT}/assign/role`, {
    method: "PUT",
    body: JSON.stringify({ role, paths }),
  });
