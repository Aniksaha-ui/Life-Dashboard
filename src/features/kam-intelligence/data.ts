// KAM Intelligence Dashboard — data layer
// Extracted from KAM Intelligence Dashboard_V3.html

export const months = ["Feb 2026", "Mar 2026", "Apr 2026", "May 2026"];

export const profiles = [
  "Champion Merchants",
  "Loyal Big Merchants",
  "Loyal Regular Merchants",
  "High Value Irregular Merchants",
  "Potential Up-sell",
  "Stable Merchants",
  "Monitor Closely",
  "High Risk Big Merchants",
  "Lost Merchants",
  "Inactive Merchants",
];

export interface ProfileData {
  count: number[];
  gmv: number[];
  cat: string;
}

export const profileData: Record<string, ProfileData> = {
  "Champion Merchants": {
    count: [139, 168, 177, 14],
    gmv: [10.5, 11.2, 13.0, 0.8],
    cat: "ELITE",
  },
  "Loyal Big Merchants": {
    count: [15, 18, 24, 7],
    gmv: [4.2, 4.4, 4.7, 0.3],
    cat: "LOYAL",
  },
  "Loyal Regular Merchants": {
    count: [42, 40, 40, 14],
    gmv: [1.4, 1.5, 1.3, 0.1],
    cat: "LOYAL",
  },
  "High Value Irregular Merchants": {
    count: [17, 17, 17, 4],
    gmv: [2.1, 2.0, 2.6, 0.2],
    cat: "HIGH VALUE",
  },
  "Potential Up-sell": {
    count: [38, 47, 34, 14],
    gmv: [1.9, 2.3, 2.2, 0.1],
    cat: "STABLE",
  },
  "Stable Merchants": {
    count: [365, 347, 363, 40],
    gmv: [8.1, 8.4, 8.2, 0.9],
    cat: "STABLE",
  },
  "Monitor Closely": {
    count: [57, 59, 61, 10],
    gmv: [1.5, 1.7, 1.8, 0.1],
    cat: "WATCH",
  },
  "High Risk Big Merchants": {
    count: [92, 93, 97, 27],
    gmv: [5.6, 5.9, 5.8, 0.4],
    cat: "DECLINING",
  },
  "Lost Merchants": {
    count: [372, 363, 346, 105],
    gmv: [0, 0, 0, 0],
    cat: "DECLINING",
  },
  "Inactive Merchants": {
    count: [138, 175, 156, 20],
    gmv: [1.2, 1.4, 1.3, 0.1],
    cat: "DECLINING",
  },
};

// --- Monthly Overview Data (for the overview cards) ---

export interface MonthlyOverview {
  month: string;
  totalMerchants: number;
  totalGmv: string;
  avgSR: string;
  health: {
    activeGrowing: number;
    watch: number;
    declining: number;
  };
  segments: { name: string; count: number }[];
}

export const monthlyOverviews: MonthlyOverview[] = [
  {
    month: "Feb 2026",
    totalMerchants: 1275,
    totalGmv: "৳9.51 Cr",
    avgSR: "37.2%",
    health: { activeGrowing: 48, watch: 4, declining: 48 },
    segments: [
      { name: "Champion Merchants", count: 139 },
      { name: "Loyal Big Merchants", count: 15 },
      { name: "Loyal Regular Merchants", count: 42 },
      { name: "High Value Irregular Merchants", count: 17 },
      { name: "Potential Up-sell", count: 38 },
      { name: "Stable Merchants", count: 365 },
      { name: "Monitor Closely", count: 57 },
      { name: "High Risk Big Merchants", count: 92 },
      { name: "Lost Merchants", count: 372 },
      { name: "Inactive Merchants", count: 138 },
    ],
  },
  {
    month: "Mar 2026",
    totalMerchants: 1327,
    totalGmv: "৳11.47 Cr",
    avgSR: "36.7%",
    health: { activeGrowing: 48, watch: 4, declining: 48 },
    segments: [
      { name: "Champion Merchants", count: 168 },
      { name: "Loyal Big Merchants", count: 18 },
      { name: "Loyal Regular Merchants", count: 40 },
      { name: "High Value Irregular Merchants", count: 17 },
      { name: "Potential Up-sell", count: 47 },
      { name: "Stable Merchants", count: 347 },
      { name: "Monitor Closely", count: 59 },
      { name: "High Risk Big Merchants", count: 93 },
      { name: "Lost Merchants", count: 363 },
      { name: "Inactive Merchants", count: 175 },
    ],
  },
  {
    month: "Apr 2026",
    totalMerchants: 1315,
    totalGmv: "৳13.59 Cr",
    avgSR: "35.2%",
    health: { activeGrowing: 50, watch: 5, declining: 45 },
    segments: [
      { name: "Champion Merchants", count: 177 },
      { name: "Loyal Big Merchants", count: 24 },
      { name: "Loyal Regular Merchants", count: 40 },
      { name: "High Value Irregular Merchants", count: 17 },
      { name: "Potential Up-sell", count: 34 },
      { name: "Stable Merchants", count: 363 },
      { name: "Monitor Closely", count: 61 },
      { name: "High Risk Big Merchants", count: 97 },
      { name: "Lost Merchants", count: 346 },
      { name: "Inactive Merchants", count: 156 },
    ],
  },
  {
    month: "May 2026",
    totalMerchants: 255,
    totalGmv: "৳80.25 L",
    avgSR: "35.3%",
    health: { activeGrowing: 36, watch: 4, declining: 60 },
    segments: [
      { name: "Champion Merchants", count: 14 },
      { name: "Loyal Big Merchants", count: 7 },
      { name: "Loyal Regular Merchants", count: 14 },
      { name: "High Value Irregular Merchants", count: 4 },
      { name: "Potential Up-sell", count: 14 },
      { name: "Stable Merchants", count: 40 },
      { name: "Monitor Closely", count: 10 },
      { name: "High Risk Big Merchants", count: 27 },
      { name: "Lost Merchants", count: 105 },
      { name: "Inactive Merchants", count: 20 },
    ],
  },
];

