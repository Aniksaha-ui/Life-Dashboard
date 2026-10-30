export interface BurnRateRow {
  serial: number;
  id: string;
  monthLabel: string;
  totalExpense: number;
  totalExpenseLabel: string;
  activeDays: number;
  averageBurnRate: number;
  averageBurnRateLabel: string;
}

export interface BurnRateReport {
  monthsTrackedLabel: string;
  totalExpenseLabel: string;
  averageBurnRateLabel: string;
  peakMonthLabel: string;
  rows: BurnRateRow[];
  chart: {
    labels: string[];
    datasets: Array<{ label: string; data: number[]; color: string }>;
  };
}
