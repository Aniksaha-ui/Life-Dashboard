import type { TransactionTicketApiItem } from "../types";
import type { TransactionTicket } from "../../../../data/mock/types";

export function mapApiTicketToModel(
  item: TransactionTicketApiItem,
): TransactionTicket {
  return {
    id: String(item.id),
    requestedOn: item.requested_on,
    ticketNo: item.ticket_no,
    storeName: item.store_name,
    transactionId: item.transaction_id,
    queryTypes: (() => {
      const rawData = item as any;
      let displayQueries: string[] = [];

      try {
        if (rawData.ticketing_query_raw) {
          const raw =
            typeof rawData.ticketing_query_raw === "string"
              ? JSON.parse(rawData.ticketing_query_raw)
              : rawData.ticketing_query_raw;

          if (raw && typeof raw === "object" && !Array.isArray(raw)) {
            displayQueries = Object.values(raw);
          }
        }
      } catch (e) {
        // Fallback
      }

      if (displayQueries.length === 0) {
        let queryFor =
          rawData.query_for || rawData.ticketing_query || rawData.query || [];
        if (typeof queryFor === "string") {
          try {
            queryFor = JSON.parse(queryFor);
          } catch {
            queryFor = queryFor
              .split(",")
              .map((s: string) => s.trim())
              .filter(Boolean);
          }
        }
        displayQueries = Array.isArray(queryFor) ? queryFor : [];
      }
      return displayQueries;
    })(),
    status: (item.status.charAt(0).toUpperCase() +
      item.status.slice(1).toLowerCase()) as "Requested" | "Solved",
    canAddFeedback: false,
    merchantName: item.merchant_name,
    storeId: item.store_id,

    // Use placeholders or null for missing fields from the new API structure
    requestedBy: String(item.created_by),
    accountType: "-",
    userRole: "-",
    requesterName: item.created_by_name || "-",
    requesterEmail: "-",
    requesterMobile: "-",
  };
}
