import type { SettlementFilterField } from "../types";

export const DEFAULT_SETTLEMENT_DATE_PRESET = "today";
export const DEFAULT_SETTLEMENT_PAGE = "1";
export const DEFAULT_SETTLEMENT_PER_PAGE = "20";

export const SETTLEMENT_FALLBACK_FIELDS: SettlementFilterField[] = [
  {
    key: "transaction_id",
    label: "Transaction ID",
    type: "text",
    placeholder: "Enter settlement transaction ID",
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
    key: "settlement_status",
    label: "Settlement Status",
    type: "select",
    placeholder: "Select settlement status",
    options: [
      { value: "all", label: "All Status" },
      { value: "paid", label: "Paid" },
      { value: "pending", label: "Pending" },
      { value: "on_hold", label: "On Hold" },
    ],
    default_value: "all",
  },
  {
    key: "type",
    label: "Settlement Type",
    type: "select",
    placeholder: "Select settlement type",
    options: [
      { value: "all", label: "All Settlement Type" },
      { value: "online", label: "Online" },
      { value: "physical", label: "Physical" },
      { value: "qrpayment", label: "Qr Payment" },
      { value: "both", label: "Both" },
    ],
    default_value: "all",
  },
  {
    key: "data_type",
    label: "Merchant Personalization",
    type: "select",
    placeholder: "Select merchant type",
    options: [
      { value: "all", label: "All Merchants" },
      { value: "my", label: "My Merchants" },
    ],
    default_value: "all",
  },
  {
    key: "search",
    label: "Search",
    type: "text",
    placeholder: "Search by merchant, store, or IDs",
  },
];

export const SETTLEMENT_FALLBACK_ADVANCED_KEYS = [
  "merchant_id",
  "store_id",
  "settlement_status",
  "type",
  "search",
];

export const getDefaultSettlementParams = (
  datePreset: string = DEFAULT_SETTLEMENT_DATE_PRESET,
) => ({
  date_preset: datePreset,
  page: DEFAULT_SETTLEMENT_PAGE,
  per_page: DEFAULT_SETTLEMENT_PER_PAGE,
  advanced: "0",
  data_type: "all",
});
