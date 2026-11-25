export interface MonthlyWeekCell {
  week_sequence: number;
  week_label: string;
  week_start: string;
  week_end: string;
  range_label: string;
  expense_total: string;
  recurring_total: string;
  total_expense: string;
  transaction_count: number;
}

export interface MonthlyWeekRow {
  month_key: string;
  month_label: string;
  month_full_label: string;
  year: number;
  month: number;
  total_expense: string;
  transaction_count: number;
  peak_week_sequence: number | null;
  weeks: MonthlyWeekCell[];
}

export interface WeekColumn {
  sequence: number;
  label: string;
}

export interface WeekColumnSummary {
  week_sequence: number;
  week_label: string;
  total_expense: string;
  average_expense: string;
  active_months: number;
  highest_month: string | null;
  highest_amount: string;
}

export interface MonthlyWeekComparisonReport {
  period: {
    months_count: number;
    from_date: string;
    to_date: string;
  };
  week_columns: WeekColumn[];
  months: MonthlyWeekRow[];
  week_summaries: WeekColumnSummary[];
  summary: {
    months_count: number;
    active_months: number;
    total_expense: string;
    average_monthly_expense: string;
    highest_month_label: string | null;
    highest_month_expense: string;
    peak_week_label: string | null;
    peak_week_expense: string;
  };
}
