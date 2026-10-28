export function matchesDateRange(
  itemDateValue: string,
  datePreset?: string,
  dateFrom?: string,
  dateTo?: string,
): boolean {
  if (!datePreset || datePreset === "all") return true;

  const itemDate = new Date(itemDateValue);
  const today = new Date();
  let fromDate = new Date(0);
  let toDate = new Date();

  switch (datePreset) {
    case "today":
      fromDate = new Date(today.setHours(0, 0, 0, 0));
      toDate = new Date(today.setHours(23, 59, 59, 999));
      break;
    case "last_day":
      fromDate = new Date(today);
      fromDate.setDate(today.getDate() - 1);
      fromDate.setHours(0, 0, 0, 0);
      toDate = new Date(fromDate);
      toDate.setHours(23, 59, 59, 999);
      break;
    case "7d":
      fromDate = new Date(today);
      fromDate.setDate(today.getDate() - 7);
      break;
    case "30d":
      fromDate = new Date(today);
      fromDate.setDate(today.getDate() - 30);
      break;
    case "custom":
      if (dateFrom) fromDate = new Date(dateFrom);
      if (dateTo) {
        toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
      }
      break;
    default:
      return true;
  }

  return itemDate >= fromDate && itemDate <= toDate;
}

export function parseUrlFilters(
  searchParams: URLSearchParams,
): Record<string, unknown> {
  const params: Record<string, unknown> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  if (params.date_preset) {
    params.date = {
      preset: params.date_preset,
      from: params.date_from,
      to: params.date_to,
    };
  }
  return params;
}

export function buildFilterSearchParams(
  localFilters: Record<string, unknown>,
): URLSearchParams {
  const params = new URLSearchParams();
  Object.entries(localFilters).forEach(([key, value]) => {
    if (key === "date") {
      const dateValue = value as
        { preset?: string; from?: string; to?: string } | undefined;
      if (dateValue?.preset && dateValue.preset !== "all") {
        params.set("date_preset", dateValue.preset);
        if (dateValue.from) params.set("date_from", dateValue.from);
        if (dateValue.to) params.set("date_to", dateValue.to);
      }
    } else if (value && value !== "all") {
      params.set(key, String(value));
    }
  });
  return params;
}
