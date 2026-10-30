import { useMemo } from "react";
import { DataTable } from "../../../../components/DataTable";
import { getFinancialLedgerColumns, transferReceiptColumns } from "./columns";
import type {
  FinancialGranularity,
  FinancialOverviewRow,
  TransferReceiptRow,
} from "../types";

export function FinancialOverviewTable({
  rows,
  search,
  onSearchChange,
  granularity,
}: {
  rows: FinancialOverviewRow[];
  search: string;
  onSearchChange: (value: string) => void;
  granularity: FinancialGranularity;
}) {
  const columns = useMemo(
    () => getFinancialLedgerColumns(granularity),
    [granularity],
  );

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-700">
          Table view
        </p>
        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          {granularity === "monthly" ? "Monthly" : "Daily"} financial ledger
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Opening and closing balances with each period’s income and costing.
        </p>
      </div>
      <DataTable
        data={rows}
        columns={columns}
        hideToolbarDateFilter
        hideViewColumn
        filterActions={
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search period or amount"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm md:w-64"
          />
        }
      />
    </section>
  );
}

export function TransferReceiptsTable({
  rows,
}: {
  rows: TransferReceiptRow[];
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-700">
          Transfers
        </p>
        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          Transfer receipts by account
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Total transfers received by each destination account in the selected
          period.
        </p>
      </div>
      <DataTable
        data={rows}
        columns={transferReceiptColumns}
        hideToolbarDateFilter
        hideViewColumn
        hidePagination
      />
    </section>
  );
}
