import {
  ArrowDownLeft,
  ArrowUpRight,
  Layers3,
  PiggyBank,
  RefreshCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { DataTable } from "../../components/DataTable";
import { outlinedControlClass, OutlinedField } from "../../components/OutlinedField";
import { useExpenseTransactions } from "./hooks/useExpenseTransactions";
import { BulkTransactionModal } from "./components/BulkTransactionModal";
import { TransactionDetailsDrawer } from "./components/TransactionDetailsDrawer";
import { getTransactionColumns } from "./components/columns";
import { MobileTransactionList } from "./components/MobileTransactionList";
import { TransactionsOverview } from "./components/TransactionsOverview";
import { TransactionEntryModal } from "./components/TransactionEntryModal";
import { TransactionPagination } from "./components/TransactionPagination";
import { getTransactionTypeLabel } from "./components/transactionTypes";

const tabs = [
  "all",
  "EXPENSE",
  "INCOME",
  "DEPOSIT",
  "RECURRING",
  "TRANSFER",
  "OPENING_BALANCE",
  "WITHDRAW",
];

const createEmptyValues = () => {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return {
    account_id: "",
    category_id: "",
    amount: "",
    note: "",
    transaction_date: `${today.getFullYear()}-${month}-${day}`,
  };
};

export default function ExpenseTransactionsPage() {
  const state = useExpenseTransactions();
  const [entryType, setEntryType] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [values, setValues] = useState(createEmptyValues);
  const [saving, setSaving] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [saveError, setSaveError] = useState("");
  const openCreate = (type: string) => {
    setEditingTransaction(null);
    setValues({
      ...createEmptyValues(),
      account_id: state.accounts.length === 1 ? String(state.accounts[0].id) : "",
    });
    setSaveError("");
    setEntryType(type);
  };
  const openEdit = (transaction: any) => {
    setSelectedTransaction(null);
    setSaveError("");
    setEditingTransaction(transaction);
    setValues({
      account_id: String(
        transaction.account_id ?? transaction.account?.id ?? "",
      ),
      category_id: String(
        transaction.category_id ?? transaction.category?.id ?? "",
      ),
      amount: String(transaction.amount ?? ""),
      note: String(transaction.note ?? ""),
      transaction_date: String(transaction.transaction_date ?? "").slice(0, 10),
    });
    setEntryType(String(transaction.type).toUpperCase());
  };
  const closeEntryModal = () => {
    setEntryType(null);
    setEditingTransaction(null);
    setValues(createEmptyValues());
  };
  const columns = useMemo(
    () => getTransactionColumns(setSelectedTransaction, openEdit),
    [],
  );
  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!entryType) return;
    setSaving(true);
    try {
      if (editingTransaction) {
        await state.update(editingTransaction.id, entryType, values);
      } else {
        await state.create(entryType, values);
      }
      closeEntryModal();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Unable to save the transaction.");
    } finally {
      setSaving(false);
    }
  };
  const activeFilterCount = [
    state.accountFilter !== "all",
    state.categoryFilter !== "all",
    state.fromDate !== state.defaultDateRange.fromDate ||
      state.toDate !== state.defaultDateRange.toDate,
  ].filter(Boolean).length;
  const hasActiveFilters =
    activeFilterCount > 0 || state.type !== "all" || state.search !== "";
  const clearFilters = () => {
    state.setType("all");
    state.setAccountFilter("all");
    state.setCategoryFilter("all");
    state.setFromDate(state.defaultDateRange.fromDate);
    state.setToDate(state.defaultDateRange.toDate);
    state.setSearch("");
  };
  const quickActions = [
    { type: "EXPENSE", label: "Expense", icon: ArrowUpRight, iconClassName: "bg-rose-50 text-rose-600" },
    { type: "INCOME", label: "Income", icon: ArrowDownLeft, iconClassName: "bg-emerald-50 text-emerald-600" },
    { type: "DEPOSIT", label: "Deposit", icon: PiggyBank, iconClassName: "bg-cyan-50 text-cyan-600" },
  ];
  return (
    <div className="app-management-page transactions-page space-y-5 md:space-y-6">
      <header className="rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50 via-white to-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Transactions
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Track income, expenses and deposits while keeping account balances in sync.
            </p>
          </div>
          <div className="grid grid-cols-4 gap-2 sm:flex sm:flex-wrap lg:justify-end xl:shrink-0 xl:flex-nowrap">
            {quickActions.map(({ type, label, icon: Icon, iconClassName }) => (
              <button
                key={type}
                type="button"
                onClick={() => openCreate(type)}
                className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-1 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 sm:flex-row sm:gap-2 sm:px-3.5 sm:py-2 sm:text-sm"
              >
                <span className={`grid h-8 w-8 place-items-center rounded-full sm:h-6 sm:w-6 ${iconClassName}`}>
                  <Icon className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                </span>
                <span>
                  <span className="hidden sm:inline">New </span>
                  {label}
                </span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => setIsBulkOpen(true)}
              className="flex flex-col items-center gap-1.5 rounded-xl bg-primary-600 px-1 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 sm:flex-row sm:gap-2 sm:px-3.5 sm:py-2 sm:text-sm"
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-white/15 sm:h-6 sm:w-6">
                <Layers3 className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
              </span>
              <span>
                Bulk<span className="hidden sm:inline"> entry</span>
              </span>
            </button>
          </div>
        </div>
      </header>

      <TransactionsOverview loading={state.loading} metrics={state.metrics} />

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="space-y-3 p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">Search transactions</span>
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={state.search}
                onChange={(event) => state.setSearch(event.target.value)}
                placeholder="Search transactions"
                className="h-10 w-full rounded-lg border border-slate-300 bg-white pr-3 pl-9 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-primary-600 focus:shadow-[0_0_0_3px_rgb(41_92_171_/_0.12)]"
              />
            </label>
            <button
              type="button"
              onClick={() => setFiltersOpen((open) => !open)}
              aria-expanded={filtersOpen}
              aria-controls="transaction-filters"
              className={`relative inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-sm font-semibold md:hidden ${filtersOpen ? "border-primary-600 bg-primary-50 text-primary-700" : "border-slate-300 text-slate-700"}`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary-600 px-1 text-[11px] text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => void state.refresh()}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50"
              aria-label="Refresh transactions"
              title="Refresh transactions"
            >
              <RefreshCcw className={`h-4 w-4 ${state.loading ? "animate-spin" : ""}`} />
            </button>
          </div>
          <div
            id="transaction-filters"
            className={`${filtersOpen ? "grid" : "hidden"} grid-cols-2 gap-3 pt-1 md:grid md:grid-cols-4`}
          >
            <OutlinedField label="Account" className="col-span-2 md:col-span-1">
              <select
                value={state.accountFilter}
                onChange={(event) => state.setAccountFilter(event.target.value)}
                className={outlinedControlClass}
              >
                <option value="all">All accounts</option>
                {state.accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </OutlinedField>
            <OutlinedField label="Category" className="col-span-2 md:col-span-1">
              <select
                value={state.categoryFilter}
                onChange={(event) => state.setCategoryFilter(event.target.value)}
                className={outlinedControlClass}
              >
                <option value="all">All categories</option>
                {state.categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </OutlinedField>
            <OutlinedField label="From">
              <input
                id="transactions-from-date"
                type="date"
                value={state.fromDate}
                max={state.toDate || undefined}
                onChange={(event) => state.setFromDate(event.target.value)}
                className={outlinedControlClass}
              />
            </OutlinedField>
            <OutlinedField label="To">
              <input
                id="transactions-to-date"
                type="date"
                value={state.toDate}
                min={state.fromDate || undefined}
                onChange={(event) => state.setToDate(event.target.value)}
                className={outlinedControlClass}
              />
            </OutlinedField>
          </div>
          <div
            role="tablist"
            aria-label="Transaction type"
            className="-mx-3 flex gap-2 overflow-x-auto px-3 [scrollbar-width:none] sm:-mx-4 sm:px-4 md:mx-0 md:flex-wrap md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden"
          >
            {tabs.map((tab) => {
              const active = state.type === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => state.setType(tab)}
                  className={`inline-flex h-8 shrink-0 items-center rounded-full px-3.5 text-xs font-semibold whitespace-nowrap transition-colors ${active ? "bg-primary-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                >
                  {getTransactionTypeLabel(tab)}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-3 py-2.5 sm:px-4">
          <p className="text-xs text-slate-500">
            {state.loading ? (
              "Loading transactions..."
            ) : (
              <>
                <span className="font-semibold text-slate-800">
                  {state.pagination.total.toLocaleString("en-US")}
                </span>{" "}
                {state.pagination.total === 1 ? "transaction" : "transactions"} found
              </>
            )}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700 hover:text-primary-800"
            >
              <X className="h-3.5 w-3.5" />
              Clear filters
            </button>
          )}
        </div>
      </section>

      <div className="space-y-3 md:hidden">
        <MobileTransactionList
          rows={state.pageRows}
          loading={state.loading}
          onSelect={setSelectedTransaction}
        />
        {!state.loading && (
          <TransactionPagination
            pagination={state.pagination}
            onPageChange={state.setPage}
          />
        )}
      </div>
      <div className="hidden md:block">
        <DataTable
        data={state.pageRows}
        columns={columns}
        isLoading={state.loading}
        loadingText="Loading transactions..."
        onRowClick={setSelectedTransaction}
        hideToolbarDateFilter
        hideViewColumn
        externalPagination={state.pagination}
        onPageChange={state.setPage}
        className="transaction-table border-slate-200"
        />
      </div>
      <TransactionDetailsDrawer
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        onEdit={openEdit}
      />
      <TransactionEntryModal
        entryType={entryType}
        isEditing={!!editingTransaction}
        values={values}
        setValues={setValues}
        accounts={state.accounts}
        categories={state.categories}
        saving={saving}
        error={saveError}
        onClose={closeEntryModal}
        onSubmit={save}
      />
      <BulkTransactionModal
        open={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        accounts={state.accounts}
        categories={state.categories}
        onSave={state.createBulk}
      />
    </div>
  );
}
