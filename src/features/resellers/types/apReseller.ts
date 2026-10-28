import type { OpResellerDocument } from "./opReseller";

export type SettlementPeriod = "Daily" | "Weekly" | "Bi-weekly" | "Monthly";

export type RaApprovalStatus =
  | "Not Requested"
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Settlement Initiate"
  | "Settlement Done";

export interface ApReseller {
  id: string;
  resellerId: string;
  name: string;
  sector: string;
  website: string;
  pocName: string;
  pocEmail: string;
  pocPhone: string;
  onboardingDate: string;
  settlementPeriod: SettlementPeriod;
  address: string;
  email: string;
  phone: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  routingNumber: string;
  raApprovalStatus: RaApprovalStatus;
  pendingReason?: string;
  rejectedReason?: string;
  documents: OpResellerDocument[];
}