export interface Merchant {
  id: number;
  name: string;
  storeId: string;
  month: string;
  segment: string;
  trend: string;
  action: string;
  gmv: number;
  successRate: number;
  riskScore: number;
  errors: number;
  kam: string;
}

export const merchants: Merchant[] = [
  {
    id: 1,
    name: "Bumrah Tech Ltd.",
    storeId: "bumrahtech01",
    month: "Apr 2026",
    segment: "Champion Merchants",
    trend: "Accelerating Growth",
    action: "Growth",
    gmv: 22700000,
    successRate: 94,
    riskScore: 12,
    errors: 5,
    kam: "Sadman",
  },
  {
    id: 2,
    name: "Apple Gadgets BD",
    storeId: "applegadgets01",
    month: "Apr 2026",
    segment: "Champion Merchants",
    trend: "Stable Healthy",
    action: "Growth",
    gmv: 11780000,
    successRate: 92,
    riskScore: 18,
    errors: 9,
    kam: "Sadman",
  },
  {
    id: 3,
    name: "Mobile Buzz BD",
    storeId: "mobilebuzz01",
    month: "Apr 2026",
    segment: "High Value Irregular Merchants",
    trend: "Soft Growth",
    action: "Growth",
    gmv: 11060000,
    successRate: 88,
    riskScore: 24,
    errors: 14,
    kam: "Sadman",
  },
  {
    id: 4,
    name: "Computer Mania BD",
    storeId: "compumaniabd",
    month: "Apr 2026",
    segment: "Champion Merchants",
    trend: "Stable Healthy",
    action: "Follow Up",
    gmv: 1338395,
    successRate: 48,
    riskScore: 42,
    errors: 15,
    kam: "Main",
  },
  {
    id: 5,
    name: "Akashbari Holidays",
    storeId: "akashbarihols",
    month: "Apr 2026",
    segment: "High Risk Big Merchants",
    trend: "Rapid Fall",
    action: "Action Now",
    gmv: 846489,
    successRate: 36,
    riskScore: 87,
    errors: 83,
    kam: "Farhan",
  },
  {
    id: 6,
    name: "Road Power BD",
    storeId: "roadpowerbd01",
    month: "Apr 2026",
    segment: "High Risk Big Merchants",
    trend: "Rapid Fall",
    action: "Action Now",
    gmv: 170956,
    successRate: 27,
    riskScore: 89,
    errors: 72,
    kam: "Farhan",
  },
  {
    id: 7,
    name: "Phone Shop",
    storeId: "phoneshopbd01",
    month: "Apr 2026",
    segment: "Monitor Closely",
    trend: "Soft Decline",
    action: "Follow Up",
    gmv: 144195,
    successRate: 42,
    riskScore: 68,
    errors: 45,
    kam: "Rubel",
  },
  {
    id: 8,
    name: "Karim Motors QR",
    storeId: "karimmotors01",
    month: "Apr 2026",
    segment: "High Risk Big Merchants",
    trend: "Rapid Fall",
    action: "Action Now",
    gmv: 142057,
    successRate: 32,
    riskScore: 85,
    errors: 49,
    kam: "Rubel",
  },
  {
    id: 9,
    name: "Khan Gadgets",
    storeId: "khangadgets01",
    month: "Feb 2026",
    segment: "Champion Merchants",
    trend: "Soft Growth",
    action: "Growth",
    gmv: 418962,
    successRate: 72,
    riskScore: 21,
    errors: 21,
    kam: "Review",
  },
  {
    id: 10,
    name: "Abdul Momen Limited",
    storeId: "abdulmomen01",
    month: "Apr 2026",
    segment: "Stable Merchants",
    trend: "Reactivated",
    action: "Follow Up",
    gmv: 13355,
    successRate: 36,
    riskScore: 53,
    errors: 97,
    kam: "Winback",
  },
  {
    id: 11,
    name: "Sandbox Live Test",
    storeId: "sandboxlivet01",
    month: "Jan 2026",
    segment: "Lost Merchants",
    trend: "Zero Success",
    action: "Win-back",
    gmv: 0,
    successRate: 0,
    riskScore: 94,
    errors: 1,
    kam: "Win-back",
  },
  {
    id: 12,
    name: "Anzara Jewellers",
    storeId: "anzarajewellers",
    month: "Apr 2026",
    segment: "High Risk Big Merchants",
    trend: "Soft Decline",
    action: "Follow Up",
    gmv: 156564,
    successRate: 45,
    riskScore: 74,
    errors: 32,
    kam: "Rubel",
  },
];

