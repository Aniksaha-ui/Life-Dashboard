import { db } from "../../data/mock/database";
import type {
  ChannelSummary,
  Chargeback,
  Dispute,
  EMIOperation,
  Investigation,
  LocalIssuerBank,
  Merchant,
  MerchantStore,
  MerchantTicket,
  MerchantUser,
  Refund,
  Reseller,
  Settlement,
  Transaction,
  TransactionTicket,
  WorkItem,
} from "../../data/mock/types";
import type {
  RefundDetailApiItem,
  RefundFilterFieldsResponseData,
  RefundListResponse,
  RefundOverviewResponse,
} from "../../features/disputes/refunds/types";
import type {
  EMIOperationDetailsApiItem,
  EMIOperationFilterFieldsResponse,
  EMIOperationListResponse,
  EMIOperationOverviewResponse,
} from "../../features/manage-settlement/emi-operation/types";
import type {
  SettlementDetail,
  SettlementFilterFieldsResponse,
  SettlementListResponse,
  SettlementOverviewData,
} from "../../features/manage-settlement/settlement/types";
import type {
  MerchantTicketApiItem,
  MerchantTicketFilterFieldsResponse,
  MerchantTicketListResponse,
} from "../../features/support/merchant-tickets/types";
import type {
  MerchantTicketDetail,
  TransactionTicketApiItem,
  TransactionTicketFilterFieldsResponse,
  TransactionTicketListResponse,
  TransactionTicketOverviewResponse,
} from "../../features/support/transaction-tickets/types";
import type {
  CardBinAndCustomerDetailsResponseData,
  CustomerTrackingResponseData,
  TransactionApiItem,
  TransactionDetail,
  TransactionFilterFieldsResponseData,
  TransactionListResponse,
  TransactionOverviewResponse,
} from "../../features/transactions/types";

const LATENCY_MIN = 200;
const LATENCY_MAX = 600;

const MOCK_PENDING_LOGIN_KEY = "mock_pending_login_id";

type MockAuthUser = {
  password: string;
  otp: string;
  otpSentTo: string;
  profile: {
    username: string;
    displayName: string;
    role: string;
    accountType: string;
    email: string;
    phone: string;
    website: string;
    joinedDate: string;
    permanentDate: string;
  };
  apiUser: {
    uid: number;
    utype: string;
    uname: string;
    profile_name: string;
    role_name: string;
    force_change_pass: number;
    force_change_pin: number;
    created_on: string;
    typeid: string;
    role_id: number;
    status: number;
  };
};

const MOCK_AUTH_USERS: Record<string, MockAuthUser> = {
  "susanta.kam": {
    password: "Sahaanik10451047@",
    otp: "987654",
    otpSentTo: "sus***@example.com",
    profile: {
      username: "susanta.kam",
      displayName: "Susanta Kam",
      role: "KAM Admin",
      accountType: "admin",
      email: "susanta.kam@example.com",
      phone: "+8801711000000",
      website: "www.sslcommerz.com",
      joinedDate: "26 March, 2023",
      permanentDate: "March 2023",
    },
    apiUser: {
      uid: 1,
      utype: "KAM",
      uname: "susanta.kam",
      profile_name: "Susanta Kam",
      role_name: "KAM Admin",
      force_change_pass: 0,
      force_change_pin: 0,
      created_on: "2024-01-01",
      typeid: "1",
      role_id: 1,
      status: 1,
    },
  },
  testkam: {
    password: "test@Kam",
    otp: "123456",
    otpSentTo: "tes***@example.com",
    profile: {
      username: "testkam",
      displayName: "Test KAM",
      role: "KAM Admin",
      accountType: "admin",
      email: "testkam@example.com",
      phone: "+8801711000001",
      website: "www.sslcommerz.com",
      joinedDate: "1 January, 2024",
      permanentDate: "January 2024",
    },
    apiUser: {
      uid: 2,
      utype: "KAM",
      uname: "testkam",
      profile_name: "Test KAM",
      role_name: "KAM Admin",
      force_change_pass: 0,
      force_change_pin: 0,
      created_on: "2024-01-01",
      typeid: "1",
      role_id: 1,
      status: 1,
    },
  },
};

