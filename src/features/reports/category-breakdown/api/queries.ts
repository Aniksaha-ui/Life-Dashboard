import { getReport } from "../../api/queries";
export const getCategoryBreakdown = (fromDate: string, toDate: string) =>
  getReport("/reports/category-breakdown", { fromDate, toDate });
