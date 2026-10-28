// Report Registry - Configuration for all report types
// Maps reportId to report metadata including title, description, sections

import { SECTOR_ONBOARDING_MERCHANT_POOL } from "./data/sectorOnboardingMerchantData";
import { VAS_LEAD_MERCHANT_POOL } from "./data/vasLeadGenerationData";
import {
  REFERRAL_CODE_SUMMARY,
  REFERRAL_ONBOARDED_MERCHANTS,
  REFERRAL_INVITATIONS,
} from "./data/referralReportData";
import {
  INSTANT_SIGNUP_PAGE_VIEWS,
  INSTANT_SIGNUP_COUNTRY_USERS,
  INSTANT_SIGNUP_ENGAGEMENT_METRICS,
  INSTANT_SIGNUP_PAGE_ENGAGEMENT,
  INSTANT_SIGNUP_CONVERSION_METRICS,
  INSTANT_SIGNUP_DROPOFF_RATES,
  INSTANT_SIGNUP_MEDIUM_TRAFFIC,
  INSTANT_SIGNUP_USER_TYPES,
  INSTANT_SIGNUP_DEVICE_USAGE,
} from "./data/instantSignupAnalyticsData";
import { TRANSACTION_FAILED_REASON_DATA } from "./data/transactionFailedReasonData";

export interface ReportRow {
  label: string;
  amount: string;
  isHighlighted?: boolean;
}

export interface ReportSection {
  sectionId: string;
  title: string;
  rows: ReportRow[];
  total?: { label: string; amount: string };
  exportable: boolean;
  explorable: boolean;
  customData?: any;
}

export type FilterType =
  | "date"
  | "merchant"
  | "store"
  | "sector"
  | "year"
  | "trend"
  | "question"
  | "bank"
  | "revenueType"
  | "kam"
  | "errorDescription"
  | "month"
  | "segment"
  | "trackerId"
  | "status"
  | "bulkUpload"
  | "merchantId"
  | "segmentName"
  | "type"
  | "filterValue";

export interface ReportConfig {
  reportId: string;
  title: string;
  description: string;
  aboutText: string;
  docsUrl: string;
  sections: ReportSection[];
  availableFilters?: FilterType[];
}

