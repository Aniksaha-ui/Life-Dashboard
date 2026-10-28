export type MerchantActivityStatus = "active" | "inactive";

export type MerchantActivityRow = {
  mssId: string;
  companyName: string;
  sectorName: string;
  sectorKey: string;
  status: MerchantActivityStatus;
  activityDate: string;
};

export const MERCHANT_ACTIVITY_SECTOR_OPTIONS = [
  { value: "all", label: "All Sectors" },
  { value: "automobile", label: "Automobile" },
  { value: "variety_store", label: "Variety Store" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "education", label: "Education" },
  { value: "agriculture_services", label: "Agriculture Services" },
];

export const MERCHANT_ACTIVITY_STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export const MERCHANT_ACTIVITY_ROWS: MerchantActivityRow[] = [
  {
    mssId: "demotest",
    companyName: "Sandbox Live Test",
    sectorName: "Automobile",
    sectorKey: "automobile",
    status: "active",
    activityDate: "2025-10-15",
  },
  {
    mssId: "ivacbdlive",
    companyName:
      "INDIAN VISA APPLICATION CENTRE MANAGED BY STATE BANK OF INDIA",
    sectorName: "",
    sectorKey: "",
    status: "inactive",
    activityDate: "2025-10-12",
  },
  {
    mssId: "rongmela0live",
    companyName: "Rong Mela",
    sectorName: "Variety Store",
    sectorKey: "variety_store",
    status: "active",
    activityDate: "2025-10-10",
  },
  {
    mssId: "newsajanustertest0live",
    companyName: "Global Company",
    sectorName: "Variety Store",
    sectorKey: "variety_store",
    status: "active",
    activityDate: "2025-10-08",
  },
  {
    mssId: "testlive2",
    companyName: "testlive2",
    sectorName: "E-commerce",
    sectorKey: "ecommerce",
    status: "active",
    activityDate: "2025-10-05",
  },
  {
    mssId: "masudstore020live",
    companyName: "Masud Store 02",
    sectorName: "Education",
    sectorKey: "education",
    status: "inactive",
    activityDate: "2025-09-28",
  },
  {
    mssId: "finlaybazar0live",
    companyName: "Finlay Bazar Limited",
    sectorName: "E-commerce",
    sectorKey: "ecommerce",
    status: "inactive",
    activityDate: "2025-09-25",
  },
  {
    mssId: "ekusheyeshop",
    companyName: "Ekushey E Shop",
    sectorName: "Education",
    sectorKey: "education",
    status: "active",
    activityDate: "2025-09-22",
  },
  {
    mssId: "googlehtxtrxtextrxlive",
    companyName: "WELCOME ELECTRONICS googlehtxtrxtextrx",
    sectorName: "Agriculture Services",
    sectorKey: "agriculture_services",
    status: "active",
    activityDate: "2025-09-18",
  },
  {
    mssId: "pizzahutdhaka",
    companyName: "Pizzahut Dhaka Ltd",
    sectorName: "Variety Store",
    sectorKey: "variety_store",
    status: "inactive",
    activityDate: "2025-09-15",
  },
  {
    mssId: "google132live",
    companyName: "WELCOME ELECTRONICS google132live",
    sectorName: "Automobile",
    sectorKey: "automobile",
    status: "active",
    activityDate: "2025-09-12",
  },
  {
    mssId: "liveapi_sandbox",
    companyName: "liveapi_sandbox",
    sectorName: "E-commerce",
    sectorKey: "ecommerce",
    status: "active",
    activityDate: "2025-09-08",
  },
  {
    mssId: "radiantlabs",
    companyName: "Radiant Laboratories LTD",
    sectorName: "Education",
    sectorKey: "education",
    status: "inactive",
    activityDate: "2025-09-05",
  },
  {
    mssId: "infinitymall",
    companyName: "Infinity Mega Mall International",
    sectorName: "Agriculture Services",
    sectorKey: "agriculture_services",
    status: "active",
    activityDate: "2025-08-28",
  },
  {
    mssId: "demomerchant03",
    companyName: "Demo Merchant 03",
    sectorName: "Automobile",
    sectorKey: "automobile",
    status: "inactive",
    activityDate: "2025-08-20",
  },
];

export function isMerchantActivityDateInRange(
  activityDate: string,
  from?: string,
  to?: string,
): boolean {
  if (!from || !to) return true;
  const value = new Date(activityDate).getTime();
  const fromValue = new Date(from).getTime();
  const toValue = new Date(to).getTime();
  return value >= fromValue && value <= toValue;
}

export function filterMerchantActivityRows(
  rows: MerchantActivityRow[],
  filters: {
    from?: string;
    to?: string;
    status?: string;
    sector?: string;
  },
): MerchantActivityRow[] {
  return rows.filter((row) => {
    if (
      filters.status &&
      filters.status !== "all" &&
      row.status !== filters.status
    ) {
      return false;
    }

    if (
      filters.sector &&
      filters.sector !== "all" &&
      row.sectorKey !== filters.sector
    ) {
      return false;
    }

    return isMerchantActivityDateInRange(
      row.activityDate,
      filters.from,
      filters.to,
    );
  });
}
