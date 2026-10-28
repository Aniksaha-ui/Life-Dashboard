import { STATUS_BADGE_CLASS } from "../../../utils/statusBadge";
import type {
  OpResellerMerchantStatus,
  OpResellerSettlementStatus,
  OpResellerStatus,
} from "../types/opReseller";

export function getOpResellerStatusClass(
  status: OpResellerStatus | string,
): string {
  switch (status) {
    case "Pending":
      return "bg-amber-50 text-amber-600";
    case "Uploaded":
      return "bg-slate-100 text-slate-600";
    case "Approved":
      return "bg-emerald-50 text-emerald-600";
    case "Rejected":
      return "bg-rose-50 text-rose-600";
    default:
      return "bg-slate-100 text-slate-500";
  }
}

export function getOpResellerStatusBadgeClass(
  status: OpResellerStatus | string,
): string {
  return `${STATUS_BADGE_CLASS} ${getOpResellerStatusClass(status)}`;
}

export function getOpResellerMerchantStatusClass(
  status: OpResellerMerchantStatus | string,
): string {
  switch (status) {
    case "Active":
      return "bg-emerald-50 text-emerald-600";
    case "Pending":
      return "bg-amber-50 text-amber-600";
    case "Inactive":
      return "bg-slate-100 text-slate-600";
    case "Rejected":
      return "bg-rose-50 text-rose-600";
    default:
      return "bg-slate-100 text-slate-500";
  }
}

export function getOpResellerMerchantStatusBadgeClass(
  status: OpResellerMerchantStatus | string,
): string {
  return `${STATUS_BADGE_CLASS} ${getOpResellerMerchantStatusClass(status)}`;
}

export function getOpResellerSettlementStatusClass(
  status: OpResellerSettlementStatus | string,
): string {
  switch (status) {
    case "Paid":
      return "bg-emerald-50 text-emerald-600";
    case "Pending":
      return "bg-amber-50 text-amber-600";
    case "Processing":
      return "bg-blue-50 text-blue-600";
    case "On Hold":
      return "bg-rose-50 text-rose-600";
    default:
      return "bg-slate-100 text-slate-500";
  }
}

export function getOpResellerSettlementStatusBadgeClass(
  status: OpResellerSettlementStatus | string,
): string {
  return `${STATUS_BADGE_CLASS} ${getOpResellerSettlementStatusClass(status)}`;
}
