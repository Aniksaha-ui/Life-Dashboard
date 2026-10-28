import type {
  ResellerSettlement,
  ResellerSettlementPaymentStatus,
  ResellerSettlementStatus,
} from "../types/resellerSettlement";

const RESELLERS = [
  { id: "RS-101", name: "Apply BD" },
  { id: "RS-102", name: "Apex Trading Ltd" },
  { id: "RS-103", name: "Digital Bridge Partners" },
  { id: "RS-104", name: "Commerce Hub BD" },
  { id: "RS-105", name: "PayLink Reseller" },
] as const;

const STORE_IDS = [
  "HostedCheckoutOlivephy",
  "demotest",
  "sslshop",
  "retailcheckout",
  "hostedpaybd",
] as const;

const PAYMENT_STATUSES: ResellerSettlementPaymentStatus[] = [
  "Not Settled",
  "Not Settled",
  "Not Settled",
  "Settled",
  "Processing",
  "On Hold",
];

const SETTLEMENT_STATUSES: ResellerSettlementStatus[] = [
  "INITIATE",
  "INITIATE",
  "PROCESSING",
  "SETTLED",
  "FAILED",
];

function createSettlement(index: number): ResellerSettlement {
  const reseller = RESELLERS[index % RESELLERS.length];
  const storeId = STORE_IDS[index % STORE_IDS.length];
  const paymentStatus = PAYMENT_STATUSES[index % PAYMENT_STATUSES.length];
  const settlementStatus =
    SETTLEMENT_STATUSES[index % SETTLEMENT_STATUSES.length];
  const dayOffset = (index % 28) + 1;
  const month = index % 2 === 0 ? 4 : 5;
  const date = new Date(2023, month, dayOffset).toISOString();
  const transactionCount = 3 + (index % 20);
  const transactionAmount = Number(
    (30 + (index % 15) * (index % 7 === 0 ? 27520 : 12.5)).toFixed(2),
  );
  const payable =
    paymentStatus === "Settled"
      ? Number((transactionAmount * 0.0025).toFixed(2))
      : Number(
          (index % 5 === 1 ? 0.06 : index % 5 === 3 ? 0.15 : 0).toFixed(2),
        );
  const createdOn = new Date(
    2023,
    5,
    Math.min(30, dayOffset + 5),
  ).toISOString();

  return {
    id: String(index + 1),
    date,
    merchantId: `MID-${String(902831 + index).padStart(6, "0")}`,
    storeId,
    resellerName: reseller.name,
    resellerId: reseller.id,
    transactionCount,
    transactionAmount,
    payable,
    deductAmount: 0,
    paymentStatus,
    missingCommissionCount:
      paymentStatus === "Not Settled" ? transactionCount : 0,
    settlementDate:
      settlementStatus === "SETTLED"
        ? new Date(2023, 5, Math.min(30, dayOffset + 8)).toISOString()
        : undefined,
    settlementStatus,
    settlementBatchNo:
      settlementStatus === "SETTLED"
        ? `BATCH-${String(1000 + index)}`
        : undefined,
    createdOn,
  };
}

let resellerSettlementsStore: ResellerSettlement[] = Array.from(
  { length: 32 },
  (_, index) => createSettlement(index),
);

export function listResellerSettlements(): ResellerSettlement[] {
  return [...resellerSettlementsStore];
}

export function getResellerSettlementById(
  id: string,
): ResellerSettlement | undefined {
  return resellerSettlementsStore.find((item) => item.id === id);
}

export function listResellerSettlementResellerOptions(): Array<{
  label: string;
  value: string;
}> {
  const unique = new Map<string, string>();
  resellerSettlementsStore.forEach((item) => {
    unique.set(item.resellerName, item.resellerName);
  });
  return [
    { label: "Select one", value: "all" },
    ...Array.from(unique.values()).map((name) => ({
      label: name,
      value: name,
    })),
  ];
}
