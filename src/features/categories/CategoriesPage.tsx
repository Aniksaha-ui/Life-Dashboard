import { Plus, RefreshCcw } from "lucide-react";
import { useState } from "react";
import { MetricCard } from "../../components/MetricCard";
import type { CategoryRow } from "./types";
import { CategoryForm } from "./components/CategoryForm";
import { CategoryTable } from "./components/CategoryTable";
import { useCategories } from "./hooks/useCategories";

const filters = [
  ["all", "All Categories"],
  ["EXPENSE", "Expense"],
  ["INCOME", "Income"],
] as const;
export default function CategoriesPage() {
  const {
    rows,
    metrics,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    isLoading,
    refresh,
    save,
  } = useCategories();
  const [editingCategory, setEditingCategory] = useState<CategoryRow | null>(
    null,
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const openCreate = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };
  const openEdit = (category: CategoryRow) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Category Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Create and update the income and expense categories used across
            transactions, reports, and recurring expenses.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          New Category
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Categories"
          value={isLoading ? "..." : metrics.total}
          className="border-blue-100"
        />
        <MetricCard
          title="Expense Categories"
          value={isLoading ? "..." : metrics.expense}
          className="border-amber-100"
        />
        <MetricCard
          title="Income Categories"
          value={isLoading ? "..." : metrics.income}
          className="border-emerald-100"
        />
        <MetricCard
          title="Custom Categories"
          value={isLoading ? "..." : metrics.custom}
          className="border-cyan-100"
        />
      </div>
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {filters.map(([value, label]) => (
              <button
                key={value}
                onClick={() => setTypeFilter(value)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${typeFilter === value ? "bg-primary-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="min-w-0 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-500"
              placeholder="Search categories"
            />
            <button
              onClick={() => void refresh()}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>
      </section>
      <CategoryTable rows={rows} isLoading={isLoading} onEdit={openEdit} />
      <CategoryForm
        category={editingCategory}
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={save}
      />
    </div>
  );
}
