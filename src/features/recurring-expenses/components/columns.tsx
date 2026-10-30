import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Play } from "lucide-react";
export const getRecurringExpenseColumns = (
  onEdit: (row: any) => void,
  onRun: (row: any) => void,
): ColumnDef<any>[] => [
  { accessorKey: "serial", header: "SL" },
  {
    id: "plan",
    header: "Plan",
    cell: ({ row }) => (
      <div>
        <p className="font-semibold text-slate-900">
          {row.original.titleLabel}
        </p>
        <p className="text-xs text-slate-500">
          Recurring ID: {row.original.id}
        </p>
      </div>
    ),
  },
  { accessorKey: "accountLabel", header: "Account" },
  { accessorKey: "categoryLabel", header: "Category" },
  {
    accessorKey: "frequencyLabel",
    header: "Frequency",
    cell: ({ row }) => (
      <span className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700">
        {row.original.frequencyLabel}
      </span>
    ),
  },
  { accessorKey: "nextRunLabel", header: "Next Run" },
  {
    accessorKey: "amountLabel",
    header: "Amount",
    meta: { headerClassName: "text-right", className: "px-3 py-2 text-right" },
  },
  {
    accessorKey: "statusLabel",
    header: "Status",
    cell: ({ row }) => (
      <span
        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${row.original.statusLabel === "Active" ? "bg-emerald-50 text-emerald-700" : row.original.statusLabel === "Due Now" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"}`}
      >
        {row.original.statusLabel}
      </span>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <div className="flex gap-1">
        <button
          onClick={() => onEdit(row.original)}
          className="rounded p-2 text-primary-600 hover:bg-primary-50"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          disabled={!row.original.is_active}
          onClick={() => onRun(row.original)}
          className="rounded p-2 text-emerald-600 hover:bg-emerald-50 disabled:opacity-40"
        >
          <Play className="h-4 w-4" />
        </button>
      </div>
    ),
  },
];
