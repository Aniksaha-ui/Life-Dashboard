import type {
  MonthlyWeekCell,
  MonthlyWeekComparisonReport,
  MonthlyWeekRow,
  WeekColumn,
  WeekColumnSummary,
} from "../types";

type LedgerRow = Record<string, unknown>;

const formatIsoDate = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const formatShortRange = (start: Date, end: Date): string => {
  const fmt = (value: Date) =>
    value.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  return `${fmt(start)} - ${fmt(end)}`;
};

const toFixedMoney = (value: number): string => value.toFixed(2);

/**
 * Fallback builder used only when an older backend deployment does not yet
 * expose `/financial-intelligence/monthly-week-comparison`.
 */
export function buildMonthlyWeekComparisonFromLedger(
  transactions: LedgerRow[],
  monthsCount: number,
  toDate?: string,
): MonthlyWeekComparisonReport {
  const reference = toDate ? new Date(`${toDate}T00:00:00`) : new Date();
  const safeRef = Number.isNaN(reference.getTime()) ? new Date() : reference;
  const endMonth = new Date(safeRef.getFullYear(), safeRef.getMonth() + 1, 0);
  const startMonth = new Date(
    safeRef.getFullYear(),
    safeRef.getMonth() - (monthsCount - 1),
    1,
  );

  const daily = new Map<
    string,
    { regular: number; recurring: number; total: number; count: number }
  >();

  for (const item of transactions) {
    const type = String(item.type ?? "").toUpperCase();
    if (type !== "EXPENSE" && type !== "RECURRING") continue;

    const day = String(item.transaction_date ?? "").slice(0, 10);
    if (!day) continue;

    const amount = Number(item.amount) || 0;
    const bucket = daily.get(day) ?? {
      regular: 0,
      recurring: 0,
      total: 0,
      count: 0,
    };

    if (type === "RECURRING") bucket.recurring += amount;
    else bucket.regular += amount;
    bucket.total += amount;
    bucket.count += 1;
    daily.set(day, bucket);
  }

  const months: MonthlyWeekRow[] = [];
  let maxWeeks = 0;
  let grandTotal = 0;
  let activeMonths = 0;
  let highestMonthLabel: string | null = null;
  let highestMonthAmount = 0;

  for (let offset = 0; offset < monthsCount; offset++) {
    const mStart = new Date(
      startMonth.getFullYear(),
      startMonth.getMonth() + offset,
      1,
    );
    const mEnd = new Date(mStart.getFullYear(), mStart.getMonth() + 1, 0);

    // Start cursor on Monday of the week containing the 1st of the month.
    const dayOfWeek = (mStart.getDay() + 6) % 7; // Mon=0 .. Sun=6
    const cursor = new Date(mStart);
    cursor.setDate(mStart.getDate() - dayOfWeek);

    const weeks: MonthlyWeekCell[] = [];
    let sequence = 1;
    let monthTotal = 0;
    let monthCount = 0;
    let peakWeekSeq: number | null = null;
    let peakWeekAmount = 0;

    while (cursor <= mEnd) {
      const calEnd = new Date(cursor);
      calEnd.setDate(cursor.getDate() + 6);
      const wStart = cursor > mStart ? new Date(cursor) : new Date(mStart);
      const wEnd = calEnd < mEnd ? calEnd : new Date(mEnd);
      const wStartStr = formatIsoDate(wStart);
      const wEndStr = formatIsoDate(wEnd);

      let regular = 0;
      let recurring = 0;
      let total = 0;
      let count = 0;

      for (const [day, bucket] of daily.entries()) {
        if (day >= wStartStr && day <= wEndStr) {
          regular += bucket.regular;
          recurring += bucket.recurring;
          total += bucket.total;
          count += bucket.count;
        }
      }

      if (total > peakWeekAmount) {
        peakWeekAmount = total;
        peakWeekSeq = sequence;
      }

      monthTotal += total;
      monthCount += count;

      weeks.push({
        week_sequence: sequence,
        week_label: `Week ${sequence}`,
        week_start: wStartStr,
        week_end: wEndStr,
        range_label: formatShortRange(wStart, wEnd),
        expense_total: toFixedMoney(regular),
        recurring_total: toFixedMoney(recurring),
        total_expense: toFixedMoney(total),
        transaction_count: count,
      });

      cursor.setDate(cursor.getDate() + 7);
      sequence++;
    }

    maxWeeks = Math.max(maxWeeks, weeks.length);
    grandTotal += monthTotal;
    if (monthCount > 0) activeMonths++;

    const shortLabel = mStart.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
    const fullLabel = mStart.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    if (monthTotal > highestMonthAmount) {
      highestMonthAmount = monthTotal;
      highestMonthLabel = shortLabel;
    }

    months.push({
      month_key: `${mStart.getFullYear()}-${String(mStart.getMonth() + 1).padStart(2, "0")}`,
      month_label: shortLabel,
      month_full_label: fullLabel,
      year: mStart.getFullYear(),
      month: mStart.getMonth() + 1,
      total_expense: toFixedMoney(monthTotal),
      transaction_count: monthCount,
      peak_week_sequence: peakWeekSeq,
      weeks,
    });
  }

  const weekColumns: WeekColumn[] = [];
  const weekSummaries: WeekColumnSummary[] = [];
  let peakWeekOverallLabel: string | null = null;
  let peakWeekOverallTotal = 0;

  for (let seq = 1; seq <= maxWeeks; seq++) {
    const label = `Week ${seq}`;
    weekColumns.push({ sequence: seq, label });

    let colTotal = 0;
    let colMonths = 0;
    let colActive = 0;
    let colHighestMonth: string | null = null;
    let colHighestAmount = 0;

    for (const row of months) {
      const cell = row.weeks[seq - 1];
      if (!cell) continue;
      colMonths++;
      const cellVal = Number(cell.total_expense) || 0;
      colTotal += cellVal;
      if (cell.transaction_count > 0) colActive++;
      if (cellVal > colHighestAmount) {
        colHighestAmount = cellVal;
        colHighestMonth = row.month_label;
      }
    }

    if (colTotal > peakWeekOverallTotal) {
      peakWeekOverallTotal = colTotal;
      peakWeekOverallLabel = label;
    }

    weekSummaries.push({
      week_sequence: seq,
      week_label: label,
      total_expense: toFixedMoney(colTotal),
      average_expense: toFixedMoney(colMonths > 0 ? colTotal / colMonths : 0),
      active_months: colActive,
      highest_month: colHighestMonth,
      highest_amount: toFixedMoney(colHighestAmount),
    });
  }

  return {
    period: {
      months_count: monthsCount,
      from_date: formatIsoDate(startMonth),
      to_date: formatIsoDate(endMonth),
    },
    week_columns: weekColumns,
    months,
    week_summaries: weekSummaries,
    summary: {
      months_count: monthsCount,
      active_months: activeMonths,
      total_expense: toFixedMoney(grandTotal),
      average_monthly_expense: toFixedMoney(
        monthsCount > 0 ? grandTotal / monthsCount : 0,
      ),
      highest_month_label: highestMonthLabel,
      highest_month_expense: toFixedMoney(highestMonthAmount),
      peak_week_label: peakWeekOverallLabel,
      peak_week_expense: toFixedMoney(peakWeekOverallTotal),
    },
  };
}
