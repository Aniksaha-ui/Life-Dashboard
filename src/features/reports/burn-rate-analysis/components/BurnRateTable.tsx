import { useMemo } from "react";
import { DataTable } from "../../../../components/DataTable";
import type { BurnRateRow } from "../types";
import { burnRateColumns } from "./columns";

export function BurnRateTable({
  rows,
  search,
  onSearchChange,
}: {
  rows: BurnRateRow[];
  search: string;
  onSearchChange: (value: string) => void;
}) {
  const columns = useMemo(() => burnRateColumns, []);
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-700">
          Monthly breakdown
        </p>
        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          Burn-rate analysis table
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Compare total expense against active spending days and daily burn
          rate.
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
            placeholder="Search month or amount"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm md:w-64"
          />
        }
      />
    </section>
  );
}
