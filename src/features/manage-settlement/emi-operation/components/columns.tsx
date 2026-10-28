import type { ColumnDef } from "@tanstack/react-table";
import { clsx } from "clsx";
import { CopyButton } from "../../../../components/CopyButton";
import type { EMIOperationApiItem } from "../types";

// Helper for status badges
export const getStatusColor = (status: number) => {
  switch (status) {
    case 1: // Requested
      return "bg-amber-50 text-amber-600";
    case 0: // Declined
      return "bg-rose-50 text-rose-600";
    case 2: // Processing
      return "bg-blue-50 text-blue-600";
    case 3: // Initial
      return "bg-slate-100 text-slate-500";
    default:
      return "bg-slate-100 text-slate-500";
  }
};

export const getBankStatusColor = (status: string) => {
  switch (status) {
    case "approved":
      return "bg-emerald-50 text-emerald-600";
    case "cancel":
      return "bg-rose-50 text-rose-600";
    case "sent":
      return "bg-blue-50 text-blue-600";
    case "not_sent":
      return "bg-slate-100 text-slate-500";
    default:
      return "bg-slate-100 text-slate-500";
  }
};

interface ColumnHandlers {
  onViewDetail: (id: number) => void;
}

export const getEMIColumns = ({
  onViewDetail,
}: ColumnHandlers): ColumnDef<EMIOperationApiItem>[] => [
  {
    accessorKey: "request_on",
    header: "Requested On",
    cell: ({ row }) => (
      <div className="text-xs font-medium text-slate-900">
        {new Date(row.original.request_on).toLocaleDateString()}
      </div>
    ),
  },
  {
    id: "emi_ref_id",
    header: "EMI Ref. Id",
    cell: ({ row }) => (
      <div className="text-xs space-y-0.5">
        <div className="font-mono text-[10px] text-slate-500 mb-1">
          {row.original.emi_ref_id}
        </div>
        <div className="text-slate-500">
          Bank: {row.original.emi_issuer_bank_name}
        </div>
        <div className="text-slate-500">
          Tenure: {row.original.emi_month_label}
        </div>
      </div>
    ),
  },
  {
    id: "merchant",
    header: "Merchant",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5 group">
        <div>
          <div className="text-xs font-normal text-slate-900">
            {row.original.merchant_name}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5 flex items-center gap-1">
            {row.original.merchant_id}
            <CopyButton value={row.original.merchant_id} />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "store",
    header: "Store",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5 group">
        <div>
          <div className="text-xs text-slate-900 font-normal">
            {row.original.store_name}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5 flex items-center gap-1">
            {row.original.store_id}
            <CopyButton value={row.original.store_id} />
          </div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "transaction_id",
    header: "Transaction ID",
    cell: ({ row }) => (
      <span className="text-xs text-slate-900">
        {row.original.transaction_id}
      </span>
    ),
  },
  {
    accessorKey: "mamount",
    header: () => <div className="text-right">TXN Amount</div>,
    cell: ({ row }) => (
      <div className="text-right text-xs font-medium text-slate-900">
        ৳{Number(row.original.mamount).toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "emi_amount",
    header: () => <div className="text-right">EMI Amount</div>,
    cell: ({ row }) => (
      <div className="text-right text-xs font-medium text-slate-900">
        ৳{Number(row.original.emi_amount).toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "request_status",
    header: "Status",
    cell: ({ row }) => (
      <span
        className={clsx(
          "px-2 py-0.5 rounded-full text-xs font-medium capitalize whitespace-nowrap inline-block",
          getStatusColor(row.original.request_status),
        )}
      >
        {row.original.request_status_label}
      </span>
    ),
  },
  {
    accessorKey: "bank_status",
    header: "Bank Status",
    cell: ({ row }) => (
      <span
        className={clsx(
          "px-2 py-0.5 rounded-full text-xs font-medium capitalize whitespace-nowrap inline-block",
          getBankStatusColor(row.original.bank_status),
        )}
      >
        {row.original.bank_status_label}
      </span>
    ),
  },
  {
    id: "view",
    header: "View",
    cell: ({ row }) => (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onViewDetail(row.original.emi_id);
        }}
        className="text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline px-2 py-1"
      >
        Details
      </button>
    ),
  },
];
