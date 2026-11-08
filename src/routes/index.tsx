import {
  createBrowserRouter,
  Navigate,
  type RouteObject,
} from "react-router-dom";
import { RouteNotFound } from "../components/RouteNotFound";
import { AccountsPage } from "../features/accounts";
import { AuthGuard, GuestGuard, LoginPage } from "../features/auth";
import { CategoriesPage } from "../features/categories";
import { ExpenseTransactionsPage } from "../features/expense-transactions";
import { TransfersPage } from "../features/transfers";
import { RecurringExpensesPage } from "../features/recurring-expenses";
import { FileManagerPage } from "../features/file-manager";
import { FinancialIntelligencePage } from "../features/financial-intelligence";
import {
  BurnRateAnalysisPage,
  CategoryBreakdownPage,
  FinancialOverviewPage,
  AccountBalancesReportPage,
  ReportDetailPage,
  ReportsPage,
  SummaryReportPage,
} from "../features/reports";
import { AppLayout } from "../layouts/AppLayout";

function LastVisitedRouteRedirect() {
  const lastRoute = window.localStorage.getItem("life-dashboard:last-route");
  const destination = lastRoute?.startsWith("/") && lastRoute !== "/"
    ? lastRoute
    : "/account";

  return <Navigate to={destination} replace />;
}

const routes: RouteObject[] = [
  {
    path: "/login",
    element: (
      <GuestGuard>
        <LoginPage />
      </GuestGuard>
    ),
  },
  {
    element: <AuthGuard />,
    children: [
      {
        path: "/",
        element: <AppLayout />,
        children: [
          { index: true, element: <LastVisitedRouteRedirect /> },
          { path: "account", element: <AccountsPage /> },
          { path: "categories", element: <CategoriesPage /> },
          { path: "transactions", element: <ExpenseTransactionsPage /> },
          { path: "transfers", element: <TransfersPage /> },
          { path: "recurring-expenses", element: <RecurringExpensesPage /> },
          { path: "file-manager", element: <FileManagerPage /> },
          { path: "financial-intelligence", element: <FinancialIntelligencePage /> },
          { path: "reports", element: <ReportsPage /> },
          {
            path: "reports/financial-overview",
            element: <FinancialOverviewPage />,
          },
          { path: "reports/summary", element: <SummaryReportPage /> },
          {
            path: "reports/burn-rate-analysis",
            element: <BurnRateAnalysisPage />,
          },
          {
            path: "reports/category-breakdown",
            element: <CategoryBreakdownPage />,
          },
          {
            path: "reports/account-balances",
            element: <AccountBalancesReportPage />,
          },
          { path: "reports/:reportId", element: <ReportDetailPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <RouteNotFound /> },
];

export const router = createBrowserRouter(routes);
