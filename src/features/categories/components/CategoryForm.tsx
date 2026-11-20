import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "../../../components/Modal";
import { outlinedControlClass, OutlinedField } from "../../../components/OutlinedField";
import type { CategoryFormValues, CategoryRow } from "../types";

const defaults: CategoryFormValues = { name: "", type: "EXPENSE" };
export function CategoryForm({
  category,
  open,
  onClose,
  onSave,
}: {
  category: CategoryRow | null;
  open: boolean;
  onClose: () => void;
  onSave: (values: CategoryFormValues, id?: string | number) => Promise<void>;
}) {
  const [values, setValues] = useState<CategoryFormValues>(defaults);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    setValues(
      category ? { name: category.name, type: category.type } : defaults,
    );
  }, [category, open]);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await onSave(values, category?.id);
      onClose();
    } finally {
      setSaving(false);
    }
  };
  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={category ? "Edit Category" : "New Category"}
      footer={
        <>
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600"
          >
            Cancel
          </button>
          <button
            form="category-form"
            type="submit"
            disabled={saving}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Category"}
          </button>
        </>
      }
    >
      <form id="category-form" onSubmit={submit} className="grid items-center gap-4">
        <OutlinedField label="Category name">
          <input
            required
            maxLength={255}
            value={values.name}
            onChange={(event) =>
              setValues({ ...values, name: event.target.value })
            }
            className={outlinedControlClass}
            placeholder="Groceries"
          />
        </OutlinedField>
        <OutlinedField label="Type">
          <select
            value={values.type}
            onChange={(event) =>
              setValues({
                ...values,
                type: event.target.value as CategoryFormValues["type"],
              })
            }
            className={outlinedControlClass}
          >
            <option value="EXPENSE">Expense</option>
            <option value="INCOME">Income</option>
          </select>
        </OutlinedField>
      </form>
    </Modal>
  );
}
