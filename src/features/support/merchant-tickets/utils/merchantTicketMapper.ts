import type { MerchantTicket, MerchantTicketApiItem } from "../types";

export const mapApiTicketToRow = (
  item: MerchantTicketApiItem,
): MerchantTicket => ({
  id: String(item.id),
  ticketNo: item.ticket_no,
  title: item.title,
  description: item.description,
  merchantName: item.merchant_company_name,
  issueType: item.issue_type_label,
  status: item.status_label as MerchantTicket["status"],
  createdAt: item.created_at,
  resolvedAt: item.resolved_at || undefined,
  hasAttachment: !!item.attachment_url,
  attachmentUrl: item.attachment_url || undefined,
  remarks: item.remarks || "",
  createdBy: item.created_by_full_name,
  resolvedBy: item.resolved_by_full_name || undefined,
  merchant_msslid: item.merchant_msslid,
});
