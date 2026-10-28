export type DeviceInsightMetric = {
  label: string;
  value: string;
};

export type DeviceReportRow = {
  deviceName: string;
  totalPageViews: number;
  totalUsers: number;
  totalSessions: number;
  percentage: string;
  averageViewsPerUser: string;
};

export type TabSummaryMetric = {
  key: string;
  label: string;
  value: string;
  showInfo?: boolean;
  info?: string;
};

export type TabWiseReportRow = {
  tabName: string;
  totalUsers: number;
  totalEvents: number;
  totalTime: string;
  averageTimePerUser: string;
  averageTimePerEvent: string;
};

export type PaymentTypeSelectionRow = {
  paymentMethod: string;
  totalUsers: number;
  selections: number;
  date: string;
  activityDate: string;
};

export const PAYMENT_DEVICE_INSIGHTS: DeviceInsightMetric[] = [
  { label: "Mobile Traffic", value: "21.8%" },
  { label: "Desktop Traffic", value: "78.2%" },
  { label: "Tablet Traffic", value: "0%" },
];

export const PAYMENT_DEVICE_REPORT: DeviceReportRow[] = [
  {
    deviceName: "Desktop",
    totalPageViews: 7824,
    totalUsers: 412,
    totalSessions: 498,
    percentage: "78.2%",
    averageViewsPerUser: "18.99",
  },
  {
    deviceName: "Mobile",
    totalPageViews: 2176,
    totalUsers: 186,
    totalSessions: 224,
    percentage: "21.8%",
    averageViewsPerUser: "11.70",
  },
  {
    deviceName: "Tablet",
    totalPageViews: 0,
    totalUsers: 0,
    totalSessions: 0,
    percentage: "0%",
    averageViewsPerUser: "0.00",
  },
];

export const PAYMENT_TAB_SUMMARY: TabSummaryMetric[] = [
  { key: "mostUsed", label: "Most Used", value: "Card" },
  {
    key: "totalTimeSpent",
    label: "Total Time Spent",
    value: "68h 59m 37s",
    showInfo: true,
    info: "The cumulative sum of time that all users spent actively viewing and interacting with the specific payment tab (Card) during the specified date range.",
  },
  {
    key: "averageTimePerTab",
    label: "Average Time Per Tab",
    value: "22h 59m 52s",
    showInfo: true,
    info: "The average duration that user spends on the payment tab each time they open it. It is calculated by dividing the Total Time Spent by the Total Event Count (or the total number of times the tab was opened/viewed).",
  },
  {
    key: "longestTimeOnTab",
    label: "Longest Time On Tab",
    value: "Card",
    showInfo: true,
    info: "This metric identifies which of the three payment tabs which has the highest Average Time Per Tab.",
  },
  { key: "totalEventCount", label: "Total Event Count", value: "303" },
];

export const PAYMENT_TAB_WISE_REPORT: TabWiseReportRow[] = [
  {
    tabName: "Card",
    totalUsers: 186,
    totalEvents: 142,
    totalTime: "41h 12m 08s",
    averageTimePerUser: "13m 18s",
    averageTimePerEvent: "17m 26s",
  },
  {
    tabName: "Mobile",
    totalUsers: 124,
    totalEvents: 98,
    totalTime: "18h 44m 21s",
    averageTimePerUser: "9m 04s",
    averageTimePerEvent: "11m 28s",
  },
  {
    tabName: "Internet",
    totalUsers: 88,
    totalEvents: 63,
    totalTime: "9h 03m 08s",
    averageTimePerUser: "6m 10s",
    averageTimePerEvent: "8m 37s",
  },
];

export const PAYMENT_TYPE_SELECTION: PaymentTypeSelectionRow[] = [
  {
    paymentMethod: "Auto-Selected: Card",
    totalUsers: 3,
    selections: 48,
    date: "2025-11-18",
    activityDate: "2025-11-18",
  },
  {
    paymentMethod: "Auto-Selected: Card",
    totalUsers: 1,
    selections: 18,
    date: "2025-11-19",
    activityDate: "2025-11-19",
  },
  {
    paymentMethod: "Net Banking",
    totalUsers: 4,
    selections: 10,
    date: "2025-11-23",
    activityDate: "2025-11-23",
  },
  {
    paymentMethod: "Mobile Banking",
    totalUsers: 4,
    selections: 8,
    date: "2025-11-22",
    activityDate: "2025-11-22",
  },
  {
    paymentMethod: "Card",
    totalUsers: 3,
    selections: 7,
    date: "2025-11-19",
    activityDate: "2025-11-19",
  },
  {
    paymentMethod: "Card",
    totalUsers: 3,
    selections: 7,
    date: "2025-11-23",
    activityDate: "2025-11-23",
  },
  {
    paymentMethod: "Mobile Banking",
    totalUsers: 3,
    selections: 7,
    date: "2025-11-17",
    activityDate: "2025-11-17",
  },
  {
    paymentMethod: "Mobile Banking",
    totalUsers: 2,
    selections: 6,
    date: "2025-11-19",
    activityDate: "2025-11-19",
  },
  {
    paymentMethod: "Card",
    totalUsers: 3,
    selections: 5,
    date: "2025-11-17",
    activityDate: "2025-11-17",
  },
  {
    paymentMethod: "Net Banking",
    totalUsers: 2,
    selections: 5,
    date: "2025-11-17",
    activityDate: "2025-11-17",
  },
  {
    paymentMethod: "Net Banking",
    totalUsers: 4,
    selections: 5,
    date: "2025-11-22",
    activityDate: "2025-11-22",
  },
  {
    paymentMethod: "Mobile Banking",
    totalUsers: 2,
    selections: 4,
    date: "2025-11-23",
    activityDate: "2025-11-23",
  },
  {
    paymentMethod: "Net Banking",
    totalUsers: 2,
    selections: 4,
    date: "2025-11-19",
    activityDate: "2025-11-19",
  },
  {
    paymentMethod: "Card",
    totalUsers: 3,
    selections: 3,
    date: "2025-11-22",
    activityDate: "2025-11-22",
  },
  {
    paymentMethod: "More Options",
    totalUsers: 2,
    selections: 3,
    date: "2025-11-17",
    activityDate: "2025-11-17",
  },
  {
    paymentMethod: "Auto-Selected: Card",
    totalUsers: 1,
    selections: 2,
    date: "2025-11-24",
    activityDate: "2025-11-24",
  },
  {
    paymentMethod: "More Options",
    totalUsers: 1,
    selections: 2,
    date: "2025-11-22",
    activityDate: "2025-11-22",
  },
  {
    paymentMethod: "More Options",
    totalUsers: 2,
    selections: 2,
    date: "2025-11-23",
    activityDate: "2025-11-23",
  },
  {
    paymentMethod: "Mobile Banking",
    totalUsers: 1,
    selections: 1,
    date: "2025-11-18",
    activityDate: "2025-11-18",
  },
];

export function isPaymentAnalyticsDateInRange(
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

export function filterPaymentTypeSelectionRows(
  rows: PaymentTypeSelectionRow[],
  from?: string,
  to?: string,
): PaymentTypeSelectionRow[] {
  return rows.filter((row) =>
    isPaymentAnalyticsDateInRange(row.activityDate, from, to),
  );
}
