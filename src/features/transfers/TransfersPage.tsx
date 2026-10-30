import { ArrowLeftRight, RefreshCcw, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import { DataTable } from "../../components/DataTable";
import { MobileRecordDrawer } from "../../components/MobileRecordDrawer";
import { MetricCard } from "../../components/MetricCard";
import { TransferForm } from "./components/TransferForm";
import { getTransferColumns } from "./components/columns";
import { useTransfers } from "./hooks/useTransfers";
const filters = [
  ["all", "All Transfers"],
  ["transfer", "Standard Transfers"],
  ["withdrawal", "Cash Withdrawals"],
] as const;
export default function TransfersPage() {
  const state = useTransfers();
  const [mode, setMode] = useState<"TRANSFER" | "WITHDRAWAL" | null>(null);
  const [editing, setEditing] = useState<any>(null);
  const [selectedTransfer, setSelectedTransfer] = useState<any>(null);
  const columns = useMemo(
    () =>
      getTransferColumns((item) => {
        setEditing(item);
        setMode(item.withdrawal ? "WITHDRAWAL" : "TRANSFER");
      }),
    [],
  );
  const open = (nextMode: "TRANSFER" | "WITHDRAWAL") => {
    setEditing(null);
    setMode(nextMode);
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Transfer Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Move money between accounts and record withdrawals to cash while
            keeping balances synchronized.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => open("TRANSFER")}
            disabled={state.accounts.length < 2}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            <ArrowLeftRight className="h-4 w-4" />
            New Transfer
          </button>
          <button
            onClick={() => open("WITHDRAWAL")}
            disabled={state.accounts.length < 2}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
          >
            <Wallet className="h-4 w-4" />
            Withdraw To Cash
          </button>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Transfers"
          value={state.loading ? "..." : state.metrics.total}
        />
        <MetricCard
          title="Standard Transfers"
          value={state.loading ? "..." : state.metrics.transfer}
        />
        <MetricCard
          title="Cash Withdrawals"
          value={state.loading ? "..." : state.metrics.withdrawal}
        />
        <MetricCard
          title="Moved Amount"
          value={`BDT ${state.metrics.amount.toLocaleString()}`}
        />
      </div>
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {filters.map(([value, label]) => (
              <button
                key={value}
                onClick={() => state.setFlow(value)}
                className={`rounded-lg px-3 py-2 text-sm font-semibold ${state.flow === value ? "bg-primary-600 text-white" : "bg-slate-100 text-slate-600"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={state.accountId}
              onChange={(e) => state.setAccountId(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="all">All accounts</option>
              {state.accounts.map((account: any) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={state.fromDate}
              max={state.toDate || undefined}
              onChange={(e) => state.setFromDate(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              type="date"
              value={state.toDate}
              min={state.fromDate || undefined}
              onChange={(e) => state.setToDate(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              value={state.search}
              onChange={(e) => state.setSearch(e.target.value)}
              placeholder="Search transfers"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <button
              onClick={() => void state.refresh()}
              className="rounded-lg border border-slate-300 px-3 py-2 text-slate-600"
            >
              <RefreshCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
      <DataTable
        data={state.rows}
        columns={columns}
        hideToolbarDateFilter
        hideViewColumn
        className="compact-mobile-table border-slate-200"
        onRowClick={setSelectedTransfer}
      />
      <MobileRecordDrawer
        open={Boolean(selectedTransfer)}
        onClose={() => setSelectedTransfer(null)}
        title="Transfer Details"
        subtitle={
          selectedTransfer?.withdrawal ? "Withdraw To Cash" : "Transfer"
        }
        details={
          selectedTransfer
            ? [
                { label: "Transfer ID", value: selectedTransfer.id },
                { label: "Source", value: selectedTransfer.fromName },
                { label: "Destination", value: selectedTransfer.toName },
                { label: "Amount", value: selectedTransfer.amountLabel },
                { label: "Date", value: selectedTransfer.dateLabel },
                { label: "Note", value: selectedTransfer.note },
              ]
            : []
        }
      />
      <TransferForm
        open={!!mode}
        onClose={() => setMode(null)}
        mode={mode || "TRANSFER"}
        transfer={editing}
        accounts={state.accounts}
        onSave={state.save}
      />
    </div>
  );
}
