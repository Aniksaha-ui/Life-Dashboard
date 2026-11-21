import { FileScan, Plus, Trash2 } from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";

const MAX_ENTRIES = 100;
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

const todayInput = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
};

const isBlankEntry = (entry: BulkEntry) =>
  !entry.account_id && !entry.category_id && !entry.amount && !entry.note.trim();

const parseText = (text: string) => {
  let date = todayInput();
  const entries: BulkEntry[] = [];
  const invalidLines: number[] = [];
  const sourceLines: Array<{ raw: string; kind: "date" | "entry" | "invalid" }> = [];
  text.split(/\r?\n/).forEach((rawLine, index) => {
    const line = rawLine.trim();
    if (!line) return;
    const dateMatch = line.match(
      /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})(?:\s*\([^)]*\))?$/,
    );
    if (dateMatch) {
      date = `${dateMatch[3]}-${dateMatch[2].padStart(2, "0")}-${dateMatch[1].padStart(2, "0")}`;
      sourceLines.push({ raw: line, kind: "date" });
      return;
    }
    const entryMatch = line.match(/^(.+?)\s+([0-9][0-9,]*(?:\.\d{1,2})?)$/);
    if (
      !entryMatch ||
      Number(entryMatch[2].replaceAll(",", "")) <= 0
    ) {
      invalidLines.push(index + 1);
      sourceLines.push({ raw: line, kind: "invalid" });
      return;
    }
    entries.push({
      ...newEntry(date),
      note: entryMatch[1].trim(),
      amount: entryMatch[2].replaceAll(",", ""),
    });
    sourceLines.push({ raw: line, kind: "entry" });
  });
  return { entries, invalidLines, sourceLines };
};

const getUnimportedText = (
  sourceLines: ReturnType<typeof parseText>["sourceLines"],
  importedCount: number,
) => {
  const kept: string[] = [];
  let pendingDate = "";
  let entryIndex = 0;
  sourceLines.forEach((line) => {
    if (line.kind === "date") {
      pendingDate = line.raw;
      return;
    }
    if (line.kind === "entry" && entryIndex++ < importedCount) return;
    if (pendingDate) {
      kept.push(pendingDate);
      pendingDate = "";
    }
    kept.push(line.raw);
  });
  return kept.join("\n");
};

const getEntryErrors = (entry: BulkEntry) => ({
  account: !entry.account_id,
  category: entry.entry_type === "EXPENSE" && !entry.category_id,
  amount: !(Number(entry.amount) > 0),
});

const hasEntryErrors = (entry: BulkEntry) =>
  Object.values(getEntryErrors(entry)).some(Boolean);

