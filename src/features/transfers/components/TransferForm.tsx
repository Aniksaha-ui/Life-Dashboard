import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "../../../components/Modal";
export function TransferForm({
  open,
  onClose,
  mode,
  transfer,
  accounts,
  onSave,
}: any) {
  const [values, setValues] = useState({
    from_account_id: "",
    to_account_id: "",
    amount: "",
    note: "",
    transfer_date: new Date().toISOString().slice(0, 10),
  });
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    setValues(
      transfer
        ? {
            from_account_id: String(
              transfer.from_account?.id || transfer.from_account_id || "",
            ),
            to_account_id: String(
              transfer.to_account?.id || transfer.to_account_id || "",
            ),
            amount: String(transfer.amount || ""),
            note: transfer.note || "",
            transfer_date: String(transfer.transfer_date || "").slice(0, 10),
          }
        : {
            from_account_id: "",
            to_account_id: "",
            amount: "",
            note: "",
            transfer_date: new Date().toISOString().slice(0, 10),
          },
    );
  }, [transfer, open]);
  const withdrawal = mode === "WITHDRAWAL";
  const sources = accounts.filter(
    (account: any) =>
      !withdrawal || String(account.type).toUpperCase() !== "CASH",
  );
  const destinations = accounts.filter(
    (account: any) =>
      (!withdrawal || String(account.type).toUpperCase() === "CASH") &&
      String(account.id) !== values.from_account_id,
  );
  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (values.from_account_id === values.to_account_id) return;
    setSaving(true);
    try {
      await onSave(mode, values, transfer?.id);
      onClose();
    } finally {
      setSaving(false);
    }
  };
  const inputClass =
    "mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm";
  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={
        transfer
          ? "Edit Transfer"
          : withdrawal
            ? "Withdraw To Cash"
            : "New Transfer"
      }
      footer={
        <button
          form="transfer-form"
          type="submit"
          disabled={saving}
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white"
        >
          {saving
            ? "Saving..."
            : transfer
              ? "Update Transfer"
              : "Save Transfer"}
        </button>
      }
    >
      <form
        id="transfer-form"
        onSubmit={save}
        className="grid gap-4 sm:grid-cols-2"
      >
        <label className="text-sm font-medium text-slate-700">
          Source Account
          <select
            required
            value={values.from_account_id}
            onChange={(e) =>
              setValues({ ...values, from_account_id: e.target.value })
            }
            className={inputClass}
          >
            <option value="">Select source account</option>
            {sources.map((account: any) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          Destination Account
          <select
            required
            value={values.to_account_id}
            onChange={(e) =>
              setValues({ ...values, to_account_id: e.target.value })
            }
            className={inputClass}
          >
            <option value="">Select destination account</option>
            {destinations.map((account: any) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          Amount
          <input
            required
            min="0.01"
            step="0.01"
            type="number"
            value={values.amount}
            onChange={(e) => setValues({ ...values, amount: e.target.value })}
            className={inputClass}
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Transfer Date
          <input
            type="date"
            value={values.transfer_date}
            onChange={(e) =>
              setValues({ ...values, transfer_date: e.target.value })
            }
            className={inputClass}
          />
        </label>
        <label className="sm:col-span-2 text-sm font-medium text-slate-700">
          Note
          <textarea
            value={values.note}
            onChange={(e) => setValues({ ...values, note: e.target.value })}
            className={inputClass}
          />
        </label>
      </form>
    </Modal>
  );
}