// Sample data generators for different report types
const generateMerchantWiseData = (): ReportSection[] => [
  {
    sectionId: "M-1001",
    title: "Fashion Outlet",
    rows: [], // Unused in custom view
    exportable: true,
    explorable: true,
    customData: {
      sectors: ["Retail", "Apparel"],
      totals: {
        transactions: 145,
        amount: "৳ 245,000.00",
        sslRevenue: "৳ 4,900.00",
      },
      stores: [
        {
          storeId: "FO-DHAKA-01",
          transactions: 85,
          amount: "৳ 145,000.00",
          sslRevenue: "৳ 2,900.00",
          rows: [
            {
              date: "2025-01-18",
              transactions: 12,
              amount: "৳ 24,000.00",
              sslRevenue: "৳ 480.00",
            },
            {
              date: "2025-01-17",
              transactions: 15,
              amount: "৳ 28,500.00",
              sslRevenue: "৳ 570.00",
            },
            {
              date: "2025-01-16",
              transactions: 8,
              amount: "৳ 15,200.00",
              sslRevenue: "৳ 304.00",
            },
          ],
        },
        {
          storeId: "FO-CTG-02",
          transactions: 60,
          amount: "৳ 100,000.00",
          sslRevenue: "৳ 2,000.00",
          rows: [
            {
              date: "2025-01-18",
              transactions: 10,
              amount: "৳ 18,000.00",
              sslRevenue: "৳ 360.00",
            },
            {
              date: "2025-01-17",
              transactions: 12,
              amount: "৳ 22,000.00",
              sslRevenue: "৳ 440.00",
            },
          ],
        },
      ],
    },
  },
  {
    sectionId: "M-1002",
    title: "Tech Gadgets Ltd",
    rows: [],
    exportable: true,
    explorable: true,
    customData: {
      sectors: ["Pureplay Ecommerce", "Electronics"],
      totals: {
        transactions: 89,
        amount: "৳ 450,000.00",
        sslRevenue: "৳ 9,000.00",
      },
      stores: [
        {
          storeId: "TG-WEB",
          transactions: 89,
          amount: "৳ 450,000.00",
          sslRevenue: "৳ 9,000.00",
          rows: [
            {
              date: "2025-01-18",
              transactions: 25,
              amount: "৳ 125,000.00",
              sslRevenue: "৳ 2,500.00",
            },
            {
              date: "2025-01-17",
              transactions: 30,
              amount: "৳ 150,000.00",
              sslRevenue: "৳ 3,000.00",
            },
          ],
        },
      ],
    },
  },
  {
    sectionId: "M-1003",
    title: "Daily Groceries",
    rows: [],
    exportable: true,
    explorable: true,
    customData: {
      sectors: ["Retail", "Food"],
      totals: {
        transactions: 320,
        amount: "৳ 180,000.00",
        sslRevenue: "৳ 3,600.00",
      },
      stores: [
        {
          storeId: "DG-BANANI",
          transactions: 150,
          amount: "৳ 90,000.00",
          sslRevenue: "৳ 1,800.00",
          rows: [
            {
              date: "2025-01-18",
              transactions: 40,
              amount: "৳ 25,000.00",
              sslRevenue: "৳ 500.00",
            },
          ],
        },
        {
          storeId: "DG-GULSHAN",
          transactions: 170,
          amount: "৳ 90,000.00",
          sslRevenue: "৳ 1,800.00",
          rows: [
            {
              date: "2025-01-18",
              transactions: 45,
              amount: "৳ 28,000.00",
              sslRevenue: "৳ 560.00",
            },
          ],
        },
      ],
    },
  },
  {
    sectionId: "M-1004",
    title: "EduTech Solutions BD",
    rows: [],
    exportable: true,
    explorable: true,
    customData: {
      sectors: ["Education"],
      totals: {
        transactions: 210,
        amount: "৳ 315,000.00",
        sslRevenue: "৳ 6,300.00",
      },
      stores: [
        {
          storeId: "EDUT-WEB",
          transactions: 210,
          amount: "৳ 315,000.00",
          sslRevenue: "৳ 6,300.00",
          rows: [
            {
              date: "2025-01-18",
              transactions: 55,
              amount: "৳ 82,500.00",
              sslRevenue: "৳ 1,650.00",
            },
            {
              date: "2025-01-17",
              transactions: 70,
              amount: "৳ 105,000.00",
              sslRevenue: "৳ 2,100.00",
            },
            {
              date: "2025-01-16",
              transactions: 85,
              amount: "৳ 127,500.00",
              sslRevenue: "৳ 2,550.00",
            },
          ],
        },
      ],
    },
  },
  {
    sectionId: "M-1005",
    title: "HealthCare Plus",
    rows: [],
    exportable: true,
    explorable: true,
    customData: {
      sectors: ["Healthcare"],
      totals: {
        transactions: 98,
        amount: "৳ 520,000.00",
        sslRevenue: "৳ 10,400.00",
      },
      stores: [
        {
          storeId: "HCP-DHAKA",
          transactions: 60,
          amount: "৳ 320,000.00",
          sslRevenue: "৳ 6,400.00",
          rows: [
            {
              date: "2025-01-18",
              transactions: 20,
              amount: "৳ 110,000.00",
              sslRevenue: "৳ 2,200.00",
            },
            {
              date: "2025-01-17",
              transactions: 40,
              amount: "৳ 210,000.00",
              sslRevenue: "৳ 4,200.00",
            },
          ],
        },
        {
          storeId: "HCP-CTG",
          transactions: 38,
          amount: "৳ 200,000.00",
          sslRevenue: "৳ 4,000.00",
          rows: [
            {
              date: "2025-01-18",
              transactions: 38,
              amount: "৳ 200,000.00",
              sslRevenue: "৳ 4,000.00",
            },
          ],
        },
      ],
    },
  },
  {
    sectionId: "M-1006",
    title: "TravelMart Bangladesh",
    rows: [],
    exportable: true,
    explorable: true,
    customData: {
      sectors: ["Travel & Tourism"],
      totals: {
        transactions: 1173,
        amount: "৳ 3,439,000.00",
        sslRevenue: "৳ 68,780.00",
      },
      stores: [
        {
          storeId: "TM-ONLINE",
          transactions: 430,
          amount: "৳ 1,290,000.00",
          sslRevenue: "৳ 25,800.00",
          rows: [
            {
              date: "2025-01-18",
              transactions: 130,
              amount: "৳ 390,000.00",
              sslRevenue: "৳ 7,800.00",
            },
            {
              date: "2025-01-17",
              transactions: 150,
              amount: "৳ 450,000.00",
              sslRevenue: "৳ 9,000.00",
            },
            {
              date: "2025-01-16",
              transactions: 150,
              amount: "৳ 450,000.00",
              sslRevenue: "৳ 9,000.00",
            },
          ],
        },
        {
          storeId: "TM-DHAKA-01",
          transactions: 120,
          amount: "৳ 360,000.00",
          sslRevenue: "৳ 7,200.00",
          rows: [
            {
              date: "2025-01-18",
              transactions: 40,
              amount: "৳ 120,000.00",
              sslRevenue: "৳ 2,400.00",
            },
            {
              date: "2025-01-17",
              transactions: 50,
              amount: "৳ 150,000.00",
              sslRevenue: "৳ 3,000.00",
            },
            {
              date: "2025-01-16",
              transactions: 30,
              amount: "৳ 90,000.00",
              sslRevenue: "৳ 1,800.00",
            },
          ],
        },
        {
          storeId: "TM-CTG-01",
          transactions: 80,
          amount: "৳ 240,000.00",
          sslRevenue: "৳ 4,800.00",
          rows: [
            {
              date: "2025-01-18",
              transactions: 30,
              amount: "৳ 90,000.00",
              sslRevenue: "৳ 1,800.00",
            },
            {
              date: "2025-01-17",
              transactions: 50,
              amount: "৳ 150,000.00",
              sslRevenue: "৳ 3,000.00",
            },
          ],
        },
        {
          storeId: "TM-SYLHET-01",
          transactions: 60,
          amount: "৳ 180,000.00",
          sslRevenue: "৳ 3,600.00",
          rows: [
            {
              date: "2025-01-18",
              transactions: 20,
              amount: "৳ 60,000.00",
              sslRevenue: "৳ 1,200.00",
            },
            {
              date: "2025-01-17",
              transactions: 40,
              amount: "৳ 120,000.00",
              sslRevenue: "৳ 2,400.00",
            },
          ],
        },
        {
          storeId: "TM-RAJ-01",
          transactions: 40,
          amount: "৳ 120,000.00",
          sslRevenue: "৳ 2,400.00",
          rows: [
            {
              date: "2025-01-18",
              transactions: 20,
              amount: "৳ 60,000.00",
              sslRevenue: "৳ 1,200.00",
            },
            {
              date: "2025-01-17",
              transactions: 20,
              amount: "৳ 60,000.00",
              sslRevenue: "৳ 1,200.00",
            },
          ],
        },
        {
          storeId: "TM-KHULNA-01",
          transactions: 35,
          amount: "৳ 105,000.00",
          sslRevenue: "৳ 2,100.00",
          rows: [
            {
              date: "2025-01-18",
              transactions: 15,
              amount: "৳ 45,000.00",
              sslRevenue: "৳ 900.00",
            },
            {
              date: "2025-01-17",
              transactions: 20,
              amount: "৳ 60,000.00",
              sslRevenue: "৳ 1,200.00",
            },
          ],
        },
        {
          storeId: "TM-BARISAL-01",
          transactions: 20,
          amount: "৳ 60,000.00",
          sslRevenue: "৳ 1,200.00",
          rows: [
            {
              date: "2025-01-18",
              transactions: 10,
              amount: "৳ 30,000.00",
              sslRevenue: "৳ 600.00",
            },
            {
              date: "2025-01-17",
              transactions: 10,
              amount: "৳ 30,000.00",
              sslRevenue: "৳ 600.00",
            },
          ],
        },
        {
          storeId: "TM-RANGPUR-01",
          transactions: 25,
          amount: "৳ 75,000.00",
          sslRevenue: "৳ 1,500.00",
          rows: [
            {
              date: "2025-01-18",
              transactions: 10,
              amount: "৳ 30,000.00",
              sslRevenue: "৳ 600.00",
            },
            {
              date: "2025-01-17",
              transactions: 15,
              amount: "৳ 45,000.00",
              sslRevenue: "৳ 900.00",
            },
          ],
        },
        {
          storeId: "TM-MYM-01",
          transactions: 15,
          amount: "৳ 45,000.00",
          sslRevenue: "৳ 900.00",
          rows: [
            {
              date: "2025-01-18",
              transactions: 5,
              amount: "৳ 15,000.00",
              sslRevenue: "৳ 300.00",
            },
            {
              date: "2025-01-17",
              transactions: 10,
              amount: "৳ 30,000.00",
              sslRevenue: "৳ 600.00",
            },
          ],
        },
        {
          storeId: "TM-COMILLA-01",
          transactions: 325,
          amount: "৳ 975,000.00",
          sslRevenue: "৳ 19,500.00",
          rows: [
            {
              date: "2025-01-18",
              transactions: 10,
              amount: "৳ 30,000.00",
              sslRevenue: "৳ 600.00",
            },
            {
              date: "2025-01-17",
              transactions: 12,
              amount: "৳ 36,000.00",
              sslRevenue: "৳ 720.00",
            },
            {
              date: "2025-01-16",
              transactions: 8,
              amount: "৳ 24,000.00",
              sslRevenue: "৳ 480.00",
            },
            {
              date: "2025-01-15",
              transactions: 15,
              amount: "৳ 45,000.00",
              sslRevenue: "৳ 900.00",
            },
            {
              date: "2025-01-14",
              transactions: 11,
              amount: "৳ 33,000.00",
              sslRevenue: "৳ 660.00",
            },
            {
              date: "2025-01-13",
              transactions: 7,
              amount: "৳ 21,000.00",
              sslRevenue: "৳ 420.00",
            },
            {
              date: "2025-01-12",
              transactions: 13,
              amount: "৳ 39,000.00",
              sslRevenue: "৳ 780.00",
            },
            {
              date: "2025-01-11",
              transactions: 9,
              amount: "৳ 27,000.00",
              sslRevenue: "৳ 540.00",
            },
            {
              date: "2025-01-10",
              transactions: 14,
              amount: "৳ 42,000.00",
              sslRevenue: "৳ 840.00",
            },
            {
              date: "2025-01-09",
              transactions: 6,
              amount: "৳ 18,000.00",
              sslRevenue: "৳ 360.00",
            },
            {
              date: "2025-01-08",
              transactions: 10,
              amount: "৳ 30,000.00",
              sslRevenue: "৳ 600.00",
            },
            {
              date: "2025-01-07",
              transactions: 12,
              amount: "৳ 36,000.00",
              sslRevenue: "৳ 720.00",
            },
            {
              date: "2025-01-06",
              transactions: 8,
              amount: "৳ 24,000.00",
              sslRevenue: "৳ 480.00",
            },
            {
              date: "2025-01-05",
              transactions: 15,
              amount: "৳ 45,000.00",
              sslRevenue: "৳ 900.00",
            },
            {
              date: "2025-01-04",
              transactions: 11,
              amount: "৳ 33,000.00",
              sslRevenue: "৳ 660.00",
            },
            {
              date: "2025-01-03",
              transactions: 7,
              amount: "৳ 21,000.00",
              sslRevenue: "৳ 420.00",
            },
            {
              date: "2025-01-02",
              transactions: 13,
              amount: "৳ 39,000.00",
              sslRevenue: "৳ 780.00",
            },
            {
              date: "2025-01-01",
              transactions: 9,
              amount: "৳ 27,000.00",
              sslRevenue: "৳ 540.00",
            },
            {
              date: "2024-12-31",
              transactions: 14,
              amount: "৳ 42,000.00",
              sslRevenue: "৳ 840.00",
            },
            {
              date: "2024-12-30",
              transactions: 6,
              amount: "৳ 18,000.00",
              sslRevenue: "৳ 360.00",
            },
            {
              date: "2024-12-29",
              transactions: 10,
              amount: "৳ 30,000.00",
              sslRevenue: "৳ 600.00",
            },
            {
              date: "2024-12-28",
              transactions: 12,
              amount: "৳ 36,000.00",
              sslRevenue: "৳ 720.00",
            },
            {
              date: "2024-12-27",
              transactions: 8,
              amount: "৳ 24,000.00",
              sslRevenue: "৳ 480.00",
            },
            {
              date: "2024-12-26",
              transactions: 15,
              amount: "৳ 45,000.00",
              sslRevenue: "৳ 900.00",
            },
            {
              date: "2024-12-25",
              transactions: 11,
              amount: "৳ 33,000.00",
              sslRevenue: "৳ 660.00",
            },
            {
              date: "2024-12-24",
              transactions: 7,
              amount: "৳ 21,000.00",
              sslRevenue: "৳ 420.00",
            },
            {
              date: "2024-12-23",
              transactions: 13,
              amount: "৳ 39,000.00",
              sslRevenue: "৳ 780.00",
            },
            {
              date: "2024-12-22",
              transactions: 9,
              amount: "৳ 27,000.00",
              sslRevenue: "৳ 540.00",
            },
            {
              date: "2024-12-21",
              transactions: 14,
              amount: "৳ 42,000.00",
              sslRevenue: "৳ 840.00",
            },
            {
              date: "2024-12-20",
              transactions: 6,
              amount: "৳ 18,000.00",
              sslRevenue: "৳ 360.00",
            },
            {
              date: "2024-12-19",
              transactions: 10,
              amount: "৳ 30,000.00",
              sslRevenue: "৳ 600.00",
            },
          ],
        },
        {
          storeId: "TM-GAZIPUR-01",
          transactions: 50,
          amount: "৳ 150,000.00",
          sslRevenue: "৳ 3,000.00",
          rows: [
            {
              date: "2025-01-18",
              transactions: 25,
              amount: "৳ 75,000.00",
              sslRevenue: "৳ 1,500.00",
            },
            {
              date: "2025-01-17",
              transactions: 25,
              amount: "৳ 75,000.00",
              sslRevenue: "৳ 1,500.00",
            },
          ],
        },
        {
          storeId: "TM-SAVAR-01",
          transactions: 20,
          amount: "৳ 60,000.00",
          sslRevenue: "৳ 1,200.00",
          rows: [
            {
              date: "2025-01-18",
              transactions: 10,
              amount: "৳ 30,000.00",
              sslRevenue: "৳ 600.00",
            },
            {
              date: "2025-01-17",
              transactions: 10,
              amount: "৳ 30,000.00",
              sslRevenue: "৳ 600.00",
            },
          ],
        },
        {
          storeId: "TM-NARYG-01",
          transactions: 45,
          amount: "৳ 135,000.00",
          sslRevenue: "৳ 2,700.00",
          rows: [
            {
              date: "2025-01-18",
              transactions: 20,
              amount: "৳ 60,000.00",
              sslRevenue: "৳ 1,200.00",
            },
            {
              date: "2025-01-17",
              transactions: 25,
              amount: "৳ 75,000.00",
              sslRevenue: "৳ 1,500.00",
            },
          ],
        },
        {
          storeId: "TM-BOGRA-01",
          transactions: 30,
          amount: "৳ 90,000.00",
          sslRevenue: "৳ 1,800.00",
          rows: [
            {
              date: "2025-01-18",
              transactions: 15,
              amount: "৳ 45,000.00",
              sslRevenue: "৳ 900.00",
            },
            {
              date: "2025-01-17",
              transactions: 15,
              amount: "৳ 45,000.00",
              sslRevenue: "৳ 900.00",
            },
          ],
        },
        {
          storeId: "TM-JESSORE-01",
          transactions: 25,
          amount: "৳ 75,000.00",
          sslRevenue: "৳ 1,500.00",
          rows: [
            {
              date: "2025-01-18",
              transactions: 10,
              amount: "৳ 30,000.00",
              sslRevenue: "৳ 600.00",
            },
            {
              date: "2025-01-17",
              transactions: 15,
              amount: "৳ 45,000.00",
              sslRevenue: "৳ 900.00",
            },
          ],
        },
        {
          storeId: "TM-COXBAZAR-01",
          transactions: 90,
          amount: "৳ 270,000.00",
          sslRevenue: "৳ 5,400.00",
          rows: [
            {
              date: "2025-01-18",
              transactions: 40,
              amount: "৳ 120,000.00",
              sslRevenue: "৳ 2,400.00",
            },
            {
              date: "2025-01-17",
              transactions: 50,
              amount: "৳ 150,000.00",
              sslRevenue: "৳ 3,000.00",
            },
          ],
        },
        {
          storeId: "TM-NARSINGDI-01",
          transactions: 15,
          amount: "৳ 45,000.00",
          sslRevenue: "৳ 900.00",
          rows: [
            {
              date: "2025-01-18",
              transactions: 5,
              amount: "৳ 15,000.00",
              sslRevenue: "৳ 300.00",
            },
            {
              date: "2025-01-17",
              transactions: 10,
              amount: "৳ 30,000.00",
              sslRevenue: "৳ 600.00",
            },
          ],
        },
        {
          storeId: "TM-FENI-01",
          transactions: 10,
          amount: "৳ 30,000.00",
          sslRevenue: "৳ 600.00",
          rows: [
            {
              date: "2025-01-18",
              transactions: 5,
              amount: "৳ 15,000.00",
              sslRevenue: "৳ 300.00",
            },
            {
              date: "2025-01-17",
              transactions: 5,
              amount: "৳ 15,000.00",
              sslRevenue: "৳ 300.00",
            },
          ],
        },
        {
          storeId: "TM-NOAKHALI-01",
          transactions: 12,
          amount: "৳ 36,000.00",
          sslRevenue: "৳ 720.00",
          rows: [
            {
              date: "2025-01-18",
              transactions: 6,
              amount: "৳ 18,000.00",
              sslRevenue: "৳ 360.00",
            },
            {
              date: "2025-01-17",
              transactions: 6,
              amount: "৳ 18,000.00",
              sslRevenue: "৳ 360.00",
            },
          ],
        },
        {
          storeId: "TM-TONGI-01",
          transactions: 18,
          amount: "৳ 54,000.00",
          sslRevenue: "৳ 1,080.00",
          rows: [
            {
              date: "2025-01-18",
              transactions: 8,
              amount: "৳ 24,000.00",
              sslRevenue: "৳ 480.00",
            },
            {
              date: "2025-01-17",
              transactions: 10,
              amount: "৳ 30,000.00",
              sslRevenue: "৳ 600.00",
            },
          ],
        },
        {
          storeId: "TM-BHOLA-01",
          transactions: 8,
          amount: "৳ 24,000.00",
          sslRevenue: "৳ 480.00",
          rows: [
            {
              date: "2025-01-18",
              transactions: 4,
              amount: "৳ 12,000.00",
              sslRevenue: "৳ 240.00",
            },
            {
              date: "2025-01-17",
              transactions: 4,
              amount: "৳ 12,000.00",
              sslRevenue: "৳ 240.00",
            },
          ],
        },
      ],
    },
  },
  {
    sectionId: "M-1007",
    title: "AgroShop BD",
    rows: [],
    exportable: true,
    explorable: true,
    customData: {
      sectors: ["Agriculture Services"],
      totals: {
        transactions: 195,
        amount: "৳ 260,000.00",
        sslRevenue: "৳ 5,200.00",
      },
      stores: [
        {
          storeId: "AGRO-MAIN",
          transactions: 75,
          amount: "৳ 95,000.00",
          sslRevenue: "৳ 1,900.00",
          rows: [
            {
              date: "2025-01-18",
              transactions: 35,
              amount: "৳ 44,500.00",
              sslRevenue: "৳ 890.00",
            },
            {
              date: "2025-01-17",
              transactions: 40,
              amount: "৳ 50,500.00",
              sslRevenue: "৳ 1,010.00",
            },
          ],
        },
        {
          storeId: "AGRO-DHAKA-01",
          transactions: 45,
          amount: "৳ 62,500.00",
          sslRevenue: "৳ 1,250.00",
          rows: [
            {
              date: "2025-01-18",
              transactions: 20,
              amount: "৳ 28,000.00",
              sslRevenue: "৳ 560.00",
            },
            {
              date: "2025-01-17",
              transactions: 25,
              amount: "৳ 34,500.00",
              sslRevenue: "৳ 690.00",
            },
          ],
        },
        {
          storeId: "AGRO-CHITTAGONG-01",
          transactions: 30,
          amount: "৳ 41,000.00",
          sslRevenue: "৳ 820.00",
          rows: [
            {
              date: "2025-01-18",
              transactions: 12,
              amount: "৳ 16,500.00",
              sslRevenue: "৳ 330.00",
            },
            {
              date: "2025-01-17",
              transactions: 18,
              amount: "৳ 24,500.00",
              sslRevenue: "৳ 490.00",
            },
          ],
        },
        {
          storeId: "AGRO-SYLHET-01",
          transactions: 20,
          amount: "৳ 28,000.00",
          sslRevenue: "৳ 560.00",
          rows: [
            {
              date: "2025-01-18",
              transactions: 8,
              amount: "৳ 11,000.00",
              sslRevenue: "৳ 220.00",
            },
            {
              date: "2025-01-17",
              transactions: 12,
              amount: "৳ 17,000.00",
              sslRevenue: "৳ 340.00",
            },
          ],
        },
        {
          storeId: "AGRO-RAJSHAHI-01",
          transactions: 15,
          amount: "৳ 19,500.00",
          sslRevenue: "৳ 390.00",
          rows: [
            {
              date: "2025-01-18",
              transactions: 7,
              amount: "৳ 9,000.00",
              sslRevenue: "৳ 180.00",
            },
            {
              date: "2025-01-17",
              transactions: 8,
              amount: "৳ 10,500.00",
              sslRevenue: "৳ 210.00",
            },
          ],
        },
        {
          storeId: "AGRO-KHULNA-01",
          transactions: 10,
          amount: "৳ 14,000.00",
          sslRevenue: "৳ 280.00",
          rows: [
            {
              date: "2025-01-18",
              transactions: 4,
              amount: "৳ 5,500.00",
              sslRevenue: "৳ 110.00",
            },
            {
              date: "2025-01-17",
              transactions: 6,
              amount: "৳ 8,500.00",
              sslRevenue: "৳ 170.00",
            },
          ],
        },
      ],
    },
  },
  {
    sectionId: "M-1008",
    title: "Smart Home Electronics",
    rows: [],
    exportable: true,
    explorable: true,
    customData: {
      sectors: ["Pureplay Ecommerce", "Electronics"],
      totals: {
        transactions: 185,
        amount: "৳ 740,000.00",
        sslRevenue: "৳ 14,800.00",
      },
      stores: [
        {
          storeId: "SHE-DHAKA",
          transactions: 100,
          amount: "৳ 400,000.00",
          sslRevenue: "৳ 8,000.00",
          rows: [
            {
              date: "2025-01-18",
              transactions: 50,
              amount: "৳ 200,000.00",
              sslRevenue: "৳ 4,000.00",
            },
            {
              date: "2025-01-17",
              transactions: 50,
              amount: "৳ 200,000.00",
              sslRevenue: "৳ 4,000.00",
            },
          ],
        },
        {
          storeId: "SHE-CTG",
          transactions: 85,
          amount: "৳ 340,000.00",
          sslRevenue: "৳ 6,800.00",
          rows: [
            {
              date: "2025-01-18",
              transactions: 85,
              amount: "৳ 340,000.00",
              sslRevenue: "৳ 6,800.00",
            },
          ],
        },
      ],
    },
  },
  {
    sectionId: "M-1009",
    title: "Dhaka Food Express",
    rows: [],
    exportable: true,
    explorable: true,
    customData: {
      sectors: ["Food & Beverage"],
      totals: {
        transactions: 560,
        amount: "৳ 280,000.00",
        sslRevenue: "৳ 5,600.00",
      },
      stores: [
        {
          storeId: "DFE-GULSHAN",
          transactions: 300,
          amount: "৳ 150,000.00",
          sslRevenue: "৳ 3,000.00",
          rows: [
            {
              date: "2025-01-18",
              transactions: 150,
              amount: "৳ 75,000.00",
              sslRevenue: "৳ 1,500.00",
            },
            {
              date: "2025-01-17",
              transactions: 150,
              amount: "৳ 75,000.00",
              sslRevenue: "৳ 1,500.00",
            },
          ],
        },
        {
          storeId: "DFE-DHANMONDI",
          transactions: 260,
          amount: "৳ 130,000.00",
          sslRevenue: "৳ 2,600.00",
          rows: [
            {
              date: "2025-01-18",
              transactions: 260,
              amount: "৳ 130,000.00",
              sslRevenue: "৳ 2,600.00",
            },
          ],
        },
      ],
    },
  },
  {
    sectionId: "M-1010",
    title: "Pharma Direct BD",
    rows: [],
    exportable: true,
    explorable: true,
    customData: {
      sectors: ["Healthcare"],
      totals: {
        transactions: 340,
        amount: "৳ 680,000.00",
        sslRevenue: "৳ 13,600.00",
      },
      stores: [
        {
          storeId: "PHD-ONLINE",
          transactions: 340,
          amount: "৳ 680,000.00",
          sslRevenue: "৳ 13,600.00",
          rows: [
            {
              date: "2025-01-18",
              transactions: 110,
              amount: "৳ 220,000.00",
              sslRevenue: "৳ 4,400.00",
            },
            {
              date: "2025-01-17",
              transactions: 120,
              amount: "৳ 240,000.00",
              sslRevenue: "৳ 4,800.00",
            },
            {
              date: "2025-01-16",
              transactions: 110,
              amount: "৳ 220,000.00",
              sslRevenue: "৳ 4,400.00",
            },
          ],
        },
      ],
    },
  },
  {
    sectionId: "M-1011",
    title: "CityMart Retail",
    rows: [],
    exportable: true,
    explorable: true,
    customData: {
      sectors: ["Retail"],
      totals: {
        transactions: 490,
        amount: "৳ 392,000.00",
        sslRevenue: "৳ 7,840.00",
      },
      stores: [
        {
          storeId: "CMR-MIRPUR",
          transactions: 230,
          amount: "৳ 184,000.00",
          sslRevenue: "৳ 3,680.00",
          rows: [
            {
              date: "2025-01-18",
              transactions: 115,
              amount: "৳ 92,000.00",
              sslRevenue: "৳ 1,840.00",
            },
            {
              date: "2025-01-17",
              transactions: 115,
              amount: "৳ 92,000.00",
              sslRevenue: "৳ 1,840.00",
            },
          ],
        },
        {
          storeId: "CMR-UTTARA",
          transactions: 260,
          amount: "৳ 208,000.00",
          sslRevenue: "৳ 4,160.00",
          rows: [
            {
              date: "2025-01-18",
              transactions: 130,
              amount: "৳ 104,000.00",
              sslRevenue: "৳ 2,080.00",
            },
            {
              date: "2025-01-17",
              transactions: 130,
              amount: "৳ 104,000.00",
              sslRevenue: "৳ 2,080.00",
            },
          ],
        },
      ],
    },
  },
  {
    sectionId: "M-1012",
    title: "AutoParts Online",
    rows: [],
    exportable: true,
    explorable: true,
    customData: {
      sectors: ["Automobile"],
      totals: {
        transactions: 62,
        amount: "৳ 930,000.00",
        sslRevenue: "৳ 18,600.00",
      },
      stores: [
        {
          storeId: "APO-WEB",
          transactions: 62,
          amount: "৳ 930,000.00",
          sslRevenue: "৳ 18,600.00",
          rows: [
            {
              date: "2025-01-18",
              transactions: 30,
              amount: "৳ 450,000.00",
              sslRevenue: "৳ 9,000.00",
            },
            {
              date: "2025-01-17",
              transactions: 32,
              amount: "৳ 480,000.00",
              sslRevenue: "৳ 9,600.00",
            },
          ],
        },
      ],
    },
  },
  {
    sectionId: "M-1013",
    title: "KidsWorld Store",
    rows: [],
    exportable: true,
    explorable: true,
    customData: {
      sectors: ["Retail", "Apparel"],
      totals: {
        transactions: 270,
        amount: "৳ 162,000.00",
        sslRevenue: "৳ 3,240.00",
      },
      stores: [
        {
          storeId: "KW-ONLINE",
          transactions: 170,
          amount: "৳ 102,000.00",
          sslRevenue: "৳ 2,040.00",
          rows: [
            {
              date: "2025-01-18",
              transactions: 85,
              amount: "৳ 51,000.00",
              sslRevenue: "৳ 1,020.00",
            },
            {
              date: "2025-01-17",
              transactions: 85,
              amount: "৳ 51,000.00",
              sslRevenue: "৳ 1,020.00",
            },
          ],
        },
        {
          storeId: "KW-BASHUNDHARA",
          transactions: 100,
          amount: "৳ 60,000.00",
          sslRevenue: "৳ 1,200.00",
          rows: [
            {
              date: "2025-01-18",
              transactions: 100,
              amount: "৳ 60,000.00",
              sslRevenue: "৳ 1,200.00",
            },
          ],
        },
      ],
    },
  },
];

