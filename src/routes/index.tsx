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
import {
  FinancialOverviewPage,
  ReportDetailPage,
  ReportsPage,
  SummaryReportPage,
} from "../features/reports";
import { AppLayout } from "../layouts/AppLayout";

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
          { index: true, element: <Navigate to="/account" replace /> },
          { path: "account", element: <AccountsPage /> },
          { path: "categories", element: <CategoriesPage /> },
          { path: "transactions", element: <ExpenseTransactionsPage /> },
          { path: "transfers", element: <TransfersPage /> },
          { path: "recurring-expenses", element: <RecurringExpensesPage /> },
          { path: "reports", element: <ReportsPage /> },
          {
            path: "reports/financial-overview",
            element: <FinancialOverviewPage />,
          },
          { path: "reports/summary", element: <SummaryReportPage /> },
          { path: "reports/:reportId", element: <ReportDetailPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <RouteNotFound /> },
];

export const router = createBrowserRouter(routes);
