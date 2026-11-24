import { useAuthStore } from "../../../stores/authStore";
import { getCookie } from "../../../utils/cookie";
import {
  endUnauthenticatedSession,
  isUnauthenticatedResponse,
} from "../../../utils/session";
import { normalizeReportDeliverySettings } from "../constants/jobs";
import type { ReportDeliverySetting, RunReportJobResult } from "../types";

const settingsUrl = "/cron-report-delivery-settings";
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
  if (!baseUrl() || !token) {
    throw new Error("Your session is missing. Please sign in again.");
  }

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

  if (!response.ok || payload?.isExecute === false || payload?.isExecture === false) {
    throw new Error(payload?.message || "Unable to complete the report delivery request.");
  }

  return payload as T;
};

const settingsFrom = (payload: unknown): ReportDeliverySetting[] => {
  const data = (payload as { data?: unknown })?.data ?? payload;
  if (Array.isArray(data)) return normalizeReportDeliverySettings(data);
  if (Array.isArray((data as { settings?: unknown })?.settings)) {
    return normalizeReportDeliverySettings(
      (data as { settings: ReportDeliverySetting[] }).settings,
    );
  }
  return normalizeReportDeliverySettings([]);
};

export const getReportDeliverySettings = async () =>
  settingsFrom(await request<unknown>(settingsUrl));

export const updateReportDeliverySettings = async (settings: ReportDeliverySetting[]) => {
  const payload = await request<unknown>(settingsUrl, {
    method: "PUT",
    body: JSON.stringify({ settings }),
  });
  const saved = settingsFrom(payload);
  return saved.length ? saved : normalizeReportDeliverySettings(settings);
};

export const runReportDeliveryJob = async (
  jobKey: string,
  payload: { from_date: string; to_date: string; frequency?: "daily" },
) => {
  const response = await request<{ data?: RunReportJobResult } | RunReportJobResult>(
    `/cron-report-jobs/${encodeURIComponent(jobKey)}/run`,
    { method: "POST", body: JSON.stringify(payload) },
  );
  return (response as { data?: RunReportJobResult }).data ?? response;
};
