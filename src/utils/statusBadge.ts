export const STATUS_BADGE_CLASS =
  "px-2 py-0.5 rounded-full text-xs font-medium capitalize whitespace-nowrap inline-block";

export function getYesNoStatusClass(value: string): string {
  return value === "Yes"
    ? "bg-emerald-50 text-emerald-600"
    : "bg-amber-50 text-amber-600";
}

export function getActiveInactiveStatusClass(status: string): string {
  switch (status) {
    case "Active":
      return "bg-emerald-50 text-emerald-600";
    case "De-active":
    case "Inactive":
      return "bg-rose-50 text-rose-600";
    default:
      return "bg-slate-100 text-slate-500";
  }
}

export function getEmailLogStatusClass(status: string): string {
  switch (status) {
    case "sent":
      return "bg-emerald-50 text-emerald-600";
    case "failed":
      return "bg-rose-50 text-rose-600";
    case "initial":
      return "bg-amber-50 text-amber-600";
    default:
      return "bg-slate-100 text-slate-500";
  }
}
