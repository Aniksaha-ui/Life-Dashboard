import { clsx } from "clsx";
import {
  useState,
  useMemo,
  useCallback,
  forwardRef,
  useImperativeHandle,
  type ReactNode,
} from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  Legend,
  Line,
  ComposedChart,
} from "recharts";
import {
  Plus,
  X,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Download,
  Search,
} from "lucide-react";
import { CopyButton } from "../../../../components/CopyButton";
import { db } from "../../../../data/mock/database";
import type { Merchant } from "../../../../data/mock/types";
import {
  buildComparedMerchantMetrics,
  getComparisonDayCount,
  type ComparedMerchantMetrics,
} from "../data/merchantComparisonReportData";
import type { ReportSection } from "../reportRegistry";
import type { ReportFilters } from "../reportApi";

interface MerchantComparisonReportProps {
  sections: ReportSection[];
  filters: ReportFilters;
}

export interface MerchantComparisonReportHandle {
  exportData: () => void;
}

function LeaderMetricCard({
  title,
  value,
  merchantName,
  valueClassName,
  children,
}: {
  title: string;
  value: string;
  merchantName: string;
  valueClassName?: string;
  children?: ReactNode;
}) {
  return (
    <div className="metric-card-container bg-white p-4 rounded-xl border border-slate-200 shadow-sm transition-all text-left">
      <p className="text-xs font-semibold text-slate-500 uppercase">{title}</p>
      <p
        className="text-sm font-semibold text-slate-800 mt-2 truncate"
        title={merchantName}
      >
        {merchantName}
      </p>
      <p
        className={clsx(
          "text-2xl font-bold mt-1 text-slate-900",
          valueClassName,
        )}
      >
        {value}
      </p>
      {children ? <div className="mt-2 space-y-1">{children}</div> : null}
    </div>
  );
}

export const MerchantComparisonReport = forwardRef<
  MerchantComparisonReportHandle,
  MerchantComparisonReportProps
