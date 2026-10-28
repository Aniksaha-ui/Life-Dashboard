export type ReferralCodeSummaryRow = {
  companyName: string;
  referralCodesGenerated: number;
  totalInvitations: number;
};

export type OnboardedMerchantRow = {
  companyName: string;
  mssId: string;
  email: string;
  mobileNumber: string;
  settlementStatus: "Yes" | "No";
  settlementDate: string;
  referrerMerchantName: string;
  bonusStatus: "Success" | "Pending";
  referralBonusBdt: number;
  activityDate: string;
};

export type ReferralInvitationRow = {
  companyName: string;
  mssId: string;
  refereeEmail: string;
  refereeMobileNumber: string;
  date: string;
  activityDate: string;
};

export const REFERRAL_CODE_SUMMARY_ALL: ReferralCodeSummaryRow[] = [
  {
    companyName: "Ekushey E Shop",
    referralCodesGenerated: 1,
    totalInvitations: 8,
  },
  {
    companyName: "Sandbox Live Test",
    referralCodesGenerated: 2,
    totalInvitations: 79,
  },
  {
    companyName: "WELCOME ELECTRONICS google132live",
    referralCodesGenerated: 1,
    totalInvitations: 2,
  },
  {
    companyName: "Pizzahut Dhaka Ltd",
    referralCodesGenerated: 0,
    totalInvitations: 4,
  },
  {
    companyName: "Infinity Mega Mall International",
    referralCodesGenerated: 0,
    totalInvitations: 4,
  },
  {
    companyName: "Radiant Laboratories LTD",
    referralCodesGenerated: 1,
    totalInvitations: 3,
  },
  { companyName: "Hasne Mewa", referralCodesGenerated: 0, totalInvitations: 2 },
  { companyName: "Nobo Mogor", referralCodesGenerated: 0, totalInvitations: 2 },
  {
    companyName: "SSC Online Education Agency",
    referralCodesGenerated: 0,
    totalInvitations: 2,
  },
  {
    companyName: "liveapi_sandbox",
    referralCodesGenerated: 0,
    totalInvitations: 1,
  },
];

export const REFERRAL_CODE_SUMMARY = REFERRAL_CODE_SUMMARY_ALL.slice(0, 5);

export const REFERRAL_ONBOARDED_MERCHANTS: OnboardedMerchantRow[] = [
  {
    companyName: "WELCOME ELECTRONICS",
    mssId: "google132live",
    email: "platinumtechbd13@yahoo.com",
    mobileNumber: "01680043450",
    settlementStatus: "Yes",
    settlementDate: "01-Jan-2026",
    referrerMerchantName: "Sandbox Live Test",
    bonusStatus: "Success",
    referralBonusBdt: 500,
    activityDate: "2026-01-01",
  },
  {
    companyName: "RADIANT LABORATORIES LTD",
    mssId: "radiantlabbd",
    email: "accounts@radiantlaboratories.com",
    mobileNumber: "01736279667",
    settlementStatus: "No",
    settlementDate: "16-Apr-2025",
    referrerMerchantName: "Sandbox Live Test",
    bonusStatus: "Pending",
    referralBonusBdt: 0,
    activityDate: "2025-04-16",
  },
  {
    companyName: "Nobo Mogor",
    mssId: "sirajuddincollege71@gmail.com",
    email: "sirajuddincollege71@gmail.com",
    mobileNumber: "01724690390",
    settlementStatus: "No",
    settlementDate: "",
    referrerMerchantName: "Sandbox Live Test",
    bonusStatus: "Pending",
    referralBonusBdt: 0,
    activityDate: "2025-04-20",
  },
  {
    companyName: "SSC Online Education Agency",
    mssId: "ssconlineeducationag",
    email: "onlineeducationagency1@gmail.com",
    mobileNumber: "01723300762",
    settlementStatus: "No",
    settlementDate: "",
    referrerMerchantName: "Sandbox Live Test",
    bonusStatus: "Pending",
    referralBonusBdt: 0,
    activityDate: "2025-04-18",
  },
  {
    companyName: "liveapi_sandbox",
    mssId: "liveapi_sandbox",
    email: "kam.salahuddin@sslwireless.com",
    mobileNumber: "01923276069",
    settlementStatus: "No",
    settlementDate: "",
    referrerMerchantName: "Sandbox Live Test",
    bonusStatus: "Pending",
    referralBonusBdt: 0,
    activityDate: "2025-05-02",
  },
  {
    companyName: "kycsandlivelive",
    mssId: "kycsandlivelive",
    email: "tarek@sslwireless.com",
    mobileNumber: "01747518683",
    settlementStatus: "No",
    settlementDate: "",
    referrerMerchantName: "Sandbox Live Test",
    bonusStatus: "Pending",
    referralBonusBdt: 0,
    activityDate: "2025-05-10",
  },
  {
    companyName: "Hasne Mewa",
    mssId: "hasnemewa",
    email: "mearaj191@gmail.com",
    mobileNumber: "01790047009",
    settlementStatus: "No",
    settlementDate: "",
    referrerMerchantName: "Sandbox Live Test",
    bonusStatus: "Pending",
    referralBonusBdt: 0,
    activityDate: "2025-05-15",
  },
  {
    companyName: "Pizzahut Dhaka Ltd",
    mssId: "pizzahut_test",
    email: "moniruzzaman.shisheir@gmail.com",
    mobileNumber: "01912350435",
    settlementStatus: "No",
    settlementDate: "",
    referrerMerchantName: "Ekushey E Shop",
    bonusStatus: "Pending",
    referralBonusBdt: 0,
    activityDate: "2025-04-22",
  },
  {
    companyName: "Infinity Mega Mall International",
    mssId: "infinitymegamallint",
    email: "arifmdmusa@gmail.com",
    mobileNumber: "01711124386",
    settlementStatus: "No",
    settlementDate: "",
    referrerMerchantName: "Ekushey E Shop",
    bonusStatus: "Pending",
    referralBonusBdt: 0,
    activityDate: "2025-04-23",
  },
];

