import { Plus, RefreshCcw } from "lucide-react";
import { useState } from "react";
import { MetricCard } from "../../components/MetricCard";
import type { AccountApiItem } from "./types";
import { AccountForm } from "./components/AccountForm";
import { AccountTable } from "./components/AccountTable";
import { useAccounts } from "./hooks/useAccounts";

const filters = [
  ["all", "All Accounts"],
  ["CASH", "Cash"],
  ["BANK", "Bank"],
  ["CARD", "Card"],
  ["MOBILE_BANKING", "Mobile Banking"],
] as const;
const balance = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function AccountsPage() {
  const {
    rows,
    metrics,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    isLoading,
    refresh,
    save,
    getAccount,
  } = useAccounts();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountApiItem | null>(
    null,
  );
  const openEdit = async (row: { id: string | number }) => {
    try {
      setEditingAccount(await getAccount(row.id));
      setIsFormOpen(true);
    } catch {
      /* request error is surfaced by the next refresh */
    }
  };
  const openCreate = () => {
    setEditingAccount(null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Account Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Create and update wallets, bank accounts, cards, and mobile banking
            balances.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          New Account
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Accounts"
          value={isLoading ? "..." : metrics.total}
          className="border-blue-100"
        />
        <MetricCard
          title="Active Accounts"
          value={isLoading ? "..." : metrics.active}
          className="border-cyan-100"
        />
        <MetricCard
          title="Cash Accounts"
          value={isLoading ? "..." : metrics.cash}
          className="border-emerald-100"
        />
        <MetricCard
          title="Tracked Balance"
          value={isLoading ? "..." : `BDT ${balance.format(metrics.balance)}`}
          className="border-amber-100"
        />
      </div>
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {filters.map(([value, label]) => (
              <button
                key={value}
                onClick={() => setTypeFilter(value)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${typeFilter === value ? "bg-primary-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="min-w-0 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-500"
              placeholder="Search accounts"
            />
            <button
              onClick={() => void refresh()}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>
      </section>
      <AccountTable rows={rows} isLoading={isLoading} onEdit={openEdit} />
      <AccountForm
        account={editingAccount}
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={save}
      />
    </div>
  );
}
