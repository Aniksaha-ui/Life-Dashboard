import type {
  OpReseller,
  OpResellerDocument,
  OpResellerMerchant,
  OpResellerMerchantStatus,
  OpResellerSettlementLedgerRow,
  OpResellerSettlements,
  OpResellerSettlementStatus,
  OpResellerStatus,
  OpResellerTransactionOverview,
} from "../types/opReseller";
import {
  getOpPendingReason,
  getOpRejectedReason,
} from "../utils/resellerPendingReasons";

const SECTORS = [
  "Pureplay Ecommerce",
  "Education",
  "Healthcare",
  "Travel & Tourism",
  "Food & Beverage",
  "Financial Services",
  "Telecom",
  "Retail",
] as const;

const DOCUMENT_TEMPLATES = [
  "Trade License",
  "NID Copy",
  "Bank Statement",
  "TIN Certificate",
] as const;

const STATUSES: OpResellerStatus[] = [
  "Pending",
  "Uploaded",
  "Approved",
  "Rejected",
];

const RESELLER_NAMES = [
  "Apex Trading Ltd",
  "Digital Bridge Partners",
  "Commerce Hub BD",
  "PayLink Reseller",
  "FinEdge Solutions",
  "Merchant Connect Ltd",
  "SSL Partner Network",
  "Gateway Alliance",
  "Transact Pro BD",
  "Ecom Velocity",
  "Payment Sphere",
  "Retail Nexus",
];

const POC_NAMES = [
  "Md. Rahim Uddin",
  "Sadia Rahman",
  "Karim Hassan",
  "Nusrat Jahan",
  "Imran Ahmed",
  "Farhana Begum",
  "Tanvir Islam",
  "Mousumi Das",
];

const MERCHANT_SERVICES = [
  "B2C Product Shipments",
  "B2B Wholesale",
  "Payment gateway reseller",
  "Merchant onboarding",
  "Digital wallet distribution",
] as const;

const MERCHANT_SECTORS = [
  "Retail",
  "Hospitality",
  "Logistics",
  "Travel",
  "Garments",
  "Technology",
  "Healthcare",
  "Education",
  "Finance",
  "Other",
] as const;

const MERCHANT_STATUSES: OpResellerMerchantStatus[] = [
  "Active",
  "Active",
  "Pending",
  "Inactive",
  "Rejected",
];

const MERCHANT_NAMES = [
  "Bright Mart",
  "Urban Threads BD",
  "QuickCart Express",
  "Coastal Traders",
  "Nova Electronics",
  "Greenfield Grocers",
  "Metro Fashion House",
  "Skyline Logistics",
];

const MERCHANT_POC_NAMES = [
  "Shakil Ahmed",
  "Rumana Akter",
  "Faisal Hossain",
  "Nadia Islam",
  "Ovi Chowdhury",
  "Sumaiya Kabir",
];

function createOpResellerMerchants(
  resellerIndex: number,
): OpResellerMerchant[] {
  const count = 3 + (resellerIndex % 4);

  return Array.from({ length: count }, (_, merchantIndex) => {
    const globalIndex = resellerIndex * 5 + merchantIndex;
    const name = `${MERCHANT_NAMES[globalIndex % MERCHANT_NAMES.length]} ${resellerIndex + 1}-${merchantIndex + 1}`;
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const pocName = MERCHANT_POC_NAMES[globalIndex % MERCHANT_POC_NAMES.length];

    return {
      id: `op-merchant-${resellerIndex + 1}-${merchantIndex + 1}`,
      name,
      pocName,
      pocEmail: `${pocName.toLowerCase().replace(/\s+/g, ".")}@${slug}.com`,
      pocPhone: `+880 19${String(10000000 + globalIndex).slice(-8)}`,
      service: MERCHANT_SERVICES[globalIndex % MERCHANT_SERVICES.length],
      sector: MERCHANT_SECTORS[globalIndex % MERCHANT_SECTORS.length],
      invitedAt: new Date(
        Date.now() - (merchantIndex + 1) * 86400000 * 5,
      ).toISOString(),
      status: MERCHANT_STATUSES[globalIndex % MERCHANT_STATUSES.length],
    };
  });
}

const SETTLEMENT_STATUSES: OpResellerSettlementStatus[] = [
  "Paid",
  "Pending",
  "Processing",
  "Paid",
  "On Hold",
  "Paid",
];

const SETTLEMENT_RATES = [0.25, 0.3, 0.35, 0.4, 0.45, 0.5];

