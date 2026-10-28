import type {
  NotificationApiItem,
  NotificationModel,
  NotificationDetails,
} from "../types";

/**
 * Parses the HTML/Plain text content of a notification to extract ticket details.
 */
export const parseNotificationContent = (
  content: string,
): NotificationDetails | undefined => {
  if (!content) return undefined;

  // Check if it's a campaign update (image 2 style)
  if (content.toLowerCase().includes("changed by")) {
    const parts = content.split("changed by");
    if (parts.length > 1) {
      return {
        changedBy: parts[1]
          .trim()
          .replace(/<\/?(?:b|span|div|body|html)[^>]*>/gi, "")
          .replace(/&nbsp;/g, " ")
          .trim(),
      };
    }
  }

  // Attempt to extract ticket details (image 1 style)
  const details: NotificationDetails = {};

  // Clean up HTML tags if present for easier regex matching
  const cleanContent = content.replace(
    /<\/?(?:b|span|div|body|html|br|p)[^>]*>/gi,
    "\n",
  );

  const ticketNoMatch = cleanContent.match(/Ticket No\s*:\s*([^<\n\r]+)/i);
  const dateMatch = cleanContent.match(/Date\s*:\s*([^<\n\r]+)/i);
  const merchantIdMatch = cleanContent.match(
    /Merchant ID \/ MSSLID\s*:\s*([^<\n\r]+)/i,
  );
  const storeIdMatch = cleanContent.match(/Store ID\s*:\s*([^<\n\r]+)/i);
  const transactionIdMatch = cleanContent.match(
    /Transaction ID\s*:\s*([^<\n\r]+)/i,
  );
  const bankSslIdMatch = cleanContent.match(/Bank SSL ID\s*:\s*([^<\n\r]+)/i);

  if (ticketNoMatch) details.ticketNo = ticketNoMatch[1].trim();
  if (dateMatch) details.date = dateMatch[1].trim();
  if (merchantIdMatch) details.merchantId = merchantIdMatch[1].trim();
  if (storeIdMatch) details.storeId = storeIdMatch[1].trim();
  if (transactionIdMatch) details.transactionId = transactionIdMatch[1].trim();
  if (bankSslIdMatch) details.bankSslId = bankSslIdMatch[1].trim();

  return Object.keys(details).length > 0 ? details : undefined;
};

/**
 * Maps API notification item to UI model
 */
export const mapApiNotificationToModel = (
  apiItem: NotificationApiItem,
): NotificationModel => {
  const details = parseNotificationContent(apiItem.content);

  let type: "ticket" | "campaign" | "info" = "info";
  if (apiItem.content_type?.toLowerCase().includes("ticket")) {
    type = "ticket";
  } else if (
    apiItem.content_type?.toLowerCase().includes("campaign") ||
    details?.changedBy
  ) {
    type = "campaign";
  }

  return {
    id: apiItem.id,
    title: apiItem.title,
    createdAt: apiItem.created_at,
    isRead: apiItem.is_read === 1,
    type,
    content: apiItem.content,
    details,
  };
};
