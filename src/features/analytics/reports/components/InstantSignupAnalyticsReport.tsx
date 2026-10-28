import {
  forwardRef,
  useImperativeHandle,
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
  INSTANT_SIGNUP_PAGE_VIEWS,
  INSTANT_SIGNUP_COUNTRY_USERS,
  INSTANT_SIGNUP_ENGAGEMENT_METRICS,
  INSTANT_SIGNUP_PAGE_ENGAGEMENT,
  INSTANT_SIGNUP_CONVERSION_METRICS,
  INSTANT_SIGNUP_DROPOFF_RATES,
  INSTANT_SIGNUP_MEDIUM_TRAFFIC,
  INSTANT_SIGNUP_USER_TYPES,
  INSTANT_SIGNUP_DEVICE_USAGE,
  type CountryUserRow,
} from "../data/instantSignupAnalyticsData";
import { CountryWiseUsersDrawer } from "./CountryWiseUsersDrawer";

interface InstantSignupAnalyticsReportProps {
  sections: ReportSection[];
  filters: ReportFilters;
}

export interface InstantSignupAnalyticsReportHandle {
  exportData: () => void;
}

const GOOGLE_SOURCE_LABEL = "(Source - Google)";
const COUNTRY_USERS_PREVIEW_LIMIT = 10;

const DEVICE_CHART_COLORS: Record<string, string> = {
  Desktop: "#295cab",
  Mobile: "#10b981",
  Tablet: "#f59e0b",
};

function formatPercentage(value: number, total: number) {
  if (total === 0) return "0%";
  return `${((value / total) * 100).toFixed(2)}%`;
}