const generateChannelWiseData = (): ReportSection[] => [
  {
    sectionId: "M-1001",
    title: "Fashion Outlet",
    rows: [],
    exportable: true,
    explorable: true,
    customData: {
      sectors: ["Retail"],
      stores: [
        {
          storeId: "FO-DHAKA-01",
          rows: [
            {
              date: "2025-01-18",
              bank: "Brac",
              cardType: "Visa",
              transactions: 12,
              amount: "৳ 24,000.00",
              sslRevenue: "৳ 480.00",
            },
            {
              date: "2025-01-17",
              bank: "Brac",
              cardType: "Mastercard",
              transactions: 15,
              amount: "৳ 28,500.00",
              sslRevenue: "৳ 570.00",
            },
            {
              date: "2025-01-16",
              bank: "EBL",
              cardType: "Visa",
              transactions: 8,
              amount: "৳ 15,200.00",
              sslRevenue: "৳ 304.00",
            },
            {
              date: "2025-01-16",
              bank: "IBBL",
              cardType: "AMEX",
              transactions: 8,
              amount: "৳ 15,200.00",
              sslRevenue: "৳ 304.00",
            },
            {
              date: "2025-01-16",
              bank: "SCB",
              cardType: "Diners Club",
              transactions: 8,
              amount: "৳ 15,200.00",
              sslRevenue: "৳ 304.00",
            },
          ],
        },
        {
          storeId: "FO-CTG-02",
          rows: [
            {
              date: "2025-01-18",
              bank: "Brac",
              cardType: "Visa",
              transactions: 10,
              amount: "৳ 18,000.00",
              sslRevenue: "৳ 360.00",
            },
            {
              date: "2025-01-17",
              bank: "EBL",
              cardType: "Mastercard",
              transactions: 12,
              amount: "৳ 22,000.00",
              sslRevenue: "৳ 440.00",
            },
          ],
        },
      ],
    },
  },
  {
    sectionId: "M-1002",
    title: "Tech Gadgets Ltd",
    rows: [],
    exportable: true,
    explorable: true,
    customData: {
      sectors: ["Pureplay Ecommerce"],
      stores: [
        {
          storeId: "TG-WEB",
          rows: [
            {
              date: "2025-01-18",
              bank: "City Bank",
              cardType: "Other",
              transactions: 55,
              amount: "৳ 275,000.00",
              sslRevenue: "৳ 5,500.00",
            },
          ],
        },
      ],
    },
  },
  {
    sectionId: "M-1003",
    title: "Daily Groceries",
    rows: [],
    exportable: true,
    explorable: true,
    customData: {
      sectors: ["Retail", "Food"],
      stores: [
        {
          storeId: "DG-BANANI",
          rows: [
            {
              date: "2025-01-18",
              bank: "City Bank",
              cardType: "Visa",
              transactions: 40,
              amount: "৳ 25,000.00",
              sslRevenue: "৳ 500.00",
            },
          ],
        },
        {
          storeId: "DG-GULSHAN",
          rows: [
            {
              date: "2025-01-18",
              bank: "Brac",
              cardType: "Mastercard",
              transactions: 45,
              amount: "৳ 28,000.00",
              sslRevenue: "৳ 560.00",
            },
          ],
        },
      ],
    },
  },
];

const generateSuccessfulTnxData = (): ReportSection[] => [
  {
    sectionId: "M-1001",
    title: "Fashion Outlet",
    rows: [],
    exportable: true,
    explorable: true,
    customData: {
      sectors: ["Retail"],
      stores: [
        {
          storeId: "FO-DHAKA-01",
          rows: [
            {
              date: "2025-01-18",
              success: 10,
              pending: 2,
              failed: 1,
              cancelled: 1,
              totalTransactions: 14,
            },
            {
              date: "2025-01-17",
              success: 12,
              pending: 1,
              failed: 2,
              cancelled: 0,
              totalTransactions: 15,
            },
          ],
        },
        {
          storeId: "FO-CTG-02",
          rows: [
            {
              date: "2025-01-18",
              success: 8,
              pending: 1,
              failed: 1,
              cancelled: 0,
              totalTransactions: 10,
            },
          ],
        },
      ],
    },
  },
  {
    sectionId: "M-1002",
    title: "Tech Gadgets Ltd",
    rows: [],
    exportable: true,
    explorable: true,
    customData: {
      sectors: ["Pureplay Ecommerce"],
      stores: [
        {
          storeId: "TG-WEB",
          rows: [
            {
              date: "2025-01-18",
              success: 45,
              pending: 5,
              failed: 3,
              cancelled: 2,
              totalTransactions: 55,
            },
          ],
        },
      ],
    },
  },
  {
    sectionId: "M-1003",
    title: "Daily Groceries",
    rows: [],
    exportable: true,
    explorable: true,
    customData: {
      sectors: ["Retail", "Food"],
      stores: [
        {
          storeId: "DG-BANANI",
          rows: [
            {
              date: "2025-01-18",
              success: 35,
              pending: 2,
              failed: 2,
              cancelled: 1,
              totalTransactions: 40,
            },
          ],
        },
      ],
    },
  },
];

const generateGrowthData = (
  type: "merchant" | "segment" = "merchant",
): ReportSection[] => [
  {
    sectionId: "M-77007",
    title: "Masud Store 02",
    rows: [],
    exportable: true,
    explorable: true,
    customData: {
      type,
      sector: type === "merchant" ? "RETAIL" : "",
      segment: type === "merchant" ? "Micro" : "",
      monthlyData: {
        February: { revenue: 0.75, momGrowth: "0%" },
        March: { revenue: 0.16, momGrowth: "-78%", color: "red" },
      },
    },
  },
  {
    sectionId: "M-77001",
    title: "Ekushey E Shop",
    rows: [],
    exportable: true,
    explorable: true,
    customData: {
      type,
      sector: type === "merchant" ? "ECOMMERCE" : "",
      segment: type === "merchant" ? "Enterprise" : "",
      monthlyData: {
        February: { revenue: 47.88, momGrowth: "0%" },
        July: { revenue: 5.98, momGrowth: "-88%", color: "red" },
      },
    },
  },
  {
    sectionId: "M-77002",
    title: "Sandbox Live Test",
    rows: [],
    exportable: true,
    explorable: true,
    customData: {
      type,
      sector: type === "merchant" ? "FINTECH" : "",
      segment: type === "merchant" ? "SME" : "",
      monthlyData: {
        February: { revenue: 0.04, momGrowth: "0%" },
        July: { revenue: 422.75, momGrowth: "900%", color: "green" },
        August: { revenue: 23.11, momGrowth: "-94%", color: "red" },
      },
    },
  },
  {
    sectionId: "M-77003",
    title: "easy.com.bd",
    rows: [],
    exportable: true,
    explorable: true,
    customData: {
      type,
      sector: type === "merchant" ? "ECOMMERCE" : "",
      segment: type === "merchant" ? "Corporate" : "",
      monthlyData: {
        February: { revenue: 0.75, momGrowth: "0%" },
        March: { revenue: 0.0, momGrowth: "120%", color: "green" },
        April: { revenue: 0.0, momGrowth: "8991%", color: "green" },
      },
    },
  },
  {
    sectionId: "M-77004",
    title: "Test Ecommerce",
    rows: [],
    exportable: true,
    explorable: true,
    customData: {
      type,
      sector: type === "merchant" ? "ECOMMERCE" : "",
      segment: type === "merchant" ? "Micro" : "",
      monthlyData: {
        March: { revenue: 0.0, momGrowth: "0%" },
        April: { revenue: 0.0, momGrowth: "-100%", color: "red" },
      },
    },
  },
  {
    sectionId: "M-77005",
    title: "Arafat Manufacturing",
    rows: [],
    exportable: true,
    explorable: true,
    customData: {
      type,
      sector: type === "merchant" ? "MANUFACTURING" : "",
      segment: type === "merchant" ? "Enterprise" : "",
      monthlyData: {
        April: { revenue: 23.59, momGrowth: "0%" },
      },
    },
  },
  {
    sectionId: "M-77006",
    title: "Arafat Motors",
    rows: [],
    exportable: true,
    explorable: true,
    customData: {
      type,
      sector: type === "merchant" ? "AUTOMOTIVE" : "",
      segment: type === "merchant" ? "Corporate" : "",
      monthlyData: {
        April: { revenue: 0.0, momGrowth: "0%" },
      },
    },
  },
];

const generateSurveyData = (): ReportSection[] => [
  {
    sectionId: "M-1001",
    title: "Fashion Outlet",
    rows: [],
    exportable: true,
    explorable: true,
    customData: {
      sectors: ["Retail"],
      stores: [
        {
          storeId: "FO-DHAKA-01",
          rows: [
            {
              month: "November 2025",
              totalCount: 3,
              veryUnsafe: 0,
              unsafe: 1,
              neutral: 0,
              safe: 1,
              verySafe: 1,
            },
            {
              month: "October 2025",
              totalCount: 2,
              veryUnsafe: 0,
              unsafe: 1,
              neutral: 0,
              safe: 1,
              verySafe: 0,
            },
          ],
        },
        {
          storeId: "FO-CTG-02",
          rows: [
            {
              month: "September 2025",
              totalCount: 2,
              veryUnsafe: 2,
              unsafe: 0,
              neutral: 0,
              safe: 0,
              verySafe: 0,
            },
          ],
        },
      ],
    },
  },
  {
    sectionId: "M-1002",
    title: "Tech Gadgets Ltd",
    rows: [],
    exportable: true,
    explorable: true,
    customData: {
      sectors: ["Pureplay Ecommerce"],
      stores: [
        {
          storeId: "TG-WEB",
          rows: [
            {
              month: "August 2025",
              totalCount: 2,
              veryUnsafe: 1,
              unsafe: 0,
              neutral: 0,
              safe: 0,
              verySafe: 1,
            },
          ],
        },
      ],
    },
  },
  {
    sectionId: "M-1003",
    title: "Daily Groceries",
    rows: [],
    exportable: true,
    explorable: true,
    customData: {
      sectors: ["Retail", "Food"],
      stores: [
        {
          storeId: "DG-BANANI",
          rows: [
            {
              month: "July 2025",
              totalCount: 2,
              veryUnsafe: 1,
              unsafe: 0,
              neutral: 0,
              safe: 0,
              verySafe: 1,
            },
          ],
        },
      ],
    },
  },
];

const generateMerchantOnboardingData = (): ReportSection[] => [
  {
    sectionId: "monthly-onboarding",
    title: "Monthly Merchant Onboarding",
    rows: [],
    exportable: true,
    explorable: false,
    customData: {
      rows: [
        { month: "Jun (2025)", physical: 3, online: 0, total: 3 },
        { month: "Jul (2025)", physical: 0, online: 2, total: 2 },
        { month: "Aug (2025)", physical: 4, online: 3, total: 7 },
        { month: "Sep (2025)", physical: 1, online: 5, total: 6 },
        { month: "Oct (2025)", physical: 0, online: 3, total: 3 },
        { month: "Nov (2025)", physical: 16, online: 12, total: 28 },
        { month: "Dec (2025)", physical: 4, online: 1, total: 5 },
        { month: "Jan (2026)", physical: 20, online: 12, total: 32 },
        { month: "Feb (2026)", physical: 1, online: 3, total: 4 },
        { month: "Mar (2026)", physical: 2, online: 21, total: 23 },
        { month: "Apr (2026)", physical: 0, online: 0, total: 0 },
        { month: "May (2026)", physical: 7, online: 10, total: 17 },
        { month: "Jun (2026)", physical: 0, online: 3, total: 3 },
      ],
    },
  },
];

