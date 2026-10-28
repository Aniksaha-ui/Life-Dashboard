import { format, isValid, parse, parseISO } from "date-fns";

export function toIsoDateString(value: string): string {
  if (!value) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const displayParsed = parse(value, "dd-MMM-yy", new Date());
  if (isValid(displayParsed)) {
    return format(displayParsed, "yyyy-MM-dd");
  }

  const isoParsed = parseISO(value);
  if (isValid(isoParsed)) {
    return format(isoParsed, "yyyy-MM-dd");
  }

  const fallback = new Date(value);
  return isValid(fallback) ? format(fallback, "yyyy-MM-dd") : "";
}

export function toDisplayCampaignDate(value: string): string {
  if (!value) return "";

  if (/^\d{2}-[A-Za-z]{3}-\d{2}$/.test(value)) {
    return value;
  }

  const iso = toIsoDateString(value);
  if (!iso) return value;

  return format(parseISO(iso), "dd-MMM-yy");
}
