import { AlertTriangle, ArrowLeft, UserMinus, Users } from "lucide-react";
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

export default function PortfolioHealth() {
  const navigate = useNavigate();

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
            Portfolio Health
          </h1>
          <p className="text-slate-500 text-sm">
            Merchant engagement and retention metrics.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-slate-500 uppercase">
              Active Merchants
            </p>
            <Users className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900">1,240</p>
          <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
            ↑ +12 new this month
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-slate-500 uppercase">
              Non-Transacting (30d+)
            </p>
            <UserMinus className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900">45</p>
          <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
            ↑ Requires outreach
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-slate-500 uppercase">
              Churn Risk
            </p>
            <AlertTriangle className="w-5 h-5 text-rose-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900">12</p>
          <p className="text-xs text-slate-500 mt-1">
            Declining volume &gt; 50%
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Funnel Stub */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-semibold text-slate-900 mb-6">
            Onboarding Conversion Funnel
          </p>
          <div className="h-64 flex items-end justify-between px-8 relative">
            {/* Funnel Visual Custom */}
            <div className="w-full h-full flex items-end gap-2">
              <div className="flex-1 flex flex-col items-center gap-2 group">
                <span className="text-xs font-semibold text-slate-600 mb-auto mt-2">
                  Sign Up
                </span>
                <span className="text-sm font-bold text-slate-900">100%</span>
                <div className="w-full bg-blue-100 rounded-t h-[90%] relative group-hover:bg-blue-200 transition-colors"></div>
                <span className="text-xs text-slate-400 absolute bottom-2">
                  150
                </span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-2 group">
                <span className="text-xs font-semibold text-slate-600 mb-auto mt-2">
                  Doc Upload
                </span>
                <span className="text-sm font-bold text-slate-900">80%</span>
                <div className="w-full bg-blue-100 rounded-t h-[72%] relative group-hover:bg-blue-200 transition-colors"></div>
                <span className="text-xs text-slate-400 absolute bottom-2">
                  120
                </span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-2 group">
                <span className="text-xs font-semibold text-slate-600 mb-auto mt-2">
                  Verified
                </span>
                <span className="text-sm font-bold text-slate-900">60%</span>
                <div className="w-full bg-blue-500 rounded-t h-[54%] relative group-hover:bg-blue-600 transition-colors shadow-lg"></div>
                <span className="text-xs text-white absolute bottom-2 font-medium">
                  90
                </span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-2 group">
                <span className="text-xs font-semibold text-slate-600 mb-auto mt-2">
                  Live Tx
                </span>
                <span className="text-sm font-bold text-slate-900">45%</span>
                <div className="w-full bg-emerald-500 rounded-t h-[40%] relative group-hover:bg-emerald-600 transition-colors shadow-lg"></div>
                <span className="text-xs text-white absolute bottom-2 font-medium">
                  68
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Work Created vs Resolved */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-semibold text-slate-900 mb-6">
            KAM Workload: Created vs Resolved
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: "Week 1", created: 45, resolved: 40 },
                  { name: "Week 2", created: 52, resolved: 48 },
                  { name: "Week 3", created: 38, resolved: 45 },
                  { name: "Week 4", created: 60, resolved: 50 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
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
                <Bar
                  dataKey="created"
                  fill="#94a3b8"
                  name="Tasks Created"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="resolved"
                  fill="#10b981"
                  name="Tasks Resolved"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900 mb-4">
          High Failure Merchants
        </h3>
        <p className="text-sm text-slate-500">
          Merchants with failure rate &gt; 20% in last 7 days.
        </p>
        {/* Table stub */}
        <div className="mt-4 border rounded-md overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-3">Merchant</th>
                <th className="p-3">Failure Rate (7d)</th>
                <th className="p-3">Top Reason</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              <tr>
                <td className="p-3 font-medium text-slate-900">
                  Dhaka Electronics
                </td>
                <td className="p-3 text-rose-600 font-bold">24.5%</td>
                <td className="p-3 text-slate-500">Auth Declined</td>
                <td className="p-3">
                  <button className="text-primary-600 text-xs font-semibold hover:underline">
                    Investigate
                  </button>
                </td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-slate-900">
                  Fashion House BD
                </td>
                <td className="p-3 text-rose-600 font-bold">18.2%</td>
                <td className="p-3 text-slate-500">Insufficient Funds</td>
                <td className="p-3">
                  <button className="text-primary-600 text-xs font-semibold hover:underline">
                    Investigate
                  </button>
                </td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-slate-900">
                  TechMart Online
                </td>
                <td className="p-3 text-rose-600 font-bold">15%</td>
                <td className="p-3 text-slate-500">3DS Failure</td>
                <td className="p-3">
                  <button className="text-primary-600 text-xs font-semibold hover:underline">
                    Investigate
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
