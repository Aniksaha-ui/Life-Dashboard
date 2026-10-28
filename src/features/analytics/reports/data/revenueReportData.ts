export type RevenueMerchantRow = {
  merchantId: string;
  merchantName: string;
  kamName: string;
  sector: string;
  tdrBdt: number;
  tdrPct: number;
  bankChargesBdt: number;
  bankChargesPct: number;
  profitBdt: number;
  profitPct: number;
  activityDate: string;
};

export type RevenueKamRow = {
  kamName: string;
  tdrBdt: number;
  tdrPct: number;
  bankChargesBdt: number;
  bankChargesPct: number;
  profitBdt: number;
  profitPct: number;
};

export const REVENUE_MERCHANT_ROWS: RevenueMerchantRow[] = [
  {
    merchantId: "demotest",
    merchantName: "Sandbox Live Test",
    kamName: "susanta.kam",
    sector: "FINTECH",
    tdrBdt: 20.24,
    tdrPct: 2.09,
    bankChargesBdt: 16.17,
    bankChargesPct: 1.67,
    profitBdt: 4.08,
    profitPct: 0.42,
    activityDate: "2025-10-15",
  },
  {
    merchantId: "masudstore020live",
    merchantName: "Masud Store 02",
    kamName: "susanta.kam",
    sector: "RETAIL",
    tdrBdt: 4.58,
    tdrPct: 1.5,
    bankChargesBdt: 4.12,
    bankChargesPct: 1.35,
    profitBdt: 0.46,
    profitPct: 0.15,
    activityDate: "2025-10-12",
  },
  {
    merchantId: "ekusheyeshop",
    merchantName: "Ekushey E Shop",
    kamName: "rahul.kam",
    sector: "ECOMMERCE",
    tdrBdt: 12.85,
    tdrPct: 1.92,
    bankChargesBdt: 9.44,
    bankChargesPct: 1.41,
    profitBdt: 3.41,
    profitPct: 0.51,
    activityDate: "2025-09-28",
  },
  {
    merchantId: "pizzahutdhaka",
    merchantName: "Pizzahut Dhaka Ltd",
    kamName: "rahul.kam",
    sector: "FOOD",
    tdrBdt: 18.32,
    tdrPct: 2.15,
    bankChargesBdt: 14.06,
    bankChargesPct: 1.65,
    profitBdt: 4.26,
    profitPct: 0.5,
    activityDate: "2025-09-20",
  },
  {
    merchantId: "radiantlabs",
    merchantName: "Radiant Laboratories LTD",
    kamName: "anika.kam",
    sector: "HEALTHCARE",
    tdrBdt: 9.76,
    tdrPct: 1.68,
    bankChargesBdt: 7.21,
    bankChargesPct: 1.24,
    profitBdt: 2.55,
    profitPct: 0.44,
    activityDate: "2025-10-05",
  },
  {
    merchantId: "infinitymall",
    merchantName: "Infinity Mega Mall International",
    kamName: "anika.kam",
    sector: "RETAIL",
    tdrBdt: 15.4,
    tdrPct: 1.98,
    bankChargesBdt: 11.85,
    bankChargesPct: 1.52,
    profitBdt: 3.55,
    profitPct: 0.46,
    activityDate: "2025-08-18",
  },
];

export function isRevenueDateInRange(
  activityDate: string,
  from?: string,
  to?: string,
): boolean {
  if (!from || !to) return true;
  const value = new Date(activityDate).getTime();
  const fromValue = new Date(from).getTime();
  const toValue = new Date(to).getTime();
  return value >= fromValue && value <= toValue;
}

export const REVENUE_KAM_OPTIONS = [
  { value: "all", label: "All KAMs" },
  ...Array.from(new Set(REVENUE_MERCHANT_ROWS.map((row) => row.kamName)))
    .sort()
    .map((kamName) => ({ value: kamName, label: kamName })),
];

export function filterRevenueMerchantRows(
  rows: RevenueMerchantRow[],
  from?: string,
  to?: string,
  kam?: string,
): RevenueMerchantRow[] {
  return rows.filter((row) => {
    if (kam && kam !== "all" && row.kamName !== kam) {
      return false;
    }
    return isRevenueDateInRange(row.activityDate, from, to);
  });
}

export function aggregateRevenueByKam(
  rows: RevenueMerchantRow[],
): RevenueKamRow[] {
  const groups: Record<string, RevenueKamRow & { count: number }> = {};

  rows.forEach((row) => {
    if (!groups[row.kamName]) {
      groups[row.kamName] = {
        kamName: row.kamName,
        tdrBdt: 0,
        tdrPct: 0,
        bankChargesBdt: 0,
        bankChargesPct: 0,
        profitBdt: 0,
        profitPct: 0,
        count: 0,
      };
    }

    const group = groups[row.kamName];
    group.tdrBdt += row.tdrBdt;
    group.tdrPct += row.tdrPct;
    group.bankChargesBdt += row.bankChargesBdt;
    group.bankChargesPct += row.bankChargesPct;
    group.profitBdt += row.profitBdt;
    group.profitPct += row.profitPct;
    group.count += 1;
  });

  return Object.values(groups).map((group) => ({
    kamName: group.kamName,
    tdrBdt: group.tdrBdt / group.count,
    tdrPct: group.tdrPct / group.count,
    bankChargesBdt: group.bankChargesBdt / group.count,
    bankChargesPct: group.bankChargesPct / group.count,
    profitBdt: group.profitBdt / group.count,
    profitPct: group.profitPct / group.count,
  }));
}

export function formatRevenueMetric(value: number): string {
  return value.toFixed(2);
}
