import type { ResellerAccountingRecord } from "../types/resellerAccounting";

const BANK_ACCOUNTS = [
  { id: "BA-1001", name: "Showmotion Limited" },
  { id: "BA-1002", name: "Apply BD" },
  { id: "BA-1003", name: "Apex Trading Ltd" },
  { id: "BA-1004", name: "Digital Bridge Partners" },
  { id: "BA-1005", name: "Commerce Hub BD" },
] as const;

const BANKS = [
  "STANDARD CHARTERED BANK",
  "BRAC BANK",
  "DUTCH-BANGLA BANK",
  "EASTERN BANK",
  "CITY BANK",
] as const;

const STORE_IDS = [
  "HostedCheckoutOlivephy",
  "demotest",
  "sslshop",
  "retailcheckout",
] as const;

function createAccountingRecord(index: number): ResellerAccountingRecord {
  const account = BANK_ACCOUNTS[index % BANK_ACCOUNTS.length];
  const day = 13 + (index % 16);
  const month = index % 2 === 0 ? 9 : 7;
  const year = 2016;
  const settlementDate = new Date(year, month, day).toISOString();
  const storeAmount = Number((120000 + (index % 12) * 18564.75).toFixed(2));
  const refundChargeAmount = Number((200 + (index % 8) * 108.3125).toFixed(2));
  const paidAmount = Number((storeAmount - refundChargeAmount).toFixed(2));
  const chequeRef = `Q${String(9733 + index).padStart(7, "0")}`;

  return {
    id: String(index + 1),
    settlementDate,
    bankAccountName: account.name,
    bankAccountId: account.id,
    storeId: STORE_IDS[index % STORE_IDS.length],
    storeAmount,
    refundChargeAmount,
    paidAmount,
    transactionId: `TXN-${String(500100 + index)}`,
    paymentInfo: [
      {
        id: `pay-${index + 1}-1`,
        chequeRef,
        acctPayee: account.name,
        amount: paidAmount,
        bank: BANKS[index % BANKS.length],
        attachment: undefined,
      },
    ],
  };
}

let resellerAccountingStore: ResellerAccountingRecord[] = Array.from(
  { length: 24 },
  (_, index) => createAccountingRecord(index),
);

export function listResellerAccounting(): ResellerAccountingRecord[] {
  return [...resellerAccountingStore];
}

export function getResellerAccountingById(
  id: string,
): ResellerAccountingRecord | undefined {
  return resellerAccountingStore.find((item) => item.id === id);
}
