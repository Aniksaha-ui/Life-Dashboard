export interface ReportDeliverySetting {
  job_key: string;
  label: string;
  command: string;
  is_enabled: boolean;
  email_enabled: boolean;
  email_recipients: string[];
  telegram_enabled: boolean;
  telegram_chat_ids: string[];
}

export interface RunReportJobResult {
  message?: string;
}
