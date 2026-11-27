import { useAuthStore } from "../../../stores/authStore";
import { getCookie } from "../../../utils/cookie";
import {
  endUnauthenticatedSession,
  isUnauthenticatedResponse,
} from "../../../utils/session";
import type { MonthlyWeekComparisonReport } from "../types";

const base = () =>
  (import.meta.env.VITE_BASE_URL as string | undefined)?.replace(/\/+$/, "") ??
  "";

const request = async <T>(path: string, init: RequestInit = {}) => {
  const response = await fetch(`${base()}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${getCookie("session_id") || useAuthStore.getState().token || ""}`,
      ...init.headers,
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
    payload?.isExecute === "failed"
  ) {
    throw new Error(
      payload?.message ||
        payload?.msg ||
        "Financial intelligence is unavailable.",
    );
  }
  return (payload?.data ?? payload) as T;
};

export const getDashboard = (from: string, to: string, months = 12) =>
  request<any>(
    `/financial-intelligence/dashboard?${new URLSearchParams({
      from_date: from,
      to_date: to,
      months: String(months),
    })}`,
  );

export const getMonthlyWeekComparison = (months = 12, toDate?: string) => {
  const params = new URLSearchParams({ months: String(months) });
  if (toDate) params.set("to_date", toDate);

  return request<MonthlyWeekComparisonReport>(
    `/financial-intelligence/monthly-week-comparison?${params}`,
  );
};

export const getAnomalies = () => request<any>("/financial-anomalies");

export const askFinance = (question: string, from: string, to: string) =>
  request<any>("/financial-intelligence/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, from_date: from, to_date: to }),
  });

export const reviewAnomaly = (id: string | number) =>
  request(`/financial-anomalies/${id}/review`, { method: "PUT" });