function simulateLatency<T>(data: T): Promise<T> {
  const ms = Math.floor(
    Math.random() * (LATENCY_MAX - LATENCY_MIN + 1) + LATENCY_MIN,
  );
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

function generateMockSeries(baseValue: number, count: number = 30) {
  const series = [];
  const today = new Date();
  for (let i = count; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    series.push({
      date: date.toISOString().split("T")[0],
      value: Math.floor(baseValue * (0.8 + Math.random() * 0.4)),
    });
  }
  return series;
}

function toRawDetail(t: Transaction): any {
  return {
    tid: t.tid || 1000,
    incommingtime: t.date,
    transaction_id: t.id,
    notice_label: t.status,
    status: t.status,
    currency_amount: t.amount,
    mamount: t.amount,
    t_currency: t.currency,
    payment_medium: t.method || "VISA",
    cardtype: t.bankName || "City Bank",
    card_type: t.cardType || "Credit",
    issuer_card_brand: t.cardBrand || "VISA",
    sslid: "SSL-" + t.id,
    session_id: 12345678,
    banksslid: t.bankTxnId || "BANK-12345",
    brac_ref_id: t.bankApprovalCode || "APP-123",
    bk_receipt_no: "REC-123",
    rsid: "RS-123",
    cust_id: 101,
    cus_name: t.customerName || "Abrar Fawaz",
    cus_phone: t.customerMobile || "01712345678",
    cus_email: t.customerEmail || "abrar@example.com",
    cardholdername: t.cardholderName || t.customerName || "Abrar Fawaz",
    scredit_card_num:
      t.cardBin && t.cardLast4
        ? `${t.cardBin}XXXXXX${t.cardLast4}`
        : "411111XXXXXX1111",
    issuerbank: `|||${t.cardBank || "City Bank"}|BD|Bangladesh`,
    visitor_ip: t.ipAddress || "103.11.0.1",
    sslportion: t.amount * 0.97,
    reseller_commission: 0,
    storeportion: t.amount * 0.95,
    bankportion: t.amount * 0.98,
    susamount: 0,
    currency_type: t.currency,
    currency_rate: 1,
    display_discount_perctentage: 0,
    td_discount_perctentage: 0,
    error_reason: t.failureReason || "N/A",
    validated: 1,
    gw_version: 3,
    is_risk: 0,
    risk_desc: "Safe",
    bankgoingtime: t.date,
    bankretime: t.date,
    ua_platform: "Windows",
    ua_device: "Desktop",
    ua_version: "124.0.0",
    ua_name: "Chrome",
    ua_agent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    settlestatus: t.status === "success" ? "SETTLED" : "NO",
    refundstatus: "NO",
    chargebackstatus: "NO",
    notice: "Transaction Successful",
    merchant_system_ip: "103.11.0.1",
    surl: "https://merchant.com/success",
    furl: "https://merchant.com/failed",
    curl: "https://merchant.com/cancel",
    emi_status_message: "N/A",
    store_name: t.storeName || "Merchant Store",
    cart_items: [
      { product_name: "Demo Product 1", quantity: 1, product_price: t.amount },
    ],
  };
}

function matchesPartialText(
  value: string | undefined | null,
  query: string,
): boolean {
  if (!value) return false;
  return value.toLowerCase().includes(query.trim().toLowerCase());
}

function transactionMatchesMerchantFilter(
  txn: Transaction,
  query: string,
): boolean {
  const q = query.trim();
  if (!q) return true;

  if (matchesPartialText(txn.merchantId, q)) return true;

  const merchant = db.merchants.find((m) => m.id === txn.merchantId);
  if (merchant) {
    if (matchesPartialText(merchant.name, q)) return true;
    if (matchesPartialText(merchant.storeId, q)) return true;
  }

  return false;
}

function transactionMatchesStoreFilter(
  txn: Transaction,
  query: string,
): boolean {
  const q = query.trim();
  if (!q) return true;

  if (matchesPartialText(txn.storeId, q)) return true;
  if (matchesPartialText(txn.storeName, q)) return true;

  const store = db.merchantStores.find((s) => s.storeId === txn.storeId);
  if (store && matchesPartialText(store.storeName, q)) return true;

  return false;
}

function filterTransactions(
  txns: Transaction[],
  searchParams: URLSearchParams,
): Transaction[] {
  let filtered = [...txns];

  const status = searchParams.get("status");
  if (status && status !== "all" && status !== "successandfailure") {
    filtered = filtered.filter((t) => {
      if (status === "failure") return t.status === "failed";
      return t.status === status;
    });
  } else if (status === "successandfailure") {
    filtered = filtered.filter(
      (t) => t.status === "success" || t.status === "failed",
    );
  }

  const transaction_id = searchParams.get("transaction_id");
  if (transaction_id) {
    filtered = filtered.filter(
      (t) =>
        t.id.includes(transaction_id) || String(t.tid).includes(transaction_id),
    );
  }

  const merchant_id = searchParams.get("merchant_id");
  if (merchant_id) {
    filtered = filtered.filter((t) =>
      transactionMatchesMerchantFilter(t, merchant_id),
    );
  }

  const store_id = searchParams.get("store_id");
  if (store_id) {
    filtered = filtered.filter((t) =>
      transactionMatchesStoreFilter(t, store_id),
    );
  }

  const card_type = searchParams.get("card_type");
  if (card_type) {
    filtered = filtered.filter(
      (t) =>
        t.cardBrand?.toLowerCase() === card_type.toLowerCase() ||
        t.cardType?.toLowerCase() === card_type.toLowerCase(),
    );
  }

  const ip_address = searchParams.get("ip_address");
  if (ip_address) {
    filtered = filtered.filter((t) => t.ipAddress?.includes(ip_address));
  }

  const date_preset = searchParams.get("date_preset");
  if (date_preset && date_preset !== "all_time") {
    const now = new Date();
    let startDate: Date | null = null;

    if (date_preset === "today") {
      startDate = new Date(now.setHours(0, 0, 0, 0));
    } else if (date_preset === "yesterday") {
      startDate = new Date(now.setDate(now.getDate() - 1));
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((t) => {
        const d = new Date(t.date);
        return d >= startDate! && d <= endDate;
      });
      startDate = null; // Already filtered
    } else if (date_preset === "this_week") {
      startDate = new Date(now.setDate(now.getDate() - 7));
    } else if (date_preset === "this_month") {
      startDate = new Date(now.setMonth(now.getMonth() - 1));
    } else if (date_preset === "custom_range") {
      const from = searchParams.get("from_date");
      const to = searchParams.get("to_date");
      if (from && to) {
        const s = new Date(from);
        const e = new Date(to);
        e.setHours(23, 59, 59, 999);
        filtered = filtered.filter((t) => {
          const d = new Date(t.date);
          return d >= s && d <= e;
        });
      }
    }

    if (startDate) {
      filtered = filtered.filter((t) => new Date(t.date) >= startDate!);
    }
  }

  return filtered;
}

export const api = {
  // Interceptor for real API patterns
  post: async <T>(
    url: string,
    body?: any,
    _options?: any,
  ): Promise<T | null> => {
    if (url === "/auth/login") {
      const result = await api.auth.login(body.email, body.password, true);
      if (result.success && result.user) {
        return {
          access_token: "mock-access-token",
          token_type: "Bearer",
          expires_in: null,
          user: result.user,
        } as any;
      }
      throw new Error(result.message);
    }
    if (url === "/auth/verify-2fa") {
      const result = await api.auth.verifyOTP(
        body.otp_code,
        body.is_trust_device,
      );
      if (result.success && result.user) {
        const mockUser = MOCK_AUTH_USERS[result.user.username];
        return {
          session_id: "mock-session-id",
          user: mockUser?.apiUser ?? result.user,
          device_trust_token: "mock-trust-token",
        } as any;
      }
      throw new Error(result.message);
    }
    if (url.includes("/settlements/") && url.endsWith("/resend-email")) {
      return simulateLatency({
        success: true,
        message: "Settlement email resent successfully",
      } as any);
    }
    return simulateLatency(null);
  },
  get: async <T>(
    url: string,
    _responseType?: any,
    _body?: any,
    _options?: any,
  ): Promise<T | null> => {
    console.log("Mock API GET:", url);
    if (url === "/filter-fields/transaction-tickets") {
      const response: TransactionTicketFilterFieldsResponse = {
        module: "transaction-tickets",
        fields: [
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
              { value: "Pending", label: "Pending" },
              { value: "Solved", label: "Solved" },
              { value: "Processing", label: "Processing" },
              { value: "Declined", label: "Declined" },
            ],
          },
        ],
        advanced_filter_names: ["store_id", "merchant_id", "status"],
      };
      return response as any;
    }

    if (url.includes("/transaction-tickets/overview")) {
      const tickets = db.transactionTickets;

      const response: TransactionTicketOverviewResponse = {
        total_tickets: tickets.length,
        pending_tickets: tickets.filter((t) => t.status === "Requested").length,
        solved_tickets: tickets.filter((t) => t.status === "Solved").length,
      };
      return response as any;
    }

    if (url.startsWith("/merchant-tickets?") || url === "/merchant-tickets") {
      const query = url.split("?")[1] || "";
      const searchParams = new URLSearchParams(query);
      let tickets = [...db.merchantTickets];

      // Basic filtering
      const status = searchParams.get("status");
      if (status) {
        // Map status label or value if needed
        tickets = tickets.filter(
          (t) => String(t.status) === status || t.statusLabel === status,
        );
      }
      const ticket_no = searchParams.get("ticket_no");
      if (ticket_no) {
        tickets = tickets.filter((t) => t.ticketNo.includes(ticket_no));
      }
      const issue_type = searchParams.get("issue_type");
      if (issue_type && issue_type !== "all") {
        tickets = tickets.filter((t) => t.issueType === issue_type);
      }

      // Pagination
      const page = parseInt(searchParams.get("page") || "1");
      const perPage = parseInt(searchParams.get("per_page") || "10");
      const start = (page - 1) * perPage;
      const paginated = tickets.slice(start, start + perPage);

      const items: MerchantTicketApiItem[] = paginated.map(
        (mt) =>
          ({
            id: parseInt(mt.id.split("_")[1]) || 1,
            ticket_no: mt.ticketNo,
            title: mt.title,
            description: mt.description,
            attachment: mt.attachment || "",
            attachment_url: mt.attachmentUrl || null,
            issue_type: mt.issueType,
            issue_type_label: mt.issueTypeLabel,
            merchant_id: mt.merchantId,
            merchant_mid: mt.merchantMid,
            merchant_msslid: mt.merchantMsslid,
            merchant_company_name: mt.merchantCompanyName,
            merchant_contact_mobile: mt.merchantContactMobile,
            created_by: mt.createdBy,
            created_by_full_name: mt.createdByFullName,
            created_by_email: mt.createdByEmail,
            created_by_mobile: mt.createdByMobile,
            kam_full_name: mt.kamFullName,
            kam_email: mt.kamEmail,
            resolved_by: mt.resolvedBy,
            resolved_by_full_name: mt.resolvedByFullName,
            resolved_by_email: mt.resolvedByEmail || null,
            resolved_by_mobile: mt.resolvedByMobile || null,
            remarks: mt.remarks,
            status: mt.status,
            status_label: mt.statusLabel,
            created_at: mt.createdAt,
            updated_at: mt.updatedAt,
            resolved_at: mt.resolvedAt,
          }) as any,
      );

      const response: MerchantTicketListResponse = {
        items,
        pagination: {
          current_page: page,
          per_page: perPage,
          from: start + 1,
          to: Math.min(start + perPage, tickets.length),
          last_page: Math.ceil(tickets.length / perPage),
          total: tickets.length,
        },
      };
      return response as any;
    }

    if (url.startsWith("/merchant-tickets/")) {
      const id = url.split("/").pop()?.split("?")[0];
      const mt = db.merchantTickets.find(
        (t) => t.id === id || t.id === `mt_${id}`,
      );
      if (mt) {
        const response: MerchantTicketApiItem = {
          id: parseInt(mt.id.split("_")[1]) || 1,
          ticket_no: mt.ticketNo,
          title: mt.title,
          description: mt.description,
          attachment: mt.attachment || "",
          attachment_url: mt.attachmentUrl || null,
          issue_type: mt.issueType,
          issue_type_label: mt.issueTypeLabel,
          merchant_id: mt.merchantId,
          merchant_mid: mt.merchantMid,
          merchant_msslid: mt.merchantMsslid,
          merchant_company_name: mt.merchantCompanyName,
          merchant_contact_mobile: mt.merchantContactMobile,
          created_by: mt.createdBy,
          created_by_full_name: mt.createdByFullName,
          created_by_email: mt.createdByEmail,
          created_by_mobile: mt.createdByMobile,
          kam_full_name: mt.kamFullName,
          kam_email: mt.kamEmail,
          resolved_by: mt.resolvedBy,
          resolved_by_full_name: mt.resolvedByFullName,
          resolved_by_email: mt.resolvedByEmail || null,
          resolved_by_mobile: mt.resolvedByMobile || null,
          remarks: mt.remarks,
          status: mt.status,
          status_label: mt.statusLabel,
          created_at: mt.createdAt,
          updated_at: mt.updatedAt,
          resolved_at: mt.resolvedAt,
        } as any;
        return response as any;
      }
    }

    if (url.includes("/filter-fields/merchant-tickets")) {
      const response: MerchantTicketFilterFieldsResponse = {
        module: "merchant-tickets",
        fields: [
          {
            key: "date_preset",
            label: "Date Range",
            type: "select",
            options: [
              { value: "today", label: "Today" },
              { value: "yesterday", label: "Yesterday" },
              { value: "last_7_days", label: "Last 7 Days" },
              { value: "last_30_days", label: "Last 30 Days" },
              { value: "this_month", label: "This Month" },
              { value: "last_month", label: "Last Month" },
              { value: "custom_range", label: "Custom Range" },
            ],
            default_value: "last_30_days",
          },
          {
            key: "ticket_no",
            label: "Ticket No",
            type: "text",
            placeholder: "Search Ticket No",
          },
          {
            key: "status",
            label: "Status",
            type: "select",
            placeholder: "Select status",
            options: [
              { value: "all", label: "All Status" },
              { value: "1", label: "Pending" },
              { value: "2", label: "Declined" },
              { value: "3", label: "Completed" },
            ],
          },
          {
            key: "issue_type",
            label: "Issue Type",
            type: "select",
            placeholder: "Select issue type",
            options: [
              { value: "all", label: "All Types" },
              { value: "emi_related_query", label: "Emi Related Query" },
              { value: "others", label: "Others" },
              { value: "payment_gateway", label: "Payment Gateway" },
            ],
          },
        ],
        advanced_filter_names: ["merchant_id"],
      };
      return response as any;
    }

    if (
      url.startsWith("/transaction-tickets?") ||
      url === "/transaction-tickets"
    ) {
      const query = url.split("?")[1] || "";
      const searchParams = new URLSearchParams(query);
      let tickets = [...db.transactionTickets];

      // Basic filtering
      const status = searchParams.get("status");
      if (status && status !== "all") {
        const mappedStatus = status === "Pending" ? "Requested" : status;
        tickets = tickets.filter((t) => t.status === mappedStatus);
      }
      const ticket_no = searchParams.get("ticket_no");
      if (ticket_no) {
        tickets = tickets.filter((t) => t.ticketNo.includes(ticket_no));
      }

      // Pagination
      const page = parseInt(searchParams.get("page") || "1");
      const perPage = parseInt(searchParams.get("per_page") || "10");
      const start = (page - 1) * perPage;
      const paginated = tickets.slice(start, start + perPage);

      const items: TransactionTicketApiItem[] = paginated.map((tt) => {
        const txn = db.transactions.find((t) => t.id === tt.transactionId);
        return {
          id: parseInt(tt.id.split("_")[1]) || 1,
          ticket_no: tt.ticketNo,
          requested_on: tt.requestedOn,
          msslid: txn?.merchantId || "1",
          merchant_name: tt.merchantName,
          store_id: tt.storeId,
          store_name: tt.storeName,
          tid: tt.tid,
          transaction_id: tt.transactionId,
          banksslid: txn?.bankTxnId || "BANK-12345",
          status: tt.status === "Requested" ? "Pending" : tt.status,
          status_code: tt.status === "Solved" ? 1 : 0,
          query_for: tt.queryTypes || [],
          ticketing_query_raw: tt.description,
          created_by: 101,
          created_by_name: tt.requesterName,
        } as any;
      });

      const response: TransactionTicketListResponse = {
        items,
        pagination: {
          current_page: page,
          per_page: perPage,
          from: start + 1,
          to: Math.min(start + perPage, tickets.length),
          last_page: Math.ceil(tickets.length / perPage),
          total: tickets.length,
        },
      };
      return response as any;
    }

    if (url.startsWith("/transaction-tickets/")) {
      const id = url.split("/").pop()?.split("?")[0];
      const tt = db.transactionTickets.find(
        (t) => t.id === id || t.id === `tt_${id}`,
      );
      if (tt) {
        const txn = db.transactions.find((t) => t.id === tt.transactionId);
        const response: MerchantTicketDetail = {
          id: parseInt(tt.id.split("_")[1]) || 1,
          ticket_no: tt.ticketNo,
          requested_on: tt.requestedOn,
          merchant_id: txn?.merchantId || "demotest",
          merchant_name: tt.merchantName || "Sandbox Live Test",
          msslid: txn?.merchantId || "demotest",
          store_id: tt.storeId || "demotest",
          store_name: tt.storeName || "Easy App",
          tid: tt.tid,
          transaction_id: tt.transactionId,
          mtxnid: tt.transactionId,
          banksslid: txn?.bankTxnId || "EC53242026042300013",
          status: tt.status === "Requested" ? "Pending" : tt.status,
          status_code: tt.status === "Solved" ? 1 : 0,
          notice: "success",
          notice_label: "Success",
          query_for: tt.queryTypes || [],
          ticketing_query_raw: tt.description,
          created_by: 101,
          created_by_name: tt.requesterName,
          created_by_email: tt.requesterEmail,
          created_by_mobile: tt.requesterMobile,
          created_by_role: tt.userRole,
          created_by_full_name: tt.requesterName,
          feedback_given_by_name: tt.feedbackGivenBy,
          feedback_given_on: tt.feedbackGivenOn,
          feedback_remarks: tt.feedbackRemarks,
          mamount: txn?.amount || 30,
          incommingtime: txn?.date || "2026-04-23 15:37:13",
          sslid: "260423153713UGCwBwy1TDkew",
          download_invoice_url:
            "https://report.sslcommerz.com/system_attach/cust_invoice/260423153713UGCWBWY1TDKEW.pdf",
          bankgoingtime: "2026-04-23 15:37:41",
          bankretime: "2026-04-23 15:37:57",
          scredit_card_num: "512345XXXXXX0008",
          visitor_ip: "192.168.68.175",
          cardtype: "MASTER-Eastern Bank Limited",
          card_type: "master",
          cardholdername: "Limon",
          sslportion: 0.24,
          storeportion: 29.25,
          bankportion: 0.51,
          susamount: 30,
          brac_ref_id: "831000",
          bk_receipt_no: "7769370765276787704807",
          issuerbank: "Mastercard|CREDIT||Eastern Bank Ltd|BD|BANGLADESH|0|0",
          issuer_card_brand: "Mastercard",
          validated: 1,
          gw_version: 4,
          settlestatus: "SETTLE_INITIAL",
          payment_medium: "Payment Link Transaction",
          refundstatus: "NO",
          chargebackstatus: "NO",
          error_reason: "",
          is_risk: 0,
          risk_desc: "Safe",
          currency_amount: 30,
          currency_type: "BDT",
          currency_rate: "1.0000",
          requested_parameter: {
            amount: "30.00",
            sms_ipn: "",
            email_ipn: "dummy@sslwireless.com",
            qr_name: "hello",
            ipn_url: "",
            pay_link_id: "69E9E83FED062",
            is_bangla_qr_enabled: "YES",
            sslcz_channel: "v4/api.php",
          },
          emi_status_message:
            "Transaction amount is less than the eligible amount!",
          merchant_system_ip: "192.168.194.46",
          surl: "https://uat-invoice.sslcommerz.com/invoice/success?refer=69E9E83FED062&v3=1",
          furl: "https://uat-invoice.sslcommerz.com/invoice/fail?refer=69E9E83FED062&v3=1",
          curl: "https://uat-invoice.sslcommerz.com/invoice/cancel?refer=69E9E83FED062&v3=1",
        } as any;
        return response as any;
      }
    }

    if (url.includes("/filter-fields/transactions")) {
      const response: TransactionFilterFieldsResponseData = {
        module: "transactions",
        fields: [
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
            key: "transaction_id",
            label: "Transaction ID",
            type: "text",
            placeholder: "Enter transaction ID",
          },
          {
            key: "status",
            label: "Status",
            type: "select",
            options: [
              { value: "success", label: "Success" },
              { value: "failed", label: "Failed" },
              { value: "cancel", label: "Cancelled" },
            ],
          },
          {
            key: "card_type",
            label: "Card Type",
            type: "select",
            options: [
              { value: "Debit", label: "Debit" },
              { value: "Credit", label: "Credit" },
              { value: "Prepaid", label: "Prepaid" },
            ],
          },
          {
            key: "payment_type",
            label: "Payment Type",
            type: "select",
            options: [
              { value: "VISA", label: "Visa" },
              { value: "MASTER", label: "Mastercard" },
              { value: "AMEX", label: "Amex" },
              { value: "BKASH", label: "bKash" },
            ],
          },
        ],
        advanced_filter_names: ["card_type", "payment_type"],
      } as any;
      return response as any;
    }

    if (url.includes("/transactions/overview")) {
      const query = url.split("?")[1] || "";
      const searchParams = new URLSearchParams(query);
      const txns = filterTransactions(db.transactions, searchParams);

      const response: TransactionOverviewResponse = {
        total_transactions: txns.length,
        success_transactions: txns.filter((t) => t.status === "success").length,
        failed_transactions: txns.filter(
          (t) => t.status === "failed" || t.status === "pending",
        ).length,
        total_amount: txns.reduce((sum, t) => sum + t.amount, 0),
      };
      return response as any;
    }

    if (url.startsWith("/transactions?") || url === "/transactions") {
      const query = url.split("?")[1] || "";
      const searchParams = new URLSearchParams(query);
      const filteredTxns = filterTransactions(db.transactions, searchParams);

      // Pagination params
      const page = parseInt(searchParams.get("page") || "1");
      const perPage = parseInt(searchParams.get("per_page") || "10");
      const start = (page - 1) * perPage;
      const paginated = filteredTxns.slice(start, start + perPage);

      const items: TransactionApiItem[] = paginated.map((t, idx) => {
        const effectiveTid = t.tid || 1000 + idx;
        const masked =
          t.cardBin && t.cardLast4
            ? `${t.cardBin}XXXXXX${t.cardLast4}`
            : t.cardLast4
              ? `XXXXXX${t.cardLast4}`
              : "411111XXXXXX1111";
        const merchant = db.merchants.find((m) => m.id === t.merchantId);
        return {
          tid: effectiveTid,
          transaction_id: t.id,
          msslid: t.merchantId,
          strid: t.storeId,
          merchant_name: merchant?.name || t.storeName,
          store_name: t.storeName,
          mamount: t.amount,
          currency_type: t.currency,
          incommingtime: t.date,
          status: t.status,
          notice_label: t.status, // Crucial for status display
          cardtype: t.bankName || "City Bank", // Mapper uses this for bankName
          card_type: t.cardType || "Credit",
          visitor_ip: t.ipAddress,
          cus_name: t.customerName,
          cus_email: t.customerEmail,
          cus_phone: t.customerMobile,
          sel_card: t.method || "VISA",
          scredit_card_num: masked,
          issuerbank: `|||${t.cardBank || "City Bank"}|BD|Bangladesh`,
          banksslid: t.bankTxnId || "BANK-MOCK-ID",
          brac_ref_id: t.bankApprovalCode || "123456",
        } as any;
      });

      const response: TransactionListResponse = {
        items,
        pagination: {
          current_page: page,
          per_page: perPage,
          from: start + 1,
          to: Math.min(start + perPage, filteredTxns.length),
          last_page: Math.ceil(filteredTxns.length / perPage),
          total: filteredTxns.length,
        },
        links: { first: null, prev: null, next: null, last: null },
      };
      return response as any;
    }

    if (url.startsWith("/transactions/") && !url.includes("/overview")) {
      const parts = url.split("/");
      const lastPart = parts[parts.length - 1].split("?")[0];

      if (url.includes("/logs")) {
        const tid = parseInt(parts[parts.length - 2]);
        const logs = [
          {
            logs_on: "2026-04-23 15:38:00",
            tid: tid,
            stage: "merchantIDVAPI",
            ip: "192.168.194.46",
            descriptions:
              '{"status":"VALID","tran_date":"2026-04-23 15:37:13","tran_id":"69E9E83FED062-69E9E849C3C17","val_id":"26042315375727526149055fde5","amount":"30.00","store_amount":"29.25","currency":"BDT","bank_tran_id":"EC53242026042300013","card_type":"MASTER-Eastern Bank Limited","card_no":"512345XXXXXX0008","card_issuer":"Eastern Bank Ltd","card_brand":"Mastercard","card_issuer_country":"BANGLADESH","card_issuer_country_code":"BD","currency_type":"BDT","currency_amount":"30.00","currency_rate":"1.0000","base',
          },
          {
            logs_on: "2026-04-23 15:37:58",
            tid: tid,
            stage: "success (ipn Return)",
            ip: "192.168.68.175",
            descriptions:
              'FAILED TO CONNECT WITH CLIENT - s:105:"{"status":"failed","error_reason":"URL PARAMETER IS EMPTY OR INVALID","result":"","result_http_code":"0"}";',
          },
          {
            logs_on: "2026-04-23 15:37:58",
            tid: tid,
            stage: "success (redirect)",
            ip: "192.168.68.175",
            descriptions:
              'SUCCESS RESPOND TO MERCHANT- status: VALID |  tran_id: 69E9E83FED062-69E9E849C3C17 | val_id: 26042315375727526149055fde5 | amount: 30.00 | card_type:MASTER-Eastern Bank Limited | store_amount:29.25 | card_no:512345XXXXXX0008 | bank_tran_id:EC53242026042300013 | URL: https://uat-invoice.sslcommerz.com/invoice/success?refer=69E9E83FED062&v3=1  | PARAM : {"amount":"30.00","bank_tran_id":"EC53242026042300013","base_fair":"30.00","card_brand":"Mastercard","card_issuer":"Eastern Bank Ltd","card_issuer',
          },
          {
            logs_on: "2026-04-23 15:37:57",
            tid: tid,
            stage: "POST_ACTION",
            ip: "192.168.194.45",
            descriptions:
              '{"ssl_ref_id":"EC53242026042300013","order_id":"7769370765276787704807","status":"AUTHORIZED","approval_code":"831000","retrievalReferenceNumber":"611309127534","vpc_3DSenrolled":"VEResEnrolled-Y","vpc_3DSstatus":"PENDING_AUTHENTICATION","eciRaw":"02","return_amount":"30.00","error_message":"","action":"post","incoming_ip":"192.168.194.45"}',
          },
          {
            logs_on: "2026-04-23 15:37:57",
            tid: tid,
            stage: "success (redirect)",
            ip: "192.168.68.175",
            descriptions:
              "WITH IN 10 MIN | TRANSACTON - No 0 & Amount  | TIME - 2026-04-23 15:37:13 ",
          },
          {
            logs_on: "2026-04-23 15:37:57",
            tid: tid,
            stage: "success (ipn Request)",
            ip: "192.168.68.175",
            descriptions:
              'SUCCESS | asds | {"amount":"30.00","bank_tran_id":"EC53242026042300013","base_fair":"30.00","card_brand":"Mastercard","card_issuer":"Eastern Bank Ltd","card_issuer_country":"BANGLADESH","card_issuer_country_code":"BD","card_no":"512345XXXXXX0008","card_sub_brand":"","card_type":"MASTER-Eastern Bank Limited","currency":"BDT","currency_amount":"30.00","currency_rate":"1.0000","currency_type":"BDT","error":"","risk_level":"0","risk_title":"Safe","status":"VALID","store_amount":"29.25","store_id":"d',
          },
          {
            logs_on: "2026-04-23 15:37:13",
            tid: tid,
            stage: "api (request)",
            ip: "192.168.194.46",
            descriptions:
              'POST: {"store_id":"demotest","total_amount":"30.00","amount":"30.00","currency":"BDT","tran_id":"69E9E83FED062-69E9E849C3C17","success_url":"https://uat-invoice.sslcommerz.com/invoice/success?refer=69E9E83FED062&v3=1","fail_url":"https://uat-invoice.sslcommerz.com/invoice/fail?refer=69E9E83FED062&v3=1","cancel_url":"https://uat-invoice.sslcommerz.com/invoice/cancel?refer=69E9E83FED062&v3=1","sms_ipn":"","email_ipn":"dummy@sslwireless.com","qr_name":"hello","ipn_url":"","pay_link_id":"69E9E83FED0',
          },
          {
            logs_on: "2026-04-23 15:37:13",
            tid: tid,
            stage: "api (response)",
            ip: "192.168.194.46",
            descriptions:
              '{"status":"SUCCESS","failedreason":"","amount":"30.00","currency":"BDT","sessionkey":"082711E6F7AEC8F0F5B9E2EF622DC140","gw":{"visa":"dbbl_visa,ebl_visa,visacard","master":"dbbl_master,ebl_master,mastercard","amex":"city_amex,amexcard","othercards":"dbbl_nexus,qcash,unionpay,dbbl_onus_visa,dbbl_onus_master","internetbanking":"city,bankasia,mtbl,sbi,upay,abdirect","mobilebanking":"dbblmobilebanking,bkash,abbank,mobilemoney,okwallet"},"redirectGatewayURL":"https://uat-securepay.sslcommerz.com/gwpr',
          },
        ];
        return { logs } as any;
      }

      if (url.includes("/cust-details")) {
        const tid = parseInt(parts[parts.length - 2]);
        const txn = db.transactions.find((t) => String(t.tid) === String(tid));
        const response: CustomerTrackingResponseData = {
          tid,
          track_cust_id: "CUST-101",
          customer: {
            name: txn?.customerName || "Nahid Hasan SL",
            email: txn?.customerEmail || "nahid@example.com",
            phone: txn?.customerMobile || "01712345678",
          },
          transactions: [
            {
              serial: 1,
              tid: tid,
              track_cust_id: "CUST-101",
              date: "23-Apr-26",
              time: "12:46PM",
              incommingtime: "2026-04-23 12:46:47",
              store_id: "demotest",
              gateway_name: "Eastern Bank Limited",
              banksslid: "EC39202026042300012",
              card_no: "445653XXXXXX1096",
              cardholder_name: "Limon",
              amount: 700,
              status: "success",
              status_display: "success",
              ip: "192.168.1.1",
              ip_city: "Dhaka",
              ip_country: "Bangladesh",
              customer_name: "Nahid Hasan SL",
              customer_email: "",
              customer_phone: "",
            },
          ],
          total_transactions: 15,
        } as any;
        return response as any;
      }

      // Transaction Detail Lookup (Match by ID or TID)
      const lookupId = lastPart;
      const txn = db.transactions.find(
        (t) => t.id === lookupId || String(t.tid) === lookupId,
      );
      if (txn) {
        return toRawDetail(txn);
      }
    }

    if (url.includes("/transactions/bin-info/")) {
      const parts = url.split("/");
      const cardNum = decodeURIComponent(parts[parts.length - 1].split("?")[0]);
      const details = db.getCardDetails(cardNum);
      const response: CardBinAndCustomerDetailsResponseData = {
        card_no: cardNum,
        bin_info: {
          id: 273587,
          bin: cardNum.substring(0, 6),
          brand: "VISA",
          sub_brand: "",
          country_code: "BD",
          country_name: "Bangladesh",
          bank: "EASTERN BANK",
          bank_id: "12",
          card_type: "CREDIT",
          card_category: "VISA",
          source_by: "Internal Source",
          time_taken: 0,
          created_on: "2025-04-06 14:38:19",
          updated_on: "0000-00-00 00:00:00",
          is_block_transaction: 0,
          status: "Ok",
        },
        customer_details: {
          card_no: cardNum,
          customer: {
            name: "Nahid Hasan SL",
            email: "",
            phone: "",
            ip_city: "",
            ip_country: "",
          },
          transactions: details.transactions.map(
            (t, idx) =>
              ({
                serial: idx + 1,
                tid: t.tid || 292041870,
                transaction_id: t.id,
                mtxnid: t.id,
                incommingtime: t.date,
                date: "23-Apr-26",
                time: "12:46PM",
                store_id: t.storeId,
                gateway_name: t.bankName || "Eastern Bank Limited",
                gateway_id: 13,
                banksslid: t.bankTxnId || "EC39202026042300012",
                scredit_card_num: cardNum,
                cardholder_name: t.cardholderName || "Limon",
                ip: t.ipAddress || "",
                ip_city: "",
                ip_country: "",
                amount: t.amount,
                status: t.status,
                status_badges: [],
                status_display: t.status,
                customer_name: t.customerName || "Nahid Hasan SL",
                customer_email: t.customerEmail || "",
                customer_phone: t.customerMobile || "",
              }) as any,
          ),
          total_transactions: details.transactions.length,
        },
        pagination: {
          current_page: 1,
          per_page: 10,
          from: 1,
          to: details.transactions.length,
          last_page: 1,
          total: details.transactions.length,
        },
      } as any;
      return response as any;
    }

    if (url.startsWith("/transactions?") || url === "/transactions") {
      const txns = db.transactions;
      const items: TransactionApiItem[] = txns.map((t, idx) => {
        const effectiveTid = t.tid || 1000 + idx;
        const masked =
          t.cardBin && t.cardLast4
            ? `${t.cardBin}XXXXXX${t.cardLast4}`
            : t.cardLast4
              ? `XXXXXX${t.cardLast4}`
              : "411111XXXXXX1111";
        const merchant = db.merchants.find((m) => m.id === t.merchantId);
        return {
          tid: effectiveTid,
          transaction_id: t.id,
          msslid: t.merchantId,
          strid: t.storeId,
          merchant_name: merchant?.name || t.storeName,
          store_name: t.storeName,
          mamount: t.amount,
          currency_type: t.currency,
          incommingtime: t.date,
          status: t.status,
          notice_label: t.status, // Crucial for status display
          cardtype: t.bankName || "City Bank", // Mapper uses this for bankName
          card_type: t.cardType || "Credit",
          visitor_ip: t.ipAddress,
          cus_name: t.customerName,
          cus_email: t.customerEmail,
          cus_phone: t.customerMobile,
          sel_card: t.method || "VISA",
          scredit_card_num: masked,
          issuerbank: `|||${t.cardBank || "City Bank"}|BD|Bangladesh`,
          banksslid: t.bankTxnId || "BANK-MOCK-ID",
          brac_ref_id: t.bankApprovalCode || "123456",
        } as any;
      });

      const response: TransactionListResponse = {
        items,
        pagination: {
          current_page: 1,
          per_page: 10,
          from: 1,
          to: items.length,
          last_page: 1,
          total: items.length,
        },
        links: { first: null, prev: null, next: null, last: null },
      };
      return response as any;
    }

    if (url.includes("/dashboard/sectors")) {
      const sectors = Array.from(new Set(db.merchants.map((m) => m.sector)));
      return { sectors } as any;
    }

    if (url === "/dashboard/summary" || url.startsWith("/dashboard/summary?")) {
      // Extract params from URL if needed, but for mock we can just use defaults
      const stats = await api.home.getStats();
      const rawTopMerchants = await api.home.getTopMerchants(
        "gmv",
        "this_month",
      );
      const rawChannelAmount = await api.home.getChannelSummary(
        undefined,
        "this_month",
        undefined,
        undefined,
        "amount",
      );
      const rawChannelCount = await api.home.getChannelSummary(
        undefined,
        "this_month",
        undefined,
        undefined,
        "count",
      );

      // Transform Top Merchants
      const formatTopMerchant = (m: any) => ({
        merchant_id: m.id || m.merchant_id,
        merchant_name: m.name || m.merchant_name,
        sector: m.sector,
        txn_amount: m.gmv7d || m.gmv30d || 0,
        txn_count: m.txCount7d || m.txCount30d || 0,
        revenue: m.revenue7d || m.revenue30d || 0,
        growth_pct: m.growth_pct || 5.2,
      });

      const topMerchantsTransformed = {
        txn_amount: rawTopMerchants.map(formatTopMerchant),
        txn_count: rawTopMerchants.map(formatTopMerchant),
        revenue: rawTopMerchants.map(formatTopMerchant),
      };

      // Transform Channel Summary
      const formatChannel = (c: any, metric: "amount" | "count") => ({
        channel: c.name || c.channel,
        percentage: c.percentage,
        txn_amount: metric === "amount" ? c.amount : Math.floor(c.amount * 100), // dummy scaling
        txn_count: metric === "count" ? c.amount : Math.floor(c.amount / 100), // dummy scaling
      });

      const channelSummaryTransformed = {
        txn_amount: rawChannelAmount.map((c) => formatChannel(c, "amount")),
        txn_count: rawChannelCount.map((c) => formatChannel(c, "count")),
      };

      const response: any = {
        meta: {
          from: "2026-04-01",
          to: "2026-04-27",
          kam_user_id: "1",
          sector: null,
          prev_from: "2026-03-01",
          prev_to: "2026-03-31",
          period_label: "This Month",
        },
        cards: {
          total_txn_volume: {
            title: "Total Transaction Volume",
            value: stats.gmv,
            trend_pct: 12.5,
          },
          total_txn_count: {
            title: "Total Transaction Count",
            value: stats.txCount,
            trend_pct: 8.2,
          },
          ssl_income: {
            title: "SSL Income",
            value: stats.sslIncome,
            trend_pct: 10.1,
          },
          emi_income: {
            title: "EMI Income",
            value: stats.emiIncome,
            trend_pct: -2.4,
          },
          txn_success_rate: {
            title: "TXN Success Rate",
            value: stats.successRate,
            trend_pct: 0.5,
          },
          txn_failed_count: {
            title: "TXN Failed Count",
            value: stats.failedCount,
            trend_pct: -5.2,
          },
          failed_merchant_count: {
            title: "Failed Merchant Count",
            value: stats.failedMerchantCount,
            trend_pct: 0,
          },
          chargeback_amount: {
            title: "Chargeback Amount",
            value: stats.chargebackAmount,
            trend_pct: 1.2,
          },
          escrow_hold: {
            title: "Escrow Hold",
            value: stats.escrowHoldAmount,
            trend_pct: 0,
          },
        },
        breakdowns: {
          sector_wise_volume: [],
        },
        merchant_overview: {
          transacting: stats.transActiveMerchants,
          non_transacting: stats.zeroTxnMerchants,
          recently_onboarded: stats.newMerchants,
          total_merchants: stats.totalMerchants,
          enabled_merchants: stats.activeMerchants,
          disabled_merchants: stats.inactiveMerchants,
        },
        top_merchants: topMerchantsTransformed,
        channel_wise_summary: channelSummaryTransformed,
        total_tickets: {
          total: stats.totalTickets,
          open: stats.openTickets,
        },
        settlements_bounce: {
          count: stats.settlementsBounceCount,
          bounce_amount: stats.settlementsBounceAmount,
        },
        alerts: {
          visible_count: 0,
          total_items: 0,
          items: [],
        },
      };
      return response;
    }

    if (url.includes("/dashboard/summary/")) {
      const parts = url.split("/");
      const metricKey = parts[parts.length - 1].split("?")[0];
      const stats = await api.home.getStats();

      // Map metricKey to stats value
      const metricMap: Record<string, any> = {
        total_txn_volume: {
          title: "Total TXN Volume",
          value: stats.gmv,
          sections: [
            { key: "sector_wise_volume", title: "Sector Wise Volume" },
          ],
        },
        total_txn_count: {
          title: "Total TXN Count",
          value: stats.txCount,
          sections: [{ key: "sector_wise_count", title: "Sector Wise Count" }],
        },
        ssl_income: {
          title: "SSL Income",
          value: stats.sslIncome,
          sections: [
            { key: "top_revenue_merchants", title: "Top Revenue Merchants" },
          ],
        },
        emi_income: {
          title: "EMI Income",
          value: stats.emiIncome,
          sections: [
            { key: "top_revenue_merchants", title: "Top Revenue Merchants" },
          ],
        },
        txn_success_rate: {
          title: "TXN Success Rate",
          value: stats.successRate,
        },
        txn_failed_count: {
          title: "TXN Failed Count",
          value: stats.failedCount,
          sections: [
            { key: "top_failed_merchants", title: "Top Failed Merchants" },
            { key: "top_failure_reasons", title: "Top Failure Reasons" },
          ],
        },
        chargeback_amount: {
          title: "Chargeback Amount",
          value: stats.chargebackAmount,
          sections: [
            { key: "chargeback_entries", title: "Chargeback Entries" },
          ],
        },
        escrow_hold: {
          title: "Escrow Hold",
          value: stats.escrowHoldAmount,
          sections: [
            { key: "escrow_hold_merchants", title: "Escrow Hold Merchants" },
          ],
        },
      };

      const metric = metricMap[metricKey] || {
        title: "Unknown Metric",
        value: 0,
      };

      const response: any = {
        meta: {
          card_key: metricKey,
          from: "2026-04-01",
          to: "2026-04-27",
          kam_user_id: "1",
          sector: null,
          prev_from: "2026-03-01",
          prev_to: "2026-03-31",
          period_label: "This Month",
        },
        title: metric.title,
        value: metric.value,
        trend_pct: 5.4,
        series: generateMockSeries(metric.value / 30),
        sections: (metric.sections || []).map((s: any) => {
          let items: any[] = [];

          if (s.key === "top_revenue_merchants") {
            items = [
              {
                name: "Daraz",
                merchant_name: "Daraz",
                storeId: "daraz_mall",
                merchant_id: "daraz_mall",
                value: Math.floor(metric.value * 0.45),
                amount: Math.floor(metric.value * 0.45),
                revenue: Math.floor(metric.value * 0.45),
              },
              {
                name: "Foodpanda",
                merchant_name: "Foodpanda",
                storeId: "fp_dhaka",
                merchant_id: "fp_dhaka",
                value: Math.floor(metric.value * 0.25),
                amount: Math.floor(metric.value * 0.25),
                revenue: Math.floor(metric.value * 0.25),
              },
              {
                name: "Grameenphone",
                merchant_name: "Grameenphone",
                storeId: "gp_pay",
                merchant_id: "gp_pay",
                value: Math.floor(metric.value * 0.2),
                amount: Math.floor(metric.value * 0.2),
                revenue: Math.floor(metric.value * 0.2),
              },
              {
                name: "US Bangla",
                merchant_name: "US Bangla",
                storeId: "usb_01",
                merchant_id: "usb_01",
                value: Math.floor(metric.value * 0.1),
                amount: Math.floor(metric.value * 0.1),
                revenue: Math.floor(metric.value * 0.1),
              },
            ];
          } else if (s.key === "top_failed_merchants") {
            items = [
              {
                name: "Daraz",
                merchant_name: "Daraz",
                count: Math.floor(metric.value * 0.45),
                value: Math.floor(metric.value * 0.45),
              },
              {
                name: "Foodpanda",
                merchant_name: "Foodpanda",
                count: Math.floor(metric.value * 0.25),
                value: Math.floor(metric.value * 0.25),
              },
              {
                name: "Grameenphone",
                merchant_name: "Grameenphone",
                count: Math.floor(metric.value * 0.2),
                value: Math.floor(metric.value * 0.2),
              },
              {
                name: "US Bangla",
                merchant_name: "US Bangla",
                count: Math.floor(metric.value * 0.1),
                value: Math.floor(metric.value * 0.1),
              },
            ];
          } else if (s.key === "top_failure_reasons") {
            items = [
              {
                name: "System Timeout",
                sector: "System Timeout",
                percentage: 40,
                count: Math.floor(metric.value * 0.4),
                value: Math.floor(metric.value * 0.4),
              },
              {
                name: "Insufficient Balance",
                sector: "Insufficient Balance",
                percentage: 30,
                count: Math.floor(metric.value * 0.3),
                value: Math.floor(metric.value * 0.3),
              },
              {
                name: "User Cancelled",
                sector: "User Cancelled",
                percentage: 20,
                count: Math.floor(metric.value * 0.2),
                value: Math.floor(metric.value * 0.2),
              },
              {
                name: "Bank Downtime",
                sector: "Bank Downtime",
                percentage: 10,
                count: Math.floor(metric.value * 0.1),
                value: Math.floor(metric.value * 0.1),
              },
            ];
          } else if (s.key === "escrow_hold_merchants") {
            items = [
              {
                name: "Daraz",
                merchant_name: "Daraz",
                merchant_id: "daraz_mall",
                store_id: "daraz_mall",
                date: "2026-04-20",
                entry_date: "2026-04-20",
                amount: Math.floor(metric.value * 0.45),
                value: Math.floor(metric.value * 0.45),
                id: "ESC-001",
                entry_id: "ESC-001",
              },
              {
                name: "Foodpanda",
                merchant_name: "Foodpanda",
                merchant_id: "fp_dhaka",
                store_id: "fp_dhaka",
                date: "2026-04-21",
                entry_date: "2026-04-21",
                amount: Math.floor(metric.value * 0.25),
                value: Math.floor(metric.value * 0.25),
                id: "ESC-002",
                entry_id: "ESC-002",
              },
              {
                name: "Grameenphone",
                merchant_name: "Grameenphone",
                merchant_id: "gp_pay",
                store_id: "gp_pay",
                date: "2026-04-22",
                entry_date: "2026-04-22",
                amount: Math.floor(metric.value * 0.2),
                value: Math.floor(metric.value * 0.2),
                id: "ESC-003",
                entry_id: "ESC-003",
              },
              {
                name: "US Bangla",
                merchant_name: "US Bangla",
                merchant_id: "usb_01",
                store_id: "usb_01",
                date: "2026-04-23",
                entry_date: "2026-04-23",
                amount: Math.floor(metric.value * 0.1),
                value: Math.floor(metric.value * 0.1),
                id: "ESC-004",
                entry_id: "ESC-004",
              },
            ];
          } else if (s.key === "chargeback_entries") {
            // Special Case for ChargebackList component structure
            return {
              ...s,
              merchant_wise: [
                {
                  merchant_name: "Daraz",
                  merchant_id: "daraz_mall",
                  total: Math.floor(metric.value * 0.7),
                  amount: Math.floor(metric.value * 0.7),
                  count: 5,
                  items: [
                    {
                      id: "CB-101",
                      txn_id: "CB-101",
                      date: "2026-04-10",
                      amount: Math.floor(metric.value * 0.4),
                      value: Math.floor(metric.value * 0.4),
                    },
                    {
                      id: "CB-102",
                      txn_id: "CB-102",
                      date: "2026-04-15",
                      amount: Math.floor(metric.value * 0.3),
                      value: Math.floor(metric.value * 0.3),
                    },
                  ],
                },
                {
                  merchant_name: "Foodpanda",
                  merchant_id: "fp_dhaka",
                  total: Math.floor(metric.value * 0.3),
                  amount: Math.floor(metric.value * 0.3),
                  count: 2,
                  items: [
                    {
                      id: "CB-103",
                      txn_id: "CB-103",
                      date: "2026-04-12",
                      amount: Math.floor(metric.value * 0.3),
                      value: Math.floor(metric.value * 0.3),
                    },
                  ],
                },
              ],
              general: [
                {
                  name: "Daraz",
                  merchant_name: "Daraz",
                  merchant_id: "daraz_mall",
                  date: "2026-04-10",
                  amount: Math.floor(metric.value * 0.4),
                  value: Math.floor(metric.value * 0.4),
                  id: "CB-101",
                  txn_id: "CB-101",
                },
                {
                  name: "Foodpanda",
                  merchant_name: "Foodpanda",
                  merchant_id: "fp_dhaka",
                  date: "2026-04-12",
                  amount: Math.floor(metric.value * 0.3),
                  value: Math.floor(metric.value * 0.3),
                  id: "CB-103",
                  txn_id: "CB-103",
                },
                {
                  name: "Daraz",
                  merchant_name: "Daraz",
                  merchant_id: "daraz_mall",
                  date: "2026-04-15",
                  amount: Math.floor(metric.value * 0.3),
                  value: Math.floor(metric.value * 0.3),
                  id: "CB-102",
                  txn_id: "CB-102",
                },
              ],
            };
          } else {
            // Default sector wise
            items = [
              {
                sector: "Pureplay Ecommerce",
                name: "Pureplay Ecommerce",
                percentage: 45,
                value: Math.floor(metric.value * 0.45),
                amount: Math.floor(metric.value * 0.45),
                count: Math.floor(metric.value * 0.45),
              },
              {
                sector: "Business Services",
                name: "Business Services",
                percentage: 25,
                value: Math.floor(metric.value * 0.25),
                amount: Math.floor(metric.value * 0.25),
                count: Math.floor(metric.value * 0.25),
              },
              {
                sector: "Retail",
                name: "Retail",
                percentage: 20,
                value: Math.floor(metric.value * 0.2),
                amount: Math.floor(metric.value * 0.2),
                count: Math.floor(metric.value * 0.2),
              },
              {
                sector: "Others",
                name: "Others",
                percentage: 10,
                value: Math.floor(metric.value * 0.1),
                amount: Math.floor(metric.value * 0.1),
                count: Math.floor(metric.value * 0.1),
              },
            ];
          }

          return { ...s, items };
        }),
      };
      return response;
    }

    if (url === "/filter-fields/chargebacks") {
      const response: any = {
        module: "chargebacks",
        date_presets: [
          { key: "today", label: "Today" },
          { key: "this_week", label: "This Week" },
          { key: "this_month", label: "This Month" },
          { key: "last_7_days", label: "Last 7 Days" },
          { key: "last_30_days", label: "Last 30 Days" },
          { key: "custom_range", label: "Custom Range" },
        ],
        date_range: {
          from_key: "from_date",
          to_key: "to_date",
          format: "YYYY-MM-DD",
          all_time_behavior: "include",
        },
        fields: [
          {
            key: "merchant_transaction_id",
            label: "Merchant Transa",
            type: "text",
            placeholder: "Ex: INV-123",
          },
          {
            key: "merchant_id",
            label: "Merchant ID",
            type: "text",
            placeholder: "Ex: 12345",
          },
          {
            key: "store_id",
            label: "Store ID",
            type: "text",
            placeholder: "Ex: store_live",
          },
          {
            key: "bank",
            label: "Bank",
            type: "select",
            options: [
              { label: "All Bank", value: "" },
              { label: "City Bank", value: "City Bank" },
              { label: "AMEX-City Bank", value: "AMEX-City Bank" },
              { label: "DBBL", value: "DBBL" },
              { label: "Brac Bank", value: "Brac Bank" },
            ],
          },
          {
            key: "stage",
            label: "Chargeback Stage",
            type: "select",
            options: [
              { label: "All Chargeback Stage", value: "" },
              { label: "1st Chargeback", value: "1st Chargeback" },
              { label: "Pre-Arbitration", value: "Pre-Arbitration" },
              { label: "Arbitration", value: "Arbitration" },
            ],
          },
          {
            key: "request_status",
            label: "Request Status",
            type: "select",
            options: [
              { label: "Success", value: "Success" },
              { label: "Waiting", value: "Waiting" },
              { label: "Processing", value: "Processing" },
              { label: "Cancelled", value: "Cancelled" },
            ],
          },
          {
            key: "approval_status",
            label: "Approval Status",
            type: "select",
            options: [
              { label: "Approve", value: "Approve" },
              { label: "Processing", value: "Processing" },
              { label: "Deny", value: "Deny" },
              { label: "Cancel", value: "Cancel" },
            ],
          },
          {
            key: "chargeback_reference_id",
            label: "Chargeback Ref ID",
            type: "text",
            placeholder: "Ex: CB-123",
          },
          {
            key: "transaction_id",
            label: "Transaction ID",
            type: "text",
            placeholder: "Ex: TXN-456",
          },
        ],
        advanced_filter_names: [
          "merchant_transaction_id",
          "merchant_id",
          "store_id",
          "bank",
          "stage",
          "request_status",
          "approval_status",
          "chargeback_reference_id",
          "transaction_id",
        ],
        default_values: {
          date_preset: "this_month",
        },
      };
      return simulateLatency(response);
    }

    if (url.startsWith("/chargebacks/overview")) {
      const stats = await api.home.getStats();
      const response: any = {
        total_rows: db.chargebacks.length,
        total_success_amount: stats.chargebackAmount,
        total_success_transaction: Math.floor(db.chargebacks.length * 0.8),
        total_processing: Math.floor(db.chargebacks.length * 0.1),
        total_requests: db.chargebacks.length,
        pending_requests: Math.floor(db.chargebacks.length * 0.05),
        successful_chargeback: Math.floor(db.chargebacks.length * 0.8),
        chargeback_amount: stats.chargebackAmount,
      };
      return simulateLatency(response);
    }

    if (url === "/chargebacks" || url.startsWith("/chargebacks?")) {
      const searchParams = new URL(url, "http://localhost").searchParams;
      const page = parseInt(searchParams.get("page") || "1");
      const perPage = parseInt(searchParams.get("per_page") || "10");

      let filtered = [...db.chargebacks];

      // Simple search filtering
      const cbRefId = searchParams.get("chargeback_reference_id");
      if (cbRefId)
        filtered = filtered.filter((cb) =>
          cb.chargebackRefId?.toLowerCase().includes(cbRefId.toLowerCase()),
        );

      const txnId = searchParams.get("transaction_id");
      if (txnId)
        filtered = filtered.filter((cb) =>
          cb.transactionId?.toLowerCase().includes(txnId.toLowerCase()),
        );

      const mTxnId = searchParams.get("merchant_transaction_id");
      if (mTxnId)
        filtered = filtered.filter((cb) =>
          cb.merchantRefCode?.toLowerCase().includes(mTxnId.toLowerCase()),
        );

      const merchantId = searchParams.get("merchant_id");
      if (merchantId)
        filtered = filtered.filter((cb) =>
          cb.merchantId?.toLowerCase().includes(merchantId.toLowerCase()),
        );

      const storeId = searchParams.get("store_id");
      if (storeId)
        filtered = filtered.filter((cb) =>
          cb.storeId?.toLowerCase().includes(storeId.toLowerCase()),
        );

      const bank = searchParams.get("bank");
      if (bank && bank !== "")
        filtered = filtered.filter((cb) => (cb.bankName || cb.bank) === bank);

      const stage = searchParams.get("stage");
      if (stage && stage !== "")
        filtered = filtered.filter((cb) => cb.stage === stage);

      const status = searchParams.get("request_status");
      if (status && status !== "")
        filtered = filtered.filter((cb) => cb.requestStatus === status);

      const approvalStatus = searchParams.get("approval_status");
      if (approvalStatus && approvalStatus !== "")
        filtered = filtered.filter(
          (cb) => cb.approvalStatus === approvalStatus,
        );

      const total = filtered.length;
      const start = (page - 1) * perPage;
      const end = start + perPage;
      const paginated = filtered.slice(start, end);

      const mapChargeback = (cb: any): any => {
        const fullIndex = db.chargebacks.indexOf(cb);
        return {
          chargeback_id:
            fullIndex === -1 ? Math.floor(Math.random() * 1000) : fullIndex,
          sid: 1,
          tid: 1,
          store_id: cb.storeId,
          msslid: cb.bankSslId,
          merchant_id: cb.merchantId,
          merchant_name: cb.merchantName,
          store_name: cb.storeName,
          store_url: "https://example.com",
          store_landing_url: "https://example.com",
          merchant_transaction_id: cb.merchantRefCode,
          transaction_id: cb.transactionId,
          chargeback_reference_id: cb.chargebackRefId,
          merchant_reference_id: cb.merchantRefCode,
          chargeback_amount: Math.abs(cb.amount),
          settled_amount: cb.amount,
          request_remarks: "Mock chargeback request",
          request_status: cb.requestStatus === "Success" ? 1 : 2,
          request_status_label: cb.requestStatus,
          approved_status: cb.approvalStatus === "Approve" ? 1 : 2,
          approved_status_label: cb.approvalStatus,
          confirmed_status: 1,
          confirmed_status_label: "Confirmed",
          request_on: cb.requestedOn,
          confirmed_on: cb.requestedOn,
          approved_on: cb.requestedOn,
          card_no: "4111XXXXXX1111",
          card_type: "VISA",
          mtxnid: cb.merchantRefCode,
          mamount: Math.abs(cb.amount),
          incommingtime: cb.requestedOn,
          bid: 1,
          stage_label: cb.stage,
        };
      };

      const response: any = {
        items: paginated.map(mapChargeback),
        pagination: {
          current_page: page,
          per_page: perPage,
          from: start + 1,
          to: Math.min(end, total),
          last_page: Math.ceil(total / perPage),
          total: total,
        },
      };
      return simulateLatency(response);
    }

    if (url === "/filter-fields/refunds") {
      const response: RefundFilterFieldsResponseData = {
        module: "refunds",
        fields: [
          {
            key: "merchant_transaction_id",
            label: "Merchant Transa",
            type: "text",
            placeholder: "Ex: INV-123",
          },
          {
            key: "merchant_id",
            label: "Merchant ID",
            type: "text",
            placeholder: "Ex: 12345",
          },
          {
            key: "store_id",
            label: "Store ID",
            type: "text",
            placeholder: "Ex: store_live",
          },
          {
            key: "refund_reference_id",
            label: "Refund Ref ID",
            type: "text",
            placeholder: "Ex: REF-123",
          },
          {
            key: "merchant_reference_id",
            label: "Merchant Ref ID",
            type: "text",
            placeholder: "Ex: MREF-123",
          },
          {
            key: "refund_request_status",
            label: "Request Status",
            type: "select",
            options: [
              { label: "All Status", value: "" },
              { label: "Success", value: "1" },
              { label: "Failed", value: "0" },
              { label: "Processing", value: "2" },
            ],
          },
        ],
        advanced_filter_names: [
          "merchant_transaction_id",
          "merchant_id",
          "store_id",
          "refund_reference_id",
          "merchant_reference_id",
          "refund_request_status",
        ],
      };
      return simulateLatency(response as any);
    }

    if (url.startsWith("/refunds/overview")) {
      const response: RefundOverviewResponse = {
        total_requests: db.refunds.length,
        total_request_amount: db.refunds.reduce((sum, r) => sum + r.amount, 0),
        total_refund_amount: db.refunds
          .filter((r) => r.requestStatusLabel === "Success")
          .reduce((sum, r) => sum + r.amount, 0),
        total_success_refunds: db.refunds.filter(
          (r) => r.requestStatusLabel === "Success",
        ).length,
        total_cancel_refunds: db.refunds.filter(
          (r) => r.requestStatusLabel === "Cancelled",
        ).length,
        total_pending_requests: db.refunds.filter(
          (r) => r.requestStatusLabel === "Pending",
        ).length,
        pending_requests: db.refunds.filter(
          (r) => r.requestStatusLabel === "Pending",
        ).length,
        successful_refunds: db.refunds.filter(
          (r) => r.requestStatusLabel === "Success",
        ).length,
        refunded_amount: db.refunds
          .filter((r) => r.requestStatusLabel === "Success")
          .reduce((sum, r) => sum + r.amount, 0),
      };
      return simulateLatency(response as any);
    }

    if (url === "/refunds" || url.startsWith("/refunds?")) {
      const searchParams = new URL(url, "http://localhost").searchParams;
      const page = parseInt(searchParams.get("page") || "1");
      const perPage = parseInt(searchParams.get("per_page") || "10");

      let filtered = [...db.refunds];

      // Simple search filtering
      const refundRefId = searchParams.get("refund_reference_id");
      if (refundRefId)
        filtered = filtered.filter((r) =>
          r.refundRefId?.toLowerCase().includes(refundRefId.toLowerCase()),
        );

      const mTxnId = searchParams.get("merchant_transaction_id");
      if (mTxnId)
        filtered = filtered.filter((r) =>
          r.merchantTransactionId?.toLowerCase().includes(mTxnId.toLowerCase()),
        );

      const status = searchParams.get("refund_request_status");
      if (status && status !== "")
        filtered = filtered.filter((r) => String(r.requestStatus) === status);

      const total = filtered.length;
      const start = (page - 1) * perPage;
      const end = start + perPage;
      const paginated = filtered.slice(start, end);

      const mapRefund = (r: Refund): any => ({
        refund_id: r.refundId,
        sid: r.sid,
        tid: r.tid,
        store_id: r.storeId,
        msslid: r.msslid,
        merchant_id: r.merchantId,
        merchant_name: r.merchantName,
        store_name: r.storeName,
        store_url: r.storeUrl,
        store_landing_url: r.storeLandingUrl,
        merchant_transaction_id: r.merchantTransactionId,
        transaction_id: r.transactionId,
        refund_reference_id: r.refundRefId,
        merchant_reference_id: r.merchantRefCode,
        refund_amount: r.amount,
        settled_amount: r.settledAmount,
        request_remarks: r.requestedRemarks,
        has_emi: r.hasEmi,
        settlement_status: r.settlementStatus,
        request_status: r.requestStatus,
        request_status_label: r.requestStatusLabel,
        approved_status: r.approvedStatus,
        approved_status_label: r.approvedStatusLabel,
        confirmed_status: r.confirmedStatus,
        confirmed_status_label: r.confirmedStatusLabel,
        request_on: r.requestedOn,
        confirmed_on: r.confirmedOn,
        approved_on: r.approvedOn,
        card_no: r.cardNo,
        card_type: r.cardType || "Unknown",
        mtxnid: r.mtxnid,
        mamount: r.mamount,
        incommingtime: r.incommingtime,
        bid: r.bid,
      });

      const response: RefundListResponse = {
        items: paginated.map(mapRefund),
        pagination: {
          current_page: page,
          per_page: perPage,
          from: start + 1,
          to: Math.min(end, total),
          last_page: Math.ceil(total / perPage),
          total: total,
        },
        links: {
          first: `/refunds?page=1`,
          prev: page > 1 ? `/refunds?page=${page - 1}` : null,
          next:
            page < Math.ceil(total / perPage)
              ? `/refunds?page=${page + 1}`
              : null,
          last: `/refunds?page=${Math.ceil(total / perPage)}`,
        },
      };
      return simulateLatency(response as any);
    }

    if (
      url.includes("/refunds/") &&
      !url.includes("/overview") &&
      !url.includes("/filter-fields")
    ) {
      const parts = url.split("/");
      const rawId = parts[parts.length - 1].split("?")[0];

      const idx = parseInt(rawId);
      const r = !isNaN(idx)
        ? db.refunds.find((ref) => ref.refundId === idx)
        : db.refunds.find((ref) => ref.id === rawId);

      if (!r) return simulateLatency(null);

      const mapped: RefundDetailApiItem = {
        refund_id: r.refundId,
        sid: r.sid,
        tid: r.tid,
        store_id: r.storeId,
        msslid: r.msslid,
        merchant_id: r.merchantId,
        merchant_name: r.merchantName,
        store_name: r.storeName,
        store_url: r.storeUrl,
        store_landing_url: r.storeLandingUrl,
        merchant_transaction_id: r.merchantTransactionId,
        transaction_id: r.transactionId,
        refund_reference_id: r.refundRefId,
        merchant_reference_id: r.merchantRefCode,
        refund_amount: r.amount,
        settled_amount: r.settledAmount,
        request_remarks: r.requestedRemarks,
        has_emi: r.hasEmi,
        settlement_status: r.settlementStatus,
        request_status: r.requestStatus,
        request_status_label: r.requestStatusLabel,
        approved_status: r.approvedStatus,
        approved_status_label: r.approvedStatusLabel,
        confirmed_status: r.confirmedStatus,
        confirmed_status_label: r.confirmedStatusLabel,
        request_on: r.requestedOn,
        confirmed_on: r.confirmedOn,
        approved_on: r.approvedOn,
        card_no: r.cardNo,
        card_type: r.cardType || "Unknown",
        mtxnid: r.mtxnid,
        mamount: r.mamount,
        incommingtime: r.incommingtime,
        bid: r.bid,
        // Detail specific
        request_by: r.requestedBy ? 1 : 0,
        request_by_name: r.requestedBy ?? null,
        confirmed_by: r.confirmedBy || 0,
        confirmed_by_name: r.confirmedByName || null,
        confirmed_remarks: r.confirmedRemarks || "",
        approved_by: r.approvedBy || 0,
        approved_by_name: r.approvedByName || null,
        approved_remarks: r.approvalRemarks || "",
        strid: r.strid || r.storeId || "",
        bank_name: r.bankName || null,
        bankssl_id: r.bankSslId || null,
        auto_refund_status: r.autoRefundStatus || "Pending",
        auto_refund_attempts: r.autoRefundAttempts || 0,
        auto_refund_remarks: r.autoRefundRemarks || null,
      };
      return simulateLatency(mapped as any);
    }

    if (url === "/filter-fields/settlements") {
      const response: SettlementFilterFieldsResponse = {
        module: "settlements",
        fields: [
          {
            key: "transaction_id",
            label: "Transaction ID",
            type: "text",
            placeholder: "Ex: TXN-123",
          },
          {
            key: "merchant_id",
            label: "Merchant ID",
            type: "text",
            placeholder: "Ex: 12345",
          },
          {
            key: "store_id",
            label: "Store ID",
            type: "text",
            placeholder: "Ex: store_live",
          },
          {
            key: "status",
            label: "Status",
            type: "select",
            options: [
              { label: "All Status", value: "" },
              { label: "Paid", value: "Paid" },
              { label: "Pending", value: "Pending" },
              { label: "Bounced", value: "Bounced" },
              { label: "On Hold", value: "On Hold" },
            ],
          },
        ],
        advanced_filter_names: [
          "transaction_id",
          "merchant_id",
          "store_id",
          "status",
        ],
      };
      return simulateLatency(response as any);
    }

    if (url.startsWith("/settlements/overview")) {
      const searchParams = new URL(url, "http://localhost").searchParams;
      const status = searchParams.get("status");

      let filtered = db.settlements;
      if (status)
        filtered = filtered.filter((s) => s.settlementStatus === status);

      const response: SettlementOverviewData = {
        bounce_count: filtered.filter((s) => s.settlementStatus === "Bounced")
          .length,
        bounce_amount: filtered
          .filter((s) => s.settlementStatus === "Bounced")
          .reduce((sum, s) => sum + s.amount, 0),
      };
      return simulateLatency(response as any);
    }

    if (url === "/settlements" || url.startsWith("/settlements?")) {
      const searchParams = new URL(url, "http://localhost").searchParams;
      const page = parseInt(searchParams.get("page") || "1");
      const perPage = parseInt(searchParams.get("per_page") || "10");

      let filtered = [...db.settlements];

      const status = searchParams.get("status");
      if (status && status !== "")
        filtered = filtered.filter((s) => s.settlementStatus === status);

      const txnId = searchParams.get("transaction_id");
      if (txnId)
        filtered = filtered.filter((s) =>
          s.txnId.toLowerCase().includes(txnId.toLowerCase()),
        );

      const total = filtered.length;
      const start = (page - 1) * perPage;
      const end = start + perPage;
      const paginated = filtered.slice(start, end);

      const response: SettlementListResponse = {
        items: paginated.map((s) => ({
          source_module: "Merchant",
          source_pk: parseInt(s.id.split("_")[1]) || 0,
          settlement_date: s.settlementDate,
          transaction_id: s.txnId,
          merchant_name: s.merchantName,
          merchant_code: s.merchantId,
          store_name: s.storeName,
          store_id: s.storeId,
          payee_name: s.bankDetails.payeeName,
          bank_name: s.bankDetails.bankName,
          branch_name: s.bankDetails.branchName,
          account_no: s.bankDetails.accountNo,
          routing_no: s.bankDetails.routingNo,
          bank_information: `${s.bankDetails.bankName} (${s.bankDetails.branchName})`,
          settlement_type: s.type,
          opening_amt: s.onlineAmounts?.opening || 0,
          payable_amt: s.onlineAmounts?.payable || 0,
          settle_amt: s.onlineAmounts?.settlement || s.amount,
          paid_amt: s.onlineAmounts?.paid || 0,
          fwd_amt: s.onlineAmounts?.forwarded || 0,
          status: s.settlementStatus,
          action: { details_enabled: true },
        })),
        pagination: {
          current_page: page,
          per_page: perPage,
          from: start + 1,
          to: Math.min(end, total),
          last_page: Math.ceil(total / perPage),
          total: total,
        },
      };
      return simulateLatency(response as any);
    }

    if (
      url.includes("/settlements/") &&
      !url.includes("/overview") &&
      !url.includes("/filter-fields") &&
      !url.includes("/resend-email")
    ) {
      const parts = url.split("/");
      const txnId = parts[parts.length - 1].split("?")[0];
      const s = db.settlements.find(
        (item) => item.txnId === txnId || item.id === txnId,
      );

      if (!s) return simulateLatency(null);

      const response: SettlementDetail = {
        source_module: "Merchant",
        source_pk: parseInt(s.id.split("_")[1]) || 0,
        transaction_id: s.txnId,
        batch_no: parseInt(s.batchId.split("-")[1]) || 0,
        reference_no: s.referenceNo || `REF-${s.txnId}`,
        status: {
          label: s.settlementStatus,
        },
        actions: {
          resend_email: {
            enabled: true,
            implemented: true,
          },
        },
        transaction_summary:
          s.transactionSummary?.map((ts) => ({
            type: ts.type,
            no_of_trans: ts.noOfTrans,
            ssl_amt: ts.sslAmt,
            bank_amt: ts.bankAmt,
            store_amt: ts.storeAmt,
            deduct_amt: ts.deductAmt,
          })) || [],
        payment_information:
          s.paymentInformation?.map((p) => ({
            cheque_sl: p.id,
            cheque_ref: p.chequeRef,
            acct_payee: p.acctPayee,
            amount: p.amount,
            bank: p.bank,
            attachment: p.attachment === "-" ? null : p.attachment,
          })) || [],
        general_information: {
          settlement_date: s.settlementDate,
          transaction_id: s.txnId,
          reference_no: s.referenceNo || `REF-${s.txnId}`,
          merchant_name: s.merchantName,
          store_name: s.storeName,
          settlement_type: s.type,
          total_amount: s.amount,
          payee_name: s.bankDetails.payeeName,
          bank_name: s.bankDetails.bankName,
          branch_name: s.bankDetails.branchName,
          account_no: parseInt(s.bankDetails.accountNo) || 0,
          routing_no: s.bankDetails.routingNo,
        },
        amount_stacking: {
          opening_amt: s.onlineAmounts?.opening || 0,
          payable_amt: s.onlineAmounts?.payable || 0,
          settle_amt: s.onlineAmounts?.settlement || s.amount,
          paid_amt: s.onlineAmounts?.paid || 0,
          fwd_amt: s.onlineAmounts?.forwarded || 0,
        },
      };
      return simulateLatency(response as any);
    }

    if (url === "/filter-fields/emi-operations") {
      const response: EMIOperationFilterFieldsResponse = {
        module: "emi-operations",
        date_presets: [
          { key: "today", label: "Today" },
          { key: "yesterday", label: "Yesterday" },
          { key: "7d", label: "Last 7 Days" },
          { key: "30d", label: "Last 30 Days" },
        ],
        fields: [
          {
            key: "transaction_id",
            label: "Transaction ID",
            type: "text",
            placeholder: "Ex: TXN123",
          },
          {
            key: "emi_ref_id",
            label: "EMI Ref ID",
            type: "text",
            placeholder: "Ex: EMI789",
          },
          {
            key: "merchant_id",
            label: "Merchant ID",
            type: "text",
            placeholder: "Ex: 12345",
          },
          {
            key: "request_status",
            label: "Status",
            type: "select",
            options: [
              { label: "All Status", value: "" },
              { label: "Pending", value: "Pending" },
              { label: "Approved", value: "Approved" },
              { label: "Declined", value: "Declined" },
            ],
          },
        ],
        advanced_filter_names: ["transaction_id", "emi_ref_id", "merchant_id"],
      };
      return simulateLatency(response as any);
    }

    if (url.startsWith("/emi-operations/overview")) {
      const response: EMIOperationOverviewResponse = {
        total_requests: db.emiOperations.length,
        total_declined: db.emiOperations.filter((e) => e.status === "Declined")
          .length,
        total_approved: db.emiOperations.filter((e) => e.status === "Approved")
          .length,
        total_emi_amount: db.emiOperations.reduce(
          (sum, e) => sum + e.emiAmount,
          0,
        ),
      };
      return simulateLatency(response as any);
    }

    if (url === "/emi-operations" || url.startsWith("/emi-operations?")) {
      const searchParams = new URL(url, "http://localhost").searchParams;
      const page = parseInt(searchParams.get("page") || "1");
      const perPage = parseInt(searchParams.get("per_page") || "10");

      let filtered = [...db.emiOperations];

      const status = searchParams.get("request_status");
      if (status && status !== "")
        filtered = filtered.filter((e) => e.status === status);

      const txnId = searchParams.get("transaction_id");
      if (txnId)
        filtered = filtered.filter((e) =>
          e.transactionId.toLowerCase().includes(txnId.toLowerCase()),
        );

      const emiRefId = searchParams.get("emi_ref_id");
      if (emiRefId)
        filtered = filtered.filter((e) =>
          e.emiRefId.toLowerCase().includes(emiRefId.toLowerCase()),
        );

      const total = filtered.length;
      const start = (page - 1) * perPage;
      const end = start + perPage;
      const paginated = filtered.slice(start, end);

      const response: EMIOperationListResponse = {
        items: paginated.map((e) => ({
          emi_id: parseInt(e.id.split("_")[1]) || 0,
          tid: 1000 + (parseInt(e.id.split("_")[1]) || 0),
          store_sid: 2000 + (parseInt(e.id.split("_")[1]) || 0),
          store_id: e.storeId,
          store_name: e.storeName,
          merchant_id: "MID_" + e.merchantName.split(" ")[0].toUpperCase(),
          merchant_name: e.merchantName,
          request_on: e.requestedAt,
          emi_ref_id: e.emiRefId,
          emi_issuer: 1,
          emi_issuer_bank_name: e.bankStatus,
          emi_month: e.tenureMonths,
          emi_month_label: `${e.tenureMonths} Months`,
          transaction_id: e.transactionId,
          mamount: e.transactionAmount,
          emi_amount: e.emiAmount,
          request_status:
            e.status === "Approved" ? 1 : e.status === "Declined" ? 0 : 2,
          request_status_label: e.status,
          confirmed_status: e.status === "Approved" ? 1 : 0,
          confirmed_status_label:
            e.status === "Approved" ? "Confirmed" : "Pending",
          approved_status: e.status === "Approved" ? 1 : 0,
          bank_status: e.bankStatus,
          bank_status_label: e.bankStatus,
          can_proceed: e.canProceed,
          can_cancel: e.canCancel,
        })),
        pagination: {
          current_page: page,
          per_page: perPage,
          from: start + 1,
          to: Math.min(end, total),
          last_page: Math.ceil(total / perPage),
          total: total,
        },
      };
      return simulateLatency(response as any);
    }

    if (
      url.includes("/emi-operations/") &&
      !url.includes("/overview") &&
      !url.includes("/filter-fields")
    ) {
      const parts = url.split("/");
      const emiIdRaw = parts[parts.length - 1].split("?")[0];
      const emiId = parseInt(emiIdRaw);
      const e = db.emiOperations.find(
        (item) => item.id === `emi_${emiId}` || item.id === emiIdRaw,
      );

      if (!e) return simulateLatency(null);

      const response: EMIOperationDetailsApiItem = {
        emi_id: parseInt(e.id.split("_")[1]) || 0,
        tid: 1000 + (parseInt(e.id.split("_")[1]) || 0),
        store_sid: 2000 + (parseInt(e.id.split("_")[1]) || 0),
        store_id: e.storeId,
        store_name: e.storeName,
        merchant_id: "MID_" + e.merchantName.split(" ")[0].toUpperCase(),
        merchant_name: e.merchantName,
        request_on: e.requestedAt,
        emi_ref_id: e.emiRefId,
        emi_issuer: 1,
        emi_issuer_bank_name: e.issuerBank,
        emi_month: e.tenureMonths,
        emi_month_label: `${e.tenureMonths} Months`,
        transaction_id: e.transactionId,
        mamount: e.transactionAmount,
        emi_amount: e.emiAmount,
        request_status:
          e.status === "Approved" ? 1 : e.status === "Declined" ? 0 : 2,
        request_status_label: e.status,
        confirmed_status: e.status === "Approved" ? 1 : 0,
        confirmed_status_label:
          e.status === "Approved" ? "Confirmed" : "Pending",
        approved_status: e.status === "Approved" ? 1 : 0,
        bank_status: e.bankStatus,
        bank_status_label: e.bankStatus,
        can_proceed: e.canProceed,
        can_cancel: e.canCancel,
        store_url: e.homePageOfStore || "https://example.com",
        request_remarks: e.requestedRemarks || "",
        confirmed_on: e.requestedAt,
        confirmed_by: 101,
        confirmed_by_name: "System Admin",
        confirmed_remarks: "Auto confirmed",
        approved_on: e.requestedAt,
        approved_by: 202,
        approved_by_name: "KAM Manager",
        approved_remarks: "Approved for processing",
        bankssl_id: e.bankSslId || "SSL-EMI-001",
        sys_email_on: e.requestedAt,
        is_sys_email_sent: 1,
        merchant_transaction_id: "M-TXN-" + e.transactionId,
        ssl_transaction_id: e.transactionId,
        transaction_date: e.transactionDate,
        transaction_bank_name: e.bankName || "Unknown Bank",
        transaction_card_type: "Credit Card",
        transaction_amount: e.transactionAmount,
        emi_attachment_doc_path: "#",
        emi_attachment_file_type: "pdf",
        emi_attachment_file_of: "customer",
      };
      return simulateLatency(response as any);
    }

    return simulateLatency(null);
  },

  merchants: {
    list: async (): Promise<Merchant[]> => {
      return simulateLatency([...db.merchants]);
    },
    get: async (id: string): Promise<Merchant | undefined> => {
      return simulateLatency(db.merchants.find((m) => m.id === id));
    },
    create: async (merchantData: Partial<Merchant>): Promise<Merchant> => {
      const newMerchant = await db.createMerchant(merchantData);
      return simulateLatency(newMerchant);
    },
    update: async (
      id: string,
      updates: Partial<Merchant>,
    ): Promise<Merchant> => {
      const idx = db.merchants.findIndex((m) => m.id === id);
      if (idx >= 0) {
        db.merchants[idx] = { ...db.merchants[idx], ...updates };
        return simulateLatency(db.merchants[idx]);
      }
      throw new Error("Merchant not found");
    },
    getUsers: async (merchantId: string): Promise<MerchantUser[]> => {
      return simulateLatency(
        db.merchantUsers.filter((u) => u.merchantId === merchantId),
      );
    },
  },
  resellers: {
    list: async (): Promise<Reseller[]> => {
      return simulateLatency([...db.resellers]);
    },
    get: async (id: string): Promise<Reseller | undefined> => {
      return simulateLatency(db.resellers.find((r) => r.id === id));
    },
    create: async (resellerData: Partial<Reseller>): Promise<Reseller> => {
      const newReseller = await db.createReseller(resellerData);
      return simulateLatency(newReseller);
    },
    update: async (
      id: string,
      updates: Partial<Reseller>,
    ): Promise<Reseller> => {
      const idx = db.resellers.findIndex((r) => r.id === id);
      if (idx >= 0) {
        db.resellers[idx] = { ...db.resellers[idx], ...updates };
        return simulateLatency(db.resellers[idx]);
      }
      throw new Error("Reseller not found");
    },
  },
  kamResellers: {
    list: async () => {
      const { listKamResellers } =
        await import("../../features/resellers/data/kamResellersData");
      return simulateLatency(listKamResellers());
    },
    get: async (id: string) => {
      const { getKamResellerById } =
        await import("../../features/resellers/data/kamResellersData");
      const reseller = getKamResellerById(id);
      return simulateLatency(reseller);
    },
  },
  opResellers: {
    list: async () => {
      const { listOpResellers } =
        await import("../../features/resellers/data/opResellersData");
      return simulateLatency(listOpResellers());
    },
    get: async (id: string) => {
      const { getOpResellerById } =
        await import("../../features/resellers/data/opResellersData");
      const reseller = getOpResellerById(id);
      return simulateLatency(reseller);
    },
    updateStatus: async (
      id: string,
      status: import("../../features/resellers/types/opReseller").OpResellerStatus,
      rejectedReason?: string,
    ) => {
      const { updateOpResellerStatus } =
        await import("../../features/resellers/data/opResellersData");
      const reseller = updateOpResellerStatus(id, status, rejectedReason);
      return simulateLatency(reseller);
    },
    updateDocumentStatus: async (
      id: string,
      documentId: string,
      status: "Accepted" | "Rejected",
      rejectedReason?: string,
    ) => {
      const { updateOpResellerDocumentStatus } =
        await import("../../features/resellers/data/opResellersData");
      const reseller = updateOpResellerDocumentStatus(
        id,
        documentId,
        status,
        rejectedReason,
      );
      return simulateLatency(reseller);
    },
    notify: async (id: string, message?: string) => {
      const { notifyOpReseller } =
        await import("../../features/resellers/data/opResellersData");
      const reseller = notifyOpReseller(id, message);
      return simulateLatency(reseller);
    },
  },
  apResellers: {
    list: async () => {
      const { listApResellers } =
        await import("../../features/resellers/data/apResellersData");
      return simulateLatency(listApResellers());
    },
    get: async (id: string) => {
      const { getApResellerById } =
        await import("../../features/resellers/data/apResellersData");
      const reseller = getApResellerById(id);
      return simulateLatency(reseller);
    },
    requestRaApproval: async (id: string) => {
      const { requestApRaApproval } =
        await import("../../features/resellers/data/apResellersData");
      const reseller = requestApRaApproval(id);
      return simulateLatency(reseller);
    },
    initiateSettlement: async (id: string) => {
      const { initiateApSettlement } =
        await import("../../features/resellers/data/apResellersData");
      const reseller = initiateApSettlement(id);
      return simulateLatency(reseller);
    },
  },
  raResellers: {
    list: async () => {
      const { listRaResellers } =
        await import("../../features/resellers/data/raResellersData");
      return simulateLatency(listRaResellers());
    },
    get: async (id: string) => {
      const { getRaResellerById } =
        await import("../../features/resellers/data/raResellersData");
      const reseller = getRaResellerById(id);
      return simulateLatency(reseller);
    },
    updateStatus: async (
      id: string,
      status: import("../../features/resellers/types/raReseller").RaResellerApprovalStatus,
      rejectedReason?: string,
    ) => {
      const { updateRaResellerStatus } =
        await import("../../features/resellers/data/raResellersData");
      const reseller = updateRaResellerStatus(id, status, rejectedReason);
      return simulateLatency(reseller);
    },
  },
  inviteResellers: {
    list: async () => {
      const { listInviteResellers } =
        await import("../../features/resellers/data/inviteResellersData");
      return simulateLatency(listInviteResellers());
    },
    get: async (id: string) => {
      const { getInviteResellerById } =
        await import("../../features/resellers/data/inviteResellersData");
      const reseller = getInviteResellerById(id);
      return simulateLatency(reseller);
    },
    create: async (input: { name: string; mobile: string; email: string }) => {
      const { createInviteReseller } =
        await import("../../features/resellers/data/inviteResellersData");
      return simulateLatency(createInviteReseller(input));
    },
    invite: async (id: string) => {
      const { inviteReseller } =
        await import("../../features/resellers/data/inviteResellersData");
      return simulateLatency(inviteReseller(id));
    },
    followUp: async (id: string) => {
      const { followUpInviteReseller } =
        await import("../../features/resellers/data/inviteResellersData");
      return simulateLatency(followUpInviteReseller(id));
    },
    update: async (
      id: string,
      updates: Partial<
        Pick<
          import("../../features/resellers/types/inviteReseller").InviteReseller,
          "name" | "mobile" | "email"
        >
      >,
    ) => {
      const { updateInviteReseller } =
        await import("../../features/resellers/data/inviteResellersData");
      return simulateLatency(updateInviteReseller(id, updates));
    },
    delete: async (id: string) => {
      const { deleteInviteReseller } =
        await import("../../features/resellers/data/inviteResellersData");
      deleteInviteReseller(id);
      return simulateLatency(true);
    },
  },
  transactions: {
    list: async (): Promise<Transaction[]> => {
      return simulateLatency([...db.transactions]);
    },
    getDetail: async (id: string): Promise<TransactionDetail | undefined> => {
      return simulateLatency(db.getTransactionDetail(id));
    },
    getLogs: async (txnId: string, ip: string): Promise<any[]> => {
      return simulateLatency(db.getTransactionLogs(txnId, ip));
    },
    getCardDetails: async (maskedCard: string): Promise<any> => {
      return simulateLatency(db.getCardDetails(maskedCard));
    },
  },
  work: {
    list: async (): Promise<WorkItem[]> => {
      return simulateLatency([...db.workItems]);
    },
  },
  disputes: {
    list: async (): Promise<Dispute[]> => {
      return simulateLatency([...db.disputes]);
    },
  },
  chargebacks: {
    list: async (): Promise<Chargeback[]> => {
      return simulateLatency([...db.chargebacks]);
    },
    get: async (id: string): Promise<Chargeback | undefined> => {
      return simulateLatency(db.chargebacks.find((c) => c.id === id));
    },
  },
  refunds: {
    list: async (): Promise<Refund[]> => {
      return simulateLatency([...db.refunds]);
    },
    get: async (id: string): Promise<Refund | undefined> => {
      return simulateLatency(db.refunds.find((r) => r.id === id));
    },
  },
  investigations: {
    list: async (): Promise<Investigation[]> => {
      return simulateLatency([...db.investigations]);
    },
    get: async (id: string): Promise<Investigation | undefined> => {
      return simulateLatency(db.investigations.find((i) => i.id === id));
    },
    update: async (
      id: string,
      updates: Partial<Investigation>,
    ): Promise<Investigation> => {
      // Mock update
      const idx = db.investigations.findIndex((i) => i.id === id);
      if (idx >= 0) {
        db.investigations[idx] = { ...db.investigations[idx], ...updates };
        return simulateLatency(db.investigations[idx]);
      }
      throw new Error("Not found");
    },
  },
  tickets: {
    list: async (): Promise<TransactionTicket[]> => {
      return simulateLatency([...db.transactionTickets]);
    },
  },
  support: {
    listMerchantTickets: async (): Promise<MerchantTicket[]> => {
      return simulateLatency([...db.merchantTickets]);
    },
  },
  settlements: {
    list: async (): Promise<Settlement[]> => {
      return simulateLatency([...db.settlements]);
    },
  },
  emiOperations: {
    list: async (): Promise<EMIOperation[]> => {
      return simulateLatency([...db.emiOperations]);
    },
  },
  stores: {
    getByMerchant: async (merchantId: string): Promise<MerchantStore[]> => {
      return simulateLatency(
        db.merchantStores.filter((s) => s.merchantId === merchantId),
      );
    },
  },
  localIssuerBanks: {
    list: async (): Promise<LocalIssuerBank[]> => {
      return simulateLatency([...db.localIssuerBanks]);
    },
    get: async (id: string): Promise<LocalIssuerBank | undefined> => {
      return simulateLatency(db.localIssuerBanks.find((b) => b.id === id));
    },
    create: async (
      data: Partial<LocalIssuerBank>,
    ): Promise<LocalIssuerBank> => {
      const newBank: LocalIssuerBank = {
        id: (db.localIssuerBanks.length + 1).toString(),
        bankRefId: "",
        bankName: "",
        swiftCode: "",
        npsbCode: "",
        emiRate: "",
        sslEmail: "",
        sslMobile: "",
        lastReportingDate: "-",
        reportSendOn: "sun,wed",
        lastEmailSent: "-",
        emailStatus: "No",
        ...data,
      } as LocalIssuerBank;
      db.localIssuerBanks.push(newBank);
      return simulateLatency(newBank);
    },
  },
  auth: {
    login: async (email: string, password: string, captchaPassed: boolean) => {
      await simulateLatency(null);

      const mockUser = Object.values(MOCK_AUTH_USERS).find(
        (user) =>
          user.profile.email.toLowerCase() === email.trim().toLowerCase(),
      );

      if (mockUser && password === mockUser.password && captchaPassed) {
        return {
          success: true,
          message: "Login successful",
          user: mockUser.profile,
        };
      }

      return {
        success: false,
        message: "Invalid login credentials",
      };
    },
    verifyOTP: async (otp: string, trustDevice: boolean) => {
      await simulateLatency(null);

      const pendingLoginId = sessionStorage.getItem(MOCK_PENDING_LOGIN_KEY);
      const mockUser = pendingLoginId ? MOCK_AUTH_USERS[pendingLoginId] : null;

      if (mockUser && otp === mockUser.otp) {
        if (trustDevice) {
          sessionStorage.setItem("trustDevice", "true");
        }
        sessionStorage.setItem("loginId", mockUser.profile.username);
        sessionStorage.setItem("authenticated", "true");
        sessionStorage.removeItem(MOCK_PENDING_LOGIN_KEY);

        return {
          success: true,
          message: "OTP verified successfully",
          user: mockUser.profile,
        };
      }

      return {
        success: false,
        message: "Invalid OTP. Please try again.",
      };
    },
    resendOTP: async () => {
      await simulateLatency(null);
      return { success: true, message: "OTP resent successfully" };
    },
    logout: async () => {
      // Clear all session data
      sessionStorage.clear();
      return { success: true };
    },
    checkAuth: () => {
      // Check if user is authenticated
      const loginId = sessionStorage.getItem("loginId");
      const authenticated = sessionStorage.getItem("authenticated");

      if (authenticated === "true" && loginId && MOCK_AUTH_USERS[loginId]) {
        const mockUser = MOCK_AUTH_USERS[loginId];
        return {
          isAuthenticated: true,
          user: {
            username: mockUser.profile.username,
            displayName: mockUser.profile.displayName,
            role: mockUser.profile.role,
            accountType: mockUser.profile.accountType,
            email: mockUser.profile.email,
          },
        };
      }

      return { isAuthenticated: false, user: null };
    },
  },
  home: {
    getStats: async (
      ownerId?: string,
      period?: string,
      customRange?: { from: string; to: string },
      sector?: string,
    ) => {
      let merchants = ownerId
        ? db.merchants.filter((m) => m.ownerName === "Sarah Ahmed")
        : db.merchants;

      if (sector && sector !== "All") {
        merchants = merchants.filter((m) => m.sector === sector);
      }

      // Calculate base 30d and 7d stats from database
      const base30dGMV = merchants.reduce((sum, m) => sum + m.gmv30d, 0);
      const base7dGMV = merchants.reduce((sum, m) => sum + m.gmv7d, 0);
      const base30dTX = merchants.reduce(
        (sum, m) => sum + (m.txCount30d || 0),
        0,
      );
      const base7dTX = merchants.reduce(
        (sum, m) => sum + (m.txCount7d || 0),
        0,
      );

      // Determine multiplier based on period
      let multiplier = 1;
      if (period === "7d") multiplier = base7dGMV / base30dGMV;
      else if (period === "today" || period === "last_day")
        multiplier = 1 / 30; // fixed ~1/30th
      else if (period === "this_week")
        multiplier = (new Date().getDay() + 1) / 30;
      else if (period === "this_month") multiplier = new Date().getDate() / 30;
      else if (period === "custom" && customRange) {
        const start = new Date(customRange.from);
        const end = new Date(customRange.to);
        const days =
          Math.ceil(Math.abs(end.getTime() - start.getTime()) / 86400000) + 1;
        multiplier = days / 30;
      }

      // Real periods use their specific data if available, otherwise scale 30d
      const gmv =
        period === "30d"
          ? base30dGMV
          : period === "7d"
            ? base7dGMV
            : Math.floor(base30dGMV * multiplier);
      const txCount =
        period === "30d"
          ? base30dTX
          : period === "7d"
            ? base7dTX
            : Math.floor(base30dTX * multiplier);

      const failedCount = Math.floor(txCount * 0.076); // Consistent 7.6% failure rate
      const successRate =
        txCount > 0 ? ((txCount - failedCount) / txCount) * 100 : 92.4;

      // Calculate filter ratio to scale absolute numbers based on filtered subset
      const totalMerchantsCount = db.merchants.length;
      const currentMerchantsCount = merchants.length;
      const filterRatio =
        totalMerchantsCount > 0
          ? currentMerchantsCount / totalMerchantsCount
          : 0;

      return simulateLatency({
        gmv,
        txCount,
        successRate,
        failedCount,
        sslIncome: Math.floor(gmv * 0.025), // Approx 2.5% of GMV
        emiIncome: Math.floor(gmv * 0.012), // Approx 1.2% of GMV
        chargebackAmount: Math.floor(gmv * 0.005), // Approx 0.5% of GMV
        escrowHoldAmount: Math.floor(gmv * 0.008), // Approx 0.8% of GMV
        failedMerchantCount: Math.max(
          1,
          Math.floor(
            merchants.length * 0.15 * (multiplier > 1 ? 1 : multiplier),
          ),
        ),
        disputesDue: Math.max(0, Math.floor(3 * multiplier * filterRatio)),
        settlementsPending: Math.max(
          0,
          Math.floor(12 * multiplier * filterRatio),
        ),
        settlementsBounceCount: Math.max(
          0,
          Math.floor(12 * multiplier * filterRatio),
        ),
        settlementsBounceAmount: Math.floor(150000 * multiplier * filterRatio), // Dynamic amount
        totalTickets: Math.max(0, Math.floor(386 * multiplier * filterRatio)),
        openTickets: Math.max(0, Math.floor(353 * multiplier * filterRatio)),
        // Merchant Overview Stats
        totalMerchants: merchants.length,
        newMerchants: Math.max(
          0,
          Math.floor(
            merchants.length * 0.03 * (multiplier > 1 ? 1 : multiplier),
          ),
        ),
        transActiveMerchants: Math.max(0, Math.floor(merchants.length * 0.89)),
        zeroTxnMerchants: Math.max(
          0,
          merchants.length - Math.floor(merchants.length * 0.89),
        ),
        activeMerchants: Math.max(0, Math.floor(merchants.length * 0.92)),
        inactiveMerchants: Math.max(
          0,
          merchants.length - Math.floor(merchants.length * 0.92),
        ),
        totalStores: merchants.length * 1.5,
      });
    },
    getFailedMerchants: async (ownerId?: string, period?: string) => {
      console.log("Fetching failed merchants for:", { ownerId, period });
      const list = [
        { name: "US Bangla", count: 12 },
        { name: "Grameenphone", count: 8 },
        { name: "Foodpanda", count: 5 },
        { name: "Daraz", count: 3 },
        { name: "Apex Systems", count: 0 },
      ];
      return simulateLatency(list);
    },
    getEscrowHoldMerchants: async (
      ownerId?: string,
      period?: string,
      customRange?: { from: string; to: string },
      sector?: string,
    ) => {
      console.log("Fetching escrow hold merchants for:", {
        ownerId,
        period,
        customRange,
        sector,
      });
      const allEntries = [
        {
          id: "EH-101",
          merchantName: "Daraz",
          merchantId: "daraz_mall",
          amount: 15000,
          date: "2026-02-01",
          sector: "Pureplay Ecommerce",
        },
        {
          id: "EH-102",
          merchantName: "Daraz",
          merchantId: "daraz_mall",
          amount: 30000,
          date: "2026-01-25",
          sector: "Pureplay Ecommerce",
        },
        {
          id: "EH-103",
          merchantName: "Foodpanda",
          merchantId: "fp_dhaka",
          amount: 32000,
          date: "2026-02-02",
          sector: "Pureplay Ecommerce",
        },
        {
          id: "EH-104",
          merchantName: "Tech Haven BD",
          merchantId: "tech_01",
          amount: 18500,
          date: "2026-01-29",
          sector: "Business Services",
        },
        {
          id: "EH-105",
          merchantName: "Gadget World",
          merchantId: "gworld_main",
          amount: 12400,
          date: "2026-01-20",
          sector: "Bricks & Mortar",
        },
        {
          id: "EH-106",
          merchantName: "US Bangla",
          merchantId: "usb_01",
          amount: 25000,
          date: "2026-02-01",
          sector: "Hospitality, Travel & Aviation",
        },
        {
          id: "EH-107",
          merchantName: "Daily Groceries",
          merchantId: "dg_01",
          amount: 8900,
          date: "2026-01-15",
          sector: "Pureplay Ecommerce",
        },
      ];

      let filtered = allEntries;
      if (sector && sector !== "All") {
        filtered = filtered.filter((e) => e.sector === sector);
      }
      // For mock purposes, just return filtered
      return simulateLatency(filtered);
    },
    getChargebackDetails: async (
      ownerId?: string,
      period?: string,
      customRange?: { from: string; to: string },
      sector?: string,
    ) => {
      console.log("Fetching chargeback details for:", {
        ownerId,
        period,
        customRange,
        sector,
      });
      const list = [
        {
          id: "CB-1001",
          merchantName: "Daraz",
          merchantId: "daraz_mall",
          date: "2026-01-28",
          amount: 1250,
          sector: "Pureplay Ecommerce",
        },
        {
          id: "CB-1002",
          merchantName: "Foodpanda",
          merchantId: "fp_dhaka",
          date: "2026-02-01",
          amount: 850,
          sector: "Pureplay Ecommerce",
        },
        {
          id: "CB-1003",
          merchantName: "Daraz",
          merchantId: "daraz_outlet",
          date: "2026-01-25",
          amount: 2100,
          sector: "Pureplay Ecommerce",
        },
        {
          id: "CB-1004",
          merchantName: "US Bangla",
          merchantId: "usb_01",
          date: "2026-01-30",
          amount: 3400,
          sector: "Hospitality, Travel & Aviation",
        },
        {
          id: "CB-1005",
          merchantName: "Foodpanda",
          merchantId: "fp_dhaka",
          date: "2026-01-22",
          amount: 1500,
          sector: "Pureplay Ecommerce",
        },
        {
          id: "CB-1006",
          merchantName: "Grameenphone",
          merchantId: "gp_pay",
          date: "2026-02-02",
          amount: 920,
          sector: "Telecommunication",
        },
        {
          id: "CB-1007",
          merchantName: "US Bangla",
          merchantId: "usb_01",
          date: "2026-01-15",
          amount: 1200,
          sector: "Hospitality, Travel & Aviation",
        },
        {
          id: "CB-1008",
          merchantName: "Daraz",
          merchantId: "daraz_mall",
          date: "2026-01-12",
          amount: 450,
          sector: "Pureplay Ecommerce",
        },
      ];

      let filtered = list;
      if (sector && sector !== "All") {
        filtered = filtered.filter((item) => item.sector === sector);
      }
      // In a real app, we would also filter by ownerId and date range.
      // For mock, sector filtering is enough to show it works.

      return simulateLatency(filtered);
    },
    getTopFailureReasonsDetailed: async (ownerId?: string, period?: string) => {
      console.log("Fetching detailed failure reasons for:", {
        ownerId,
        period,
      });
      const reasons = [
        { label: "Payment Failed", percentage: 22 },
        { label: "System Error", percentage: 15 },
        { label: "Cancelled", percentage: 12 },
        { label: "DECLINED - Approval Code is Missing", percentage: 10 },
        { label: "Payment Cancelled", percentage: 8 },
        { label: "Debit party identity tag prohibits execu", percentage: 7 },
        { label: "INITIATE", percentage: 6 },
        {
          label:
            "DECLINED - Error occured during operation. Please contact a branch for help.",
          percentage: 5,
        },
        { label: "DECLINED", percentage: 5 },
        { label: "Duplicate for All Transactions", percentage: 5 },
        { label: "Insufficient Balance", percentage: 5 },
      ];
      return simulateLatency(reasons);
    },
    getSectorVolumeDetails: async (
      ownerId?: string,
      period?: string,
      customRange?: { from: string; to: string },
    ) => {
      console.log("Fetching sector volume details for:", {
        ownerId,
        period,
        customRange,
      });
      const sectors = [
        { sector: "Pureplay Ecommerce", amount: 12500000, percentage: 35 },
        {
          sector: "Hospitality, Travel & Aviation",
          amount: 8400000,
          percentage: 22,
        },
        { sector: "Telecommunication", amount: 4500000, percentage: 12 },
        {
          sector: "Banking & Financial Institution",
          amount: 3800000,
          percentage: 10,
        },
        { sector: "Business Services", amount: 2400000, percentage: 6 },
        { sector: "Utility & Billing", amount: 1800000, percentage: 5 },
        { sector: "Healthcare", amount: 1200000, percentage: 3 },
        { sector: "Education", amount: 800000, percentage: 3 },
        { sector: "Bricks & Mortar", amount: 700000, percentage: 2 },
        { sector: "Government", amount: 500000, percentage: 2 },
      ];
      return simulateLatency(sectors);
    },
    getSectorCountDetails: async (
      ownerId?: string,
      period?: string,
      customRange?: { from: string; to: string },
    ) => {
      console.log("Fetching sector count details for:", {
        ownerId,
        period,
        customRange,
      });
      const sectors = [
        { sector: "Pureplay Ecommerce", count: 45000, percentage: 40 },
        {
          sector: "Hospitality, Travel & Aviation",
          count: 25000,
          percentage: 22,
        },
        { sector: "Telecommunication", count: 18000, percentage: 16 },
        { sector: "Utility & Billing", count: 12000, percentage: 10 },
        {
          sector: "Banking & Financial Institution",
          count: 5000,
          percentage: 4,
        },
        { sector: "Business Services", count: 3500, percentage: 3 },
        { sector: "Education", count: 2000, percentage: 2 },
        { sector: "Healthcare", count: 1500, percentage: 1 },
        { sector: "Bricks & Mortar", count: 1000, percentage: 1 },
        { sector: "Government", count: 800, percentage: 1 },
      ];
      return simulateLatency(sectors);
    },
    getActions: async (ownerId?: string) => {
      const actions: any[] = [];
      const kamName = ownerId === "user_1" ? "Sarah Ahmed" : undefined;

      // 1. Bounced Settlements
      const bouncedSettlements = db.settlements.filter((s) => {
        if (s.settlementStatus !== "Bounced") return false;
        if (!kamName) return true;
        const merchant = db.merchants.find(
          (m) => m.id === s.merchantId || m.name === s.merchantName,
        );
        return merchant?.ownerName === kamName;
      });
      if (bouncedSettlements.length > 0) {
        actions.push({
          id: "settlement-bounced",
          title: "Bounced Settlements",
          count: bouncedSettlements.length,
          due: "Overdue",
          type: "urgent",
        });
      }

      // 2. Pending Refunds
      const pendingRefunds = db.refunds.filter((r) => {
        if (r.approvalStatus !== "Pending") return false;
        if (!kamName) return true;
        const merchant = db.merchants.find((m) => m.id === r.merchantId);
        return merchant?.ownerName === kamName;
      });
      if (pendingRefunds.length > 0) {
        actions.push({
          id: "refunds-pending",
          title: "Refund Approvals Pending",
          count: pendingRefunds.length,
          due: "2d",
          type: "warning",
        });
      }

      // 5. Pending EMI Operations
      const pendingEMI = db.emiOperations.filter((e) => {
        if (e.status !== "Pending" || e.bankStatus !== "Not Sent to Bank")
          return false;
        if (!kamName) return true;
        const merchant = db.merchants.find(
          (m) => m.id === (e as any).merchantId || m.name === e.merchantName,
        );
        return merchant?.ownerName === kamName;
      });
      if (pendingEMI.length > 0) {
        actions.push({
          id: "emi-pending",
          title: "EMI Operations Pending",
          count: pendingEMI.length,
          due: "3d",
          type: "info",
        });
      }

      return simulateLatency(actions);
    },
    getTopMerchants: async (
      metric: "gmv" | "txCount" | "revenue",
      period: string = "7d",
      ownerId?: string,
      customRange?: { from: string; to: string },
      sector?: string,
      limit: number = 5,
    ): Promise<Merchant[]> => {
      let merchantsList = ownerId
        ? db.merchants.filter((m) => m.ownerName === "Sarah Ahmed")
        : db.merchants;

      if (sector && sector !== "All") {
        merchantsList = merchantsList.filter((m) => m.sector === sector);
      }

      // Calculate multiplier (same logic as getStats)
      const base30dGMV = merchantsList.reduce((sum, m) => sum + m.gmv30d, 0);
      const base7dGMV = merchantsList.reduce((sum, m) => sum + m.gmv7d, 0);

      let multiplier = 1;
      if (period === "7d") multiplier = base7dGMV / base30dGMV;
      else if (period === "today" || period === "last_day")
        multiplier = (1 / 30) * 0.9;
      else if (period === "this_week")
        multiplier = (new Date().getDay() + 1) / 30;
      else if (period === "this_month") multiplier = new Date().getDate() / 30;
      else if (period === "custom" && customRange) {
        const start = new Date(customRange.from);
        const end = new Date(customRange.to);
        const days = Math.min(
          Math.ceil(Math.abs(end.getTime() - start.getTime()) / 86400000) + 1,
          30,
        );
        multiplier = days / 30;
      }

      const sorted = [...merchantsList].sort((a, b) => {
        const targetPeriod =
          period === "30d" ? "30d" : period === "7d" ? "7d" : "30d";
        const valA =
          targetPeriod === "30d"
            ? metric === "gmv"
              ? a.gmv30d
              : metric === "txCount"
                ? a.txCount30d || 0
                : a.revenue30d || 0
            : metric === "gmv"
              ? a.gmv7d
              : metric === "txCount"
                ? a.txCount7d || 0
                : a.revenue7d || 0;
        const valB =
          targetPeriod === "30d"
            ? metric === "gmv"
              ? b.gmv30d
              : metric === "txCount"
                ? b.txCount30d || 0
                : b.revenue30d || 0
            : metric === "gmv"
              ? b.gmv7d
              : metric === "txCount"
                ? b.txCount7d || 0
                : b.revenue7d || 0;
        return valB - valA;
      });

      // If it's a dynamic period (not 7d/30d), override the fields so HomePage.tsx display logic picks them up
      const results = sorted.slice(0, limit).map((m) => {
        if (period !== "30d" && period !== "7d") {
          return {
            ...m,
            gmv7d: Math.floor(m.gmv30d * multiplier),
            txCount7d: Math.floor((m.txCount30d || 0) * multiplier),
            revenue7d: Math.floor((m.revenue30d || 0) * multiplier),
          };
        }
        return m;
      });

      return simulateLatency(results);
    },
    getChannelSummary: async (
      ownerId?: string,
      period: string = "7d",
      customRange?: { from: string; to: string },
      sector?: string,
      metric: "amount" | "count" = "amount",
    ): Promise<ChannelSummary[]> => {
      let merchants = ownerId
        ? db.merchants.filter((m) => m.ownerName === "Sarah Ahmed")
        : db.merchants;

      if (sector && sector !== "All") {
        merchants = merchants.filter((m) => m.sector === sector);
      }

      // Calculate base 30d/7d stats from database
      const base30d = merchants.reduce(
        (sum, m) => sum + (metric === "amount" ? m.gmv30d : m.txCount30d),
        0,
      );
      const base7d = merchants.reduce(
        (sum, m) => sum + (metric === "amount" ? m.gmv7d : m.txCount7d),
        0,
      );

      // Determine multiplier based on period (matching getStats)
      let multiplier = 1;
      if (period === "7d") multiplier = base7d / base30d;
      else if (period === "today" || period === "last_day")
        multiplier = (1 / 30) * 0.9;
      else if (period === "this_week")
        multiplier = (new Date().getDay() + 1) / 30;
      else if (period === "this_month") multiplier = new Date().getDate() / 30;
      else if (period === "custom" && customRange) {
        const start = new Date(customRange.from);
        const end = new Date(customRange.to);
        const days = Math.min(
          Math.ceil(Math.abs(end.getTime() - start.getTime()) / 86400000) + 1,
          30,
        );
        multiplier = days / 30;
      }

      const baseTotal =
        period === "30d"
          ? base30d
          : period === "7d"
            ? base7d
            : Math.floor(base30d * multiplier);

      if (!baseTotal || baseTotal === 0) {
        return simulateLatency([]);
      }

      const channelNames = [
        "Visa",
        "Mastercard",
        "Amex",
        "Diners Club",
        "bKash",
        "Rocket",
        "Nagad",
        "Upay",
        "Cashbaba",
        "Pocket",
        "Pathao Pay",
        "Tap",
        "OK Wallet",
        "Meghna Pay",
        "EBL Skybanking",
        "Citytouch",
        "Islamibank",
        "Bank Asia",
        "DBBL",
        "Standard Chartered",
        "MTB",
        "BRAC Bank",
        "Prime Bank",
        "U-pay",
        "Mcash",
        "T-cash",
        "Q-Cash",
        "FastCash",
        "Nexus",
        "UnionPay",
        "JCB",
        "Discover",
      ];

      const channels: ChannelSummary[] = channelNames
        .map((name, i) => {
          let value;
          if (name === "Visa") {
            value = baseTotal * 0.45;
          } else if (name === "bKash") {
            value = baseTotal * 0.3;
          } else {
            const remainingShare = 0.25;
            const othersCount = channelNames.length - 2;
            // Use deterministic weight instead of random
            const weight = Math.abs(Math.sin((i + 1) * 999)) * 2.5;
            value = ((baseTotal * remainingShare) / othersCount) * weight;
          }

          // Integer for count, float for amount
          const finalValue = metric === "count" ? Math.round(value) : value;

          return {
            id: `ch-${i}`,
            name,
            amount: finalValue, // Reuse 'amount' field for both value and count
            percentage: parseFloat(((finalValue / baseTotal) * 100).toFixed(1)),
          };
        })
        .sort((a, b) => b.amount - a.amount);

      return simulateLatency(channels);
    },
  },
  recurringInfo: {
    list: async (month: string) => {
      const isTargetMonth = month === "2025-12";
      const yearMonth = month || "2025-12";

      const mockData = Array.from({ length: 35 }, (_, i) => {
        const day = Math.floor(i / 6) + 1;
        const paddedDay = String(day).padStart(2, "0");
        const timeStr = `${yearMonth}-${paddedDay} 03:02:${String(10 + (i % 50)).padStart(2, "0")}`;

        return {
          id: `REC00${i + 1}`,
          merchant: "Sandbox Live Test",
          store: "demotest",
          transactionId: `REC-62FCDB46024F-13${685 + i}`,
          amount: 20.0,
          bankSslId: `EC${Math.floor(1000 + Math.random() * 9000)}202512010600${(i % 9) + 1}`,
          cardType: "",
          creditCard: "512345XXXXXX0008",
          referenceId: "831000",
          time: timeStr,
        };
      });

      return simulateLatency(mockData);
    },
  },
  bankValidation: {
    validate: async (bankSslId: string) => {
      const txn = db.transactions.find(
        (t) =>
          t.bankTxnId === bankSslId ||
          t.bankTxnId?.toLowerCase() === bankSslId.toLowerCase(),
      );

      if (!txn) return simulateLatency(null);

      // Format data exactly as per user screenshot
      return simulateLatency({
        raw:
          txn.status === "failed"
            ? "Not a valid transactions ."
            : "Transaction Successful.",
        params: {
          approval_code: txn.bankApprovalCode || "",
          responseCode: txn.status === "success" ? "00" : "01",
          eciRaw: "",
          xid: "",
          cavv: "",
          authorizedAmount: txn.amount,
          currency: txn.currency,
          commerceIndicator: "",
          cardType: txn.cardType || "",
          cardNo:
            txn.cardBin && txn.cardLast4
              ? `${txn.cardBin}XXXXXX${txn.cardLast4}`
              : "",
          order_id: txn.id,
          reason_code: "",
          reply_flag: "",
          reply_code: "",
          reply_msg: "",
          cardNo_2:
            txn.cardBin && txn.cardLast4
              ? `${txn.cardBin}XXXXXX${txn.cardLast4}`
              : "", // Repeated in screenshot
        },
      });
    },
  },
};
