import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil } from "lucide-react";
import {
  amountPrefix,
  amountToneClass,
  getTransactionDirection,
  getTransactionTypeMeta,
  isTransactionEditable,
} from "./transactionTypes";

export const getTransactionColumns = (
  onView: (transaction: any) => void,
  onEdit: (transaction: any) => void,
): ColumnDef<any>[] => [
  {
    id: "date",
    header: "Date",
    cell: ({ row }) => (
      <div className="whitespace-nowrap">
        <p className="font-medium text-slate-800">{row.original.dateLabel}</p>
        <p className="text-xs text-slate-400">{row.original.referenceLabel}</p>
      </div>
    ),
  },
  {
    id: "details",
    header: "Transaction",
    cell: ({ row }) => {
      const meta = getTransactionTypeMeta(row.original.type);
      const Icon = meta.icon;
      return (
        <div className="flex min-w-[12rem] items-center gap-3">
          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${meta.iconClassName}`}>
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="max-w-xs break-words font-medium text-slate-800">
              {row.original.note || meta.label}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${meta.badgeClassName}`}>
                {meta.label}
              </span>
              <span className="text-xs text-slate-400">TXN #{row.original.id}</span>
            </div>
          </div>
        </div>
      );
    },
  },
  {
    id: "account",
    header: "Account",
    cell: ({ row }) => (
      <div>
        <p className="whitespace-nowrap font-medium text-slate-800">{row.original.accountName}</p>
        <p className="text-xs text-slate-400">
          <span className="xl:hidden">{row.original.categoryName}</span>
          <span className="hidden xl:inline">{row.original.accountTypeLabel}</span>
        </p>
      </div>
    ),
  },
  {
    id: "category",
    header: "Category",
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-slate-800">{row.original.categoryName}</p>
        {row.original.category && (
          <p className="text-xs text-slate-400">{row.original.categoryTypeLabel}</p>
        )}
      </div>
    ),
    meta: {
      className: "hidden px-3 py-2 align-middle xl:table-cell",
      headerClassName: "hidden xl:table-cell",
    },
  },
  {
    id: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const direction = getTransactionDirection(row.original);
      return (
        <div className="whitespace-nowrap text-right">
          <p className={`font-semibold tabular-nums ${amountToneClass[direction]}`}>
            {amountPrefix[direction]}
            {row.original.amountLabel}
          </p>
          <p className="text-xs tabular-nums text-slate-400">
            <span className="xl:hidden">Balance: {row.original.balanceAfterLabel}</span>
            <span className="hidden xl:inline">Before: {row.original.balanceBeforeLabel}</span>
          </p>
        </div>
      );
    },
    meta: {
      className: "px-3 py-2 align-middle text-right",
      headerClassName: "text-right",
    },
  },
  {
    id: "balanceAfter",
    header: "Balance After",
    cell: ({ row }) => (
      <span className="whitespace-nowrap font-semibold tabular-nums text-slate-900">
        {row.original.balanceAfterLabel}
      </span>
    ),
    meta: {
      className: "hidden px-3 py-2 align-middle text-right xl:table-cell",
      headerClassName: "hidden text-right xl:table-cell",
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1">
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
        {isTransactionEditable(row.original) && (
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
    ),
  },
];
