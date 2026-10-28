import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

export default function PaymentsAnalytics() {
  const navigate = useNavigate();

  const data = [
    { name: "Jan 1", success: 4000, failed: 2400 },
    { name: "Jan 2", success: 3000, failed: 1398 },
    { name: "Jan 3", success: 2000, failed: 9800 },
    { name: "Jan 4", success: 2780, failed: 3908 },
    { name: "Jan 5", success: 1890, failed: 4800 },
    { name: "Jan 6", success: 2390, failed: 3800 },
    { name: "Jan 7", success: 3490, failed: 4300 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/analytics")}
          className="p-2 hover:bg-slate-100 rounded-full text-slate-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Payments Analytics
          </h1>
          <p className="text-slate-500 text-sm">
            Performance metrics for transaction processing.
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Gross Volume
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-2">৳45.2M</p>
          <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
            ↑ 12% vs last period
          </p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Success Rate
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-2">84.5%</p>
          <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
            ↑ 0.5% vs last period
          </p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Refunds
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-2">1.2%</p>
          <p className="text-xs text-slate-500 font-medium mt-1">Stable</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Disputes
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-2">0.04%</p>
          <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
            ↑ High Severity
          </p>
        </div>
      </div>

      {/* Layout: Full Width Main content */}
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-semibold text-slate-900 mb-6">
            Volume & Success Rate
          </p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <Tooltip
                  formatter={(
                    value: number | undefined,
                    name: string | undefined,
                  ) => [
                    value?.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }) || "",
                    name || "",
                  ]}
                />
                <Legend />
                <Bar dataKey="success" fill="#295cab" name="Successful" />
                <Bar dataKey="failed" fill="#ef4444" name="Failed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-sm font-semibold text-slate-900 mb-6">
              By Payment Method
            </p>
            <div className="space-y-4">
              {[
                { n: "VISA", v: 45 },
                { n: "Mastercard", v: 30 },
                { n: "bKash", v: 15 },
                { n: "Nagad", v: 10 },
              ].map((i) => (
                <div key={i.n}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{i.n}</span>
                    <span className="font-medium">{i.v}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-slate-700 h-2 rounded-full"
                      style={{ width: `${i.v}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-sm font-semibold text-slate-900 mb-6">
              Failure Reasons
            </p>
            <div className="space-y-4">
              {[
                { n: "Insufficient Funds", v: 40 },
                { n: "Do Not Honor", v: 15 },
                { n: "Lost Card", v: 5 },
              ].map((i) => (
                <div key={i.n}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{i.n}</span>
                    <span className="font-medium">{i.v}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-rose-500 h-2 rounded-full"
                      style={{ width: `${i.v}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