const HUNTER_ONBOARDING_MONTH_COLUMNS = [
  { key: "2025-06", label: "JUN 25" },
  { key: "2025-07", label: "JUL 25" },
  { key: "2025-08", label: "AUG 25" },
  { key: "2025-09", label: "SEP 25" },
  { key: "2025-10", label: "OCT 25" },
  { key: "2025-11", label: "NOV 25" },
  { key: "2025-12", label: "DEC 25" },
  { key: "2026-01", label: "JAN 26" },
  { key: "2026-02", label: "FEB 26" },
  { key: "2026-03", label: "MAR 26" },
  { key: "2026-04", label: "APR 26" },
  { key: "2026-05", label: "MAY 26" },
  { key: "2026-06", label: "JUN 26" },
];

const generateHunterWiseMerchantOnboardingData = (): ReportSection[] => [
  {
    sectionId: "hunter-wise-onboarding",
    title: "Hunter Wise Merchant Onboarding",
    rows: [],
    exportable: true,
    explorable: false,
    customData: {
      monthColumns: HUNTER_ONBOARDING_MONTH_COLUMNS,
      rows: [
        {
          hunterName: "zakia",
          monthly: {
            "2025-06": 0,
            "2025-07": 0,
            "2025-08": 0,
            "2025-09": 0,
            "2025-10": 0,
            "2025-11": 1,
            "2025-12": 0,
            "2026-01": 2,
            "2026-02": 0,
            "2026-03": 0,
            "2026-04": 0,
            "2026-05": 0,
            "2026-06": 0,
          },
          total: 3,
        },
        {
          hunterName: "tanvir",
          monthly: {
            "2025-06": 1,
            "2025-07": 0,
            "2025-08": 2,
            "2025-09": 1,
            "2025-10": 0,
            "2025-11": 5,
            "2025-12": 1,
            "2026-01": 4,
            "2026-02": 1,
            "2026-03": 3,
            "2026-04": 0,
            "2026-05": 2,
            "2026-06": 1,
          },
          total: 21,
        },
        {
          hunterName: "rahim",
          monthly: {
            "2025-06": 1,
            "2025-07": 1,
            "2025-08": 1,
            "2025-09": 2,
            "2025-10": 2,
            "2025-11": 3,
            "2025-12": 1,
            "2026-01": 3,
            "2026-02": 1,
            "2026-03": 4,
            "2026-04": 0,
            "2026-05": 3,
            "2026-06": 0,
          },
          total: 22,
        },
        {
          hunterName: "nusrat",
          monthly: {
            "2025-06": 0,
            "2025-07": 1,
            "2025-08": 0,
            "2025-09": 2,
            "2025-10": 1,
            "2025-11": 6,
            "2025-12": 2,
            "2026-01": 8,
            "2026-02": 0,
            "2026-03": 9,
            "2026-04": 0,
            "2026-05": 4,
            "2026-06": 1,
          },
          total: 34,
        },
        {
          hunterName: "imran",
          monthly: {
            "2025-06": 1,
            "2025-07": 0,
            "2025-08": 1,
            "2025-09": 1,
            "2025-10": 0,
            "2025-11": 4,
            "2025-12": 1,
            "2026-01": 5,
            "2026-02": 1,
            "2026-03": 2,
            "2026-04": 0,
            "2026-05": 3,
            "2026-06": 1,
          },
          total: 20,
        },
        {
          hunterName: "sadia",
          monthly: {
            "2025-06": 0,
            "2025-07": 0,
            "2025-08": 3,
            "2025-09": 0,
            "2025-10": 0,
            "2025-11": 2,
            "2025-12": 0,
            "2026-01": 3,
            "2026-02": 1,
            "2026-03": 5,
            "2026-04": 0,
            "2026-05": 2,
            "2026-06": 1,
          },
          total: 17,
        },
        {
          hunterName: "farhan",
          monthly: {
            "2025-06": 0,
            "2025-07": 0,
            "2025-08": 0,
            "2025-09": 0,
            "2025-10": 0,
            "2025-11": 7,
            "2025-12": 0,
            "2026-01": 7,
            "2026-02": 1,
            "2026-03": 0,
            "2026-04": 0,
            "2026-05": 3,
            "2026-06": 0,
          },
          total: 18,
        },
      ],
    },
  },
];

const SECTOR_ONBOARDING_MONTH_COLUMNS = [
  { key: "2025-06", label: "Jun25" },
  { key: "2025-07", label: "Jul25" },
  { key: "2025-08", label: "Aug25" },
  { key: "2025-09", label: "Sep25" },
  { key: "2025-10", label: "Oct25" },
  { key: "2025-11", label: "Nov25" },
  { key: "2025-12", label: "Dec25" },
  { key: "2026-01", label: "Jan26" },
  { key: "2026-02", label: "Feb26" },
  { key: "2026-03", label: "Mar26" },
  { key: "2026-04", label: "Apr26" },
  { key: "2026-05", label: "May26" },
  { key: "2026-06", label: "Jun26" },
];

const SECTOR_ONBOARDING_MONTH_KEYS = SECTOR_ONBOARDING_MONTH_COLUMNS.map(
  (column) => column.key,
);

function buildSectorOnboardingRow(
  sectorName: string,
  monthlyValues: number[],
): { sectorName: string; monthly: Record<string, number>; total: number } {
  const monthly = SECTOR_ONBOARDING_MONTH_KEYS.reduce<Record<string, number>>(
    (acc, key, index) => {
      acc[key] = monthlyValues[index] || 0;
      return acc;
    },
    {},
  );

  return {
    sectorName,
    monthly,
    total: monthlyValues.reduce((sum, value) => sum + value, 0),
  };
}