const REFERRAL_INVITATION_SEED: Omit<ReferralInvitationRow, "activityDate">[] =
  [
    {
      companyName: "WELCOME ELECTRONICS",
      mssId: "google132live",
      refereeEmail: "kam.salahuddin@sslwireless.com",
      refereeMobileNumber: "01833163194",
      date: "23-Apr-2025",
    },
    {
      companyName: "Infinity Mega Mall International",
      mssId: "infinitymegamallint",
      refereeEmail: "arifmdmusa@gmail.com",
      refereeMobileNumber: "01711124386",
      date: "23-Apr-2025",
    },
    {
      companyName: "Infinity Mega Mall International",
      mssId: "infinitymegamallint",
      refereeEmail: "arifmdmusa@gmail.com",
      refereeMobileNumber: "01790059595",
      date: "23-Apr-2025",
    },
    {
      companyName: "Sandbox Live Test",
      mssId: "demotest",
      refereeEmail: "arifmdmusa@gmail.com",
      refereeMobileNumber: "01712325407",
      date: "16-Jul-2024",
    },
    {
      companyName: "Sandbox Live Test",
      mssId: "demotest",
      refereeEmail: "kam.salahuddin@sslwireless.com",
      refereeMobileNumber: "01920900925",
      date: "16-Jul-2024",
    },
    {
      companyName: "Sandbox Live Test",
      mssId: "demotest",
      refereeEmail: "tarek@sslwireless.com",
      refereeMobileNumber: "01747518653",
      date: "15-Jul-2024",
    },
    {
      companyName: "Sandbox Live Test",
      mssId: "demotest",
      refereeEmail: "tarek@sslwireless.com",
      refereeMobileNumber: "01833163194",
      date: "15-Jul-2024",
    },
  ];

const INVITATION_EMAIL_POOL = [
  "merchant.alpha@gmail.com",
  "store.beta@yahoo.com",
  "sales.gamma@outlook.com",
  "ops.delta@gmail.com",
  "contact.echo@sslwireless.com",
  "info.foxtrot@gmail.com",
  "support.golf@yahoo.com",
  "hello.hotel@gmail.com",
  "team.india@outlook.com",
  "admin.juliet@gmail.com",
];

const INVITATION_MOBILE_POOL = [
  "01710000001",
  "01710000002",
  "01710000003",
  "01710000004",
  "01710000005",
  "01710000006",
  "01710000007",
  "01710000008",
  "01710000009",
  "01710000010",
];

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatDisplayDate(date: Date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = MONTH_LABELS[date.getMonth()];
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function toActivityDate(date: Date) {
  return date.toISOString().split("T")[0];
}

const MONTH_MAP: Record<string, number> = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};

export function parseDisplayDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const match = dateStr.match(/^(\d{2})-([A-Za-z]{3})-(\d{4})$/);
  if (!match) return null;
  const [, day, mon, year] = match;
  const month = MONTH_MAP[mon];
  if (month === undefined) return null;
  return new Date(Number(year), month, Number(day));
}

function buildInvitationRow(
  index: number,
  companyName: string,
  mssId: string,
): ReferralInvitationRow {
  const baseDate = new Date(2024, 6, 1);
  baseDate.setDate(baseDate.getDate() + index * 3);
  const date = formatDisplayDate(baseDate);

  return {
    companyName,
    mssId,
    refereeEmail: INVITATION_EMAIL_POOL[index % INVITATION_EMAIL_POOL.length],
    refereeMobileNumber:
      INVITATION_MOBILE_POOL[index % INVITATION_MOBILE_POOL.length],
    date,
    activityDate: toActivityDate(baseDate),
  };
}

export function buildReferralInvitationRows(
  total = 97,
): ReferralInvitationRow[] {
  const rows: ReferralInvitationRow[] = REFERRAL_INVITATION_SEED.map((row) => {
    const parsed = parseDisplayDate(row.date);
    return {
      ...row,
      activityDate: parsed ? toActivityDate(parsed) : "2025-04-23",
    };
  });

  let index = rows.length;
  while (rows.length < total) {
    const companyName =
      index % 3 === 0
        ? "Sandbox Live Test"
        : index % 3 === 1
          ? "Ekushey E Shop"
          : "WELCOME ELECTRONICS";
    const mssId =
      companyName === "Sandbox Live Test"
        ? "demotest"
        : companyName === "Ekushey E Shop"
          ? "ekusheyes"
          : "google132live";
    rows.push(buildInvitationRow(index, companyName, mssId));
    index += 1;
  }

  return rows;
}

export const REFERRAL_INVITATIONS = buildReferralInvitationRows();

export function isActivityDateInRange(
  activityDate: string,
  from: string,
  to: string,
) {
  if (!from || !to) return true;
  const date = new Date(`${activityDate}T00:00:00`);
  const fromDate = new Date(`${from}T00:00:00`);
  const toDate = new Date(`${to}T23:59:59`);
  if (Number.isNaN(date.getTime())) return false;
  return date >= fromDate && date <= toDate;
}

export function formatPercentage(value: number, total: number) {
  if (total === 0) return "0.0%";
  return `${((value / total) * 100).toFixed(1)}%`;
}
