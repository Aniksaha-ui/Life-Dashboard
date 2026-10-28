import type {
  KamReseller,
  KamResellerMerchant,
  KamResellerStatus,
} from "../types/kamReseller";
import {
  getKamPendingReason,
  getKamRejectedReason,
} from "../utils/resellerPendingReasons";
import { createDocuments } from "./opResellersData";

const SECTORS = [
  "Pureplay Ecommerce",
  "Education",
  "Healthcare",
  "Travel & Tourism",
  "Food & Beverage",
  "Financial Services",
  "Telecom",
  "Retail",
] as const;

const STATUSES: KamResellerStatus[] = [
  "Active",
  "Inactive",
  "Pending",
  "Rejected",
];

const RESELLER_NAMES = [
  "Digital Bridge Partners",
  "Commerce Hub BD",
  "PayLink Reseller",
  "FinEdge Solutions",
  "Merchant Connect Ltd",
  "SSL Partner Network",
  "Gateway Alliance",
  "Transact Pro BD",
  "Ecom Velocity",
  "Payment Sphere",
  "Retail Nexus",
  "Swift Commerce",
  "Bangla Pay Partners",
  "ISO Connect",
  "Channel One Reseller",
];

const POC_NAMES = [
  "Rahim Uddin",
  "Sadia Rahman",
  "Karim Hassan",
  "Nusrat Jahan",
  "Imran Ahmed",
  "Farhana Begum",
  "Tanvir Islam",
  "Mousumi Das",
  "Arif Hossain",
  "Priya Saha",
];

const MERCHANT_NAMES = [
  "Fashion Outlet BD",
  "TechMart Online",
  "Green Grocery",
  "Skyline Travels",
  "MediCare Plus",
  "EduSmart Academy",
  "Foodie Express",
  "Gadget Zone",
  "HomeStyle Decor",
  "Sports Arena",
  "Book Haven",
  "Beauty Bliss",
  "Auto Parts Hub",
  "Pet Care Store",
  "Fitness First",
];

type PortalMerchantStatus = "active" | "pending" | "inactive" | "rejected";

interface PortalMerchant {
  id: number;
  name: string;
  mid: string;
  industry: string;
  contact: string;
  phone: string;
  date: string;
  status: PortalMerchantStatus;
  volume: string;
}

function parsePortalDate(date: string): string {
  return new Date(date).toISOString();
}

function parsePortalVolume(volume: string): number {
  if (!volume || volume === "—") return 0;
  const digits = volume.replace(/[^\d]/g, "");
  return Number(digits) || 0;
}

function mapPortalMerchantStatus(
  status: PortalMerchantStatus,
): KamResellerMerchant["status"] {
  switch (status) {
    case "active":
      return "Active";
    case "pending":
      return "Pending";
    case "inactive":
      return "Inactive";
    case "rejected":
      return "Rejected";
    default:
      return "Pending";
  }
}

const MERCHANTS_PAGE_REFERENCES = [
  { merchantsPageId: "1", storeId: "usb_01" },
  { merchantsPageId: "2", storeId: "gp_pay" },
  { merchantsPageId: "3", storeId: "bl_pay" },
  { merchantsPageId: "4", storeId: "fp_dhaka" },
  { merchantsPageId: "5", storeId: "daraz_mall" },
  { merchantsPageId: "6", storeId: "gworld_main" },
  { merchantsPageId: "7", storeId: "welcomeelectronic181live" },
] as const;

function getMerchantsPageReference(index: number) {
  return MERCHANTS_PAGE_REFERENCES[index % MERCHANTS_PAGE_REFERENCES.length];
}

function toMerchantEmail(name: string, contact: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 24);
  const contactSlug = contact
    .toLowerCase()
    .split(" ")[0]
    .replace(/[^a-z]/g, "");
  return `${contactSlug || "contact"}@${slug || "merchant"}.com`;
}

function midToStoreId(mid: string): string {
  return `mid_${mid.replace(/^MID-/i, "").toLowerCase()}`;
}

function mapPortalMerchant(merchant: PortalMerchant): KamResellerMerchant {
  return {
    id: `apex-${merchant.id}`,
    merchantId: merchant.mid,
    merchantsPageId: String(100 + merchant.id),
    name: merchant.name,
    storeId: midToStoreId(merchant.mid),
    sector: merchant.industry,
    status: mapPortalMerchantStatus(merchant.status),
    onboardingDate: parsePortalDate(merchant.date),
    contactName: merchant.contact,
    contactEmail: toMerchantEmail(merchant.name, merchant.contact),
    contactPhone: merchant.phone,
    gmv30d: parsePortalVolume(merchant.volume),
  };
}

