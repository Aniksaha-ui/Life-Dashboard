import { useMemo, useState } from "react";
import clsx from "clsx";
import { CheckCircle, Copy } from "lucide-react";
import { Drawer } from "../../../../components/Drawer";
import { Skeleton } from "../../../../components/Skeleton";
import { useChargebackDetail } from "../api/queries";
import type { ChargebackDetail, ChargebackDrawerProps } from "../types";

export function ChargebackDrawer({
  chargebackId,
  onClose,
}: ChargebackDrawerProps) {
  const { data: apiItem, isLoading } = useChargebackDetail(chargebackId);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string = "default") => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getRequestStatusColor = (status: string) => {
    switch (status) {
      case "Success":
        return "bg-emerald-100 text-emerald-700";
      case "Waiting":
        return "bg-slate-100 text-slate-700";
      case "Processing":
        return "bg-amber-100 text-amber-700";
      case "Cancel":
        return "bg-rose-100 text-rose-700";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const item = useMemo(() => {
    if (!apiItem) return null;
    return {
      ...apiItem,
      chargebackRefId: apiItem.chargeback_reference_id,
      banksslid: apiItem.banksslid ?? "",
      escrowEnabled: undefined, // Not available in API
      reason: apiItem.request_remarks, // Assuming reason maps to request_remarks
      requestStatus: apiItem.request_status_label,
      merchantRefCode: apiItem.merchant_reference_id,
      merchantName: apiItem.merchant_name,
      storeName: apiItem.store_name,
      storeId: apiItem.store_id,
      homePageOfStore: apiItem.store_landing_url,
      transactionId: apiItem.transaction_id,
      transactionDate: apiItem.incommingtime,
      transactionAmount: apiItem.mamount,
      settledAmount: apiItem.settled_amount,
      stage: apiItem.stage_label,
      amount: apiItem.chargeback_amount,
      bankName: apiItem.bank_name,
      bank: apiItem.bank_name,
      requestedRemarks: apiItem.request_remarks,
      requestedOn: apiItem.request_on,
      requestedBy: apiItem.request_by_name,
      autoRefundStatus: undefined,
      autoRefundRemarks: undefined,
      autoRefundAttempts: undefined,
      approvalRemarks: apiItem.approved_remarks,
      approvalOn: apiItem.approved_on,
      approvalBy: apiItem.approved_by_name,
      approvalStatus: apiItem.approved_status_label,
      confirmationRemarks: apiItem.confirmed_remarks,
      confirmationOn: apiItem.confirmed_on,
      confirmationBy: apiItem.confirmed_by_name,
      finalConfirmation: apiItem.confirmed_status_label,
    } as ChargebackDetail;
  }, [apiItem]);

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
    <div className="flex flex-col sm:flex-row sm:items-start py-3 border-b border-slate-100 last:border-0">
      <dt
        className={clsx(
          "w-full sm:w-2/5 sm:pr-4 text-sm font-medium text-slate-500",
          labelClass,
        )}
      >
        {label}
      </dt>
      <dd
        className={clsx(
          "w-full sm:w-3/5 text-sm text-slate-900 mt-1 sm:mt-0 flex items-center gap-2",
          valueClass,
        )}
      >
        <span className="break-all">{value || ""}</span>
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

  if (isLoading) {
    return (
      <Drawer
        open={!!chargebackId}
        onClose={onClose}
        title="Loading Chargeback..."
      >
        <div className="space-y-6 pt-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </Drawer>
    );
  }

  if (!item) return null;

  return (
    <Drawer
      open={!!item}
      onClose={onClose}
      title="Chargeback Information"
      subtitle={
        <div className="flex items-center gap-2">
          <span>CB Ref ID: {item.chargebackRefId}</span>
          <button
            onClick={() =>
              handleCopy(String(item.chargebackRefId), "header_cb")
            }
            className={clsx(
              "p-0.5 rounded transition-colors flex items-center gap-1.5",
              copiedId === "header_cb"
                ? "text-slate-900 bg-slate-100 pr-1.5"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-100",
            )}
            title="Copy Reference ID"
          >
            {copiedId === "header_cb" ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-xs font-medium">Copied!</span>
              </>
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      }
      width="lg"
    >
      <div className="space-y-8 pb-12">
        {/* TOP SECTION: Requested Key Information */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">
            Key Information
          </h3>
          <div className="bg-slate-50 rounded-lg border border-slate-200 px-4 py-2">
            <DetailRow
              label="Bank SSL Id"
              value={item.banksslid}
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
              label="Chargeback Reason"
              value={item.reason}
              valueClass="font-bold text-slate-900"
            />
            <DetailRow
              label="Request Status"
              value={
                item.requestStatus ? (
                  <span
                    className={clsx(
                      "px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase",
                      getRequestStatusColor(String(item.requestStatus)),
                    )}
                  >
                    {item.requestStatus}
                  </span>
                ) : (
                  ""
                )
              }
            />
            <DetailRow
              label="Merchant Ref. Code"
              value={item.merchantRefCode || "N/A"}
              copyable={!!item.merchantRefCode}
            />
          </div>
        </div>

        {/* SECTION 1: Store & Merchant */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">
            Store & Merchant
          </h3>
          <div className="bg-white rounded-lg border border-slate-200 px-4">
            <DetailRow label="Merchant Name" value={item.merchantName} />
            <DetailRow label="Store Name" value={item.storeName} />
            <DetailRow label="Store Id" value={item.storeId} copyable />
            <DetailRow
              label="Home Page of Store"
              value={item.homePageOfStore}
            />
          </div>
        </div>

        {/* SECTION 2: Transaction Details */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">
            Transaction Details
          </h3>
          <div className="bg-white rounded-lg border border-slate-200 px-4">
            <DetailRow
              label="Transaction Id"
              value={item.transactionId}
              copyable
              valueClass="font-mono text-primary-600"
            />
            <DetailRow label="Transaction Date" value={item.transactionDate} />
            <DetailRow
              label="Transaction Amount"
              value={item.transactionAmount?.toFixed(2)}
            />
            <DetailRow
              label="Settled Amount"
              value={
                item.settledAmount
                  ? Math.abs(item.settledAmount).toFixed(2)
                  : "0.00"
              }
              valueClass="text-rose-600"
            />
          </div>
        </div>

        {/* SECTION 3: Chargeback Information */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">
            Chargeback Details
          </h3>
          <div className="bg-white rounded-lg border border-slate-200 px-4">
            <DetailRow
              label="Chargeback Reference ID"
              value={item.chargebackRefId}
              copyable
              valueClass="font-mono"
            />
            <DetailRow label="Chargeback Stage" value={item.stage} />
            <DetailRow
              label="Chargeback Amount"
              value={item.amount ? Math.abs(item.amount).toFixed(2) : "0.00"}
              valueClass="text-rose-600 font-bold"
            />
            <DetailRow label="Bank Name" value={item.bankName || item.bank} />
            <DetailRow
              label="Requested Remarks"
              value={item.requestedRemarks}
            />
            <DetailRow
              label="Requested On"
              value={
                item.requestedOn
                  ? new Date(item.requestedOn).toLocaleString()
                  : ""
              }
            />
            <DetailRow label="Requested By" value={item.requestedBy} />
          </div>
        </div>

        {/* SECTION 4: Auto Refund */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">
            Auto Refund
          </h3>
          <div className="bg-white rounded-lg border border-slate-200 px-4">
            <DetailRow
              label="Auto Refund Status"
              value={item.autoRefundStatus || "Pending"}
              labelClass="font-bold text-slate-900"
            />
            <DetailRow
              label="Auto Refund Remarks"
              value={item.autoRefundRemarks}
              labelClass="font-bold text-slate-900"
            />
            <DetailRow
              label="Auto Refund Attempts"
              value={item.autoRefundAttempts?.toString() || "0"}
            />
          </div>
        </div>

        {/* SECTION 5: Approval & Confirmation */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">
            Approval & Confirmation
          </h3>
          <div className="bg-white rounded-lg border border-slate-200 px-4">
            <DetailRow label="Approval' Remarks" value={item.approvalRemarks} />
            <DetailRow label="Approval On" value={item.approvalOn} />
            <DetailRow label="Approval By" value={item.approvalBy} />
            <DetailRow
              label="Approval Status"
              value={
                <span
                  className={clsx(
                    "px-2 py-0.5 rounded border text-[10px] font-medium",
                    item.approvalStatus === "Approve"
                      ? "bg-white border-emerald-200 text-emerald-700"
                      : item.approvalStatus === "Deny"
                        ? "bg-white border-rose-200 text-rose-700"
                        : "bg-white border-slate-200 text-slate-600",
                  )}
                >
                  {item.approvalStatus}
                </span>
              }
            />
            <div className="mt-4 pt-4 border-t border-slate-100">
              <DetailRow
                label="Confirmation' Remarks"
                value={item.confirmationRemarks}
              />
              <DetailRow label="Confirmation On" value={item.confirmationOn} />
              <DetailRow label="Confirmation By" value={item.confirmationBy} />
              <DetailRow
                label="Final Confirmation"
                value={item.finalConfirmation}
              />
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
