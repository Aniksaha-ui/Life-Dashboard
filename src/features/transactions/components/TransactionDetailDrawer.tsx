import clsx from "clsx";
import {
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Clock,
  Copy,
  ExternalLink,
  History,
  Info,
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Drawer } from "../../../components/Drawer";
import { useSendInvoice, useTransactionDetail } from "../api/queries";
import type { TransactionDetailDrawerProps } from "../types";
import { Loader } from "../../../components/Loader";

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "success":
      return "bg-emerald-100 text-emerald-700";
    case "failed":
      return "bg-rose-100 text-rose-700";
    case "pending":
      return "bg-amber-100 text-amber-700";
    case "refunded":
      return "bg-slate-100 text-slate-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
};

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case "success":
      return CheckCircle;
    case "failed":
      return History;
    case "pending":
      return Clock;
    case "refunded":
      return AlertCircle;
    default:
      return AlertCircle;
  }
};

export function TransactionDetailDrawer({
  transactionId,
  onClose,
  onShowLogs,
  onShowCard,
}: TransactionDetailDrawerProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isBankResponseOpen, setIsBankResponseOpen] = useState(true);

  const { data: item, isLoading } = useTransactionDetail(transactionId);
  const { mutate: sendInvoice, isPending: isSendingInvoice } = useSendInvoice();

  const handleSendInvoice = () => {
    if (!item?.tid) return;

    sendInvoice(item.tid, {
      onSuccess: (data) => {
        toast.success(data.message || "Invoice sent successfully");
      },
    });
  };

  const handleCopy = (text: string | number, id: string) => {
    navigator.clipboard.writeText(String(text));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatTechnicalParamValue = (value: unknown): string => {
    if (value === null || value === undefined || value === "") return "N/A";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  const StatusBadge = ({ status }: { status: string }) => (
    <span
      className={clsx(
        "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
        getStatusColor(status),
      )}
    >
      {status}
    </span>
  );

  const DetailItem = ({
    label,
    value,
    mono = false,
    copyable = false,
    id = "",
  }: {
    label: string;
    value: any;
    mono?: boolean;
    copyable?: boolean;
    id?: string;
  }) => (
    <div className="flex justify-between py-2 border-b border-slate-100 last:border-0 items-center">
      <span className="text-slate-500 text-sm">{label}</span>
      <div className="flex items-center gap-2">
        <span
          className={clsx(
            "text-slate-900 text-sm font-medium text-right",
            mono && "font-mono text-xs text-slate-600",
          )}
        >
          {value || "N/A"}
        </span>
        {copyable && value && (
          <button
            onClick={() => handleCopy(String(value), id)}
            className={clsx(
              "p-1 rounded transition-colors",
              copiedId === id
                ? "text-emerald-600 bg-emerald-50"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-100",
            )}
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1 mb-3">
      {title}
    </h4>
  );

  const ActionLink = ({
    label,
    onClick,
    disabled = false,
    type = "link",
  }: {
    label: string;
    onClick?: () => void;
    disabled?: boolean;
    type?: "link" | "button";
  }) => {
    if (type === "button") {
      return (
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          className="text-xs font-bold text-primary-600 hover:text-primary-700 disabled:opacity-50 flex items-center gap-1"
        >
          {label} <ChevronRight className="w-3 h-3" />
        </button>
      );
    }
    return (
      <div className="flex justify-between py-2 border-b border-slate-100 last:border-0 items-center">
        <span className="text-slate-500 text-sm">{label}</span>
        {onClick ? (
          <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className="text-primary-600 hover:text-primary-700 font-bold text-xs flex items-center gap-1 transition-colors disabled:opacity-30"
          >
            {label === "Send Invoice" && isSendingInvoice ? (
              <>
                Sending... <Loader size="xs" className="ml-1" />
              </>
            ) : (
              <>
                Click Here <ExternalLink className="w-3 h-3" />
              </>
            )}
          </button>
        ) : (
          <span className="text-slate-400 text-[11px] font-medium">
            Not Available
          </span>
        )}
      </div>
    );
  };

  const headerId = item?.transactionId || transactionId || "";

  if (!transactionId) return null;

  return (
    <Drawer
      open={!!transactionId}
      onClose={onClose}
      title="Transaction Details"
      subtitle={
        <div className="flex items-center gap-1.5 mt-1">
          <span>{headerId}</span>
          <button
            onClick={() => handleCopy(headerId, "headerCopy")}
            className={clsx(
              "p-1 rounded transition-colors",
              copiedId === "headerCopy"
                ? "text-emerald-600 bg-emerald-50"
                : "text-slate-300 hover:text-slate-600 hover:bg-slate-100",
            )}
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
      }
      width="2xl"
    >
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-400">
          <Loader size="md" />
          <p className="text-sm font-medium animate-pulse">
            Loading transaction audit data...
          </p>
        </div>
      ) : item ? (
        <div className="pb-12 bg-slate-50/30 -mx-6 -my-6 p-6 space-y-6">
          {(() => {
            const StatusIcon = getStatusIcon(item.status);
            return (
              <div
                className={clsx(
                  "p-4 rounded-lg flex items-center justify-between gap-3",
                  getStatusColor(item.status).replace(
                    "bg-",
                    "bg-opacity-50 bg-",
                  ),
                )}
              >
                <div className="flex items-center gap-3">
                  <StatusIcon className="w-5 h-5" />
                  <div>
                    <p className="font-bold text-sm uppercase tracking-tight">
                      Status: {item.status}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <p className="text-[10px] opacity-90 font-medium">
                        Txn ID: {item.transactionId}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(item.transactionId, "bannerCopy");
                        }}
                        className={clsx(
                          "p-0.5 rounded transition-colors",
                          copiedId === "bannerCopy"
                            ? "text-emerald-600 bg-white"
                            : "text-current opacity-60 hover:opacity-100 hover:bg-white/20",
                        )}
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase opacity-60">
                    Amount
                  </p>
                  <p className="text-lg font-bold leading-none mt-0.5">
                    ৳{item.amounts.transaction.toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })()}

          <SectionHeader title="Core Transaction Info" />
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <DetailItem
              label="Date & Time"
              value={new Date(item.date).toLocaleString()}
            />
            <DetailItem
              label="Transaction ID"
              value={item.transactionId}
              mono
              copyable
              id="h_txnId"
            />
            <DetailItem label="Session ID" value={item.sessionId} mono />
            <DetailItem label="SSL ID" value={item.sslId} mono />
            <DetailItem label="Bank ID" value={item.bankId} mono />
            <DetailItem label="Bank Gateway" value={item.bankGateway} />
            <DetailItem
              label="Card Type"
              value={
                item.cardType
                  ? item.cardType.charAt(0).toUpperCase() +
                    item.cardType.slice(1).toLowerCase()
                  : "N/A"
              }
            />
            <DetailItem label="Payment Media" value={item.paymentMedia} />
            <DetailItem label="Scheme Selected" value={item.schemeSelected} />
            <div className="flex justify-between py-2 items-center">
              <span className="text-slate-500 text-sm">Status</span>
              <StatusBadge status={item.status} />
            </div>
          </div>

          <SectionHeader title="Customer Information" />
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <DetailItem label="Customer Name" value={item.customer.name} />
            <DetailItem
              label="Customer Phone"
              value={item.customer.phone}
              copyable
              id="h_phone"
            />
            <DetailItem
              label="Customer Email"
              value={item.customer.email}
              copyable
              id="h_email"
            />
            <DetailItem
              label="Card Holder Name"
              value={item.customer.cardHolder}
            />
            <div className="flex justify-between py-2 border-b border-slate-100 last:border-0 items-center text-sm">
              <span className="text-slate-500">Masked Card Number</span>
              <button
                onClick={() => onShowCard(item.customer.maskedCard)}
                className="text-primary-600 hover:text-primary-700 font-mono font-medium hover:underline"
              >
                {item.customer.maskedCard}
              </button>
            </div>
            <DetailItem
              label="Card Issued Bank"
              value={item.customer.issuedBank}
            />
            <DetailItem
              label="Customer Wallet No"
              value={item.customer.walletNo}
            />
            <div className="flex justify-between py-2 border-b border-slate-100 last:border-0 items-center text-sm">
              <span className="text-slate-500">Customer IP</span>
              <button
                onClick={() =>
                  onShowLogs(item.tid, item.transactionId, item.customer.ip)
                }
                className="text-primary-600 hover:text-primary-700 font-mono font-medium hover:underline"
              >
                {item.customer.ip}
              </button>
            </div>
          </div>

          <SectionHeader title="Amount Breakdown" />
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <DetailItem
              label="Amount"
              value={`${item.amounts.transaction.toLocaleString()} ${item.currency}`}
            />
            <DetailItem
              label="SSL Amount"
              value={`${item.amounts.ssl.toLocaleString()} ${item.currency}`}
            />
            <DetailItem
              label="Reseller Charge"
              value={`${item.amounts.reseller.toLocaleString()} ${item.currency}`}
            />
            <DetailItem
              label="Bank Amount"
              value={`${item.amounts.bank.toLocaleString()} ${item.currency}`}
            />
            <DetailItem
              label="Store Amount"
              value={`${item.amounts.store.toLocaleString()} ${item.currency}`}
            />
            <DetailItem
              label="Merchant Amount"
              value={`${item.amounts.merchant.toLocaleString()} ${item.currency}`}
            />
            <DetailItem
              label="Susamount"
              value={`${item.amounts.susamount.toLocaleString()} ${item.currency}`}
            />
            <DetailItem
              label="Merchant Currency"
              value={item.amounts.merchantCurrency}
            />
            <DetailItem
              label="Merchant Currency Rate"
              value={item.amounts.merchantCurrencyRate}
            />
            <DetailItem
              label="Discount Percentage"
              value={`${item.amounts.discountPct}%`}
            />
            <DetailItem
              label="Discount Given"
              value={`${item.amounts.discountAmt.toLocaleString()} ${item.currency}`}
            />
            <DetailItem
              label="Discount Remarks"
              value={item.amounts.discountRemarks}
            />
          </div>

          <SectionHeader title="Transaction Flow & Status" />
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <DetailItem
              label="Error Description"
              value={item.flow.errorDescription}
            />
            <DetailItem
              label="API Validated by Merchant"
              value={item.flow.apiValidated ? "YES" : "NO"}
            />
            <DetailItem
              label="Gateway Version"
              value={item.flow.gatewayVersion}
            />
            <DetailItem
              label="Validation Status"
              value={item.flow.validationStatus}
            />
            <DetailItem
              label="Risk Transactions"
              value={item.flow.isRisk ? "Yes" : "No"}
            />
            <DetailItem label="Risky Reason" value={item.flow.riskyReason} />
            <DetailItem
              label="Directed to Bank"
              value={
                item.flow.directedToBank
                  ? new Date(item.flow.directedToBank).toLocaleString()
                  : "N/A"
              }
            />
            <DetailItem
              label="Returned from Bank"
              value={
                item.flow.returnedFromBank
                  ? new Date(item.flow.returnedFromBank).toLocaleString()
                  : "N/A"
              }
            />
            <DetailItem
              label="Bank Approval ID"
              value={item.flow.bankApprovalId}
              mono
            />
            <DetailItem
              label="Bank Receipt Number"
              value={item.flow.bankReceiptNo}
              mono
            />
          </div>

          <SectionHeader title="Action Links" />
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm divide-y divide-slate-100">
            <ActionLink label="IPN Resent" />
            <ActionLink
              label="Send Invoice"
              onClick={handleSendInvoice}
              disabled={isSendingInvoice}
            />
            <div className="py-2 flex justify-between items-center">
              <span className="text-slate-500 text-sm">Download Invoice</span>
              <div className="flex items-center gap-2 group cursor-help">
                <span className="text-slate-400 text-[11px] font-medium">
                  Not Available
                </span>
                <Info className="w-3 h-3 text-slate-300" />
              </div>
            </div>
            <ActionLink label="Chargeback" />
            <ActionLink label="Hold Payment" />
            <ActionLink label="Update TDR" />
          </div>

          <SectionHeader title="Settlement & Flags" />
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <DetailItem
              label="Payment Settled"
              value={item.lifecycle.settlementStatus}
            />
            <DetailItem
              label="Refund Request"
              value={item.lifecycle.refundRequested ? "YES" : "NO"}
            />
            <DetailItem
              label="Chargeback Request"
              value={item.lifecycle.chargebackRequested ? "YES" : "NO"}
            />
            <DetailItem
              label="Avail the Offer"
              value={item.lifecycle.availOffer ? "YES" : "NO"}
            />
          </div>

          <SectionHeader title="MOTO Transaction Status" />
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <DetailItem label="User's Mobile" value={item.moto.mobile} />
            <DetailItem label="Masked Card" value={item.moto.maskedCard} />
            <DetailItem
              label="Transaction Status"
              value={item.moto.trxStatus}
            />
            <DetailItem label="MOTO Status" value={item.moto.status} />
            <DetailItem label="Customer Request" value={item.moto.request} />
            <DetailItem label="Store Name" value={item.moto.store} />
            <DetailItem label="Description" value={item.moto.desc} />
          </div>

          <SectionHeader title="Technical Parameters" />
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            {Object.keys(item.requestParams || {}).length ? (
              Object.entries(item.requestParams).map(([key, value]) => (
                <div
                  key={key}
                  className="grid grid-cols-[minmax(140px,220px)_1fr] gap-4 py-2 border-b border-slate-100 last:border-0 items-start"
                >
                  <span className="text-slate-500 text-sm break-words">
                    {key}
                  </span>
                  <div className="min-w-0 text-right overflow-x-auto">
                    <span className="font-mono text-xs text-slate-700 break-all whitespace-pre-wrap">
                      {formatTechnicalParamValue(value)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-slate-400 py-2">
                No technical parameters available.
              </div>
            )}
          </div>

          <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
            <button
              onClick={() => setIsBankResponseOpen(!isBankResponseOpen)}
              className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors border-b border-slate-100"
            >
              <span className="text-sm font-semibold text-slate-800">
                Bank Response
              </span>
              <History className="w-4 h-4 text-slate-400" />
            </button>
            {isBankResponseOpen && (
              <div className="p-5 bg-[#0f172a] overflow-x-auto">
                <div className="font-mono text-[13px] text-[#4ade80] mb-4 border-b border-slate-800 pb-2 flex items-start gap-2">
                  <span className="text-slate-500 shrink-0">Raw:</span>
                  <span className="break-all">
                    {item.bankResponse.raw || "N/A"}
                  </span>
                </div>
                <pre className="text-[13px] font-mono leading-relaxed">
                  <span className="text-slate-400">{"{"}</span>
                  {"\n"}
                  {Object.entries(item.bankResponse.params || {}).map(
                    ([key, value], idx, arr) => (
                      <div key={key} className="pl-4">
                        <span className="text-[#94a3b8]">"</span>
                        <span className="text-[#4ade80]">{key}</span>
                        <span className="text-[#94a3b8]">"</span>
                        <span className="text-slate-400"> : </span>
                        <span className="text-[#4ade80]">"</span>
                        <span className="text-[#4ade80]">{String(value)}</span>
                        <span className="text-[#4ade80]">"</span>
                        {idx < arr.length - 1 && (
                          <span className="text-slate-400">,</span>
                        )}
                      </div>
                    ),
                  )}
                  <span className="text-slate-400">{"}"}</span>
                </pre>
              </div>
            )}
          </div>

          <SectionHeader title="Merchant Request Info" />
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex justify-between py-2 items-center text-sm">
              <span className="text-slate-500">Merchant System IP</span>
              <button
                onClick={() =>
                  onShowLogs(
                    item.tid,
                    item.transactionId,
                    item.merchantRequestInfo.ip,
                  )
                }
                className="text-primary-600 hover:text-primary-700 font-mono font-medium hover:underline"
              >
                {item.merchantRequestInfo.ip || "N/A"}
              </button>
            </div>
          </div>

          <SectionHeader title="Manual EMI Activation" />
          <div className="bg-slate-900 p-4 rounded-xl shadow-lg border-t-2 border-emerald-500">
            <div className="flex items-start gap-3">
              <Info className="w-4 h-4 text-emerald-400 mt-0.5" />
              <p className="text-[11px] font-medium text-emerald-50/70 leading-relaxed italic">
                {item.emi.statusText}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-slate-400">
          Failed to load transaction details.
        </div>
      )}
    </Drawer>
  );
}
