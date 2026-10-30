import { getReport } from "../../api/queries";

export const getSummaryReport = (fromDate: string, toDate: string) =>
  getReport("/reports/summary", { fromDate, toDate });
