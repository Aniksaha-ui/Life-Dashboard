import type { MerchantTicketFilterField } from "../types";

export const DEFAULT_TICKET_PAGE = "1";
export const DEFAULT_TICKET_PER_PAGE = "10";

export const TICKET_FALLBACK_FIELDS: MerchantTicketFilterField[] = [
  {
    key: "ticket_no",
    label: "Ticket No",
    type: "text",
    placeholder: "Enter ticket no",
  },
  {
    key: "status",
    label: "Status",
    type: "select",
    placeholder: "Select status",
    options: [
      {
        value: "",
        label: "All Status",
      },
      {
        value: "0",
        label: "Pending",
      },
      {
        value: "1",
        label: "Processing",
      },
      {
        value: "2",
        label: "Declined",
      },
      {
        value: "3",
        label: "Completed",
      },
    ],
    default_value: "",
  },
  {
    key: "issue_type",
    label: "Issue Type",
    type: "select",
    placeholder: "Select issue type",
    options: [
      {
        value: "",
        label: "All Issue Type",
      },
      {
        value: "payment_gateway",
        label: "Payment Gateway",
      },
      {
        value: "qr_related_query",
        label: "Qr Related Query",
      },
      {
        value: "emi_related_query",
        label: "Emi Related Query",
      },
      {
        value: "payment_link",
        label: "Payment Link",
      },
      {
        value: "others",
        label: "Others",
      },
    ],
    default_value: "",
  },
  {
    key: "merchant_id",
    label: "Merchant ID",
    type: "text",
    placeholder: "Enter merchant ID",
  },
];

export const TICKET_FALLBACK_ADVANCED_KEYS = ["issue_type", "merchant_id"];

export const getDefaultTicketParams = (datePreset?: string) => {
  const params: Record<string, string> = {
    page: DEFAULT_TICKET_PAGE,
    per_page: DEFAULT_TICKET_PER_PAGE,
    advanced: "0",
  };
  if (datePreset) {
    params.date_preset = datePreset;
  }
  return params;
};
