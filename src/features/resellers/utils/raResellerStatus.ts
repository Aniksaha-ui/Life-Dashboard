import { STATUS_BADGE_CLASS } from "../../../utils/statusBadge";
import type { RaResellerApprovalStatus } from "../types/raReseller";

export function getRaResellerStatusClass(
  status: RaResellerApprovalStatus | string,
): string {
  switch (status) {
    case "Pending":
      return "bg-amber-50 text-amber-600";
    case "Approved":
      return "bg-emerald-50 text-emerald-600";
    case "Rejected":
      return "bg-rose-50 text-rose-600";
    default:
      return "bg-slate-100 text-slate-500";
  }
}

export function getRaResellerStatusBadgeClass(
  status: RaResellerApprovalStatus | string,
): string {
  return `${STATUS_BADGE_CLASS} ${getRaResellerStatusClass(status)}`;
}
