import { Drawer } from "../../../components/Drawer";

type Transaction = Record<string, unknown>;

const labelFor = (key: string) =>
  key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (value) => value.toUpperCase());

const formatDate = (value: unknown) => {
  if (!value) return "Not available";

  const date = new Date(String(value));
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
};

const displayValue = (value: unknown) => {
  if (value === null || value === undefined || value === "")
    return "Not available";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    return String(record.name ?? record.title ?? record.id ?? "Not available");
  }
  return String(value);
};

function Detail({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm font-medium text-slate-900">
        {children}
      </dd>
    </div>
  );
}

export function TransactionDetailsDrawer({
  transaction,
  onClose,
}: {
  transaction: Transaction | null;
  onClose: () => void;
}) {
  const knownKeys = new Set([
    "id",
    "serial",
    "type",
    "transaction_date",
    "dateLabel",
    "amount",
    "amountLabel",
    "account",
    "account_id",
    "accountName",
    "category",
    "category_id",
    "categoryName",
    "note",
    "created_at",
    "updated_at",
  ]);
  const additionalDetails = transaction
    ? Object.entries(transaction).filter(
        ([key, value]) =>
          !knownKeys.has(key) &&
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
      title="Transaction Details"
      subtitle={
        transaction ? `Transaction #${transaction.id ?? "—"}` : undefined
      }
      width="xl"
    >
      {transaction && (
        <div className="space-y-6">
          <section>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500">Transaction amount</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {transaction.amountLabel ??
                    `BDT ${Number(transaction.amount ?? 0).toLocaleString(
                      "en-US",
                      {
                        minimumFractionDigits: 2,
                      },
                    )}`}
                </p>
              </div>
              <span className="rounded-full bg-primary-50 px-3 py-1.5 text-sm font-semibold text-primary-700">
                {String(transaction.type ?? "Transaction").replace(/_/g, " ")}
              </span>
            </div>
          </section>

          <section>
            <h3 className="mb-3 font-semibold text-slate-900">
              Transaction information
            </h3>
            <dl className="grid gap-3 sm:grid-cols-2">
              <Detail label="Date">
                {formatDate(transaction.transaction_date)}
              </Detail>
              <Detail label="Account">
                {displayValue(transaction.accountName ?? transaction.account)}
              </Detail>
              <Detail label="Category">
                {displayValue(transaction.categoryName ?? transaction.category)}
              </Detail>
              <Detail label="Transaction ID">
                {displayValue(transaction.id)}
              </Detail>
            </dl>
          </section>

          <section>
            <h3 className="mb-3 font-semibold text-slate-900">Note</h3>
            <p className="whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700">
              {displayValue(transaction.note)}
            </p>
          </section>

          {additionalDetails.length > 0 && (
            <section>
              <h3 className="mb-3 font-semibold text-slate-900">
                Additional information
              </h3>
              <dl className="grid gap-3 sm:grid-cols-2">
                {additionalDetails.map(([key, value]) => (
                  <Detail key={key} label={labelFor(key)}>
                    {displayValue(value)}
                  </Detail>
                ))}
              </dl>
            </section>
          )}

          <section>
            <h3 className="mb-3 font-semibold text-slate-900">
              Record information
            </h3>
            <dl className="grid gap-3 sm:grid-cols-2">
              <Detail label="Created at">
                {formatDate(transaction.created_at)}
              </Detail>
              <Detail label="Last updated">
                {formatDate(transaction.updated_at)}
              </Detail>
            </dl>
          </section>
        </div>
      )}
    </Drawer>
  );
}
