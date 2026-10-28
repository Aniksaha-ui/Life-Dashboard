import type {
  BinInfo,
  CardDetails,
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
} from "./types";

// Mock DB
export class MockDatabase {
  private data = {
    merchants: [] as Merchant[],
    transactions: [] as Transaction[],
    workItems: [] as WorkItem[],
    disputes: [] as Dispute[],
    investigations: [] as Investigation[],
    chargebacks: [] as Chargeback[],
    refunds: [] as Refund[],
    transactionTickets: [] as TransactionTicket[],
    settlements: [] as Settlement[],
    emiOperations: [] as EMIOperation[],
    merchantTickets: [] as MerchantTicket[],
    transactionLogs: [] as any[],
    merchantUsers: [] as MerchantUser[],
    resellers: [] as Reseller[],
    merchantStores: [] as MerchantStore[],
    localIssuerBanks: [] as LocalIssuerBank[],
  };

  constructor() {
    this.seed();
    this.seedKamResellerMerchants();
    this.seedInvestigations();
    this.seedChargebacks();
    this.seedRefunds();
    this.seedCardHistory();
    this.seedTransactionTickets();
    this.seedSettlements();
    this.seedEMIOperations();
    this.seedMerchantTickets();
    this.seedTransactionLogs();
    this.seedMerchantUsers();
    this.seedResellers();
    this.seedMerchantStores();
    this.seedLocalIssuerBanks();
  }

  private seedCardHistory() {
    const bin = "512345";
    const last4 = "0008";

    const history: Transaction[] = Array.from({ length: 15 }).map((_, i) => {
      const date = new Date(Date.now() - i * 86400000 * 2).toISOString();
      return {
        tid: 1000 + i,
        id: `ctxn_${i}`,
        merchantId: ((i % 3) + 1).toString(),
        storeId: `store_${i % 3}`,
        storeName: ["US Bangla", "Grameenphone", "Banglalink"][i % 3],
        amount: 1000 + i * 250,
        currency: "BDT",
        status: i % 5 === 0 ? "failed" : "success",
        date,
        method: "MASTER",
        channel: "web",
        isInternational: false,
        cardLast4: last4,
        cardBin: bin,
        customerName: "Abrar Fawaz",
        customerEmail: "abrar@example.com",
        customerMobile: "01712345678",
        bankTxnId: i === 0 ? "EC52982026043000011" : `BTXN-HISTORY-${i}`,
        bankName: "City Bank",
        cardBrand: "MASTER",
        integrationType: "Hosted Checkout",
        cardholderName: "Abrar Fawaz",
        cardBank: "Standard Chartered",
        cardCountry: "Bangladesh",
        cardType: "Credit",
        ipAddress: `103.11.${i}.5`,
      };
    });

    this.data.transactions = [...this.data.transactions, ...history];
  }

  async getTransactionLogs(txnId: string, ip: string): Promise<any[]> {
    // Return logs filtered by transaction ID AND related IP
    return this.data.transactionLogs
      .filter((l) => l.transactionId === txnId && l.ip === ip)
      .sort(
        (a, b) => new Date(a.logsOn).getTime() - new Date(b.logsOn).getTime(),
      );
  }

  async getTransactionDetail(id: string): Promise<any | undefined> {
    const txn = this.data.transactions.find((t) => t.id === id);
    if (!txn) return undefined;

    // Enrich basic transaction into detailed view
    return {
      tid: Number(txn.id.split("_")[1]) || 0,
      date: txn.date,
      transactionId: txn.id,
      status: txn.status.charAt(0).toUpperCase() + txn.status.slice(1),
      amount: txn.amount,
      currency: txn.currency,
      paymentMedia: txn.method,
      bankGateway: txn.bankName || "N/A",
      cardType: txn.cardType || "N/A",
      schemeSelected: txn.cardBrand || "N/A",
      sslId: "SSL-" + txn.id.split("_")[1],
      sessionId:
        "SESS-" + Math.random().toString(36).substring(7).toUpperCase(),
      bankId: txn.bankTxnId || "BANK-" + txn.id.split("_")[1],
      bankApprovalId: txn.bankApprovalCode || "N/A",
      bankReceiptNo: "REC-" + txn.id.split("_")[1],
      referenceNo: "REF-" + txn.id.split("_")[1],

      customer: {
        name: txn.customerName || "N/A",
        phone: txn.customerMobile || "N/A",
        email: txn.customerEmail || "N/A",
        cardHolder: txn.cardholderName || "N/A",
        bin: txn.cardBin || "XXXXXX",
        maskedCard:
          txn.cardBin && txn.cardLast4
            ? `${txn.cardBin}XXXXXX${txn.cardLast4}`
            : "N/A",
        issuedBank: txn.cardBank || "N/A",
        ip: txn.ipAddress || "N/A",
        walletNo: txn.method === "bkash" ? txn.customerMobile : undefined,
      },

      amounts: {
        transaction: txn.amount,
        ssl: txn.amount * 0.97,
        bank: txn.amount * 0.98,
        store: txn.amount * 0.95,
        reseller: 0,
        merchant: txn.amount * 0.95,
        susamount: 0,
        merchantCurrency: txn.currency,
        merchantCurrencyRate: 1.0,
        discountPct: 0,
        discountAmt: 0,
        discountRemarks: "N/A",
      },

      risk: {
        validationStatus: "Passed",
        apiValidated: true,
        isRisk: false,
        reason: "Safe",
        directedToBank: new Date(
          new Date(txn.date).getTime() + 1000,
        ).toISOString(),
        returnedFromBank: new Date(
          new Date(txn.date).getTime() + 5000,
        ).toISOString(),
      },

      flow: {
        errorDescription: txn.status === "failed" ? txn.failureReason : "N/A",
        apiValidated: true,
        gatewayVersion: "v3.0",
        validationStatus: "Validated",
        isRisk: false,
        riskyReason: "N/A",
        directedToBank: new Date(
          new Date(txn.date).getTime() + 1000,
        ).toISOString(),
        returnedFromBank: new Date(
          new Date(txn.date).getTime() + 5000,
        ).toISOString(),
        bankApprovalId: txn.bankApprovalCode || "N/A",
        bankReceiptNo: "REC-" + txn.id.split("_")[1],
      },

      lifecycle: {
        settled: txn.status === "success",
        refundRequested: false,
        chargebackRequested: false,
        availOffer: false,
        settlementStatus: txn.status === "success" ? "Paid" : "N/A",
      },

      agent: {
        platform: "Web",
        os: "Windows 10",
        device: "Desktop",
        version: "10.0.1",
        name: "Chrome",
        fullString:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },

      cart: [
        {
          name: "Premium T-Shirt",
          quantity: 2,
          unitPrice: 250,
          totalPrice: 500,
        },
        { name: "Shipping", quantity: 1, unitPrice: 60, totalPrice: 60 },
      ],

      moto: {
        status: "N/A",
        mobile: "N/A",
        maskedCard: "N/A",
        request: "N/A",
        store: txn.storeName || "N/A",
        desc: "N/A",
        trxStatus: "N/A",
      },

      requestParams: {
        user_refer: "https://google.com",
        channel_type: "Web",
        channel: txn.channel,
        ipn_url: "https://merchant.com/ipn",
        shipping_method: "Courier",
        num_of_item: 1,
        product_name: "Test Product",
        product_category: "Electronics",
        product_profile: "General",
        product_type: "Physical",
        vat: 0,
        discount_amount: 0,
        convenience_fee: 0,
        is_bangla_qr_enabled: "No",
        sslcz_channel: txn.method,
      },

      bankResponse: {
        raw:
          txn.status === "failed"
            ? "Not a valid transactions ."
            : "Transaction Successful.",
        params: {
          approval_code: txn.bankApprovalCode || "",
          responseCode: txn.status === "success" ? "00" : "05",
          eciRaw: "05",
          xid: Math.random().toString(36).substring(7).toUpperCase(),
          cavv: Math.random().toString(36).substring(7).toUpperCase(),
          authorizedAmount: txn.amount,
          currency: txn.currency,
          commerceIndicator: "05",
          cardType: txn.cardType || "",
          cardNo:
            txn.cardBin && txn.cardLast4
              ? `${txn.cardBin}XXXXXX${txn.cardLast4}`
              : "",
          order_id: txn.id,
          reason_code: txn.status === "success" ? "00" : "01",
          reply_flag: txn.status === "success" ? "1" : "0",
          reply_code: txn.status === "success" ? "00" : "05",
          reply_msg:
            txn.status === "success"
              ? "Successful"
              : txn.failureReason || "Failed",
        },
      },

      merchantRequestInfo: {
        ip: txn.ipAddress || "N/A",
      },

      emi: {
        statusText: "EMI Facility is not available for this transaction.",
      },
    };
  }

  getCardDetails(maskedCard: string): CardDetails {
    const [bin, last4] = maskedCard.split("XXXXXX");

    // Mock BIN Information
    const binInfo: BinInfo = {
      bin: bin,
      brand: bin.startsWith("4")
        ? "VISA"
        : bin.startsWith("5")
          ? "MASTER"
          : "AMEX",
      country: "Bangladesh",
      bank: "City Bank",
      cardType: "Credit",
      cardCategory: "Classic",
      status: "Ok",
    };

    // Filter transactions for this card
    const cardTransactions = this.data.transactions
      .filter(
        (t) =>
          (t.cardBin === bin && t.cardLast4 === last4) ||
          // Fallback for transactions that only have last4 in mock data
          (!t.cardBin && t.cardLast4 === last4),
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      binInfo,
      transactions: cardTransactions,
    };
  }

  get merchants() {
    return this.data.merchants;
  }
  get transactions() {
    return this.data.transactions;
  }
  get workItems() {
    return this.data.workItems;
  }
  get disputes() {
    return this.data.disputes;
  }
  get investigations() {
    return this.data.investigations;
  }
  get chargebacks() {
    return this.data.chargebacks;
  }
  get refunds() {
    return this.data.refunds;
  }
  get transactionTickets() {
    return this.data.transactionTickets;
  }
  get settlements() {
    return this.data.settlements;
  }
  get emiOperations() {
    return this.data.emiOperations;
  }
  get merchantTickets() {
    return this.data.merchantTickets;
  }
  get transactionLogs() {
    return this.data.transactionLogs;
  }
  get merchantUsers() {
    return this.data.merchantUsers;
  }
  get resellers() {
    return this.data.resellers;
  }
  get merchantStores() {
    return this.data.merchantStores;
  }
  get localIssuerBanks() {
    return this.data.localIssuerBanks;
  }

