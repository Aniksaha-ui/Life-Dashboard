import type { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
export const getTransferColumns = (
  onEdit: (row: any) => void,
): ColumnDef<any>[] => [
  { accessorKey: "serial", header: "SL" },
  {
    id: "transfer",
    header: "Transfer",
    cell: ({ row }) => (
      <div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${row.original.withdrawal ? "bg-amber-50 text-amber-700" : "bg-primary-50 text-primary-700"}`}
        >
          {row.original.withdrawal ? "Withdraw To Cash" : "Transfer"}
        </span>
        <p className="mt-1 text-sm text-slate-700">
          {row.original.note || "No note added"}
        </p>
      </div>
    ),
  },
  { accessorKey: "fromName", header: "Source" },
  { accessorKey: "toName", header: "Destination" },
  { accessorKey: "dateLabel", header: "Date" },
  {
    accessorKey: "amountLabel",
    header: "Amount",
    cell: ({ row }) => (
      <span className="font-semibold text-slate-900">
        {row.original.amountLabel}
      </span>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <button
        onClick={() => onEdit(row.original)}
        className="rounded p-2 text-primary-600 hover:bg-primary-50"
      >
        <Pencil className="h-4 w-4" />
      </button>
    ),
  },
];
