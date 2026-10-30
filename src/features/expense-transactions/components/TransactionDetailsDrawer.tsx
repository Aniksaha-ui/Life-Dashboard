import { Drawer } from "../../../components/Drawer";

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
    <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
      {items.map(({ label, value, className }) => (
        <div key={label} className={`px-5 py-3 ${className ?? ""}`}>
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
    <dl className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {children}
    </dl>
  );
}

export function TransactionDetailsDrawer({
  transaction,
  onClose,
}: {
  transaction: Transaction | null;
  onClose: () => void;
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
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
              {type}
            </span>
            <span className="font-semibold text-slate-500">
              ID: TXN #{transactionId}
            </span>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
              Recorded
            </span>
          </div>
        ) : undefined
      }
      width="4xl"
    >
      {transaction && (
        <div className="space-y-7">
          <section className="overflow-hidden rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50 via-white to-white shadow-sm">
            <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary-700">
                  Transaction amount
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  {formatAmount(transaction.amount)}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {type} recorded against{" "}
                  {displayValue(transaction.accountName ?? transaction.account)}
                </p>
              </div>
              <div className="rounded-xl border border-white bg-white/90 px-4 py-3 shadow-sm sm:min-w-44">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Balance after
                </p>
                <p className="mt-1 text-lg font-bold text-primary-700">
                  {formatAmount(transaction.balance_after)}
                </p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-base font-semibold text-slate-900">
              Transaction Information
            </h3>
            <InformationCard>
              <InformationRow
                items={[
                  {
                    label: "Transaction date",
                    value: formatDate(transaction.transaction_date),
                  },
                  { label: "Transaction type", value: type },
                ]}
              />
              <InformationRow
                items={[
                  {
                    label: "Account",
                    value: displayValue(
                      transaction.accountName ?? transaction.account,
                    ),
                  },
                  {
                    label: "Category",
                    value: displayValue(
                      transaction.categoryName ?? transaction.category,
                    ),
                  },
                ]}
              />
              <InformationRow
                items={[
                  { label: "Amount", value: formatAmount(transaction.amount) },
                  {
                    label: "Reference",
                    value: displayValue(
                      transaction.reference ?? transaction.reference_number,
                    ),
                  },
                ]}
              />
              <InformationRow
                items={[
                  {
                    label: "Transaction details",
                    value: transaction.note ? (
                      <span className="whitespace-pre-wrap">{note}</span>
                    ) : (
                      "No remarks added"
                    ),
                    className: "sm:col-span-2",
                  },
                ]}
              />
            </InformationCard>
          </section>

          <section>
            <h3 className="mb-3 text-base font-semibold text-slate-900">
              Balance Information
            </h3>
            <InformationCard>
              <InformationRow
                items={[
                  {
                    label: "Balance before",
                    value: formatAmount(transaction.balance_before),
                  },
                  {
                    label: "Balance after",
                    value: formatAmount(transaction.balance_after),
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
        </div>
      )}
    </Drawer>
  );
}
