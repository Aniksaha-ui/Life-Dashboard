export interface EmailAnalyticsEntry {
  id: string;
  sector: string;
  merchant: string;
  email: string;
  status: "Sent" | "Delivered" | "Failed" | "Unknown";
  date: string;
  reason: string;
  campaignName: string;
}

export interface EmailAnalyticsMetrics {
  merchants: number;
  emailSent: number;
  delivered: number;
  failed: number;
  activeSectors: string[];
}

export interface CampaignStoreEntry {
  id: string;
  campaign: string;
  trackingId: string;
  sectors: string;
  startDate: string;
  endDate: string;
  banner: string;
  confirmationExpire: string;
  canOnboard: "Yes" | "No";
  status: "Closed" | "Created" | "Pending";
  discounts: string;
  action: "See Stores" | "Invite";
}

export interface CampaignStoreMetrics {
  total: number;
  created: number;
  pending: number;
  closed: number;
}

export interface CampaignStoreRequestRow {
  merchant: string;
  brand: string;
  storeId: string;
  kam: string;
  category: string;
  url: string;
  disc: number;
  consumed: string;
  shared: number;
  min: number;
  max: number;
  maxAmt: number;
  recurrentLimit?: number;
  sectors: string;
  remarks: string;
}

export interface MerchantCampaignEntry {
  id: string;
  campaign: string;
  trackingId: string;
  sectors: string;
  startDate: string;
  endDate: string;
  banner: string;
  confirmationExpire: string;
  canOnboard: "Yes" | "No";
  status: "Running" | "Pending" | "Created" | "Closed";
  edit: "Edit" | "N/A";
  details: "View";
  upload: "Upload" | "N/A";
  selectedBanks?: string[];
  selectedMfs?: string[];
  selectedInternetBanks?: string[];
}
