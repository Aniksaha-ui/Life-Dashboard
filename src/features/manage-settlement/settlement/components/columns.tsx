import type { ColumnDef } from "@tanstack/react-table";
import { clsx } from "clsx";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  MinusCircle,
  XCircle,
} from "lucide-react";
import { CopyButton } from "../../../../components/CopyButton";
import type { SettlementListItem } from "../types";

const cellTextClass = "text-xs font-medium text-slate-600";

// Helper for status badges
export const getStatusColor = (status: string) => {
  switch (status) {
    case "Paid":
      return "bg-emerald-50 text-emerald-600";
    case "Pending":
      return "bg-blue-50 text-blue-600";
    case "Bounced":
      return "bg-rose-50 text-rose-600";
    case "On Hold":
      return "bg-amber-50 text-amber-600";
    default:
      return "bg-slate-100 text-slate-500";
  }
};

export const getStatusIcon = (status: string) => {
  switch (status) {
    case "Paid":
      return CheckCircle;
    case "Pending":
      return Clock;
    case "Bounced":
      return XCircle;
    case "On Hold":
      return AlertCircle;
    default:
      return MinusCircle;
  }
};

interface GetSettlementColumnsProps {
  onViewDetail: (id: string) => void;
}

export const getSettlementColumns = ({
  onViewDetail,
}: GetSettlementColumnsProps): ColumnDef<SettlementListItem>[] => [
  {
    accessorKey: "settlement_date",
    header: "Date",
    cell: ({ row }) => (
      <div className={cellTextClass}>
        {new Date(row.original.settlement_date).toLocaleDateString()}
      </div>
    ),
  },
  {
    accessorKey: "transaction_id",
    header: "Transaction ID",
    cell: ({ row }) => (
      <span className={cellTextClass}>{row.original.transaction_id}</span>
    ),
  },
  {
    id: "merchant",
    header: "Merchant",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5 group">
        <div>
          <div className={cellTextClass}>{row.original.merchant_name}</div>
          <div
            className={clsx(cellTextClass, "mt-0.5 flex items-center gap-1")}
          >
            {row.original.merchant_code}
            <CopyButton value={row.original.merchant_code} />
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
          <div className={cellTextClass}>{row.original.store_name}</div>
          {row.original.store_id && (
            <div
              className={clsx(cellTextClass, "mt-0.5 flex items-center gap-1")}
            >
              {row.original.store_id}
              <CopyButton value={row.original.store_id} />
            </div>
          )}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "bank_information",
    header: "BANK INFORMATION",
    cell: ({ row }) => {
      const { payee_name, bank_name, branch_name, account_no, routing_no } =
        row.original;
      return (
        <div className="flex flex-col gap-0.5 py-1">
          <div className={cellTextClass}>{payee_name || "-"}</div>
          <div className={cellTextClass}>
            {bank_name}
            {branch_name ? ` - ${branch_name}` : ""}
          </div>
          {account_no && <div className={cellTextClass}>{account_no}</div>}
          {routing_no && <div className={cellTextClass}>{routing_no}</div>}
        </div>
      );
    },
  },
  {
    accessorKey: "settlement_type",
    header: "Type",
    cell: ({ row }) => (
      <span className={cellTextClass}>
        {row.original.settlement_type || "N/A"}
      </span>
    ),
  },
  {
    id: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const { opening_amt, payable_amt, settle_amt, paid_amt, fwd_amt } =
        row.original;

      if (row.original.settlement_type === "online") {
        return (
          <div
            className={clsx(
              cellTextClass,
              "py-1 space-y-0.5 leading-tight text-right tabular-nums",
            )}
          >
            <div>Opening: {opening_amt.toLocaleString()}</div>
            <div>Payable: {payable_amt.toLocaleString()}</div>
            <div className="border-t border-slate-100 pt-0.5 mt-0.5">
              Settle: {settle_amt.toLocaleString()}
            </div>
            <div className={clsx(cellTextClass, "text-emerald-600")}>
              Paid: {paid_amt.toLocaleString()}
            </div>
            <div className={clsx(cellTextClass, "text-amber-600")}>
              Fwd: {fwd_amt.toLocaleString()}
            </div>
          </div>
        );
      }

      return (
        <div className={clsx(cellTextClass, "text-right tabular-nums")}>
          {settle_amt.toLocaleString()}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <span
        className={clsx(
          "px-2 py-0.5 rounded-full text-xs font-medium capitalize whitespace-nowrap inline-block",
          getStatusColor(row.original.status),
        )}
      >
        {row.original.status}
      </span>
    ),
  },
  {
    id: "action",
    header: "Action",
    cell: ({ row }) => {
      if (!row.original.action.details_enabled) return null;
      return (
        <div className="flex items-center gap-3">
          <button
            className="p-1 hover:bg-slate-100 rounded transition-colors text-slate-500 hover:text-primary-600 cursor-pointer"
            title="Download Excel"
            onClick={(e) => {
              e.stopPropagation(); /* Mock excel download */
            }}
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetail(row.original.transaction_id);
            }}
            className="text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline cursor-pointer"
          >
            Details
          </button>
        </div>
      );
    },
  },
];
