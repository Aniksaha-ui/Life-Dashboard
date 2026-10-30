import type { ColumnDef } from "@tanstack/react-table";
import type { FinancialOverviewRow, TransferReceiptRow } from "../types";

export const getFinancialLedgerColumns = (
  granularity: "daily" | "monthly",
): ColumnDef<FinancialOverviewRow>[] => [
  {
    accessorKey: "label",
    header: granularity === "monthly" ? "Month" : "Date",
  },
  {
    accessorKey: "openingBalanceLabel",
    header: "Opening Balance",
    meta: { className: "px-3 py-2 text-right", headerClassName: "text-right" },
  },
  {
    accessorKey: "incomeLabel",
    header: "Income",
    cell: ({ row }) => (
      <span className="font-semibold text-emerald-700">
        {row.original.incomeLabel}
      </span>
    ),
    meta: { className: "px-3 py-2 text-right", headerClassName: "text-right" },
  },
  {
    accessorKey: "costingLabel",
    header: "Costing",
    cell: ({ row }) => (
      <span className="font-semibold text-rose-700">
        {row.original.costingLabel}
      </span>
    ),
    meta: { className: "px-3 py-2 text-right", headerClassName: "text-right" },
  },
  {
    accessorKey: "transferLabel",
    header: "Transfers",
    meta: { className: "px-3 py-2 text-right", headerClassName: "text-right" },
  },
  {
    accessorKey: "netIncomeLabel",
    header: "Net Income",
    cell: ({ row }) => (
      <span
        className={
          row.original.netIncome >= 0
            ? "font-semibold text-emerald-700"
            : "font-semibold text-rose-700"
        }
      >
        {row.original.netIncomeLabel}
      </span>
    ),
    meta: { className: "px-3 py-2 text-right", headerClassName: "text-right" },
  },
  {
    accessorKey: "closingBalanceLabel",
    header: "Closing Balance",
    meta: { className: "px-3 py-2 text-right", headerClassName: "text-right" },
  },
  {
    accessorKey: "transactionCount",
    header: "Entries",
    meta: { className: "px-3 py-2 text-right", headerClassName: "text-right" },
  },
];

export const transferReceiptColumns: ColumnDef<TransferReceiptRow>[] = [
  { accessorKey: "accountName", header: "Destination Account" },
  {
    accessorKey: "totalAmountLabel",
    header: "Total Received",
    cell: ({ row }) => (
      <span className="font-semibold text-primary-700">
        {row.original.totalAmountLabel}
      </span>
    ),
    meta: { className: "px-3 py-2 text-right", headerClassName: "text-right" },
  },
];
