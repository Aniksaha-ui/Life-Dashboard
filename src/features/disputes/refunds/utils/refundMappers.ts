import type { RefundApiItem, RefundDetailApiItem, RefundRow } from "../types";

const toNumber = (value: number | string | null | undefined): number => {
  if (value === null || value === undefined || value === "") return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeDateTime = (value: string | null | undefined): string => {
  if (!value || value.startsWith("0000-00-00")) return "";
  return value;
};

const normalizeFinalStatus = (value: string): RefundRow["finalStatus"] => {
  const normalized = value.trim().toLowerCase();

  if (normalized === "success") return "Success";
  if (normalized === "processing") return "Processing";
  if (normalized === "initial") return "Initial";
  if (normalized === "initiate") return "Initiate";
  if (normalized === "cancelled") return "Cancelled";
  if (normalized === "failed") return "Failed";
  if (normalized === "pending") return "Pending";

  return normalized;
};

export const mapApiRefundToRow = (item: RefundApiItem): RefundRow => {
  return {
    id: String(item.refund_id),
    refundId: item.refund_id,
    requestedOn: normalizeDateTime(item.request_on),
    refundRefId: item.refund_reference_id || "",
    transactionId: item.transaction_id || item.merchant_transaction_id || "",
    transactionDate: normalizeDateTime(item.incommingtime),
    transactionAmount: toNumber(item.mamount),
    merchantId: item.merchant_id || "",
    merchantName: item.merchant_name || "",
    storeId: item.store_id || "",
    storeName: item.store_name || "",
    homePageOfStore: item.store_landing_url || item.store_url || "",
    bankName: item.card_type || "",
    escrowEnabled: item.has_emi === 1,
    amount: toNumber(item.refund_amount),
    settledAmount: toNumber(item.settled_amount),
    requestStatus: item.request_status_label || "",
    approvalStatus: item.approved_status_label || "",
    finalStatus: normalizeFinalStatus(item.confirmed_status_label || ""),
    settledStatus: item.settlement_status || "",
    merchantRefCode: item.merchant_reference_id || "",
    bankSslId: "",
    bank: item.card_type || "",
    requestedBy: "",
    merchantsRemarks: item.request_remarks || "",
    autoRefundStatus: "",
    autoRefundRemarks: "",
    autoRefundAttempts: 0,
    approvalRemarks: "",
    approvalOn: normalizeDateTime(item.approved_on),
    approvalBy: "",
    confirmationRemarks: "",
    confirmationOn: normalizeDateTime(item.confirmed_on),
    confirmationBy: "",
    finalConfirmation: item.confirmed_status_label || "",
  };
};

export const mapApiRefundDetailToRow = (
  item: RefundDetailApiItem,
): RefundRow => {
  const base = mapApiRefundToRow(item);

  return {
    ...base,
    transactionId:
      item.transaction_id || item.merchant_transaction_id || base.transactionId,
    bankName: item.bank_name || item.card_type || "",
    bankSslId: item.bankssl_id || "",
    requestedBy: item.request_by_name || "",
    merchantsRemarks: item.request_remarks || "",
    autoRefundStatus: item.auto_refund_status || "",
    autoRefundRemarks: item.auto_refund_remarks || "",
    autoRefundAttempts: item.auto_refund_attempts || 0,
    approvalRemarks: item.approved_remarks || "",
    approvalOn: normalizeDateTime(item.approved_on),
    approvalBy: item.approved_by_name || "",
    confirmationRemarks: item.confirmed_remarks || "",
    confirmationOn: normalizeDateTime(item.confirmed_on),
    confirmationBy: item.confirmed_by_name || "",
    finalConfirmation: item.confirmed_status_label || "",
  };
};
