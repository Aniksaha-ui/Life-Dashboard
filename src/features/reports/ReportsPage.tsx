import { ArrowRight, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { reports } from "./constants/reports";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <BarChart3 className="h-6 w-6 text-primary-600" />
          Reports
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Explore financial performance, balances, spending patterns, and
          category trends.
        </p>
      </header>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <Link
              key={report.id}
              to={`/reports/${report.id}`}
              className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-md"
            >
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
              <span className="mt-5 inline-block text-sm font-semibold text-primary-600">
                View report
              </span>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