const generateSectorWiseOnboardingData = (): ReportSection[] => [
  {
    sectionId: "sector-wise-onboarding",
    title: "Sector Wise Merchant Onboarding",
    rows: [],
    exportable: true,
    explorable: false,
    customData: {
      monthColumns: SECTOR_ONBOARDING_MONTH_COLUMNS,
      merchantPool: SECTOR_ONBOARDING_MERCHANT_POOL,
      rows: [
        buildSectorOnboardingRow(
          "Agriculture Services",
          [1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
        ),
        buildSectorOnboardingRow(
          "Select One",
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ),
        buildSectorOnboardingRow(
          "Departmental Stores",
          [0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0],
        ),
        buildSectorOnboardingRow(
          "E-commerce",
          [0, 0, 1, 1, 0, 8, 1, 10, 1, 5, 0, 1, 0],
        ),
        buildSectorOnboardingRow(
          "Banking/Financial Institutions",
          [0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0],
        ),
        buildSectorOnboardingRow(
          "Miscellaneous",
          [1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0],
        ),
        buildSectorOnboardingRow(
          "Electronics",
          [0, 0, 1, 1, 0, 1, 0, 2, 0, 1, 0, 0, 0],
        ),
        buildSectorOnboardingRow(
          "Service",
          [0, 1, 1, 0, 1, 2, 0, 2, 0, 1, 0, 0, 0],
        ),
        buildSectorOnboardingRow(
          "Education",
          [0, 0, 1, 2, 0, 4, 1, 6, 1, 2, 0, 1, 0],
        ),
        buildSectorOnboardingRow(
          "Hospitality, Travel & Aviation",
          [0, 0, 1, 0, 0, 2, 1, 2, 0, 1, 0, 0, 0],
        ),
        buildSectorOnboardingRow(
          "Food",
          [0, 0, 1, 1, 0, 2, 0, 2, 0, 2, 0, 1, 0],
        ),
        buildSectorOnboardingRow(
          "Services",
          [1, 1, 2, 1, 1, 5, 1, 5, 1, 3, 0, 1, 0],
        ),
        buildSectorOnboardingRow(
          "Travel Agencies and Tour Operators",
          [0, 0, 0, 0, 0, 2, 0, 2, 1, 1, 0, 0, 0],
        ),
        buildSectorOnboardingRow(
          "Convenience stores",
          [0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0],
        ),
        buildSectorOnboardingRow(
          "Transportation",
          [0, 0, 2, 1, 0, 3, 1, 2, 0, 3, 0, 1, 0],
        ),
      ],
    },
  },
];

const VAS_LEAD_GENERATION_MONTH_COLUMNS = [
  { key: "2025-06", label: "2025 JUN" },
  { key: "2025-07", label: "2025 JUL" },
  { key: "2025-08", label: "2025 AUG" },
  { key: "2025-09", label: "2025 SEP" },
  { key: "2025-10", label: "2025 OCT" },
  { key: "2025-11", label: "2025 NOV" },
  { key: "2025-12", label: "2025 DEC" },
  { key: "2026-01", label: "2026 JAN" },
  { key: "2026-02", label: "2026 FEB" },
  { key: "2026-03", label: "2026 MAR" },
  { key: "2026-04", label: "2026 APR" },
  { key: "2026-05", label: "2026 MAY" },
  { key: "2026-06", label: "2026 JUN" },
];

const VAS_LEAD_GENERATION_MONTH_KEYS = VAS_LEAD_GENERATION_MONTH_COLUMNS.map(
  (column) => column.key,
);

function buildVasServiceRow(
  serviceName: string,
  monthlyValues: number[],
): { serviceName: string; monthly: Record<string, number>; total: number } {
  const monthly = VAS_LEAD_GENERATION_MONTH_KEYS.reduce<Record<string, number>>(
    (acc, key, index) => {
      acc[key] = monthlyValues[index] || 0;
      return acc;
    },
    {},
  );

  return {
    serviceName,
    monthly,
    total: monthlyValues.reduce((sum, value) => sum + value, 0),
  };
}

const generateLeadGenerationVasData = (): ReportSection[] => [
  {
    sectionId: "lead-generation-vas",
    title: "Lead Generation from VAS",
    rows: [],
    exportable: true,
    explorable: false,
    customData: {
      monthColumns: VAS_LEAD_GENERATION_MONTH_COLUMNS,
      leadPool: VAS_LEAD_MERCHANT_POOL,
      rows: [
        buildVasServiceRow(
          "Business SMS (iSMS)",
          [0, 0, 0, 0, 0, 3, 1, 4, 0, 0, 0, 0, 0],
        ),
        buildVasServiceRow(
          "Cash Baba",
          [0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
        ),
        buildVasServiceRow(
          "Ngage 360",
          [0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0],
        ),
        buildVasServiceRow(
          "Voice SMS",
          [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
        ),
        buildVasServiceRow(
          "Chatbot (iBot)",
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
        ),
        buildVasServiceRow(
          "SSL Certificate",
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
        ),
        buildVasServiceRow(
          "Virtual Recharge Platform (Topup)",
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
        ),
      ],
    },
  },
];

const generateInstantSignupAnalyticsData = (): ReportSection[] => [
  {
    sectionId: "instant-signup-analytics",
    title: "Instant SignUp Analytics",
    rows: [],
    exportable: true,
    explorable: false,
    customData: {
      pageViews: INSTANT_SIGNUP_PAGE_VIEWS,
      countryUsers: INSTANT_SIGNUP_COUNTRY_USERS,
      engagementMetrics: INSTANT_SIGNUP_ENGAGEMENT_METRICS,
      pageEngagement: INSTANT_SIGNUP_PAGE_ENGAGEMENT,
      conversionMetrics: INSTANT_SIGNUP_CONVERSION_METRICS,
      dropoffRates: INSTANT_SIGNUP_DROPOFF_RATES,
      mediumTraffic: INSTANT_SIGNUP_MEDIUM_TRAFFIC,
      userTypes: INSTANT_SIGNUP_USER_TYPES,
      deviceUsage: INSTANT_SIGNUP_DEVICE_USAGE,
    },
  },
];

const generatePaymentAnalyticsData = (): ReportSection[] => [
  {
    sectionId: "payment-analytics",
    title: "Payment Analytics Report",
    rows: [],
    exportable: true,
    explorable: false,
  },
];

const generateReferralReportData = (): ReportSection[] => [
  {
    sectionId: "referral-report",
    title: "Referral Report",
    rows: [],
    exportable: true,
    explorable: false,
    customData: {
      codeSummary: REFERRAL_CODE_SUMMARY,
      onboardedMerchants: REFERRAL_ONBOARDED_MERCHANTS,
      invitations: REFERRAL_INVITATIONS,
    },
  },
];

const KAM_TRANSACTION_MONTH_COLUMNS = [
  { key: "2025-06", label: "JUN 25" },
  { key: "2025-07", label: "JUL 25" },
  { key: "2025-08", label: "AUG 25" },
  { key: "2025-09", label: "SEP 25" },
  { key: "2025-10", label: "OCT 25" },
  { key: "2025-11", label: "NOV 25" },
  { key: "2025-12", label: "DEC 25" },
  { key: "2026-01", label: "JAN 26" },
  { key: "2026-02", label: "FEB 26" },
  { key: "2026-03", label: "MAR 26" },
  { key: "2026-04", label: "APR 26" },
  { key: "2026-05", label: "MAY 26" },
  { key: "2026-06", label: "JUN 26" },
];

const generateKamTransactionReportData = (): ReportSection[] => [
  {
    sectionId: "kam-transaction-summary",
    title: "KAM Transaction Summary",
    rows: [],
    exportable: true,
    explorable: false,
    customData: {
      monthColumns: KAM_TRANSACTION_MONTH_COLUMNS,
      amount: {
        rows: [
          {
            kamName: "Anik Kam",
            monthly: {
              "2025-06": 0,
              "2025-07": 0,
              "2025-08": 0,
              "2025-09": 0,
              "2025-10": 0,
              "2025-11": 0,
              "2025-12": 0,
              "2026-01": 0,
              "2026-02": 0,
              "2026-03": 0,
              "2026-04": 0,
              "2026-05": 0,
              "2026-06": 0,
            },
            total: 0,
          },
          {
            kamName: "Nahid",
            monthly: {
              "2025-06": 0,
              "2025-07": 0,
              "2025-08": 0,
              "2025-09": 0,
              "2025-10": 0,
              "2025-11": 0,
              "2025-12": 0,
              "2026-01": 71300,
              "2026-02": 8730,
              "2026-03": 0,
              "2026-04": 15930,
              "2026-05": 8300,
              "2026-06": 0,
            },
            total: 104260,
          },
          {
            kamName: "QA",
            monthly: {
              "2025-06": 0,
              "2025-07": 0,
              "2025-08": 0,
              "2025-09": 0,
              "2025-10": 0,
              "2025-11": 0,
              "2025-12": 0,
              "2026-01": 0,
              "2026-02": 0,
              "2026-03": 0,
              "2026-04": 0,
              "2026-05": 0,
              "2026-06": 0,
            },
            total: 0,
          },
          {
            kamName: "saifur",
            monthly: {
              "2025-06": 0,
              "2025-07": 0,
              "2025-08": 0,
              "2025-09": 0,
              "2025-10": 0,
              "2025-11": 0,
              "2025-12": 0,
              "2026-01": 0,
              "2026-02": 0,
              "2026-03": 0,
              "2026-04": 0,
              "2026-05": 0,
              "2026-06": 0,
            },
            total: 0,
          },
          {
            kamName: "Shahriar",
            monthly: {
              "2025-06": 0,
              "2025-07": 0,
              "2025-08": 0,
              "2025-09": 0,
              "2025-10": 0,
              "2025-11": 0,
              "2025-12": 0,
              "2026-01": 0,
              "2026-02": 0,
              "2026-03": 0,
              "2026-04": 0,
              "2026-05": 0,
              "2026-06": 0,
            },
            total: 0,
          },
          {
            kamName: "susanta.kam",
            monthly: {
              "2025-06": 0,
              "2025-07": 224,
              "2025-08": 125.5,
              "2025-09": 0,
              "2025-10": 0,
              "2025-11": 0,
              "2025-12": 0,
              "2026-01": 213920,
              "2026-02": 52,
              "2026-03": 31400,
              "2026-04": 5150,
              "2026-05": 131430,
              "2026-06": 0,
            },
            total: 382301.5,
          },
          {
            kamName: "susanta.tech",
            monthly: {
              "2025-06": 0,
              "2025-07": 32,
              "2025-08": 0,
              "2025-09": 0,
              "2025-10": 0,
              "2025-11": 0,
              "2025-12": 0,
              "2026-01": 0,
              "2026-02": 0,
              "2026-03": 0,
              "2026-04": 0,
              "2026-05": 0,
              "2026-06": 0,
            },
            total: 32,
          },
          {
            kamName: "Tahsin",
            monthly: {
              "2025-06": 0,
              "2025-07": 0,
              "2025-08": 0,
              "2025-09": 0,
              "2025-10": 0,
              "2025-11": 0,
              "2025-12": 0,
              "2026-01": 0,
              "2026-02": 16860,
              "2026-03": 8470,
              "2026-04": 45850,
              "2026-05": 11720,
              "2026-06": 0,
            },
            total: 82900,
          },
        ],
      },
      transaction: {
        rows: [
          {
            kamName: "Anik Kam",
            monthly: {
              "2025-06": 0,
              "2025-07": 0,
              "2025-08": 0,
              "2025-09": 0,
              "2025-10": 0,
              "2025-11": 0,
              "2025-12": 0,
              "2026-01": 0,
              "2026-02": 0,
              "2026-03": 0,
              "2026-04": 0,
              "2026-05": 0,
              "2026-06": 0,
            },
            total: 0,
          },
          {
            kamName: "Nahid",
            monthly: {
              "2025-06": 0,
              "2025-07": 0,
              "2025-08": 0,
              "2025-09": 0,
              "2025-10": 0,
              "2025-11": 0,
              "2025-12": 0,
              "2026-01": 14,
              "2026-02": 13,
              "2026-03": 0,
              "2026-04": 7,
              "2026-05": 3,
              "2026-06": 0,
            },
            total: 37,
          },
          {
            kamName: "QA",
            monthly: {
              "2025-06": 0,
              "2025-07": 0,
              "2025-08": 0,
              "2025-09": 0,
              "2025-10": 0,
              "2025-11": 0,
              "2025-12": 0,
              "2026-01": 0,
              "2026-02": 0,
              "2026-03": 1,
              "2026-04": 0,
              "2026-05": 0,
              "2026-06": 0,
            },
            total: 1,
          },
          {
            kamName: "saifur",
            monthly: {
              "2025-06": 0,
              "2025-07": 0,
              "2025-08": 0,
              "2025-09": 0,
              "2025-10": 0,
              "2025-11": 0,
              "2025-12": 0,
              "2026-01": 1,
              "2026-02": 2,
              "2026-03": 0,
              "2026-04": 0,
              "2026-05": 0,
              "2026-06": 0,
            },
            total: 3,
          },
          {
            kamName: "Shahriar",
            monthly: {
              "2025-06": 0,
              "2025-07": 0,
              "2025-08": 0,
              "2025-09": 0,
              "2025-10": 0,
              "2025-11": 0,
              "2025-12": 0,
              "2026-01": 9,
              "2026-02": 0,
              "2026-03": 0,
              "2026-04": 0,
              "2026-05": 0,
              "2026-06": 0,
            },
            total: 9,
          },
          {
            kamName: "susanta.kam",
            monthly: {
              "2025-06": 0,
              "2025-07": 8,
              "2025-08": 5,
              "2025-09": 0,
              "2025-10": 0,
              "2025-11": 0,
              "2025-12": 0,
              "2026-01": 286,
              "2026-02": 32,
              "2026-03": 9,
              "2026-04": 6,
              "2026-05": 38,
              "2026-06": 0,
            },
            total: 384,
          },
          {
            kamName: "susanta.tech",
            monthly: {
              "2025-06": 0,
              "2025-07": 3,
              "2025-08": 0,
              "2025-09": 0,
              "2025-10": 0,
              "2025-11": 0,
              "2025-12": 0,
              "2026-01": 0,
              "2026-02": 0,
              "2026-03": 0,
              "2026-04": 0,
              "2026-05": 0,
              "2026-06": 0,
            },
            total: 3,
          },
          {
            kamName: "Tahsin",
            monthly: {
              "2025-06": 0,
              "2025-07": 0,
              "2025-08": 0,
              "2025-09": 0,
              "2025-10": 0,
              "2025-11": 0,
              "2025-12": 0,
              "2026-01": 0,
              "2026-02": 132,
              "2026-03": 20,
              "2026-04": 32,
              "2026-05": 36,
              "2026-06": 0,
            },
            total: 220,
          },
        ],
      },
      revenue: {
        rows: [
          {
            kamName: "Anik Kam",
            monthly: {
              "2025-06": 0,
              "2025-07": 0,
              "2025-08": 0,
              "2025-09": 0,
              "2025-10": 0,
              "2025-11": 0,
              "2025-12": 0,
              "2026-01": 0,
              "2026-02": 0,
              "2026-03": 0,
              "2026-04": 0,
              "2026-05": 0,
              "2026-06": 0,
            },
            total: 0,
          },
          {
            kamName: "Nahid",
            monthly: {
              "2025-06": 0,
              "2025-07": 0,
              "2025-08": 0,
              "2025-09": 0,
              "2025-10": 0,
              "2025-11": 0,
              "2025-12": 0,
              "2026-01": 1010.54,
              "2026-02": 675.4,
              "2026-03": 0,
              "2026-04": 1260.4,
              "2026-05": 659.84,
              "2026-06": 0,
            },
            total: 3606.18,
          },
          {
            kamName: "QA",
            monthly: {
              "2025-06": 0,
              "2025-07": 0,
              "2025-08": 0,
              "2025-09": 0,
              "2025-10": 0,
              "2025-11": 0,
              "2025-12": 0,
              "2026-01": 0,
              "2026-02": 0,
              "2026-03": 0,
              "2026-04": 0,
              "2026-05": 0,
              "2026-06": 0,
            },
            total: 0,
          },
          {
            kamName: "saifur",
            monthly: {
              "2025-06": 0,
              "2025-07": 0,
              "2025-08": 0,
              "2025-09": 0,
              "2025-10": 0,
              "2025-11": 0,
              "2025-12": 0,
              "2026-01": 0,
              "2026-02": 0,
              "2026-03": 0,
              "2026-04": 0,
              "2026-05": 0,
              "2026-06": 0,
            },
            total: 0,
          },
          {
            kamName: "Shahriar",
            monthly: {
              "2025-06": 0,
              "2025-07": 0,
              "2025-08": 0,
              "2025-09": 0,
              "2025-10": 0,
              "2025-11": 0,
              "2025-12": 0,
              "2026-01": 709.4,
              "2026-02": 0,
              "2026-03": 0,
              "2026-04": 0,
              "2026-05": 0,
              "2026-06": 0,
            },
            total: 709.4,
          },
          {
            kamName: "susanta.kam",
            monthly: {
              "2025-06": 0,
              "2025-07": 397.6,
              "2025-08": 222.5,
              "2025-09": 0,
              "2025-10": 0,
              "2025-11": 0,
              "2025-12": 0,
              "2026-01": 3791.6,
              "2026-02": 920,
              "2026-03": 568.6,
              "2026-04": 91.08,
              "2026-05": 2375.74,
              "2026-06": 0,
            },
            total: 8367.12,
          },
          {
            kamName: "susanta.tech",
            monthly: {
              "2025-06": 0,
              "2025-07": 56.8,
              "2025-08": 0,
              "2025-09": 0,
              "2025-10": 0,
              "2025-11": 0,
              "2025-12": 0,
              "2026-01": 0,
              "2026-02": 0,
              "2026-03": 0,
              "2026-04": 0,
              "2026-05": 0,
              "2026-06": 0,
            },
            total: 56.8,
          },
          {
            kamName: "Tahsin",
            monthly: {
              "2025-06": 0,
              "2025-07": 0,
              "2025-08": 0,
              "2025-09": 0,
              "2025-10": 0,
              "2025-11": 0,
              "2025-12": 0,
              "2026-01": 0,
              "2026-02": 294.2,
              "2026-03": 149.8,
              "2026-04": 826,
              "2026-05": 211.4,
              "2026-06": 0,
            },
            total: 1481.4,
          },
        ],
      },
    },
  },
];

const generateSectorWiseData = (): ReportSection[] => [
  {
    sectionId: "sector-1",
    title: "Services",
    rows: [],
    exportable: true,
    explorable: true,
    customData: {
      monthlyData: {
        January: { number: 0, amount: 0, revenue: 0 },
        February: { number: 1, amount: 100, revenue: 10 },
        March: { number: 1, amount: 22, revenue: 2.2 }, // -78% growth
        April: { number: 0, amount: 0, revenue: 0 },
        May: { number: 0, amount: 0, revenue: 0 },
        June: { number: 0, amount: 0, revenue: 0 },
        July: { number: 0, amount: 0, revenue: 0 },
        August: { number: 0, amount: 0, revenue: 0 },
        September: { number: 0, amount: 0, revenue: 0 },
        October: { number: 0, amount: 0, revenue: 0 },
        November: { number: 0, amount: 0, revenue: 0 },
        December: { number: 0, amount: 0, revenue: 0 },
      },
    },
  },
  {
    sectionId: "sector-2",
    title: "education",
    rows: [],
    exportable: true,
    explorable: true,
    customData: {
      monthlyData: {
        January: { number: 0, amount: 0, revenue: 0 },
        February: { number: 3, amount: 300, revenue: 30 },
        March: { number: 0, amount: 0, revenue: 0 },
        April: { number: 0, amount: 0, revenue: 0 },
        May: { number: 0, amount: 0, revenue: 0 },
        June: { number: 0, amount: 0, revenue: 0 },
        July: { number: 3, amount: 15, revenue: 1.5 }, // -95% growth
        August: { number: 0, amount: 0, revenue: 0 },
        September: { number: 0, amount: 0, revenue: 0 },
        October: { number: 0, amount: 0, revenue: 0 },
        November: { number: 0, amount: 0, revenue: 0 },
        December: { number: 0, amount: 0, revenue: 0 },
      },
    },
  },
  {
    sectionId: "sector-3",
    title: "Automobile",
    rows: [],
    exportable: true,
    explorable: true,
    customData: {
      monthlyData: {
        January: { number: 0, amount: 0, revenue: 0 },
        February: { number: 2, amount: 200, revenue: 20 },
        March: { number: 6, amount: 42.8, revenue: 42.8 }, // ~114% growth
        April: { number: 6, amount: 3890, revenue: 3890 }, // ~8991% growth
        May: { number: 0, amount: 0, revenue: 0 },
        June: { number: 0, amount: 0, revenue: 0 },
        July: { number: 8, amount: 13.1, revenue: 13.1 }, // ~31% growth from previous non-zero
        August: { number: 5, amount: 0.78, revenue: 0.78 }, // ~-94% growth
        September: { number: 0, amount: 0, revenue: 0 },
        October: { number: 0, amount: 0, revenue: 0 },
        November: { number: 0, amount: 0, revenue: 0 },
        December: { number: 0, amount: 0, revenue: 0 },
      },
    },
  },
  {
    sectionId: "sector-4",
    title: "Education",
    rows: [],
    exportable: true,
    explorable: true,
    customData: {
      monthlyData: {
        January: { number: 0, amount: 0, revenue: 0 },
        February: { number: 0, amount: 0, revenue: 0 },
        March: { number: 6, amount: 600, revenue: 60 },
        April: { number: 0, amount: 0, revenue: 0 }, // -100% growth
        May: { number: 0, amount: 0, revenue: 0 },
        June: { number: 0, amount: 0, revenue: 0 },
        July: { number: 0, amount: 0, revenue: 0 },
        August: { number: 0, amount: 0, revenue: 0 },
        September: { number: 0, amount: 0, revenue: 0 },
        October: { number: 0, amount: 0, revenue: 0 },
        November: { number: 0, amount: 0, revenue: 0 },
        December: { number: 0, amount: 0, revenue: 0 },
      },
    },
  },
  {
    sectionId: "sector-5",
    title: "Variety Store",
    rows: [],
    exportable: true,
    explorable: true,
    customData: {
      monthlyData: {
        January: { number: 0, amount: 0, revenue: 0 },
        February: { number: 0, amount: 0, revenue: 0 },
        March: { number: 0, amount: 0, revenue: 0 },
        April: { number: 45, amount: 4500, revenue: 450 },
        May: { number: 0, amount: 0, revenue: 0 },
        June: { number: 0, amount: 0, revenue: 0 },
        July: { number: 0, amount: 0, revenue: 0 },
        August: { number: 0, amount: 0, revenue: 0 },
        September: { number: 0, amount: 0, revenue: 0 },
        October: { number: 0, amount: 0, revenue: 0 },
        November: { number: 0, amount: 0, revenue: 0 },
        December: { number: 0, amount: 0, revenue: 0 },
      },
    },
  },
];

const generateSegmentTnxData = (): ReportSection[] => [
  {
    sectionId: "SEG-1",
    title: "Tech | Enterprise",
    rows: [],
    exportable: true,
    explorable: true,
    customData: {
      monthlyData: {
        January: { revenue: 2.3, momGrowth: "0%" },
        February: { revenue: 0, momGrowth: "0%" },
        March: { revenue: 0.0, momGrowth: "-100%", color: "red" },
        April: { revenue: 0, momGrowth: "0%" },
        May: { revenue: 0, momGrowth: "0%" },
        June: { revenue: 0, momGrowth: "0%" },
        July: { revenue: 0, momGrowth: "0%" },
        August: { revenue: 0, momGrowth: "0%" },
        September: { revenue: 0, momGrowth: "0%" },
        October: { revenue: 0, momGrowth: "0%" },
        November: { revenue: 0, momGrowth: "0%" },
        December: { revenue: 0, momGrowth: "0%" },
      },
    },
  },
  {
    sectionId: "SEG-2",
    title: "Furniture | Corporate",
    rows: [],
    exportable: true,
    explorable: true,
    customData: {
      monthlyData: {
        January: { revenue: 0, momGrowth: "0%" },
        February: { revenue: 0.1, momGrowth: "0%" },
        March: { revenue: 0, momGrowth: "0%" },
        April: { revenue: 0, momGrowth: "0%" },
        May: { revenue: 0, momGrowth: "0%" },
        June: { revenue: 0, momGrowth: "0%" },
        July: { revenue: 0.0, momGrowth: "-100%", color: "red" },
        August: { revenue: 0.06, momGrowth: "0%" },
        September: { revenue: 0.35, momGrowth: "250%", color: "green" },
        October: { revenue: 0, momGrowth: "0%" },
        November: { revenue: 0, momGrowth: "-100%", color: "red" },
        December: { revenue: 886.43, momGrowth: "0%" },
      },
    },
  },
];

const generateKamRevenueData = (): ReportSection[] => [
  {
    sectionId: "kam-revenue",
    title: "Revenue Report",
    rows: [],
    exportable: true,
    explorable: false,
    customData: {
      reportType: "management-revenue",
    },
  },
];

const generateKamFailedData = (): ReportSection[] => [
  {
    sectionId: "oct-2025",
    title: "October 2025",
    rows: [],
    exportable: true,
    explorable: true,
    customData: {
      month: "October",
      monthYear: "2025-10",
      failedTnx: [
        {
          date: "2025-10-09",
          errorDescription: "Card Issuer Bank Declined",
          timesFailed: 1,
          detailTime: "2025-08-10 10:25:35",
        },
        {
          date: "2025-10-10",
          errorDescription: "Insufficient Funds",
          timesFailed: 2,
          detailTime: "2025-10-10 11:30:15",
        },
        {
          date: "2025-10-15",
          errorDescription: "3D Secure Authentication Failed",
          timesFailed: 5,
          detailTime: "2025-10-15 16:45:00",
        },
      ],
      totals: {
        timesFailed: 8,
      },
    },
  },
  {
    sectionId: "sep-2025",
    title: "September 2025",
    rows: [],
    exportable: true,
    explorable: true,
    customData: {
      month: "September",
      monthYear: "2025-09",
      failedTnx: [
        {
          date: "2025-09-01",
          errorDescription: "System Error",
          timesFailed: 1,
          detailTime: "2025-09-01 09:00:00",
        },
        {
          date: "2025-09-15",
          errorDescription: "Insufficient Funds",
          timesFailed: 3,
          detailTime: "2025-09-15 14:20:10",
        },
      ],
      totals: {
        timesFailed: 4,
      },
    },
  },
];

const generateIncentiveData = (): ReportSection[] => [
  {
    sectionId: "incentive-summary",
    title: "Incentive summary",
    rows: [
      { label: "Total incentives earned", amount: "৳ 567,890.00" },
      { label: "Paid out", amount: "৳ 456,789.00" },
      { label: "Pending", amount: "৳ 111,101.00" },
    ],
    exportable: true,
    explorable: true,
  },
  {
    sectionId: "incentive-by-type",
    title: "By incentive type",
    rows: [
      { label: "Volume bonus", amount: "৳ 234,567.00" },
      { label: "Activation bonus", amount: "৳ 123,456.00" },
      { label: "Retention bonus", amount: "৳ 98,765.00" },
      { label: "Performance bonus", amount: "৳ 111,102.00" },
    ],
    exportable: true,
    explorable: false,
  },
];

const generateMonthlyGrowthData = (): ReportSection[] => [
  {
    sectionId: "monthly-comparison",
    title: "Monthly comparison",
    rows: [
      { label: "January", amount: "৳ 4,567,890.00" },
      { label: "December", amount: "৳ 4,234,567.00" },
      { label: "November", amount: "৳ 3,890,123.00" },
      { label: "October", amount: "৳ 3,678,901.00" },
    ],
    exportable: true,
    explorable: true,
  },
  {
    sectionId: "growth-analysis",
    title: "Growth analysis",
    rows: [
      { label: "Average monthly growth", amount: "+7.8%" },
      { label: "Best performing month", amount: "January (+12.4%)" },
      { label: "YTD growth", amount: "+45.2%" },
    ],
    exportable: true,
    explorable: false,
  },
];

const generateFinancialYearData = (): ReportSection[] => [
  {
    sectionId: "FY-2024-2025",
    title: "2024-2025",
    rows: [],
    exportable: true,
    explorable: true,
    customData: {
      year: "2024-2025",
      merchants: [
        {
          merchantId: "demotest",
          merchantName: "Sandbox Live Test",
          status: "Generated",
          downloadUrl: "/downloads/reports/fy-2024-2025-demotest.pdf",
        },
        {
          merchantId: "m-77001",
          merchantName: "Ekushey E Shop",
          status: "Generated",
          downloadUrl: "/downloads/reports/fy-2024-2025-m-77001.pdf",
        },
      ],
      totals: {
        merchantCount: 2,
      },
    },
  },
  {
    sectionId: "FY-2023-2024",
    title: "2023-2024",
    rows: [],
    exportable: true,
    explorable: true,
    customData: {
      year: "2023-2024",
      merchants: [
        {
          merchantId: "demotest",
          merchantName: "Sandbox Live Test",
          status: "Processing",
          downloadUrl: null,
        },
        {
          merchantId: "m-77002",
          merchantName: "Tech Gadgets Ltd",
          status: "Generated",
          downloadUrl: "/downloads/reports/fy-2023-2024-m-77002.pdf",
        },
      ],
      totals: {
        merchantCount: 2,
      },
    },
  },
];

const generateMonthlyTransactionAnalysisData = (): ReportSection[] => [
  {
    sectionId: "analysis-1",
    title: "Monthly Transaction Analysis",
    rows: [],
    exportable: true,
    explorable: false,
    customData: {
      summaryStats: {
        declineCount: 168,
        declineAmount: 1450280.0,
        declinePercentage: 24.5,
        increaseCount: 245,
        increasePercentage: 32.15,
      },
      sectorAnalysis: [
        { sector: "Automobile", count: 12, color: "#d34a5d" },
        { sector: "Retail", count: 45, color: "#d34a5d" },
        { sector: "Ecommerce", count: 38, color: "#d34a5d" },
        { sector: "Education", count: 18, color: "#d34a5d" },
        { sector: "Apparel", count: 29, color: "#d34a5d" },
        { sector: "Healthcare", count: 15, color: "#d34a5d" },
        { sector: "IT & Software", count: 22, color: "#d34a5d" },
      ],
      monthlyDecline: [
        { period: "Sept", count: 15 },
        { period: "Oct", count: 28 },
        { period: "Nov", count: 12 },
        { period: "Dec", count: 35 },
        { period: "Jan", count: 18 },
        { period: "Feb", count: 42 },
        { period: "Mar", count: 23 },
        { period: "Apr", count: 10 },
      ],
      analysisTable: [
        {
          id: "demotest",
          name: "Sandbox Live Test",
          category: "Automobile",
          sector: "Automobile",
          prevMonthAmount: 61278.0,
          currentMonthAmount: 45200.0,
          momChange: -26.23,
          prevMonthName: "February",
          currentMonthName: "March",
        },
        {
          id: "easyapp",
          name: "Easy App Solutions",
          category: "Retail",
          sector: "Consumer Goods",
          prevMonthAmount: 125400.0,
          currentMonthAmount: 98000.0,
          momChange: -21.85,
          prevMonthName: "February",
          currentMonthName: "March",
        },
        {
          id: "fashionbd",
          name: "Fashion House BD",
          category: "Apparel",
          sector: "Fashion",
          prevMonthAmount: 85000.0,
          currentMonthAmount: 62000.0,
          momChange: -27.06,
          prevMonthName: "February",
          currentMonthName: "March",
        },
        {
          id: "techmart",
          name: "TechMart Online",
          category: "IT & Software",
          sector: "Technology",
          prevMonthAmount: 210000.0,
          currentMonthAmount: 175000.0,
          momChange: -16.67,
          prevMonthName: "February",
          currentMonthName: "March",
        },
        {
          id: "groceryplus",
          name: "Grocery Plus",
          category: "Retail",
          sector: "Consumer Goods",
          prevMonthAmount: 45000.0,
          currentMonthAmount: 38000.0,
          momChange: -15.56,
          prevMonthName: "February",
          currentMonthName: "March",
        },
      ],
    },
  },
];

const generateGatewayTransactionData = (): ReportSection[] => {
  const gateways = [
    {
      id: "BKASH",
      title: "BKASH-BKash",
      data: Object.fromEntries([
        ...Array.from({ length: 31 }, (_, i) => [
          String(i + 1),
          { count: 0, amount: 0 },
        ]),
        ["9", { count: 2, amount: 40.0 }],
        ["10", { count: 1, amount: 5000.0 }],
      ]),
    },
    {
      id: "VISA-EBL",
      title: "VISA-Eastern Bank Limited",
      data: Object.fromEntries([
        ...Array.from({ length: 31 }, (_, i) => [
          String(i + 1),
          { count: 0, amount: 0 },
        ]),
        ["9", { count: 7, amount: 55765.99 }],
        ["10", { count: 13, amount: 151399.98 }],
      ]),
    },
    {
      id: "VISA-SBL",
      title: "VISA-Southeast Bank Limited",
      data: Object.fromEntries([
        ...Array.from({ length: 31 }, (_, i) => [
          String(i + 1),
          { count: 0, amount: 0 },
        ]),
        ["9", { count: 3, amount: 89.0 }],
        ["10", { count: 2, amount: 45.0 }],
      ]),
    },
  ];

  return gateways.map((g) => {
    return {
      sectionId: g.id,
      title: g.title,
      rows: [],
      exportable: true,
      explorable: false,
      customData: {
        dailyData: g.data,
      },
    };
  });
};

const generateOperationData = (): ReportSection[] => [
  {
    sectionId: "ops-metrics",
    title: "Operational Metrics",
    rows: [
      { label: "Support Tickets Closed", amount: "450" },
      { label: "Avg Resolution Time", amount: "4.5 Hours" },
      { label: "Merchant Onboarding Time", amount: "2 Days" },
    ],
    exportable: true,
    explorable: true,
  },
];

const generateBounceKamData = (): ReportSection[] => [
  {
    sectionId: "kam-bounce-report-1",
    title: "Upload Settlement Bounce Report",
    rows: [],
    customData: [
      {
        trackingId: "OTQwMTQ3Nzgy",
        fileName: "SETTLEMENT_PAY_REPORT_696ca2e3eebaa.xls",
        updatedBy: "anik.saha@sslwireless.com",
        status: "Processing",
        createdOn: "2026-01-18 18:01:41",
        updatedOn: "2026-01-18 18:01:41",
      },
      {
        trackingId: "Mjg5NjQwOTQwNw",
        fileName: "Reverse Shell.php",
        updatedBy: "sisa.admin",
        status: "Processing",
        createdOn: "2025-05-25 20:02:00",
        updatedOn: "2025-05-25 20:02:00",
      },
      {
        trackingId: "MjgyOTU2NTE1",
        fileName: "SampleRelease2025-04-23_07-09_AM.csv",
        updatedBy: "SISA.SHASHANK",
        status: "Failed",
        createdOn: "2025-04-25 16:07:05",
        updatedOn: "2025-04-25 16:07:05",
      },
      {
        trackingId: "MjAxNDE4NjQ3",
        fileName: "transactions_sample.csv",
        updatedBy: "anik.saha@sslwireless.com",
        status: "Success",
        createdOn: "2024-07-28 12:07:09",
        updatedOn: "2024-07-28 12:07:09",
      },
      {
        trackingId: "MzI2NjUzNDA3",
        fileName: "transactions_sample.csv",
        updatedBy: "anik.saha@sslwireless.com",
        status: "Processing",
        createdOn: "2024-07-28 12:05:47",
        updatedOn: "2024-07-28 12:05:47",
      },
      {
        trackingId: "NTI0ODkwOTE2",
        fileName: "transactions_sample.csv",
        updatedBy: "anik.saha@sslwireless.com",
        status: "Processing",
        createdOn: "2024-07-28 12:04:25",
        updatedOn: "2024-07-28 12:04:25",
      },
    ],
    exportable: true,
    explorable: true,
  },
];

const generateIncentiveReportData = (): ReportSection[] => [
  {
    sectionId: "incentive-report-1",
    title: "Incentive Report",
    rows: [],
    exportable: true,
    explorable: true,
    customData: [
      {
        referenceId: "INC-100234",
        storeId: "STORE-01",
        month: "June 2026",
        target: "৳ 500,000.00",
        status: "Generated",
        incentiveAmount: "৳ 25,000.00",
        settlementStatus: "Settled",
        settlementDate: "2026-06-15",
      },
      {
        referenceId: "INC-100235",
        storeId: "STORE-02",
        month: "June 2026",
        target: "৳ 750,000.00",
        status: "Paid",
        incentiveAmount: "৳ 35,000.00",
        settlementStatus: "Settled",
        settlementDate: "2026-06-18",
      },
      {
        referenceId: "INC-100236",
        storeId: "STORE-03",
        month: "July 2026",
        target: "৳ 1,000,000.00",
        status: "Pending",
        incentiveAmount: "৳ 50,000.00",
        settlementStatus: "Bounce",
        settlementDate: "2026-07-05",
      },
      {
        referenceId: "INC-100237",
        storeId: "STORE-01",
        month: "July 2026",
        target: "৳ 500,000.00",
        status: "Generated",
        incentiveAmount: "৳ 25,000.00",
        settlementStatus: "Processing",
        settlementDate: "2026-07-20",
      },
    ],
  },
];

const generateBounceOpData = (): ReportSection[] => [
  {
    sectionId: "M-1234",
    title: "Demo Merchant",
    rows: [],
    customData: {
      sectors: ["Retail"],
      stores: [
        {
          storeId: "demotest",
          bounceList: [
            {
              kam: "sajan.chandra",
              storeId: "demotest",
              transactionDate: "2024-05-05",
              code: "9.99802E+015",
              originalCode: "EB284920240505182",
              currentDesc:
                "BEFTN CREDIT RTN BUS DT: 240505 Session: 2 DUE TO Non-Transaction Account, REC AC No. 0001130991601 REC ID: .",
              originalDesc:
                "BEFTN THROUGH EBL CONNECT TRYOTELTRAVELS LIMITED|0001130991601|215261726|SSLCZ Merchant Payment|EB284920240505182|2024-05-05|BEFTN Transfer",
              credit: "64144.06",
              debit: "0.00",
              balance: "9999999.99",
              natureType: "BOUNCE",
              natureSub: "BEFTN",
              tracker: "MjAxNDE1NjU0NQ==",
              status: "Assigned",
            },
            {
              kam: "sajan.chandra",
              storeId: "demotest",
              transactionDate: "2024-05-07",
              code: "9.99802E+015",
              originalCode: "EB285020240506583",
              currentDesc:
                "BEFTN CREDIT RTN BUS DT: 240506 Session: 3 DUE TO Invalid Account Number, REC AC No. 0013100001995 REC ID: .",
              originalDesc:
                "BEFTN THROUGH EBL CONNECT KRISHIBIDBAZAARLTD|0013100001995|105262985|SSLCZ Merchant Payment|EB285020240506583|2024-05-06|BEFTN Transfer",
              credit: "5686.19",
              debit: "0.00",
              balance: "9999999.99",
              natureType: "BOUNCE",
              natureSub: "BEFTN",
              tracker: "MjAxNDE1NjU0NQ==",
              status: "Assigned",
            },
            {
              kam: "sajan.chandra",
              storeId: "demotest",
              transactionDate: "2024-05-05",
              code: "9.99802E+015",
              originalCode: "EB284920240505182",
              currentDesc:
                "BEFTN CREDIT RTN BUS DT: 240505 Session: 2 DUE TO Non-Transaction Account, REC AC No. 0001130991601 REC ID: .",
              originalDesc:
                "BEFTN THROUGH EBL CONNECT TRYOTELTRAVELS LIMITED|0001130991601|215261726|SSLCZ Merchant Payment|EB284920240505182|2024-05-05|BEFTN Transfer",
              credit: "64144.06",
              debit: "0.00",
              balance: "9999999.99",
              natureType: "BOUNCE",
              natureSub: "BEFTN",
              tracker: "MjA3MTg3NTAwNQ==",
              status: "Assigned",
            },
            {
              kam: "sajan.chandra",
              storeId: "demotest",
              transactionDate: "2024-05-05",
              code: "9.99802E+015",
              originalCode: "EB284920240505096",
              currentDesc:
                "BEFTN CREDIT RTN BUS DT: 240505 Session: 2 DUE TO Non-Transaction Account, REC AC No. 0001130969301 REC ID: .",
              originalDesc:
                "BEFTN THROUGH EBL CONNECT YOURTRAVELLTD|0001130969301|215271787|SSLCZ Merchant Payment|EB284920240505096|2024-05-05|BEFTN Transfer",
              credit: "282412.50",
              debit: "0.00",
              balance: "9999999.99",
              natureType: "BOUNCE",
              natureSub: "BEFTN",
              tracker: "MjA3MTg3NTAwNQ==",
              status: "Assigned",
            },
            {
              kam: "sajan.chandra",
              storeId: "demotest",
              transactionDate: "2024-05-07",
              code: "9.99802E+015",
              originalCode: "EB285020240506583",
              currentDesc:
                "BEFTN CREDIT RTN BUS DT: 240506 Session: 3 DUE TO Invalid Account Number, REC AC No. 0013100001995 REC ID: .",
              originalDesc:
                "BEFTN THROUGH EBL CONNECT KRISHIBIDBAZAARLTD|0013100001995|105262985|SSLCZ Merchant Payment|EB285020240506583|2024-05-06|BEFTN Transfer",
              credit: "5686.19",
              debit: "0.00",
              balance: "9999999.99",
              natureType: "BOUNCE",
              natureSub: "BEFTN",
              tracker: "MjA3MTg3NTAwNQ==",
              status: "Assigned",
            },
          ],
        },
      ],
    },
    exportable: true,
    explorable: true,
  },
];

const generateMerchantSurveysData = (): ReportSection[] => [
  {
    sectionId: "SURVEY-LIST",
    title: "Merchant Surveys",
    rows: [],
    exportable: true,
    explorable: false,
    customData: [
      {
        id: 1,
        title: "SSLCOMMERZ FEEDBACK SURVEY NOVEMBER 2025",
        scheduleStart: "01-Nov-25",
        scheduleEnd: "30-Nov-25",
        status: "Active",
        responses: [
          {
            id: 1,
            merchantId: "M-77001",
            companyName: "Ekushey E Shop",
            sector: "E-commerce",
            answers: {
              referralProgram: "Yes, and I have already participated",
              gatewaySatisfaction: 5,
              safetyFeeling: 5,
              recommendLikely: 5,
              kamSupport: 5,
              improvements: "ssss",
              businessHelp: "sss",
              kamName: "Shubhojit Ghosh",
              businessName: "ssss",
              discovery: ["facebook", "twitter"],
              collectionMethod: "mobile banking",
            },
          },
          {
            id: 2,
            merchantId: "M-1004",
            companyName: "easy.com.bd",
            sector: "Utility",
            answers: {
              referralProgram: "No, I haven't heard about it",
              gatewaySatisfaction: 4,
              safetyFeeling: 4,
              recommendLikely: 4,
              kamSupport: 4,
              improvements: "Better documentation",
              businessHelp: "N/A",
              kamName: "Priya Rani Dey",
              businessName: "Easy.com.bd",
              discovery: ["others"],
              collectionMethod: "cards",
            },
          },
          {
            id: 3,
            merchantId: "demotest",
            companyName: "Sandbox Live Test",
            sector: "Sandbox",
            answers: {
              referralProgram: "Yes, but I have not participated yet.",
              gatewaySatisfaction: 3,
              safetyFeeling: 4,
              recommendLikely: 5,
              kamSupport: 5,
              improvements: "More payment methods",
              businessHelp: "Increase daily limits",
              kamName: "Md. Faisal",
              businessName: "Sandbox",
              discovery: ["Linkedin"],
              collectionMethod: "internet banking",
            },
          },
        ],
      },
      {
        id: 2,
        title: "SSLCOMMERZ FEEDBACK SURVEY OCTOBER 2025",
        scheduleStart: "01-Oct-25",
        scheduleEnd: "10-Oct-25",
        status: "Active",
      },
      {
        id: 3,
        title: "SSLCOMMERZ FEEDBACK SURVEY SEPTEMBER 2025",
        scheduleStart: "01-Sep-25",
        scheduleEnd: "10-Sep-25",
        status: "Active",
      },
      {
        id: 4,
        title: "SSLCOMMERZ FEEDBACK SURVEY AUGUST 2025",
        scheduleStart: "01-Aug-25",
        scheduleEnd: "10-Aug-25",
        status: "Active",
      },
      {
        id: 5,
        title: "SSLCOMMERZ FEEDBACK SURVEY JULY 2025",
        scheduleStart: "01-Jul-25",
        scheduleEnd: "10-Jul-25",
        status: "Active",
      },
      {
        id: 6,
        title: "SSLCOMMERZ FEEDBACK SURVEY APRIL 2025",
        scheduleStart: "07-Apr-25",
        scheduleEnd: "30-May-25",
        status: "Active",
      },
    ],
  },
];

const generateSectorWiseActiveRatioData = (): ReportSection[] => [
  {
    sectionId: "sector-active-ratio-1",
    title: "Sector Wise Active Ratio",
    rows: [],
    exportable: true,
    explorable: false,
    customData: [
      {
        id: 1,
        sectorName: "Business Services",
        merchantCount: 9,
        storeCount: 12,
        activePct: 100.0,
        inactivePct: 0.0,
        otherPct: 0.0,
      },
      {
        id: 2,
        sectorName: "Agriculture Services",
        merchantCount: 10,
        storeCount: 13,
        activePct: 92.31,
        inactivePct: 0.0,
        otherPct: 7.69,
      },
      {
        id: 3,
        sectorName: "Education",
        merchantCount: 6,
        storeCount: 8,
        activePct: 87.5,
        inactivePct: 12.5,
        otherPct: 0.0,
      },
      {
        id: 4,
        sectorName: "Retail",
        merchantCount: 18,
        storeCount: 25,
        activePct: 96.0,
        inactivePct: 4.0,
        otherPct: 0.0,
      },
      {
        id: 5,
        sectorName: "Ecommerce",
        merchantCount: 11,
        storeCount: 15,
        activePct: 80.0,
        inactivePct: 13.33,
        otherPct: 6.67,
      },
      {
        id: 6,
        sectorName: "Food & Beverage",
        merchantCount: 7,
        storeCount: 10,
        activePct: 90.0,
        inactivePct: 0.0,
        otherPct: 10.0,
      },
      {
        id: 7,
        sectorName: "Health & Fitness",
        merchantCount: 4,
        storeCount: 5,
        activePct: 100.0,
        inactivePct: 0.0,
        otherPct: 0.0,
      },
    ],
  },
];

export const generateManageRiskySanctionsData = (): ReportSection[] => [
  {
    sectionId: "manage-risky-sanctions-1",
    title: "Risky Sanctions Data",
    rows: [],
    exportable: true,
    explorable: false,
    customData: [
      {
        id: 1,
        type: "Customer Name",
        filterValue: "Mahamudul Hasan",
        remarks: "Already transaction done!",
        createdBy: "Anik",
        updatedBy: "Anik",
      },
      {
        id: 2,
        type: "Customer Name",
        filterValue: "Mahamudul Hasan",
        remarks: "Already transaction done!",
        createdBy: "Anik",
        updatedBy: "Anik",
      },
      {
        id: 3,
        type: "Strid",
        filterValue: "sdadadadsa",
        remarks: "fake store",
        createdBy: "Anik",
        updatedBy: "Anik",
      },
      {
        id: 4,
        type: "Email",
        filterValue: "test@example.com",
        remarks: "Suspicious email pattern",
        createdBy: "Anik",
        updatedBy: "Anik",
      },
      {
        id: 5,
        type: "Phone No",
        filterValue: "01711223344",
        remarks: "Reported for fraud",
        createdBy: "Anik",
        updatedBy: "Anik",
      },
      {
        id: 6,
        type: "City",
        filterValue: "Dhaka",
        remarks: "High-risk region",
        createdBy: "Anik",
        updatedBy: "Anik",
      },
    ],
  },
];

const generateBounceReportData = (): ReportSection[] => [
  {
    sectionId: "bounce-summary",
    title: "Bounce Summary",
    rows: [
      { label: "Upload Bounces", amount: "125" },
      { label: "Email Bounces", amount: "45" },
      { label: "SMS Failures", amount: "80" },
    ],
    total: { label: "Total Bounces", amount: "250" },
    exportable: true,
    explorable: true,
  },
];

const generateKamMerchantTransactionData = (): ReportSection[] => [
  {
    sectionId: "kam-merchant-tnx-1",
    title: "Merchant Transaction Analysis",
    rows: [],
    exportable: true,
    explorable: true,
    customData: {
      summary: {
        totalAmount: 139136.8,
        totalCount: 160,
      },
      months: [
        "September 2025",
        "October 2025",
        "November 2025",
        "December 2025",
        "January 2026",
        "February 2026",
      ],
      merchants: [
        {
          merchantId: "demotest",
          merchantName: "Sandbox Live Test",
          sector: "Sandbox",
          category: "Test Category",
          monthlyData: {
            "September 2025": { amount: 0.0, count: 0, trend: null },
            "October 2025": { amount: 0.0, count: 0, trend: null },
            "November 2025": { amount: 139136.8, count: 2, trend: "up" },
            "December 2025": { amount: 0.0, count: 0, trend: "down" },
            "January 2026": { amount: 0.0, count: 0, trend: null },
            "February 2026": { amount: 0.0, count: 0, trend: null },
          },
        },
        {
          merchantId: "m-77001",
          merchantName: "Ekushey E Shop",
          sector: "E-commerce",
          category: "Shopping",
          monthlyData: {
            "September 2025": { amount: 50.0, count: 1, trend: null },
            "October 2025": { amount: 150.0, count: 2, trend: "up" },
            "November 2025": { amount: 100.0, count: 1, trend: "down" },
            "December 2025": { amount: 200.0, count: 3, trend: "up" },
            "January 2026": { amount: 180.0, count: 2, trend: "down" },
            "February 2026": { amount: 250.0, count: 4, trend: "up" },
          },
        },
      ],
    },
  },
];

const generateMergedMerchantGrowthData = (): ReportSection[] => [
  ...generateGrowthData("merchant"),
  ...generateSegmentTnxData().map((s) => ({
    ...s,
    customData: { ...s.customData, type: "segment" },
  })),
];

const createManagementReportStub = (
  reportId: string,
  title: string,
  description: string,
): ReportConfig => ({
  reportId,
  title,
  description,
  aboutText: `${title} insights for management and operational review.`,
  docsUrl: `/docs/reports/${reportId}`,
  sections: [
    {
      sectionId: "summary",
      title: "Summary",
      rows: [{ label: "Report data", amount: "Available soon" }],
      exportable: false,
      explorable: false,
    },
  ],
  availableFilters: ["date"],
});

// Report Registry
export const reportRegistry: Record<string, ReportConfig> = {
  "merchant-wise": {
    reportId: "merchant-wise",
    title: "Merchant Wise Report",
    description: "Comprehensive merchant performance and transaction analysis.",
    aboutText:
      "This report provides a detailed breakdown of merchant balances, including starting and ending balances, activity summaries, and payout information. Use this to track individual merchant financial health.",
    docsUrl: "/docs/reports/merchant-wise",
    sections: generateMerchantWiseData(),
    availableFilters: ["date", "merchant", "store", "sector"],
  },
  "merchant-channel-wise": {
    reportId: "merchant-channel-wise",
    title: "Merchant Channel Wise Report",
    description: "Channel-specific performance metrics for each merchant.",
    aboutText:
      "Analyze how different payment channels perform across your merchant portfolio. Compare web checkout, mobile app, API integrations, and payment links.",
    docsUrl: "/docs/reports/channel-wise",
    sections: generateChannelWiseData(),
    availableFilters: ["date", "sector", "store", "merchant"],
  },
  "merchant-success-fail-tnx": {
    reportId: "merchant-success-fail-tnx",
    title: "Merchant Success / Fail Tnx",
    description: "Success and failure transaction metrics by merchant.",
    aboutText:
      "Track both successful and failed transactions broken down by payment method. Understand conversion rates and failure patterns across your merchant portfolio.",
    docsUrl: "/docs/reports/success-fail-tnx",
    sections: generateSuccessfulTnxData(),
    availableFilters: ["date", "merchant", "store", "sector"],
  },
  "merchant-growth": {
    reportId: "merchant-growth",
    title: "Merchant Growth Report",
    description: "Track merchant and segment growth trends and patterns.",
    aboutText:
      "Monitor growth metrics including month-over-month comparisons for both individual merchants and business segments.",
    docsUrl: "/docs/reports/merchant-growth",
    sections: generateMergedMerchantGrowthData(),
    availableFilters: ["year", "merchant", "segment", "sector"],
  },
  "merchant-survey": {
    reportId: "merchant-survey",
    title: "Merchant Survey Analytics",
    description: "Survey insights and merchant feedback analysis.",
    aboutText:
      "Analyze merchant satisfaction survey results. Understand feedback patterns and identify areas for improvement.",
    docsUrl: "/docs/reports/merchant-survey",
    sections: generateSurveyData(),
    availableFilters: ["question", "date"],
  },
  "sector-wise": {
    reportId: "sector-wise",
    title: "Sector Wise Report",
    description:
      "Comprehensive growth and trend analysis across business sectors.",
    aboutText:
      "This report provides a unified view of sectoral performance, combining growth metrics (Number, Amount, Revenue) with trending patterns over time. Use this to identify high-performing sectors and emerging trends.",
    docsUrl: "/docs/reports/sector-wise",
    sections: generateSectorWiseData(),
    availableFilters: ["year", "store", "merchant", "sector"],
  },
  "kam-revenue": {
    reportId: "kam-revenue",
    title: "Revenue Report",
    description: "Revenue performance tracking for Key Account Managers.",
    aboutText:
      "Track revenue generated by each Key Account Manager. Compare performance and identify top performers.",
    docsUrl: "/docs/reports/kam-revenue",
    sections: generateKamRevenueData(),
    availableFilters: ["date", "revenueType", "kam"],
  },
  "kam-merchant-transaction": {
    reportId: "kam-merchant-transaction",
    title: "Kamwise Merchant Transaction Report",
    description:
      "Comprehensive analysis of merchant transactions by volume and count.",
    aboutText:
      "This report tracks merchant transaction patterns across a rolling period, providing insights into growth, decline, and overall volume at the merchant level.",
    docsUrl: "/docs/reports/kam-merchant-transaction",
    sections: generateKamMerchantTransactionData(),
    availableFilters: ["year", "merchant", "sector"],
  },
  "kam-transaction-failed": {
    reportId: "kam-transaction-failed",
    title: "KAM Transaction Failed Report",
    description: "Failed transaction analysis by KAM portfolio.",
    aboutText:
      "Analyze failed transactions by KAM portfolio. Understand failure patterns and reasons to improve success rates.",
    docsUrl: "/docs/reports/kam-failed",
    sections: generateKamFailedData(),
    availableFilters: ["errorDescription", "date"],
  },
  incentive: {
    reportId: "incentive",
    title: "Incentive Report",
    description: "Incentive tracking and performance-based rewards.",
    aboutText:
      "Track incentives earned, paid, and pending. Analyze incentive distribution by type and team member.",
    docsUrl: "/docs/reports/incentives",
    sections: generateIncentiveData(),
  },
  "monthly-growth-transaction": {
    reportId: "monthly-growth-transaction",
    title: "Monthly Growth Transaction Analysis (LEGACY)",
    description: "Month-over-month transaction growth insights.",
    aboutText:
      "Analyze month-over-month transaction trends. Identify growth patterns and seasonal variations.",
    docsUrl: "/docs/reports/monthly-growth",
    sections: generateMonthlyGrowthData(),
    availableFilters: ["month", "trend", "merchant", "segment"],
  },
  "financial-year": {
    reportId: "financial-year",
    title: "Financial Year Report",
    description: "Annual financial performance and year-end analysis.",
    aboutText:
      "Comprehensive financial year summary including revenue, transactions, and growth metrics. Compare year-over-year performance.",
    docsUrl: "/docs/reports/financial-year",
    sections: generateFinancialYearData(),
    availableFilters: ["year", "merchant"],
  },
  "monthly-transaction-analysis": {
    reportId: "monthly-transaction-analysis",
    title: "Monthly Transaction Analysis",
    description: "Analysis of monthly transaction trends and declines.",
    aboutText:
      "Compare transaction volumes and amounts across months, analyze declines by segment, and track historical trends.",
    docsUrl: "/docs/reports/monthly-analysis",
    sections: generateMonthlyTransactionAnalysisData(),
    availableFilters: ["month", "year", "merchant", "segment", "sector"],
  },
  "gateway-transaction": {
    reportId: "gateway-transaction",
    title: "Gateway Transaction Report",
    description: "Detailed analysis of gateway transaction performance.",
    aboutText:
      "Monitor transaction success rates, failures, and volume across different payment gateways.",
    docsUrl: "/docs/reports/gateway-transaction",
    sections: generateGatewayTransactionData(),
    availableFilters: ["month", "year"],
  },
  "operation-report": {
    reportId: "operation-report",
    title: "Operation Report",
    description: "Operational efficiency and support metrics.",
    aboutText:
      "Track operational KPIs including support ticket resolution, merchant onboarding times, and system uptime.",
    docsUrl: "/docs/reports/operation",
    sections: generateOperationData(),
  },
  "settlement-bounce-kam": {
    reportId: "settlement-bounce-kam",
    title: "Upload Settlement Bounce Report",
    description: "Settlement bounce analysis for KAMs.",
    aboutText:
      "Track settlement bounces and failures assigned to KAMs for resolution.",
    docsUrl: "/docs/reports/settlement-bounce-kam",
    sections: generateBounceKamData(),
    availableFilters: ["date", "status"],
  },
  "settlement-bounce-operation": {
    reportId: "settlement-bounce-operation",
    title: "Settlement Bounce Operation Report",
    description: "Settlement bounce analysis for Operations.",
    aboutText:
      "Track settlement bounces and failures assigned to Operations for resolution.",
    docsUrl: "/docs/reports/settlement-bounce-operation",
    sections: generateBounceOpData(),
    availableFilters: ["date", "store", "trackerId", "status"],
  },
  "sector-wise-active-ratio": {
    reportId: "sector-wise-active-ratio",
    title: "Sector Wise Active Ratio",
    description: "Analysis of merchant active ratio across business sectors.",
    aboutText:
      "This report provides insights into the operational status of merchants within different business sectors, highlighting active, inactive, and other status percentages.",
    docsUrl: "/docs/reports/sector-active-ratio",
    sections: generateSectorWiseActiveRatioData(),
    availableFilters: ["date", "sector"],
  },
  "manage-risky-sanctions": {
    reportId: "manage-risky-sanctions",
    title: "Manage Risky Sanctions",
    description: "Filter and manage risky sanctions and customer data.",
    aboutText:
      "This report allows you to manage and filter risky transactions based on customer name, store ID, and other criteria.",
    docsUrl: "/docs/reports/manage-risky-sanctions",
    sections: generateManageRiskySanctionsData(),
    availableFilters: ["type", "filterValue"],
  },
  "upload-bounce-report": {
    reportId: "upload-bounce-report",
    title: "Upload Bounce Report",
    description: "Report on failed uploads and bounces.",
    aboutText:
      "Analyze reasons for failed uploads, email bounces, and other delivery failures to improve system reliability.",
    docsUrl: "/docs/reports/upload-bounce",
    sections: generateBounceReportData(),
    availableFilters: ["date", "status", "bulkUpload"],
  },
  "merchant-surveys": {
    reportId: "merchant-surveys",
    title: "Merchant Surveys Report",
    description: "Track and manage merchant feedback surveys.",
    aboutText:
      "View, manage, and download feedback from merchant surveys to improve services.",
    docsUrl: "/docs/reports/merchant-surveys",
    sections: generateMerchantSurveysData(),
    availableFilters: ["date", "status"],
  },
  "incentive-report": {
    reportId: "incentive-report",
    title: "Incentive Report",
    description: "Monthly incentive tracking and settlement status.",
    aboutText:
      "This report allows you to track incentive performance, status, and settlement details for specific stores and months.",
    docsUrl: "/docs/reports/incentive",
    sections: generateIncentiveReportData(),
    availableFilters: ["date", "store", "status"],
  },
  "merchant-onboarding": {
    reportId: "merchant-onboarding",
    title: "Merchant Onboarding Report",
    description: "Track merchant onboarding progress and completion status.",
    aboutText:
      "This report shows monthly physical and online merchant onboarding counts, including a rolling 365-day summary.",
    docsUrl: "/docs/reports/merchant-onboarding",
    sections: generateMerchantOnboardingData(),
    availableFilters: ["date"],
  },
  "hunter-wise-merchant-onboarding": {
    reportId: "hunter-wise-merchant-onboarding",
    title: "Hunter Wise Merchant Onboarding Report",
    description: "Onboarding performance breakdown by hunter.",
    aboutText:
      "This report shows merchant onboarding counts by hunter across monthly periods, with a rolling 365-day summary.",
    docsUrl: "/docs/reports/hunter-wise-merchant-onboarding",
    sections: generateHunterWiseMerchantOnboardingData(),
    availableFilters: ["date"],
  },
  "kam-transaction-report": {
    reportId: "kam-transaction-report",
    title: "KAM Transaction Report",
    description:
      "Transaction volume, count, and revenue analysis by KAM portfolio.",
    aboutText:
      "This report shows KAM-wise transaction amount, count, and SSL revenue across monthly periods, with a rolling 365-day summary.",
    docsUrl: "/docs/reports/kam-transaction-report",
    sections: generateKamTransactionReportData(),
    availableFilters: ["date", "trend"],
  },
  "sector-wise-onboarding": {
    reportId: "sector-wise-onboarding",
    title: "Sector Wise Onboarding Report",
    description: "Onboarding metrics grouped by business sector.",
    aboutText:
      "This report shows merchant onboarding counts by business sector across monthly periods, with a rolling 365-day summary.",
    docsUrl: "/docs/reports/sector-wise-onboarding",
    sections: generateSectorWiseOnboardingData(),
    availableFilters: ["date"],
  },
  "lead-generation-vas": {
    reportId: "lead-generation-vas",
    title: "Lead Generation Report from VAS",
    description: "Lead generation performance from value-added services.",
    aboutText:
      "This report shows cross-sell lead counts by VAS service across monthly periods, with a rolling 365-day summary.",
    docsUrl: "/docs/reports/lead-generation-vas",
    sections: generateLeadGenerationVasData(),
    availableFilters: ["date"],
  },
  "instant-signup-analytics": {
    reportId: "instant-signup-analytics",
    title: "Instant SignUp Analytics Report",
    description: "Analytics for instant merchant sign-up flows.",
    aboutText:
      "This report summarizes instant sign-up funnel page views, user engagement, conversion metrics, traffic sources, and device usage from Google Analytics.",
    docsUrl: "/docs/reports/instant-signup-analytics",
    sections: generateInstantSignupAnalyticsData(),
    availableFilters: ["date"],
  },
  "onboarded-invoice-summary": {
    reportId: "onboarded-invoice-summary",
    title: "On boarded Invoice Summery",
    description: "Summary of onboarded merchant invoice activity.",
    aboutText:
      "This report summarizes onboarded merchant invoice totals by employee, including invoice amount, invoice count, and per-employee invoice details.",
    docsUrl: "/docs/reports/onboarded-invoice-summary",
    sections: [
      {
        sectionId: "onboarded-invoice-summary",
        title: "On boarded Invoice Summery",
        rows: [],
        exportable: true,
        explorable: false,
      },
    ],
    availableFilters: ["date"],
  },
  "referral-report": {
    reportId: "referral-report",
    title: "Referral Report",
    description: "Merchant referral program performance and outcomes.",
    aboutText:
      "This report summarizes referral program activity including referring merchants, generated codes, invitations sent, onboarded merchants, and bonus disbursements.",
    docsUrl: "/docs/reports/referral-report",
    sections: generateReferralReportData(),
    availableFilters: ["date"],
  },
  "transaction-failed-reason": {
    reportId: "transaction-failed-reason",
    title: "Transaction Failed Reason Report",
    description: "Breakdown of transaction failures by reason.",
    aboutText:
      "This report lists failed transactions grouped by error description, date, and count of affected companies and sectors.",
    docsUrl: "/docs/reports/transaction-failed-reason",
    sections: [
      {
        sectionId: "failed-reasons-summary",
        title: "Transaction Failed Reasons",
        rows: [],
        exportable: true,
        explorable: false,
        customData: TRANSACTION_FAILED_REASON_DATA,
      },
    ],
    availableFilters: ["date", "errorDescription"],
  },
  "merchant-activity": {
    reportId: "merchant-activity",
    title: "Merchant Activity Report",
    description: "Merchant activity levels and engagement trends.",
    aboutText:
      "This report lists merchants with their MssId, company name, and sector, filterable by activity status and sector.",
    docsUrl: "/docs/reports/merchant-activity",
    sections: [
      {
        sectionId: "merchant-activity",
        title: "Merchant Activity Report",
        rows: [],
        exportable: true,
        explorable: false,
      },
    ],
    availableFilters: ["date", "status", "sector"],
  },
  "payment-analytics": {
    reportId: "payment-analytics",
    title: "Payment Analytics Report",
    description:
      "Comprehensive overview of payments, transactions, and revenue.",
    aboutText:
      "This report summarizes device traffic, tab engagement, and payment type selection behavior across the checkout experience.",
    docsUrl: "/docs/reports/payment-analytics",
    sections: generatePaymentAnalyticsData(),
    availableFilters: ["date"],
  },
  "merchant-comparison": {
    reportId: "merchant-comparison",
    title: "Merchant Comparison Report",
    description:
      "Compare top merchants by GMV, Amount, Transaction, Revenue, and others.",
    aboutText:
      "This report allows you to dynamically compare merchant metrics such as GMV/Amount, Transaction Count, Revenue, Success Rate, and Growth Trends. Customize the compared merchant list to analyze differences.",
    docsUrl: "/docs/reports/merchant-comparison",
    sections: [
      {
        sectionId: "merchant-comparison-summary",
        title: "Merchant Comparison Summary",
        rows: [],
        exportable: true,
        explorable: false,
      },
    ],
    availableFilters: ["date"],
  },
  "kam-comparison": {
    reportId: "kam-comparison",
    title: "KAM Comparison Report",
    description:
      "Compare KAM portfolios by GMV, transactions, revenue, and performance metrics.",
    aboutText:
      "This report allows you to dynamically compare KAM portfolio metrics sourced from KAM Transaction, Revenue, and related reports. Customize the compared KAM list to analyze differences across portfolios.",
    docsUrl: "/docs/reports/kam-comparison",
    sections: [
      {
        sectionId: "kam-comparison-summary",
        title: "KAM Comparison Summary",
        rows: [],
        exportable: true,
        explorable: false,
      },
    ],
    availableFilters: ["date"],
  },
  "sector-comparison": {
    reportId: "sector-comparison",
    title: "Sector Comparison Report",
    description:
      "Compare sectors by GMV, transactions, revenue, store activity, and growth trends.",
    aboutText:
      "This report allows you to dynamically compare sector metrics sourced from Sector Wise and Sector Wise Active Ratio reports. Customize the compared sector list to analyze differences across sectors.",
    docsUrl: "/docs/reports/sector-comparison",
    sections: [
      {
        sectionId: "sector-comparison-summary",
        title: "Sector Comparison Summary",
        rows: [],
        exportable: true,
        explorable: false,
      },
    ],
    availableFilters: ["date"],
  },
};

export const getReportConfig = (reportId: string): ReportConfig | undefined => {
  return reportRegistry[reportId];
};

export const getAllReportIds = (): string[] => {
  return Object.keys(reportRegistry);
};
