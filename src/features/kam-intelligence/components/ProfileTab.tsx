import { useState } from "react";
import {
  type Merchant,
  profiles,
  profileData,
  months,
  fmt,
  merchants as allMerchants,
  monthlyOverviews,
} from "../data";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { HistoricalSegmentOverview } from "./HistoricalSegmentOverview";
import { PortfolioSegmentInfo } from "./PortfolioSegmentInfo";

interface ProfileTabProps {
  data: Merchant[];
  onOpenDrawer: (id: number) => void;
  onOpenSegmentDrawer: (
    segment: string | null,
    trend?: string | null,
    count?: number | null,
    month?: string | null,
  ) => void;
}

const PORTFOLIO_BAR_COLORS = [
  "#295cab",
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#06b6d4",
  "#f59e0b",
  "#ec4899",
  "#6366f1",
  "#14b8a6",
  "#f97316",
];

export function ProfileTab({
  data,
  onOpenDrawer,
  onOpenSegmentDrawer,
}: ProfileTabProps) {
  const [countSegment, setCountSegment] = useState(
    "High Value Irregular Merchants",
  );
  const [gmvSegment, setGmvSegment] = useState(
    "High Value Irregular Merchants",
  );
  const handleHealthClick = (
    category: string,
    _month: string,
    count: number,
  ) => {
    // Pass the category name as the 'profile' and the exact count
    onOpenSegmentDrawer(category, null, count);
  };

  function renderBarChart(profile: string, mode: "count" | "gmv") {
    const arr = profileData[profile][mode];
    const chartData = months.map((m, i) => ({
      name: m.split(" ")[0],
      value: arr[i],
    }));

    // Use different colors for Merchant Count vs GMV
    const color = mode === "count" ? "#295cab" : "#10b981"; // Blue for Count, Emerald for GMV

    return (
      <div className="h-[260px] w-full mt-4 select-none outline-none [&_*]:outline-none">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            tabIndex={-1}
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
              tick={{ fill: "#64748b", fontSize: 11 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 11 }}
            />
            <Tooltip
              cursor={{ fill: "#f8fafc" }}
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                fontSize: "12px",
                fontWeight: "600",
              }}
              formatter={(value: any) => [
                mode === "gmv" ? fmt(value * 10000000) : value.toLocaleString(),
                mode === "gmv" ? "GMV" : "Merchants",
              ]}
            />
            <Bar
              dataKey="value"
              fill={color}
              radius={[4, 4, 0, 0]}
              barSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Historical Segment Overview */}
      <HistoricalSegmentOverview
        data={monthlyOverviews}
        onOpenHealthDrawer={handleHealthClick}
        onOpenSegmentDrawer={onOpenSegmentDrawer}
      />

      {/* Segment Distribution */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-slate-900">
            Segment Distribution
          </h2>
          <PortfolioSegmentInfo />
        </div>
        <p className="text-sm text-slate-500 mb-4">
          Merchant count and GMV split across profiles, month by month
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Merchant Count Chart */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Merchant Count by Segment
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Monthly distribution for selected segment
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={countSegment}
                onChange={(e) => setCountSegment(e.target.value)}
                className="px-3 pr-10 py-1.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-primary-500 outline-none w-fit max-w-full field-sizing-content font-medium text-slate-700 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%2364748b%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat"
              >
                {profiles.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
          {renderBarChart(countSegment, "count")}
        </div>

        {/* GMV Chart */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                GMV by Segment
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Volume breakdown month by month
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={gmvSegment}
                onChange={(e) => setGmvSegment(e.target.value)}
                className="px-3 pr-10 py-1.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-primary-500 outline-none w-fit max-w-full field-sizing-content font-medium text-slate-700 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%2364748b%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat"
              >
                {profiles.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
          {renderBarChart(gmvSegment, "gmv")}
        </div>
      </div>

      {/* Portfolio Analysis */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Portfolio Analysis
        </h2>
        <p className="text-sm text-slate-500 mb-4">
          Ranked merchant GMV by volume
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">
          Ranked Merchant GMV
        </h3>
        {(() => {
          const sorted = [...allMerchants]
            .sort((a, b) => b.gmv - a.gmv)
            .slice(0, 10);
          const max = Math.max(...sorted.map((x) => x.gmv), 1);
          return (
            <div className="space-y-3">
              {sorted.map((m, index) => (
                <div
                  key={m.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onOpenDrawer(m.id)}
                  onKeyDown={(e) => e.key === "Enter" && onOpenDrawer(m.id)}
                  className="grid grid-cols-[150px_1fr_80px] gap-3 items-center text-sm cursor-pointer rounded-lg px-1 -mx-1 hover:bg-slate-50 transition-colors"
                >
                  <span className="text-slate-700 truncate">{m.name}</span>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(m.gmv / max) * 100}%`,
                        backgroundColor:
                          PORTFOLIO_BAR_COLORS[
                            index % PORTFOLIO_BAR_COLORS.length
                          ],
                      }}
                    />
                  </div>
                  <b className="text-slate-700 text-right">{fmt(m.gmv)}</b>
                </div>
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
