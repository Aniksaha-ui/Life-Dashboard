export type PageViewMetric = {
  label: string;
  value: number;
};

export type CountryUserRow = {
  country: string;
  count: number;
};

export type PageEngagementRow = {
  pageName: string;
  engagementTime: string;
};

export type DropoffRateRow = {
  verificationType: string;
  started: number;
  completed: number;
  dropoffRate: string;
};

export type MediumTrafficRow = {
  sourceMedium: string;
  activeUserCount: number;
};

export type UserTypeRow = {
  userType: string;
  activeUserCount: number;
};

export type DeviceUsageRow = {
  device: string;
  activeUserCount: number;
};

export const INSTANT_SIGNUP_PAGE_VIEWS: PageViewMetric[] = [
  { label: "Registered with phone", value: 1431 },
  { label: "Merchant information uploaded", value: 461 },
  { label: "Registered with email", value: 210 },
  { label: "Registered Email Verification", value: 200 },
  { label: "Login OTP Verification", value: 192 },
  { label: "Registered Phone No Verification", value: 191 },
  { label: "Login", value: 150 },
  { label: "Bank info saved and created store", value: 86 },
  { label: "Uploaded required documentation", value: 80 },
];

export const INSTANT_SIGNUP_COUNTRY_USERS: CountryUserRow[] = [
  { country: "Bangladesh", count: 647 },
  { country: "United States", count: 22 },
  { country: "Canada", count: 7 },
  { country: "Germany", count: 6 },
  { country: "Indonesia", count: 6 },
  { country: "Netherlands", count: 5 },
  { country: "Saudi Arabia", count: 5 },
  { country: "France", count: 4 },
  { country: "India", count: 4 },
  { country: "Ireland", count: 4 },
  { country: "United Kingdom", count: 4 },
  { country: "Norway", count: 3 },
  { country: "United Arab Emirates", count: 3 },
  { country: "Australia", count: 2 },
  { country: "Brazil", count: 2 },
  { country: "Qatar", count: 2 },
  { country: "Belgium", count: 1 },
  { country: "Czechia", count: 1 },
  { country: "Hong Kong", count: 1 },
  { country: "Jordan", count: 1 },
  { country: "Kenya", count: 1 },
  { country: "Lithuania", count: 1 },
  { country: "Malaysia", count: 1 },
  { country: "New Zealand", count: 1 },
  { country: "Nigeria", count: 1 },
  { country: "Singapore", count: 1 },
  { country: "Sri Lanka", count: 1 },
  { country: "Uganda", count: 1 },
];

export const INSTANT_SIGNUP_ENGAGEMENT_METRICS = {
  bounceRate: "34.19%",
  averagePageViewPerSession: "3",
};

export const INSTANT_SIGNUP_PAGE_ENGAGEMENT: PageEngagementRow[] = [
  { pageName: "Upload require document", engagementTime: "6m 13s" },
  { pageName: "Merchant information upload", engagementTime: "4m 57s" },
  { pageName: "Bank info saved and created store", engagementTime: "3m 57s" },
  { pageName: "Register with phone", engagementTime: "2m 47s" },
  { pageName: "Login", engagementTime: "2m 42s" },
  { pageName: "Register Email Verification", engagementTime: "1m 20s" },
  { pageName: "Register with email", engagementTime: "1m 18s" },
  { pageName: "Login OTP Verification", engagementTime: "21s" },
  { pageName: "Register Phone No Verification", engagementTime: "16s" },
];

export const INSTANT_SIGNUP_CONVERSION_METRICS = {
  engagementTime: "11m 29s",
  timeToFirstAction: "6m 10s",
  sessionDuration: "5m 19s",
};

export const INSTANT_SIGNUP_DROPOFF_RATES: DropoffRateRow[] = [
  {
    verificationType: "Email Verification",
    started: 3014,
    completed: 3014,
    dropoffRate: "0.00%",
  },
  {
    verificationType: "Phone Verification",
    started: 3014,
    completed: 3014,
    dropoffRate: "0.00%",
  },
];

export const INSTANT_SIGNUP_MEDIUM_TRAFFIC: MediumTrafficRow[] = [
  { sourceMedium: "(direct) / (none)", activeUserCount: 699 },
  { sourceMedium: "google / organic", activeUserCount: 20 },
  { sourceMedium: "(not set)", activeUserCount: 7 },
  { sourceMedium: "mail.google.com / referral", activeUserCount: 4 },
  { sourceMedium: "m.facebook.com / referral", activeUserCount: 3 },
  { sourceMedium: "youtube.com / referral", activeUserCount: 3 },
  { sourceMedium: "kotkoti.xyz / referral", activeUserCount: 2 },
  { sourceMedium: "Facebook / lead", activeUserCount: 1 },
  { sourceMedium: "chatgpt.com / referral", activeUserCount: 1 },
  { sourceMedium: "github.com / referral", activeUserCount: 1 },
];

export const INSTANT_SIGNUP_USER_TYPES: UserTypeRow[] = [
  { userType: "New", activeUserCount: 629 },
  { userType: "Returning", activeUserCount: 221 },
];

export const INSTANT_SIGNUP_DEVICE_USAGE: DeviceUsageRow[] = [
  { device: "Desktop", activeUserCount: 416 },
  { device: "Mobile", activeUserCount: 326 },
  { device: "Tablet", activeUserCount: 3 },
];
