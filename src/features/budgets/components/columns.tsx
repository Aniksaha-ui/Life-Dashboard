import type { ColumnDef } from "@tanstack/react-table";
import { AlertTriangle, Pencil, Trash2 } from "lucide-react";
import type { BudgetApiItem } from "../types";

const money = (value: unknown) =>
  `BDT ${(Number(value) || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const getBudgetColumns = (
  onEdit: (budget: BudgetApiItem) => void,
  onDelete: (budget: BudgetApiItem) => void,
): ColumnDef<BudgetApiItem>[] => [
  {
    accessorKey: "category_name",
    header: "Category",
    cell: ({ row }) => (
      <div>
        <p className="font-semibold text-slate-900">
          {row.original.category_name || "Uncategorized"}
        </p>
        <p className="mt-0.5 text-xs capitalize text-slate-500">
          {row.original.period_type || "monthly"} budget
        </p>
      </div>
    ),
  },
  {
    id: "period",
    header: "Period",
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-slate-600">
        {row.original.period_start || "—"} to {row.original.period_end || "—"}
      </span>
    ),
  },
  {
    id: "budget",
    header: "Budget",
    meta: { headerClassName: "text-right", className: "text-right" },
    cell: ({ row }) => (
      <span className="font-semibold text-slate-900">
        {money(row.original.effective_budget ?? row.original.amount)}
      </span>
    ),
  },
  {
    id: "spent",
    header: "Spent",
    meta: { headerClassName: "text-right", className: "text-right" },
    cell: ({ row }) => (
      <span className="font-semibold text-slate-700">{money(row.original.spent)}</span>
    ),
  },
  {
    id: "usage",
    header: "Usage",
    cell: ({ row }) => {
      const percentage = Math.max(0, Math.min(100, Number(row.original.progress_percent) || 0));
      const overLimit = row.original.warning_level === "exceeded" || Number(row.original.remaining) < 0;
      const warning = !overLimit && ["watch", "warning"].includes(String(row.original.warning_level));
      const tone = overLimit ? "bg-rose-500" : warning ? "bg-amber-500" : "bg-emerald-500";
      return (
        <div className="min-w-32">
          <div className="mb-1 flex items-center justify-between gap-2 text-xs"><span className="font-semibold text-slate-600">{percentage}%</span><span className={overLimit ? "text-rose-600" : warning ? "text-amber-600" : "text-emerald-700"}>{overLimit ? "Over limit" : "On track"}</span></div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${tone}`} style={{ width: `${percentage}%` }} /></div>
        </div>
      );
    },
  },
  {
    id: "remaining",
    header: "Remaining",
    meta: { headerClassName: "text-right", className: "text-right" },
    cell: ({ row }) => {
      const remaining = Number(row.original.remaining) || 0;
      return <span className={remaining < 0 ? "font-semibold text-rose-600" : "font-semibold text-emerald-700"}>{money(remaining)}</span>;
    },
  },
  {
    id: "actions",
    header: "",
    meta: { className: "text-right" },
    cell: ({ row }) => (
      <div className="flex justify-end gap-1">
        {(["watch", "warning", "exceeded"].includes(String(row.original.warning_level))) && <span className="grid h-8 w-8 place-items-center text-amber-600" title="Budget needs attention"><AlertTriangle className="h-4 w-4" /></span>}
        <button type="button" onClick={() => onEdit(row.original)} aria-label="Edit budget" className="rounded-lg p-2 text-primary-600 hover:bg-primary-50"><Pencil className="h-4 w-4" /></button>
        <button type="button" onClick={() => onDelete(row.original)} aria-label="Delete budget" className="rounded-lg p-2 text-rose-600 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>
      </div>
    ),
  },
];
