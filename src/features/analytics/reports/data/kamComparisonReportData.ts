import { getReportConfig } from "../reportRegistry";
import type { ReportFilters } from "../reportApi";
import {
  REVENUE_MERCHANT_ROWS,
  aggregateRevenueByKam,
  filterRevenueMerchantRows,
} from "./revenueReportData";

type MonthColumn = { key: string; label: string };

type KamMetricRow = {
  kamName: string;
  monthly: Record<string, number>;
  total: number;
};

export type KamComparisonProfile = {
  id: string;
  kamName: string;
  kamLoginId: string;
  merchantCount: number;
  storeCount: number;
  assignedSector: string;
  reportingManager: string;
  periodAmount: number;
  periodTxCount: number;
  periodRevenue: number;
  avgProfitBdt: number;
  avgProfitPct: number;
  avgTdrPct: number;
  amountGrowthTrend: number;
  revenueGrowthTrend: number;
};

function parseMonthKey(key: string) {
  const [year, month] = key.split("-").map(Number);
  return (year || 0) * 100 + (month || 0);
}

function isMonthKeyInRange(monthKey: string, from: string, to: string) {
  if (!from || !to) return true;
  const value = parseMonthKey(monthKey);
  const fromDate = new Date(from);
  const toDate = new Date(to);
  const fromValue = fromDate.getFullYear() * 100 + (fromDate.getMonth() + 1);
  const toValue = toDate.getFullYear() * 100 + (toDate.getMonth() + 1);
  return value >= fromValue && value <= toValue;
}

function getEffectiveDateRange(filters: ReportFilters) {
  const to = filters.to || new Date().toISOString().split("T")[0];
  const from =
    filters.from ||
    (() => {
      const date = new Date();
      date.setDate(date.getDate() - 30);
      return date.toISOString().split("T")[0];
    })();

  return { from, to };
}

function sumVisibleMonths(row: KamMetricRow, monthKeys: string[]) {
  return monthKeys.reduce((sum, key) => sum + (row.monthly[key] || 0), 0);
}

function computeGrowthTrend(
  monthly: Record<string, number>,
  monthKeys: string[],
) {
  if (monthKeys.length < 2) return 0;

  const half = Math.max(1, Math.floor(monthKeys.length / 2));
  const recent = monthKeys.slice(-half);
  const prior = monthKeys.slice(0, half);
  const recentSum = recent.reduce((sum, key) => sum + (monthly[key] || 0), 0);
  const priorSum = prior.reduce((sum, key) => sum + (monthly[key] || 0), 0);

  if (priorSum === 0) {
    return recentSum > 0 ? 100 : 0;
  }

  return Math.round(((recentSum - priorSum) / priorSum) * 100);
}

function getAssignedSector(kamName: string) {
  return KAM_ASSIGNED_SECTORS[kamName] ?? "N/A";
}

function getReportingManager(kamName: string) {
  return KAM_REPORTING_MANAGERS[kamName] ?? "N/A";
}

const KAM_ASSIGNED_SECTORS: Record<string, string> = {
  "Anik Kam": "School",
  Nahid: "Retail Outlet Services",
  QA: "ITES",
  saifur: "Business Services",
  Shahriar: "Charity/NGO/Volunteer Services",
  "susanta.kam": "Agriculture Services",
  "susanta.tech": "ITES",
  Tahsin: "Tour Operator & Travel Agencies",
  "rahul.kam": "Marketplace",
  "Shubhojit Ghosh": "Charity/NGO/Volunteer Services",
  "Priya Rani Dey": "University",
  "Md. Faisal": "Business Services",
};

const KAM_REPORTING_MANAGERS: Record<string, string> = {
  "Anik Kam": "Rahim Khan",
  Nahid: "Sarah Ahmed",
  QA: "Karim Ahmed",
  saifur: "Tanvir Rahman",
  Shahriar: "Anika Tabassum",
  "susanta.kam": "Rahim Khan",
  "susanta.tech": "Sarah Ahmed",
  Tahsin: "Karim Ahmed",
  "rahul.kam": "Tanvir Rahman",
  "Shubhojit Ghosh": "Anika Tabassum",
  "Priya Rani Dey": "Rahim Khan",
  "Md. Faisal": "Sarah Ahmed",
};

