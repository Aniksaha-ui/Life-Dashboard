import { ArrowDownRight, ArrowUpRight, Landmark, Wallet } from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SummaryReport } from "../types";

const money = (value: number) =>
  `BDT ${value.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

export function SummaryVisualization({ report }: { report: SummaryReport }) {
  const cashFlow = [
    { name: "Income", value: report.totalIncome, fill: "#059669" },
    { name: "Expenses", value: report.totalExpense, fill: "#e11d48" },
    { name: "Withdrawals", value: report.totalWithdraw, fill: "#d97706" },
    { name: "Transfer out", value: report.totalTransferOut, fill: "#295cab" },
  ];
  const outflow = cashFlow.slice(1).filter((item) => item.value > 0);
  const totalOutflow = outflow.reduce((total, item) => total + item.value, 0);
  const netPositive = report.netMovement >= 0;

  return (
    <div className="grid gap-5 xl:grid-cols-[1.35fr_0.85fr]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-700">
          Cash-flow movement
        </p>
        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          Income and outflow at a glance
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Compare what came in with the key ways money moved out.
        </p>
        <div className="mt-5 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cashFlow} margin={{ left: 4, right: 8 }}>
              <XAxis
                dataKey="name"
                tick={{ fill: "#64748b", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(value) =>
                  value >= 1000 ? `${Math.round(value / 1000)}k` : value
                }
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value) => money(Number(value))}
                contentStyle={{ borderRadius: 10, borderColor: "#e2e8f0" }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {cashFlow.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-700">
          Outflow mix
        </p>
        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          Where money went
        </h2>
        <div className="relative mt-4 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={outflow}
                dataKey="value"
                nameKey="name"
                innerRadius={54}
                outerRadius={78}
                paddingAngle={3}
              >
                {outflow.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => money(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs font-medium text-slate-500">Outflow</span>
            <span className="text-sm font-bold text-slate-900">
              {money(totalOutflow)}
            </span>
          </div>
        </div>
        <div className="space-y-2">
          {outflow.length ? (
            outflow.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="flex items-center gap-2 text-slate-600">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  />
                  {item.name}
                </span>
                <span className="font-semibold text-slate-800">
                  {money(item.value)}
                </span>
              </div>
            ))
          ) : (
            <p className="py-3 text-center text-sm text-slate-500">
              No outflow was recorded in this period.
            </p>
          )}
        </div>
      </section>

      <section
        className={`rounded-2xl p-5 text-white shadow-lg xl:col-span-2 ${netPositive ? "bg-gradient-to-br from-emerald-700 to-emerald-600" : "bg-gradient-to-br from-rose-700 to-rose-600"}`}
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/15">
              {netPositive ? (
                <ArrowUpRight className="h-6 w-6" />
              ) : (
                <ArrowDownRight className="h-6 w-6" />
              )}
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/75">
                Net movement
              </p>
              <p className="mt-1 text-2xl font-bold">
                {money(report.netMovement)}
              </p>
              <p className="mt-1 text-sm text-white/80">
                {netPositive
                  ? "Income is ahead of recorded outflows."
                  : "Recorded outflows are higher than income."}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-white/10 px-4 py-3">
              <Wallet className="h-4 w-4 text-white/75" />
              <p className="mt-2 text-white/70">Current balance</p>
              <p className="mt-1 font-bold">{report.currentBalanceLabel}</p>
            </div>
            <div className="rounded-xl bg-white/10 px-4 py-3">
              <Landmark className="h-4 w-4 text-white/75" />
              <p className="mt-2 text-white/70">Accounts</p>
              <p className="mt-1 font-bold">{report.accountCountLabel}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
