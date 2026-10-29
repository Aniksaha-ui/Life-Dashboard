import { FileScan, Plus, Trash2 } from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";
import { Modal } from "../../../components/Modal";
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
              className="grid gap-3 rounded-lg border border-slate-200 p-4 md:grid-cols-6"
            >
              <select
                value={entry.entry_type}
                onChange={(event) =>
                  update(index, {
                    entry_type: event.target.value as BulkEntry["entry_type"],
                    category_id: "",
                  })
                }
                className="rounded-lg border border-slate-300 p-2 text-sm"
              >
                <option value="EXPENSE">Expense</option>
                <option value="INCOME">Income</option>
                <option value="DEPOSIT">Deposit</option>
              </select>
              <select
                value={entry.account_id}
                onChange={(event) =>
                  update(index, { account_id: event.target.value })
                }
                className="rounded-lg border border-slate-300 p-2 text-sm"
              >
                <option value="">Account</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
              {entry.entry_type !== "DEPOSIT" ? (
                <select
                  value={entry.category_id}
                  onChange={(event) =>
                    update(index, { category_id: event.target.value })
                  }
                  className="rounded-lg border border-slate-300 p-2 text-sm"
                >
                  <option value="">Category</option>
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
              ) : (
                <div className="p-2 text-sm text-slate-400">No category</div>
              )}
              <input
                type="number"
                min="0"
                step="0.01"
                value={entry.amount}
                onChange={(event) =>
                  update(index, { amount: event.target.value })
                }
                placeholder="Amount"
                className="rounded-lg border border-slate-300 p-2 text-sm"
              />
              <input
                type="date"
                value={entry.transaction_date}
                onChange={(event) =>
                  update(index, { transaction_date: event.target.value })
                }
                className="rounded-lg border border-slate-300 p-2 text-sm"
              />
              <button
                onClick={() =>
                  setEntries((current) =>
                    current.length > 1
                      ? current.filter((_, entryIndex) => entryIndex !== index)
                      : current,
                  )
                }
                className="inline-flex items-center justify-center rounded-lg text-rose-600 hover:bg-rose-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <input
                value={entry.note}
                onChange={(event) =>
                  update(index, { note: event.target.value })
                }
                placeholder="Note"
                className="md:col-span-5 rounded-lg border border-slate-300 p-2 text-sm"
              />
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