  private seedLocalIssuerBanks() {
    this.data.localIssuerBanks = [
      {
        id: "1",
        bankRefId: "1",
        bankName: "AB BANK LIMITED",
        swiftCode: "ABBLBDDH",
        npsbCode: "0020",
        emiRate:
          '{"3":"0.020","6":"0.035","9":"0.050","12":"0.070","18":"0.090","24":"0.100","30":"0.130","36":"0.1450"}',
        sslEmail: "support@abbank.com.bd",
        sslMobile: "01711223344",
        lastReportingDate: "2023-04-27",
        reportSendOn: "sun,wed",
        lastEmailSent: "2023-04-12",
        emailStatus: "Yes",
      },
      {
        id: "2",
        bankRefId: "2",
        bankName: "AGRANI BANK LIMITED",
        swiftCode: "AGBKBDDH",
        npsbCode: "0010",
        emiRate: "",
        sslEmail: "card@agranibank.org",
        sslMobile: "01811223344",
        lastReportingDate: "-",
        reportSendOn: "sun,wed",
        lastEmailSent: "-",
        emailStatus: "No",
      },
      {
        id: "3",
        bankRefId: "3",
        bankName: "AL-ARAFAH ISLAMI BANK LIMITID",
        swiftCode: "ALARBDDH",
        npsbCode: "0015",
        emiRate: "",
        sslEmail: "cards@al-arafahbank.com",
        sslMobile: "01911223344",
        lastReportingDate: "2023-04-11",
        reportSendOn: "sun,wed",
        lastEmailSent: "2023-04-12",
        emailStatus: "Yes",
      },
      {
        id: "4",
        bankRefId: "4",
        bankName: "BANGLADESH COMMERCE BANK LTD",
        swiftCode: "BCBLBDDH",
        npsbCode: "0030",
        emiRate: "",
        sslEmail: "info@bcblbd.com",
        sslMobile: "01711223355",
        lastReportingDate: "-",
        reportSendOn: "sun,wed",
        lastEmailSent: "-",
        emailStatus: "No",
      },
      {
        id: "5",
        bankRefId: "5",
        bankName: "BANGLADESH KRISHI BANK",
        swiftCode: "BKBABDDH",
        npsbCode: "0035",
        emiRate: "",
        sslEmail: "support@bkb.org.bd",
        sslMobile: "01511223344",
        lastReportingDate: "-",
        reportSendOn: "sun,wed",
        lastEmailSent: "-",
        emailStatus: "No",
      },
      {
        id: "6",
        bankRefId: "6",
        bankName: "BANK ASIA LIMITED",
        swiftCode: "BALBBDDH",
        npsbCode: "0070",
        emiRate: '{"3":"0.025","6":"0.040","9":"0.060","12":"0.080"}',
        sslEmail: "cardsupport@bankasia-bd.com",
        sslMobile: "01711223366",
        lastReportingDate: "2023-04-11",
        reportSendOn: "sun,wed",
        lastEmailSent: "2023-04-12",
        emailStatus: "Yes",
      },
      {
        id: "7",
        bankRefId: "7",
        bankName: "BASIC BANK LIMITED",
        swiftCode: "BKSIBDDH",
        npsbCode: "0055",
        emiRate: "",
        sslEmail: "it@basicbanklimited.com",
        sslMobile: "01911223377",
        lastReportingDate: "-",
        reportSendOn: "sun,wed",
        lastEmailSent: "-",
        emailStatus: "No",
      },
      {
        id: "8",
        bankRefId: "8",
        bankName: "BRAC BANK LIMITED",
        swiftCode: "BRAKBDDH",
        npsbCode: "0060",
        emiRate:
          '{"3":"0.020","6":"0.040","9":"0.050","12":"0.070","18":"0.100","24":"0.130"}',
        sslEmail: "support@bracbank.com",
        sslMobile: "01911223344",
        lastReportingDate: "-",
        reportSendOn: "sun,wed",
        lastEmailSent: "-",
        emailStatus: "No",
      },
      {
        id: "9",
        bankRefId: "9",
        bankName: "City Bank Ltd",
        swiftCode: "CIBLBDDH",
        npsbCode: "0225",
        emiRate:
          '{"3":"0.025","6":"0.040","9":"0.050","12":"0.060","18":"0.090","24":"0.120","30":"0.140","36":"0.150"}',
        sslEmail: "support@thecitybank.com",
        sslMobile: "01733445566",
        lastReportingDate: "-",
        reportSendOn: "sun,wed",
        lastEmailSent: "-",
        emailStatus: "No",
      },
      {
        id: "10",
        bankRefId: "10",
        bankName: "DHAKA BANK LIMITED",
        swiftCode: "DHBLBDDH",
        npsbCode: "0085",
        emiRate: '{"3":"0.020","6":"0.035","9":"0.050","12":"0.070"}',
        sslEmail: "support@dhakabank.com",
        sslMobile: "01611223344",
        lastReportingDate: "-",
        reportSendOn: "sun,wed",
        lastEmailSent: "-",
        emailStatus: "No",
      },
      {
        id: "11",
        bankRefId: "11",
        bankName: "DUTCH BANGLA BANK",
        swiftCode: "DBBLBDDH",
        npsbCode: "0090",
        emiRate:
          '{"3":"0.025","6":"0.040","9":"0.060","12":"0.080","18":"0.100","24":"0.120","36":"0.150"}',
        sslEmail: "support@dutchbanglabank.com",
        sslMobile: "01711223377",
        lastReportingDate: "-",
        reportSendOn: "sun,wed",
        lastEmailSent: "-",
        emailStatus: "No",
      },
      {
        id: "12",
        bankRefId: "12",
        bankName: "EASTERN BANK",
        swiftCode: "EBLBDDH",
        npsbCode: "0095",
        emiRate:
          '{"3":"0.025","6":"0.040","9":"0.060","12":"0.080","18":"0.105","24":"0.140","36":"0.190"}',
        sslEmail: "eblsupport@ebl-bd.com",
        sslMobile: "01911223388",
        lastReportingDate: "-",
        reportSendOn: "sun,wed",
        lastEmailSent: "-",
        emailStatus: "No",
      },
      {
        id: "13",
        bankRefId: "13",
        bankName: "EXIM BANK",
        swiftCode: "EXBKBDDH",
        npsbCode: "0100",
        emiRate: '{"3":"0.020","6":"0.040","9":"0.060","12":"0.080"}',
        sslEmail: "cards@eximbankbd.com",
        sslMobile: "01711223399",
        lastReportingDate: "-",
        reportSendOn: "sun,wed",
        lastEmailSent: "-",
        emailStatus: "No",
      },
      {
        id: "14",
        bankRefId: "14",
        bankName: "FIRST SECURITY ISLAMI BANK",
        swiftCode: "FSEBBDDH",
        npsbCode: "0105",
        emiRate: "",
        sslEmail: "support@fsiblbd.com",
        sslMobile: "01811223355",
        lastReportingDate: "-",
        reportSendOn: "sun,wed",
        lastEmailSent: "-",
        emailStatus: "No",
      },
      {
        id: "15",
        bankRefId: "15",
        bankName: "HSBC",
        swiftCode: "HSBCBDDH",
        npsbCode: "0115",
        emiRate: "",
        sslEmail: "hsbc.support@hsbc.com.bd",
        sslMobile: "01611223355",
        lastReportingDate: "-",
        reportSendOn: "sun,wed",
        lastEmailSent: "-",
        emailStatus: "No",
      },
      {
        id: "16",
        bankRefId: "16",
        bankName: "IFIC BANK",
        swiftCode: "IFICBDDH",
        npsbCode: "0120",
        emiRate: "",
        sslEmail: "it.support@ificbankbd.com",
        sslMobile: "01711223300",
        lastReportingDate: "-",
        reportSendOn: "sun,wed",
        lastEmailSent: "-",
        emailStatus: "No",
      },
      {
        id: "17",
        bankRefId: "17",
        bankName: "ISLAMI BANK BANGLADESH",
        swiftCode: "IBBLBDDH",
        npsbCode: "0125",
        emiRate: "",
        sslEmail: "cardsupport@islamibankbd.com",
        sslMobile: "01811223366",
        lastReportingDate: "-",
        reportSendOn: "sun,wed",
        lastEmailSent: "-",
        emailStatus: "No",
      },
      {
        id: "18",
        bankRefId: "18",
        bankName: "ITCL",
        swiftCode: "",
        npsbCode: "",
        emiRate: "",
        sslEmail: "info@itclbd.com",
        sslMobile: "01911223311",
        lastReportingDate: "-",
        reportSendOn: "sun,wed",
        lastEmailSent: "-",
        emailStatus: "No",
      },
      {
        id: "19",
        bankRefId: "19",
        bankName: "JAMUNA BANK",
        swiftCode: "JAMUBDDH",
        npsbCode: "0130",
        emiRate:
          '{"3":"0.025","6":"0.0375","9":"0.050","12":"0.065","18":"0.110","24":"0.150","36":"0.190"}',
        sslEmail: "cards@jamunabank.com.bd",
        sslMobile: "01711223322",
        lastReportingDate: "-",
        reportSendOn: "sun,wed",
        lastEmailSent: "-",
        emailStatus: "No",
      },
      {
        id: "20",
        bankRefId: "20",
        bankName: "JANATA BANK",
        swiftCode: "JANBBDDH",
        npsbCode: "0135",
        emiRate: "",
        sslEmail: "it.janata@janatabank-bd.com",
        sslMobile: "01811223333",
        lastReportingDate: "-",
        reportSendOn: "sun,wed",
        lastEmailSent: "-",
        emailStatus: "No",
      },
      {
        id: "21",
        bankRefId: "21",
        bankName: "LANKABANGLA FINANCE",
        swiftCode: "VBSEBDD1",
        npsbCode: "VBSE",
        emiRate:
          '{"3":"0.028","6":"0.0425","9":"0.060","12":"0.075","18":"0.105","24":"0.140","36":"0.21"}',
        sslEmail: "support@lankabangla.com",
        sslMobile: "01911223344",
        lastReportingDate: "-",
        reportSendOn: "sun,wed",
        lastEmailSent: "-",
        emailStatus: "No",
      },
      {
        id: "22",
        bankRefId: "22",
        bankName: "MERCANTILE BANK",
        swiftCode: "MBLBBDDH",
        npsbCode: "0140",
        emiRate: "",
        sslEmail: "cards@mblbd.com",
        sslMobile: "01711223355",
        lastReportingDate: "-",
        reportSendOn: "sun,wed",
        lastEmailSent: "-",
        emailStatus: "No",
      },
      {
        id: "23",
        bankRefId: "23",
        bankName: "MUTUAL TRUST BANK",
        swiftCode: "MTBLBDDH",
        npsbCode: "0145",
        emiRate:
          '{"3":"0.025","6":"0.0375","9":"0.050","12":"0.065","18":"0.110","24":"0.150","36":"0.190"}',
        sslEmail: "cards@mutualtrustbank.com",
        sslMobile: "01811223377",
        lastReportingDate: "-",
        reportSendOn: "sun,wed",
        lastEmailSent: "-",
        emailStatus: "No",
      },
      {
        id: "24",
        bankRefId: "24",
        bankName: "NATIONAL BANK",
        swiftCode: "NBLBBDDH",
        npsbCode: "0150",
        emiRate: "",
        sslEmail: "it@nblbd.com",
        sslMobile: "01911223388",
        lastReportingDate: "-",
        reportSendOn: "sun,wed",
        lastEmailSent: "-",
        emailStatus: "No",
      },
      {
        id: "25",
        bankRefId: "25",
        bankName: "NCC BANK",
        swiftCode: "NCCLBDDH",
        npsbCode: "0160",
        emiRate:
          '{"3":"0.020","6":"0.035","9":"0.050","12":"0.070","18":"0.100","24":"0.120","36":"0.150"}',
        sslEmail: "cards@nccbank.com.bd",
        sslMobile: "01711223399",
        lastReportingDate: "-",
        reportSendOn: "sun,wed",
        lastEmailSent: "-",
        emailStatus: "No",
      },
      {
        id: "26",
        bankRefId: "26",
        bankName: "ONE BANK",
        swiftCode: "ONEBBDDH",
        npsbCode: "0165",
        emiRate: "",
        sslEmail: "cards@onebank.com.bd",
        sslMobile: "01811223300",
        lastReportingDate: "-",
        reportSendOn: "sun,wed",
        lastEmailSent: "-",
        emailStatus: "No",
      },
      {
        id: "27",
        bankRefId: "27",
        bankName: "PREMIER BANK",
        swiftCode: "PRMRBDDH",
        npsbCode: "0235",
        emiRate: "",
        sslEmail: "cards@premierbank.com.bd",
        sslMobile: "01911223311",
        lastReportingDate: "-",
        reportSendOn: "sun,wed",
        lastEmailSent: "-",
        emailStatus: "No",
      },
    ];
  }

