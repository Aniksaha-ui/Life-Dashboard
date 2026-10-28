import { STATUS_BADGE_CLASS } from "../../../utils/statusBadge";
import type { KamResellerStatus } from "../types/kamReseller";

export function getKamResellerStatusClass(
  status: KamResellerStatus | string,
): string {
  switch (status) {
    case "Active":
      return "bg-emerald-50 text-emerald-600";
    case "Inactive":
      return "bg-rose-50 text-rose-600";
    case "Pending":
      return "bg-amber-50 text-amber-600";
    case "Rejected":
      return "bg-slate-100 text-slate-600";
    default:
      return "bg-slate-100 text-slate-500";
  }
}

export function getKamResellerStatusBadgeClass(
  status: KamResellerStatus | string,
): string {
  return `${STATUS_BADGE_CLASS} ${getKamResellerStatusClass(status)}`;
}