function DeviceUsagePieChart() {
  const chartData = INSTANT_SIGNUP_DEVICE_USAGE.map((row) => ({
    name: row.device,
    value: row.activeUserCount,
    color: DEVICE_CHART_COLORS[row.device] ?? "#94a3b8",
  }));
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div
        className="relative w-[220px] h-[220px] shrink-0 [&_.recharts-wrapper]:outline-none [&_.recharts-wrapper]:focus-visible:outline-none [&_svg]:outline-none [&_svg]:focus-visible:outline-none"
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
              innerRadius={62}
              outerRadius={88}
              paddingAngle={2}
              stroke="none"
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [
                `${value} (${formatPercentage(value, total)})`,
                name,
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-slate-900 tabular-nums">
            {total}
          </span>
          <span className="text-xs text-slate-500 font-medium">Total</span>
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
                {item.name}
              </span>
            </div>
            <span className="font-semibold tabular-nums text-slate-900 whitespace-nowrap">
              {item.value} ({formatPercentage(item.value, total)})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionCard({
  title,
  source,
  children,
  className,
  flush = false,
}: {
  title: string;
  source?: string;
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
        {source ? (
          <p className="text-xs text-slate-500 mt-0.5">{source}</p>
        ) : null}
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

function TwoColumnTable({
  leftHeader,
  rightHeader,
  rows,
  rightColumnClassName = "w-28",
  flush = false,
}: {
  leftHeader: string;
  rightHeader: string;
  rows: { left: string; right: string | number }[];
  rightColumnClassName?: string;
  flush?: boolean;
}) {
  const cellPadding = flush ? "px-5" : "px-4";

  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
          <th className={clsx(cellPadding, "py-3 text-left")}>{leftHeader}</th>
          <th
            className={clsx(
              cellPadding,
              "py-3 text-right",
              rightColumnClassName,
            )}
          >
            {rightHeader}
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {rows.map((row) => (
          <tr key={row.left} className="hover:bg-slate-50/50 transition-colors">
            <td
              className={clsx(
                cellPadding,
                "py-3 text-left text-slate-700 break-words",
              )}
            >
              {row.left}
            </td>
            <td
              className={clsx(
                cellPadding,
                "py-3 text-right text-slate-700 tabular-nums",
                rightColumnClassName,
              )}
            >
              {row.right}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function CountryWiseUsersTable({ rows }: { rows: CountryUserRow[] }) {
  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
          <th className="px-5 py-3 text-left">Country</th>
          <th className="px-5 py-3 text-right w-28">Count</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {rows.map((row) => (
          <tr
            key={row.country}
            className="hover:bg-slate-50/50 transition-colors"
          >
            <td className="px-5 py-3 text-left text-slate-700 break-words">
              {row.country}
            </td>
            <td className="px-5 py-3 text-right text-slate-900 font-semibold tabular-nums">
              {row.count}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DropoffRateTable({ flush = false }: { flush?: boolean }) {
  const cellPadding = flush ? "px-5" : "px-4";
  const numericPadding = flush ? "px-5" : "px-3";

  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
          <th className={clsx(cellPadding, "py-3 text-left")}>
            Verification Type
          </th>
          <th className={clsx(numericPadding, "py-3 text-left w-24")}>
            Started
          </th>
          <th className={clsx(numericPadding, "py-3 text-left w-28")}>
            Completed
          </th>
          <th className={clsx(numericPadding, "py-3 text-right w-28")}>
            Dropoff Rate
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {INSTANT_SIGNUP_DROPOFF_RATES.map((row) => (
          <tr
            key={row.verificationType}
            className="hover:bg-slate-50/50 transition-colors"
          >
            <td className={clsx(cellPadding, "py-3 text-left text-slate-700")}>
              {row.verificationType}
            </td>
            <td
              className={clsx(
                numericPadding,
                "py-3 text-left text-slate-700 tabular-nums",
              )}
            >
              {row.started}
            </td>
            <td
              className={clsx(
                numericPadding,
                "py-3 text-left text-slate-700 tabular-nums",
              )}
            >
              {row.completed}
            </td>
            <td
              className={clsx(
                numericPadding,
                "py-3 text-right text-slate-700 tabular-nums",
              )}
            >
              {row.dropoffRate}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function downloadCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function generateCountryUsersCsvContent(rows: CountryUserRow[]) {
  const lines = [
    "Country,Count",
    ...rows.map((row) => `"${row.country.replace(/"/g, '""')}",${row.count}`),
  ];
  return lines.join("\n");
}

export const InstantSignupAnalyticsReport = forwardRef<
  InstantSignupAnalyticsReportHandle,
  InstantSignupAnalyticsReportProps
>(({ sections: _sections, filters }, ref) => {
  const [countryUsersDrawerOpen, setCountryUsersDrawerOpen] = useState(false);
  const countryUsersPreview = INSTANT_SIGNUP_COUNTRY_USERS.slice(
    0,
    COUNTRY_USERS_PREVIEW_LIMIT,
  );

  const handleCountryUsersExportCSV = () => {
    if (INSTANT_SIGNUP_COUNTRY_USERS.length === 0) {
      alert("No rows to export for current filters.");
      return;
    }
    downloadCsv(
      generateCountryUsersCsvContent(INSTANT_SIGNUP_COUNTRY_USERS),
      `instant-signup-country-users-${filters.from || "all"}-${filters.to || "time"}.csv`,
    );
  };

  useImperativeHandle(ref, () => ({
    exportData: handleCountryUsersExportCSV,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <SectionCard
          title="Total Page Views"
          source={GOOGLE_SOURCE_LABEL}
          className="xl:col-span-9"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {INSTANT_SIGNUP_PAGE_VIEWS.map((metric) => (
              <OverviewMetricCard
                key={metric.label}
                title={metric.label}
                value={metric.value.toLocaleString()}
                titleClassName="normal-case tracking-normal"
              />
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Overall User Engagement Metrics"
          source={GOOGLE_SOURCE_LABEL}
          className="xl:col-span-3"
        >
          <div className="grid grid-cols-2 xl:grid-cols-1 gap-3 sm:gap-4 [&>*]:min-w-0">
            <OverviewMetricCard
              title="Bounce Rate"
              value={INSTANT_SIGNUP_ENGAGEMENT_METRICS.bounceRate}
              showInfo
              tooltipAlign="left"
              info="Bounce Rate represents the percentage of visitors who enter a website and then leave after viewing only one page, without taking any further action on the site"
            />
            <OverviewMetricCard
              title="Average Page View Per Session"
              value={
                INSTANT_SIGNUP_ENGAGEMENT_METRICS.averagePageViewPerSession
              }
              showInfo
              tooltipAlign="right"
              titleClassName="normal-case tracking-normal"
              info="Average Pages/Screens per Session (Avg. PPS) is a key engagement metric showing the average number of pages or screens a user views in a single visit. A higher value suggests excellent content relevance and user engagement as visitors are digging deeper into your site or app."
            />
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Country-wise Users Count
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {GOOGLE_SOURCE_LABEL}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCountryUsersExportCSV}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-500" />
                Export
              </button>
              <button
                type="button"
                onClick={() => setCountryUsersDrawerOpen(true)}
                className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors shrink-0"
              >
                View all
              </button>
            </div>
          </div>
          <CountryWiseUsersTable rows={countryUsersPreview} />
        </div>

        <SectionCard
          title="Individual Page Analytics"
          source={GOOGLE_SOURCE_LABEL}
          flush
        >
          <TwoColumnTable
            flush
            leftHeader="Page Name"
            rightHeader="Engagement Time (Average)"
            rightColumnClassName="min-w-[11.5rem] whitespace-nowrap"
            rows={INSTANT_SIGNUP_PAGE_ENGAGEMENT.map((row) => ({
              left: row.pageName,
              right: row.engagementTime,
            }))}
          />
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <SectionCard
          title="Sign-Up and Conversion Information"
          source={GOOGLE_SOURCE_LABEL}
          className="xl:col-span-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <OverviewMetricCard
              title="Engagement Time"
              value={INSTANT_SIGNUP_CONVERSION_METRICS.engagementTime}
              showInfo
              tooltipAlign="left"
              info="Engagement Time for First Interaction: The total amount of time the user engages with website or app starting from their first interaction. It tracks the active time spent on the site until the user stops engaging."
            />
            <OverviewMetricCard
              title="Time To First Action"
              value={INSTANT_SIGNUP_CONVERSION_METRICS.timeToFirstAction}
              showInfo
              tooltipAlign="center"
              info="Time To First Action: The amount of time it takes for a user to perform their first interaction (such as clicking a button, submitting a form, or navigating to another page) after arriving on website or app."
            />
            <OverviewMetricCard
              title="Session Duration"
              value={INSTANT_SIGNUP_CONVERSION_METRICS.sessionDuration}
              showInfo
              tooltipAlign="right"
              info="Session Duration: The total time a user spends on website or app during a single session. A session begins when the user first interacts with the site and ends after a period of inactivity. It helps measure user engagement and site effectiveness."
            />
          </div>
        </SectionCard>

        <SectionCard
          title="New Vs. Returning Users"
          source={GOOGLE_SOURCE_LABEL}
          className="xl:col-span-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {INSTANT_SIGNUP_USER_TYPES.map((row) => (
              <OverviewMetricCard
                key={row.userType}
                title={row.userType}
                value={row.activeUserCount.toLocaleString()}
              />
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-6">
          <SectionCard
            title="Device Usage Breakdown"
            source={GOOGLE_SOURCE_LABEL}
          >
            <DeviceUsagePieChart />
          </SectionCard>

          <SectionCard title="Dropoff Rate" flush>
            <DropoffRateTable flush />
          </SectionCard>
        </div>

        <SectionCard title="Medium Traffic" source={GOOGLE_SOURCE_LABEL} flush>
          <TwoColumnTable
            flush
            leftHeader="Source Medium"
            rightHeader="Active User Count"
            rightColumnClassName="min-w-[9.5rem] whitespace-nowrap"
            rows={INSTANT_SIGNUP_MEDIUM_TRAFFIC.map((row) => ({
              left: row.sourceMedium,
              right: row.activeUserCount,
            }))}
          />
        </SectionCard>
      </div>

      <CountryWiseUsersDrawer
        open={countryUsersDrawerOpen}
        onClose={() => setCountryUsersDrawerOpen(false)}
        rows={INSTANT_SIGNUP_COUNTRY_USERS}
      />
    </div>
  );
});

InstantSignupAnalyticsReport.displayName = "InstantSignupAnalyticsReport";