export const trendData: Record<string, number[]> = {
  "Accelerating Growth": [145, 160, 170, 155],
  "Soft Growth": [150, 165, 158, 172],
  Recovering: [70, 85, 95, 88],
  Reactivated: [20, 18, 26, 31],
  "New Active": [95, 75, 63, 65],
  Returning: [70, 55, 35, 25],
  "Stable Healthy": [55, 45, 50, 52],
  "Stable Weak": [130, 150, 165, 155],
  "Irregular Pattern": [40, 45, 50, 43],
  "Soft Decline": [180, 178, 176, 180],
  "Losing Volume": [4, 5, 6, 6],
  "Rapid Fall": [280, 300, 287, 294],
  "Zero Success": [75, 68, 58, 49],
};

export const errorData = [
  ["Commerce Indicator Invalid", 837],
  ["Payer Auth Required", 523],
  ["222 Approved Failed", 326],
  ["Violation of Law", 323],
  ["Auth Failed", 235],
] as const;

// --- Helpers ---

export function fmt(v: number): string {
  if (v >= 10000000) return "৳" + (v / 10000000).toFixed(2) + " Cr";
  if (v >= 100000) return "৳" + (v / 100000).toFixed(2) + " L";
  return "৳" + v.toLocaleString("en-IN");
}

export function actionTagClass(action: string): string {
  if (action === "Action Now" || action === "Win-back")
    return "bg-red-50 text-red-600 border-red-100";
  if (action === "Follow Up")
    return "bg-amber-50 text-amber-600 border-amber-100";
  if (action === "Growth") return "bg-green-50 text-green-600 border-green-100";
  return "bg-blue-50 text-blue-600 border-blue-100";
}

export function suggest(m: Merchant): string {
  if (m.action === "Action Now")
    return "Immediate call, diagnose failures, assign dedicated recovery owner.";
  if (m.action === "Follow Up")
    return "Schedule follow-up, review error pattern and monitor next 7 days.";
  if (m.action === "Growth")
    return "Offer premium settlement, campaign support or analytics upsell.";
  if (m.action === "Win-back")
    return "Move to win-back or archive after churn reason confirmation.";
  return "Monitor only.";
}

export interface FilterState {
  period: string;
  sector: string;
  profile: string;
  risk: string;
  search: string;
  smart: string | null;
  lifecycle: string;
  trend: string;
}

export function filterMerchants(state: FilterState): Merchant[] {
  const q = state.search.toLowerCase();

  // Note: Mock data only has months. We map the new "period" logic to months if it matches.
  // In a real app, this would be a date range comparison.
  const monthMap: Record<string, string> = {
    "Jan 2026": "Jan 2026",
    "Feb 2026": "Feb 2026",
    "Mar 2026": "Mar 2026",
    "Apr 2026": "Apr 2026",
  };

  const getLifecycleStatus = (segment: string) => {
    const activeGrowing = [
      "Champion Merchants",
      "Loyal Big Merchants",
      "Loyal Regular Merchants",
      "High Value Irregular Merchants",
      "Potential Up-sell",
      "Stable Merchants",
    ];
    const declining = [
      "High Risk Big Merchants",
      "Lost Merchants",
      "Inactive Merchants",
    ];

    if (activeGrowing.includes(segment)) return "Active & Growing";
    if (declining.includes(segment)) return "Declining";
    return "Watch";
  };

  return merchants.filter(
    (m) =>
      (state.period === "all" ||
        (Array.isArray(state.period)
          ? state.period.includes(m.month)
          : m.month === state.period || monthMap[state.period] === m.month)) &&
      (state.sector === "All" || state.sector === "all" || true) && // Sector is stubbed for now as mock data doesn't have it
      (state.profile === "all" ||
        !state.profile ||
        m.segment === state.profile) &&
      (state.risk === "all" || !state.risk || m.action === state.risk) &&
      (state.lifecycle === "all" ||
        !state.lifecycle ||
        getLifecycleStatus(m.segment) === state.lifecycle) &&
      (state.trend === "all" || !state.trend || m.trend === state.trend) &&
      (!q || `${m.name} ${m.segment} ${m.kam}`.toLowerCase().includes(q)) &&
      (!state.smart ||
        (state.smart === "high-gmv-risk"
          ? m.gmv > 140000 && m.riskScore > 65
          : state.smart === "decline"
            ? m.trend.includes("Decline") || m.trend.includes("Fall")
            : m.action === "Growth")),
  );
}
