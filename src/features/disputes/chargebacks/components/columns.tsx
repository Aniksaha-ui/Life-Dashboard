import type { ColumnDef } from "@tanstack/react-table";
import clsx from "clsx";
import { CopyButton } from "../../../../components/CopyButton";
import type { ChargebackApiItem } from "../types";

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case "Approved":
    case "Approve":
      return "bg-emerald-50 text-emerald-600";
    case "Rejected":
    case "Deny":
      return "bg-rose-50 text-rose-600";
    case "Pending":
    case "Processing":
      return "bg-amber-50 text-amber-600";
    default:
      return "bg-slate-100 text-slate-500";
  }
};

const formatDate = (dateString: string) => {
  if (!dateString || dateString === "0000-00-00 00:00:00") return "N/A";
  try {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  } catch {
    return "N/A";
  }
};

export const getColumns = (
  onViewDetails: (id: number) => void,
): ColumnDef<ChargebackApiItem>[] => [
  {
    accessorKey: "request_on",
    header: "REQUESTED",
    cell: ({ row }) => (
      <div className="text-xs font-normal text-slate-600">
        {formatDate(row.original.request_on)}
      </div>
    ),
  },
  {
    accessorKey: "incommingtime",
    header: "TXN DATE",
    cell: ({ row }) => (
      <div className="text-xs font-normal text-slate-600">
        {formatDate(row.original.incommingtime)}
      </div>
    ),
  },
  {
    accessorKey: "transaction_id",
    header: "TXN ID",
    size: 160,
    cell: ({ row }) => (
      <div className="text-xs text-slate-600 font-medium max-w-[160px] break-all whitespace-normal">
        {row.original.transaction_id || "-"}
      </div>
    ),
  },
  {
    accessorKey: "chargeback_reference_id",
    header: "CHARGEBACK REF. ID",
    cell: ({ row }) => (
      <div className="text-xs font-medium text-slate-600">
        {row.original.chargeback_reference_id || "-"}
      </div>
    ),
  },
  {
    header: "MERCHANT",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-xs text-slate-800 font-medium">
          {row.original.merchant_name}
        </span>
        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
          {row.original.merchant_id}
          <CopyButton value={row.original.merchant_id} />
        </div>
      </div>
    ),
  },
  {
    header: "STORE",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-xs text-slate-800 font-medium">
          {row.original.store_name} - {row.original.store_id}
        </span>
        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
          {row.original.msslid}
          <CopyButton value={row.original.msslid} />
        </div>
      </div>
    ),
  },
  {
    header: "STAGE",
    cell: ({ row }) => (
      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-medium whitespace-nowrap">
        {row.original.stage_label ?? ""}
      </span>
    ),
  },
  {
    accessorKey: "chargeback_amount",
    header: "AMOUNT",
    cell: ({ row }) => (
      <div className="text-xs font-medium text-slate-900 tabular-nums">
        ৳
        {Math.abs(row.original.chargeback_amount).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </div>
    ),
  },
  {
    accessorKey: "approved_status_label",
    header: "Status",
    cell: ({ row }) => (
      <span
        className={clsx(
          "px-2 py-0.5 rounded-full text-xs font-medium capitalize whitespace-nowrap inline-block",
          getStatusBadgeClass(row.original.approved_status_label),
        )}
      >
        {row.original.approved_status_label}
      </span>
    ),
  },
  {
    id: "actions",
    header: "ACTION",
    cell: ({ row }) => (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onViewDetails(row.original.chargeback_id);
        }}
        className="text-primary-600 hover:text-primary-700 font-medium text-xs transition-colors hover:underline"
      >
        Details
      </button>
    ),
  },
];
