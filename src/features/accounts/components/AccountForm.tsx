import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "../../../components/Modal";
import { outlinedControlClass, OutlinedField } from "../../../components/OutlinedField";
import type { AccountApiItem, AccountFormValues } from "../types";

const defaults: AccountFormValues = {
  name: "",
  type: "BANK",
  institution_name: "",
  opening_balance: "",
  opening_balance_date: "",
  low_balance_threshold: "",
  is_active: "1",
};
export function AccountForm({
  account,
  open,
  onClose,
  onSave,
}: {
  account: AccountApiItem | null;
  open: boolean;
  onClose: () => void;
  onSave: (values: AccountFormValues, id?: string | number) => Promise<void>;
}) {
  const [values, setValues] = useState<AccountFormValues>(defaults);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    setValues(
      account
        ? {
            name: account.name || "",
            type: String(
              account.type || "BANK",
            ).toUpperCase() as AccountFormValues["type"],
            institution_name: account.institution_name || "",
            opening_balance: "",
            opening_balance_date: "",
            low_balance_threshold: String(account.low_balance_threshold || ""),
            is_active:
              account.is_active === false ||
              account.is_active === 0 ||
              account.is_active === "0"
                ? "0"
                : "1",
          }
        : defaults,
    );
  }, [account, open]);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!values.name.trim()) return;
    setSaving(true);
    try {
      await onSave(values, account?.id);
      onClose();
    } finally {
      setSaving(false);
    }
  };
  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={account ? "Edit Account" : "New Account"}
      footer={
        <>
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600"
          >
            Cancel
          </button>
          <button
            form="account-form"
            type="submit"
            disabled={saving}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Account"}
          </button>
        </>
      }
    >
      <form
        id="account-form"
        onSubmit={submit}
        className="grid items-center gap-4 sm:grid-cols-2"
      >
        <OutlinedField label="Account name" className="sm:col-span-2">
          <input
            required
            value={values.name}
            onChange={(e) => setValues({ ...values, name: e.target.value })}
            className={outlinedControlClass}
            placeholder="Main Bank"
          />
        </OutlinedField>
        <OutlinedField label="Type">
          <select
            value={values.type}
            onChange={(e) =>
              setValues({
                ...values,
                type: e.target.value as AccountFormValues["type"],
              })
            }
            className={outlinedControlClass}
          >
            {[
              ["BANK", "Bank"],
              ["CASH", "Cash"],
              ["CARD", "Card"],
              ["MOBILE_BANKING", "Mobile Banking"],
            ].map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </OutlinedField>
        <OutlinedField label="Institution name">
          <input
            value={values.institution_name}
            onChange={(e) =>
              setValues({ ...values, institution_name: e.target.value })
            }
            className={outlinedControlClass}
            placeholder="DBBL / Visa / bKash"
          />
        </OutlinedField>
        {!account && (
          <OutlinedField label="Opening balance">
            <input
              type="number"
              min="0"
              step="0.01"
              value={values.opening_balance}
              onChange={(e) =>
                setValues({ ...values, opening_balance: e.target.value })
              }
              className={outlinedControlClass}
              placeholder="0.00"
            />
          </OutlinedField>
        )}
        <OutlinedField label="Low balance alert">
          <input
            type="number"
            min="0"
            step="0.01"
            value={values.low_balance_threshold}
            onChange={(e) =>
              setValues({ ...values, low_balance_threshold: e.target.value })
            }
            className={outlinedControlClass}
            placeholder="Optional threshold"
          />
        </OutlinedField>
        <OutlinedField label="Status">
          <select
            value={values.is_active}
            onChange={(e) =>
              setValues({ ...values, is_active: e.target.value as "1" | "0" })
            }
            className={outlinedControlClass}
          >
            <option value="1">Active</option>
            <option value="0">Inactive</option>
          </select>
        </OutlinedField>
      </form>
    </Modal>
  );
}
