import type { RaReseller, RaResellerApprovalStatus } from "../types/raReseller";
import type { SettlementPeriod } from "../types/apReseller";
import {
  getRaPendingReason,
  getRaRejectedReason,
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

const APPROVAL_STATUSES: RaResellerApprovalStatus[] = [
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

const REQUESTERS = [
  "Accounts Team",
  "Settlement Ops",
  "AP Officer",
  "Finance Desk",
];

function createRaReseller(name: string, index: number): RaReseller {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const approvalStatus = APPROVAL_STATUSES[index % APPROVAL_STATUSES.length];

  return {
    id: String(index + 1),
    resellerId: `RA-${String(401 + index).padStart(3, "0")}`,
    name,
    sector: SECTORS[index % SECTORS.length],
    website: `https://www.${slug}.com`,
    pocName: POC_NAMES[index % POC_NAMES.length],
    pocEmail: `${slug.split("-")[0]}@example.com`,
    pocPhone: `+880 1711 ${String(500000 + index).slice(-6)}`,
    onboardingDate: new Date(
      Date.now() - (index + 1) * 86400000 * 14,
    ).toISOString(),
    settlementPeriod: SETTLEMENT_PERIODS[index % SETTLEMENT_PERIODS.length],
    address: `${22 + index}, Motijheel, Dhaka`,
    email: `settlement@${slug}.com`,
    phone: `+880 1811 ${String(600000 + index).slice(-6)}`,
    bankName: BANKS[index % BANKS.length],
    accountName: name,
    accountNumber: `****${String(20000000 + index).slice(-4)}`,
    routingNumber: `0${String(300000 + index).slice(-5)}`,
    approvalStatus,
    pendingReason: getRaPendingReason(approvalStatus, index),
    rejectedReason: getRaRejectedReason(approvalStatus, index),
    requestedBy: REQUESTERS[index % REQUESTERS.length],
    requestedOn: new Date(
      Date.now() - (index + 2) * 86400000 * 2,
    ).toISOString(),
    documents: createDocuments(approvalStatus, index),
  };
}

let raResellersStore: RaReseller[] = RESELLER_NAMES.map(createRaReseller);

export function listRaResellers(): RaReseller[] {
  return [...raResellersStore];
}

export function getRaResellerById(id: string): RaReseller | undefined {
  return raResellersStore.find((reseller) => reseller.id === id);
}

export function updateRaResellerStatus(
  id: string,
  approvalStatus: RaResellerApprovalStatus,
  rejectedReason?: string,
): RaReseller | undefined {
  const index = raResellersStore.findIndex((reseller) => reseller.id === id);
  if (index < 0) return undefined;

  raResellersStore[index] = {
    ...raResellersStore[index],
    approvalStatus,
    pendingReason: undefined,
    rejectedReason:
      approvalStatus === "Rejected"
        ? rejectedReason || getRaRejectedReason(approvalStatus, index)
        : undefined,
    documents: createDocuments(approvalStatus, index),
  };
  return raResellersStore[index];
}
