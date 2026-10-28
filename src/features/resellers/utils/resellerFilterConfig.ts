import type { FilterConfig } from "../../../components/FilterBar";

export const RESELLER_SECTOR_FILTER_OPTIONS = [
  { label: "All Sectors", value: "all" },
  { label: "Pureplay Ecommerce", value: "Pureplay Ecommerce" },
  { label: "Education", value: "Education" },
  { label: "Healthcare", value: "Healthcare" },
  { label: "Travel & Tourism", value: "Travel & Tourism" },
  { label: "Food & Beverage", value: "Food & Beverage" },
  { label: "Financial Services", value: "Financial Services" },
  { label: "Telecom", value: "Telecom" },
  { label: "Retail", value: "Retail" },
];

export const BASE_RESELLER_FILTER_CONFIG: FilterConfig[] = [
  { key: "date", type: "date-range", label: "Onboarding Date" },
  { key: "name", type: "input", label: "Company Name" },
  { key: "resellerId", type: "input", label: "Company ID" },
  {
    key: "sector",
    type: "select",
    label: "Sector",
    options: RESELLER_SECTOR_FILTER_OPTIONS,
  },
];

export const SETTLEMENT_PERIOD_FILTER_OPTIONS = [
  { label: "All Periods", value: "all" },
  { label: "Daily", value: "Daily" },
  { label: "Weekly", value: "Weekly" },
  { label: "Bi-weekly", value: "Bi-weekly" },
  { label: "Monthly", value: "Monthly" },
];
