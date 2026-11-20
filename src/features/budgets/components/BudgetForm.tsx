import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "../../../components/Modal";
import { outlinedControlClass, OutlinedField } from "../../../components/OutlinedField";
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
  const { register, handleSubmit, reset, formState: { errors } } = useForm<BudgetFormValues>({ defaultValues: emptyValues() });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    reset(
      editing
        ? {
            category_id: String(editing.category_id),
            period_type: editing.period_type === "weekly" ? "weekly" : "monthly",
            amount: String(editing.amount ?? editing.effective_budget ?? ""),
            carry_forward: Boolean(editing.carry_forward),
          }
        : emptyValues(),
    );
  }, [editing, reset]);

  const submit = async (values: BudgetFormValues) => {
    setIsSaving(true);
    try {
      await onSave(values);
      if (!editing) reset(emptyValues());
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
      <form id="budget-form" onSubmit={handleSubmit(submit)} noValidate className="grid items-start gap-4 sm:grid-cols-2">
        <div>
          <OutlinedField label="Expense category">
            <select {...register("category_id", { required: "Choose an expense category." })} aria-invalid={Boolean(errors.category_id)} className={outlinedControlClass}>
              <option value="">Choose a category</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </OutlinedField>
          {errors.category_id && <p className="mt-1 text-xs text-rose-600">{errors.category_id.message}</p>}
        </div>
        <div>
          <OutlinedField label="Budget period">
            <select {...register("period_type", { validate: (value) => value === "weekly" || value === "monthly" || "Choose weekly or monthly." })} aria-invalid={Boolean(errors.period_type)} className={outlinedControlClass}>
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
            </select>
          </OutlinedField>
          {errors.period_type && <p className="mt-1 text-xs text-rose-600">{errors.period_type.message}</p>}
        </div>
        <div>
          <OutlinedField label="Budget amount">
            <span className="text-xs font-bold text-slate-400">BDT</span>
            <input {...register("amount", { required: "Enter a budget amount.", validate: (value) => Number(value) >= 0.01 || "Amount must be at least 0.01." })} min="0.01" step="0.01" type="number" inputMode="decimal" placeholder="5,000" aria-invalid={Boolean(errors.amount)} className={outlinedControlClass} />
          </OutlinedField>
          {errors.amount && <p className="mt-1 text-xs text-rose-600">{errors.amount.message}</p>}
        </div>
        <label className="flex min-h-10 items-center gap-3 self-start rounded-md border border-slate-300 bg-white px-3 sm:col-span-2">
          <input type="checkbox" {...register("carry_forward")} className="h-4 w-4 accent-primary-600" />
          <span><span className="block text-sm font-semibold text-slate-700">Carry unused amount</span><span className="block text-xs text-slate-500">Add it to the next period</span></span>
        </label>
      </form>
    </Modal>
  );
}
