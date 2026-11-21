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
      onClose();
    } finally {
      setSaving(false);
    }
  };
  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Bulk Transaction Entry"
      size="5xl"
      footer={
        <>
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600"
          >
            Cancel
          </button>
          <button
            onClick={() => void save()}
            disabled={saving}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Saving..." : `Create ${entries.length} Transactions`}
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-slate-900">
                Paste transaction text
              </p>
              <p className="text-sm text-slate-500">
                Date on its own line (DD-MM-YYYY), then note followed by amount.
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
              onClick={() => fileInput.current?.click()}
              disabled={scanning}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
            >
              <FileScan className="h-4 w-4" />
              {scanning ? "Scanning..." : "Scan Receipt"}
            </button>
          </div>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={"10-10-2026\nHome to office 80\nOffice to home 80"}
            className="mt-3 w-full rounded-lg border border-slate-300 p-3 text-sm"
            rows={4}
          />
          {parsed.entries.length > 0 && (
            <div className="mt-3 rounded-lg border border-primary-200 bg-white p-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <strong className="text-slate-900">Entry preview</strong>
                <span className="text-primary-700">
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
                    <span>{formatPreviewDate(entry.transaction_date)}</span>
                    <span className="truncate">{entry.note}</span>
                    <strong className="text-slate-900">{entry.amount}</strong>
                  </div>
                ))}
              </div>
              {parsed.entries.length > 10 && (
                <p className="mt-2 text-slate-500">
                  Showing the first 10 entries.
                </p>
              )}
              {parsed.invalidLines.length > 0 && (
                <p className="mt-2 text-amber-700">
                  Lines {parsed.invalidLines.join(", ")} will be skipped.
                </p>
              )}
            </div>
          )}
          <button
            onClick={importText}
            className="mt-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-primary-700 ring-1 ring-primary-200"
          >
            Fill Transactions from Text
          </button>
        </div>
        {error && (
          <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </p>
        )}
        {message && (
          <p className="rounded-lg bg-cyan-50 p-3 text-sm text-cyan-700">
            {message}
          </p>
        )}
        <div className="space-y-3">
          {entries.map((entry, index) => (
            <div
              key={index}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <p className="text-sm font-semibold text-slate-700">
                  Transaction {index + 1}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setEntries((current) =>
                      current.length > 1
                        ? current.filter(
                            (_, entryIndex) => entryIndex !== index,
                          )
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
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <OutlinedField label="Type">
                  <select
                    value={entry.entry_type}
                    onChange={(event) =>
                      update(index, {
                        entry_type: event.target
                          .value as BulkEntry["entry_type"],
                        category_id: "",
                      })
                    }
                    className={outlinedControlClass}
                  >
                    <option value="EXPENSE">Expense</option>
                    <option value="INCOME">Income</option>
                    <option value="DEPOSIT">Deposit</option>
                  </select>
                </OutlinedField>
                <OutlinedField label="Account">
                  <select
                    value={entry.account_id}
                    onChange={(event) =>
                      update(index, { account_id: event.target.value })
                    }
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
                {entry.entry_type !== "DEPOSIT" && (
                  <OutlinedField label="Category">
                    <select
                      value={entry.category_id}
                      onChange={(event) =>
                        update(index, { category_id: event.target.value })
                      }
                      className={outlinedControlClass}
                    >
                      <option value="">Select category</option>
                      {categories
                        .filter(
                          (category) =>
                            String(category.type).toUpperCase() ===
                            entry.entry_type,
                        )
                        .map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                    </select>
                  </OutlinedField>
                )}
                <OutlinedField label="Amount">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={entry.amount}
                    onChange={(event) =>
                      update(index, { amount: event.target.value })
                    }
                    placeholder="0.00"
                    className={outlinedControlClass}
                  />
                </OutlinedField>
                <OutlinedField label="Date">
                  <input
                    type="date"
                    value={entry.transaction_date}
                    onChange={(event) =>
                      update(index, { transaction_date: event.target.value })
                    }
                    className={outlinedControlClass}
                  />
                </OutlinedField>
                <OutlinedField
                  label="Note"
                  className="sm:col-span-2 xl:col-span-3"
                >
                  <textarea
                    value={entry.note}
                    onChange={(event) =>
                      update(index, { note: event.target.value })
                    }
                    placeholder="Add a note (optional)"
                    rows={2}
                    className="min-h-16 w-full resize-y border-0 bg-transparent p-0 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:bg-transparent focus:shadow-none"
                  />
                </OutlinedField>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() =>
            setEntries((current) =>
              current.length < 100 ? [...current, newEntry()] : current,
            )
          }
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
        >
          <Plus className="h-4 w-4" />
          Add Transaction
        </button>
      </div>
    </Modal>
  );
}
