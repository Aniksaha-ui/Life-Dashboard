import { clsx } from "clsx";
import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Activity, Download, TrendingDown, TrendingUp } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LabelList,
} from "recharts";
import { DataTable } from "../../../components/DataTable";
import type { MonthlyOverview } from "../data";
import { profiles, profileData } from "../data";
import { PortfolioSegmentInfo } from "./PortfolioSegmentInfo";

type SegmentBreakdownRow = {
  segment: string;
  isTotal: boolean;
} & Record<string, string | number | boolean>;

function segmentDotColor(segment: string) {
  if (segment === "Champion Merchants") return "bg-emerald-500";
  if (segment.includes("Loyal")) return "bg-emerald-400";
  if (segment.includes("Irregular")) return "bg-blue-600";
  if (segment === "Potential Up-sell") return "bg-blue-400";
  if (segment === "Stable Merchants") return "bg-slate-300";
  if (segment === "Monitor Closely") return "bg-amber-400";
  if (segment === "High Risk Big Merchants") return "bg-rose-500";
  return "bg-slate-300";
}

interface HistoricalSegmentOverviewProps {
  data: MonthlyOverview[];
  onOpenHealthDrawer?: (category: string, month: string, count: number) => void;
  onOpenSegmentDrawer?: (
    segment: string | null,
    trend?: string | null,
    count?: number | null,
    month?: string | null,
  ) => void;
}

