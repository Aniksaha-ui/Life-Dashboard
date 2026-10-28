import type { EMIOperationFilterField } from "../types";

export const DEFAULT_EMI_DATE_PRESET = "this_month";
export const DEFAULT_EMI_PAGE = "1";
export const DEFAULT_EMI_PER_PAGE = "20";

export const EMI_FALLBACK_FIELDS: EMIOperationFilterField[] = [
  {
    key: "transaction_id",
    label: "Transaction ID",
    type: "text",
    placeholder: "Enter transaction ID",
  },
  {
    key: "emi_ref_id",
    label: "EMI Ref ID",
    type: "text",
    placeholder: "Enter EMI reference ID",
  },
  {
    key: "merchant_id",
    label: "Merchant ID",
    type: "text",
    placeholder: "Enter merchant ID",
  },
  {
    key: "store_id",
    label: "Store ID",
    type: "text",
    placeholder: "Enter store ID",
  },
  {
    key: "request_status",
    label: "Request Status",
    type: "select",
    placeholder: "Select request status",
    options: [
      { value: "all", label: "All Status" },
      { value: "1", label: "Requested" },
      { value: "0", label: "Declined" },
      { value: "2", label: "Processing" },
      { value: "3", label: "Initial" },
    ],
    default_value: "all",
  },
  {
    key: "bank_status",
    label: "Bank Status",
    type: "select",
    placeholder: "Select bank status",
    options: [
      { value: "all", label: "All" },
      { value: "approved", label: "Approved" },
      { value: "cancel", label: "Cancel" },
      { value: "sent", label: "Sent" },
      { value: "not_sent", label: "Not Sent" },
    ],
    default_value: "all",
  },
  {
    key: "emi_issuer",
    label: "EMI Issuer Bank",
    type: "select",
    placeholder: "Select issuer bank",
    options: [{ value: "all", label: "All Banks" }],
    default_value: "all",
  },
];

export const EMI_FALLBACK_ADVANCED_KEYS = [
  "merchant_id",
  "store_id",
  "request_status",
  "confirmed_status",
  "bank_status",
  "emi_ref_id",
];

export const getDefaultEMIOperationParams = (
  datePreset: string = DEFAULT_EMI_DATE_PRESET,
) => ({
  date_preset: datePreset,
  page: DEFAULT_EMI_PAGE,
  per_page: DEFAULT_EMI_PER_PAGE,
  advanced: "0",
});
