import type { ChargebackFilterField } from "../types";

export const DEFAULT_CHARGEBACK_DATE_PRESET = "this_month";
export const DEFAULT_CHARGEBACK_PAGE = "1";
export const DEFAULT_CHARGEBACK_PER_PAGE = "20";

export const CHARGEBACK_FALLBACK_FIELDS: ChargebackFilterField[] = [
  {
    key: "transaction_id",
    label: "Merchant Transaction ID",
    type: "text",
    placeholder: "Enter merchant transaction ID",
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
    key: "chargeback_reference_id",
    label: "Chargeback Reference ID",
    type: "text",
    placeholder: "Enter chargeback reference ID",
  },
  {
    key: "merchant_reference_id",
    label: "Merchant Reference ID",
    type: "text",
    placeholder: "Enter merchant reference ID",
  },
  {
    key: "ssl_status",
    label: "Chargeback Request Status",
    type: "select",
    placeholder: "Select chargeback request status",
    options: [
      { value: "", label: "All Status" },
      { value: "0", label: "Cancel" },
      { value: "1", label: "Success" },
      { value: "2", label: "Processing" },
      { value: "3", label: "Initial" },
      { value: "4", label: "Waiting" },
      { value: "5", label: "SUBMIT_TO_BANK" },
    ],
    default_value: "",
  },
  {
    key: "my_status",
    label: "Chargeback Approval Status",
    type: "select",
    placeholder: "Select chargeback approval status",
    options: [
      { value: "", label: "All Status" },
      { value: "0", label: "Cancel" },
      { value: "1", label: "Approve" },
      { value: "2", label: "Processing" },
      { value: "3", label: "Initial" },
      { value: "4", label: "Waiting" },
      { value: "5", label: "Deny" },
    ],
    default_value: "",
  },
  {
    key: "card_no",
    label: "Card No",
    type: "text",
    placeholder: "Enter card number",
  },
];

export const CHARGEBACK_FALLBACK_ADVANCED_KEYS = [
  "merchant_transaction_id",
  "merchant_id",
  "store_id",
  "bank",
  "stage",
  "request_status",
  "approval_status",
  "chargeback_reference_id",
  "transaction_id",
];

export const getDefaultChargebackParams = (
  datePreset: string = DEFAULT_CHARGEBACK_DATE_PRESET,
) => ({
  date_preset: datePreset,
  page: DEFAULT_CHARGEBACK_PAGE,
  per_page: DEFAULT_CHARGEBACK_PER_PAGE,
  advanced: "0",
});
