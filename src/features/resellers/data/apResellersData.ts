import type {
  ApReseller,
  RaApprovalStatus,
  SettlementPeriod,
} from "../types/apReseller";
import {
  getApPendingReason,
  getApRejectedReason,
} from "../utils/resellerPendingReasons";
import { createDocuments } from "./opResellersData";

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

const SETTLEMENT_PERIODS: SettlementPeriod[] = [
  "Daily",
  "Weekly",
  "Bi-weekly",
  "Monthly",
];

const RA_STATUSES: RaApprovalStatus[] = [
  "Not Requested",
  "Pending",
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

const BANKS = [
  "City Bank",
  "Dutch-Bangla Bank",
  "BRAC Bank",
  "Eastern Bank",
  "Islami Bank",
  "Pubali Bank",
];

function createApReseller(name: string, index: number): ApReseller {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  let raApprovalStatus = RA_STATUSES[index % RA_STATUSES.length];
  if (name === "SSL Partner Network") {
    raApprovalStatus = "Settlement Done";
  }

  return {
    id: String(index + 1),
    resellerId: `AP-${String(301 + index).padStart(3, "0")}`,
    name,
    sector: SECTORS[index % SECTORS.length],
    website: `https://www.${slug}.com`,
    pocName: POC_NAMES[index % POC_NAMES.length],
    pocEmail: `${slug.split("-")[0]}@example.com`,
    pocPhone: `+880 1711 ${String(300000 + index).slice(-6)}`,
    onboardingDate: new Date(
      Date.now() - (index + 1) * 86400000 * 18,
    ).toISOString(),
    settlementPeriod: SETTLEMENT_PERIODS[index % SETTLEMENT_PERIODS.length],
    address: `${18 + index}, Banani, Dhaka`,
    email: `accounts@${slug}.com`,
    phone: `+880 1811 ${String(400000 + index).slice(-6)}`,
    bankName: BANKS[index % BANKS.length],
    accountName: name,
    accountNumber: `****${String(10000000 + index).slice(-4)}`,
    routingNumber: `0${String(200000 + index).slice(-5)}`,
    raApprovalStatus,
    pendingReason: getApPendingReason(raApprovalStatus, index),
    rejectedReason: getApRejectedReason(raApprovalStatus, index),
    documents: createDocuments(
      raApprovalStatus === "Not Requested" ? "Pending" : raApprovalStatus,
      index,
    ),
  };
}

let apResellersStore: ApReseller[] = RESELLER_NAMES.map(createApReseller);

export function listApResellers(): ApReseller[] {
  return [...apResellersStore];
}

export function getApResellerById(id: string): ApReseller | undefined {
  return apResellersStore.find((reseller) => reseller.id === id);
}

export function requestApRaApproval(id: string): ApReseller | undefined {
  const index = apResellersStore.findIndex((reseller) => reseller.id === id);
  if (index < 0) return undefined;

  apResellersStore[index] = {
    ...apResellersStore[index],
    raApprovalStatus: "Pending",
    pendingReason: getApPendingReason("Pending", index),
    rejectedReason: undefined,
    documents: createDocuments("Pending", index),
  };
  return apResellersStore[index];
}

export function initiateApSettlement(id: string): ApReseller | undefined {
  const index = apResellersStore.findIndex((reseller) => reseller.id === id);
  if (index < 0) return undefined;

  apResellersStore[index] = {
    ...apResellersStore[index],
    raApprovalStatus: "Settlement Initiate",
  };
  return apResellersStore[index];
}