>(({ filters }, ref) => {
  const dayCount = useMemo(
    () => getComparisonDayCount(filters),
    [filters.from, filters.to],
  );

  // Load all mock merchants from DB
  const allMerchants = useMemo(() => {
    return db.merchants || [];
  }, []);

  // Default compared merchants: Top 4 by period GMV
  const defaultComparedIds = useMemo(() => {
    const sorted = [...allMerchants].sort((a, b) => b.gmv30d - a.gmv30d);
    return sorted.slice(0, 4).map((m) => m.id);
  }, [allMerchants]);

  // State for currently compared merchants
  const [comparedIds, setComparedIds] = useState<string[]>(defaultComparedIds);

  // Dropdown state for adding new merchants
  const [isAddDropdownOpen, setIsAddDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const comparedMerchants = useMemo((): ComparedMerchantMetrics[] => {
    return buildComparedMerchantMetrics(
      comparedIds
        .map((id) => allMerchants.find((m) => m.id === id))
        .filter((m): m is Merchant => !!m),
      dayCount,
    );
  }, [comparedIds, allMerchants, dayCount]);

  // List of merchants available to add (not currently compared)
  const availableToAdd = useMemo(() => {
    return allMerchants.filter((m) => !comparedIds.includes(m.id));
  }, [allMerchants, comparedIds]);

  const addMerchant = (id: string) => {
    if (!comparedIds.includes(id)) {
      setComparedIds((prev) => [...prev, id]);
    }
    setIsAddDropdownOpen(false);
    setSearchQuery("");
  };

  const removeMerchant = (id: string) => {
    setComparedIds((prev) => prev.filter((item) => item !== id));
  };

  const resetToDefault = () => {
    setComparedIds(defaultComparedIds);
  };

  // Formatter helpers
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Calculation of quick comparison leaders
  const leaders = useMemo(() => {
    if (comparedMerchants.length === 0) return null;

    const gmvLeader = [...comparedMerchants].reduce(
      (prev, curr) => (curr.periodGmv > prev.periodGmv ? curr : prev),
      comparedMerchants[0],
    );
    const successLeader = [...comparedMerchants].reduce(
      (prev, curr) =>
        curr.periodSuccessRate > prev.periodSuccessRate ? curr : prev,
      comparedMerchants[0],
    );
    const txLeader = [...comparedMerchants].reduce(
      (prev, curr) => (curr.periodTxCount > prev.periodTxCount ? curr : prev),
      comparedMerchants[0],
    );

    return {
      gmv: gmvLeader,
      success: successLeader,
      tx: txLeader,
    };
  }, [comparedMerchants]);

  const handleExportCSV = useCallback(() => {
    if (comparedMerchants.length === 0) {
      alert("No merchants selected for comparison.");
      return;
    }

    const headers = ["Metric", ...comparedMerchants.map((m) => m.name)];

    const rowDefinitions = [
      { label: "Store ID", key: "storeId" },
      { label: "Sector", key: "sector" },
      { label: "KAM", key: "ownerName" },
      { label: "Merchant type", key: "type" },
      { label: "GMV / Amount", key: "periodGmv", format: (v: number) => v },
      { label: "Transactions", key: "periodTxCount", format: (v: number) => v },
      { label: "Revenue", key: "periodRevenue", format: (v: number) => v },
      {
        label: "Success Rate",
        key: "periodSuccessRate",
        format: (v: number) => `${v}%`,
      },
      {
        label: "GMV Growth Trend",
        key: "gmvTrend",
        format: (v: number) => `${v}%`,
      },
      {
        label: "Revenue Growth Trend",
        key: "revenueTrend",
        format: (v: number) => `${v}%`,
      },
      { label: "EMI Status", key: "emiStatus" },
      { label: "Top Failure Reason", key: "topFailureReason" },
    ];

    const rows = rowDefinitions.map((def) => {
      const rowData = [def.label];
      comparedMerchants.forEach((m) => {
        const val = m[def.key as keyof ComparedMerchantMetrics];
        rowData.push(
          def.format ? def.format(val as any) : String(val ?? "N/A"),
        );
      });
      return rowData;
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((r) =>
        r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `merchant_comparison_report_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [comparedMerchants]);

  useImperativeHandle(
    ref,
    () => ({
      exportData: handleExportCSV,
    }),
    [handleExportCSV],
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Selector Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Merchant Compare List
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select and manage merchants to compare side-by-side.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-center">
            {/* Reset Button */}
            <button
              onClick={resetToDefault}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-primary-600 hover:bg-slate-50 border border-slate-200 rounded-lg transition-all"
            >
              Reset to Default
            </button>

            {/* Add Merchant Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsAddDropdownOpen(!isAddDropdownOpen);
                  setSearchQuery("");
                }}
                disabled={availableToAdd.length === 0}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed rounded-lg transition-all shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Merchant
                <ChevronDown className="w-3.5 h-3.5 opacity-80" />
              </button>

              {isAddDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden">
                  {/* Header */}
                  <div className="px-3 pt-3 pb-2 border-b border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Select merchant to add
                    </p>
                    {/* Search Bar */}
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        autoFocus
                        placeholder="Search merchants..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                      />
                    </div>
                  </div>
                  {/* List */}
                  <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5">
                    {(() => {
                      const filtered = availableToAdd.filter((m) =>
                        m.name
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()),
                      );
                      if (filtered.length === 0) {
                        return (
                          <div className="flex flex-col items-center justify-center py-6 text-slate-400">
                            <Search className="w-5 h-5 mb-1.5 opacity-50" />
                            <p className="text-xs font-medium">
                              No merchants found
                            </p>
                          </div>
                        );
                      }
                      return filtered.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => addMerchant(m.id)}
                          className="w-full flex items-center justify-between px-2.5 py-2 hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-700 text-left transition-colors"
                        >
                          <span className="truncate">{m.name}</span>
                          <span className="text-[10px] text-slate-400 font-normal shrink-0 ml-2">
                            GMV:{" "}
                            {formatCurrency(
                              Math.round(m.gmv30d * (dayCount / 30)),
                            )}
                          </span>
                        </button>
                      ));
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Active Compared Merchant Tags */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          {comparedMerchants.length === 0 ? (
            <div className="text-sm text-slate-400 italic py-2">
              No merchants selected. Click "+ Add Merchant" to start comparing.
            </div>
          ) : (
            comparedMerchants.map((m) => (
              <span
                key={m.id}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 border border-primary-100/50 hover:bg-primary-100/30 transition-colors shadow-sm"
              >
                <span>{m.name}</span>
                <button
                  onClick={() => removeMerchant(m.id)}
                  className="p-0.5 rounded-full hover:bg-primary-200/50 text-primary-500 hover:text-primary-800 transition-colors cursor-pointer"
                  title={`Remove ${m.name}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          )}
        </div>
      </div>

      {/* Overview — matches Merchants page MetricCard layout */}
      {comparedMerchants.length > 0 && leaders && (
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
            Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <LeaderMetricCard
              title="Top GMV Leader"
              merchantName={leaders.gmv.name}
              value={formatCurrency(leaders.gmv.periodGmv)}
              valueClassName="tabular-nums"
            >
              <p
                className={clsx(
                  "text-xs font-semibold flex items-center gap-0.5",
                  leaders.gmv.gmvTrend >= 0
                    ? "text-emerald-600"
                    : "text-rose-600",
                )}
              >
                {leaders.gmv.gmvTrend >= 0 ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                {leaders.gmv.gmvTrend >= 0 ? "+" : ""}
                {leaders.gmv.gmvTrend}% GMV trend
              </p>
              <p className="text-xs text-slate-500">
                KAM: {leaders.gmv.ownerName}
              </p>
            </LeaderMetricCard>
            <LeaderMetricCard
              title="Success Rate Leader"
              merchantName={leaders.success.name}
              value={`${leaders.success.periodSuccessRate}%`}
              valueClassName={clsx(
                "tabular-nums",
                leaders.success.periodSuccessRate > 90
                  ? "text-emerald-600"
                  : "text-amber-600",
              )}
            >
              <p className="text-[11px] text-slate-500 italic">
                Top failure: {leaders.success.topFailureReason || "None"}
              </p>
              <p className="text-xs text-slate-500">
                KAM: {leaders.success.ownerName}
              </p>
            </LeaderMetricCard>
            <LeaderMetricCard
              title="Tx Count Leader"
              merchantName={leaders.tx.name}
              value={leaders.tx.periodTxCount.toLocaleString()}
              valueClassName="tabular-nums"
            >
              <p className="text-xs text-slate-500">
                Sector: {leaders.tx.sector}
              </p>
              <p className="text-xs text-slate-500">
                KAM: {leaders.tx.ownerName}
              </p>
            </LeaderMetricCard>
          </div>
        </div>
      )}

      {/* Visualizations Grid */}
      {comparedMerchants.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* GMV/Amount Comparison Chart */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
              GMV Amount Comparison
            </h4>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={comparedMerchants}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  className="[&_.recharts-wrapper]:outline-none [&_svg]:outline-none"
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    tickFormatter={(val) =>
                      val >= 1000000
                        ? `${(val / 1000000).toFixed(1)}M`
                        : `${val / 1000}k`
                    }
                  />
                  <ChartTooltip
                    cursor={{ fill: "#f8fafc" }}
                    formatter={(value: number) => [
                      formatCurrency(value),
                      "GMV",
                    ]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      fontSize: "12px",
                    }}
                  />
                  <Bar
                    dataKey="periodGmv"
                    name="GMV"
                    fill="#295cab"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Transaction Volume Comparison Chart */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
              Transaction Count
            </h4>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={comparedMerchants}
                  margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                  className="[&_.recharts-wrapper]:outline-none [&_svg]:outline-none"
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    tickFormatter={(val) => val.toLocaleString()}
                  />
                  <ChartTooltip
                    cursor={{ fill: "#f8fafc" }}
                    formatter={(value: number) => [
                      value.toLocaleString(),
                      "Transactions",
                    ]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      fontSize: "12px",
                    }}
                  />
                  <Bar
                    dataKey="periodTxCount"
                    name="Transactions"
                    fill="#6366f1"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue Comparison Chart */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
              SSL Revenue Comparison
            </h4>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={comparedMerchants}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  className="[&_.recharts-wrapper]:outline-none [&_svg]:outline-none"
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    tickFormatter={(val) =>
                      val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val
                    }
                  />
                  <ChartTooltip
                    cursor={{ fill: "#f8fafc" }}
                    formatter={(value: number) => [
                      formatCurrency(value),
                      "Revenue",
                    ]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      fontSize: "12px",
                    }}
                  />
                  <Bar
                    dataKey="periodRevenue"
                    name="Revenue"
                    fill="#f59e0b"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Success Rate & Growth Trends Chart */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
              Success Rate & GMV Growth Trend
            </h4>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={comparedMerchants}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  className="[&_.recharts-wrapper]:outline-none [&_svg]:outline-none"
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    domain={[0, 100]}
                  />
                  <ChartTooltip
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      fontSize: "12px",
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: "11px", fontWeight: 500 }}
                  />
                  <Bar
                    dataKey="periodSuccessRate"
                    name="Success Rate %"
                    fill="#20b2aa"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={45}
                  />
                  <Line
                    type="monotone"
                    dataKey="gmvTrend"
                    name="GMV Growth Trend %"
                    stroke="#ef4444"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                      fill: "#ef4444",
                      strokeWidth: 2,
                      stroke: "#fff",
                    }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : null}

      {/* Side-by-Side Comparison Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">
            Side-by-Side Merchants Companion
          </h3>
          {comparedMerchants.length > 0 && (
            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors shadow-sm"
            >
              Export
              <Download className="w-4 h-4" />
            </button>
          )}
        </div>

        {comparedMerchants.length === 0 ? (
          <div className="p-8 text-center text-slate-400 italic">
            No merchants selected. Add merchants above to populate the details
            comparison table.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 text-[10px] uppercase tracking-wider font-semibold">
                  <th className="px-6 py-4 font-bold min-w-[200px] border-r border-slate-100">
                    Metric / Attribute
                  </th>
                  {comparedMerchants.map((m) => (
                    <th
                      key={m.id}
                      className="px-6 py-4 font-bold text-center border-r border-slate-100 last:border-r-0"
                    >
                      <div className="font-semibold text-slate-800 text-sm leading-tight">
                        {m.name}
                      </div>
                      <div className="flex items-center justify-center gap-2 mt-1.5">
                        <span className="text-[10px] font-mono p-1 bg-slate-50 border border-slate-100 rounded leading-none text-slate-500">
                          {m.storeId}
                        </span>
                        <CopyButton value={m.storeId} />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* SECTION: BASIC INFO */}
                <tr className="bg-slate-100/50">
                  <td
                    colSpan={comparedMerchants.length + 1}
                    className="px-6 py-2 font-bold text-[10px] uppercase text-slate-500 tracking-wider"
                  >
                    Basic Information
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-3 font-semibold text-slate-500 border-r border-slate-100">
                    Sector
                  </td>
                  {comparedMerchants.map((m) => (
                    <td
                      key={m.id}
                      className="px-6 py-3 text-center border-r border-slate-100 last:border-r-0 font-medium text-slate-700"
                    >
                      {m.sector}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-3 font-semibold text-slate-500 border-r border-slate-100">
                    KAM
                  </td>
                  {comparedMerchants.map((m) => (
                    <td
                      key={m.id}
                      className="px-6 py-3 text-center border-r border-slate-100 last:border-r-0 font-medium text-slate-700"
                    >
                      {m.ownerName}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-3 font-semibold text-slate-500 border-r border-slate-100">
                    Merchant type
                  </td>
                  {comparedMerchants.map((m) => (
                    <td
                      key={m.id}
                      className="px-6 py-3 text-center border-r border-slate-100 last:border-r-0 font-medium text-slate-700"
                    >
                      {m.type || "Online"}
                    </td>
                  ))}
                </tr>

                {/* SECTION: FINANCIALS & VOLUME */}
                <tr className="bg-slate-100/50">
                  <td
                    colSpan={comparedMerchants.length + 1}
                    className="px-6 py-2 font-bold text-[10px] uppercase text-slate-500 tracking-wider"
                  >
                    Financials & Volumes
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-3 font-semibold text-slate-500 border-r border-slate-100">
                    GMV / Amount
                  </td>
                  {comparedMerchants.map((m) => (
                    <td
                      key={m.id}
                      className="px-6 py-3 text-center border-r border-slate-100 last:border-r-0 font-bold text-slate-900"
                    >
                      {formatCurrency(m.periodGmv)}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-3 font-semibold text-slate-500 border-r border-slate-100">
                    Transactions
                  </td>
                  {comparedMerchants.map((m) => (
                    <td
                      key={m.id}
                      className="px-6 py-3 text-center border-r border-slate-100 last:border-r-0 font-bold text-slate-900"
                    >
                      {m.periodTxCount.toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-3 font-semibold text-slate-500 border-r border-slate-100">
                    SSL Revenue
                  </td>
                  {comparedMerchants.map((m) => (
                    <td
                      key={m.id}
                      className="px-6 py-3 text-center border-r border-slate-100 last:border-r-0 font-bold text-indigo-700"
                    >
                      {formatCurrency(m.periodRevenue)}
                    </td>
                  ))}
                </tr>

                {/* SECTION: PERFORMANCE & GROWTH */}
                <tr className="bg-slate-100/50">
                  <td
                    colSpan={comparedMerchants.length + 1}
                    className="px-6 py-2 font-bold text-[10px] uppercase text-slate-500 tracking-wider"
                  >
                    Performance & Growth
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-3 font-semibold text-slate-500 border-r border-slate-100">
                    Success Rate
                  </td>
                  {comparedMerchants.map((m) => (
                    <td
                      key={m.id}
                      className="px-6 py-3 text-center border-r border-slate-100 last:border-r-0 font-bold text-slate-900"
                    >
                      <div className="flex flex-col items-center">
                        <span
                          className={`${m.periodSuccessRate >= 90 ? "text-emerald-600" : "text-amber-600"}`}
                        >
                          {m.periodSuccessRate}%
                        </span>
                        <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                          <div
                            className={`h-full ${m.periodSuccessRate >= 90 ? "bg-emerald-500" : "bg-amber-500"}`}
                            style={{ width: `${m.periodSuccessRate}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-3 font-semibold text-slate-500 border-r border-slate-100">
                    GMV Growth Trend
                  </td>
                  {comparedMerchants.map((m) => (
                    <td
                      key={m.id}
                      className="px-6 py-3 text-center border-r border-slate-100 last:border-r-0 font-bold"
                    >
                      <div
                        className={`inline-flex items-center gap-1 ${m.gmvTrend >= 0 ? "text-emerald-600" : "text-rose-600"}`}
                      >
                        {m.gmvTrend >= 0 ? (
                          <TrendingUp className="w-3.5 h-3.5" />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5" />
                        )}
                        {m.gmvTrend >= 0 ? "+" : ""}
                        {m.gmvTrend}%
                      </div>
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-3 font-semibold text-slate-500 border-r border-slate-100">
                    Revenue Growth Trend
                  </td>
                  {comparedMerchants.map((m) => (
                    <td
                      key={m.id}
                      className="px-6 py-3 text-center border-r border-slate-100 last:border-r-0 font-bold"
                    >
                      <div
                        className={`inline-flex items-center gap-1 ${m.revenueTrend >= 0 ? "text-emerald-600" : "text-rose-600"}`}
                      >
                        {m.revenueTrend >= 0 ? (
                          <TrendingUp className="w-3.5 h-3.5" />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5" />
                        )}
                        {m.revenueTrend >= 0 ? "+" : ""}
                        {m.revenueTrend}%
                      </div>
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-3 font-semibold text-slate-500 border-r border-slate-100">
                    Top Failure Reason
                  </td>
                  {comparedMerchants.map((m) => (
                    <td
                      key={m.id}
                      className="px-6 py-3 text-center border-r border-slate-100 last:border-r-0 font-medium text-slate-600 italic"
                    >
                      {m.topFailureReason || "N/A"}
                    </td>
                  ))}
                </tr>

                {/* SECTION: CONFIGURATIONS */}
                <tr className="bg-slate-100/50">
                  <td
                    colSpan={comparedMerchants.length + 1}
                    className="px-6 py-2 font-bold text-[10px] uppercase text-slate-500 tracking-wider"
                  >
                    Gateway Configs
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-3 font-semibold text-slate-500 border-r border-slate-100">
                    EMI Facility
                  </td>
                  {comparedMerchants.map((m) => (
                    <td
                      key={m.id}
                      className="px-6 py-3 text-center border-r border-slate-100 last:border-r-0 font-medium text-slate-700"
                    >
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          m.emiStatus === "Enabled"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {m.emiStatus}
                      </span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
});

MerchantComparisonReport.displayName = "MerchantComparisonReport";
