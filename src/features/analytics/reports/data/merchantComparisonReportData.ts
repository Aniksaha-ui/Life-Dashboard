import type { Merchant } from "../../../../data/mock/types";
import type { ReportFilters } from "../reportApi";

const BASE_PERIOD_DAYS = 30;

export type ComparedMerchantMetrics = Merchant & {
  periodGmv: number;
  periodTxCount: number;
  periodRevenue: number;
  periodSuccessRate: number;
};

export function getComparisonDayCount(filters: ReportFilters): number {
  if (filters.from && filters.to) {
    const fromDate = new Date(`${filters.from}T00:00:00`);
    const toDate = new Date(`${filters.to}T00:00:00`);

    if (
      Number.isNaN(fromDate.getTime()) ||
      Number.isNaN(toDate.getTime()) ||
      toDate < fromDate
    ) {
      return BASE_PERIOD_DAYS;
    }

    const diffMs = toDate.getTime() - fromDate.getTime();
    return Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
  }

  return BASE_PERIOD_DAYS;
}

export function toComparedMerchantMetrics(
  merchant: Merchant,
  dayCount: number,
): ComparedMerchantMetrics {
  const scale = dayCount / BASE_PERIOD_DAYS;

  return {
    ...merchant,
    periodGmv: Math.round(merchant.gmv30d * scale),
    periodTxCount: Math.round(merchant.txCount30d * scale),
    periodRevenue: Math.round(merchant.revenue30d * scale),
    periodSuccessRate: merchant.successRate7d,
  };
}

export function buildComparedMerchantMetrics(
  merchants: Merchant[],
  dayCount: number,
): ComparedMerchantMetrics[] {
  return merchants.map((merchant) =>
    toComparedMerchantMetrics(merchant, dayCount),
  );
}
