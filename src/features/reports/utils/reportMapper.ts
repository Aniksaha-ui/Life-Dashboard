import type { ReportData, ReportMetric, ReportRow } from "../types";

const currency = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const readableLabel = (key: string) =>
  key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const isAmountKey = (key: string) =>
  /(amount|balance|income|expense|outflow|withdraw|burn|net|total)/i.test(key);

const isDateKey = (key: string) => /(date|_at|month|week)/i.test(key);

const formatDate = (value: unknown) => {
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);

  return date
    .toLocaleString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .replace(" am", "AM")
    .replace(" pm", "PM");
};

const displayValue = (key: string, value: unknown) => {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number" && isAmountKey(key))
    return `BDT ${currency.format(value)}`;
  if (isDateKey(key) && typeof value === "string" && value.trim())
    return formatDate(value);
  return String(value);
};

const tableItemsFrom = (payload: unknown): Record<string, unknown>[] => {
  if (Array.isArray(payload)) return payload as Record<string, unknown>[];
  if (!payload || typeof payload !== "object") return [];
  const record = payload as Record<string, unknown>;
  for (const key of ["table", "items", "rows", "data", "weeks"]) {
    if (Array.isArray(record[key]))
      return record[key] as Record<string, unknown>[];
  }
  return [];
};

const metricSourceFrom = (payload: unknown) => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload))
    return {};
  const record = payload as Record<string, unknown>;
  return record.summary && typeof record.summary === "object"
    ? (record.summary as Record<string, unknown>)
    : record;
};

export const mapReportData = (payload: unknown): ReportData => {
  const rawRows = tableItemsFrom(payload);
  const rows: ReportRow[] = rawRows.map((item, index) => ({
    ...item,
    serial: index + 1,
  }));
  const source = metricSourceFrom(payload);
  const metrics: ReportMetric[] = Object.entries(source)
    .filter(
      ([, value]) =>
        typeof value === "number" ||
        (typeof value === "string" && value.trim() !== "" && value.length < 48),
    )
    .slice(0, 6)
    .map(([key, value]) => ({
      label: readableLabel(key),
      value: displayValue(key, value),
    }));
  const graph =
    payload && typeof payload === "object" && !Array.isArray(payload)
      ? (payload as Record<string, any>).graph
      : null;

  return {
    rows,
    metrics,
    chart:
      graph && Array.isArray(graph.labels) && Array.isArray(graph.datasets)
        ? {
            labels: graph.labels.map(String),
            datasets: graph.datasets.map((dataset: any) => ({
              label: String(dataset.label ?? "Metric"),
              data: Array.isArray(dataset.data)
                ? dataset.data.map((value: unknown) => Number(value) || 0)
                : [],
              color: dataset.color,
            })),
          }
        : undefined,
  };
};

export const reportValue = displayValue;
export const reportLabel = readableLabel;
