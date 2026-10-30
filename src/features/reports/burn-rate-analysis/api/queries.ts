import { getReport } from "../../api/queries";
export const getBurnRateReport = (fromDate: string, toDate: string) =>
  getReport("/reports/burn-rate-analysis", { fromDate, toDate });
