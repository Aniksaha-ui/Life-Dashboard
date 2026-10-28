import type {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  ResponseType,
} from "axios";
import axios, { AxiosHeaders } from "axios";
import type { ApiResponse } from "../types/common";
import { getCookie, removeCookie } from "../utils/cookie";
import { showToast } from "./toast";

// Environment variables
const baseURL = import.meta.env.VITE_API_BASE_URL as string;

let isLoggingOut = false;

/**
 * Consolidated logout function to handle session expiration
 */
const handleLogout = (message?: string) => {
  if (isLoggingOut) return;

  // Don't redirect if we are already on the login page
  if (window.location.pathname === "/login") return;

  isLoggingOut = true;

  removeCookie("session_id");
  showToast(message || "Session expired. Please login again.", "error");

  // Use a small delay for the user to see the toast before redirecting
  setTimeout(() => {
    window.location.href = "/login";
  }, 1000);
};

export const logoutDueToSessionExpiry = (message?: string) => {
  handleLogout(message);
};

// Create axios instance
const instance: AxiosInstance = axios.create({
  baseURL,
  timeout: 60000, // 60 seconds
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach auth/fingerprint headers from cookies
instance.interceptors.request.use((config) => {
  const sessionId = getCookie("session_id");
  const deviceFingerprint = getCookie("device_fingerprint");

  if (!config.headers) {
    config.headers = new AxiosHeaders();
  }
  const headers = config.headers as AxiosHeaders | Record<string, string>;

  if (sessionId) {
    if (headers instanceof AxiosHeaders) {
      headers.set("Authorization", `Bearer ${sessionId}`);
    } else {
      headers.Authorization = `Bearer ${sessionId}`;
    }
  }

  if (deviceFingerprint) {
    if (headers instanceof AxiosHeaders) {
      headers.set("X-Device-Fingerprint", deviceFingerprint);
    } else {
      headers["X-Device-Fingerprint"] = deviceFingerprint;
    }
  }

  return config;
});

// Response interceptor for fallback error handling (e.g., real HTTP 401)
instance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    const url = originalRequest?.url || "";

    // Skip global logout for auth endpoints
    const isAuthEndpoint =
      url.includes("/auth/login") || url.includes("/auth/verify-2fa");

    // Handle real HTTP 401 (e.g., from server or firewall)
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;
      handleLogout("Session expired. Please login again.");
    }

    return Promise.reject(error);
  },
);

// Request options for handling UI side-effects
export type RequestOptions = {
  showSuccessToast?: boolean;
  successMessage?: string;
  showErrorToast?: boolean;
};

// Response body handler
const responseBody = <T>(
  response: AxiosResponse<ApiResponse<T>>,
  options?: RequestOptions,
): T | null => {
  const responseData = response.data;
  const url = response.config?.url || "";
  const isAuthEndpoint =
    url.includes("/auth/login") || url.includes("/auth/verify-2fa");

  // Handle application-level 401 in a 200 OK response body
  if (responseData.code === 401 && !isAuthEndpoint) {
    handleLogout(responseData.message);
    throw new Error(responseData.message || "Session expired");
  }

  // Handle API error statuses or codes (>= 400)
  // We throw here and let errorBody handle the toast if needed
  if (
    responseData.code >= 400 ||
    responseData.status === "error" ||
    responseData.status === "fail"
  ) {
    let message = responseData.message || "An error occurred";
    if (
      responseData.error &&
      Array.isArray(responseData.error) &&
      responseData.error.length > 0
    ) {
      message = responseData.error[0];
    }
    throw new Error(message);
  }

  // Show success toast if requested
  if (options?.showSuccessToast) {
    const message = options.successMessage || responseData.message || "Success";
    showToast(message, "success");
  }

  // Return the data portion of successful responses
  return responseData.data;
};

// Error handler (catches network errors, timeouts, and non-200 responses)
const errorBody = (error: AxiosError | Error, options?: RequestOptions) => {
  // If it's a 401, it's already being handled by the interceptor or responseBody
  if (
    "isAxiosError" in error &&
    (error as AxiosError).response?.status === 401
  ) {
    throw error;
  }

  // Prevent multiple toasts during logout/session expiration
  if (isLoggingOut) {
    throw error;
  }

  if (options?.showErrorToast !== false) {
    const message =
      (error as any)?.response?.data?.message ||
      error.message ||
      "A network error occurred";
    showToast(message, "error");
  }
  throw error;
};

// API request methods
export const api = {
  get: <T>(
    url: string,
    responseType?: ResponseType,
    options?: RequestOptions,
  ): Promise<T | null> =>
    instance
      .get<ApiResponse<T>>(url, { responseType })
      .then((response) => responseBody(response, options))
      .catch((error) => errorBody(error, options)),

  post: <T>(
    url: string,
    body?: Record<string, any>,
    options?: RequestOptions,
  ): Promise<T | null> =>
    instance
      .post<ApiResponse<T>>(url, body)
      .then((response) => responseBody(response, options))
      .catch((error) => errorBody(error, options)),

  postForm: <T>(
    url: string,
    body?: Record<string, any>,
    options?: RequestOptions,
  ): Promise<T | null> => {
    const params = new URLSearchParams();
    if (body) {
      Object.keys(body).forEach((key) => {
        params.append(key, String(body[key]));
      });
    }
    return instance
      .post<ApiResponse<T>>(url, params.toString(), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })
      .then((response) => responseBody(response, options))
      .catch((error) => errorBody(error, options));
  },

  postMultipart: <T>(
    url: string,
    formData: FormData,
    options?: RequestOptions,
  ): Promise<T | null> =>
    instance
      .post<ApiResponse<T>>(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => responseBody(response, options))
      .catch((error) => errorBody(error, options)),

  put: <T>(
    url: string,
    body?: Record<string, any>,
    options?: RequestOptions,
  ): Promise<T | null> =>
    instance
      .put<ApiResponse<T>>(url, body)
      .then((response) => responseBody(response, options))
      .catch((error) => errorBody(error, options)),

  patch: <T>(
    url: string,
    body?: Record<string, any>,
    options?: RequestOptions,
  ): Promise<T | null> =>
    instance
      .patch<ApiResponse<T>>(url, body)
      .then((response) => responseBody(response, options))
      .catch((error) => errorBody(error, options)),

  delete: <T>(url: string, options?: RequestOptions): Promise<T | null> =>
    instance
      .delete<ApiResponse<T>>(url)
      .then((response) => responseBody(response, options))
      .catch((error) => errorBody(error, options)),
};

export { instance as axiosInstance };
export type { AxiosError, AxiosResponse, ResponseType };
