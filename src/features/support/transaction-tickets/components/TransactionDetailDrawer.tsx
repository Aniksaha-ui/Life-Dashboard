import { Drawer } from "../../../../components/Drawer";
import { Copy, CheckCircle, ChevronDown, ChevronRight } from "lucide-react";
import { useTransactionDetail } from "../api/queries";
import { useState } from "react";
import clsx from "clsx";

interface TransactionDetailDrawerProps {
  transactionId: number | null;
  onClose: () => void;
}

export function TransactionDetailDrawer({
  transactionId,
  onClose,
}: TransactionDetailDrawerProps) {
  const { data, isLoading } = useTransactionDetail(transactionId);
  const [isParamsOpen, setIsParamsOpen] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string = "default") => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!transactionId) return null;

  if (isLoading) {
    return (
      <Drawer
        open={!!transactionId}
        onClose={onClose}
        title="Transaction Details"
        width="xl"
      >
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-500">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Loading transaction details...</p>
        </div>
      </Drawer>
    );
  }

  if (!data) {
    return (
      <Drawer
        open={!!transactionId}
        onClose={onClose}
        title="Transaction Details"
        width="xl"
      >
        <div className="flex flex-col items-center justify-center h-64 text-slate-500">
          <p className="text-sm font-medium">Transaction details not found.</p>
        </div>
      </Drawer>
    );
  }

  const StatusBadge = ({ status }: { status: string }) => {
    const color =
      status === "Success"
        ? "bg-emerald-100 text-emerald-700"
        : status === "Failed"
          ? "bg-rose-100 text-rose-700"
          : status === "Pending"
            ? "bg-amber-100 text-amber-700"
            : "bg-slate-100 text-slate-600";
    return (
      <span
        className={clsx(
          "px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase",
          color,
        )}
      >
        {status}
      </span>
    );
  };

  const SectionHeader = ({ title }: { title: string }) => (
    <h3 className="text-sm font-semibold text-slate-900 mt-6 mb-3 uppercase tracking-wider">
      {title}
    </h3>
  );

  const DetailRow = ({
    label,
    value,
    copyable = false,
    mono = false,
    color,
  }: {
    label: string;
    value: React.ReactNode;
    copyable?: boolean;
    mono?: boolean;
    color?: string;
  }) => (
    <div className="flex flex-col sm:flex-row sm:items-start py-2 border-b border-slate-100 last:border-0 text-sm">
      <dt className="w-full sm:w-1/3 text-slate-500 font-medium pt-0.5">
        {label}
      </dt>
      <dd
        className={clsx(
          "w-full sm:w-2/3 flex items-center gap-2",
          color ? color : "text-slate-900",
        )}
      >
        <span className={clsx("break-all", mono && "font-mono text-xs")}>
          {value || "—"}
        </span>
        {copyable && value && (
          <button
            onClick={() => handleCopy(String(value), label)}
            className={clsx(
              "p-0.5 rounded transition-all flex items-center gap-1.5",
              copiedId === label
                ? "text-slate-900 bg-slate-100 pr-1.5"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-100",
            )}
            title="Copy"
          >
            {copiedId === label ? (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">Copied!</span>
              </>
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </dd>
    </div>
  );

  const customTitle = (
    <div>
      <div className="text-lg font-bold text-slate-900">
        Transaction Details
      </div>
      {data && (
        <div className="text-sm text-slate-500 font-normal flex items-center gap-2 mt-1">
          <span>Transaction ID:</span>
          <span className="font-mono text-slate-700">{data.transactionId}</span>
          <button
            onClick={() => handleCopy(data.transactionId, "header_tx_id")}
            className={clsx(
              "p-0.5 rounded transition-colors flex items-center gap-1.5",
              copiedId === "header_tx_id"
                ? "text-slate-900 bg-slate-100 pr-1.5"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-100",
            )}
            title="Copy Transaction ID"
          >
            {copiedId === "header_tx_id" ? (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">Copied!</span>
              </>
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <Drawer
      open={!!transactionId}
      onClose={onClose}
      title={customTitle}
      width="xl"
    >
      <div className="space-y-6 pb-20">
        {/* Section 1: Summary */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-slate-500">Global Status</p>
              <div className="mt-1">
                <StatusBadge status={data.status} />
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Amount</p>
              <p className="text-xl font-bold text-slate-900">
                {data.amount.toFixed(2)} {data.currency}
              </p>
            </div>
          </div>
          <DetailRow
            label="Date & Time"
            value={data.date ? new Date(data.date).toLocaleString() : "—"}
          />
          <DetailRow label="Method" value={data.paymentMedia} />
          <DetailRow label="Gateway" value={data.bankGateway} />
          <DetailRow label="Card Type" value={data.cardType} />
        </div>

        {/* Section 2: Identifiers */}
        <div>
          <SectionHeader title="Identifiers & Routing" />
          <div className="bg-white rounded-lg border border-slate-200 px-4">
            <DetailRow
              label="Session ID"
              value={data.sessionId}
              copyable
              mono
            />
            <DetailRow label="SSL ID" value={data.sslId} copyable mono />
            <DetailRow label="Bank ID" value={data.bankId} copyable mono />
            <DetailRow
              label="Approval ID"
              value={data.bankApprovalId}
              copyable
              mono
            />
            <DetailRow
              label="Receipt No"
              value={data.bankReceiptNo}
              copyable
              mono
            />
            <DetailRow
              label="Reference No"
              value={data.referenceNo}
              copyable
              mono
            />
          </div>
        </div>

        {/* Section 3: Amount Breakdown */}
        <div>
          <SectionHeader title="Amount Breakdown" />
          <div className="bg-white rounded-lg border border-slate-200 px-4">
            <DetailRow
              label="Transaction Amt"
              value={`${data.amounts.transaction} BDT`}
            />
            <DetailRow
              label="Store Amount"
              value={`${data.amounts.store} BDT`}
            />
            <DetailRow
              label="Merchant Amount"
              value={`${data.amounts.merchant} BDT`}
            />
            <DetailRow
              label="SSL Charge"
              value={`${data.amounts.ssl} BDT`}
              color="text-amber-600 font-medium"
            />
            <DetailRow label="Bank Charge" value={`${data.amounts.bank} BDT`} />
            <DetailRow
              label="Reseller Charge"
              value={`${data.amounts.reseller}`}
            />
            <DetailRow
              label="Discount"
              value={`${data.amounts.discountAmt} (${data.amounts.discountPct}%)`}
            />
          </div>
        </div>

        {/* Section 4: Customer */}
        <div>
          <SectionHeader title="Customer & Card Details" />
          <div className="bg-white rounded-lg border border-slate-200 px-4">
            <DetailRow label="Customer Name" value={data.customer.name} />
            <DetailRow label="Email" value={data.customer.email} copyable />
            <DetailRow label="Phone" value={data.customer.phone} copyable />
            <DetailRow label="Card Holder" value={data.customer.cardHolder} />
            <DetailRow
              label="Masked Card"
              value={data.customer.maskedCard}
              mono
            />
            <DetailRow label="Issued Bank" value={data.customer.issuedBank} />
            <DetailRow label="IP Address" value={data.customer.ip} mono />
          </div>
        </div>

        {/* Section 5: Risk */}
        <div>
          <SectionHeader title="Risk & Validation" />
          <div className="bg-white rounded-lg border border-slate-200 px-4">
            <DetailRow
              label="Validation Status"
              value={
                <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                  <CheckCircle className="w-3.5 h-3.5" />{" "}
                  {data.risk.validationStatus}
                </span>
              }
            />
            <DetailRow
              label="API Validated"
              value={data.risk.apiValidated ? "Yes" : "No"}
            />
            <DetailRow
              label="Risk Transaction"
              value={data.risk.isRisk ? "Yes" : "No"}
              color={data.risk.isRisk ? "text-rose-600 font-bold" : ""}
            />
            <DetailRow
              label="Risky Reason"
              value={data.risk.reason || "Safe"}
            />
            <DetailRow
              label="Sent to Bank"
              value={
                data.risk.directedToBank
                  ? new Date(data.risk.directedToBank).toLocaleTimeString()
                  : "N/A"
              }
            />
            <DetailRow
              label="Returned from Bank"
              value={
                data.risk.returnedFromBank
                  ? new Date(data.risk.returnedFromBank).toLocaleTimeString()
                  : "N/A"
              }
            />
          </div>
        </div>

        {/* Section 6: Lifecycle */}
        <div>
          <SectionHeader title="Settlement & Lifecycle" />
          <div className="bg-white rounded-lg border border-slate-200 px-4">
            <DetailRow
              label="Payment Settled"
              value={data.lifecycle.settled ? "Yes" : "No"}
              color={data.lifecycle.settled ? "text-emerald-600 font-bold" : ""}
            />
            <DetailRow
              label="Refund Requested"
              value={data.lifecycle.refundRequested ? "Yes" : "No"}
            />
          </div>
        </div>

        {/* Section 7: Device */}
        <div>
          <SectionHeader title="Device & Agent" />
          <div className="bg-white rounded-lg border border-slate-200 px-4">
            <DetailRow label="Platform" value={data.agent.platform} />
            <DetailRow label="Browser" value={data.agent.name} />
            <DetailRow label="Device" value={data.agent.device} />
            <DetailRow
              label="User Agent"
              value={
                <span className="text-[10px] leading-tight text-slate-500">
                  {data.agent.fullString}
                </span>
              }
            />
          </div>
        </div>

        {/* Section 8: Cart */}
        <div>
          <SectionHeader title="Cart Details" />
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2">Item</th>
                  <th className="px-4 py-2 text-right">Qty</th>
                  <th className="px-4 py-2 text-right">Price</th>
                  <th className="px-4 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.cart && data.cart.length > 0 ? (
                  data.cart.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2 text-slate-900">{item.name}</td>
                      <td className="px-4 py-2 text-right text-slate-600">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-2 text-right text-slate-600">
                        {item.unitPrice}
                      </td>
                      <td className="px-4 py-2 text-right font-medium text-slate-900">
                        {item.totalPrice}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-4 text-center text-slate-400 italic"
                    >
                      No cart items available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 10: JSON Params */}
        <div>
          <SectionHeader title="Technical Parameters" />
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setIsParamsOpen(!isParamsOpen)}
              className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <span className="text-sm font-medium text-slate-700">
                Request Parameters
              </span>
              {isParamsOpen ? (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-500" />
              )}
            </button>
            {isParamsOpen && (
              <div className="p-4 bg-slate-900 overflow-x-auto">
                <pre className="text-xs font-mono text-emerald-400">
                  {JSON.stringify(data.requestParams, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </Drawer>
  );
}
