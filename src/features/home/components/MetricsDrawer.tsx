import { clsx } from "clsx";
import { Calendar, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Drawer } from "../../../components/Drawer";
import { EmptyState } from "../../../components/EmptyState";
import { formatNumber } from "../../../utils/format";
import type { MetricsDetailData } from "../types";
import { ChargebackList } from "./ChargebackList";
import { EscrowHoldMerchantList } from "./EscrowHoldMerchantList";
import { FailedMerchantList } from "./FailedMerchantList";
import { SectorCountList } from "./SectorCountList";
import { SectorVolumeList } from "./SectorVolumeList";
import { TopFailureReasonList } from "./TopFailureReasonList";
import { TopRevenueMerchantsList } from "./TopRevenueMerchantsList";

interface MetricsDrawerProps {
  open: boolean;
  onClose: () => void;
  data: MetricsDetailData | null;
  isLoading: boolean;
  color?: string;
}

export function MetricsDrawer({
  open,
  onClose,
  data,
  isLoading,
  color = "#295cab",
}: MetricsDrawerProps) {
  if (!data && !isLoading) return null;

  const title = data?.title || "";
  const value = data?.value || 0;
  const period = data?.meta.period_label || "";
  const series = data?.series || [];
  const sections = data?.sections || [];
  const cardKey = data?.meta.card_key;

  const currencyTitles = [
    "Total TXN Volume",
    "SSL Income",
    "EMI Income",
    "Chargeback Amount",
    "Escrow Hold",
  ];
  const isCurrency = currencyTitles.includes(title);
  const isPercentage = title.toLowerCase().includes("rate");

  const getMetricColor = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes("success")) return "#10b981";
    if (
      lowerTitle.includes("failure") ||
      lowerTitle.includes("failed") ||
      lowerTitle.includes("bounce")
    )
      return "#ef4444";
    if (lowerTitle.includes("income")) return "#f97316";
    if (lowerTitle.includes("escrow")) return "#f97316";
    return color;
  };

  const metricColor = getMetricColor(title);

  const renderSpecializedList = () => {
    if (!data) return null;

    switch (cardKey) {
      case "total_txn_volume":
        return (
          <SectorVolumeList
            data={
              sections.find((s) => s.key.includes("sector_wise_volume"))?.items
            }
          />
        );

      case "total_txn_count":
        return (
          <SectorCountList
            data={
              sections.find((s) => s.key.includes("sector_wise_count"))?.items
            }
          />
        );

      case "ssl_income":
      case "emi_income":
        return (
          <TopRevenueMerchantsList
            data={
              sections.find((s) => s.key === "top_revenue_merchants")?.items
            }
          />
        );

      case "txn_success_rate":
        return null;

      case "txn_failed_count":
        return (
          <>
            <FailedMerchantList
              data={
                sections.find((s) => s.key === "top_failed_merchants")?.items
              }
            />
            <TopFailureReasonList
              data={
                sections.find((s) => s.key === "top_failure_reasons")?.items
              }
            />
          </>
        );

      case "chargeback_amount":
        return (
          <ChargebackList
            data={sections.find((s) => s.key === "chargeback_entries")}
          />
        );

      case "escrow_hold":
        return (
          <EscrowHoldMerchantList
            data={
              sections.find(
                (s) =>
                  s.key === "escrow_hold_entries" ||
                  s.key === "escrow_hold_merchants",
              )?.items
            }
          />
        );

      default:
        // Fallback to generic mapping if no specialized component
        if (sections.length === 0) {
          return <EmptyState title="No Detailed Information Available" />;
        }

        return sections.map((section) => (
          <div
            key={section.key}
            className="space-y-4 pt-6 border-t border-slate-100 mt-6"
          >
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {section.title}
            </p>

            {!section.items || section.items.length === 0 ? (
              <EmptyState title={`No ${section.title} Found`} />
            ) : (
              <div className="space-y-4">
                {section.items.map((item, idx) => (
                  <div key={idx} className="group">
                    <div className="flex justify-between text-sm mb-1.5 gap-4">
                      <span className="text-slate-600 font-medium truncate">
                        {item.sector}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-normal">
                          {formatNumber(item.percentage)}%
                        </span>
                        <span className="font-bold text-slate-900 shrink-0">
                          {isCurrency
                            ? `৳${formatNumber(item.value)}`
                            : formatNumber(item.value)}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={clsx(
                          "h-full rounded-full transition-all duration-500",
                          idx === 0
                            ? "bg-primary-500"
                            : idx === 1
                              ? "bg-primary-400"
                              : "bg-slate-300",
                        )}
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ));
    }
  };

  const fromDate = data?.meta.from;
  const toDate = data?.meta.to;

  // Robust daily point generation for empty ranges
  const chartData =
    series.length > 0
      ? series
      : fromDate && toDate
        ? (() => {
            const dummy = [];
            const current = new Date(fromDate);
            const end = new Date(toDate);
            while (current <= end) {
              dummy.push({
                date: current.toISOString().split("T")[0],
                value: 0,
              });
              current.setDate(current.getDate() + 1);
            }
            return dummy;
          })()
        : [];

  const dataMax = chartData.reduce(
    (max, item) => Math.max(max, item.value || 0),
    0,
  );
  const yDomain: [number, number | string] = isPercentage
    ? [0, 100]
    : [0, dataMax === 0 ? 4 : "auto"];

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={
        title === "Total TXN Count" ? (
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold text-slate-900">
              {title}
            </span>
            <Link
              to={`/transactions?date_preset=${period}`}
              className="px-3 py-1.5 text-xs font-semibold text-primary-600 bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              View All Transactions
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          title || "Loading..."
        )
      }
      width="lg"
    >
      <div
        className={clsx("space-y-6", isLoading && "animate-pulse opacity-50")}
      >
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Calendar className="w-4 h-4" />
          {period || "..."}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-50 rounded border border-slate-100">
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">
              {title || "Loading"}
            </p>
            <p className="text-lg font-bold text-slate-900 mt-1">
              {isCurrency
                ? `৳${formatNumber(value)}`
                : isPercentage
                  ? `${formatNumber(value)}%`
                  : formatNumber(value)}
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded border border-slate-100">
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">
              Trend
            </p>
            <p
              className={clsx(
                "mt-1 font-bold text-sm flex items-baseline gap-1",
                (data?.trend_pct ?? 0) >= 0
                  ? "text-emerald-600"
                  : "text-rose-600",
              )}
            >
              <span>
                {(data?.trend_pct ?? 0) >= 0 ? "+" : ""}
                {formatNumber(data?.trend_pct ?? 0)}%
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                from previous month
              </span>
            </p>
          </div>
        </div>

        <div className="h-[280px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, bottom: 5, left: 10 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E2E8F0"
              />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: "#64748B" }}
                dy={10}
                minTickGap={30}
                tickFormatter={(str) => {
                  const date = new Date(str);
                  if (isNaN(date.getTime())) return str;
                  return date.toLocaleDateString("en-GB", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: "#64748B" }}
                width={45}
                allowDecimals={false}
                domain={yDomain}
                tickFormatter={(value) =>
                  new Intl.NumberFormat("en-GB", {
                    notation: "compact",
                    compactDisplay: "short",
                  }).format(value)
                }
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                labelFormatter={(label) => new Date(label).toDateString()}
                formatter={(val: number | undefined) => {
                  if (val === undefined) return ["", title];
                  return [
                    isCurrency
                      ? `৳${formatNumber(val)}`
                      : isPercentage
                        ? `${formatNumber(val)}%`
                        : formatNumber(val),
                    title,
                  ];
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={metricColor}
                strokeWidth={2}
                connectNulls={true}
                dot={{
                  r: 3,
                  fill: "#fff",
                  strokeWidth: 2,
                  stroke: metricColor,
                }}
                activeDot={{ r: 5, fill: metricColor, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {renderSpecializedList()}
      </div>
    </Drawer>
  );
}
