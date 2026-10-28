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
  Info,
  Search,
} from "lucide-react";
import { CopyButton } from "../../../../components/CopyButton";
import { Tooltip } from "../../../../components/Tooltip";
import {
  buildAllSectorProfiles,
  buildComparedSectorProfiles,
  type SectorComparisonProfile,
} from "../data/sectorComparisonReportData";
import type { ReportSection } from "../reportRegistry";
import type { ReportFilters } from "../reportApi";

interface SectorComparisonReportProps {
  sections: ReportSection[];
  filters: ReportFilters;
}

export interface SectorComparisonReportHandle {
  exportData: () => void;
}

function LeaderMetricCard({
  title,
  value,
  entityName,
  valueClassName,
  children,
}: {
  title: string;
  value: string;
  entityName: string;
  valueClassName?: string;
  children?: ReactNode;
}) {
  return (
    <div className="metric-card-container bg-white p-4 rounded-xl border border-slate-200 shadow-sm transition-all text-left">
      <p className="text-xs font-semibold text-slate-500 uppercase">{title}</p>
      <p
        className="text-sm font-semibold text-slate-800 mt-2 truncate"
        title={entityName}
      >
        {entityName}
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

function TrendCell({ value }: { value: number }) {
  return (
    <div
      className={clsx(
        "inline-flex items-center gap-1",
        value >= 0 ? "text-emerald-600" : "text-rose-600",
      )}
    >
      {value >= 0 ? (
        <TrendingUp className="w-3.5 h-3.5" />
      ) : (
        <TrendingDown className="w-3.5 h-3.5" />
      )}
      {value >= 0 ? "+" : ""}
      {value}%
    </div>
  );
}

function MerchantsStoresLine({
  merchantCount,
  storeCount,
}: {
  merchantCount: number;
  storeCount: number;
}) {
  return (
    <p className="text-xs text-slate-500">
      Merchants: {merchantCount.toLocaleString()}{" "}
      <span className="text-slate-400">|</span> Stores:{" "}
      {storeCount.toLocaleString()}
    </p>
  );
}

export const SectorComparisonReport = forwardRef<
  SectorComparisonReportHandle,
  SectorComparisonReportProps
>(({ filters }, ref) => {
  const allSectors = useMemo(
    () => buildAllSectorProfiles(filters),
    [filters.from, filters.to],
  );

  const defaultComparedIds = useMemo(() => {
    return [...allSectors]
      .sort((a, b) => b.periodAmount - a.periodAmount)
      .slice(0, 4)
      .map((sector) => sector.id);
  }, [allSectors]);

  const [comparedIds, setComparedIds] = useState<string[]>(defaultComparedIds);
  const [isAddDropdownOpen, setIsAddDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const comparedSectors = useMemo(
    () => buildComparedSectorProfiles(comparedIds, filters),
    [comparedIds, filters.from, filters.to],
  );

  const availableToAdd = useMemo(() => {
    return allSectors.filter((sector) => !comparedIds.includes(sector.id));
  }, [allSectors, comparedIds]);

  const addSector = (id: string) => {
    if (!comparedIds.includes(id)) {
      setComparedIds((prev) => [...prev, id]);
    }
    setIsAddDropdownOpen(false);
    setSearchQuery("");
  };

  const removeSector = (id: string) => {
    setComparedIds((prev) => prev.filter((item) => item !== id));
  };

  const resetToDefault = () => {
    setComparedIds(defaultComparedIds);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const leaders = useMemo(() => {
    if (comparedSectors.length === 0) return null;

    const amountLeader = [...comparedSectors].reduce(
      (prev, curr) => (curr.periodAmount > prev.periodAmount ? curr : prev),
      comparedSectors[0],
    );
    const revenueLeader = [...comparedSectors].reduce(
      (prev, curr) => (curr.periodRevenue > prev.periodRevenue ? curr : prev),
      comparedSectors[0],
    );
    const txLeader = [...comparedSectors].reduce(
      (prev, curr) => (curr.periodTxCount > prev.periodTxCount ? curr : prev),
      comparedSectors[0],
    );

    return { amount: amountLeader, revenue: revenueLeader, tx: txLeader };
  }, [comparedSectors]);

  const handleExportCSV = useCallback(() => {
    if (comparedSectors.length === 0) {
      alert("No sectors selected for comparison.");
      return;
    }

    const headers = [
      "Metric",
      ...comparedSectors.map((sector) => sector.sectorName),
    ];

    const rowDefinitions = [
      { label: "Sector Code", key: "sectorCode" },
      { label: "Merchants", key: "merchantCount", format: (v: number) => v },
      { label: "Stores", key: "storeCount", format: (v: number) => v },
      { label: "GMV / Amount", key: "periodAmount", format: (v: number) => v },
      { label: "Transactions", key: "periodTxCount", format: (v: number) => v },
      { label: "SSL Revenue", key: "periodRevenue", format: (v: number) => v },
      { label: "Active (%)", key: "activePct", format: (v: number) => `${v}%` },
      {
        label: "Inactive (%)",
        key: "inactivePct",
        format: (v: number) => `${v}%`,
      },
      { label: "Other (%)", key: "otherPct", format: (v: number) => `${v}%` },
      {
        label: "Amount Growth Trend",
        key: "amountGrowthTrend",
        format: (v: number) => `${v}%`,
      },
      {
        label: "Revenue Growth Trend",
        key: "revenueGrowthTrend",
        format: (v: number) => `${v}%`,
      },
    ];

    const rows = rowDefinitions.map((def) => {
      const rowData = [def.label];
      comparedSectors.forEach((sector) => {
        const val = sector[def.key as keyof SectorComparisonProfile];
        rowData.push(
          def.format ? def.format(val as never) : String(val ?? "N/A"),
        );
      });
      return rowData;
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `sector_comparison_report_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [comparedSectors]);

  useImperativeHandle(
    ref,
    () => ({
      exportData: handleExportCSV,
    }),
    [handleExportCSV],
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Sector Compare List
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select and manage sectors to compare side-by-side.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={resetToDefault}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-primary-600 hover:bg-slate-50 border border-slate-200 rounded-lg transition-all"
            >
              Reset to Default
            </button>

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
                Add Sector
                <ChevronDown className="w-3.5 h-3.5 opacity-80" />
              </button>

              {isAddDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden">
                  <div className="px-3 pt-3 pb-2 border-b border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Select sector to add
                    </p>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        autoFocus
                        placeholder="Search sectors..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                      />
                    </div>
                  </div>
                  <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5">
                    {(() => {
                      const query = searchQuery.toLowerCase();
                      const filtered = availableToAdd.filter(
                        (sector) =>
                          sector.sectorName.toLowerCase().includes(query) ||
                          sector.sectorCode.toLowerCase().includes(query),
                      );
                      if (filtered.length === 0) {
                        return (
                          <div className="flex flex-col items-center justify-center py-6 text-slate-400">
                            <Search className="w-5 h-5 mb-1.5 opacity-50" />
                            <p className="text-xs font-medium">
                              No sectors found
                            </p>
                          </div>
                        );
                      }
                      return filtered.map((sector) => (
                        <button
                          key={sector.id}
                          onClick={() => addSector(sector.id)}
                          className="w-full flex items-center justify-between px-2.5 py-2 hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-700 text-left transition-colors"
                        >
                          <span className="truncate">{sector.sectorName}</span>
                          <span className="text-[10px] text-slate-400 font-normal shrink-0 ml-2">
                            Amount: {formatCurrency(sector.periodAmount)}
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

        <div className="flex flex-wrap items-center gap-2 pt-2">
          {comparedSectors.length === 0 ? (
            <div className="text-sm text-slate-400 italic py-2">
              No sectors selected. Click &quot;+ Add Sector&quot; to start
              comparing.
            </div>
          ) : (
            comparedSectors.map((sector) => (
              <span
                key={sector.id}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 border border-primary-100/50 hover:bg-primary-100/30 transition-colors shadow-sm"
              >
                <span>{sector.sectorName}</span>
                <button
                  onClick={() => removeSector(sector.id)}
                  className="p-0.5 rounded-full hover:bg-primary-200/50 text-primary-500 hover:text-primary-800 transition-colors cursor-pointer"
                  title={`Remove ${sector.sectorName}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          )}
        </div>
      </div>

      {comparedSectors.length > 0 && leaders && (
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
            Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <LeaderMetricCard
              title="Top Amount Leader"
              entityName={leaders.amount.sectorName}
              value={formatCurrency(leaders.amount.periodAmount)}
              valueClassName="tabular-nums"
            >
              <p
                className={clsx(
                  "text-xs font-semibold flex items-center gap-0.5",
                  leaders.amount.amountGrowthTrend >= 0
                    ? "text-emerald-600"
                    : "text-rose-600",
                )}
              >
                {leaders.amount.amountGrowthTrend >= 0 ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                {leaders.amount.amountGrowthTrend >= 0 ? "+" : ""}
                {leaders.amount.amountGrowthTrend}% amount trend
              </p>
              <MerchantsStoresLine
                merchantCount={leaders.amount.merchantCount}
                storeCount={leaders.amount.storeCount}
              />
            </LeaderMetricCard>
            <LeaderMetricCard
              title="Top Revenue Leader"
              entityName={leaders.revenue.sectorName}
              value={formatCurrency(leaders.revenue.periodRevenue)}
              valueClassName="tabular-nums"
            >
              <p className="text-xs text-slate-500">
                Active: {leaders.revenue.activePct}%
              </p>
              <MerchantsStoresLine
                merchantCount={leaders.revenue.merchantCount}
                storeCount={leaders.revenue.storeCount}
              />
            </LeaderMetricCard>
            <LeaderMetricCard
              title="Tx Count Leader"
              entityName={leaders.tx.sectorName}
              value={leaders.tx.periodTxCount.toLocaleString()}
              valueClassName="tabular-nums"
            >
              <p className="text-xs text-slate-500">
                Active: {leaders.tx.activePct}%
              </p>
              <MerchantsStoresLine
                merchantCount={leaders.tx.merchantCount}
                storeCount={leaders.tx.storeCount}
              />
            </LeaderMetricCard>
          </div>
        </div>
      )}

      {comparedSectors.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
              GMV Amount Comparison
            </h4>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={comparedSectors}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  className="[&_.recharts-wrapper]:outline-none [&_svg]:outline-none"
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="sectorName"
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
                      "Amount",
                    ]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      fontSize: "12px",
                    }}
                  />
                  <Bar
                    dataKey="periodAmount"
                    name="Amount"
                    fill="#295cab"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
              Transaction Count
            </h4>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={comparedSectors}
                  margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                  className="[&_.recharts-wrapper]:outline-none [&_svg]:outline-none"
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="sectorName"
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

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
              SSL Revenue Comparison
            </h4>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={comparedSectors}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  className="[&_.recharts-wrapper]:outline-none [&_svg]:outline-none"
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="sectorName"
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

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
              Active Rate & Amount Growth Trend
            </h4>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={comparedSectors}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  className="[&_.recharts-wrapper]:outline-none [&_svg]:outline-none"
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="sectorName"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 11 }}
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
                    dataKey="activePct"
                    name="Active %"
                    fill="#20b2aa"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={45}
                  />
                  <Line
                    type="monotone"
                    dataKey="amountGrowthTrend"
                    name="Amount Growth Trend %"
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

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">
            Side-by-Side Sector Companion
          </h3>
          {comparedSectors.length > 0 && (
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

        {comparedSectors.length === 0 ? (
          <div className="p-8 text-center text-slate-400 italic">
            No sectors selected. Add sectors above to populate the comparison
            table.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 text-[10px] uppercase tracking-wider font-semibold">
                  <th className="px-6 py-4 font-bold min-w-[200px] border-r border-slate-100">
                    Metric / Attribute
                  </th>
                  {comparedSectors.map((sector) => (
                    <th
                      key={sector.id}
                      className="px-6 py-4 font-bold text-center border-r border-slate-100 last:border-r-0"
                    >
                      <div className="font-semibold text-slate-800 text-sm leading-tight">
                        {sector.sectorName}
                      </div>
                      <div className="flex items-center justify-center gap-2 mt-1.5">
                        <span className="text-[10px] font-mono p-1 bg-slate-50 border border-slate-100 rounded leading-none text-slate-500">
                          {sector.sectorCode}
                        </span>
                        <CopyButton value={sector.sectorCode} />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="bg-slate-100/50">
                  <td
                    colSpan={comparedSectors.length + 1}
                    className="px-6 py-2 font-bold text-[10px] uppercase text-slate-500 tracking-wider"
                  >
                    Basic Information
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-3 font-semibold text-slate-500 border-r border-slate-100">
                    Merchants
                  </td>
                  {comparedSectors.map((sector) => (
                    <td
                      key={sector.id}
                      className="px-6 py-3 text-center border-r border-slate-100 last:border-r-0 font-medium text-slate-700"
                    >
                      {sector.merchantCount.toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-3 font-semibold text-slate-500 border-r border-slate-100">
                    Stores
                  </td>
                  {comparedSectors.map((sector) => (
                    <td
                      key={sector.id}
                      className="px-6 py-3 text-center border-r border-slate-100 last:border-r-0 font-medium text-slate-700"
                    >
                      {sector.storeCount.toLocaleString()}
                    </td>
                  ))}
                </tr>

                <tr className="bg-slate-100/50">
                  <td
                    colSpan={comparedSectors.length + 1}
                    className="px-6 py-2 font-bold text-[10px] uppercase text-slate-500 tracking-wider"
                  >
                    Financials & Volumes
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-3 font-semibold text-slate-500 border-r border-slate-100">
                    GMV / Amount
                  </td>
                  {comparedSectors.map((sector) => (
                    <td
                      key={sector.id}
                      className="px-6 py-3 text-center border-r border-slate-100 last:border-r-0 font-bold text-slate-900"
                    >
                      {formatCurrency(sector.periodAmount)}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-3 font-semibold text-slate-500 border-r border-slate-100">
                    Transactions
                  </td>
                  {comparedSectors.map((sector) => (
                    <td
                      key={sector.id}
                      className="px-6 py-3 text-center border-r border-slate-100 last:border-r-0 font-bold text-slate-900"
                    >
                      {sector.periodTxCount.toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-3 font-semibold text-slate-500 border-r border-slate-100">
                    SSL Revenue
                  </td>
                  {comparedSectors.map((sector) => (
                    <td
                      key={sector.id}
                      className="px-6 py-3 text-center border-r border-slate-100 last:border-r-0 font-bold text-indigo-700"
                    >
                      {formatCurrency(sector.periodRevenue)}
                    </td>
                  ))}
                </tr>

                <tr className="bg-slate-100/50">
                  <td
                    colSpan={comparedSectors.length + 1}
                    className="px-6 py-2 font-bold text-[10px] uppercase text-slate-500 tracking-wider"
                  >
                    Performance & Growth
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-3 font-semibold text-slate-500 border-r border-slate-100">
                    Active (%)
                  </td>
                  {comparedSectors.map((sector) => (
                    <td
                      key={sector.id}
                      className="px-6 py-3 text-center border-r border-slate-100 last:border-r-0 font-bold text-slate-900"
                    >
                      {sector.activePct}%
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-3 font-semibold text-slate-500 border-r border-slate-100">
                    Inactive (%)
                  </td>
                  {comparedSectors.map((sector) => (
                    <td
                      key={sector.id}
                      className="px-6 py-3 text-center border-r border-slate-100 last:border-r-0 font-bold text-slate-900"
                    >
                      {sector.inactivePct}%
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-3 font-semibold text-slate-500 border-r border-slate-100">
                    <span className="inline-flex items-center gap-1.5">
                      Other (%)
                      <Tooltip
                        content="Stores not Active or Inactive, e.g. pending, onboarding, suspended, or uncategorized."
                        position="right"
                      >
                        <button
                          type="button"
                          className="inline-flex text-slate-400 hover:text-slate-600 transition-colors"
                          aria-label="About Other (%)"
                        >
                          <Info className="w-3.5 h-3.5" />
                        </button>
                      </Tooltip>
                    </span>
                  </td>
                  {comparedSectors.map((sector) => (
                    <td
                      key={sector.id}
                      className="px-6 py-3 text-center border-r border-slate-100 last:border-r-0 font-bold text-slate-900"
                    >
                      {sector.otherPct}%
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-3 font-semibold text-slate-500 border-r border-slate-100">
                    Amount Growth Trend
                  </td>
                  {comparedSectors.map((sector) => (
                    <td
                      key={sector.id}
                      className="px-6 py-3 text-center border-r border-slate-100 last:border-r-0 font-bold"
                    >
                      <TrendCell value={sector.amountGrowthTrend} />
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-3 font-semibold text-slate-500 border-r border-slate-100">
                    Revenue Growth Trend
                  </td>
                  {comparedSectors.map((sector) => (
                    <td
                      key={sector.id}
                      className="px-6 py-3 text-center border-r border-slate-100 last:border-r-0 font-bold"
                    >
                      <TrendCell value={sector.revenueGrowthTrend} />
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

SectorComparisonReport.displayName = "SectorComparisonReport";
