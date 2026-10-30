import type { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import type { AccountRow } from "../types";

export const getAccountColumns = (
  onEdit: (row: AccountRow) => void,
): ColumnDef<AccountRow>[] => [
  {
    accessorKey: "serial",
    header: "SL",
    cell: ({ row }) => row.original.serial,
  },
  {
    accessorKey: "name",
    header: "Account",
    cell: ({ row }) => (
      <div>
        <p className="font-semibold text-slate-900">{row.original.name}</p>
        <p className="account-mobile-id text-xs text-slate-500">
          Account ID: {row.original.id}
        </p>
        <p className="account-mobile-balance">
          {row.original.currentBalanceLabel}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "institutionLabel",
    header: "Institution",
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-slate-700">
          {row.original.institutionLabel}
        </p>
        <p className="text-xs text-slate-500">{row.original.updatedAtLabel}</p>
      </div>
    ),
  },
  {
    accessorKey: "typeLabel",
    header: "Type",
    cell: ({ row }) => (
      <span className="inline-flex rounded-full border border-primary-200 bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700">
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
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => (
      <span
        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${row.original.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
      >
        {row.original.isActive ? "Active" : "Inactive"}
      </span>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <button
        onClick={() => onEdit(row.original)}
        className="rounded-md p-2 text-primary-600 hover:bg-primary-50"
        aria-label={`Edit ${row.original.name}`}
      >
        <Pencil className="h-4 w-4" />
      </button>
    ),
  },
];
