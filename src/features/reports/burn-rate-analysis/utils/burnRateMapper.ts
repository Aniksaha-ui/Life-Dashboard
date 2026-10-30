import type { BurnRateReport } from "../types";

const currency = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const count = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const amount = (value: unknown) => Number(value) || 0;
const money = (value: unknown) => `BDT ${currency.format(amount(value))}`;

export const emptyBurnRateReport: BurnRateReport = {
  monthsTrackedLabel: "0",
  totalExpenseLabel: "BDT 0.00",
  averageBurnRateLabel: "BDT 0.00",
  peakMonthLabel: "N/A",
  rows: [],
  chart: { labels: [], datasets: [] },
};

export const mapBurnRateReport = (payload: any): BurnRateReport => {
  const summary = payload?.summary ?? {};
  const table = Array.isArray(payload?.table) ? payload.table : [];
  const rows = table.map((item: any, index: number) => ({
    serial: index + 1,
    id: String(item.month ?? index),
    monthLabel: String(item.month_label ?? item.month ?? "N/A"),
    totalExpense: amount(item.total_expense),
    totalExpenseLabel: money(item.total_expense),
    activeDays: amount(item.active_days),
    averageBurnRate: amount(item.avg_daily_burn_rate),
    averageBurnRateLabel: money(item.avg_daily_burn_rate),
  }));
  const graph = payload?.graph ?? {};
  const datasets = Array.isArray(graph.datasets)
    ? graph.datasets.map((item: any, index: number) => ({
        label: String(item.label ?? "Metric"),
        data: Array.isArray(item.data) ? item.data.map(amount) : [],
        color: String(item.color ?? ["#e11d48", "#d97706"][index % 2]),
      }))
    : [];
  return {
    monthsTrackedLabel: count.format(amount(summary.months_tracked)),
    totalExpenseLabel: money(summary.total_expense),
    averageBurnRateLabel: money(summary.average_burn_rate),
    peakMonthLabel: String(summary.peak_month ?? "N/A"),
    rows,
    chart: {
      labels: Array.isArray(graph.labels)
        ? graph.labels.map(String)
        : rows.map((row) => row.monthLabel),
      datasets,
    },
  };
};
