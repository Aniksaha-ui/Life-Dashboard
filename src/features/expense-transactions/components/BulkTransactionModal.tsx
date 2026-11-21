import { FileScan, Plus, Trash2 } from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";
import { Modal } from "../../../components/Modal";
import {
  OutlinedField,
  outlinedControlClass,
} from "../../../components/OutlinedField";
import { scanReceipt } from "../api/queries";

export type BulkEntry = {
  entry_type: "EXPENSE" | "INCOME" | "DEPOSIT";
  account_id: string;
  category_id: string;
  amount: string;
  note: string;
  transaction_date: string;
};

const newEntry = (date = ""): BulkEntry => ({
  entry_type: "EXPENSE",
  account_id: "",
  category_id: "",
  amount: "",
  note: "",
  transaction_date: date,
});

const parseText = (text: string) => {
  let date = "";
  const entries: BulkEntry[] = [];
  const invalidLines: number[] = [];
  text.split(/\r?\n/).forEach((rawLine, index) => {
    const line = rawLine.trim();
    if (!line) return;
    const dateMatch = line.match(
      /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})(?:\s*\([^)]*\))?$/,
    );
    if (dateMatch) {
      date = `${dateMatch[3]}-${dateMatch[2].padStart(2, "0")}-${dateMatch[1].padStart(2, "0")}`;
      return;
    }
    const entryMatch = line.match(/^(.+?)\s+([0-9][0-9,]*(?:\.\d{1,2})?)$/);
    if (
      !entryMatch ||
      !date ||
      Number(entryMatch[2].replaceAll(",", "")) <= 0
    ) {
      invalidLines.push(index + 1);
      return;
    }
    entries.push({
      ...newEntry(date),
      note: entryMatch[1].trim(),
      amount: entryMatch[2].replaceAll(",", ""),
    });
  });
  return { entries, invalidLines };
};

const formatPreviewDate = (value: string) => {
  const [year, month, day] = value.split("-");

  return year && month && day ? `${day}-${month}-${year}` : value;
};

