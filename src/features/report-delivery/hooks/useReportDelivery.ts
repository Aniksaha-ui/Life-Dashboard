import { useCallback, useEffect, useState } from "react";
import { showToast } from "../../../lib/toast";
import {
  getReportDeliverySettings,
  runReportDeliveryJob,
  updateReportDeliverySettings,
} from "../api/queries";
import type { ReportDeliverySetting } from "../types";

const isoDate = (date: Date) => date.toISOString().slice(0, 10);

export const recipientLines = (recipients: string[] | undefined) =>
  (recipients ?? []).join("\n");

export const parseRecipientLines = (value: string) =>
  value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);

export function useReportDelivery() {
  const now = new Date();
  const [settings, setSettings] = useState<ReportDeliverySetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [runningJob, setRunningJob] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`,
  );
  const [toDate, setToDate] = useState(isoDate(now));

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      setSettings(await getReportDeliverySettings());
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Unable to load report delivery settings.",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const updateSetting = <K extends keyof ReportDeliverySetting>(
    jobKey: string,
    field: K,
    value: ReportDeliverySetting[K],
  ) => {
    setSettings((current) =>
      current.map((setting) =>
        setting.job_key === jobKey ? { ...setting, [field]: value } : setting,
      ),
    );
  };

  const save = async () => {
    setIsSaving(true);
    try {
      const saved = await updateReportDeliverySettings(settings);
      setSettings(saved);
      showToast("Report delivery settings saved.", "success");
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Unable to save report delivery settings.",
        "error",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const run = async (setting: ReportDeliverySetting) => {
    if (!fromDate || !toDate) {
      showToast("Choose both a start date and an end date.", "error");
      return;
    }
    if (fromDate > toDate) {
      showToast("The start date must be on or before the end date.", "error");
      return;
    }

    setRunningJob(setting.job_key);
    try {
      const result = await runReportDeliveryJob(setting.job_key, {
        from_date: fromDate,
        to_date: toDate,
        ...(setting.job_key === "expense_intelligence_reports"
          ? { frequency: "daily" as const }
          : {}),
      });
      showToast(result.message || "Report command completed successfully.", "success");
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Unable to run the report command.",
        "error",
      );
    } finally {
      setRunningJob(null);
    }
  };

  return {
    settings,
    isLoading,
    isSaving,
    runningJob,
    fromDate,
    toDate,
    setFromDate,
    setToDate,
    refresh,
    save,
    run,
    updateSetting,
  };
}