function createPeriodLabels(count: number): string[] {
  const labels: string[] = [];
  const now = new Date();
  for (let i = 0; i < count; i += 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(
      date.toLocaleDateString("en-GB", {
        month: "short",
        year: "numeric",
      }),
    );
  }
  return labels;
}

function createOpResellerSettlements(
  resellerIndex: number,
  merchants: OpResellerMerchant[],
): OpResellerSettlements {
  const periodLabels = createPeriodLabels(12);
  const activeMerchants = merchants.length
    ? merchants
    : [
        {
          name: `Merchant ${resellerIndex + 1}`,
          id: `fallback-${resellerIndex}`,
        } as OpResellerMerchant,
      ];

  const ledger: OpResellerSettlementLedgerRow[] = [];
  periodLabels.slice(0, 3).forEach((periodLabel, periodIndex) => {
    activeMerchants.forEach((merchant, merchantIndex) => {
      const seed = resellerIndex * 31 + periodIndex * 7 + merchantIndex;
      const txnVolume = 120000 + (seed % 18) * 45000;
      const ratePercent = SETTLEMENT_RATES[seed % SETTLEMENT_RATES.length];
      const commission = Math.round((txnVolume * ratePercent) / 100);

      ledger.push({
        id: `settlement-${resellerIndex + 1}-${periodIndex + 1}-${merchantIndex + 1}`,
        merchantName: merchant.name,
        mid: `MID-${String(902831 + resellerIndex * 10 + merchantIndex).padStart(6, "0")}`,
        txnVolume,
        ratePercent,
        commission,
        status: SETTLEMENT_STATUSES[seed % SETTLEMENT_STATUSES.length],
        periodLabel,
      });
    });
  });

  const trend = [...periodLabels].reverse().map((month, index) => {
    const base = 220000 + resellerIndex * 18000;
    const wave = Math.sin(index / 2) * 40000;
    const growth = index * 12000;
    return {
      month,
      commission: Math.max(80000, Math.round(base + wave + growth)),
    };
  });

  const mtdLedger = ledger.filter((row) => row.periodLabel === periodLabels[0]);
  const mtdEarnings = mtdLedger.reduce((sum, row) => sum + row.commission, 0);
  const pendingSettlement = ledger
    .filter((row) => row.status === "Pending" || row.status === "Processing")
    .reduce((sum, row) => sum + row.commission, 0);
  const totalPaidLifetime =
    trend.reduce((sum, point) => sum + point.commission, 0) +
    Math.round(180000 + resellerIndex * 25000);

  return {
    mtdEarnings,
    mtdChangePercent: Number(
      (8 + (resellerIndex % 12) + (resellerIndex % 3) * 0.4).toFixed(1),
    ),
    pendingSettlement,
    pendingClearsOn: new Date(Date.now() + 7 * 86400000).toISOString(),
    totalPaidLifetime,
    lifetimeMonths: 12 + (resellerIndex % 8),
    trend,
    ledger,
  };
}

function createOpResellerTransactionOverview(
  resellerIndex: number,
): OpResellerTransactionOverview {
  const daily = Array.from({ length: 30 }, (_, offset) => {
    const day = new Date();
    day.setHours(12, 0, 0, 0);
    day.setDate(day.getDate() - (29 - offset));
    const seed = resellerIndex * 17 + offset;
    const wave = Math.sin(offset / 4) * 180000;
    const growth = offset * 8500;
    const volume = Math.max(
      95000,
      Math.round(
        420000 + resellerIndex * 28000 + wave + growth + (seed % 7) * 22000,
      ),
    );
    const count = Math.max(
      40,
      Math.round(volume / (2800 + (seed % 5) * 120) + (seed % 9) * 8),
    );

    return {
      date: day.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      volume,
      count,
    };
  });

  const firstHalfVolume = daily
    .slice(0, 15)
    .reduce((sum, point) => sum + point.volume, 0);
  const secondHalfVolume = daily
    .slice(15)
    .reduce((sum, point) => sum + point.volume, 0);
  const firstHalfCount = daily
    .slice(0, 15)
    .reduce((sum, point) => sum + point.count, 0);
  const secondHalfCount = daily
    .slice(15)
    .reduce((sum, point) => sum + point.count, 0);

  const volumeChangePercent = firstHalfVolume
    ? Number(
        (
          ((secondHalfVolume - firstHalfVolume) / firstHalfVolume) *
          100
        ).toFixed(1),
      )
    : 0;
  const countChangePercent = firstHalfCount
    ? Number(
        (((secondHalfCount - firstHalfCount) / firstHalfCount) * 100).toFixed(
          1,
        ),
      )
    : 0;

  return {
    volumeChangePercent,
    countChangePercent,
    daily,
    paymentDistribution: [
      { name: "VISA", value: 45 + (resellerIndex % 4), color: "#1D39C4" },
      { name: "SHAMADHAN", value: 20 + (resellerIndex % 3), color: "#8C8C8C" },
      { name: "BKASH", value: 18 + (resellerIndex % 2), color: "#E61973" },
      { name: "MASTER", value: 10 + (resellerIndex % 3), color: "#FA6400" },
      { name: "RUPALICASH", value: 5 + (resellerIndex % 2), color: "#BFBFBF" },
    ],
  };
}

