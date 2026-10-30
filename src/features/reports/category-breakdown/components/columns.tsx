import type { ColumnDef } from "@tanstack/react-table";
import type { CategoryBreakdownRow } from "../types";
export const categoryBreakdownColumns: ColumnDef<CategoryBreakdownRow>[] = [
  { accessorKey: "serial", header: "SL" },
  {
    accessorKey: "categoryName",
    header: "Category",
    cell: ({ row }) => (
      <span className="font-semibold text-slate-900">
        {row.original.categoryName}
      </span>
    ),
  },
  {
    accessorKey: "categoryTypeLabel",
    header: "Type",
    cell: ({ row }) => (
      <span
        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${row.original.categoryType === "INCOME" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}
      >
        {row.original.categoryTypeLabel}
      </span>
    ),
  },
  {
    accessorKey: "totalAmountLabel",
    header: "Total Amount",
    meta: { className: "px-3 py-2 text-right", headerClassName: "text-right" },
  },
  {
    accessorKey: "shareLabel",
    header: "Share",
    meta: { className: "px-3 py-2 text-right", headerClassName: "text-right" },
  },
];
