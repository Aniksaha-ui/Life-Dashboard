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
import { BudgetsPage } from "../features/budgets";
import { BlogPreviewPage, BlogsPage } from "../features/blogs";
import BlogEditorPage from "../features/blogs/BlogEditorPage";
import { ExperiencesPage } from "../features/experiences";
import { ProjectsPage } from "../features/projects";
import { PublicationsPage } from "../features/publications";
import { TestimonialsPage } from "../features/testimonials";
import { TrainingsPage } from "../features/trainings";
import { ServicesPage } from "../features/services";
import { ReportDeliveryPage, ReportRunJobsPage } from "../features/report-delivery";
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
          { path: "file-manager", element: <FileManagerPage /> },
          { path: "financial-intelligence", element: <FinancialIntelligencePage /> },
          { path: "report-delivery", element: <ReportDeliveryPage /> },
          { path: "report-delivery/run-jobs", element: <ReportRunJobsPage /> },
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
