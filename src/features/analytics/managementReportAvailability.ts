/**
 * Management report tiles are enabled here once their report page is complete.
 * Add a route path to enable the corresponding tile in the Reports hub.
 */
export const ENABLED_MANAGEMENT_REPORT_ROUTES = new Set([
  "/analytics/reports/merchant-onboarding",
  "/analytics/reports/hunter-wise-merchant-onboarding",
  "/analytics/reports/kam-transaction-report",
  "/analytics/reports/sector-wise-onboarding",
  "/analytics/reports/lead-generation-vas",
  "/analytics/reports/instant-signup-analytics",
  "/analytics/reports/referral-report",
  "/analytics/reports/kam-revenue",
  "/analytics/reports/merchant-activity",
  "/analytics/reports/payment-analytics",
  "/analytics/reports/onboarded-invoice-summary",
  "/analytics/reports/transaction-failed-reason",
  "/analytics/reports/merchant-comparison",
  "/analytics/reports/kam-comparison",
  "/analytics/reports/sector-comparison",
]);

export function isManagementReportEnabled(route: string): boolean {
  return ENABLED_MANAGEMENT_REPORT_ROUTES.has(route);
}
