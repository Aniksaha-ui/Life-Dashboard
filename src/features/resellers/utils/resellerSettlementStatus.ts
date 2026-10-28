import { STATUS_BADGE_CLASS } from "../../../utils/statusBadge";
import type {
  ResellerSettlementPaymentStatus,
  ResellerSettlementStatus,
} from "../types/resellerSettlement";

export function getResellerSettlementPaymentStatusClass(
  status: ResellerSettlementPaymentStatus | string,
): string {
  switch (status) {
    case "Settled":
      return "bg-emerald-50 text-emerald-600";
    case "Not Settled":
      return "bg-amber-50 text-amber-600";
    case "Processing":
      return "bg-blue-50 text-blue-600";
    case "On Hold":
      return "bg-rose-50 text-rose-600";
    default:
      return "bg-slate-100 text-slate-500";
  }
}

export function getResellerSettlementPaymentStatusBadgeClass(
  status: ResellerSettlementPaymentStatus | string,
): string {
  return `${STATUS_BADGE_CLASS} ${getResellerSettlementPaymentStatusClass(status)}`;
}

export function getResellerSettlementStatusClass(
  status: ResellerSettlementStatus | string,
): string {
  switch (status) {
    case "SETTLED":
      return "bg-emerald-50 text-emerald-600";
    case "INITIATE":
      return "bg-amber-50 text-amber-600";
    case "PROCESSING":
      return "bg-blue-50 text-blue-600";
    case "FAILED":
      return "bg-rose-50 text-rose-600";
    default:
      return "bg-slate-100 text-slate-500";
  }
}

export function getResellerSettlementStatusBadgeClass(
  status: ResellerSettlementStatus | string,
): string {
  return `${STATUS_BADGE_CLASS} ${getResellerSettlementStatusClass(status)}`;
}