  private seedMerchantStores() {
    const paymentTypes: MerchantStore["paymentType"][] = [
      "Only Online",
      "Only QR",
      "Online & QR",
    ];
    const currencies = ["BDT", "USD", "EUR"];

    // Seed ~3 stores per merchant from the first 20 merchants
    const stores: MerchantStore[] = [];
    this.data.merchants.slice(0, 20).forEach((merchant, mIdx) => {
      const storeCount = (mIdx % 3) + 1; // 1, 2, or 3 stores
      for (let s = 0; s < storeCount; s++) {
        const storeIdSlug = merchant.storeId
          .replace(/[^a-z0-9]/gi, "")
          .toLowerCase();
        stores.push({
          id: `store_${mIdx}_${s}`,
          merchantId: merchant.id,
          storeId: s === 0 ? merchant.storeId : `${storeIdSlug}_${s + 1}live`,
          storeName:
            s === 0
              ? merchant.name.toUpperCase()
              : `${merchant.name} (Branch ${s + 1})`,
          baseUrl:
            s === 0
              ? `${storeIdSlug}.sslcommerz.com`
              : `${storeIdSlug}-${s}.sslcommerz.com`,
          currency: currencies[s % currencies.length],
          emiStatus: mIdx % 3 === 0 ? "No EMI" : "EMI Enabled",
          paymentType: paymentTypes[(mIdx + s) % paymentTypes.length],
          status: s === 0 ? "Active" : mIdx % 5 === 0 ? "Inactive" : "Active",
        });
      }
    });

    // Also add the static screenshot store for merchant '1'
    stores.unshift({
      id: "store_static_1",
      merchantId: "1",
      storeId: "devsignupinterfacesslcommerz7live",
      storeName: "SSLCOMMERZ",
      baseUrl: "dev signup interface.sslcommerz.com",
      currency: "BDT",
      emiStatus: "No EMI",
      paymentType: "Only Online",
      status: "Active",
    });

    this.data.merchantStores = stores;
  }

  private seedResellers() {
    this.data.resellers = [
      {
        id: "1",
        resellerId: "50",
        name: "test reseller 2",
        email: "sahaanik1045@gmail.com",
        phone: "01628781323",
        status: "Active",
        address:
          "22/A jhultuly, Faridpur, DhakaBanashree M block, road 7, house 15",
        fax: "",
        bank: "Select Bank",
        branchName: "Dhaka",
        accountName: "SSL DEMO TEST BOX 1",
        accountNumber: "0012345678912",
        eftnNumber: "3242432",
        bankCharge: 0.0,
        resellerCharge: 0,
        agreementCopy: "agreement.pdf",
        onboardingDate: "2024-01-15T10:00:00.000Z",
      },
      {
        id: "2",
        resellerId: "49",
        name: "Programming Hero",
        email: "sahaanik1045@gmail.com",
        phone: "01628781323",
        status: "Active",
        onboardingDate: "2024-02-20T10:00:00.000Z",
      },
      {
        id: "3",
        resellerId: "48",
        name: "test reseller",
        email: "trd1@mailinator.com",
        phone: "01715943783",
        status: "Active",
        onboardingDate: "2024-03-05T10:00:00.000Z",
      },
    ];

    // Add more random resellers to match the screenshot's density
    const moreResellers: Reseller[] = Array.from({ length: 37 }).map(
      (_, i) => ({
        id: (i + 4).toString(),
        resellerId: (47 - i).toString(),
        name:
          i % 2 === 0 ? `Test ISO ${i < 10 ? "0" : ""}${i}` : `Company ${i}`,
        email: `test${i}@demo.com`,
        phone: `12345678${i}`,
        status: i === 27 ? "De-active" : "Active",
        onboardingDate: new Date(
          Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 365),
        ).toISOString(),
      }),
    );