// Merchants from https://reseller-portal-one.vercel.app/dashboard-merchants.html
const APEX_TRADING_PORTAL_MERCHANTS: PortalMerchant[] = [
  {
    id: 1,
    name: "Apex Electronics Ltd",
    mid: "MID-902831",
    industry: "Retail",
    contact: "Sajid Hossain",
    phone: "+880 1711 000123",
    date: "Oct 12, 2025",
    status: "active",
    volume: "৳ 18,40,000",
  },
  {
    id: 2,
    name: "Blue Ribbon Cafe",
    mid: "MID-112094",
    industry: "Hospitality",
    contact: "Tasnim Ahmed",
    phone: "+880 1822 988102",
    date: "Nov 04, 2025",
    status: "pending",
    volume: "৳ 4,20,000",
  },
  {
    id: 3,
    name: "Global Logistics Hub",
    mid: "MID-440292",
    industry: "Logistics",
    contact: "Rezwana Karim",
    phone: "+880 1755 776611",
    date: "Nov 21, 2025",
    status: "inactive",
    volume: "৳ 9,10,000",
  },
  {
    id: 4,
    name: "Sundarban Travels",
    mid: "MID-559013",
    industry: "Travel",
    contact: "Imran Khan",
    phone: "+880 1933 559013",
    date: "Dec 02, 2025",
    status: "active",
    volume: "৳ 22,50,000",
  },
  {
    id: 5,
    name: "Padma Garments",
    mid: "MID-660901",
    industry: "Garments",
    contact: "Nusrat Jahan",
    phone: "+880 1622 660901",
    date: "Dec 09, 2025",
    status: "rejected",
    volume: "—",
  },
  {
    id: 6,
    name: "Dhaka Tech Mart",
    mid: "MID-771203",
    industry: "Technology",
    contact: "Arif Chowdhury",
    phone: "+880 1511 771203",
    date: "Dec 14, 2025",
    status: "active",
    volume: "৳ 31,20,000",
  },
  {
    id: 7,
    name: "Meghna Pharma",
    mid: "MID-883451",
    industry: "Healthcare",
    contact: "Layla Akter",
    phone: "+880 1699 112233",
    date: "Dec 18, 2025",
    status: "active",
    volume: "৳ 14,50,000",
  },
  {
    id: 8,
    name: "EduNext Academy",
    mid: "MID-994502",
    industry: "Education",
    contact: "Zahir Huda",
    phone: "+880 1788 994502",
    date: "Dec 22, 2025",
    status: "pending",
    volume: "—",
  },
];

const APEX_TRADING_MERCHANTS =
  APEX_TRADING_PORTAL_MERCHANTS.map(mapPortalMerchant);

const APEX_TRADING_RESELLER: KamReseller = {
  id: "1",
  resellerId: "KR-001",
  name: "Apex Trading Ltd",
  sector: "Retail",
  website: "https://www.apextrading.com",
  pocName: "Md. Rahim Uddin",
  pocEmail: "rahim@apextrading.com",
  pocPhone: "+880 1711 000123",
  onboardingDate: parsePortalDate("Oct 12, 2025"),
  status: "Active",
  merchantsCount: APEX_TRADING_MERCHANTS.length,
  address: "22/B, Gulshan Avenue, Dhaka 1212",
  email: "contact@apextrading.com",
  phone: "+880 1711 000123",
  merchants: APEX_TRADING_MERCHANTS,
  documents: createDocuments("Approved", 0),
};

function createMerchants(
  resellerIndex: number,
  count: number,
): KamResellerMerchant[] {
  return Array.from({ length: count }, (_, merchantIndex) => {
    const globalIndex = resellerIndex * 5 + merchantIndex;
    const pageRef = getMerchantsPageReference(globalIndex);

    return {
      id: `km-${resellerIndex + 1}-${merchantIndex + 1}`,
      merchantId: `M-${1000 + globalIndex}`,
      merchantsPageId: pageRef.merchantsPageId,
      name: MERCHANT_NAMES[globalIndex % MERCHANT_NAMES.length],
      storeId: pageRef.storeId,
      sector: SECTORS[globalIndex % SECTORS.length],
      status: globalIndex % 7 === 0 ? "Inactive" : "Active",
      onboardingDate: new Date(
        Date.now() - (globalIndex + 1) * 86400000 * 12,
      ).toISOString(),
      contactName: POC_NAMES[globalIndex % POC_NAMES.length],
      contactEmail: `merchant${globalIndex + 1}@example.com`,
      contactPhone: `0171${String(1000000 + globalIndex).slice(-7)}`,
      gmv30d: Math.round(50000 + ((globalIndex * 17341) % 900000)),
    };
  });
}

function createOtherResellers(): KamReseller[] {
  return RESELLER_NAMES.map((name, index) => {
    const merchants = createMerchants(index, 3 + (index % 5));
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    return {
      id: String(index + 2),
      resellerId: `KR-${String(101 + index).padStart(3, "0")}`,
      name,
      sector: SECTORS[index % SECTORS.length],
      website: `https://www.${slug}.com`,
      pocName: POC_NAMES[index % POC_NAMES.length],
      pocEmail: `${slug.split("-")[0]}@example.com`,
      pocPhone: `0171${String(2000000 + index).slice(-7)}`,
      onboardingDate: new Date(
        Date.now() - (index + 2) * 86400000 * 28,
      ).toISOString(),
      status: STATUSES[index % STATUSES.length],
      pendingReason: getKamPendingReason(
        STATUSES[index % STATUSES.length],
        index,
      ),
      rejectedReason: getKamRejectedReason(
        STATUSES[index % STATUSES.length],
        index,
      ),
      merchantsCount: merchants.length,
      address: `${12 + index}, Gulshan Avenue, Dhaka`,
      email: `info@${slug}.com`,
      phone: `0181${String(3000000 + index).slice(-7)}`,
      merchants,
      documents: createDocuments("Approved", index + 1),
    };
  });
}

export const KAM_RESELLERS: KamReseller[] = [
  APEX_TRADING_RESELLER,
  ...createOtherResellers(),
];

export function getKamResellerById(id: string): KamReseller | undefined {
  return KAM_RESELLERS.find((reseller) => reseller.id === id);
}

export function listKamResellers(): KamReseller[] {
  return [...KAM_RESELLERS];
}
