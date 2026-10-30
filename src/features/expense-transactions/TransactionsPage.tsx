import {
  ArrowDownToLine,
  ArrowUpToLine,
  Layers3,
  PiggyBank,
  RefreshCcw,
} from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { DataTable } from "../../components/DataTable";
import { Modal } from "../../components/Modal";
import { useExpenseTransactions } from "./hooks/useExpenseTransactions";
import { BulkTransactionModal } from "./components/BulkTransactionModal";
import { TransactionDetailsDrawer } from "./components/TransactionDetailsDrawer";
import { getTransactionColumns } from "./components/columns";
import { TransactionsOverview } from "./components/TransactionsOverview";

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
  const openCreate = (type: string) => {
    setEditingTransaction(null);
    setValues(createEmptyValues());
    setEntryType(type);
  };
  const openEdit = (transaction: any) => {
    setSelectedTransaction(null);
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
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Transaction Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track income, expenses, and deposits while keeping account balances
            in sync.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => openCreate("EXPENSE")}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-3 py-2 text-sm font-semibold text-white"
          >
            <ArrowDownToLine className="h-4 w-4" />
            New Expense
          </button>
          <button
            onClick={() => openCreate("INCOME")}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
          >
            <ArrowUpToLine className="h-4 w-4" />
            New Income
          </button>
          <button
            onClick={() => openCreate("DEPOSIT")}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
          >
            <PiggyBank className="h-4 w-4" />
            New Deposit
          </button>
          <button
            onClick={() => setIsBulkOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
          >
            <Layers3 className="h-4 w-4" />
            Bulk Transaction
          </button>
        </div>
      </div>
      <TransactionsOverview loading={state.loading} metrics={state.metrics} />
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => state.setType(tab)}
                className={`rounded-lg px-3 py-2 text-xs font-semibold ${state.type === tab ? "bg-primary-600 text-white" : "bg-slate-100 text-slate-600"}`}
              >
                {tab === "all" ? "All Transactions" : tab.replace(/_/g, " ")}
              </button>
            ))}
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            <select
              value={state.accountFilter}
              onChange={(event) => state.setAccountFilter(event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              aria-label="Filter by account"
            >
              <option value="all">All accounts</option>
              {state.accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
            <select
              value={state.categoryFilter}
              onChange={(event) => state.setCategoryFilter(event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              aria-label="Filter by category"
            >
              <option value="all">All categories</option>
              {state.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <label className="sr-only" htmlFor="transactions-from-date">
              From date
            </label>
            <input
              id="transactions-from-date"
              type="date"
              value={state.fromDate}
              max={state.toDate || undefined}
              onChange={(event) => state.setFromDate(event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              aria-label="From date"
            />
            <label className="sr-only" htmlFor="transactions-to-date">
              To date
            </label>
            <input
              id="transactions-to-date"
              type="date"
              value={state.toDate}
              min={state.fromDate || undefined}
              onChange={(event) => state.setToDate(event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              aria-label="To date"
            />
            <input
              value={state.search}
              onChange={(event) => state.setSearch(event.target.value)}
              placeholder="Search transactions"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <button
              onClick={() => void state.refresh()}
              className="rounded-lg border border-slate-300 px-3 py-2 text-slate-600"
            >
              <RefreshCcw className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                state.setAccountFilter("all");
                state.setCategoryFilter("all");
                state.setFromDate(state.defaultDateRange.fromDate);
                state.setToDate(state.defaultDateRange.toDate);
                state.setSearch("");
              }}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Clear filters
            </button>
          </div>
        </div>
      </section>
      <DataTable
        data={state.rows}
        columns={columns}
        isLoading={state.loading}
        loadingText="Loading transactions..."
        onRowClick={setSelectedTransaction}
        hideToolbarDateFilter
        hideViewColumn
        className="transaction-table border-slate-200"
      />
      <TransactionDetailsDrawer
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
      <Modal
        isOpen={!!entryType}
        onClose={closeEntryModal}
        title={
          entryType
            ? `${editingTransaction ? "Edit" : "New"} ${entryType.toLowerCase()}`
            : ""
        }
        footer={
          <button
            form="entry-form"
            type="submit"
            disabled={saving}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white"
          >
            {saving
              ? "Saving..."
              : editingTransaction
                ? "Update Transaction"
                : "Save Transaction"}
          </button>
        }
      >
        <form
          id="entry-form"
          onSubmit={save}
          className="grid gap-4 sm:grid-cols-2"
        >
          {[
            ["account_id", "Account"],
            ["amount", "Amount"],
            ["transaction_date", "Date"],
          ].map(([key, label]) => (
            <label key={key} className="text-sm font-medium text-slate-700">
              {label}
              {key === "account_id" ? (
                <select
                  required
                  value={values.account_id}
                  onChange={(event) =>
                    setValues({ ...values, account_id: event.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2"
                >
                  <option value="">Select account</option>
                  {state.accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  required={key !== "transaction_date"}
                  type={key === "amount" ? "number" : "date"}
                  value={(values as any)[key]}
                  onChange={(event) =>
                    setValues({ ...values, [key]: event.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2"
                />
              )}
            </label>
          ))}
          {entryType !== "DEPOSIT" && (
            <label className="text-sm font-medium text-slate-700">
              Category
              <select
                value={values.category_id}
                onChange={(event) =>
                  setValues({ ...values, category_id: event.target.value })
                }
                required={entryType === "EXPENSE"}
                className="mt-1 w-full rounded-lg border border-slate-300 p-2"
              >
                <option value="">Select category</option>
                {state.categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="sm:col-span-2 text-sm font-medium text-slate-700">
            Note
            <textarea
              value={values.note}
              onChange={(event) =>
                setValues({ ...values, note: event.target.value })
              }
              className="mt-1 w-full rounded-lg border border-slate-300 p-2"
            />
          </label>
        </form>
      </Modal>
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