const DOCUMENT_IMAGE_SOURCES = [
  "https://images.unsplash.com/photo-1554224155-6726b3ff858f",
  "https://images.unsplash.com/photo-1450101499163-c8848c66ca85",
  "https://images.unsplash.com/photo-1586281380349-632531db7ed4",
  "https://images.unsplash.com/photo-1568667256549-094345857637",
] as const;

function getDocumentImageUrls(docIndex: number) {
  const base = DOCUMENT_IMAGE_SOURCES[docIndex % DOCUMENT_IMAGE_SOURCES.length];
  return {
    thumbnailUrl: `${base}?w=120&h=120&fit=crop&auto=format`,
    fileUrl: `${base}?w=1920&h=1280&fit=crop&auto=format&q=80`,
  };
}

/** Source sample PDF provided for OP reseller documents. */
export const SAMPLE_PDF_URL =
  "https://file-examples.com/storage/feff37bd586a559e3987f73/2017/10/file-sample_150kB.pdf";

/**
 * Local copy used for in-app thumbnail + full preview.
 * Remote host blocks iframe embedding (X-Frame-Options).
 */
export const SAMPLE_PDF_PREVIEW_URL = "/samples/file-sample_150kB.pdf";

export function createDocuments(
  status: OpResellerStatus,
  index: number,
): OpResellerDocument[] {
  const uploadedCount =
    status === "Pending" ||
    status === "Uploaded" ||
    status === "Approved" ||
    status === "Rejected"
      ? 4
      : Math.max(1, Math.min(index % 3, 2));

  return DOCUMENT_TEMPLATES.map((name, docIndex) => {
    const isUploaded = docIndex < uploadedCount;
    const fileType: OpResellerDocument["fileType"] =
      docIndex % 2 === 0 ? "image" : "pdf";
    const extension = fileType === "image" ? "jpg" : "pdf";
    const imageUrls =
      fileType === "image" ? getDocumentImageUrls(docIndex) : null;
    const uploadedAt = isUploaded
      ? new Date(Date.now() - (docIndex + 1) * 86400000 * 3).toISOString()
      : undefined;
    const actionedAt =
      isUploaded && (status === "Approved" || status === "Rejected")
        ? new Date(Date.now() - (docIndex + 1) * 86400000).toISOString()
        : undefined;
    const rejectedReason =
      status === "Rejected" && isUploaded
        ? getOpRejectedReason("Rejected", index + docIndex)
        : undefined;
    const documentStatus: OpResellerDocument["status"] = !isUploaded
      ? "Missing"
      : status === "Approved"
        ? "Accepted"
        : status === "Rejected"
          ? "Rejected"
          : "Uploaded";

    const logs: OpResellerDocument["logs"] = [];
    if (isUploaded && uploadedAt) {
      logs.push({
        id: `doc-log-${index + 1}-${docIndex + 1}-upload`,
        action: "Uploaded",
        remarks: "Document uploaded for review.",
        performedBy: "Reseller",
        performedAt: uploadedAt,
      });
    }
    if (documentStatus === "Accepted" && actionedAt) {
      logs.unshift({
        id: `doc-log-${index + 1}-${docIndex + 1}-accepted`,
        action: "Accepted",
        remarks: "Document accepted by operation team.",
        performedBy: "Operation",
        performedAt: actionedAt,
      });
    }
    if (documentStatus === "Rejected" && actionedAt) {
      logs.unshift({
        id: `doc-log-${index + 1}-${docIndex + 1}-rejected`,
        action: "Rejected",
        remarks: rejectedReason || "Document rejected by operation team.",
        performedBy: "Operation",
        performedAt: actionedAt,
      });
    }

    return {
      id: `doc-${index + 1}-${docIndex + 1}`,
      name,
      fileName: isUploaded
        ? `${name.toLowerCase().replace(/\s+/g, "-")}-${index + 1}.${extension}`
        : "",
      fileType,
      fileUrl: isUploaded
        ? fileType === "pdf"
          ? SAMPLE_PDF_URL
          : imageUrls?.fileUrl
        : undefined,
      thumbnailUrl: isUploaded
        ? fileType === "pdf"
          ? SAMPLE_PDF_PREVIEW_URL
          : imageUrls?.thumbnailUrl
        : undefined,
      uploadedAt,
      actionedAt,
      status: documentStatus,
      rejectedReason,
      logs,
    };
  });
}

