import {
  BarChart3,
  CalendarDays,
  Flame,
  GitCompareArrows,
  PieChart,
  Tags,
  TrendingUp,
  Wallet,
} from "lucide-react";
import type { ReportDefinition, ReportId } from "../types";

export const reports: ReportDefinition[] = [
  {
    id: "financial-overview",
    title: "Financial Overview",
    description:
      "See opening and closing balances, income, expenses, and daily ledger movement in one place.",
    endpoint: "/reports/financial-overview",
    icon: BarChart3,
    supportsDateRange: true,
  },
  {
    id: "summary",
    title: "Summary Report",
    description:
      "Get a fast snapshot of balances, inflow, outflow, and overall movement for a selected time range.",
    endpoint: "/reports/summary",
    icon: BarChart3,
    supportsDateRange: true,
  },
  {
    id: "account-balances",
    title: "Account Balances",
    description:
      "Review current balances across cash, bank, card, and mobile banking accounts.",
    endpoint: "/reports/account-balances",
    icon: Wallet,
  },
  {
    id: "burn-rate-analysis",
    title: "Burn Rate Analysis",
    description:
      "Track each month’s total expense and average daily burn based on active expense days.",
    endpoint: "/reports/burn-rate-analysis",
    icon: Flame,
    supportsDateRange: true,
  },
  {
    id: "category-breakdown",
    title: "Category Breakdown",
    description:
      "Compare the categories driving the most expense volume and contribution.",
    endpoint: "/reports/category-breakdown",
    icon: PieChart,
    supportsDateRange: true,
  },
  {
    id: "category-usage-analysis",
    title: "Category Usage Analysis",
    description:
      "See category usage frequency and total amount accumulated for each category.",
    endpoint: "/reports/category-usage-analysis",
    icon: Tags,
    supportsDateRange: true,
  },
  {
    id: "current-vs-previous-month-analysis",
    title: "Current vs Previous Month Analysis",
    description:
      "Compare income, outflow, and net movement between the current and previous months.",
    endpoint: "/reports/current-vs-previous-month-analysis",
    icon: GitCompareArrows,
    supportsDateRange: true,
  },
  {
    id: "daywise-expenses",
    title: "Daywise Expenses",
    description:
      "Review each day and the categories that generated expense spend during the reporting window.",
    endpoint: "/reports/daywise-expenses",
    icon: CalendarDays,
    supportsDateRange: true,
  },
  {
    id: "weekly-current-month-analysis",
    title: "Weekly Current Month Analysis",
    description:
      "Break down the current month into weekly expense blocks to spot spending patterns.",
    endpoint: "/reports/weekly-current-month-analysis",
    icon: TrendingUp,
    supportsDateRange: true,
  },
];

export const getReportDefinition = (id: string | undefined) =>
  reports.find((report) => report.id === id) ?? null;

export const isReportId = (id: string | undefined): id is ReportId =>
  Boolean(getReportDefinition(id));
