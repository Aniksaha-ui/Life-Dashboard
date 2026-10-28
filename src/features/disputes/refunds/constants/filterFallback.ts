import type { RefundFilterField } from "../types";

export const DEFAULT_REFUND_PAGE = "1";
export const DEFAULT_REFUND_PER_PAGE = "20";
export const DEFAULT_REFUND_DATE_PRESET = "today";

export const getDefaultRefundParams = (
  datePreset = DEFAULT_REFUND_DATE_PRESET,
) => ({
  date_preset: datePreset,
  page: DEFAULT_REFUND_PAGE,
  per_page: DEFAULT_REFUND_PER_PAGE,
});

export const REFUND_FALLBACK_FIELDS: RefundFilterField[] = [
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
    key: "merchant_transaction_id",
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
    key: "refund_reference_id",
    label: "Refund Reference ID",
    type: "text",
    placeholder: "Enter refund reference ID",
  },
  {
    key: "merchant_reference_id",
    label: "Merchant Reference ID",
    type: "text",
    placeholder: "Enter merchant reference ID",
  },
  {
    key: "refund_request_status",
    label: "Refund Request Status",
    type: "select",
    placeholder: "Select refund request status",
    options: [
      { value: "", label: "All Status" },
      { value: "0", label: "Cancelled" },
      { value: "1", label: "Success" },
      { value: "2", label: "Processing" },
    ],
  },
  {
    key: "refund_approval_status",
    label: "Refund Approval Status",
    type: "select",
    placeholder: "Select refund approval status",
    options: [
      { value: "", label: "All Status" },
      { value: "4", label: "Submit To Bank" },
      { value: "3", label: "Initiate" },
      { value: "2", label: "Processing" },
      { value: "1", label: "Success" },
      { value: "0", label: "Cancelled" },
    ],
  },
  {
    key: "card_no",
    label: "Card No",
    type: "text",
    placeholder: "Enter card number",
  },
];

export const REFUND_FALLBACK_ADVANCED_KEYS = [
  "merchant_reference_id",
  "merchant_id",
  "store_id",
  "refund_approval_status",
  "card_no",
];
