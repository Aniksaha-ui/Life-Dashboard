import type { ColumnDef } from "@tanstack/react-table";
import type { AccountBalanceRow } from "../types";

const typeTone: Record<string, string> = {
  CASH: "bg-emerald-50 text-emerald-700",
  BANK: "bg-primary-50 text-primary-700",
  CARD: "bg-amber-50 text-amber-700",
  MOBILE_BANKING: "bg-cyan-50 text-cyan-700",
};

export const accountBalanceColumns: ColumnDef<AccountBalanceRow>[] = [
  {
    accessorKey: "name",
    header: "Account",
    cell: ({ row }) => (
      <div>
        <p className="font-semibold text-slate-900">{row.original.name}</p>
        <p className="text-xs text-slate-400">Account ID: {row.original.id}</p>
      </div>
    ),
  },
  { accessorKey: "institutionLabel", header: "Institution" },
  {
    accessorKey: "typeLabel",
    header: "Type",
    cell: ({ row }) => (
      <span
        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${typeTone[row.original.type] ?? "bg-slate-100 text-slate-600"}`}
      >
        {row.original.typeLabel}
      </span>
    ),
  },
  {
    accessorKey: "currentBalanceLabel",
    header: "Current Balance",
    cell: ({ row }) => (
      <span className="font-semibold text-slate-900">
        {row.original.currentBalanceLabel}
      </span>
    ),
    meta: { className: "px-3 py-2 text-right", headerClassName: "text-right" },
  },
  {
    accessorKey: "statusLabel",
    header: "Status",
    cell: ({ row }) => (
      <span
        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${row.original.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
      >
        {row.original.statusLabel}
      </span>
    ),
  },
  { accessorKey: "updatedAtLabel", header: "Updated" },
];
