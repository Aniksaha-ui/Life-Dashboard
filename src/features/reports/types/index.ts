import type { LucideIcon } from "lucide-react";

export type ReportId =
  | "financial-overview"
  | "summary"
  | "account-balances"
  | "burn-rate-analysis"
  | "category-breakdown"
  | "category-usage-analysis"
  | "current-vs-previous-month-analysis"
  | "daywise-expenses"
  | "weekly-current-month-analysis";

export interface ReportDefinition {
  id: ReportId;
  title: string;
  description: string;
  endpoint: string;
  icon: LucideIcon;
  supportsDateRange?: boolean;
}

export interface ReportRow extends Record<string, unknown> {
  serial: number;
}

export interface ReportMetric {
  label: string;
  value: string;
}

export interface ReportData {
  rows: ReportRow[];
  metrics: ReportMetric[];
  chart?: {
    labels: string[];
    datasets: Array<{ label: string; data: number[]; color?: string }>;
  };
}
