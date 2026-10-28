import type { OpResellerDocument } from "./opReseller";

export type KamResellerStatus = "Active" | "Inactive" | "Pending" | "Rejected";

export type KamResellerMerchantStatus = KamResellerStatus;

export interface KamResellerMerchant {
  id: string;
  merchantId: string;
  merchantsPageId: string;
  name: string;
  storeId: string;
  sector: string;
  status: KamResellerMerchantStatus;
  onboardingDate: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  gmv30d: number;
}

export interface KamReseller {
  id: string;
  resellerId: string;
  name: string;
  sector: string;
  website: string;
  pocName: string;
  pocEmail: string;
  pocPhone: string;
  onboardingDate: string;
  status: KamResellerStatus;
  pendingReason?: string;
  rejectedReason?: string;
  merchantsCount: number;
  address: string;
  email: string;
  phone: string;
  merchants: KamResellerMerchant[];
  documents: OpResellerDocument[];
}
