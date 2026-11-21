import type { Dispatch, FormEvent, SetStateAction } from "react";
import { Modal } from "../../../components/Modal";
import { OutlinedField, outlinedControlClass } from "../../../components/OutlinedField";
import { getTransactionTypeMeta } from "./transactionTypes";

export type TransactionEntryValues = {
  account_id: string;
  category_id: string;
  amount: string;
  note: string;
  transaction_date: string;
};

const typeDescriptions: Record<string, string> = {
  EXPENSE: "Money going out of an account.",
  INCOME: "Money coming into an account.",
  DEPOSIT: "Money added to an account's balance.",
};

export function TransactionEntryModal({
  entryType,
  isEditing,
  values,
  setValues,
  accounts,
  categories,
  saving,
  error,
  onClose,
  onSubmit,
}: {
  entryType: string | null;
  isEditing: boolean;
  values: TransactionEntryValues;
  setValues: Dispatch<SetStateAction<TransactionEntryValues>>;
  accounts: any[];
  categories: any[];
  saving: boolean;
  error?: string;
  onClose: () => void;
  onSubmit: (event: FormEvent) => void;
}) {
  const meta = getTransactionTypeMeta(entryType);
  const Icon = meta.icon;
  const typedCategories = categories.filter(
    (category) => String(category.type).toUpperCase() === entryType,
  );
  const baseCategories = typedCategories.length ? typedCategories : categories;
  const currentCategory = categories.find(
    (category) => String(category.id) === values.category_id,
  );
  const categoryOptions =
    currentCategory && !baseCategories.includes(currentCategory)
      ? [...baseCategories, currentCategory]
      : baseCategories;
  const set = (key: keyof TransactionEntryValues, value: string) =>
    setValues((current) => ({ ...current, [key]: value }));

  return (
    <Modal
      isOpen={!!entryType}
      onClose={onClose}
      title={entryType ? `${isEditing ? "Edit" : "New"} ${meta.label.toLowerCase()}` : ""}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            form="entry-form"
            type="submit"
            disabled={saving}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : isEditing ? "Update transaction" : "Save transaction"}
          </button>
        </>
      }
    >
      <form id="entry-form" onSubmit={onSubmit} className="space-y-5">
        {error && (
          <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </p>
        )}
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
          <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${meta.iconClassName}`}>
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">{meta.label}</p>
            <p className="text-xs text-slate-500">
              {typeDescriptions[entryType ?? ""] ?? "Record a transaction."}
            </p>
          </div>
        </div>

        <label className="block rounded-xl border border-slate-300 bg-white px-4 py-3 transition focus-within:border-primary-600 focus-within:shadow-[0_0_0_3px_rgb(41_92_171_/_0.12)]">
          <span className="text-xs font-medium text-slate-600">
            Amount <span className="text-rose-500">*</span>
          </span>
          <span className="mt-1 flex items-baseline gap-2">
            <span className="text-sm font-semibold text-slate-400">BDT</span>
            <input
              required
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={values.amount}
              onChange={(event) => set("amount", event.target.value)}
              className="w-full min-w-0 border-0 bg-transparent p-0 text-2xl font-bold tracking-tight text-slate-900 outline-none placeholder:text-slate-300 focus:shadow-none"
            />
          </span>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <OutlinedField label="Account *">
            <select
              required
              value={values.account_id}
              onChange={(event) => set("account_id", event.target.value)}
              className={outlinedControlClass}
            >
              <option value="">Select account</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </OutlinedField>
          {entryType !== "DEPOSIT" && (
            <OutlinedField label={entryType === "EXPENSE" ? "Category *" : "Category"}>
              <select
                value={values.category_id}
                onChange={(event) => set("category_id", event.target.value)}
                required={entryType === "EXPENSE"}
                className={outlinedControlClass}
              >
                <option value="">Select category</option>
                {categoryOptions.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </OutlinedField>
          )}
          <OutlinedField
            label="Date"
            className={entryType === "DEPOSIT" ? "" : "sm:col-span-2"}
          >
            <input
              type="date"
              value={values.transaction_date}
              onChange={(event) => set("transaction_date", event.target.value)}
              className={outlinedControlClass}
            />
          </OutlinedField>
          <OutlinedField label="Note" className="sm:col-span-2">
            <textarea
              value={values.note}
              onChange={(event) => set("note", event.target.value)}
              placeholder="What was this for? (optional)"
              rows={3}
              className="min-h-20 w-full resize-y border-0 bg-transparent p-0 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:bg-transparent focus:shadow-none"
            />
          </OutlinedField>
        </div>
      </form>
    </Modal>
  );
}
