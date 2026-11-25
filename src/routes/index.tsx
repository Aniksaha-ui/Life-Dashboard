import {
  createBrowserRouter,
  Navigate,
  type RouteObject,
} from "react-router-dom";
import { PageLoadingState } from "../components/PageLoadingState";
import { RouteNotFound } from "../components/RouteNotFound";
import { AccountsPage } from "../features/accounts";
import {
  AuthGuard,
  GuestGuard,
  LoginPage,
  MenuRouteGuard,
} from "../features/auth";
import { BlogPreviewPage, BlogsPage } from "../features/blogs";
import BlogEditorPage from "../features/blogs/BlogEditorPage";
import { BudgetsPage } from "../features/budgets";
import { CategoriesPage } from "../features/categories";
import { ExpenseTransactionsPage } from "../features/expense-transactions";
import { ExperiencesPage } from "../features/experiences";
import { FileManagerPage } from "../features/file-manager";
import { FinancialIntelligencePage } from "../features/financial-intelligence";
import { MenuItemsPage } from "../features/menu-items";
import { ProjectsPage } from "../features/projects";
import { PublicationsPage } from "../features/publications";
import { RecurringExpensesPage } from "../features/recurring-expenses";
import {
  ReportDeliveryPage,
  ReportRunJobsPage,
} from "../features/report-delivery";
import {
  AccountBalancesReportPage,
  BurnRateAnalysisPage,
  CategoryBreakdownPage,
  FinancialOverviewPage,
  ReportDetailPage,
  ReportsPage,
  SummaryReportPage,
} from "../features/reports";
import { ServicesPage } from "../features/services";
import { TestimonialsPage } from "../features/testimonials";
import { TrainingsPage } from "../features/trainings";
import { TransfersPage } from "../features/transfers";
import { useMenuPermissions } from "../hooks/useMenuPermissions";
import { AppLayout } from "../layouts/AppLayout";

function LastVisitedRouteRedirect() {
  const { data, isPending, isFetching, firstAuthorizedPath, isPathAuthorized } =
    useMenuPermissions();

  if (isPending || (!data && isFetching)) {
    return <PageLoadingState />;
  }

  const lastRoute = window.localStorage.getItem("life-dashboard:last-route");
  const canRestoreLastRoute =
    Boolean(lastRoute?.startsWith("/")) &&
    lastRoute !== "/" &&
    isPathAuthorized(lastRoute!);

  if (canRestoreLastRoute && lastRoute) {
    return <Navigate to={lastRoute} replace />;
  }

  if (firstAuthorizedPath) {
    return <Navigate to={firstAuthorizedPath} replace />;
  }

  return (
    <div className="mx-auto mt-8 max-w-md rounded-xl border border-amber-200 bg-white p-6 text-center shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">
        No Authorized Pages Assigned
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Your account does not have access to any dashboard routes yet.
      </p>
    </div>
  );
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
          {
            element: <MenuRouteGuard />,
            children: [
              { index: true, element: <LastVisitedRouteRedirect /> },
              { path: "account", element: <AccountsPage /> },
              { path: "categories", element: <CategoriesPage /> },
              { path: "transactions", element: <ExpenseTransactionsPage /> },
              { path: "transfers", element: <TransfersPage /> },
              {
                path: "recurring-expenses",
                element: <RecurringExpensesPage />,
              },
              { path: "budgets", element: <BudgetsPage /> },
              { path: "blogs", element: <BlogsPage /> },
              { path: "blogs/new", element: <BlogEditorPage /> },
              { path: "blogs/:blogId/edit", element: <BlogEditorPage /> },
              { path: "blogs/:blogId", element: <BlogPreviewPage /> },
              { path: "experiences", element: <ExperiencesPage /> },
              { path: "projects", element: <ProjectsPage /> },
              { path: "publications", element: <PublicationsPage /> },
              { path: "testimonials", element: <TestimonialsPage /> },
              { path: "trainings", element: <TrainingsPage /> },
              { path: "services", element: <ServicesPage /> },
              { path: "menu-items", element: <MenuItemsPage /> },
              { path: "file-manager", element: <FileManagerPage /> },
              {
                path: "financial-intelligence",
                element: <FinancialIntelligencePage />,
              },
              { path: "report-delivery", element: <ReportDeliveryPage /> },
              {
                path: "report-delivery/run-jobs",
                element: <ReportRunJobsPage />,
              },
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
    ],
  },
  { path: "*", element: <RouteNotFound /> },
];

export const router = createBrowserRouter(routes);
