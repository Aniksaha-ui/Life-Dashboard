import { STATUS_BADGE_CLASS } from "../../../utils/statusBadge";
import type { InviteResellerStatus } from "../types/inviteReseller";

export function getInviteResellerStatusClass(
  status: InviteResellerStatus | string,
): string {
  switch (status) {
    case "Created":
      return "bg-slate-100 text-slate-600";
    case "Invited":
      return "bg-blue-50 text-blue-600";
    case "Follow up":
      return "bg-amber-50 text-amber-600";
    case "Onboarded":
      return "bg-emerald-50 text-emerald-600";
    default:
      return "bg-slate-100 text-slate-500";
  }
}

export function getInviteResellerStatusBadgeClass(
  status: InviteResellerStatus | string,
): string {
  return `${STATUS_BADGE_CLASS} ${getInviteResellerStatusClass(status)}`;
}