    this.data.resellers = [...this.data.resellers, ...moreResellers];
  }

  async createReseller(resellerData: Partial<Reseller>): Promise<Reseller> {
    const newReseller: Reseller = {
      id: (this.data.resellers.length + 1).toString(),
      resellerId: `R-${Math.floor(1000 + Math.random() * 9000)}`,
      name: "",
      email: "",
      phone: "",
      status: "Active",
      onboardingDate: new Date().toISOString(),
      ...resellerData,
    } as Reseller;

    this.data.resellers.unshift(newReseller);
    return newReseller;
  }

  async createMerchant(merchantData: Partial<Merchant>): Promise<Merchant> {
    const newMerchant: Merchant = {
      id: (this.data.merchants.length + 1).toString(),
      name: "",
      storeId: "",
      ownerName: "Sarah Ahmed",
      status: "active",
      sector: "",
      lastTransactionDate: new Date().toISOString(),
      gmv7d: 0,
      gmv30d: 0,
      gmvTrend: 0,
      txCount7d: 0,
      txCount30d: 0,
      txCountTrend: 0,
      revenue7d: 0,
      revenue30d: 0,
      revenueTrend: 0,
      successRate7d: 100,
      topFailureReason: "N/A",
      isNonTransacting: true,
      onboardingDate: new Date().toISOString().split("T")[0],
      ...merchantData,
    } as Merchant;

    this.data.merchants.push(newMerchant);
    return newMerchant;
  }

  private seedInvestigations() {
    this.data.investigations = [
      {
        id: "inv_1",
        caseId: "CASE-2023-001",
        title: "Unusual refund spike",
        status: "open",
        riskLevel: "high",
        assignedTo: "user_1",
        createdAt: new Date().toISOString(),
        relatedEntityId: "1",
        notes:
          "Initial observation: multiple refunds initiated within 10 mins.",
      },
      {
        id: "inv_2",
        caseId: "CASE-2023-002",
        title: "Integration failure",
        status: "closed",
        riskLevel: "medium",
        assignedTo: "user_1",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        relatedEntityId: "2",
      },
    ];
  }

  private seedChargebacks() {
    // Specific rows from screenshot
    const specificRows: Chargeback[] = [
      {
        id: "cb_static_1",
        requestedOn: "2025-10-06T14:55:00",
        bankSslId: "ST31792025100600058",
        chargebackRefId: "C251006145500-15677",
        merchantRefCode: "",
        storeName: "Easy App - demotest",
        merchantName: "Easy App", // Inferred
        storeId: "ea_demo",
        escrowEnabled: false,
        stage: "1st Chargeback",
        transactionId: "123",
        reason: "Not Selected",
        chargebackCategory: "",
        amount: -15.0,
        requestStatus: "Success",
        approvalStatus: "Approve",
        actionType: "-",
        merchantId: "m_ea",
        bank: "City Bank",
        merchantStatus: "active",
      },
      {
        id: "cb_static_2",
        requestedOn: "2025-11-10T10:17:18",
        bankSslId: "UCS74782025110200047",
        chargebackRefId: "C251110101718-49883",
        merchantRefCode: "3r2r",
        storeName: "test1 - test14live",
        merchantName: "Test Merchant",
        storeId: "tm_live",
        escrowEnabled: false,
        stage: "1st Chargeback",
        transactionId: "INV6907224A5B7A7-7657668977",
        reason: "Not Selected",
        chargebackCategory: "",
        amount: -10000.0,
        requestStatus: "Success",
        approvalStatus: "Approve",
        actionType: "-",
        merchantId: "m_tm",
        bank: "City Bank",
        merchantStatus: "active",
      },
      {
        id: "cb_static_3",
        requestedOn: "2023-02-08T09:43:16",
        bankSslId: "BGT71122023020100002",
        chargebackRefId: "C230208094316-87885",
        merchantRefCode: "",
        storeName: "Grameenphone - demosslUIlive",
        merchantName: "Grameenphone",
        storeId: "gp_demo",
        escrowEnabled: false,
        stage: "1st Chargeback",
        transactionId: "ORDER001",
        reason: "Not Selected",
        chargebackCategory: "",
        amount: -20.0,
        requestStatus: "Success",
        approvalStatus: "Approve",
        actionType: "-",
        merchantId: "m_gp",
        bank: "City Bank",
        merchantStatus: "active",
      },
      {
        id: "cb_static_4",
        requestedOn: "2024-06-03T16:23:37",
        bankSslId: "CZ12342024060300037",
        chargebackRefId: "C240603162337-59510",
        merchantRefCode: "",
        storeName: "Easy App",
        merchantName: "Sandbox Live Test",
        storeId: "demotest - demo.sslwireless.com",
        homePageOfStore: "",
        bankName: "AMEX-City Bank",
        escrowEnabled: false,
        stage: "1st Chargeback",
        transactionId: "TYISHL-SSLCZ_TEST_665d98e071222",
        transactionDate: "2024-06-03 16:22:13",
        transactionAmount: 15.0,
        settledAmount: -14.47,
        reason: "Not Selected",
        chargebackCategory: "",
        amount: -15.0,
        requestStatus: "",
        approvalStatus: "Approve",
        actionType: "-",
        merchantId: "m_ea",
        bank: "City Bank",
        merchantStatus: "active",
        requestedRemarks: "CB",
        requestedBy: "",
        autoRefundStatus: "Pending",
        autoRefundRemarks: "",
        autoRefundAttempts: 0,
        approvalRemarks: "r543rfsfsdfs",
        approvalOn: "2024-06-03 16:24:44",
        approvalBy: "",
        confirmationRemarks: "",
        confirmationOn: "2026-02-03 10:24:07",
        confirmationBy: "",
        finalConfirmation: "Initial",
      },
      {
        id: "cb_static_5",
        requestedOn: "2024-07-04T10:32:27",
        bankSslId: "CZ21162024070400009",
        chargebackRefId: "C240704103227-97416",
        merchantRefCode: "",
        storeName: "Easy App - demotest",
        merchantName: "Easy App",
        storeId: "ea_demo",
        escrowEnabled: false,
        stage: "1st Chargeback",
        transactionId: "TYISHL-SSLCZ_TEST_6686242e7069b",
        reason: "Not Selected",
        chargebackCategory: "",
        amount: -15.0,
        requestStatus: "Success",
        approvalStatus: "Approve",
        actionType: "-",
        merchantId: "m_ea",
        bank: "City Bank",
        merchantStatus: "active",
      },
      {
        id: "cb_static_6",
        requestedOn: "2025-11-10T10:17:18",
        bankSslId: "UCS74782025110200047",
        chargebackRefId: "C251110101718-49883",
        merchantRefCode: "3r2r",
        storeName: "test1 - test14live",
        merchantName: "Test Merchant",
        storeId: "tm_live",
        escrowEnabled: false,
        stage: "1st Chargeback",
        transactionId: "INV6907224A5B7A7-7657668977",
        reason: "Not Selected",
        chargebackCategory: "",
        amount: -10000.0,
        requestStatus: "Success",
        approvalStatus: "Approve",
        actionType: "-",
        merchantId: "m_tm",
        bank: "City Bank",
        merchantStatus: "active",
      },
      {
        id: "cb_static_7",
        requestedOn: "2025-03-23T14:28:58",
        bankSslId: "EC57222025032300070",
        chargebackRefId: "C250323142858-56372",
        merchantRefCode: "4234",
        storeName: "Hosted Checkout - HostedCheckoutOlivephy",
        merchantName: "Hosted Checkout",
        storeId: "hc_olive",
        escrowEnabled: false,
        stage: "1st Chargeback",
        transactionId: "250323ocogjhIHahKl1i",
        reason: "Not Selected",
        chargebackCategory: "",
        amount: -104.0,
        requestStatus: "Success",
        approvalStatus: "Approve",
        actionType: "-",
        merchantId: "m_hc",
        bank: "City Bank",
        merchantStatus: "active",
      },
    ];

    // Random rows to fill up the table
    const randomRows = Array.from({ length: 43 }).map((_, i) => {
      const requestedOn = new Date(
        Date.now() - Math.random() * 86400000 * 30,
      ).toISOString();
      const amount = Math.floor(Math.random() * 5000) + 500;

      return {
        id: `cb_${i}`,
        requestedOn,
        chargebackRefId: `CB-REF-${1000 + i}`,
        transactionId: `TXN-${20000 + i}`,
        merchantId: i % 3 === 0 ? "1" : i % 3 === 1 ? "2" : "3",
        merchantName:
          i % 3 === 0
            ? "US Bangla"
            : i % 3 === 1
              ? "Grameenphone"
              : "Banglalink",
        storeId: i % 3 === 0 ? "usb_01" : i % 3 === 1 ? "gp_pay" : "bl_pay",
        storeName:
          i % 3 === 0
            ? "US Bangla (Main)"
            : i % 3 === 1
              ? "GP Online"
              : "BL Digital",
        bankName: ["City Bank", "Brac Bank", "DBBL"][
          Math.floor(Math.random() * 3)
        ],
        escrowEnabled: Math.random() > 0.5,
        stage: ["1st Chargeback", "Pre-Arbitration", "Arbitration"][
          Math.floor(Math.random() * 3)
        ] as any,
        reason: ["Fraud", "Product not received", "Duplicate", "Auth Declined"][
          Math.floor(Math.random() * 4)
        ],
        chargebackCategory: [
          "Fraud Transaction",
          "Service Not Delivered",
          "Other",
        ][Math.floor(Math.random() * 3)],
        amount: -amount,
        requestStatus: ["Success", "Waiting", "Processing", "Cancelled"][
          Math.floor(Math.random() * 4)
        ] as any,
        approvalStatus: ["Approve", "Deny", "Processing", "Cancel"][
          Math.floor(Math.random() * 4)
        ] as any,
        merchantRefCode: `MREF-${Math.floor(Math.random() * 10000)}`,
        bankSslId: `SSL-${Math.floor(Math.random() * 10000)}`,
        bank: ["City Bank", "Brac Bank", "DBBL"][Math.floor(Math.random() * 3)],
        merchantStatus: "active" as any,
        actionType: Math.random() > 0.7 ? "Submit to Bank" : "-",
      };
    });

    this.data.chargebacks = [...specificRows, ...randomRows];
  }

  private seedRefunds() {
    this.data.refunds = [
      {
        id: "rf_1514",
        refundId: 1514,
        sid: 31,
        tid: 29174573,
        storeId: "demotest",
        msslid: "demotest",
        merchantId: "demotest",
        merchantName: "Sandbox Live Test",
        storeName: "Easy App",
        storeUrl: "demo.sslwireless.com",
        storeLandingUrl: "www.sslcommerz.com",
        merchantTransactionId: "5F546BEEB3ECD",
        transactionId: "5F546BEEB3ECD",
        refundRefId: "R260421163116-12778",
        merchantRefCode: "5F546BEEB3ECD",
        amount: 200,
        settledAmount: 200,
        requestedRemarks: "test for demotest",
        hasEmi: 0,
        settlementStatus: "SETTLE_INITIAL",
        requestStatus: 1,
        requestStatusLabel: "Success",
        approvedStatus: 3,
        approvedStatusLabel: "Initiate",
        confirmedStatus: 3,
        confirmedStatusLabel: "Initiate",
        requestedOn: "2026-04-21 16:31:16",
        confirmedOn: "0000-00-00 00:00:00",
        approvedOn: "0000-00-00 00:00:00",
        cardNo: "PFT20282L7CVM",
        cardType: "PBL-Prime Bank Limited",
        mtxnid: "5F546BEEB3ECD",
        mamount: 9530,
        incommingtime: "2020-09-06 10:56:14",
        bid: 35,
        finalStatus: "Success",
        settledStatus: "Settled",
      },
      {
        id: "rf_1513",
        refundId: 1513,
        sid: 31,
        tid: 29174572,
        storeId: "demotest",
        msslid: "demotest",
        merchantId: "demotest",
        merchantName: "Sandbox Live Test",
        storeName: "Easy App",
        storeUrl: "demo.sslwireless.com",
        storeLandingUrl: "www.sslcommerz.com",
        merchantTransactionId: "5F546B6B2C8CA",
        transactionId: "5F546B6B2C8CA",
        refundRefId: "R260421163115-99133",
        merchantRefCode: "39084291231",
        amount: 100,
        settledAmount: 100,
        requestedRemarks: "test for demotest",
        hasEmi: 0,
        settlementStatus: "SETTLE_INITIAL",
        requestStatus: 1,
        requestStatusLabel: "Success",
        approvedStatus: 3,
        approvedStatusLabel: "Initiate",
        confirmedStatus: 3,
        confirmedStatusLabel: "Initiate",
        requestedOn: "2026-04-21 16:31:15",
        confirmedOn: "0000-00-00 00:00:00",
        approvedOn: "0000-00-00 00:00:00",
        cardNo: "PFT20282SN5WZ",
        cardType: "PBL-Prime Bank Limited",
        mtxnid: "5F546B6B2C8CA",
        mamount: 835.66,
        incommingtime: "2020-09-06 10:54:03",
        bid: 35,
        finalStatus: "Success",
        settledStatus: "Settled",
      },
      {
        id: "rf_1512",
        refundId: 1512,
        sid: 31,
        tid: 29173791,
        storeId: "demotest",
        msslid: "demotest",
        merchantId: "demotest",
        merchantName: "Sandbox Live Test",
        storeName: "Easy App",
        storeUrl: "demo.sslwireless.com",
        storeLandingUrl: "www.sslcommerz.com",
        merchantTransactionId: "REF123690",
        transactionId: "REF123690",
        refundRefId: "R260421151149-36081",
        merchantRefCode: "498530",
        amount: 5,
        settledAmount: 5,
        requestedRemarks: "partial refund",
        hasEmi: 0,
        settlementStatus: "SETTLE_INITIAL",
        requestStatus: 1,
        requestStatusLabel: "Success",
        approvedStatus: 3,
        approvedStatusLabel: "Initiate",
        confirmedStatus: 3,
        confirmedStatusLabel: "Initiate",
        requestedOn: "2026-04-21 15:11:49",
        confirmedOn: "0000-00-00 00:00:00",
        approvedOn: "0000-00-00 00:00:00",
        cardNo: "gh7GL8029D9A",
        cardType: "Ghoori-UnionPay",
        mtxnid: "REF123690",
        mamount: 10,
        incommingtime: "2020-07-21 19:25:46",
        bid: 34,
        finalStatus: "Success",
        settledStatus: "Settled",
      },
      {
        id: "rf_1511",
        refundId: 1511,
        sid: 31,
        tid: 29173774,
        storeId: "demotest",
        msslid: "demotest",
        merchantId: "demotest",
        merchantName: "Sandbox Live Test",
        storeName: "Easy App",
        storeUrl: "demo.sslwireless.com",
        storeLandingUrl: "www.sslcommerz.com",
        merchantTransactionId: "REF123690",
        transactionId: "REF123690",
        refundRefId: "R260421151149-17271",
        merchantRefCode: "37426",
        amount: 20,
        settledAmount: 0,
        requestedRemarks: "test for demotest",
        hasEmi: 0,
        settlementStatus: "SETTLE_INITIAL",
        requestStatus: 1,
        requestStatusLabel: "Success",
        approvedStatus: 3,
        approvedStatusLabel: "Initiate",
        confirmedStatus: 3,
        confirmedStatusLabel: "Initiate",
        requestedOn: "2026-04-21 15:11:49",
        confirmedOn: "0000-00-00 00:00:00",
        approvedOn: "0000-00-00 00:00:00",
        cardNo: "gh7GL1029CAD",
        cardType: "Ghoori-UnionPay",
        mtxnid: "REF123690",
        mamount: 20,
        incommingtime: "2020-07-21 12:36:36",
        bid: 34,
        finalStatus: "Success",
        settledStatus: "Unsettled",
      },
      {
        id: "rf_1507",
        refundId: 1507,
        sid: 7235,
        tid: 292041611,
        storeId: "googlehtxtrxtextrxlive",
        msslid: "googlehtxtrxtextrxlive",
        merchantId: "googlehtxtrxtextrxlive",
        merchantName: "WELCOME ELECTRONICS googlehtxtrxtextrx",
        storeName: "SSLCOMMERZ googlehtxtrxtextrx",
        storeUrl: "googlehtxtrxtextrx.com",
        storeLandingUrl: "https://www.googlehtxtrxtextrx.com",
        merchantTransactionId: "69E44CF5C7142-69E44CFA15AC2",
        transactionId: "69E44CF5C7142-69E44CFA15AC2",
        refundRefId: "R260419101154-50662",
        merchantRefCode: "3r2r",
        amount: 100,
        settledAmount: 100,
        requestedRemarks: "SSLCOMMERZ googlehtxtrxtextrx",
        hasEmi: 0,
        settlementStatus: "SETTLE_INITIAL",
        requestStatus: 1,
        requestStatusLabel: "Success",
        approvedStatus: 3,
        approvedStatusLabel: "Initiate",
        confirmedStatus: 3,
        confirmedStatusLabel: "Initiate",
        requestedOn: "2026-04-19 10:11:54",
        confirmedOn: "0000-00-00 00:00:00",
        approvedOn: "0000-00-00 00:00:00",
        cardNo: "445653XXXXXX1096",
        cardType: "VISA-Eastern Bank Limited",
        mtxnid: "69E44CF5C7142-69E44CFA15AC2",
        mamount: 1200,
        incommingtime: "2026-04-19 09:33:14",
        bid: 13,
        finalStatus: "Success",
        settledStatus: "Settled",
      },
      {
        id: "rf_1506",
        refundId: 1506,
        sid: 7235,
        tid: 292041564,
        storeId: "googlehtxtrxtextrxlive",
        msslid: "googlehtxtrxtextrxlive",
        merchantId: "googlehtxtrxtextrxlive",
        merchantName: "WELCOME ELECTRONICS googlehtxtrxtextrx",
        storeName: "SSLCOMMERZ googlehtxtrxtextrx",
        storeUrl: "googlehtxtrxtextrx.com",
        storeLandingUrl: "https://www.googlehtxtrxtextrx.com",
        merchantTransactionId: "INV69DB28D1E6576-765766",
        transactionId: "INV69DB28D1E6576-765766",
        refundRefId: "R260412111049-24743",
        merchantRefCode: "3r2r",
        amount: -100,
        settledAmount: -100,
        requestedRemarks: "SSLCOMMERZ",
        hasEmi: 0,
        settlementStatus: "SETTLE_INITIAL",
        requestStatus: 1,
        requestStatusLabel: "Success",
        approvedStatus: 1,
        approvedStatusLabel: "Success",
        confirmedStatus: 3,
        confirmedStatusLabel: "Initiate",
        requestedOn: "2026-04-12 11:10:49",
        confirmedOn: "2026-04-12 11:16:19",
        approvedOn: "2026-04-12 11:13:33",
        cardNo: "445653XXXXXX1096",
        cardType: "VISA-Eastern Bank Limited",
        mtxnid: "INV69DB28D1E6576-765766",
        mamount: 600,
        incommingtime: "2026-04-12 11:08:37",
        bid: 13,
        finalStatus: "Success",
        settledStatus: "Settled",
      },
      {
        id: "rf_1504",
        refundId: 1504,
        sid: 7235,
        tid: 292041553,
        storeId: "googlehtxtrxtextrxlive",
        msslid: "googlehtxtrxtextrxlive",
        merchantId: "googlehtxtrxtextrxlive",
        merchantName: "WELCOME ELECTRONICS googlehtxtrxtextrx",
        storeName: "SSLCOMMERZ googlehtxtrxtextrx",
        storeUrl: "googlehtxtrxtextrx.com",
        storeLandingUrl: "https://www.googlehtxtrxtextrx.com",
        merchantTransactionId: "INV69DB1596E7B90-7657668977",
        transactionId: "INV69DB1596E7B90-7657668977",
        refundRefId: "R2026041210335600006",
        merchantRefCode: "3r2rrCCCCC@@@@",
        amount: 15000.45,
        settledAmount: 14625.44,
        requestedRemarks:
          "WELCOME ELECTRONICS googlehtxtrxtextrx\n\nStore Name",
        hasEmi: 0,
        settlementStatus: "SETTLE_INITIAL",
        requestStatus: 0,
        requestStatusLabel: "Cancelled",
        approvedStatus: 0,
        approvedStatusLabel: "Cancelled",
        confirmedStatus: 0,
        confirmedStatusLabel: "Cancelled",
        requestedOn: "2026-04-12 10:33:56",
        confirmedOn: "0000-00-00 00:00:00",
        approvedOn: "2026-04-12 10:36:22",
        cardNo: "445653XXXXXX1096",
        cardType: "VISA-Eastern Bank Limited",
        mtxnid: "INV69DB1596E7B90-7657668977",
        mamount: 15000.45,
        incommingtime: "2026-04-12 09:46:36",
        bid: 13,
        finalStatus: "Failed",
        settledStatus: "Unsettled",
      },
    ];
  }

  private seedTransactionTickets() {
    this.data.transactionTickets = Array.from({ length: 60 }).map((_, i) => {
      const queryTypesOptions = [
        "EMI Conversion Request",
        "Transaction Status",
        "Declined Reason",
        "Card Error",
        "Payment verification",
        "Double deduction",
      ];
      // Randomly pick 1 or 2 reasons
      const pickedQueries = queryTypesOptions
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.random() > 0.8 ? 2 : 1);

      // Link to a real transaction if possible
      const txns = this.data.transactions;
      const txn = txns.length > 0 ? txns[i % txns.length] : null;

      return {
        id: `tt_${i}`,
        requestedOn: new Date(
          Date.now() - Math.random() * 86400000 * 20,
        ).toISOString(),
        ticketNo: `TKT-${80000 + i}`,
        storeName:
          txn?.storeName ||
          (i % 3 === 0
            ? "US Bangla (Main)"
            : i % 3 === 1
              ? "GP Online"
              : "BL Digital"),
        merchantName:
          txn?.merchantId === "1"
            ? "US Bangla"
            : txn?.merchantId === "2"
              ? "Grameenphone"
              : "Banglalink",
        storeId:
          txn?.storeId ||
          (i % 3 === 0 ? "usb_01" : i % 3 === 1 ? "gp_pay" : "bl_pay"),
        transactionId: txn?.id || `TXN-${40000 + i}`,
        tid: txn?.tid || 200000 + i,
        queryTypes: pickedQueries,
        status: Math.random() > 0.6 ? "Solved" : "Requested",
        canAddFeedback: Math.random() > 0.8,
        description: `This is a sample support query for transaction ${txn?.id || "TXN-" + (40000 + i)}. Subject: ${pickedQueries.join(", ")}.`,

        // Requester Info
        requestedBy: "Merchant Panel",
        accountType: "Merchant",
        userRole: "Admin",
        requesterName:
          i % 3 === 0
            ? "Sarah Ahmed"
            : i % 3 === 1
              ? "Tanvir Hasan"
              : "Rahim Uddin",
        requesterEmail: `user${i}@merchant.com`,
        requesterMobile: `017${Math.floor(Math.random() * 100000000)}`,

        // Feedback - populate if solved or has feedback
        requestFeedback: Math.random() > 0.7 ? "Excellent support!" : undefined,
        feedbackGivenBy: Math.random() > 0.7 ? "Sarah Ahmed" : undefined,
        feedbackGivenOn:
          Math.random() > 0.7 ? new Date().toISOString() : undefined,
        feedbackRemarks:
          Math.random() > 0.7 ? "Issue resolved quickly." : undefined,
      };
    });
  }

  private seedSettlements() {
    // Generate settlements
    this.data.settlements = Array.from({ length: 60 }).map((_, i) => {
      // Bias towards Paid and Pending, but include enough Bounced for the task requirement
      const status =
        Math.random() < 0.1
          ? "Bounced"
          : Math.random() < 0.4
            ? "Pending"
            : Math.random() < 0.5
              ? "On Hold"
              : "Paid";

      const paymentStatus = status === "Paid" ? "Paid" : "Pay Now";
      const confirmationStatus =
        status === "Paid" ? "Payment Confirmed" : "Pending Confirmation";

      // Mock Bank details
      const bankNames = [
        "City Bank",
        "Brac Bank",
        "DBBL",
        "EBL",
        "Standard Chartered",
      ];
      const branchNames = [
        "Gulshan",
        "Banani",
        "Motijheel",
        "Dhanmondi",
        "Uttara",
      ];

      const type = i % 4 === 0 ? "Physical" : "Online";
      const amount = Math.floor(Math.random() * 50000) + 5000;

      return {
        id: `st_${i}`,
        batchId: `BATCH-${2025000 + Math.floor(i / 10)}`, // Group every 10 into a batch
        txnId: `TXN-ST-${100000 + i}`,
        settlementDate: new Date(
          Date.now() - Math.random() * 86400000 * 30,
        ).toISOString(),
        merchantName:
          i % 3 === 0
            ? "US Bangla"
            : i % 3 === 1
              ? "Grameenphone"
              : "Banglalink",
        merchantId: i % 3 === 0 ? "m_usb" : i % 3 === 1 ? "m_gp" : "m_bl",
        storeId: i % 3 === 0 ? "usb_01" : i % 3 === 1 ? "gp_pay" : "bl_pay",
        storeName:
          i % 3 === 0
            ? "US Bangla (Main)"
            : i % 3 === 1
              ? "GP Online"
              : "BL Digital",
        bankDetails: {
          payeeName:
            i % 3 === 0
              ? "US Bangla Airlines Ltd"
              : i % 3 === 1
                ? "Grameenphone Ltd"
                : "Banglalink Digital",
          bankName: bankNames[i % bankNames.length],
          branchName: branchNames[i % branchNames.length],
          accountNo: `AC-${100000 + i}`,
          routingNo: `RT-${200000 + i}`,
        },
        amount: amount,
        settlementStatus: status as any,
        paymentStatus: paymentStatus as any,
        confirmationStatus: confirmationStatus as any,
        type: type as "Online" | "Physical",
        merchantType: "Enterprise",
        storeType: type,
        referenceNo: `REF-ST-${200000 + i}`,
        ...(type === "Online"
          ? {
              onlineAmounts: {
                opening: amount * 0.1,
                payable: amount * 0.95,
                settlement: amount,
                paid: status === "Paid" ? amount : 0,
                forwarded: status === "Paid" ? 0 : amount * 0.05,
              },
              transactionSummary: [
                {
                  type: "On-line Payment",
                  noOfTrans: Math.floor(Math.random() * 50) + 50,
                  sslAmt: amount * 0.015,
                  bankAmt: amount * 0.01,
                  storeAmt: amount * 0.975,
                  deductAmt: 0,
                },
                {
                  type: "Refund",
                  noOfTrans: Math.floor(Math.random() * 5),
                  sslAmt: 0,
                  bankAmt: 0,
                  storeAmt: 0,
                  deductAmt: amount * 0.02,
                },
              ],
              paymentInformation: [
                {
                  id: 1,
                  chequeRef: `${7428394000 + i}`,
                  acctPayee:
                    i % 3 === 0
                      ? "US Bangla Airlines Ltd"
                      : i % 3 === 1
                        ? "Grameenphone Ltd"
                        : "Banglalink Digital",
                  amount: amount,
                  bank: bankNames[i % bankNames.length],
                  attachment: "-",
                },
              ],
            }
          : {}),
      };
    });
  }

  private seedEMIOperations() {
    const issuerBanks = [
      "City Bank",
      "Brac Bank",
      "DBBL",
      "EBL",
      "Standard Chartered",
      "HSBC",
    ];
    const tenures = [3, 6, 9, 12, 18, 24];

    this.data.emiOperations = Array.from({ length: 80 }).map((_, i) => {
      const status =
        i < 10
          ? "Pending"
          : i < 20
            ? "Declined"
            : i < 60
              ? "Approved"
              : "Pending";
      const bankStatus =
        status === "Approved"
          ? "Approved"
          : status === "Declined"
            ? "Declined"
            : i % 2 === 0
              ? "Not Sent to Bank"
              : "Approved";

      const transactionAmount = Math.floor(Math.random() * 100000) + 10000;
      const emiAmount = transactionAmount; // Same for now, can add interest later
      const date = new Date(
        Date.now() - Math.random() * 86400000 * 60,
      ).toISOString();

      return {
        id: `emi_${i}`,
        requestedAt: date,
        transactionDate: date,
        emiRefId: `EMI-REF-${100000 + i}`,
        storeName:
          i % 3 === 0
            ? "US Bangla (Main)"
            : i % 3 === 1
              ? "GP Online"
              : "BL Digital",
        merchantName:
          i % 3 === 0
            ? "US Bangla"
            : i % 3 === 1
              ? "Grameenphone"
              : "Banglalink",
        storeId: i % 3 === 0 ? "usb_01" : i % 3 === 1 ? "gp_pay" : "bl_pay",
        homePageOfStore: "",
        bankName: `VISA-${issuerBanks[i % issuerBanks.length]} Limited`,
        issuerBank: issuerBanks[i % issuerBanks.length],
        tenureMonths: tenures[i % tenures.length],
        transactionId: `TXN-EMI-${50000 + i}`,
        transactionAmount,
        emiAmount,
        emiCharge: transactionAmount * 0.115,
        requestedRemarks: "AUTHORIZED",
        status: status as any,
        bankStatus: bankStatus as any,
        bankSslId: `SSL-EMI-${200000 + i}`,
        canProceed: status === "Pending" && bankStatus === "Not Sent to Bank",
        canCancel: status === "Pending",
      };
    });
  }

  private seed() {
    // Merchants
    this.data.merchants = [
      {
        id: "1",
        name: "US Bangla",
        storeId: "usb_01",
        ownerName: "Sarah Ahmed",
        status: "active",
        sector: "Hospitality, Travel & Aviation",
        lastTransactionDate: new Date().toISOString(),
        gmv7d: 450000,
        gmv30d: 1800000,
        gmvTrend: 12.5,
        txCount7d: 1250,
        txCount30d: 5200,
        txCountTrend: 8.2,
        revenue7d: 9000,
        revenue30d: 36000,
        revenueTrend: 15.1,
        successRate7d: 94.5,
        topFailureReason: "Insufficient Funds",
        isNonTransacting: false,
        onboardingDate: "2023-01-15",
        type: "Online",
        contactName: "Mr. Adnan",
        contactPhone: "+8801700000001",
        contactFax: "N/A",
        contactCountry: "Bangladesh",
        addedBy: "Admin (system)",
        updatedBy: "Sarah Ahmed",
        updatedOn: "2025-02-01 14:30",
        techSupportBy: "Tariqul Islam",
        salesforce: "Rezaul Karim",
        hunter: "Tanvir",
        incubator: "SSL Wireless",
        currentKam: "Sarah Ahmed",
        customerPayTdr: true,
        emiStatus: "Enabled",
      },
      {
        id: "2",
        name: "Grameenphone",
        storeId: "gp_pay",
        ownerName: "Sarah Ahmed",
        status: "active",
        sector: "Telecommunication",
        lastTransactionDate: new Date().toISOString(),
        gmv7d: 120000,
        gmv30d: 500000,
        gmvTrend: -5.2,
        txCount7d: 850,
        txCount30d: 3800,
        txCountTrend: -2.1,
        revenue7d: 2400,
        revenue30d: 10000,
        revenueTrend: -4.8,
        successRate7d: 88.2,
        topFailureReason: "Auth Declined",
        isNonTransacting: false,
        onboardingDate: "2023-02-10",
        type: "Online",
        contactName: "GP Corporate Sales",
        contactPhone: "121",
        contactFax: "N/A",
        contactCountry: "Bangladesh",
        addedBy: "System Migration",
        updatedBy: "Admin",
        updatedOn: "2025-01-15 10:00",
        techSupportBy: "GP Support Team",
        salesforce: "GP Account Manager",
        hunter: "GP Sales Team",
        incubator: "N/A",
        currentKam: "Sarah Ahmed",
        customerPayTdr: false,
        emiStatus: "Disabled",
      },
      {
        id: "3",
        name: "Banglalink",
        storeId: "bl_pay",
        ownerName: "Rahim Khan",
        status: "active",
        sector: "Telecommunication",
        lastTransactionDate: new Date().toISOString(),
        gmv7d: 210000,
        gmv30d: 850000,
        gmvTrend: 18.2,
        txCount7d: 1400,
        txCount30d: 5800,
        txCountTrend: 14.5,
        revenue7d: 4200,
        revenue30d: 17000,
        revenueTrend: 20.1,
        successRate7d: 92.5,
        topFailureReason: "N/A",
        isNonTransacting: false,
        onboardingDate: "2023-03-05",
        type: "Online",
        contactName: "BL Support",
        contactPhone: "01911304121",
        contactFax: "N/A",
        contactCountry: "Bangladesh",
        addedBy: "Admin",
        updatedBy: "Rahim Khan",
        updatedOn: "2025-02-05 16:45",
        techSupportBy: "Technical Team",
        salesforce: "Salesforce Team",
        hunter: "Hunter Team",
        incubator: "N/A",
        introducerKam: "N/A",
        currentKam: "Rahim Khan",
        customerPayTdr: false,
        emiStatus: "Disabled",
      },
      {
        id: "4",
        name: "Foodpanda",
        storeId: "fp_dhaka",
        ownerName: "Anika Tabassum",
        status: "active",
        sector: "Pureplay Ecommerce",
        lastTransactionDate: new Date().toISOString(),
        gmv7d: 380000,
        gmv30d: 1500000,
        gmvTrend: 22.4,
        txCount7d: 1800,
        txCount30d: 7200,
        txCountTrend: 19.8,
        revenue7d: 7600,
        revenue30d: 30000,
        revenueTrend: 25.4,
        successRate7d: 96.2,
        topFailureReason: "Card Expired",
        isNonTransacting: false,
        onboardingDate: "2023-04-12",
        type: "Online",
        contactName: "Foodpanda Vendor Support",
        contactPhone: "+880212345678",
        contactFax: "N/A",
        contactCountry: "Bangladesh",
        addedBy: "Onboarding API",
        updatedBy: "Anika Tabassum",
        updatedOn: "2025-02-08 11:20",
        techSupportBy: "Anisur Rahman",
        salesforce: "FP Account Exec",
        hunter: "FP Hunter",
        incubator: "Delivery Hero",
        introducerKam: "Anika Tabassum",
        currentKam: "Anika Tabassum",
        customerPayTdr: true,
        emiStatus: "Enabled",
      },
      {
        id: "5",
        name: "Daraz",
        storeId: "daraz_mall",
        ownerName: "Tanvir Rahman",
        status: "active",
        sector: "Pureplay Ecommerce",
        lastTransactionDate: new Date().toISOString(),
        gmv7d: 290000,
        gmv30d: 1100000,
        gmvTrend: 15.6,
        txCount7d: 1100,
        txCount30d: 4600,
        txCountTrend: 11.2,
        revenue7d: 5800,
        revenue30d: 22000,
        revenueTrend: 18.4,
        successRate7d: 91.8,
        topFailureReason: "Auth Declined",
        isNonTransacting: false,
        onboardingDate: "2023-05-20",
        type: "Online",
        contactName: "Daraz BD Support",
        contactPhone: "01844556677",
        contactFax: "N/A",
        contactCountry: "Bangladesh",
        addedBy: "Admin",
        updatedBy: "Tanvir Rahman",
        updatedOn: "2025-02-07 09:15",
        techSupportBy: "E-commerce Support",
        salesforce: "Daraz Manager",
        hunter: "Daraz Hunter",
        incubator: "Alibaba Group",
        introducerKam: "Tanvir Rahman",
        currentKam: "Tanvir Rahman",
        customerPayTdr: false,
        emiStatus: "Enabled",
      },
      {
        id: "6",
        name: "Gadget World",
        storeId: "gworld_main",
        ownerName: "Karim Ahmed",
        status: "active",
        sector: "Bricks & Mortar",
        lastTransactionDate: new Date().toISOString(),
        gmv7d: 560000,
        gmv30d: 2200000,
        gmvTrend: 30.5,
        txCount7d: 950,
        txCount30d: 3800,
        txCountTrend: 25.2,
        revenue7d: 11200,
        revenue30d: 45000,
        revenueTrend: 35.8,
        successRate7d: 93.1,
        topFailureReason: "Insufficient Funds",
        isNonTransacting: false,
        onboardingDate: "2023-06-15",
        type: "Physical",
        customerPayTdr: true,
        emiStatus: "Enabled",
      },
      {
        id: "7",
        name: "Welcome Electronic",
        storeId: "welcomeelectronic181live",
        ownerName: "Sarah Ahmed",
        status: "active",
        sector: "Pureplay Ecommerce",
        lastTransactionDate: new Date().toISOString(),
        gmv7d: 150000,
        gmv30d: 600000,
        gmvTrend: 10.5,
        txCount7d: 500,
        txCount30d: 2000,
        txCountTrend: 5.2,
        revenue7d: 3000,
        revenue30d: 12000,
        revenueTrend: 8.1,
        successRate7d: 95.5,
        topFailureReason: "N/A",
        isNonTransacting: false,
        onboardingDate: "2023-01-15",
        type: "Online",
        customerPayTdr: true,
        emiStatus: "Enabled",
      },
    ];

    // Transactions
    this.data.transactions = [
      {
        id: "tx_1234567890",
        tid: 10001,
        merchantId: "1",
        storeId: "tech_haven_01",
        storeName: "Tech Haven (Gulshan)",
        amount: 5000,
        currency: "BDT",
        status: "success",
        date: new Date().toISOString(),
        method: "VISA",
        channel: "web",
        isInternational: false,
        cardLast4: "4242",
        customerName: "Abrar Fawaz",
        customerEmail: "abrar@example.com",
        customerMobile: "01712345678",
        bankTxnId: "BANK-TXN-101",
        bankName: "City Bank",
        cardBrand: "VISA",
        integrationType: "Hosted Checkout",
        cardholderName: "Abrar Fawaz",
        cardBank: "Standard Chartered",
        cardCountry: "Bangladesh",
        cardType: "Credit",
        ipAddress: "103.1.2.3",
      },
      {
        id: "tx_0987654321",
        tid: 10002,
        merchantId: "1",
        storeId: "tech_haven_01",
        storeName: "Tech Haven (Gulshan)",
        amount: 1250,
        currency: "BDT",
        status: "failed",
        date: new Date(Date.now() - 3600000).toISOString(),
        method: "bkash",
        channel: "app",
        isInternational: false,
        failureReason: "Insufficient Funds",
        customerName: "Nusrat Jahan",
        customerEmail: "nusrat@dummy.com",
        customerMobile: "01887654321",
        bankTxnId: "BANK-TXN-102",
        bankName: "bKash Gateway",
        cardBrand: "MFS",
        integrationType: "API",
        cardholderName: "Nusrat Jahan",
        cardBank: "bKash",
        cardCountry: "Bangladesh",
        cardType: "Wallet",
        ipAddress: "202.4.5.6",
      },
      {
        id: "tx_5544332211",
        tid: 10003,
        merchantId: "2",
        storeId: "gp_pay",
        storeName: "GP Online Shop",
        amount: 25000,
        currency: "BDT",
        status: "success",
        date: new Date(Date.now() - 7200000).toISOString(),
        method: "MASTER",
        channel: "web",
        isInternational: true,
        cardLast4: "9876",
        cardBin: "444000",
        customerName: "John Doe",
        customerEmail: "john.doe@global.com",
        customerMobile: "+15551234567",
        bankTxnId: "BANK-TXN-103",
        bankName: "Brac Bank",
        cardBrand: "MASTER",
        integrationType: "Hosted Checkout",
        cardholderName: "John Doe",
        cardBank: "HSBC US",
        cardCountry: "USA",
        cardType: "Credit",
        ipAddress: "72.14.213.1",
      },
      {
        id: "tx_9988776655",
        tid: 10004,
        merchantId: "3",
        storeId: "bl_pay",
        storeName: "Banglalink Digital",
        amount: 500,
        currency: "BDT",
        status: "success",
        date: new Date(Date.now() - 86400000).toISOString(),
        method: "AMEX",
        channel: "web",
        isInternational: false,
        cardLast4: "1005",
        cardBin: "444000",
        customerName: "Zubair Islam",
        customerEmail: "zubair.islam@telecom.bd",
        customerMobile: "01911223344",
        bankTxnId: "BANK-TXN-104",
        bankName: "City Bank",
        cardBrand: "AMEX",
        integrationType: "API",
        cardholderName: "Zubair Islam",
        cardBank: "City Bank",
        cardCountry: "Bangladesh",
        cardType: "Debit",
        ipAddress: "110.33.22.11",
      },
    ];

    // Work Items
    this.data.workItems = [
      {
        id: "w_1",
        title: "High failure rate detected",
        subtitle: "Tech Haven BD • >15% failures",
        type: "failure_spike",
        severity: "high",
        ownerId: "user_1",
        dueDate: new Date().toISOString(),
        status: "open",
        relatedEntityId: "1",
        relatedEntityType: "merchant",
      },
      {
        id: "w_2",
        title: "Settlement approval needed",
        subtitle: "Batch #9923 • 25 Merchants",
        type: "approval",
        severity: "medium",
        ownerId: "user_1",
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        status: "in_progress",
      },
    ];

    // Disputes
    this.data.disputes = [
      {
        id: "dsp_1",
        merchantId: "1",
        transactionId: "tx_1234567890",
        amount: 5000,
        reason: "product_not_received",
        status: "needs_response",
        evidenceDueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
        createdDate: new Date().toISOString(),
      },
    ];
  }

  private seedKamResellerMerchants() {
    const apexMerchants: Array<{
      id: string;
      name: string;
      storeId: string;
      sector: string;
      status: Merchant["status"];
      onboardingDate: string;
      contactName: string;
      contactPhone: string;
      gmv30d: number;
      isNonTransacting: boolean;
    }> = [
      {
        id: "101",
        name: "Apex Electronics Ltd",
        storeId: "mid_902831",
        sector: "Retail",
        status: "active",
        onboardingDate: "2025-10-12",
        contactName: "Sajid Hossain",
        contactPhone: "+880 1711 000123",
        gmv30d: 1840000,
        isNonTransacting: false,
      },
      {
        id: "102",
        name: "Blue Ribbon Cafe",
        storeId: "mid_112094",
        sector: "Hospitality",
        status: "onboarding",
        onboardingDate: "2025-11-04",
        contactName: "Tasnim Ahmed",
        contactPhone: "+880 1822 988102",
        gmv30d: 420000,
        isNonTransacting: true,
      },
      {
        id: "103",
        name: "Global Logistics Hub",
        storeId: "mid_440292",
        sector: "Logistics",
        status: "inactive",
        onboardingDate: "2025-11-21",
        contactName: "Rezwana Karim",
        contactPhone: "+880 1755 776611",
        gmv30d: 910000,
        isNonTransacting: true,
      },
      {
        id: "104",
        name: "Sundarban Travels",
        storeId: "mid_559013",
        sector: "Travel",
        status: "active",
        onboardingDate: "2025-12-02",
        contactName: "Imran Khan",
        contactPhone: "+880 1933 559013",
        gmv30d: 2250000,
        isNonTransacting: false,
      },
      {
        id: "105",
        name: "Padma Garments",
        storeId: "mid_660901",
        sector: "Garments",
        status: "suspended",
        onboardingDate: "2025-12-09",
        contactName: "Nusrat Jahan",
        contactPhone: "+880 1622 660901",
        gmv30d: 0,
        isNonTransacting: true,
      },
      {
        id: "106",
        name: "Dhaka Tech Mart",
        storeId: "mid_771203",
        sector: "Technology",
        status: "active",
        onboardingDate: "2025-12-14",
        contactName: "Arif Chowdhury",
        contactPhone: "+880 1511 771203",
        gmv30d: 3120000,
        isNonTransacting: false,
      },
      {
        id: "107",
        name: "Meghna Pharma",
        storeId: "mid_883451",
        sector: "Healthcare",
        status: "active",
        onboardingDate: "2025-12-18",
        contactName: "Layla Akter",
        contactPhone: "+880 1699 112233",
        gmv30d: 1450000,
        isNonTransacting: false,
      },
      {
        id: "108",
        name: "EduNext Academy",
        storeId: "mid_994502",
        sector: "Education",
        status: "onboarding",
        onboardingDate: "2025-12-22",
        contactName: "Zahir Huda",
        contactPhone: "+880 1788 994502",
        gmv30d: 0,
        isNonTransacting: true,
      },
    ];

    const kamMerchants: Merchant[] = apexMerchants.map((merchant) => ({
      id: merchant.id,
      name: merchant.name,
      storeId: merchant.storeId,
      ownerName: "Md. Rahim Uddin",
      status: merchant.status,
      sector: merchant.sector,
      lastTransactionDate: new Date().toISOString(),
      gmv7d: Math.round(merchant.gmv30d / 4),
      gmv30d: merchant.gmv30d,
      gmvTrend: merchant.status === "active" ? 12 : 0,
      txCount7d: merchant.gmv30d > 0 ? Math.round(merchant.gmv30d / 1500) : 0,
      txCount30d: merchant.gmv30d > 0 ? Math.round(merchant.gmv30d / 400) : 0,
      txCountTrend: merchant.status === "active" ? 8 : 0,
      revenue7d: Math.round(merchant.gmv30d * 0.012),
      revenue30d: Math.round(merchant.gmv30d * 0.048),
      revenueTrend: merchant.status === "active" ? 10 : 0,
      successRate7d:
        merchant.status === "active"
          ? 94
          : merchant.status === "onboarding"
            ? 0
            : 82,
      topFailureReason:
        merchant.status === "active" ? "N/A" : "Pending Onboarding",
      isNonTransacting: merchant.isNonTransacting,
      onboardingDate: merchant.onboardingDate,
      type: "Online",
      contactName: merchant.contactName,
      contactPhone: merchant.contactPhone,
      contactFax: "N/A",
      contactCountry: "Bangladesh",
      addedBy: "Apex Trading Ltd",
      updatedBy: "KAM System",
      updatedOn: new Date().toISOString(),
      techSupportBy: "SSL Support",
      salesforce: "N/A",
      hunter: "Apex Trading Ltd",
      incubator: "N/A",
      introducerKam: "Md. Rahim Uddin",
      currentKam: "Md. Rahim Uddin",
      customerPayTdr: true,
      emiStatus: "Enabled",
    }));

    this.data.merchants.push(...kamMerchants);
  }

  private seedMerchantTickets() {
    this.data.merchantTickets = [
      {
        id: "mt_414",
        ticketNo: "ZGJBWX102846",
        title: "test ticket 3",
        description: "Merchant Ticket Update P9XCPO102210",
        attachment:
          "raiseRequirement/dxzmIYlwidoWnkuGw2r8dcU9zEhNinBQnbaAroqn.jpg",
        attachmentUrl:
          "https://uat-merchant-revamp-api.sslcommerz.com/storage/raiseRequirement/dxzmIYlwidoWnkuGw2r8dcU9zEhNinBQnbaAroqn.jpg",
        issueType: "emi_related_query",
        issueTypeLabel: "Emi Related Query",
        merchantId: 4952,
        merchantMid: 4952,
        merchantMsslid: "googlehtxtrxtextrxlive",
        merchantCompanyName: "WELCOME ELECTRONICS googlehtxtrxtextrx",
        merchantContactMobile: "01908000122",
        createdBy: 54984,
        createdByFullName: "Nahid Hasan Limon  ",
        createdByEmail: "tanzilur.rahman@sslwireless.com",
        createdByMobile: "8801715943783",
        kamFullName: "Nahid Hasan KAM",
        kamEmail: "nhlimon.ssl2@gmail.com",
        resolvedBy: 55129,
        resolvedByFullName: "Tanzil  Rahaman",
        resolvedByEmail: "tanzil.hasan@ssliwireless.com",
        resolvedByMobile: "+8801628781323",
        remarks: "Merchant Ticket Update P9XCPO102210",
        status: 2,
        statusLabel: "Declined",
        createdAt: "2026-04-12 10:28:46",
        updatedAt: "2026-04-12 10:29:28",
        resolvedAt: "2026-04-12 10:29:28",
      },
      {
        id: "mt_413",
        ticketNo: "WSFZJT102722",
        title: "test ticket 2",
        description: "Merchant Ticket Update P9XCPO102210",
        attachment:
          "raiseRequirement/A5a9fvZKOALBkRsX7WkyPzkHUwnRbrJbNhlJthwL.pdf",
        attachmentUrl:
          "https://uat-merchant-revamp-api.sslcommerz.com/storage/raiseRequirement/A5a9fvZKOALBkRsX7WkyPzkHUwnRbrJbNhlJthwL.pdf",
        issueType: "others",
        issueTypeLabel: "Others",
        merchantId: 4952,
        merchantMid: 4952,
        merchantMsslid: "googlehtxtrxtextrxlive",
        merchantCompanyName: "WELCOME ELECTRONICS googlehtxtrxtextrx",
        merchantContactMobile: "01908000122",
        createdBy: 54984,
        createdByFullName: "Nahid Hasan Limon  ",
        createdByEmail: "tanzilur.rahman@sslwireless.com",
        createdByMobile: "8801715943783",
        kamFullName: "Nahid Hasan KAM",
        kamEmail: "nhlimon.ssl2@gmail.com",
        resolvedBy: 55129,
        resolvedByFullName: "Tanzil  Rahaman",
        resolvedByEmail: "tanzil.hasan@ssliwireless.com",
        resolvedByMobile: "+8801628781323",
        remarks: "Merchant Ticket Update P9XCPO102210",
        status: 3,
        statusLabel: "Completed",
        createdAt: "2026-04-12 10:27:22",
        updatedAt: "2026-04-12 10:28:02",
        resolvedAt: "2026-04-12 10:28:02",
      },
      {
        id: "mt_412",
        ticketNo: "P9XCPO102210",
        title: "Test ticket",
        description:
          "We accept only PDF, JPG, JPEG, PNG files, and File size should not exceed 2MB We accept only PDF, JPG, JPEG, PNG files, and File size should not exceed 2MB We accept only PDF, JPG, JPEG, PNG files, and File size should not exceed 2MB\r\nWe accept only PDF, JPG, JPEG, PNG files, and File size should not exceed 2MB",
        attachment:
          "raiseRequirement/P7T2eXvrL927TfrVeUoddSGr3ahCUMOFLj9E2dC1.jpg",
        attachmentUrl:
          "https://uat-merchant-revamp-api.sslcommerz.com/storage/raiseRequirement/P7T2eXvrL927TfrVeUoddSGr3ahCUMOFLj9E2dC1.jpg",
        issueType: "payment_gateway",
        issueTypeLabel: "Payment Gateway",
        merchantId: 4952,
        merchantMid: 4952,
        merchantMsslid: "googlehtxtrxtextrxlive",
        merchantCompanyName: "WELCOME ELECTRONICS googlehtxtrxtextrx",
        merchantContactMobile: "01908000122",
        createdBy: 54984,
        createdByFullName: "Nahid Hasan Limon  ",
        createdByEmail: "tanzilur.rahman@sslwireless.com",
        createdByMobile: "8801715943783",
        kamFullName: "Nahid Hasan KAM",
        kamEmail: "nhlimon.ssl2@gmail.com",
        resolvedBy: 55129,
        resolvedByFullName: "Tanzil  Rahaman",
        resolvedByEmail: "tanzil.hasan@ssliwireless.com",
        resolvedByMobile: "+8801628781323",
        remarks: "Merchant Ticket Update P9XCPO102210",
        status: 3,
        statusLabel: "Completed",
        createdAt: "2026-04-12 10:22:10",
        updatedAt: "2026-04-12 10:26:38",
        resolvedAt: "2026-04-12 10:26:38",
      },
    ];
  }
  private seedTransactionLogs() {
    const stages = [
      "api (request)",
      "api (response)",
      "success (redirect)",
      "ipn request",
      "ipn return",
      "validation",
      "agreement",
    ];

    this.data.transactions.forEach((txn) => {
      const logsCount = Math.floor(Math.random() * 5) + 5;
      const startTime = new Date(txn.date).getTime();

      for (let i = 0; i < logsCount; i++) {
        const stageIdx = Math.min(i, stages.length - 1);
        const statusSuffix = Math.random() > 0.8 ? " FAILED" : " SUCCESS";
        const description =
          i === 0
            ? `Initiating transaction request for ${txn.amount} ${txn.currency}. Payload: {"store_id": "${txn.storeId}", "total_amount": ${txn.amount}}`
            : `Processing stage ${stages[stageIdx]}${statusSuffix}. Result: Transaction is VALID.`;

        this.data.transactionLogs.push({
          id: `log_${txn.id}_${i}`,
          transactionId: txn.id,
          logsOn: new Date(startTime + i * 1000).toISOString(),
          stage: stages[stageIdx],
          ip: txn.ipAddress || "103.1.2.3",
          description: description,
        });

        // Also add some logs for the alternative IP in detail view if available
        if (Math.random() > 0.5) {
          this.data.transactionLogs.push({
            id: `log_alt_${txn.id}_${i}`,
            transactionId: txn.id,
            logsOn: new Date(startTime + i * 1000 + 500).toISOString(),
            stage: stages[stageIdx],
            ip: "192.168.1.1",
            description: `Alt IP log for ${stages[stageIdx]}. Source IP: 192.168.1.1`,
          });
        }
      }
    });
  }

  private seedMerchantUsers() {
    this.data.merchantUsers = [
      {
        id: "mu_1",
        merchantId: "1",
        loginId: "8801304111111",
        password: "•••••",
        role: "Merchant Admin",
        firstName: "Welcome",
        lastName: "Electronic",
        email: "01304111111@gmail.com",
        mobile: "01304111111",
        phone: "N/A",
        status: "Active",
        addedBy: "Admin",
        addedOn: "2026-01-19 11:08:22",
      },
      {
        id: "mu_2",
        merchantId: "1",
        loginId: "8801700000002",
        password: "•••••",
        role: "Merchant User",
        firstName: "Test",
        lastName: "User 2",
        email: "testuser2@example.com",
        mobile: "01700000002",
        status: "Active",
        addedBy: "mu_1",
        addedOn: "2026-02-01 10:30:15",
      },
      {
        id: "mu_3",
        merchantId: "7",
        loginId: "8801810012003",
        password: "•••••",
        role: "Merchant Admin",
        firstName: "Welcome",
        lastName: "Electronic",
        email: "01810012003@gmail.com",
        mobile: "01810012003",
        status: "Active",
        addedBy: "Admin",
        addedOn: "2025-12-15 09:15:00",
      },
    ];
  }
}

export const db = new MockDatabase();
