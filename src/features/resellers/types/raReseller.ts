import type { SettlementPeriod } from "./apReseller";
import type { OpResellerDocument } from "./opReseller";

export type RaResellerApprovalStatus = "Pending" | "Approved" | "Rejected";

export interface RaReseller {
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
  approvalStatus: RaResellerApprovalStatus;
  pendingReason?: string;
  rejectedReason?: string;
  requestedBy: string;
  requestedOn: string;
  documents: OpResellerDocument[];
}