export function HistoricalSegmentOverview({
  data,
  onOpenHealthDrawer,
  onOpenSegmentDrawer,
}: HistoricalSegmentOverviewProps) {
  // Helper to get total count for a month
  const getMonthTotal = (monthIndex: number) => {
    return profiles.reduce(
      (sum, p) => sum + (profileData[p].count[monthIndex] || 0),
      0,
    );
  };

  // Filter out churned and hibernating for the breakdown table
  const profilesOrder = useMemo(
    () =>
      profiles.filter(
        (p) => !["Lost Merchants", "Inactive Merchants"].includes(p),
      ),
    [],
  );

  const breakdownRows = useMemo<SegmentBreakdownRow[]>(() => {
    const segmentRows: SegmentBreakdownRow[] = profilesOrder.map((p) => {
      const row: SegmentBreakdownRow = { segment: p, isTotal: false };
      data.forEach((item, idx) => {
        row[item.month] = profileData[p].count[idx];
      });
      return row;
    });

    const totalRow: SegmentBreakdownRow = { segment: "Total", isTotal: true };
    data.forEach((item, idx) => {
      totalRow[item.month] = getMonthTotal(idx);
    });

    return [...segmentRows, totalRow];
  }, [data, profilesOrder]);

  const breakdownColumns = useMemo<ColumnDef<SegmentBreakdownRow>[]>(() => {
    const monthColumns: ColumnDef<SegmentBreakdownRow>[] = data.map((item) => ({
      id: item.month,
      header: () => (
        <span className="block w-full text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {item.month}
        </span>
      ),
      accessorFn: (row) => row[item.month],
      cell: ({ row }) => {
        const count = row.original[item.month] as number;
        if (row.original.isTotal) {
          return (
            <span className="text-xs font-bold text-slate-900 tabular-nums">
              {count.toLocaleString()}
            </span>
          );
        }
        return (
          <button
            type="button"
            onClick={() =>
              onOpenSegmentDrawer?.(
                row.original.segment,
                null,
                count,
                item.month,
              )
            }
            className="text-xs font-medium text-slate-600 tabular-nums hover:text-primary-600 transition-colors cursor-pointer"
          >
            {count.toLocaleString()}
          </button>
        );
      },
      meta: { className: "px-3 py-2 align-middle text-center text-xs" },
    }));

    return [
      {
        header: "Merchant Segment",
        accessorKey: "segment",
        cell: ({ row }) => {
          const segment = row.original.segment;
          if (row.original.isTotal) {
            return (
              <span className="text-xs font-bold text-slate-900">
                {segment}
              </span>
            );
          }
          return (
            <button
              type="button"
              onClick={() => onOpenSegmentDrawer?.(segment)}
              className="flex items-center gap-2 text-left group"
            >
              <span
                className={clsx(
                  "w-1.5 h-1.5 rounded-full shrink-0",
                  segmentDotColor(segment),
                )}
              />
              <span className="text-xs font-medium text-slate-600 group-hover:text-primary-600 transition-colors whitespace-nowrap">
                {segment}
              </span>
            </button>
          );
        },
        meta: { className: "px-3 py-2 align-middle min-w-[200px] text-xs" },
      },
      ...monthColumns,
    ];
  }, [data, onOpenSegmentDrawer]);

  const handleDownloadCsv = () => {
    const headers = ["Merchant Segment", ...data.map((d) => d.month)];
    const csv = [headers.join(",")]
      .concat(
        breakdownRows.map((row) =>
          headers
            .map(
              (h) =>
                `"${String(row[h === "Merchant Segment" ? "segment" : h] ?? "").replace(/"/g, '""')}"`,
            )
            .join(","),
        ),
      )
      .join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "merchant_segment_breakdown.csv";
    a.click();
    toast.success("CSV downloaded");
  };

  return (
    <div className="space-y-6">
      <style>{`
        .recharts-wrapper *:focus {
          outline: none !important;
          box-shadow: none !important;
        }
        .recharts-bar-rectangle {
          cursor: pointer;
          transition: filter 0.2s;
        }
        .recharts-bar-rectangle:hover {
          filter: brightness(0.95);
        }
      `}</style>

      {/* Merchant Health Distribution Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Merchant Health Distribution
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Monthly distribution across health categories
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="text-[11px] font-bold text-slate-600">
                Active & Growing
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="text-[11px] font-bold text-slate-600">
                Watch
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingDown className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="text-[11px] font-bold text-slate-600">
                Declining
              </span>
            </div>
          </div>
        </div>

        <div className="h-[180px] w-full outline-none select-none">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              tabIndex={-1}
              className="outline-none"
              data={data.map((item) => {
                return {
                  month: item.month,
                  total: item.totalMerchants,
                  active: item.health.activeGrowing,
                  watch: item.health.watch,
                  declining: item.health.declining,
                  // Original percentages for labeling
                  pActive: item.health.activeGrowing,
                  pWatch: item.health.watch,
                  pDeclining: item.health.declining,
                };
              })}
              margin={{ top: 0, right: 0, left: 80, bottom: 0 }}
              barGap={12}
            >
              <XAxis type="number" hide domain={[0, 100]} />
              <YAxis
                dataKey="month"
                type="category"
                axisLine={false}
                tickLine={false}
                tick={({ x, y, payload }) => {
                  const item = data.find((d) => d.month === payload.value);
                  return (
                    <g transform={`translate(${x},${y})`}>
                      <text
                        x={-5}
                        y={0}
                        dy={4}
                        textAnchor="end"
                        className="text-[11px] font-bold fill-slate-700"
                      >
                        {payload.value}{" "}
                        <tspan className="fill-slate-400 font-medium">
                          ({item?.totalMerchants.toLocaleString()})
                        </tspan>
                      </text>
                    </g>
                  );
                }}
              />
              <Tooltip
                cursor={{ fill: "transparent" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-white border border-slate-200 rounded-xl shadow-xl p-3 text-xs">
                        <p className="font-bold text-slate-900 mb-2">
                          {d.month}
                        </p>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-8">
                            <span className="text-slate-500 font-medium">
                              Active & Growing
                            </span>
                            <span className="font-bold text-emerald-600">
                              {Math.round(
                                (d.total * d.pActive) / 100,
                              ).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-8">
                            <span className="text-slate-500 font-medium">
                              Watch
                            </span>
                            <span className="font-bold text-amber-500">
                              {Math.round(
                                (d.total * d.pWatch) / 100,
                              ).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-8">
                            <span className="text-slate-500 font-medium">
                              Declining
                            </span>
                            <span className="font-bold text-rose-600">
                              {Math.round(
                                (d.total * d.pDeclining) / 100,
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <p className="mt-2.5 pt-2.5 border-t border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center">
                          Click bar to view merchants
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="active"
                stackId="a"
                fill="#10b981"
                radius={[4, 0, 0, 4]}
                barSize={24}
                onClick={(d: any) =>
                  onOpenHealthDrawer?.(
                    "Active & Growing",
                    d.month,
                    Math.round((d.total * d.pActive) / 100),
                  )
                }
              >
                <LabelList
                  dataKey="active"
                  position="center"
                  fill="#fff"
                  fontSize={10}
                  fontWeight={900}
                  formatter={(val: any) => `${val}%`}
                />
              </Bar>
              <Bar
                dataKey="watch"
                stackId="a"
                fill="#fbbf24"
                barSize={24}
                onClick={(d: any) =>
                  onOpenHealthDrawer?.(
                    "Watch",
                    d.month,
                    Math.round((d.total * d.pWatch) / 100),
                  )
                }
              >
                <LabelList
                  dataKey="watch"
                  position="center"
                  fill="#fff"
                  fontSize={10}
                  fontWeight={900}
                  formatter={(val: any) => `${val}%`}
                />
              </Bar>
              <Bar
                dataKey="declining"
                stackId="a"
                fill="#f43f5e"
                radius={[0, 4, 4, 0]}
                barSize={24}
                onClick={(d: any) =>
                  onOpenHealthDrawer?.(
                    "Declining",
                    d.month,
                    Math.round((d.total * d.pDeclining) / 100),
                  )
                }
              >
                <LabelList
                  dataKey="declining"
                  position="center"
                  fill="#fff"
                  fontSize={10}
                  fontWeight={900}
                  formatter={(val: any) => `${val}%`}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Merchant Segment Breakdown */}
      <div className="pt-2">
        <DataTable
          columns={breakdownColumns}
          data={breakdownRows}
          hideToolbarDateFilter
          hideViewColumn
          hidePagination
          filterActions={
            <div className="flex items-center gap-2 ml-1">
              <h2 className="text-sm font-semibold text-slate-900">
                Merchant Segment Breakdown
              </h2>
              <PortfolioSegmentInfo />
            </div>
          }
          toolbarEndContent={
            <button
              type="button"
              onClick={handleDownloadCsv}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          }
        />
      </div>
    </div>
  );
}
