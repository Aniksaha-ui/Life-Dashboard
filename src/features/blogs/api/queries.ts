import { getCookie } from "../../../utils/cookie";
import { useAuthStore } from "../../../stores/authStore";
import {
  endUnauthenticatedSession,
  isUnauthenticatedResponse,
} from "../../../utils/session";
import type { BlogApiItem, BlogFormValues, BlogPayload } from "../types";

const STORAGE_KEY = "travel-agency-admin-auth-session";

const baseUrl = () =>
  (import.meta.env.VITE_BASE_URL as string | undefined)?.replace(/\/+$/, "") ??
  "";

const getToken = () => {
  const token = getCookie("session_id") || useAuthStore.getState().token;
  if (token) return token;

  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null")?.token || null;
  } catch {
    return null;
  }
};

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const token = getToken();
  if (!baseUrl() || !token) throw new Error("Your session is missing. Please sign in again.");

  const response = await fetch(`${baseUrl()}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  });
  const payload = await response.json().catch(() => null);

  if (isUnauthenticatedResponse(response, payload)) {
    endUnauthenticatedSession();
    throw new Error("Your session has expired. Please sign in again.");
  }
  if (!response.ok || payload?.isExecute !== "success") {
    throw new Error(payload?.msg || payload?.message || "Unable to complete the blog request.");
  }

  return (payload?.data ?? payload) as T;
};

export interface BlogCollection {
  rows: BlogApiItem[];
  pagination: { currentPage: number; lastPage: number; total: number; from: number; to: number };
}

export async function getBlogs(page = 1, search = ""): Promise<BlogCollection> {
  const params = new URLSearchParams({ page: String(page), per_page: "10" });
  if (search.trim()) params.set("search", search.trim());
  const response = await request<BlogApiItem[] | { data?: BlogApiItem[]; current_page?: number; last_page?: number; total?: number; from?: number; to?: number }>(`/blogs?${params}`);
  if (Array.isArray(response)) {
    const total = response.length;
    const lastPage = Math.max(1, Math.ceil(total / 10));
    const currentPage = Math.min(Math.max(1, page), lastPage);
    const from = total ? (currentPage - 1) * 10 + 1 : 0;
    const rows = response.slice(from ? from - 1 : 0, from ? from + 9 : 10);
    return { rows, pagination: { currentPage, lastPage, total, from, to: from ? from + rows.length - 1 : 0 } };
  }
  const rows = response.data ?? [];
  return { rows, pagination: { currentPage: response.current_page ?? 1, lastPage: response.last_page ?? 1, total: response.total ?? rows.length, from: response.from ?? 0, to: response.to ?? rows.length } };
}

export const getBlog = (id: string | number) => request<BlogApiItem>(`/blogs/${id}`);

const withCoverImage = (values: BlogPayload | BlogFormValues, coverImage?: File | null) => {
  if (!coverImage) {
    const { image: _image, ...valuesWithoutImage } = values;
    return JSON.stringify(valuesWithoutImage);
  }

  const form = new FormData();
  Object.entries(values).forEach(([key, value]) => {
    if (key !== "image") form.append(key, key === "isPublished" ? (value ? "1" : "0") : String(value));
  });
  form.append("image", coverImage);
  return form;
};

export const createBlog = (values: BlogPayload | BlogFormValues, coverImage?: File | null) =>
  request<BlogApiItem>("/blogs", { method: "POST", body: withCoverImage(values, coverImage) });

export const updateBlog = (id: string | number, values: BlogPayload | BlogFormValues, coverImage?: File | null) =>
  request<BlogApiItem>(`/blogs/${id}`, { method: coverImage ? "POST" : "PUT", body: withCoverImage(values, coverImage) });

export const deleteBlog = (id: string | number) =>
  request<void>(`/blogs/${id}`, { method: "DELETE" });
