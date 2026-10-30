import { getReport } from "../../api/queries";
import type { FinancialGranularity } from "../types";

export const getFinancialOverview = (
  fromDate: string,
  toDate: string,
  granularity: FinancialGranularity,
) =>
  getReport("/reports/financial-overview", {
    fromDate,
    toDate,
    granularity,
  });
