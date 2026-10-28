import clsx from "clsx";
import { CheckCircle, Copy } from "lucide-react";
import { useState } from "react";
import { CopyButton } from "../../../../components/CopyButton";
import { Drawer } from "../../../../components/Drawer";
import { Skeleton } from "../../../../components/Skeleton";
import { useRefundDetail } from "../api/queries";
import type { RefundDrawerProps } from "../types";

const getApprovalStatusColor = (status: string) => {
  switch (status) {
    case "Approved":
    case "Success":
      return "bg-emerald-100 text-emerald-700";
    case "Pending":
    case "Initiate":
    case "Processing":
      return "bg-amber-100 text-amber-700";
    case "Rejected":
    case "Cancelled":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
};

const formatDateTime = (value?: string) => {
  if (!value) return "";
  return new Date(value).toLocaleString();
};

export function RefundDrawer({ refundId, onClose }: RefundDrawerProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { data: item, isLoading } = useRefundDetail(refundId);

  const handleCopy = (text: string, id: string = "default") => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const DetailRow = ({
    label,
    value,
    copyable = false,
    valueClass,
    labelClass,
  }: {
    label: string;
    value: string | React.ReactNode;
    copyable?: boolean;
    valueClass?: string;
    labelClass?: string;
  }) => (
    <div className="flex flex-col sm:flex-row sm:items-start py-2 border-b border-slate-100 last:border-0">
      <dt
        className={clsx(
          "w-full sm:w-2/5 sm:pr-4 text-[13px] font-medium text-slate-500",
          labelClass,
        )}
      >
        {label}
      </dt>
      <dd
        className={clsx(
          "w-full sm:w-3/5 text-[13px] text-slate-900 mt-0.5 sm:mt-0 flex items-center gap-2",
          valueClass,
        )}
      >
        <span className="break-all">{value ?? ""}</span>
        {copyable && value && (
          <button
            onClick={() => handleCopy(String(value), label)}
            className={clsx(
              "p-0.5 rounded transition-all flex items-center gap-1.5",
              copiedId === label
                ? "text-slate-900 bg-slate-100 pr-1.5"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-100",
            )}
            title="Copy to clipboard"
          >
            {copiedId === label ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
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

  return (
    <Drawer
      open={!!refundId}
      onClose={onClose}
      title="Refund Details"
      subtitle={
        item ? (
          <div className="flex items-center gap-2">
            <span>Refund Ref ID: {item.refundRefId}</span>
            <button
              onClick={() => handleCopy(item.refundRefId, "header_ref")}
              className={clsx(
                "p-0.5 rounded transition-colors flex items-center gap-1.5",
                copiedId === "header_ref"
                  ? "text-slate-900 bg-slate-100 pr-1.5"
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-100",
              )}
              title="Copy Reference ID"
            >
              {copiedId === "header_ref" ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-xs font-medium">Copied!</span>
                </>
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        ) : null
      }
      width="lg"
    >
      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      )}

      {!isLoading && item && (
        <div className="space-y-8 pb-12">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">
              Key Information
            </h3>
            <div className="bg-slate-50 rounded-lg border border-slate-200 px-4 py-2">
              <DetailRow
                label="Bank SSL Id"
                value={item.bankSslId || ""}
                copyable
                valueClass="font-mono text-xs"
              />
              <DetailRow
                label="Is Escrow Enabled"
                value={
                  <span
                    className={clsx(
                      "px-2 py-0.5 rounded text-[10px] font-semibold",
                      item.escrowEnabled
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-200 text-slate-600",
                    )}
                  >
                    {item.escrowEnabled ? "Yes" : "No"}
                  </span>
                }
              />
              <DetailRow
                label="Settled Status"
                value={
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 text-slate-600">
                    {item.settledStatus}
                  </span>
                }
              />
              <DetailRow
                label="Merchant Ref Code"
                value={item.merchantRefCode || ""}
                copyable
              />
              <DetailRow
                label="Approval Status"
                value={
                  <span
                    className={clsx(
                      "px-2 py-0.5 rounded border text-[10px] font-medium",
                      getApprovalStatusColor(item.approvalStatus),
                    )}
                  >
                    {item.approvalStatus}
                  </span>
                }
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">
              Merchant & Store
            </h3>
            <div className="bg-white rounded-lg border border-slate-200 px-4">
              <DetailRow label="Merchant Name" value={item.merchantName} />
              <DetailRow label="Store Name" value={item.storeName} />
              <div className="flex flex-col sm:flex-row sm:items-start py-2 border-b border-slate-100 last:border-0">
                <dt className="w-full sm:w-2/5 text-[13px] font-medium text-slate-500">
                  Store Id
                </dt>
                <dd className="w-full sm:w-3/5 text-[13px] text-slate-900 mt-0.5 sm:mt-0 flex items-center gap-2">
                  {item.storeId}
                  <CopyButton value={item.storeId} />
                </dd>
              </div>
              <DetailRow
                label="Home Page of Store"
                value={item.homePageOfStore || ""}
                valueClass="text-primary-600"
              />
              <DetailRow
                label="Bank Name"
                value={item.bankName || item.bank || ""}
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">
              Transaction Info
            </h3>
            <div className="bg-white rounded-lg border border-slate-200 px-4">
              <DetailRow
                label="Transaction Id"
                value={item.transactionId}
                copyable
                valueClass="font-mono text-primary-600"
              />
              <DetailRow
                label="Transaction Date"
                value={formatDateTime(item.transactionDate)}
              />
              <DetailRow
                label="Transaction Amount"
                value={item.transactionAmount?.toFixed(2) || "0.00"}
              />
              <DetailRow
                label="Merchant Refund Amount"
                value={item.amount?.toFixed(2)}
                valueClass="text-rose-600 font-bold"
              />
              <DetailRow
                label="Settled Amount"
                value={item.settledAmount?.toFixed(2)}
                valueClass="text-rose-600"
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">
              Refund Details
            </h3>
            <div className="bg-white rounded-lg border border-slate-200 px-4">
              <DetailRow
                label="Refund Reference ID"
                value={item.refundRefId}
                copyable
                valueClass="font-mono"
              />
              <DetailRow
                label="Merchants' Remarks"
                value={item.merchantsRemarks || ""}
              />
              <DetailRow
                label="Requested On"
                value={formatDateTime(item.requestedOn)}
              />
              <DetailRow label="Requested By" value={item.requestedBy || ""} />
              <DetailRow
                label="Request Status"
                value={item.requestStatus}
                valueClass={clsx(
                  "font-semibold",
                  item.requestStatus === "Success"
                    ? "text-emerald-600"
                    : "text-amber-600",
                )}
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">
              Auto Refund Info
            </h3>
            <div className="bg-slate-50 rounded-lg border border-slate-200 px-4">
              <DetailRow
                label="Auto Refund Status"
                value={item.autoRefundStatus || ""}
                valueClass="font-bold"
              />
              <DetailRow
                label="Auto Refund Remarks"
                value={item.autoRefundRemarks || ""}
              />
              <DetailRow
                label="Auto Refund Attempts"
                value={String(item.autoRefundAttempts || 0)}
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">
              Approval & Confirmation
            </h3>
            <div className="bg-white rounded-lg border border-slate-200 px-4">
              <DetailRow
                label="Approval' Remarks"
                value={item.approvalRemarks || ""}
              />
              <DetailRow
                label="Approval On"
                value={formatDateTime(item.approvalOn)}
              />
              <DetailRow label="Approval By" value={item.approvalBy || ""} />
              <DetailRow
                label="Confirmation' Remarks"
                value={item.confirmationRemarks || ""}
              />
              <DetailRow
                label="Confirmation On"
                value={formatDateTime(item.confirmationOn)}
              />
              <DetailRow
                label="Confirmation By"
                value={item.confirmationBy || ""}
              />
              <DetailRow
                label="Final Confirmation"
                value={item.finalConfirmation || ""}
              />
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
}
