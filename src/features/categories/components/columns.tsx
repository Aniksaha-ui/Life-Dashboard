import type { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import type { CategoryRow } from "../types";

export const getCategoryColumns = (onEdit: (category: CategoryRow) => void): ColumnDef<CategoryRow>[] => [
  { accessorKey: "serial", header: "SL" },
  { accessorKey: "name", header: "Category", cell: ({ row }) => <div><p className="font-semibold text-slate-900">{row.original.name}</p><p className="text-xs text-slate-500">Category ID: {row.original.id}</p></div> },
  { accessorKey: "slug", header: "Slug", cell: ({ row }) => <code className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">{row.original.slug}</code> },
  { accessorKey: "typeLabel", header: "Type", cell: ({ row }) => <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${row.original.type === "INCOME" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>{row.original.typeLabel}</span> },
  { id: "source", header: "Source", cell: ({ row }) => <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${row.original.isDefault ? "bg-primary-50 text-primary-700" : "bg-amber-50 text-amber-700"}`}>{row.original.isDefault ? "Default" : "Custom"}</span> },
  { accessorKey: "updatedAtLabel", header: "Updated" },
  { id: "actions", header: "", cell: ({ row }) => <button onClick={() => onEdit(row.original)} className="rounded-md p-2 text-primary-600 hover:bg-primary-50" aria-label={`Edit ${row.original.name}`}><Pencil className="h-4 w-4" /></button> },
];
