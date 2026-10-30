import { ArrowRight, BarChart3, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { reports } from "./constants/reports";

export default function ReportsPage() {
  return (
    <div className="space-y-5 sm:space-y-6">
      <header className="overflow-hidden rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50 via-white to-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3.5">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary-600 text-white shadow-lg shadow-primary-600/20">
              <BarChart3 className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-700">
                Financial intelligence
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                Reports
              </h1>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                Explore financial performance, balances, spending patterns, and
                category trends.
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 self-start rounded-xl border border-primary-100 bg-white/90 px-3 py-2 text-sm font-semibold text-primary-700 shadow-sm sm:self-auto">
            <Sparkles className="h-4 w-4" />
            {reports.length} insights
          </div>
        </div>
      </header>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <Link
              key={report.id}
              to={`/reports/${report.id}`}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-md"
            >
              <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500 to-primary-300 opacity-0 transition group-hover:opacity-100" />
              <div className="flex items-start justify-between gap-4">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-50 text-primary-600">
                  <Icon className="h-5 w-5" />
                </span>
                <ArrowRight className="h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-primary-600" />
              </div>
              <h2 className="mt-5 text-lg font-semibold text-slate-900">
                {report.title}
              </h2>
              <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">
                {report.description}
              </p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600">
                Open report{" "}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
