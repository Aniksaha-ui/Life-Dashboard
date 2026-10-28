import { clsx } from "clsx";
import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import {
  ChevronDown,
  TrendingUp,
  AlertCircle,
  BarChart3,
  Activity,
} from "lucide-react";
import { profiles, months, trendData } from "../data";
import { PortfolioSegmentInfo } from "./PortfolioSegmentInfo";
import { PortfolioTrendInfo } from "./PortfolioTrendInfo";

interface TrendTabProps {
  onOpenSegmentDrawer: (
    profile: string | null,
    trend: string | null,
    count?: number | null,
    month?: string | null,
  ) => void;
}

export function TrendTab({ onOpenSegmentDrawer }: TrendTabProps) {
  const [healthProfile, setHealthProfile] = useState(
    "High Value Irregular Merchants",
  );

  const chartColors = ["#93c5fd", "#60a5fa", "#3b82f6", "#2563eb"];

  const getHealthDataOriginal = (p: string) => {
    const growth =
      p === "High Value Irregular Merchants"
        ? [62, 64, 81, 71]
        : [80, 82, 79, 81];
    const risk =
      p === "High Value Irregular Merchants"
        ? [36, 34, 18, 28]
        : [17, 14, 18, 16];
    const net = growth.map((g, i) => g - risk[i]);
    return { growth, risk, net };
  };

  const health = getHealthDataOriginal(healthProfile);
  const pts = (a: number[]) =>
    a.map((v, i) => `${35 + i * 140},${185 - v * 1.8}`).join(" ");

  // Transform trendData for Recharts
  const distributionData = Object.entries(trendData).map(([t, arr]) => ({
    name: t,
    Jan: arr[0],
    Feb: arr[1],
    Mar: arr[2],
    Apr: arr[3],
  }));

  // Heatmap data
  const heatTrends = [
    "Growth",
    "Recovering",
    "Stable",
    "Weak",
    "Decline",
    "Rapid Fall",
    "Zero Success",
  ];
  const heatProfiles = profiles.slice(0, 7);

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-slate-900">Trend Analysis</h2>
          <PortfolioTrendInfo wide />
        </div>
        <p className="text-sm text-slate-500">
          Deep-dive into merchant lifecycle movements and health signals
        </p>
      </div>

      {/* Distribution Overview */}
      <div className="space-y-6">
        {/* Status Trend Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 gap-3">
          {Object.keys(trendData).map((t) => (
            <div
              key={t}
              onClick={() => onOpenSegmentDrawer(t)}
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm group hover:border-primary-400 cursor-pointer transition-all hover:shadow-md active:scale-95"
            >
              <span className="text-[10px] font-bold text-slate-500 group-hover:text-primary-600 uppercase tracking-widest leading-none block mb-3 transition-colors">
                {t}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-slate-900">
                  {trendData[t][3]}
                </span>
                <span className="text-[10px] font-medium text-slate-400">
                  Merchants
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Segment x Trend Heatmap */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
        <div className="flex items-center gap-2 mb-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Segment X Trend Correlation
          </h3>
          <PortfolioSegmentInfo />
          <PortfolioTrendInfo wide />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                <th className="p-2 w-40"></th>
                {heatProfiles.map((p) => (
                  <th
                    key={p}
                    className="p-3 text-center border-b-2 border-slate-100 min-w-[100px]"
                  >
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                      {p}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {heatTrends.map((t, ri) => (
                <tr key={t}>
                  <td className="p-3 font-bold text-slate-700 border-r-2 border-slate-100 bg-slate-50/50 uppercase tracking-tight">
                    {t}
                  </td>
                  {heatProfiles.map((p, ci) => {
                    const v = (ri * ci + 12) % 15;
                    const level =
                      v > 10 ? 5 : v > 7 ? 4 : v > 4 ? 3 : v > 2 ? 2 : 1;
                    const heatColors: Record<number, string> = {
                      1: "bg-slate-50 text-slate-400",
                      2: "bg-blue-50 text-blue-600",
                      3: "bg-blue-100 text-blue-700 font-semibold",
                      4: "bg-blue-200 text-blue-800 font-bold",
                      5: "bg-primary-500 text-white font-bold",
                    };
                    return (
                      <td key={`${t}-${p}`} className="p-1">
                        <div
                          onClick={() => onOpenSegmentDrawer(p, t)}
                          className={clsx(
                            "h-10 flex items-center justify-center rounded-lg transition-all hover:scale-[1.15] hover:shadow-lg cursor-pointer active:scale-95",
                            heatColors[level],
                          )}
                        >
                          {v}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
