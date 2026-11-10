import { useEffect, useState } from "react";
import { Modal } from "../../../components/Modal";
import type { BudgetApiItem, BudgetFormValues, CategoryOption } from "../types";

const emptyValues = (): BudgetFormValues => ({
  category_id: "",
  period_type: "monthly",
  amount: "",
  carry_forward: false,
});

interface BudgetFormProps {
  open: boolean;
  categories: CategoryOption[];
  editing: BudgetApiItem | null;
  onCancel: () => void;
  onSave: (values: BudgetFormValues) => Promise<void>;
}

export function BudgetForm({ open, categories, editing, onCancel, onSave }: BudgetFormProps) {
  const [values, setValues] = useState<BudgetFormValues>(emptyValues());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setValues(
      editing
        ? {
            category_id: String(editing.category_id),
            period_type: editing.period_type === "weekly" ? "weekly" : "monthly",
            amount: String(editing.amount ?? editing.effective_budget ?? ""),
            carry_forward: Boolean(editing.carry_forward),
          }
        : emptyValues(),
    );
  }, [editing]);

  const update = <Key extends keyof BudgetFormValues>(key: Key, value: BudgetFormValues[Key]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      await onSave(values);
      if (!editing) setValues(emptyValues());
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={onCancel}
      title={editing ? "Edit Budget" : "Add Budget"}
      size="2xl"
      footer={<><button type="button" onClick={onCancel} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancel</button><button form="budget-form" disabled={isSaving} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60">{isSaving ? "Saving..." : editing ? "Save changes" : "Add budget"}</button></>}
    >
      <p className="mb-5 text-sm text-slate-500">Set a category limit for your selected period. You will receive alerts at 50%, 80%, and 100% usage.</p>
      <form id="budget-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
          Expense category
          <select required value={values.category_id} onChange={(event) => update("category_id", event.target.value)} className="h-11 rounded-lg border border-slate-300 bg-white px-3 font-normal outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100">
            <option value="">Choose a category</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
          Budget period
          <select value={values.period_type} onChange={(event) => update("period_type", event.target.value as BudgetFormValues["period_type"])} className="h-11 rounded-lg border border-slate-300 bg-white px-3 font-normal outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100">
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
          Budget amount
          <div className="flex h-11 items-center rounded-lg border border-slate-300 bg-white px-3 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100">
            <span className="mr-2 text-xs font-bold text-slate-400">BDT</span>
            <input required min="0.01" step="0.01" type="number" inputMode="decimal" value={values.amount} onChange={(event) => update("amount", event.target.value)} placeholder="5,000" className="min-w-0 flex-1 outline-none" />
          </div>
        </label>
        <label className={`flex min-h-11 items-center gap-3 rounded-lg border px-3 sm:col-span-2 ${values.carry_forward ? "border-primary-300 bg-primary-50" : "border-slate-300"}`}>
          <input type="checkbox" checked={values.carry_forward} onChange={(event) => update("carry_forward", event.target.checked)} className="h-4 w-4 accent-primary-600" />
          <span><span className="block text-sm font-semibold text-slate-700">Carry unused amount</span><span className="block text-xs text-slate-500">Add it to the next period</span></span>
        </label>
      </form>
    </Modal>
  );
}
