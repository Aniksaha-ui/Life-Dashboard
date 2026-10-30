import { DataTable } from "../../../../components/DataTable";
import { accountBalanceColumns } from "./columns";
import type { AccountBalanceRow } from "../types";

export function AccountBalanceTable({
  rows,
  search,
  onSearchChange,
}: {
  rows: AccountBalanceRow[];
  search: string;
  onSearchChange: (value: string) => void;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-700">
          Balance register
        </p>
        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          Current account balances
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Review live balances by account, institution, type, and activity
          status.
        </p>
      </div>
      <DataTable
        data={rows}
        columns={accountBalanceColumns}
        hideToolbarDateFilter
        hideViewColumn
        filterActions={
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search accounts"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm md:w-64"
          />
        }
      />
    </section>
  );
}
