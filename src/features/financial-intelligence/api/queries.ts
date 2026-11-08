import { getCookie } from "../../../utils/cookie";
import { useAuthStore } from "../../../stores/authStore";
const base = () => (import.meta.env.VITE_BASE_URL as string | undefined)?.replace(/\/+$/, "") ?? "";
const request = async <T>(path: string, init: RequestInit = {}) => { const response = await fetch(`${base()}${path}`, { ...init, headers: { Accept: "application/json", Authorization: `Bearer ${getCookie("session_id") || useAuthStore.getState().token || ""}`, ...init.headers } }); const payload = await response.json().catch(() => null); if (!response.ok || payload?.isExecute === false) throw new Error(payload?.message || payload?.msg || "Financial intelligence is unavailable."); return (payload?.data ?? payload) as T; };
export const getDashboard = (from: string, to: string) => request<any>(`/financial-intelligence/dashboard?${new URLSearchParams({ from_date: from, to_date: to })}`);
export const getAnomalies = () => request<any>("/financial-anomalies");
export const askFinance = (question: string, from: string, to: string) => request<any>("/financial-intelligence/ask", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question, from_date: from, to_date: to }) });
export const reviewAnomaly = (id: string | number) => request(`/financial-anomalies/${id}/review`, { method: "PUT" });
