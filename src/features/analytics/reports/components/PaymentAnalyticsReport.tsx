import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { clsx } from "clsx";
import { Download, Info } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { ReportSection } from "../reportRegistry";
import type { ReportFilters } from "../reportApi";
import { MetricCard } from "../../../../components/MetricCard";
import {
  PAYMENT_DEVICE_INSIGHTS,
  PAYMENT_DEVICE_REPORT,
  PAYMENT_TAB_SUMMARY,
  PAYMENT_TAB_WISE_REPORT,
  PAYMENT_TYPE_SELECTION,
  filterPaymentTypeSelectionRows,
  type PaymentTypeSelectionRow,
} from "../data/paymentAnalyticsReportData";
import { PaymentTypeSelectionDrawer } from "./PaymentTypeSelectionDrawer";

interface PaymentAnalyticsReportProps {
  sections: ReportSection[];
  filters: ReportFilters;
}

export interface PaymentAnalyticsReportHandle {
  exportData: () => void;
}

const PAYMENT_TYPE_SELECTION_PREVIEW_LIMIT = 10;

const DEVICE_CHART_COLORS: Record<string, string> = {
  Desktop: "#295cab",
  Mobile: "#10b981",
  Tablet: "#f59e0b",
};

function formatPercentage(value: number, total: number) {
  if (total === 0) return "0%";
  return `${((value / total) * 100).toFixed(2)}%`;
}

function DeviceInsightsPieChart() {
  const chartData = PAYMENT_DEVICE_REPORT.map((row) => ({
    name: row.deviceName,
    value: parseFloat(row.percentage) || 0,
    color: DEVICE_CHART_COLORS[row.deviceName] ?? "#94a3b8",
  }));
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div
        className="relative w-[160px] h-[160px] shrink-0 [&_.recharts-wrapper]:outline-none [&_.recharts-wrapper]:focus-visible:outline-none [&_svg]:outline-none [&_svg]:focus-visible:outline-none"
        onMouseDown={(event) => event.preventDefault()}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={64}
              paddingAngle={2}
              stroke="none"
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [
                `${value.toFixed(2)}% (${formatPercentage(value, total)})`,
                name,
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-bold text-slate-900 tabular-nums">
            100%
          </span>
          <span className="text-[10px] text-slate-500 font-medium">Total</span>
        </div>
      </div>

      <div className="flex-1 w-full space-y-3">
        {chartData.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-slate-700 font-medium truncate">
                {item.name} Traffic
              </span>
            </div>
            <span className="font-semibold tabular-nums text-slate-900 whitespace-nowrap">
              {item.value.toFixed(1)}% ({formatPercentage(item.value, total)})
            </span>
          </div>
        ))}
        <p className="text-xs text-slate-500 text-right mt-6">
          Total score accumulates 100%
        </p>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  children,
  className,
  flush = false,
}: {
  title: string;
  children: ReactNode;
  className?: string;
  flush?: boolean;
}) {
  return (
    <div
      className={clsx(
        "bg-white border border-slate-200 rounded-xl shadow-sm",
        flush ? "overflow-hidden" : "overflow-visible",
        className,
      )}
    >
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      </div>
      <div
        className={clsx(
          flush ? undefined : "p-5",
          !flush && "overflow-visible",
        )}
      >
        {children}
      </div>
    </div>
  );
}

function OverviewMetricCard({
  title,
  value,
  info = "",
  showInfo = false,
  titleClassName,
  tooltipAlign = "right",
}: {
  title: string;
  value: string;
  info?: string;
  showInfo?: boolean;
  titleClassName?: string;
  tooltipAlign?: "left" | "right" | "center";
}) {
  if (!showInfo) {
    return (
      <MetricCard
        title={title}
        value={value}
        valueClassName="tabular-nums"
        titleClassName={titleClassName}
        className="min-w-0 h-full"
      />
    );
  }

  return (
    <div className="relative overflow-visible min-w-0 h-full bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-left">
      <div className="flex items-start gap-1.5">
        <p
          className={clsx(
            "text-xs font-semibold text-slate-500 uppercase flex-1 min-w-0",
            titleClassName,
          )}
        >
          {title}
        </p>
        <span className="group relative shrink-0 mt-0.5">
          <Info className="w-3.5 h-3.5 text-primary-500 cursor-help" />
          <span
            className={clsx(
              "invisible group-hover:visible absolute top-full mt-2 w-80 max-w-[min(20rem,calc(100vw-2rem))] bg-slate-900 text-white rounded-lg shadow-xl p-3 text-xs font-normal normal-case tracking-normal text-left leading-relaxed z-[100] pointer-events-none",
              tooltipAlign === "left" && "left-0",
              tooltipAlign === "right" && "right-0",
              tooltipAlign === "center" && "left-1/2 -translate-x-1/2",
            )}
          >
            {info}
          </span>
        </span>
      </div>
      <p className="text-2xl font-bold mt-2 text-slate-900 tabular-nums">
        {value}
      </p>
    </div>
  );
}

function downloadCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

function generateCsvContent(paymentTypeRows: typeof PAYMENT_TYPE_SELECTION) {
  const sections: string[] = [];

  sections.push("Device Insights");
  sections.push("Metric,Value");
  PAYMENT_DEVICE_INSIGHTS.forEach((row) => {
    sections.push(`"${row.label}",${row.value}`);
  });
  sections.push("");

  sections.push("Device Report");
  sections.push(
    "Device Name,Total PageViews,Total Users,Total Sessions,Percentage,Average Views Per User",
  );
  PAYMENT_DEVICE_REPORT.forEach((row) => {
    sections.push(
      `"${row.deviceName}",${row.totalPageViews},${row.totalUsers},${row.totalSessions},${row.percentage},${row.averageViewsPerUser}`,
    );
  });
  sections.push("");

  sections.push("Tab Summary");
  sections.push("Metric,Value");
  PAYMENT_TAB_SUMMARY.forEach((row) => {
    sections.push(`"${row.label}","${row.value}"`);
  });
  sections.push("");

  sections.push("Tab Wise Report");
  sections.push(
    "Tab Name,Total Users,Total Events,Total Time,Average Time Per User,Average Time Per Event",
  );
  PAYMENT_TAB_WISE_REPORT.forEach((row) => {
    sections.push(
      `"${row.tabName}",${row.totalUsers},${row.totalEvents},"${row.totalTime}","${row.averageTimePerUser}","${row.averageTimePerEvent}"`,
    );
  });
  sections.push("");

  sections.push("Payment Type Selection");
  sections.push("Payment Method,Total Users,Selections,Date");
  paymentTypeRows.forEach((row) => {
    sections.push(
      `"${row.paymentMethod}",${row.totalUsers},${row.selections},${row.date}`,
    );
  });

  return sections.join("\n");
}

function getPaymentTypeSelectionRowKey(row: PaymentTypeSelectionRow) {
  return `${row.paymentMethod}-${row.date}-${row.selections}`;
}

