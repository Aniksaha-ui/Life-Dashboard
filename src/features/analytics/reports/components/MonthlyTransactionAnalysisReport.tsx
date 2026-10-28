import { forwardRef, useImperativeHandle } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import type { ReportSection } from "../reportRegistry";
import type { ReportFilters } from "../reportApi";

interface MonthlyTransactionAnalysisReportProps {
  sections: ReportSection[];
  filters: ReportFilters;
}

export interface MonthlyTransactionAnalysisReportHandle {
  exportData: () => void;
}

export const MonthlyTransactionAnalysisReport = forwardRef<
  MonthlyTransactionAnalysisReportHandle,
  MonthlyTransactionAnalysisReportProps
>(({ sections, filters: _filters }, ref) => {
  const data = sections[0]?.customData || {};
  const { summaryStats, sectorAnalysis, monthlyDecline, analysisTable } = data;

  // Export Functionality
  useImperativeHandle(ref, () => ({
    exportData: () => {
      const headers = [
        "#",
        "Merchant Id",
        "Merchant Name",
        "Sector",
        "Category",
        analysisTable[0]?.prevMonthName || "Prev Month",
        analysisTable[0]?.currentMonthName || "Current Month",
        "MOM % Change",
      ];
      const rows = analysisTable.map((row: any, index: number) => [
        index + 1,
        row.id,
        row.name,
        row.sector || "-",
        row.category,
        row.prevMonthAmount.toFixed(2),
        row.currentMonthAmount.toFixed(2),
        `${row.momChange.toFixed(2)}%`,
      ]);

      const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `monthly_transaction_analysis_${new Date().toISOString().slice(0, 10)}.csv`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
  }));

  const formatCurrency = (value: number) => {
    return value.toLocaleString("en-BD", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Decrease Count
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {summaryStats?.declineCount || 0}
          </p>
          <p className="text-xs text-slate-500 font-medium mt-1 uppercase">
            Total Count
          </p>
        </div>

        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Decrease Percentage
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {(summaryStats?.declinePercentage || 0).toFixed(2)}%
          </p>
          <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1 uppercase">
            ↓ Volume decrease
          </p>
        </div>

        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Increase Count
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {summaryStats?.increaseCount || 245}
          </p>
          <p className="text-xs text-slate-500 font-medium mt-1 uppercase">
            Total Count
          </p>
        </div>

        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Increase Percentage
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {(summaryStats?.increasePercentage || 32.15).toFixed(2)}%
          </p>
          <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1 uppercase">
            ↑ Volume increase
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-semibold text-slate-900 mb-6">
            Sector wise Transaction Analysis
          </p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sectorAnalysis}
                margin={{ top: 0, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="sector"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  domain={[0, "auto"]}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar
                  dataKey="count"
                  name="Decrease"
                  fill="#d34a5d"
                  radius={[4, 4, 0, 0]}
                  barSize={200}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Line Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-semibold text-slate-900 mb-6">
            Merchant Count wise Analysis
          </p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={monthlyDecline}
                margin={{ top: 0, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="period"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  height={40}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Merchants Count"
                  stroke="#8b322c"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: "#8b322c",
                    strokeWidth: 2,
                    stroke: "#fff",
                  }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-900 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-bold">#</th>
                <th className="px-4 py-3 font-bold">Merchant Name</th>
                <th className="px-4 py-3 font-bold">
                  {analysisTable[0]?.prevMonthName || "Prev Month"}
                </th>
                <th className="px-4 py-3 font-bold">
                  {analysisTable[0]?.currentMonthName || "Current Month"}
                </th>
                <th className="px-4 py-3 font-bold">MOM % Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {analysisTable.map((row: any, index: number) => (
                <tr
                  key={row.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-4 py-4 text-slate-600 font-medium">
                    {index + 1}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900 leading-tight">
                        {row.name}
                      </span>
                      <div className="text-[11px] text-slate-500 font-normal flex items-center gap-1 mt-0.5">
                        {row.id}
                        {row.sector && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 uppercase tracking-wider ml-1.5">
                            {row.sector}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-900">
                    {formatCurrency(row.prevMonthAmount)}
                  </td>
                  <td className="px-4 py-4 text-slate-900">
                    {formatCurrency(row.currentMonthAmount)}
                  </td>
                  <td className="px-4 py-4">
                    <div
                      className={`flex items-center gap-1 font-bold ${row.momChange < 0 ? "text-[#d34a5d]" : "text-emerald-600"}`}
                    >
                      {row.momChange < 0 ? "↓" : "↑"} {row.momChange.toFixed(2)}
                      %
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});

MonthlyTransactionAnalysisReport.displayName =
  "MonthlyTransactionAnalysisReport";
