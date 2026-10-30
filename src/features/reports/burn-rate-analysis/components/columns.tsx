import type { ColumnDef } from "@tanstack/react-table";
import type { BurnRateRow } from "../types";

export const burnRateColumns: ColumnDef<BurnRateRow>[] = [
  { accessorKey: "serial", header: "SL" },
  {
    accessorKey: "monthLabel",
    header: "Month",
    cell: ({ row }) => (
      <span className="font-semibold text-slate-900">
        {row.original.monthLabel}
      </span>
    ),
  },
  {
    accessorKey: "totalExpenseLabel",
    header: "Total Expense",
    cell: ({ row }) => (
      <span className="font-semibold text-rose-700">
        {row.original.totalExpenseLabel}
      </span>
    ),
    meta: { className: "px-3 py-2 text-right", headerClassName: "text-right" },
  },
  {
    accessorKey: "activeDays",
    header: "Active Days",
    meta: { className: "px-3 py-2 text-right", headerClassName: "text-right" },
  },
  {
    accessorKey: "averageBurnRateLabel",
    header: "Avg Daily Burn",
    meta: { className: "px-3 py-2 text-right", headerClassName: "text-right" },
  },
];
