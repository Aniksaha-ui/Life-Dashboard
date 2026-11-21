import { Pencil } from "lucide-react";
import { Drawer } from "../../../components/Drawer";
import {
  amountPrefix,
  amountToneClass,
  getTransactionDirection,
  getTransactionTypeMeta,
  isTransactionEditable,
} from "./transactionTypes";

type Transaction = Record<string, unknown>;

const labelFor = (key: string) =>
  key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (value) => value.toUpperCase());

const formatDate = (value: unknown, withTime = false) => {
  if (!value) return "—";

  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);

  return withTime
    ? date.toLocaleString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

const displayValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    return String(record.name ?? record.title ?? record.id ?? "—");
  }
  return String(value);
};

const formatAmount = (value: unknown) =>
  `BDT ${Number(value ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const humanizeType = (value: unknown) =>
  String(value ?? "Transaction")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

function InformationRow({
  items,
}: {
  items: Array<{ label: string; value: React.ReactNode; className?: string }>;
}) {
  return (
    <div className="grid grid-cols-2 divide-x divide-slate-100">
      {items.map(({ label, value, className }) => (
        <div
          key={label}
          className={`min-w-0 px-4 py-3 sm:px-5 ${items.length === 1 ? "col-span-2" : ""} ${className ?? ""}`}
        >
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </dt>
          <dd className="mt-1 break-words text-sm font-medium text-slate-800">
            {value}
          </dd>
        </div>
      ))}
    </div>
  );
}

function InformationCard({ children }: { children: React.ReactNode }) {
  return (
    <dl className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {children}
    </dl>
  );
}

export function TransactionDetailsDrawer({
  transaction,
  onClose,
  onEdit,
}: {
  transaction: Transaction | null;
  onClose: () => void;
  onEdit?: (transaction: Transaction) => void;
}) {
  const type = humanizeType(transaction?.type);
  const note = String(transaction?.note || "Transaction details");
  const transactionId = displayValue(transaction?.id);
  const additionalDetails = transaction
    ? Object.entries(transaction).filter(
        ([key, value]) =>
          !new Set([
            "id",
            "serial",
            "type",
            "transaction_date",
            "dateLabel",
            "amount",
            "amountLabel",
            "balance_before",
            "balanceBeforeLabel",
            "balance_after",
            "balanceAfterLabel",
            "account",
            "account_id",
            "accountName",
            "accountTypeLabel",
            "category",
            "category_id",
            "categoryName",
            "categoryTypeLabel",
            "note",
            "reference",
            "reference_number",
            "referenceLabel",
            "created_at",
            "updated_at",
          ]).has(key) &&
          value !== null &&
          value !== undefined &&
          value !== "" &&
          typeof value !== "function",
      )
    : [];

  return (
    <Drawer
      open={Boolean(transaction)}
      onClose={onClose}
      title={note}
      subtitle={
        transaction ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${getTransactionTypeMeta(transaction.type).badgeClassName}`}>
              {type}
            </span>
            <span className="font-semibold text-slate-500">
              ID: TXN #{transactionId}
            </span>
          </div>
        ) : undefined
      }
      width="4xl"
      headerAction={
        transaction && onEdit && isTransactionEditable(transaction) ? (
          <button
            type="button"
            onClick={() => onEdit(transaction)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </button>
        ) : undefined
      }
      noPadding
    >
      {transaction && (
        <div className="space-y-6 p-4 sm:p-6">
          {(() => {
            const meta = getTransactionTypeMeta(transaction.type);
            const direction = getTransactionDirection(transaction);
            const Icon = meta.icon;
            return (
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-white shadow-sm">
                <div className="flex items-start gap-4 p-5">
                  <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${meta.iconClassName}`}>
                    <Icon className="h-6 w-6" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {meta.label} amount
                    </p>
                    <p className={`mt-1 text-3xl font-bold tracking-tight tabular-nums ${amountToneClass[direction]}`}>
                      {amountPrefix[direction]}
                      {formatAmount(transaction.amount)}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {displayValue(transaction.accountName ?? transaction.account)} ·{" "}
                      {formatDate(transaction.transaction_date)}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 divide-x divide-slate-100 border-t border-slate-100 bg-white/80">
                  <div className="px-5 py-3">
                    <p className="text-xs font-medium text-slate-500">Balance before</p>
                    <p className="mt-0.5 text-sm font-semibold tabular-nums text-slate-800">
                      {formatAmount(transaction.balance_before)}
                    </p>
                  </div>
                  <div className="px-5 py-3">
                    <p className="text-xs font-medium text-slate-500">Balance after</p>
                    <p className="mt-0.5 text-sm font-semibold tabular-nums text-primary-700">
                      {formatAmount(transaction.balance_after)}
                    </p>
                  </div>
                </div>
              </section>
            );
          })()}

          <section>
            <h3 className="mb-3 text-base font-semibold text-slate-900">Details</h3>
            <InformationCard>
              <InformationRow
                items={[
                  { label: "Date", value: formatDate(transaction.transaction_date) },
                  { label: "Type", value: type },
                ]}
              />
              <InformationRow
                items={[
                  {
                    label: "Account",
                    value: displayValue(transaction.accountName ?? transaction.account),
                  },
                  {
                    label: "Category",
                    value: displayValue(transaction.categoryName ?? transaction.category),
                  },
                ]}
              />
              <InformationRow
                items={[
                  {
                    label: "Reference",
                    value: displayValue(transaction.reference ?? transaction.reference_number),
                  },
                  { label: "Transaction ID", value: `TXN #${transactionId}` },
                ]}
              />
              <InformationRow
                items={[
                  {
                    label: "Note",
                    value: transaction.note ? (
                      <span className="whitespace-pre-wrap">{note}</span>
                    ) : (
                      "No remarks added"
                    ),
                  },
                ]}
              />
            </InformationCard>
          </section>

          {additionalDetails.length > 0 && (
            <section>
              <h3 className="mb-3 text-base font-semibold text-slate-900">
                Additional Information
              </h3>
              <InformationCard>
                {additionalDetails.map(([key, value]) => (
                  <InformationRow
                    key={key}
                    items={[
                      { label: labelFor(key), value: displayValue(value) },
                    ]}
                  />
                ))}
              </InformationCard>
            </section>
          )}

          {Boolean(transaction.created_at || transaction.updated_at) && (
          <section>
            <h3 className="mb-3 text-base font-semibold text-slate-900">
              Record Information
            </h3>
            <InformationCard>
              <InformationRow
                items={[
                  {
                    label: "Created",
                    value: formatDate(transaction.created_at, true),
                  },
                  {
                    label: "Last updated",
                    value: formatDate(transaction.updated_at, true),
                  },
                ]}
              />
            </InformationCard>
          </section>
          )}
        </div>
      )}
    </Drawer>
  );
}
