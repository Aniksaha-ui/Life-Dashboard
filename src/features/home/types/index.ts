export interface DateRange {
  from: string;
  to: string;
}

export type Period =
  "today" | "last_day" | "7d" | "30d" | "this_week" | "this_month" | "custom";

export interface MerchantMetric {
  id: string;
  name: string;
  gmv30d: number;
  gmv7d: number;
  gmvTrend: number;
  txCount30d: number;
  txCount7d: number;
  txCountTrend: number;
  revenue30d: number;
  revenue7d: number;
  revenueTrend: number;
  sector: string;
}

export type MerchantMetricType = "gmv" | "txCount" | "revenue";

export interface ActionCenterData {
  id: string;
  title: string;
  count: number;
  due: string;
  type: string;
  ownerId?: string;
}

export * from "./summary";