function PaymentTypeSelectionTable({
  rows,
}: {
  rows: PaymentTypeSelectionRow[];
}) {
  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
          <th className="px-5 py-3 text-left">Payment Method</th>
          <th className="px-5 py-3 text-right whitespace-nowrap w-28">
            Total Users
          </th>
          <th className="px-5 py-3 text-right w-28">Selections</th>
          <th className="px-5 py-3 text-right w-32">Date</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {rows.length === 0 ? (
          <tr>
            <td
              colSpan={4}
              className="px-5 py-8 text-center text-sm text-slate-500"
            >
              No payment type selection data found for the selected filters.
            </td>
          </tr>
        ) : (
          rows.map((row) => (
            <tr
              key={getPaymentTypeSelectionRowKey(row)}
              className="hover:bg-slate-50/50 transition-colors"
            >
              <td className="px-5 py-3 text-left text-slate-700 break-words">
                {row.paymentMethod}
              </td>
              <td className="px-5 py-3 text-right text-slate-700 tabular-nums">
                {row.totalUsers.toLocaleString()}
              </td>
              <td className="px-5 py-3 text-right text-slate-900 font-semibold tabular-nums">
                {row.selections.toLocaleString()}
              </td>
              <td className="px-5 py-3 text-right text-slate-700 tabular-nums whitespace-nowrap">
                {row.date}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

export const PaymentAnalyticsReport = forwardRef<
  PaymentAnalyticsReportHandle,
  PaymentAnalyticsReportProps
>(({ filters }, ref) => {
  const [paymentTypeDrawerOpen, setPaymentTypeDrawerOpen] = useState(false);
  const paymentTypeRows = useMemo(
    () =>
      filterPaymentTypeSelectionRows(
        PAYMENT_TYPE_SELECTION,
        filters.from,
        filters.to,
      ),
    [filters.from, filters.to],
  );
  const paymentTypePreview = paymentTypeRows.slice(
    0,
    PAYMENT_TYPE_SELECTION_PREVIEW_LIMIT,
  );

  const handleExportCSV = () => {
    downloadCsv(
      generateCsvContent(paymentTypeRows),
      `payment-analytics-report-${filters.from || "all"}-${filters.to || "time"}.csv`,
    );
  };

  useImperativeHandle(ref, () => ({
    exportData: handleExportCSV,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SectionCard title="Device Insights">
          <DeviceInsightsPieChart />
        </SectionCard>

        <SectionCard title="Device Report" flush>
          <table className="w-full text-sm border-collapse table-fixed">
            <colgroup>
              <col className="w-[18%]" />
              <col className="w-[16%]" />
              <col className="w-[14%]" />
              <col className="w-[16%]" />
              <col className="w-[14%]" />
              <col className="w-[22%]" />
            </colgroup>
            <thead>
              <tr className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                <th className="px-4 py-3 text-left break-words leading-tight">
                  Device Name
                </th>
                <th className="px-3 py-3 text-left break-words leading-tight">
                  Total PageViews
                </th>
                <th className="px-3 py-3 text-left break-words leading-tight">
                  Total Users
                </th>
                <th className="px-3 py-3 text-left break-words leading-tight">
                  Total Sessions
                </th>
                <th className="px-3 py-3 text-left break-words leading-tight">
                  Percentage
                </th>
                <th className="px-3 py-3 text-left break-words leading-tight">
                  Average Views Per User
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {PAYMENT_DEVICE_REPORT.map((row) => (
                <tr
                  key={row.deviceName}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-4 py-3 text-left text-slate-700">
                    {row.deviceName}
                  </td>
                  <td className="px-3 py-3 text-left text-slate-700 tabular-nums">
                    {row.totalPageViews.toLocaleString()}
                  </td>
                  <td className="px-3 py-3 text-left text-slate-700 tabular-nums">
                    {row.totalUsers.toLocaleString()}
                  </td>
                  <td className="px-3 py-3 text-left text-slate-700 tabular-nums">
                    {row.totalSessions.toLocaleString()}
                  </td>
                  <td className="px-3 py-3 text-left text-slate-700 tabular-nums">
                    {row.percentage}
                  </td>
                  <td className="px-3 py-3 text-left text-slate-700 tabular-nums">
                    {row.averageViewsPerUser}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SectionCard title="Tab Summary">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PAYMENT_TAB_SUMMARY.map((metric, index) => (
              <OverviewMetricCard
                key={metric.key}
                title={metric.label}
                value={metric.value}
                showInfo={metric.showInfo}
                info={metric.info}
                tooltipAlign={index % 2 === 0 ? "left" : "right"}
                titleClassName="normal-case tracking-normal"
              />
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Tab Wise Report" flush>
          <table className="w-full text-sm border-collapse table-fixed">
            <colgroup>
              <col className="w-[14%]" />
              <col className="w-[14%]" />
              <col className="w-[14%]" />
              <col className="w-[18%]" />
              <col className="w-[20%]" />
              <col className="w-[20%]" />
            </colgroup>
            <thead>
              <tr className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                <th className="px-4 py-3 text-left break-words leading-tight">
                  Tab Name
                </th>
                <th className="px-3 py-3 text-left break-words leading-tight">
                  Total Users
                </th>
                <th className="px-3 py-3 text-left break-words leading-tight">
                  Total Events
                </th>
                <th className="px-3 py-3 text-left break-words leading-tight">
                  Total Time
                </th>
                <th className="px-3 py-3 text-left break-words leading-tight">
                  Average Time Per User
                </th>
                <th className="px-3 py-3 text-left break-words leading-tight">
                  Average Time Per Event
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {PAYMENT_TAB_WISE_REPORT.map((row) => (
                <tr
                  key={row.tabName}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-4 py-3 text-left text-slate-700">
                    {row.tabName}
                  </td>
                  <td className="px-3 py-3 text-left text-slate-700 tabular-nums">
                    {row.totalUsers.toLocaleString()}
                  </td>
                  <td className="px-3 py-3 text-left text-slate-700 tabular-nums">
                    {row.totalEvents.toLocaleString()}
                  </td>
                  <td className="px-3 py-3 text-left text-slate-700 whitespace-nowrap">
                    {row.totalTime}
                  </td>
                  <td className="px-3 py-3 text-left text-slate-700 whitespace-nowrap">
                    {row.averageTimePerUser}
                  </td>
                  <td className="px-3 py-3 text-left text-slate-700 whitespace-nowrap">
                    {row.averageTimePerEvent}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Payment Type Selection
          </h3>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-500" />
              Export
            </button>
            <button
              type="button"
              onClick={() => setPaymentTypeDrawerOpen(true)}
              className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors shrink-0"
            >
              View all
            </button>
          </div>
        </div>
        <PaymentTypeSelectionTable rows={paymentTypePreview} />
      </div>

      <PaymentTypeSelectionDrawer
        open={paymentTypeDrawerOpen}
        onClose={() => setPaymentTypeDrawerOpen(false)}
        rows={paymentTypeRows}
      />
    </div>
  );
});

PaymentAnalyticsReport.displayName = "PaymentAnalyticsReport";
