import type { ColumnDef } from "@tanstack/react-table";
import { clsx } from "clsx";
import { CopyButton } from "../../../components/CopyButton";
import type { ColumnHandlers, TransactionRow } from "../types";

const getStatusBadgeClass = (status: string) => {
  switch (status.toLowerCase()) {
    case "success":
      return "bg-emerald-50 text-emerald-600";
    case "failed":
      return "bg-rose-50 text-rose-600";
    case "pending":
      return "bg-amber-50 text-amber-600";
    case "refunded":
      return "bg-slate-100 text-slate-500";
    default:
      return "bg-slate-100 text-slate-500";
  }
};

export const getTransactionColumns = ({
  onViewDetail,
  onViewCustomer,
  onViewCard,
  onViewLogs,
}: ColumnHandlers): ColumnDef<TransactionRow>[] => [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => (
      <div className="text-xs space-y-0.5">
        <div className="font-medium text-slate-900">
          {new Date(row.original.date).toLocaleDateString()}
        </div>
        <div className="text-slate-500">
          {new Date(row.original.date).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "id",
    header: "Transaction ID",
    cell: ({ row }) => (
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (row.original.tid) {
            onViewCustomer(row.original.tid);
          }
        }}
        className={clsx(
          "text-xs font-medium whitespace-nowrap",
          row.original.tid
            ? "text-primary-600 hover:text-primary-700 hover:underline cursor-pointer"
            : "text-slate-400 cursor-not-allowed",
        )}
        disabled={!row.original.tid}
      >
        {row.original.id}
      </button>
    ),
  },
  {
    accessorKey: "merchantName",
    header: "Merchant Name",
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5 min-w-[150px]">
        <span className="text-sm font-semibold text-slate-900 leading-tight">
          {row.original.merchantName || "-"}
        </span>
        {row.original.merchantId && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono p-1 bg-slate-50 border border-slate-100 rounded leading-none text-slate-500">
              {row.original.merchantId}
            </span>
            <CopyButton value={row.original.merchantId} />
          </div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "bankName",
    header: "Acquiring Bank",
    cell: ({ row }) => (
      <div className="text-xs space-y-0.5">
        <div className="text-slate-500">{row.original.bankTxnId || "-"}</div>
        <div className="font-medium text-slate-900">
          {row.original.bankName || "-"}
        </div>
        <div className="text-slate-500 capitalize">
          {row.original.cardBrand || "-"}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "storeName",
    header: "Store",
    cell: ({ row }) => (
      <div className="min-w-[150px] group text-xs">
        <div className="font-medium text-slate-900">
          {row.original.storeName}
        </div>
        <div className="text-slate-500 mt-0.5 flex items-center gap-1">
          {row.original.storeId}
          <CopyButton value={row.original.storeId} />
        </div>
      </div>
    ),
  },
  {
    accessorKey: "cardInfo",
    header: "Card Info",
    cell: ({ row }) => (
      <div className="text-xs space-y-0.5">
        <button
          onClick={(e) => {
            e.stopPropagation();
            const masked = `${row.original.cardBin || "XXXXXX"}XXXXXX${row.original.cardLast4 || "XXXX"}`;
            onViewCard(masked);
          }}
          className="font-medium text-primary-600 hover:text-primary-700 hover:underline block cursor-pointer"
        >
          {row.original.cardBin
            ? `${row.original.cardBin}XXXXXX${row.original.cardLast4}`
            : row.original.cardLast4
              ? `•••• •••• •••• ${row.original.cardLast4}`
              : "-"}
        </button>
        <div className="text-slate-700">{row.original.cardholderName}</div>
        <div className="text-slate-500">
          {row.original.cardBank} • {row.original.cardCountry}
        </div>
        <div className="text-slate-500 capitalize">{row.original.cardType}</div>
      </div>
    ),
  },
  {
    accessorKey: "ipAddress",
    header: "Location",
    cell: ({ row }) => (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onViewLogs(
            row.original.tid!,
            row.original.id,
            row.original.ipAddress!,
          );
        }}
        className="text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline cursor-pointer"
      >
        {row.original.ipAddress || "-"}
      </button>
    ),
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => (
      <div className="text-xs font-medium text-slate-900 text-right tabular-nums">
        ৳{row.original.amount.toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <span
        className={clsx(
          "px-2 py-0.5 rounded-full text-xs font-medium capitalize whitespace-nowrap inline-block",
          getStatusBadgeClass(row.original.status),
        )}
      >
        {row.original.status}
      </span>
    ),
  },
  {
    id: "action",
    header: "Action",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetail(row.original.tid as number);
          }}
          className="text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline cursor-pointer"
        >
          Details
        </button>
      </div>
    ),
  },
];
