import type { KamResellerStatus } from "../types/kamReseller";
import type { OpResellerStatus } from "../types/opReseller";
import type { RaApprovalStatus } from "../types/apReseller";
import type { RaResellerApprovalStatus } from "../types/raReseller";

const KAM_PENDING_REASONS = [
  "Awaiting merchant portfolio verification.",
  "POC contact details need confirmation.",
  "Onboarding checklist is incomplete.",
  "Reseller agreement is pending review.",
];

const OP_PENDING_REASONS: Record<"Pending" | "Uploaded", string> = {
  Pending: "Uploaded documents are awaiting operation team review.",
  Uploaded: "All required onboarding documents have been uploaded.",
};

const AP_PENDING_REASONS = [
  "Settlement account details submitted for RA approval review.",
  "Bank account verification is pending with RA team.",
  "Settlement period change is awaiting RA confirmation.",
];

const RA_PENDING_REASONS = [
  "Settlement request is awaiting RA approval.",
  "Bank account details require RA verification.",
  "Settlement period update is pending RA review.",
];

const KAM_REJECTED_REASONS = [
  "Merchant portfolio verification did not meet requirements.",
  "POC contact details could not be verified.",
  "Onboarding checklist remains incomplete.",
  "Reseller agreement was not accepted.",
];

const OP_REJECTED_REASONS = [
  "Uploaded documents did not pass operation review.",
  "Submitted documents are invalid or incomplete.",
  "Reseller information mismatch found during verification.",
];

const AP_REJECTED_REASONS = [
  "Settlement account details were rejected by RA team.",
  "Bank account verification failed.",
  "Settlement period request was not approved.",
];

const RA_REJECTED_REASONS = [
  "Settlement request was rejected after RA review.",
  "Bank account details failed RA verification.",
  "Settlement period update was not approved.",
];

export function getKamPendingReason(
  status: KamResellerStatus,
  index = 0,
): string | undefined {
  if (status !== "Pending") return undefined;
  return KAM_PENDING_REASONS[index % KAM_PENDING_REASONS.length];
}

export function getOpPendingReason(
  status: OpResellerStatus,
): string | undefined {
  if (status === "Pending" || status === "Uploaded") {
    return OP_PENDING_REASONS[status];
  }
  return undefined;
}

export function getApPendingReason(
  status: RaApprovalStatus,
  index = 0,
): string | undefined {
  if (status !== "Pending") return undefined;
  return AP_PENDING_REASONS[index % AP_PENDING_REASONS.length];
}

export function getRaPendingReason(
  status: RaResellerApprovalStatus,
  index = 0,
): string | undefined {
  if (status !== "Pending") return undefined;
  return RA_PENDING_REASONS[index % RA_PENDING_REASONS.length];
}

export function getKamRejectedReason(
  status: KamResellerStatus,
  index = 0,
): string | undefined {
  if (status !== "Rejected") return undefined;
  return KAM_REJECTED_REASONS[index % KAM_REJECTED_REASONS.length];
}

export function getOpRejectedReason(
  status: OpResellerStatus,
  index = 0,
): string | undefined {
  if (status !== "Rejected") return undefined;
  return OP_REJECTED_REASONS[index % OP_REJECTED_REASONS.length];
}

export function getApRejectedReason(
  status: RaApprovalStatus,
  index = 0,
): string | undefined {
  if (status !== "Rejected") return undefined;
  return AP_REJECTED_REASONS[index % AP_REJECTED_REASONS.length];
}

export function getRaRejectedReason(
  status: RaResellerApprovalStatus,
  index = 0,
): string | undefined {
  if (status !== "Rejected") return undefined;
  return RA_REJECTED_REASONS[index % RA_REJECTED_REASONS.length];
}