function createOpReseller(name: string, index: number): OpReseller {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const status = STATUSES[index % STATUSES.length];
  const merchants = createOpResellerMerchants(index);

  return {
    id: String(index + 1),
    resellerId: `OP-${String(201 + index).padStart(3, "0")}`,
    name,
    sector: SECTORS[index % SECTORS.length],
    website: `https://www.${slug}.com`,
    pocName: POC_NAMES[index % POC_NAMES.length],
    pocEmail: `${slug.split("-")[0]}@example.com`,
    pocPhone: `+880 1711 ${String(100000 + index).slice(-6)}`,
    onboardingDate: new Date(
      Date.now() - (index + 1) * 86400000 * 21,
    ).toISOString(),
    status,
    pendingReason: getOpPendingReason(status),
    rejectedReason: getOpRejectedReason(status, index),
    address: `${12 + index}, Gulshan Avenue, Dhaka`,
    email: `info@${slug}.com`,
    phone: `+880 1811 ${String(200000 + index).slice(-6)}`,
    documents: createDocuments(status, index),
    merchants,
    settlements: createOpResellerSettlements(index, merchants),
    transactionOverview: createOpResellerTransactionOverview(index),
  };
}

let opResellersStore: OpReseller[] = RESELLER_NAMES.map(createOpReseller);

export function listOpResellers(): OpReseller[] {
  return [...opResellersStore];
}

export function getOpResellerById(id: string): OpReseller | undefined {
  return opResellersStore.find((reseller) => reseller.id === id);
}

export function updateOpResellerStatus(
  id: string,
  status: OpResellerStatus,
  rejectedReason?: string,
): OpReseller | undefined {
  const index = opResellersStore.findIndex((reseller) => reseller.id === id);
  if (index < 0) return undefined;

  opResellersStore[index] = {
    ...opResellersStore[index],
    status,
    pendingReason:
      status === "Approved" || status === "Rejected"
        ? undefined
        : getOpPendingReason(status),
    rejectedReason:
      status === "Rejected"
        ? rejectedReason || getOpRejectedReason(status, index)
        : undefined,
    documents: createDocuments(status, index),
  };
  return opResellersStore[index];
}

export function updateOpResellerDocumentStatus(
  resellerId: string,
  documentId: string,
  status: "Accepted" | "Rejected",
  rejectedReason?: string,
): OpReseller | undefined {
  const resellerIndex = opResellersStore.findIndex(
    (reseller) => reseller.id === resellerId,
  );
  if (resellerIndex < 0) return undefined;

  const reseller = opResellersStore[resellerIndex];
  const documents = reseller.documents.map((document) => {
    if (document.id !== documentId || document.status === "Missing")
      return document;

    const actionedAt = new Date().toISOString();
    const logEntry = {
      id: `doc-log-${document.id}-${Date.now()}`,
      action: status === "Accepted" ? "Accepted" : "Rejected",
      remarks:
        status === "Accepted"
          ? "Document accepted."
          : rejectedReason?.trim() || "Document rejected.",
      performedBy: "KAM Admin",
      performedAt: actionedAt,
    };

    return {
      ...document,
      status,
      actionedAt,
      rejectedReason:
        status === "Rejected" ? rejectedReason?.trim() || undefined : undefined,
      logs: [logEntry, ...(document.logs ?? [])],
    };
  });

  opResellersStore[resellerIndex] = { ...reseller, documents };
  return opResellersStore[resellerIndex];
}

export function notifyOpReseller(
  id: string,
  _message?: string,
): OpReseller | undefined {
  const index = opResellersStore.findIndex((reseller) => reseller.id === id);
  if (index < 0) return undefined;
  return opResellersStore[index];
}
