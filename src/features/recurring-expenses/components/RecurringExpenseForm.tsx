import { useEffect, useState } from "react";
import { Modal } from "../../../components/Modal";
import { OutlinedField } from "../../../components/OutlinedField";
import type { RecurringExpenseFormValues } from "../types";
const empty = (): RecurringExpenseFormValues => ({
  title: "",
  amount: "",
  account_id: "",
  category_id: "",
  frequency: "MONTHLY",
  is_active: true,
  start_date: new Date().toISOString().slice(0, 10),
  next_run_date: new Date().toISOString().slice(0, 10),
  end_date: "",
  note: "",
});
export function RecurringExpenseForm({
  open,
  onClose,
  item,
  accounts,
  categories,
  onSave,
}: any) {
  const [values, setValues] = useState<RecurringExpenseFormValues>(empty());
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (open)
      setValues(
        item
          ? {
              ...empty(),
              ...item,
              account_id: String(item.account_id ?? item.account?.id ?? ""),
              category_id: String(item.category_id ?? item.category?.id ?? ""),
              amount: String(item.amount ?? ""),
              start_date: String(item.start_date ?? "").slice(0, 10),
              next_run_date: String(item.next_run_date ?? "").slice(0, 10),
              end_date: String(item.end_date ?? "").slice(0, 10),
              is_active: Boolean(item.is_active),
            }
          : empty(),
      );
  }, [open, item]);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await onSave(values, item);
      onClose();
    } finally {
      setSaving(false);
    }
  };
  const update = (key: keyof RecurringExpenseFormValues, value: any) =>
    setValues((current) => ({ ...current, [key]: value }));
  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={item ? "Edit Recurring Expense" : "New Recurring Expense"}
      size="2xl"
      footer={
        <button
          form="recurring-expense-form"
          disabled={saving}
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white"
        >
          {saving ? "Saving..." : item ? "Update Plan" : "Create Plan"}
        </button>
      }
    >
      <form
        id="recurring-expense-form"
        onSubmit={submit}
        className="grid gap-4 sm:grid-cols-2"
      >
        {[
          ["title", "Title", "text"],
          ["amount", "Amount", "number"],
          ["start_date", "Start Date", "date"],
          ["next_run_date", "Next Run Date", "date"],
          ["end_date", "End Date", "date"],
        ].map(([key, label, type]) => (
          <OutlinedField key={key} label={label}>
            <input
              required={key !== "end_date"}
              type={type}
              min={key === "amount" ? "0" : undefined}
              step={key === "amount" ? "0.01" : undefined}
              value={(values as any)[key]}
              onChange={(event) =>
                update(
                  key as keyof RecurringExpenseFormValues,
                  event.target.value,
                )
              }
              className="h-8 w-full border-0 bg-transparent p-0 text-sm text-slate-800 outline-none focus:bg-transparent focus:shadow-none"
            />
          </OutlinedField>
        ))}
        <OutlinedField label="Account">
          <select
            required
            value={values.account_id}
            onChange={(event) => update("account_id", event.target.value)}
            className="h-8 w-full border-0 bg-transparent p-0 text-sm text-slate-800 outline-none focus:bg-transparent focus:shadow-none"
          >
            <option value="">Select account</option>
            {accounts.map((account: any) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </OutlinedField>
        <OutlinedField label="Expense Category">
          <select
            required
            value={values.category_id}
            onChange={(event) => update("category_id", event.target.value)}
            className="h-8 w-full border-0 bg-transparent p-0 text-sm text-slate-800 outline-none focus:bg-transparent focus:shadow-none"
          >
            <option value="">Select category</option>
            {categories.map((category: any) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </OutlinedField>
        <OutlinedField label="Frequency">
          <select
            value={values.frequency}
            onChange={(event) => update("frequency", event.target.value)}
            className="h-8 w-full border-0 bg-transparent p-0 text-sm text-slate-800 outline-none focus:bg-transparent focus:shadow-none"
          >
            {["DAILY", "WEEKLY", "MONTHLY", "YEARLY"].map((frequency) => (
              <option key={frequency}>{frequency}</option>
            ))}
          </select>
        </OutlinedField>
        <label className="flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={values.is_active}
            onChange={(event) => update("is_active", event.target.checked)}
          />
          Active plan
        </label>
        <OutlinedField label="Note" className="sm:col-span-2">
          <textarea
            value={values.note}
            onChange={(event) => update("note", event.target.value)}
            className="min-h-20 w-full resize-y border-0 bg-transparent p-0 text-sm text-slate-800 outline-none focus:bg-transparent focus:shadow-none"
          />
        </OutlinedField>
      </form>
    </Modal>
  );
}
