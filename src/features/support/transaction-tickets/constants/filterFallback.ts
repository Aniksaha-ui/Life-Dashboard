import type { TransactionTicketFilterField } from "../types";

export const DEFAULT_TRANS_TICKET_DATE_PRESET = "this_month";
export const DEFAULT_TRANS_TICKET_PAGE = "1";
export const DEFAULT_TRANS_TICKET_PER_PAGE = "20";

export const TRANS_TICKET_FALLBACK_FIELDS: TransactionTicketFilterField[] = [
  {
    key: "ticket_no",
    label: "Ticket No",
    type: "text",
    placeholder: "Enter ticket no",
  },
  {
    key: "transaction_id",
    label: "Transaction ID",
    type: "text",
    placeholder: "Enter transaction ID",
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
    key: "status",
    label: "Status",
    type: "select",
    placeholder: "Select status",
    options: [
      { value: "", label: "All Status" },
      { value: "requested", label: "Requested" },
      { value: "solved", label: "Solved" },
    ],
    default_value: "",
  },
];

export const TRANS_TICKET_FALLBACK_ADVANCED_KEYS = [
  "transaction_id",
  "merchant_id",
  "store_id",
  "status",
];

export const getDefaultTransTicketParams = (
  datePreset: string = DEFAULT_TRANS_TICKET_DATE_PRESET,
) => ({
  date_preset: datePreset,
  page: DEFAULT_TRANS_TICKET_PAGE,
  per_page: DEFAULT_TRANS_TICKET_PER_PAGE,
  advanced: "0",
});
