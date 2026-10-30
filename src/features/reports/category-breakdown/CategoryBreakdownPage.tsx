import { ArrowLeft, PieChart, Tags, Wallet } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ReportLoadingOverlay } from "../components/ReportLoadingOverlay";
import { CategoryBreakdownChart } from "./components/CategoryBreakdownChart";
import { CategoryBreakdownFilters } from "./components/CategoryBreakdownFilters";
import { CategoryBreakdownTable } from "./components/CategoryBreakdownTable";
import { useCategoryBreakdown } from "./hooks/useCategoryBreakdown";

function CategoryBreakdownContent({
  state,
}: {
  state: ReturnType<typeof useCategoryBreakdown>;
}) {
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const metrics = [
    {
      label: "Tracked Categories",
      value: state.metrics.totalCategoriesLabel,
      icon: Tags,
      tone: "bg-primary-50 text-primary-700",
    },
    {
      label: "Total Spend",
      value: state.metrics.totalSpendLabel,
      icon: Wallet,
      tone: "bg-amber-50 text-amber-700",
    },
    {
      label: "Top Category",
      value: state.metrics.topCategoryLabel,
      icon: PieChart,
      tone: "bg-cyan-50 text-cyan-700",
    },
    {
      label: "Top Share",
      value: state.metrics.topShareLabel,
      icon: PieChart,
      tone: "bg-emerald-50 text-emerald-700",
    },
  ];
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
          Spend composition
        </p>
        <h2 className="mt-1 text-xl font-bold text-slate-900">
          See what is driving the spend
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Compare category contribution, then focus the graph on the categories
          that matter most.
        </p>
      </section>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <article
              key={metric.label}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <span
                className={`grid h-10 w-10 place-items-center rounded-xl ${metric.tone}`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {metric.label}
              </p>
              <p className="mt-1 text-xl font-bold text-slate-900">
                {metric.value}
              </p>
            </article>
          );
        })}
      </section>
      <CategoryBreakdownChart
        rows={state.rows}
        hiddenIds={hiddenIds}
        onToggle={(id) =>
          setHiddenIds((current) =>
            current.includes(id)
              ? current.filter((value) => value !== id)
              : [...current, id],
          )
        }
        onShowAll={() => setHiddenIds([])}
      />
      <CategoryBreakdownTable
        rows={state.rows}
        search={state.search}
        onSearchChange={state.setSearch}
      />
    </div>
  );
}

export default function CategoryBreakdownPage() {
  const state = useCategoryBreakdown();
  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-white p-5 shadow-sm sm:p-6">
        <Link
          to="/reports"
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700"
        >
          <ArrowLeft className="h-4 w-4" />
          All reports
        </Link>
        <h1 className="mt-3 flex items-center gap-2 text-2xl font-bold text-slate-900">
          <PieChart className="h-6 w-6 text-cyan-700" />
          Category Breakdown
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Compare category contribution and identify where your money is being
          allocated.
        </p>
      </header>
      <CategoryBreakdownFilters
        fromDate={state.fromDate}
        toDate={state.toDate}
        typeFilter={state.typeFilter}
        loading={state.loading}
        onFromDateChange={state.setFromDate}
        onToDateChange={state.setToDate}
        onTypeChange={state.setTypeFilter}
        onClear={() => {
          state.setFromDate(state.defaultDateRange.fromDate);
          state.setToDate(state.defaultDateRange.toDate);
          state.setTypeFilter("all");
          state.setSearch("");
        }}
        onRefresh={() => void state.refresh()}
      />
      {state.loading ? (
        <ReportLoadingOverlay />
      ) : (
        <CategoryBreakdownContent state={state} />
      )}
    </div>
  );
}
