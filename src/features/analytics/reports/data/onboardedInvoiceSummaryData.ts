export type OnboardedInvoiceEmployeeRow = {
  employeeId: string;
  name: string;
  email: string;
  department: string;
  totalAmount: number;
  totalInvoice: number;
  activityDate: string;
};

export type OnboardedInvoiceDetailRow = {
  invoiceDate: string;
  invoiceCode: string;
  clientCode: string;
  clientName: string;
  invoiceAmount: number;
};

export const ONBOARDED_INVOICE_EMPLOYEES: OnboardedInvoiceEmployeeRow[] = [
  {
    employeeId: "1615",
    name: "Anik Saha",
    email: "anik.saha@ssliwireless.com",
    department: "Ecom",
    totalAmount: 66500,
    totalInvoice: 4,
    activityDate: "2025-11-18",
  },
  {
    employeeId: "1420",
    name: "Rahim Uddin",
    email: "rahim.uddin@ssliwireless.com",
    department: "Ecom",
    totalAmount: 48250.5,
    totalInvoice: 3,
    activityDate: "2025-11-22",
  },
  {
    employeeId: "1188",
    name: "Nusrat Jahan",
    email: "nusrat.jahan@ssliwireless.com",
    department: "Retail",
    totalAmount: 32100,
    totalInvoice: 2,
    activityDate: "2025-11-10",
  },
  {
    employeeId: "1533",
    name: "Karim Hassan",
    email: "karim.hassan@ssliwireless.com",
    department: "Corporate",
    totalAmount: 19875.25,
    totalInvoice: 2,
    activityDate: "2025-10-28",
  },
];

export const ONBOARDED_INVOICE_DETAILS_BY_EMPLOYEE: Record<
  string,
  OnboardedInvoiceDetailRow[]
> = {
  "1615": [
    {
      invoiceDate: "2025-06-17",
      invoiceCode: "SSL/25/0650038",
      clientCode: "CT39070",
      clientName: "Biddarthy",
      invoiceAmount: 25500,
    },
    {
      invoiceDate: "2025-06-19",
      invoiceCode: "SSL/25/0650055",
      clientCode: "CT39257",
      clientName: "Arabic English Shikhi",
      invoiceAmount: 25500,
    },
    {
      invoiceDate: "2025-06-25",
      invoiceCode: "SSL/25/0650114",
      clientCode: "CT39312",
      clientName: "Khulna University Mathematics Alumni Association",
      invoiceAmount: 15500,
    },
    {
      invoiceDate: "2025-06-25",
      invoiceCode: "SSL/25/0650116",
      clientCode: "CT39314",
      clientName: "Padma Cantonment Public school and College",
      invoiceAmount: 0,
    },
  ],
  "1420": [
    {
      invoiceDate: "2025-06-12",
      invoiceCode: "SSL/25/0650012",
      clientCode: "CT38901",
      clientName: "Global Company",
      invoiceAmount: 22100.5,
    },
    {
      invoiceDate: "2025-06-15",
      invoiceCode: "SSL/25/0650028",
      clientCode: "CT38944",
      clientName: "Sandbox Live Test",
      invoiceAmount: 12650,
    },
    {
      invoiceDate: "2025-06-18",
      invoiceCode: "SSL/25/0650041",
      clientCode: "CT39088",
      clientName: "WELCOME ELECTRONICS",
      invoiceAmount: 13500,
    },
  ],
  "1188": [
    {
      invoiceDate: "2025-06-08",
      invoiceCode: "SSL/25/0649988",
      clientCode: "CT38812",
      clientName: "testlive2",
      invoiceAmount: 15600,
    },
    {
      invoiceDate: "2025-06-10",
      invoiceCode: "SSL/25/0649996",
      clientCode: "CT38835",
      clientName: "INDIAN VISA APPLICATION CENTRE",
      invoiceAmount: 16500,
    },
  ],
  "1533": [
    {
      invoiceDate: "2025-05-25",
      invoiceCode: "SSL/25/0649855",
      clientCode: "CT38620",
      clientName: "Google Merchant Demo",
      invoiceAmount: 9875.25,
    },
    {
      invoiceDate: "2025-05-28",
      invoiceCode: "SSL/25/0649871",
      clientCode: "CT38654",
      clientName: "Variety Store BD",
      invoiceAmount: 10000,
    },
  ],
};

function isOnboardedInvoiceDateInRange(
  activityDate: string,
  from?: string,
  to?: string,
): boolean {
  if (!from && !to) return true;
  if (from && activityDate < from) return false;
  if (to && activityDate > to) return false;
  return true;
}

export function filterOnboardedInvoiceEmployees(
  rows: OnboardedInvoiceEmployeeRow[],
  from?: string,
  to?: string,
): OnboardedInvoiceEmployeeRow[] {
  return rows.filter((row) =>
    isOnboardedInvoiceDateInRange(row.activityDate, from, to),
  );
}

export function summarizeOnboardedInvoices(
  rows: OnboardedInvoiceEmployeeRow[],
) {
  return rows.reduce(
    (acc, row) => ({
      totalInvoiceAmount: acc.totalInvoiceAmount + row.totalAmount,
      totalInvoiceCount: acc.totalInvoiceCount + row.totalInvoice,
    }),
    { totalInvoiceAmount: 0, totalInvoiceCount: 0 },
  );
}

export function formatInvoiceAmount(value: number) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
