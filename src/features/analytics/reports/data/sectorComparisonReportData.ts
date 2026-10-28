import type { ReportFilters } from "../reportApi";
import { getComparisonDayCount } from "./merchantComparisonReportData";
import { SECTOR_COMPARISON_MOCK_SECTORS } from "./sectorComparisonMockData";

const BASE_PERIOD_DAYS = 30;

export type SectorComparisonProfile = {
  id: string;
  sectorName: string;
  sectorCode: string;
  merchantCount: number;
  storeCount: number;
  activePct: number;
  inactivePct: number;
  otherPct: number;
  periodAmount: number;
  periodTxCount: number;
  periodRevenue: number;
  amountGrowthTrend: number;
  revenueGrowthTrend: number;
};

function normalizeSectorKey(name: string) {
  return name.trim().toLowerCase();
}

function toSectorCode(name: string) {
  return normalizeSectorKey(name)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function scale30dMetric(value: number, dayCount: number) {
  return Math.round(value * (dayCount / BASE_PERIOD_DAYS));
}

export function buildAllSectorProfiles(
  filters: ReportFilters,
): SectorComparisonProfile[] {
  const dayCount = getComparisonDayCount(filters);

  return SECTOR_COMPARISON_MOCK_SECTORS.map((seed) => ({
    id: normalizeSectorKey(seed.sectorName),
    sectorName: seed.sectorName,
    sectorCode: toSectorCode(seed.sectorName),
    merchantCount: seed.merchantCount,
    storeCount: seed.storeCount,
    activePct: seed.activePct,
    inactivePct: seed.inactivePct,
    otherPct: seed.otherPct,
    periodAmount: scale30dMetric(seed.periodAmount30d, dayCount),
    periodTxCount: scale30dMetric(seed.periodTxCount30d, dayCount),
    periodRevenue: scale30dMetric(seed.periodRevenue30d, dayCount),
    amountGrowthTrend: seed.amountGrowthTrend,
    revenueGrowthTrend: seed.revenueGrowthTrend,
  })).sort((a, b) => a.sectorName.localeCompare(b.sectorName));
}

export function buildComparedSectorProfiles(
  sectorIds: string[],
  filters: ReportFilters,
): SectorComparisonProfile[] {
  const profilesById = new Map(
    buildAllSectorProfiles(filters).map((profile) => [profile.id, profile]),
  );

  return sectorIds
    .map((id) => profilesById.get(id))
    .filter((profile): profile is SectorComparisonProfile => !!profile);
}