function deriveStoreCount(merchantCount: number, kamName: string) {
  if (merchantCount === 0) return 0;

  const seed = kamName
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const storesPerMerchant = 1.25 + (seed % 9) * 0.1;

  return Math.max(merchantCount, Math.round(merchantCount * storesPerMerchant));
}

export function buildAllKamProfiles(
  filters: ReportFilters,
): KamComparisonProfile[] {
  const { from, to } = getEffectiveDateRange(filters);
  const config = getReportConfig("kam-transaction-report");
  const customData = config?.sections[0]?.customData;
  const monthColumns: MonthColumn[] = customData?.monthColumns || [];
  const visibleMonthKeys = monthColumns
    .filter((column) => isMonthKeyInRange(column.key, from, to))
    .map((column) => column.key);

  const amountRows: KamMetricRow[] = customData?.amount?.rows || [];
  const transactionRows: KamMetricRow[] = customData?.transaction?.rows || [];
  const sslRevenueRows: KamMetricRow[] = customData?.revenue?.rows || [];

  const kamNames = new Set<string>([
    ...amountRows.map((row) => row.kamName),
    ...transactionRows.map((row) => row.kamName),
    ...sslRevenueRows.map((row) => row.kamName),
  ]);

  const filteredRevenueMerchants = filterRevenueMerchantRows(
    REVENUE_MERCHANT_ROWS,
    from,
    to,
  );
  const revenueByKam = new Map(
    aggregateRevenueByKam(filteredRevenueMerchants).map((row) => [
      row.kamName,
      row,
    ]),
  );

  const amountByKam = new Map(amountRows.map((row) => [row.kamName, row]));
  const transactionByKam = new Map(
    transactionRows.map((row) => [row.kamName, row]),
  );
  const sslRevenueByKam = new Map(
    sslRevenueRows.map((row) => [row.kamName, row]),
  );

  return Array.from(kamNames)
    .map((kamName) => {
      const amountRow = amountByKam.get(kamName);
      const transactionRow = transactionByKam.get(kamName);
      const sslRevenueRow = sslRevenueByKam.get(kamName);
      const revenueAgg = revenueByKam.get(kamName);
      const kamMerchants = filteredRevenueMerchants.filter(
        (row) => row.kamName === kamName,
      );
      const merchantCount = new Set(kamMerchants.map((row) => row.merchantId))
        .size;

      return {
        id: kamName,
        kamName,
        kamLoginId: kamName,
        merchantCount,
        storeCount: deriveStoreCount(merchantCount, kamName),
        assignedSector: getAssignedSector(kamName),
        reportingManager: getReportingManager(kamName),
        periodAmount: amountRow
          ? sumVisibleMonths(amountRow, visibleMonthKeys)
          : 0,
        periodTxCount: transactionRow
          ? sumVisibleMonths(transactionRow, visibleMonthKeys)
          : 0,
        periodRevenue: sslRevenueRow
          ? sumVisibleMonths(sslRevenueRow, visibleMonthKeys)
          : 0,
        avgProfitBdt: revenueAgg?.profitBdt ?? 0,
        avgProfitPct: revenueAgg?.profitPct ?? 0,
        avgTdrPct: revenueAgg?.tdrPct ?? 0,
        amountGrowthTrend: amountRow
          ? computeGrowthTrend(amountRow.monthly, visibleMonthKeys)
          : 0,
        revenueGrowthTrend: sslRevenueRow
          ? computeGrowthTrend(sslRevenueRow.monthly, visibleMonthKeys)
          : 0,
      };
    })
    .sort((a, b) => a.kamName.localeCompare(b.kamName));
}

export function buildComparedKamProfiles(
  kamIds: string[],
  filters: ReportFilters,
): KamComparisonProfile[] {
  const profilesById = new Map(
    buildAllKamProfiles(filters).map((profile) => [profile.id, profile]),
  );

  return kamIds
    .map((id) => profilesById.get(id))
    .filter((profile): profile is KamComparisonProfile => !!profile);
}
