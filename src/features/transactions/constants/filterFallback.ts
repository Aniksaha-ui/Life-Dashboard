import type { TransactionFilterField } from "../types";

export const DEFAULT_TRANSACTION_PAGE = "1";
export const DEFAULT_TRANSACTION_PER_PAGE = "20";
export const DEFAULT_TRANSACTION_DATE_PRESET = "today";

export const getDefaultTransactionParams = (
  datePreset = DEFAULT_TRANSACTION_DATE_PRESET,
) => ({
  date_preset: datePreset,
  page: DEFAULT_TRANSACTION_PAGE,
  per_page: DEFAULT_TRANSACTION_PER_PAGE,
});

/** Visible in the main filter row (date preset is shown separately). */
export const TRANSACTION_PRIMARY_FILTER_KEYS = [
  "merchant_id",
  "store_id",
  "transaction_id",
  "status",
] as const;

export const TRANSACTION_FALLBACK_FIELDS: TransactionFilterField[] = [
  {
    key: "date_preset",
    label: "Date Preset",
    type: "select",
    placeholder: "Select date preset",
    options: [
      { value: "today", label: "Today" },
      { value: "this_week", label: "This Week" },
      { value: "this_month", label: "This Month" },
      { value: "all_time", label: "All Time" },
      { value: "custom_range", label: "Custom Date Range" },
    ],
    required: true,
  },
  {
    key: "transaction_id",
    label: "Transaction ID",
    type: "text",
    placeholder: "Enter transaction ID",
  },
  {
    key: "merchant_id",
    label: "Merchant Name",
    type: "text",
    placeholder: "Name or merchant ID",
  },
  {
    key: "store_id",
    label: "Store ID",
    type: "text",
    placeholder: "Name or store ID",
  },
  {
    key: "status",
    label: "Status",
    type: "select",
    placeholder: "Select status",
    options: [
      { value: "successandfailure", label: "Success and Failure" },
      { value: "success", label: "Success" },
      { value: "failure", label: "Failure" },
      { value: "incomplete", label: "Incomplete" },
      { value: "unattempted", label: "Unattempted" },
      { value: "cancel", label: "Cancel" },
      { value: "paymenthold", label: "Payment Hold" },
    ],
  },
  {
    key: "ip_address",
    label: "IP Address",
    type: "ip",
    placeholder: "Enter IP address",
  },
  {
    key: "gate_id",
    label: "Gate ID",
    type: "number",
    placeholder: "Enter gate ID",
  },
  {
    key: "payment_type",
    label: "Payment Type",
    type: "text",
    placeholder: "Enter payment type",
  },
  {
    key: "issuer_location",
    label: "Issuer Location",
    type: "select",
    placeholder: "Select issuer location",
    options: [
      { value: "local", label: "Local" },
      { value: "foreign", label: "Foreign" },
    ],
  },
  {
    key: "bank_name",
    label: "Bank Name",
    type: "text",
    placeholder: "Enter bank name",
  },
  {
    key: "card_type",
    label: "Card Type",
    type: "select",
    placeholder: "Select card type",
    options: [
      { value: "visa", label: "Visa" },
      { value: "master", label: "Master" },
      { value: "amex", label: "AMEX" },
      { value: "wallet", label: "Wallet" },
      { value: "other", label: "Other" },
    ],
  },
  {
    key: "last_4_digit_of_card",
    label: "Last 4 Digit of Card",
    type: "text",
    placeholder: "Enter last 4 digits",
  },
  {
    key: "bank_id",
    label: "Bank ID",
    type: "text",
    placeholder: "Enter bank ID",
  },
  {
    key: "card_holder_given_name",
    label: "Card Holder Given Name",
    type: "text",
    placeholder: "Enter card holder given name",
  },
  {
    key: "emi_status",
    label: "EMI Status",
    type: "select",
    placeholder: "Select EMI status",
    options: [
      { value: "all", label: "All" },
      { value: "1", label: "EMI" },
      { value: "0", label: "Non-EMI" },
    ],
  },
];

export const TRANSACTION_FALLBACK_ADVANCED_KEYS =
  TRANSACTION_FALLBACK_FIELDS.map((field) => field.key).filter(
    (key) =>
      key !== "date_preset" &&
      !TRANSACTION_PRIMARY_FILTER_KEYS.includes(
        key as (typeof TRANSACTION_PRIMARY_FILTER_KEYS)[number],
      ),
  );
