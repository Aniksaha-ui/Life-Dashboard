export const STATUS_BADGE_CLASS =
  "px-2 py-0.5 rounded-full text-xs font-medium capitalize whitespace-nowrap inline-block";

export function getMerchantCampaignListStatusClass(status: string): string {
  switch (status) {
    case "Running":
      return "bg-emerald-50 text-emerald-600";
    case "Pending":
      return "bg-amber-50 text-amber-600";
    case "Created":
      return "bg-slate-100 text-slate-500";
    case "Closed":
      return "bg-rose-50 text-rose-600";
    default:
      return "bg-slate-100 text-slate-500";
  }
}

export function getCampaignStoreManagementStatusClass(status: string): string {
  switch (status) {
    case "Closed":
      return "bg-rose-50 text-rose-600";
    case "Created":
      return "bg-slate-100 text-slate-500";
    case "Pending":
      return "bg-amber-50 text-amber-600";
    default:
      return "bg-slate-100 text-slate-500";
  }
}

export function getBankCampaignStoreStatusClass(status: string): string {
  switch (status) {
    case "Created":
      return "bg-slate-100 text-slate-500";
    case "KAM Approved":
      return "bg-blue-50 text-blue-600";
    case "Bank Approved":
      return "bg-emerald-50 text-emerald-600";
    case "Rejected":
    case "Closed":
      return "bg-rose-50 text-rose-600";
    default:
      return "bg-slate-100 text-slate-500";
  }
}

export function getBankCampaignApprovedStatusClass(status: string): string {
  switch (status) {
    case "KAM Approved":
    case "Bank Approved":
      return "bg-emerald-50 text-emerald-600";
    case "Production":
      return "bg-blue-50 text-blue-600";
    case "Created":
      return "bg-slate-100 text-slate-500";
    default:
      return "bg-slate-100 text-slate-500";
  }
}

export function getEmailMessageStatusClass(status: string): string {
  switch (status) {
    case "Sent":
      return "bg-emerald-50 text-emerald-600";
    case "Failed":
      return "bg-rose-50 text-rose-600";
    case "Bounced":
      return "bg-amber-50 text-amber-600";
    case "Unknown":
      return "bg-blue-50 text-blue-600";
    default:
      return "bg-slate-100 text-slate-500";
  }
}
