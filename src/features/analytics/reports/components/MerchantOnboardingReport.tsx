import {
  useState,
  useMemo,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { clsx } from "clsx";
import {
  ArrowUpDown,
  ChevronDown,
  Download,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { Drawer } from "../../../../components/Drawer";
import type { ReportSection } from "../reportRegistry";
import type { ReportFilters } from "../reportApi";

interface MerchantOnboardingReportProps {
  sections: ReportSection[];
  filters: ReportFilters;
}

export interface MerchantOnboardingReportHandle {
  exportData: () => void;
}

type OnboardingRow = {
  month: string;
  physical: number;
  online: number;
  total: number;
  physicalTrend?: "up" | "down" | "flat" | null;
  onlineTrend?: "up" | "down" | "flat" | null;
};

type SortKey = "month" | "physical" | "online" | "total";
type SortDirection = "asc" | "desc";

const ROWS_PER_PAGE_OPTIONS = [5, 10, 25, 50];

const MONTH_ORDER: Record<string, number> = {
  Jan: 1,
  Feb: 2,
  Mar: 3,
  Apr: 4,
  May: 5,
  Jun: 6,
  Jul: 7,
  Aug: 8,
  Sep: 9,
  Oct: 10,
  Nov: 11,
  Dec: 12,
};

function parseMonthSortKey(month: string) {
  const match = month.match(/^([A-Za-z]+)\s*\((\d{4})\)$/);
  if (!match) return 0;
  const [, name, year] = match;
  return (Number(year) || 0) * 100 + (MONTH_ORDER[name] || 0);
}

function toChartLabel(month: string) {
  return month.replace(/\s+\(/, "(");
}

function isMonthInDateRange(month: string, from: string, to: string) {
  if (!from || !to) return true;
  const monthKey = parseMonthSortKey(month);
  const fromDate = new Date(from);
  const toDate = new Date(to);
  const fromKey = fromDate.getFullYear() * 100 + (fromDate.getMonth() + 1);
  const toKey = toDate.getFullYear() * 100 + (toDate.getMonth() + 1);
  return monthKey >= fromKey && monthKey <= toKey;
}

function collectOnboardingRows(
  sections: ReportSection[],
  filters: ReportFilters,
): OnboardingRow[] {
  const allRows: OnboardingRow[] = [];

  sections.forEach((section) => {
    const sectionRows = section.customData?.rows || [];
    sectionRows.forEach((row: OnboardingRow) => {
      allRows.push({ ...row });
    });
  });

  // Sort ALL rows chronologically
  allRows.sort(
    (a, b) => parseMonthSortKey(a.month) - parseMonthSortKey(b.month),
  );

  // Compute trends on ALL chronologically sorted rows
  const enriched = allRows.map((row, index) => {
    if (index === 0) {
      return { ...row, physicalTrend: null, onlineTrend: null };
    }
    const prevPhys = allRows[index - 1].physical;
    const prevOnline = allRows[index - 1].online;

    const physicalTrend =
      row.physical > prevPhys
        ? "up"
        : row.physical < prevPhys
          ? "down"
          : "flat";
    const onlineTrend =
      row.online > prevOnline
        ? "up"
        : row.online < prevOnline
          ? "down"
          : "flat";

    return { ...row, physicalTrend, onlineTrend };
  });

  // Now filter by date range
  return enriched.filter((row) =>
    isMonthInDateRange(row.month, filters.from, filters.to),
  );
}

function sumTotals(rows: OnboardingRow[]) {
  return rows.reduce(
    (acc, row) => ({
      physical: acc.physical + row.physical,
      online: acc.online + row.online,
      total: acc.total + row.total,
    }),
    { physical: 0, online: 0, total: 0 },
  );
}

function sortRows(
  rows: OnboardingRow[],
  sortKey: SortKey,
  direction: SortDirection,
) {
  const sorted = [...rows].sort((a, b) => {
    if (sortKey === "month") {
      return parseMonthSortKey(a.month) - parseMonthSortKey(b.month);
    }
    return a[sortKey] - b[sortKey];
  });

  return direction === "desc" ? sorted.reverse() : sorted;
}

export const MerchantOnboardingReport = forwardRef<
  MerchantOnboardingReportHandle,
  MerchantOnboardingReportProps
>(({ sections, filters }, ref) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortKey, setSortKey] = useState<SortKey>("month");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"All" | "Physical" | "Online">(
    "All",
  );
  const [drawerPage, setDrawerPage] = useState(1);

  useEffect(() => {
    setDrawerPage(1);
  }, [selectedMonth, activeTab]);

  const monthlyRows = useMemo(
    () => collectOnboardingRows(sections, filters),
    [sections, filters],
  );

  const selectedRow = useMemo(() => {
    if (!selectedMonth) return null;
    return monthlyRows.find((r) => r.month === selectedMonth);
  }, [monthlyRows, selectedMonth]);

  const parsed = useMemo(() => {
    if (!selectedMonth) return null;
    const match = selectedMonth.match(/^([A-Za-z]+)\s*\((\d{4})\)$/);
    if (!match) return null;
    const [, name, year] = match;
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthIdx = monthNames.indexOf(name);
    if (monthIdx === -1) return null;
    return { month: monthIdx, year: Number(year) };
  }, [selectedMonth]);

  const allOnboardedMerchants = useMemo(() => {
    if (!parsed || !selectedMonth || !selectedRow) return [];

    const physicalCount = selectedRow.physical;
    const onlineCount = selectedRow.online;

    const dummySectors = [
      "Retail",
      "Pureplay Ecommerce",
      "Healthcare",
      "Education",
      "Food & Beverage",
      "Telecommunication",
      "Superstore",
      "Electronics",
    ];

    const physicalMerchants = Array.from({ length: physicalCount }, (_, i) => {
      const id = `dummy_phys_${parsed.year}_${parsed.month}_${i}`;
      const outlets = [
        "Daily Shopping",
        "Shwapno",
        "Agora",
        "Mina Bazar",
        "Aarong",
        "Lotto",
        "Bata",
        "Apex",
      ];
      const outletName = outlets[i % outlets.length];
      const name = `${outletName} Outlet ${i + 1}`;
      const storeId = `phys_${parsed.year.toString().slice(2)}${(parsed.month + 1).toString().padStart(2, "0")}_${i + 1}`;
      return {
        id,
        name,
        storeId,
        sector: dummySectors[i % dummySectors.length],
        gmv7d: Math.floor(50000 + Math.random() * 500000),
        successRate7d: Math.floor(75 + Math.random() * 23),
        onboardingDate: `${parsed.year}-${(parsed.month + 1).toString().padStart(2, "0")}-10`,
        type: "Physical",
      };
    });

    const onlineMerchants = Array.from({ length: onlineCount }, (_, i) => {
      const id = `dummy_onl_${parsed.year}_${parsed.month}_${i}`;
      const shops = [
        "Daraz",
        "Chaldal",
        "Rokomari",
        "PriyoShop",
        "Pickaboo",
        "Othoba",
        "Bagdoom",
        "Shajgoj",
      ];
      const shopName = shops[i % shops.length];
      const name = `${shopName} Store ${i + 1}`;
      const storeId = `onli_${parsed.year.toString().slice(2)}${(parsed.month + 1).toString().padStart(2, "0")}_${i + 1}`;
      return {
        id,
        name,
        storeId,
        sector: dummySectors[(i + 2) % dummySectors.length],
        gmv7d: Math.floor(100000 + Math.random() * 900000),
        successRate7d: Math.floor(80 + Math.random() * 18),
        onboardingDate: `${parsed.year}-${(parsed.month + 1).toString().padStart(2, "0")}-12`,
        type: "Online",
      };
    });

    return [...physicalMerchants, ...onlineMerchants];
  }, [parsed, selectedMonth, selectedRow]);

  const filteredMerchants = useMemo(() => {
    if (activeTab === "All") return allOnboardedMerchants;
    return allOnboardedMerchants.filter(
      (m) => m.type?.toLowerCase() === activeTab.toLowerCase(),
    );
  }, [allOnboardedMerchants, activeTab]);

  const drawerItemsPerPage = 10;
  const drawerTotalPages = Math.ceil(
    filteredMerchants.length / drawerItemsPerPage,
  );

  const paginatedDrawerMerchants = useMemo(() => {
    const start = (drawerPage - 1) * drawerItemsPerPage;
    return filteredMerchants.slice(start, start + drawerItemsPerPage);
  }, [filteredMerchants, drawerPage]);

  const scrollDrawerToTop = () => {
    const scrollEl = document.querySelector(".onboarding-list-drawer-scroll");
    if (scrollEl) scrollEl.scrollTo({ top: 0, behavior: "smooth" });
  };

  const totals = useMemo(() => sumTotals(monthlyRows), [monthlyRows]);

  const sortedRows = useMemo(
    () => sortRows(monthlyRows, sortKey, sortDirection),
    [monthlyRows, sortKey, sortDirection],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filters.from, filters.to, sortKey, sortDirection, rowsPerPage]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / rowsPerPage));
  const pagedRows = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedRows.slice(start, start + rowsPerPage);
  }, [sortedRows, currentPage, rowsPerPage]);

  const chartData = useMemo(() => {
    return monthlyRows.map((row) => ({
      month: toChartLabel(row.month),
      fullMonth: row.month,
      physical: row.physical,
      online: row.online,
      totalMerchants: row.total,
    }));
  }, [monthlyRows]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDirection("asc");
  };

  const generateCsvContent = () => {
    const headers = [
      "#",
      "Month Name",
      "Physical Merchant",
      "Online Merchant",
      "Total Merchant",
    ];
    const rows = sortedRows.map((row, index) => [
      index + 1,
      row.month,
      row.physical,
      row.online,
      row.total,
    ]);

    if (rows.length === 0) return null;

    rows.push([
      "",
      "Total merchant in 365 days",
      totals.physical,
      totals.online,
      totals.total,
    ]);
    return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  };

  const downloadCsv = (content: string, filename: string) => {
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
    }
  };

  useImperativeHandle(ref, () => ({
    exportData: () => {
      const content = generateCsvContent();
      if (content) {
        downloadCsv(
          content,
          `merchant-onboarding-${filters.from}-${filters.to}.csv`,
        );
      } else {
        alert("No rows to export for current filters.");
      }
    },
  }));

  if (monthlyRows.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
        No onboarding data found for the selected filters.
      </div>
    );
  }

  const renderTrendIcon = (trend?: "up" | "down" | "flat" | null) => {
    if (trend === "up") {
      return <TrendingUp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
    }
    if (trend === "down") {
      return <TrendingDown className="w-3.5 h-3.5 text-rose-600 shrink-0" />;
    }
    return null;
  };

  const SortableHeader = ({
    label,
    column,
  }: {
    label: string;
    column: SortKey;
  }) => (
    <th className="px-4 py-3 text-left">
      <button
        type="button"
        onClick={() => handleSort(column)}
        className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-500 font-bold hover:text-slate-700 transition-colors cursor-pointer"
      >
        <ArrowUpDown className="w-3 h-3 shrink-0" />
        {label}
      </button>
    </th>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Monthly Total Merchants (Physical vs Online)
          </h3>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-slate-600 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] inline-block"></span>
              <span>Physical Merchants</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6] inline-block"></span>
              <span>Online Merchants</span>
            </div>
          </div>
        </div>

        <div
          className="h-[320px] w-full [&_.recharts-wrapper]:outline-none [&_.recharts-wrapper]:focus-visible:outline-none [&_svg]:outline-none [&_svg]:focus-visible:outline-none"
          onMouseDown={(e) => e.preventDefault()}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -12, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 11 }}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 11 }}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(241, 245, 249, 0.4)" }}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                labelFormatter={(_, payload) =>
                  payload?.[0]?.payload?.fullMonth || ""
                }
              />
              <Bar
                dataKey="physical"
                name="Physical Merchants"
                fill="#10b981"
                stackId="onboarding"
                maxBarSize={32}
                activeBar={false}
                onClick={(data) => {
                  if (data && data.fullMonth) {
                    setSelectedMonth(data.fullMonth);
                    setActiveTab("Physical");
                  }
                }}
              />
              <Bar
                dataKey="online"
                name="Online Merchants"
                fill="#3b82f6"
                stackId="onboarding"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
                activeBar={false}
                onClick={(data) => {
                  if (data && data.fullMonth) {
                    setSelectedMonth(data.fullMonth);
                    setActiveTab("Online");
                  }
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Monthly Merchant Onboarding Summary
          </h3>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const content = generateCsvContent();
                if (content) {
                  downloadCsv(
                    content,
                    `merchant-onboarding-${filters.from || "all"}-${filters.to || "time"}.csv`,
                  );
                } else {
                  alert("No rows to export for current filters.");
                }
              }}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-500" />
              Export
            </button>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="whitespace-nowrap">Show</span>
              <div className="relative">
                <select
                  value={rowsPerPage}
                  onChange={(e) => setRowsPerPage(Number(e.target.value))}
                  className="appearance-none pl-3 pr-9 py-1.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 cursor-pointer"
                >
                  {ROWS_PER_PAGE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <span className="whitespace-nowrap">entries</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                <th className="px-4 py-3 text-left w-12">#</th>
                <SortableHeader label="Month Name" column="month" />
                <SortableHeader label="Physical Merchant" column="physical" />
                <SortableHeader label="Online Merchant" column="online" />
                <SortableHeader label="Total Merchant" column="total" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pagedRows.map((row, idx) => (
                <tr
                  key={row.month}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-4 py-3 text-left text-slate-700 tabular-nums">
                    {(currentPage - 1) * rowsPerPage + idx + 1}
                  </td>
                  <td className="px-4 py-3 text-left whitespace-nowrap">
                    <button
                      onClick={() => {
                        setSelectedMonth(row.month);
                        setActiveTab("All");
                      }}
                      className="text-primary-600 hover:text-primary-700 hover:underline font-semibold cursor-pointer transition-colors"
                    >
                      {row.month}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-left text-slate-700 font-medium tabular-nums">
                    <button
                      onClick={() => {
                        setSelectedMonth(row.month);
                        setActiveTab("Physical");
                      }}
                      className="inline-flex items-center justify-start gap-1 w-full text-primary-600 hover:text-primary-700 hover:underline font-semibold cursor-pointer transition-colors"
                    >
                      {row.physical}
                      {renderTrendIcon(row.physicalTrend)}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-left text-slate-700 font-medium tabular-nums">
                    <button
                      onClick={() => {
                        setSelectedMonth(row.month);
                        setActiveTab("Online");
                      }}
                      className="inline-flex items-center justify-start gap-1 w-full text-primary-600 hover:text-primary-700 hover:underline font-semibold cursor-pointer transition-colors"
                    >
                      {row.online}
                      {renderTrendIcon(row.onlineTrend)}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-left text-slate-700 font-medium tabular-nums">
                    <button
                      onClick={() => {
                        setSelectedMonth(row.month);
                        setActiveTab("All");
                      }}
                      className="text-primary-600 hover:text-primary-700 hover:underline font-semibold cursor-pointer transition-colors"
                    >
                      {row.total}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 border-t border-slate-200 font-bold text-slate-900">
                <td className="px-4 py-3" colSpan={2}>
                  Total merchant in 365 days
                </td>
                <td className="px-4 py-3 text-left tabular-nums">
                  {totals.physical}
                </td>
                <td className="px-4 py-3 text-left tabular-nums">
                  {totals.online}
                </td>
                <td className="px-4 py-3 text-left tabular-nums">
                  {totals.total}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
          <p className="text-sm text-slate-500">
            {(() => {
              const total = sortedRows.length;
              const from = (currentPage - 1) * rowsPerPage + 1;
              const to = Math.min(currentPage * rowsPerPage, total);
              return `Showing ${from} to ${to} of ${total} entries`;
            })()}
          </p>
          <div className="flex items-center gap-3">
            <button
              className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer shadow-sm text-slate-600"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="text-sm font-semibold text-slate-600 select-none">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer shadow-sm text-slate-600"
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Style overrides for cursor pointer and hover effects */}
      <style>{`
        .recharts-bar-rectangle {
          cursor: pointer;
          transition: filter 0.2s;
        }
        .recharts-bar-rectangle:hover {
          filter: brightness(0.95);
        }
      `}</style>

      {/* Onboarded Merchants Drawer */}
      <Drawer
        open={selectedMonth !== null}
        onClose={() => setSelectedMonth(null)}
        title="Onboarded Merchants"
        subtitle={
          selectedMonth ? `List of merchants onboarded in ${selectedMonth}` : ""
        }
        width="xl"
        noPadding
        contentClassName="overflow-hidden flex flex-col"
      >
        <div className="flex flex-col h-full min-h-0 bg-white">
          {/* Tabs Container */}
          <div className="shrink-0 px-6 pt-5 pb-4 bg-white border-b border-slate-100">
            <div className="flex flex-wrap gap-2 p-1 bg-slate-50 border border-slate-100 rounded-xl">
              {(["All", "Physical", "Online"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={clsx(
                    "px-4 py-2 text-xs font-bold rounded-lg transition-all uppercase tracking-wider cursor-pointer",
                    activeTab === tab
                      ? "bg-white text-primary-600 shadow-sm border border-slate-200"
                      : "text-slate-500 hover:text-slate-700",
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="onboarding-list-drawer-scroll flex-1 min-h-0 overflow-y-auto px-6 py-4 bg-white">
            {paginatedDrawerMerchants.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {paginatedDrawerMerchants.map((m, idx) => (
                  <div
                    key={m.id}
                    onClick={() => {
                      setSelectedMonth(null);
                      navigate(`/merchants/profile/${m.id}`);
                    }}
                    className="py-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-all px-2 -mx-2 rounded-lg group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="text-[10px] font-bold text-slate-300 w-8 group-hover:text-primary-400 transition-colors">
                        {((drawerPage - 1) * drawerItemsPerPage + idx + 1)
                          .toString()
                          .padStart(2, "0")}
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {m.name}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          ID: {m.storeId} · Sector: {m.sector} · {m.type}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-xs font-bold text-slate-900">
                        ৳{m.gmv7d.toLocaleString()}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600">
                        SR: {m.successRate7d}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center">
                <p className="text-sm text-slate-400">
                  No {activeTab.toLowerCase()} merchants found for{" "}
                  {selectedMonth}.
                </p>
              </div>
            )}
          </div>

          {/* Drawer Pagination Footer */}
          {drawerTotalPages > 1 && (
            <div className="shrink-0 px-6 py-4 bg-white border-t border-slate-100">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-500">
                  Showing {(drawerPage - 1) * drawerItemsPerPage + 1} to{" "}
                  {Math.min(
                    drawerPage * drawerItemsPerPage,
                    filteredMerchants.length,
                  )}{" "}
                  of {filteredMerchants.length} entries
                </p>
                <div className="flex items-center gap-3">
                  <button
                    disabled={drawerPage === 1}
                    onClick={() => {
                      setDrawerPage((prev) => Math.max(1, prev - 1));
                      scrollDrawerToTop();
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
                  >
                    Previous
                  </button>
                  <span className="text-xs font-semibold text-slate-600 select-none">
                    Page {drawerPage} of {drawerTotalPages}
                  </span>
                  <button
                    disabled={drawerPage === drawerTotalPages}
                    onClick={() => {
                      setDrawerPage((prev) =>
                        Math.min(drawerTotalPages, prev + 1),
                      );
                      scrollDrawerToTop();
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Drawer>
    </div>
  );
});

MerchantOnboardingReport.displayName = "MerchantOnboardingReport";