const invalidFieldClass = "border-rose-400! focus-within:border-rose-500!";

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
  const [entries, setEntries] = useState<BulkEntry[]>(() => [newEntry(todayInput())]);
  const [text, setText] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const entriesRef = useRef<HTMLDivElement>(null);
  const addEntries = (incoming: BulkEntry[]) => {
    const kept = entries.filter((entry) => !isBlankEntry(entry));
    const added = incoming.slice(0, MAX_ENTRIES - kept.length);
    if (!added.length) {
      setError(`You can save up to ${MAX_ENTRIES} entries at a time.`);
      return 0;
    }
    setEntries([...kept, ...added]);
    setShowErrors(false);
    setError("");
    requestAnimationFrame(() =>
      entriesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
    return added.length;
  };
  const describeAdded = (added: number, total: number, source: string) =>
    `${added} ${added === 1 ? "entry" : "entries"} added from ${source}.${added < total ? ` ${total - added} left out (limit is ${MAX_ENTRIES}).` : ""} Choose an account and category, then save.`;
  const parsed = parseText(text);
  const update = (index: number, patch: Partial<BulkEntry>) =>
    setEntries((current) =>
      current.map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, ...patch } : entry,
      ),
    );
  const importText = () => {
    if (!parsed.entries.length) {
      setError('Add one entry per line as "note amount", for example: Lunch 250.');
      return;
    }
    const added = addEntries(parsed.entries);
    if (!added) return;
    const unimported = getUnimportedText(parsed.sourceLines, added);
    setText(unimported);
    setMessage(
      `${describeAdded(added, parsed.entries.length, "text")}${unimported ? " Lines that were not added are still in the Quick fill box." : ""}`,
    );
  };
  const onReceipt = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setScanning(true);
    setError("");
    setMessage("");
    try {
      const result = await scanReceipt(file);
      const items = Array.isArray(result.items) ? result.items : [];
      if (!items.length)
        throw new Error("No line items were found in this receipt.");
      const added = addEntries(
        items.map((item: any) => ({
          ...newEntry(item.transaction_date || result.transaction_date || todayInput()),
          entry_type: ["EXPENSE", "INCOME", "DEPOSIT"].includes(item.type)
            ? item.type
            : "EXPENSE",
          amount: String(item.amount || ""),
          note: [result.merchant, item.description, item.note]
            .filter(Boolean)
            .join(" — "),
        })),
      );
      if (added) setMessage(describeAdded(added, items.length, "the receipt"));
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
  const invalidCount = entries.filter(hasEntryErrors).length;
  const save = async () => {
    setMessage("");
    if (invalidCount > 0) {
      setShowErrors(true);
      setError(
        `${invalidCount} ${invalidCount === 1 ? "entry needs" : "entries need"} attention. Each entry needs an account and an amount above 0; expenses also need a category.`,
      );
      return;
    }
    setError("");
    setSaving(true);
    try {
      await onSave(entries);
      setEntries([newEntry(todayInput())]);
      setShowErrors(false);
      setText("");
      setMessage("");
      setError("");
      onClose();
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Unable to save transactions.",
      );
    } finally {
      setSaving(false);
    }
  };
  const categoryOptionsFor = (type: BulkEntry["entry_type"]) => {
    const typed = categories.filter(
      (category) => String(category.type).toUpperCase() === type,
    );
    return typed.length ? typed : categories;
  };
  const commonValue = (values: string[]) =>
    values.length && values.every((value) => value === values[0]) ? values[0] : "";
  const commonAccount = commonValue(entries.map((entry) => entry.account_id));
  const categorized = entries.filter((entry) => entry.entry_type !== "DEPOSIT");
  const commonCategory = commonValue(categorized.map((entry) => entry.category_id));
  const sharedCategories = categories.filter((category) =>
    categorized.some((entry) => categoryOptionsFor(entry.entry_type).includes(category)),
  );
  const applyAccount = (accountId: string) =>
    setEntries((current) => current.map((entry) => ({ ...entry, account_id: accountId })));
  const applyCategory = (categoryId: string) =>
    setEntries((current) =>
      current.map((entry) =>
        entry.entry_type !== "DEPOSIT" &&
        (!categoryId ||
          categoryOptionsFor(entry.entry_type).some(
            (category) => String(category.id) === categoryId,
          ))
          ? { ...entry, category_id: categoryId }
          : entry,
      ),
    );
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
          {showErrors && invalidCount > 0 ? (
            <p className="mr-auto text-xs font-semibold text-rose-600 sm:text-sm">
              {invalidCount} {invalidCount === 1 ? "entry needs" : "entries need"} attention
            </p>
          ) : (
          <p className="mr-auto text-xs text-slate-500 sm:text-sm">
            <span className="font-semibold text-slate-800">{entries.length}</span>{" "}
            {entries.length === 1 ? "entry" : "entries"} ·{" "}
            <span className="font-semibold tabular-nums text-slate-800">
              BDT {total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </p>
          )}
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
              <p className="text-sm font-semibold text-slate-900">
                Quick fill <span className="font-normal text-slate-400">(optional)</span>
              </p>
              <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                Type one entry per line as "note amount", or scan a receipt. Put a date
                (DD-MM-YYYY) on its own line to date the entries below it; otherwise today is used.
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
            onKeyDown={(event) => {
              if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
                event.preventDefault();
                importText();
              }
            }}
            aria-label="Entries as text"
            placeholder={"Home to office 80\nLunch 250\n10-10-2026\nGroceries 1,450"}
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
                  {parsed.invalidLines.length === 1 ? "Line" : "Lines"}{" "}
                  {parsed.invalidLines.join(", ")} will be skipped.
                </p>
              )}
            </div>
          )}
          {text.trim() && !parsed.entries.length && (
            <p className="mt-2 text-xs text-amber-700">
              No entries found yet. Each line needs a note followed by an amount, like "Lunch 250".
            </p>
          )}
          {text.trim() && (
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={importText}
                disabled={!parsed.entries.length}
                className="w-full rounded-lg bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 disabled:opacity-50 sm:w-auto"
              >
                {parsed.entries.length
                  ? `Add ${parsed.entries.length} ${parsed.entries.length === 1 ? "entry" : "entries"}`
                  : "Add entries"}
              </button>
            </div>
          )}
        </section>
        <div ref={entriesRef} className="scroll-mt-4 space-y-3">
        {error && (
          <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </p>
        )}
        {message && (
          <p className="rounded-lg bg-cyan-50 p-3 text-sm text-cyan-700">{message}</p>
        )}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-slate-900">
              Entries <span className="font-normal text-slate-400">({entries.length})</span>
            </p>
            {entries.length > 1 && (
              <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                <span className="col-span-2 text-xs font-medium text-slate-500 sm:col-span-1">
                  Set for all
                </span>
                <select
                  aria-label="Set account for all entries"
                  value={commonAccount}
                  onChange={(event) => applyAccount(event.target.value)}
                  className="h-9 min-w-0 rounded-lg border border-slate-300 bg-white px-2 text-sm text-slate-700 sm:w-44"
                >
                  <option value="">{commonAccount ? "No account" : "Account"}</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Set category for all entries"
                  value={commonCategory}
                  onChange={(event) => applyCategory(event.target.value)}
                  disabled={!categorized.length}
                  className="h-9 min-w-0 rounded-lg border border-slate-300 bg-white px-2 text-sm text-slate-700 disabled:opacity-50 sm:w-44"
                >
                  <option value="">{commonCategory ? "No category" : "Category"}</option>
                  {sharedCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          {entries.map((entry, index) => {
            const fieldErrors = showErrors ? getEntryErrors(entry) : null;
            const invalid = Boolean(fieldErrors && Object.values(fieldErrors).some(Boolean));
            return (
            <div
              key={index}
              className={`rounded-2xl border bg-white p-3 shadow-sm sm:p-4 ${invalid ? "border-rose-300" : "border-slate-200"}`}
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${invalid ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-600"}`}>
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
                        onClick={() => {
                          if (entry.entry_type !== option.value)
                            update(index, { entry_type: option.value, category_id: "" });
                        }}
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
                <OutlinedField label="Account *" className={fieldErrors?.account ? invalidFieldClass : ""}>
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
                  <OutlinedField
                    label={entry.entry_type === "EXPENSE" ? "Category *" : "Category"}
                    className={fieldErrors?.category ? invalidFieldClass : ""}
                  >
                    <select
                      value={entry.category_id}
                      onChange={(event) => update(index, { category_id: event.target.value })}
                      className={outlinedControlClass}
                    >
                      <option value="">Select category</option>
                      {categoryOptionsFor(entry.entry_type).map((category) => (
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
                <OutlinedField label="Amount *" className={fieldErrors?.amount ? invalidFieldClass : ""}>
                  <span className="text-xs font-semibold text-slate-400">BDT</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0.01"
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
              {invalid && (
                <p className="mt-3 text-xs font-medium text-rose-600">
                  Missing:{" "}
                  {[
                    fieldErrors?.account && "account",
                    fieldErrors?.category && "category",
                    fieldErrors?.amount && "amount above 0",
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}
            </div>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() =>
            setEntries((current) =>
              current.length < MAX_ENTRIES
                ? [...current, newEntry(current[current.length - 1]?.transaction_date || todayInput())]
                : current,
            )
          }
          disabled={entries.length >= MAX_ENTRIES}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 py-3 text-sm font-semibold text-slate-600 transition-colors hover:border-primary-300 hover:bg-primary-50/40 hover:text-primary-700 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Add another entry
        </button>
      </div>
    </Modal>
  );
}
