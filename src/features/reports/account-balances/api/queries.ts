import { getReport } from "../../api/queries";

export const getAccountBalancesReport = () =>
  getReport("/reports/account-balances", {});
