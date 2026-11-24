import type { ReportDeliverySetting } from "../types";

export const reportDeliveryJobs = [
  {
    job_key: "expense_reports",
    label: "Category expense report",
    command: "expense-reports:email",
  },
  {
    job_key: "cost_reduction_reports",
    label: "Cost reduction report",
    command: "cost-reduction-reports:email",
  },
  {
    job_key: "expense_intelligence_reports",
    label: "Expense intelligence report",
    command: "expense-intelligence-reports:email",
  },
  {
    job_key: "financial_overview_reports",
    label: "Financial overview report",
    command: "financial-overview-reports:email",
  },
] as const;

const list = (value: unknown) =>
  Array.isArray(value) ? value.map(String).filter(Boolean) : [];

/**
 * The API normally returns all four jobs. Normalizing against the supported
 * backend contract also keeps newly created users and partial legacy settings
 * fully runnable.
 */
export const normalizeReportDeliverySettings = (settings: unknown) => {
  const rows = Array.isArray(settings) ? settings : [];

  return reportDeliveryJobs.map((job) => {
    const saved = rows.find(
      (item): item is Partial<ReportDeliverySetting> =>
        typeof item === "object" &&
        item !== null &&
        (item as { job_key?: unknown }).job_key === job.job_key,
    );

    return {
      ...job,
      is_enabled: saved?.is_enabled ?? true,
      email_enabled: saved?.email_enabled ?? true,
      email_recipients: list(saved?.email_recipients),
      telegram_enabled: saved?.telegram_enabled ?? false,
      telegram_chat_ids: list(saved?.telegram_chat_ids),
    } satisfies ReportDeliverySetting;
  });
};
