import type { ColumnDef } from "@tanstack/react-table";
import { ChevronDown, Eye, Pencil } from "lucide-react";

export const getTransactionColumns = (
  onView: (transaction: any) => void,
  onEdit: (transaction: any) => void,
): ColumnDef<any>[] => [
  {
    id: "date",
    header: "Date",
    cell: ({ row }) => (
      <>
        <div className="transaction-table__desktop-date">
          <p className="font-medium text-slate-800">{row.original.dateLabel}</p>
          <p className="text-xs text-slate-400">
            {row.original.referenceLabel}
          </p>
        </div>
        <div className="transaction-table__mobile-summary">
          <p className="transaction-table__mobile-label">Transaction</p>
          <div className="transaction-table__mobile-meta">
            <span className="transaction-table__mobile-type">
              {String(row.original.type || "Transaction").toLowerCase()}
            </span>
            <span>TXN #{row.original.id}</span>
          </div>
          <p className="transaction-table__mobile-note">
            {row.original.note || "No remarks added"}
          </p>
          <span className="transaction-table__mobile-open" aria-hidden="true">
            <ChevronDown className="h-4 w-4" />
          </span>
        </div>
      </>
    ),
  },
  {
    id: "transactionId",
    header: "Transaction ID",
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-slate-800">TXN #{row.original.id}</p>
      </div>
    ),
  },
  {
    id: "details",
    header: "Transaction Details",
    cell: ({ row }) => (
      <div>
        <p className="max-w-sm break-words font-medium text-slate-800">
          {row.original.note || "No remarks added"}
        </p>
      </div>
    ),
  },
  {
    id: "account",
    header: "Account",
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-slate-800">{row.original.accountName}</p>
        <p className="text-xs text-slate-400">
          {row.original.accountTypeLabel}
        </p>
      </div>
    ),
  },
  {
    id: "category",
    header: "Category",
    cell: ({ row }) => (
      <div>
        <span className="font-medium text-slate-800">
          {row.original.categoryName}
        </span>
        <p className="mt-1 text-xs font-semibold text-primary-700">
          {row.original.categoryTypeLabel}
        </p>
      </div>
    ),
  },
  {
    id: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <div className="text-right">
        <p className="font-semibold text-slate-900">
          {row.original.amountLabel}
        </p>
        <p className="text-xs text-slate-400">
          Before: {row.original.balanceBeforeLabel}
        </p>
      </div>
    ),
    meta: {
      className: "px-3 py-2 align-middle text-right",
      headerClassName: "text-right",
    },
  },
  {
    id: "balanceAfter",
    header: "Balance After",
    cell: ({ row }) => (
      <span className="font-semibold text-slate-900">
        {row.original.balanceAfterLabel}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Action",
    cell: ({ row }) => {
      const editable = ["EXPENSE", "INCOME", "DEPOSIT"].includes(
        String(row.original.type).toUpperCase(),
      );

      return (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onView(row.original);
            }}
            className="rounded-lg p-2 text-primary-600 hover:bg-primary-50"
            title="View transaction details"
            aria-label="View transaction details"
          >
            <Eye className="h-4 w-4" />
          </button>
          {editable && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onEdit(row.original);
              }}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
              title="Edit transaction"
              aria-label="Edit transaction"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
        </div>
      );
    },
  },
];