export function BulkTransactionModal({
  open,
  onClose,
  accounts,
  categories,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  accounts: any[];
  categories: any[];
  onSave: (entries: BulkEntry[]) => Promise<void>;
}) {
  const [entries, setEntries] = useState<BulkEntry[]>([newEntry()]);
  const [text, setText] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [scanning, setScanning] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const parsed = parseText(text);
  const update = (index: number, patch: Partial<BulkEntry>) =>
    setEntries((current) =>
      current.map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, ...patch } : entry,
      ),
    );
  const importText = () => {
    if (!parsed.entries.length) {
      setError(
        "Add a date line (DD-MM-YYYY), followed by each note and amount.",
      );
      return;
    }
    setEntries(parsed.entries.slice(0, 100));
    setError("");
    setMessage(
      `${Math.min(parsed.entries.length, 100)} entries added from text.${parsed.invalidLines.length ? ` ${parsed.invalidLines.length} invalid lines were skipped.` : ""}`,
    );
  };
  const onReceipt = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setScanning(true);
    setError("");
    try {
      const result = await scanReceipt(file);
      const items = Array.isArray(result.items) ? result.items : [];
      if (!items.length)
        throw new Error("No line items were found in this receipt.");
      setEntries(
        items.slice(0, 100).map((item: any) => ({
          ...newEntry(item.transaction_date || result.transaction_date || ""),
          entry_type: ["EXPENSE", "INCOME", "DEPOSIT"].includes(item.type)
            ? item.type
            : "EXPENSE",
          amount: String(item.amount || ""),
          note: [result.merchant, item.description, item.note]
            .filter(Boolean)
            .join(" — "),
        })),
      );
      setMessage(
        `${items.length} receipt line items added. Review them before saving.`,
      );
    } catch (scanError) {
      setError(
        scanError instanceof Error
          ? scanError.message
          : "Unable to scan receipt.",
      );
    } finally {
      setScanning(false);
    }
  };
  const save = async () => {
    if (
      entries.some(
        (entry) =>
          !entry.account_id ||
          !entry.amount ||
          (entry.entry_type === "EXPENSE" && !entry.category_id),
      )
    ) {
      setError(
        "Each entry needs an account and amount; expenses also need a category.",
      );
      return;
    }
    setSaving(true);
    try {
      await onSave(entries);
      setEntries([newEntry()]);
      setText("");
      setMessage("");
      setError("");
      onClose();
    } finally {
      setSaving(false);
    }
  };
  const total = entries.reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);
  const typeOptions: Array<{ value: BulkEntry["entry_type"]; label: string; active: string }> = [
    { value: "EXPENSE", label: "Expense", active: "bg-rose-600 text-white" },
    { value: "INCOME", label: "Income", active: "bg-emerald-600 text-white" },
    { value: "DEPOSIT", label: "Deposit", active: "bg-cyan-600 text-white" },
  ];
  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Bulk entry"
      size="5xl"
      footer={
        <>
          <p className="mr-auto text-xs text-slate-500 sm:text-sm">
            <span className="font-semibold text-slate-800">{entries.length}</span>{" "}
            {entries.length === 1 ? "entry" : "entries"} ·{" "}
            <span className="font-semibold tabular-nums text-slate-800">
              BDT {total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 disabled:opacity-60"
          >
            {saving
              ? "Saving..."
              : `Save ${entries.length} ${entries.length === 1 ? "transaction" : "transactions"}`}
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Quick fill</p>
              <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                Paste a date line (DD-MM-YYYY), then one "note amount" per line — or scan a receipt.
              </p>
            </div>
            <input
              ref={fileInput}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={onReceipt}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              disabled={scanning}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
            >
              <FileScan className="h-4 w-4" />
              {scanning ? "Scanning..." : "Scan receipt"}
            </button>
          </div>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={"10-10-2026\nHome to office 80\nOffice to home 80"}
            className="mt-3 w-full rounded-lg border border-slate-300 bg-white p-3 font-mono text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-primary-600 focus:shadow-[0_0_0_3px_rgb(41_92_171_/_0.12)]"
            rows={4}
          />
          {parsed.entries.length > 0 && (
            <div className="mt-3 rounded-lg border border-primary-200 bg-white p-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <strong className="text-slate-900">Preview</strong>
                <span className="text-xs font-semibold text-primary-700">
                  {parsed.entries.length}{" "}
                  {parsed.entries.length === 1 ? "entry" : "entries"} found
                </span>
              </div>
              <div className="mt-2 divide-y divide-slate-100">
                {parsed.entries.slice(0, 10).map((entry, index) => (
                  <div
                    key={`${entry.transaction_date}-${entry.note}-${index}`}
                    className="grid grid-cols-[auto_1fr_auto] gap-3 py-2 text-slate-600"
                  >
                    <span className="text-xs tabular-nums text-slate-400">
                      {formatPreviewDate(entry.transaction_date)}
                    </span>
                    <span className="truncate">{entry.note}</span>
                    <strong className="tabular-nums text-slate-900">{entry.amount}</strong>
                  </div>
                ))}
              </div>
              {parsed.entries.length > 10 && (
                <p className="mt-2 text-xs text-slate-500">Showing the first 10 entries.</p>
              )}
              {parsed.invalidLines.length > 0 && (
                <p className="mt-2 text-xs text-amber-700">
                  Lines {parsed.invalidLines.join(", ")} will be skipped.
                </p>
              )}
            </div>
          )}
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={importText}
              disabled={!text.trim()}
              className="w-full rounded-lg bg-white px-3 py-2 text-sm font-semibold text-primary-700 ring-1 ring-primary-200 hover:bg-primary-50 disabled:opacity-50 sm:w-auto"
            >
              Fill entries from text
            </button>
          </div>
        </section>
        {error && (
          <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </p>
        )}
        {message && (
          <p className="rounded-lg bg-cyan-50 p-3 text-sm text-cyan-700">{message}</p>
        )}
        <div className="space-y-3">
          {entries.map((entry, index) => (
            <div
              key={index}
              className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                    {index + 1}
                  </span>
                  <div
                    role="radiogroup"
                    aria-label={`Type for entry ${index + 1}`}
                    className="inline-flex rounded-lg bg-slate-100 p-0.5"
                  >
                    {typeOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={entry.entry_type === option.value}
                        onClick={() =>
                          update(index, { entry_type: option.value, category_id: "" })
                        }
                        className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors sm:px-3 ${entry.entry_type === option.value ? `${option.active} shadow-sm` : "text-slate-600 hover:text-slate-900"}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setEntries((current) =>
                      current.length > 1
                        ? current.filter((_, entryIndex) => entryIndex !== index)
                        : current,
                    )
                  }
                  disabled={entries.length === 1}
                  aria-label={`Remove transaction ${index + 1}`}
                  title={
                    entries.length === 1
                      ? "At least one transaction is required"
                      : "Remove transaction"
                  }
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <OutlinedField label="Account">
                  <select
                    value={entry.account_id}
                    onChange={(event) => update(index, { account_id: event.target.value })}
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
                {entry.entry_type !== "DEPOSIT" ? (
                  <OutlinedField label="Category">
                    <select
                      value={entry.category_id}
                      onChange={(event) => update(index, { category_id: event.target.value })}
                      className={outlinedControlClass}
                    >
                      <option value="">Select category</option>
                      {categories
                        .filter(
                          (category) =>
                            String(category.type).toUpperCase() === entry.entry_type,
                        )
                        .map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                    </select>
                  </OutlinedField>
                ) : (
                  <div className="hidden h-10 items-center rounded-md border border-dashed border-slate-200 px-3 text-xs text-slate-400 sm:flex">
                    No category needed
                  </div>
                )}
                <OutlinedField label="Amount">
                  <span className="text-xs font-semibold text-slate-400">BDT</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    value={entry.amount}
                    onChange={(event) => update(index, { amount: event.target.value })}
                    placeholder="0.00"
                    className={outlinedControlClass}
                  />
                </OutlinedField>
                <OutlinedField label="Date">
                  <input
                    type="date"
                    value={entry.transaction_date}
                    onChange={(event) => update(index, { transaction_date: event.target.value })}
                    className={outlinedControlClass}
                  />
                </OutlinedField>
                <OutlinedField label="Note" className="sm:col-span-2 lg:col-span-4">
                  <input
                    type="text"
                    value={entry.note}
                    onChange={(event) => update(index, { note: event.target.value })}
                    placeholder="Add a note (optional)"
                    className={outlinedControlClass}
                  />
                </OutlinedField>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() =>
            setEntries((current) =>
              current.length < 100 ? [...current, newEntry()] : current,
            )
          }
          disabled={entries.length >= 100}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 py-3 text-sm font-semibold text-slate-600 transition-colors hover:border-primary-300 hover:bg-primary-50/40 hover:text-primary-700 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Add another entry
        </button>
      </div>
    </Modal>
  );
}
