import type {
  TransactionDetail,
  TransactionDetailApiItem,
} from "../types/transaction";

const toNumber = (value: number | string | null | undefined): number => {
  if (value === null || value === undefined || value === "") return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const extractCardMeta = (issuerBank: string | null) => {
  if (!issuerBank) {
    return { cardBank: "", cardCountryCode: "", cardCountry: "" };
  }
  const parts = issuerBank.split("|");
  return {
    cardBank: parts[3] || "",
    cardCountryCode: parts[4] || "",
    cardCountry: parts[5] || "",
  };
};

const extractGatewayBankName = (cardType: string | null): string => {
  if (!cardType) return "N/A";
  const [, ...rest] = cardType.split("-");
  const bankName = rest.join("-").trim();
  return bankName || cardType.trim() || "N/A";
};

const normalizeTransactionStatus = (status: string): string => {
  const lowered = status.toLowerCase();
  return lowered;
};

const mapSettlementStatusLabel = (
  status: string | null | undefined,
): string => {
  const normalized = status?.trim().toUpperCase();

  if (!normalized) return "N/A";
  if (normalized === "SERVICE_CONF_HOLD") return "SERVICE CONF HOLD";
  if (normalized === "ESCROW_HOLD") return "ESCROW HOLD";
  if (normalized === "SETTLE_HOLD_EMI") return "Hold for EMI";
  if (normalized === "SETTLE_INITIAL") return "Settlement will be initiated";

  return normalized;
};

export const mapApiTransactionDetailToModel = (
  item: TransactionDetailApiItem,
): TransactionDetail => {
  const amount = toNumber(item.currency_amount ?? item.mamount);
  const sslAmount =
    toNumber(item.sslportion) - toNumber(item.reseller_commission);
  const storeAmount = toNumber(item.storeportion);
  const merchantAmount = toNumber(item.currency_amount ?? 0);
  const maskedCard = item.scredit_card_num || "N/A";
  const { cardBank, cardCountry } = extractCardMeta(item.issuerbank);

  return {
    tid: item.tid || 0,
    date: item.incommingtime || "",
    transactionId: item.transaction_id,
    status: normalizeTransactionStatus(item.notice_label || ""),
    amount,
    currency: item.currency_type || item.t_currency || "BDT",
    paymentMedia: item.payment_medium || "N/A",
    bankGateway: extractGatewayBankName(item.cardtype),
    cardType: item.card_type || "N/A",
    schemeSelected: item.issuer_card_brand || "N/A",
    sslId: item.sslid || "N/A",
    sessionId: item.session_id ? String(item.session_id) : "N/A",
    bankId: item.banksslid || "N/A",
    bankApprovalId: item.brac_ref_id || "N/A",
    bankReceiptNo: item.bk_receipt_no || "N/A",
    referenceNo: item.rsid || "N/A",
    cid: item.cust_id !== null ? String(item.cust_id) : undefined,
    userId: undefined,
    customer: {
      name: item.cus_name || "N/A",
      phone: item.cus_phone || "N/A",
      email: item.cus_email || "N/A",
      cardHolder: item.cardholdername || "N/A",
      maskedCard,
      issuedBank: `${cardBank} ${cardCountry}` || "N/A",
      ip: item.visitor_ip || "N/A",
      walletNo: item.cus_wallet_no || item.value_d || undefined,
    },
    amounts: {
      transaction: amount,
      ssl: sslAmount,
      bank: toNumber(item.bankportion),
      store: storeAmount,
      reseller: toNumber(item.reseller_commission),
      merchant: merchantAmount,
      susamount: toNumber(item.susamount),
      merchantCurrency: item.currency_type || item.t_currency || "BDT",
      merchantCurrencyRate: toNumber(item.currency_rate ?? 1),
      discountPct: toNumber(item.display_discount_perctentage),
      discountAmt: toNumber(item.td_discount_perctentage),
      discountRemarks: item.td_discount_percentage_remarks || undefined,
    },
    flow: {
      errorDescription: item.error_reason || undefined,
      apiValidated: item.validated === 1,
      gatewayVersion: String(item.gw_version || ""),
      validationStatus: item.status || "",
      isRisk: item.is_risk === 1,
      riskyReason: item.risk_desc || undefined,
      directedToBank: item.bankgoingtime || undefined,
      returnedFromBank: item.bankretime || undefined,
      bankApprovalId: item.brac_ref_id || "N/A",
      bankReceiptNo: item.bk_receipt_no || "N/A",
    },
    risk: {
      validationStatus: item.status || "",
      apiValidated: item.validated === 1,
      isRisk: item.is_risk === 1,
      reason: item.risk_desc || undefined,
      directedToBank: item.bankgoingtime || undefined,
      returnedFromBank: item.bankretime || undefined,
    },
    agent: {
      platform: (item as any).ua_platform || "N/A",
      os: (item as any).ua_platform || "N/A",
      device: (item as any).ua_device || "N/A",
      version: (item as any).ua_version || "N/A",
      name: (item as any).ua_name || "N/A",
      fullString: (item as any).ua_agent || "N/A",
    },
    cart: ((item as any).cart_items || []).map((cartItem: any) => ({
      name: cartItem.product_name || "—",
      quantity: toNumber(cartItem.quantity),
      unitPrice: toNumber(cartItem.unit_price || cartItem.product_price),
      totalPrice: toNumber(cartItem.product_price),
    })),
    lifecycle: {
      settled: item.settlestatus?.toUpperCase().includes("SETTLE") || false,
      refundRequested: (item.refundstatus || "NO") !== "NO",
      chargebackRequested: (item.chargebackstatus || "NO") !== "NO",
      availOffer: false,
      settlementStatus: mapSettlementStatusLabel(item.settlestatus),
    },
    moto: {
      status: "N/A",
      mobile: item.cus_phone || "N/A",
      maskedCard,
      request: "N/A",
      store: item.store_name || "N/A",
      desc: item.notice || "",
      trxStatus: item.status || "N/A",
    },
    requestParams: {
      ...(item.requested_parameter || {}),
      value_a: item.value_a,
      value_b: item.value_b,
      value_c: item.value_c,
      value_d: item.value_d,
    },
    bankResponse: {
      raw: item.notice || "",
      params: {
        bank_status: item.bank_status,
        error_reason: item.error_reason,
        notice: item.notice,
      },
    },
    merchantRequestInfo: {
      ip: item.merchant_system_ip || "",
      metadata: {
        success_url: item.surl,
        failed_url: item.furl,
        cancel_url: item.curl,
      },
    },
    emi: {
      statusText: item.emi_status_message || "N/A",
    },
  };
};
