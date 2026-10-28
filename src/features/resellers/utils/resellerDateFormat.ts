/** Day-first date, e.g. 15 Jul 2026 */
export function formatResellerDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Day-first date with time, e.g. 15 Jul 2026 · 11:18 AM */
export function formatResellerDateTime(value: string | Date): {
  datePart: string;
  timePart: string;
} {
  const date = typeof value === "string" ? new Date(value) : value;
  return {
    datePart: formatResellerDate(date),
    timePart: date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
  };
}

export function formatResellerDateTimeLabel(value: string | Date): string {
  const { datePart, timePart } = formatResellerDateTime(value);
  return `${datePart} · ${timePart}`;
}
