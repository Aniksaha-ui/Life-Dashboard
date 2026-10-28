import {
  createBrowserRouter,
  Navigate,
  useNavigate,
  useParams,
  type RouteObject,
} from "react-router-dom";
import { filterHiddenRoutes } from "../config/routeVisibility";
import { AppLayout } from "../layouts/AppLayout";

// Lazy loading placeholders for now
import { db } from "../data/mock/database";
import { ChargebacksPage, RefundsPage } from "../features/disputes";
import HomePage from "../features/home/HomePage";
import KamIntelligencePage from "../features/kam-intelligence/KamIntelligencePage";
import {
  EMIOperationPage,
  SettlementDrawer,
  SettlementsPage,
} from "../features/manage-settlement";
import AddMerchantPage from "../features/merchants/AddMerchantPage";
import AddMerchantStorePage from "../features/merchants/AddMerchantStorePage";
import AddMerchantUserPage from "../features/merchants/AddMerchantUserPage";
import ApproveStoreCommissionPage from "../features/merchants/ApproveStoreCommissionPage";
import EditStoreDiscountPage from "../features/merchants/EditStoreDiscountPage";
import ManageAccountPage from "../features/merchants/ManageAccountPage";
import MerchantProfilePage from "../features/merchants/MerchantProfilePage";
import MerchantsPage, {
  MerchantDrawer,
} from "../features/merchants/MerchantsPage";
import { MerchantEditDrawer } from "../features/merchants/MerchantEditDrawer";
import MerchantStoresPage from "../features/merchants/MerchantStoresPage";
import MerchantUsersPage from "../features/merchants/MerchantUsersPage";
import {
  ResellerDrawer,
  ResellersPage,
  AddResellerPage,
  InviteResellerPage,
  KamResellersListPage,
  KamResellerDetailDrawer,
  OpResellersListPage,
  OpResellerDetailDrawer,
  ApResellersListPage,
  ApResellerDetailDrawer,
  RaResellersListPage,
  RaResellerDetailDrawer,
  ResellerDetailsPage,
  ResellerHistoryLogPage,
} from "../features/resellers";
import StoreDiscountPage from "../features/merchants/StoreDiscountPage";
import ReverseAdjustmentAmountPage from "../features/merchants/ReverseAdjustmentAmountPage";
import AddBulkDiscountPage from "../features/merchants/AddBulkDiscountPage";
import {
  MerchantTicketsPage,
  TransactionTicketsPage,
} from "../features/support";
import { TransactionsPage } from "../features/transactions";
import RetailNewsPage from "../features/retail-news/RetailNewsPage";
import AddRetailNewsPage from "../features/retail-news/AddRetailNewsPage";

// Recurring Info
import RecurringInfoPage from "../features/recurring-info/RecurringInfoPage";
import QRMerchantsAnalyticsPage from "../features/qr-merchants-analytics/QRMerchantsAnalyticsPage";

// Analysis Category
import AnalysisCategoryPage from "../features/analysis-category/AnalysisCategoryPage";
import AddAnalysisCategoryPage from "../features/analysis-category/AddAnalysisCategoryPage";
import EmailLogsPage from "../features/email-logs/EmailLogsPage";
import EmailLogDrawer from "../features/email-logs/EmailLogDrawer";
// Campaign Management
import CampaignStoreManagementPage from "../features/campaign-management/CampaignStoreManagementPage";
import KamMerchantCampaignsListPage from "../features/campaign-management/KamMerchantCampaignsListPage";
import KamMerchantCampaignListPage from "../features/campaign-management/KamMerchantCampaignListPage";
import BankCampaignStoreManagePage from "../features/campaign-management/BankCampaignStoreManagePage";
import BankCampaignApprovedListPage from "../features/campaign-management/BankCampaignApprovedListPage";
import ManageBankCampaignPOCPage from "../features/campaign-management/ManageBankCampaignPOCPage";
import KamSectorMappingPage from "../features/campaign-management/KamSectorMappingPage";
import EmailMessageAnalyticsPage from "../features/campaign-management/EmailMessageAnalyticsPage";
import AddMerchantCampaignPage from "../features/campaign-management/AddMerchantCampaignPage";
import AddBulkCampaignPage from "../features/campaign-management/AddBulkCampaignPage";
import KamCampaignCalendarPage from "../features/campaign-management/KamCampaignCalendarPage";
import CustomCampaignPage from "../features/campaign-management/CustomCampaignPage";

// Gateway Routing
import GatewayRoutingPage from "../features/gateway-routing/GatewayRoutingPage";
import GatewayRoutingDrawer from "../features/gateway-routing/GatewayRoutingDrawer";

// Analytics
import AnalysisReportPage from "../features/analytics/AnalysisReportPage";
import AnalyticsHub from "../features/analytics/AnalyticsHub";
import MerchantSurveysPage from "../features/analytics/MerchantSurveysPage";
import PaymentsAnalytics from "../features/analytics/PaymentsAnalytics";
import PortfolioHealth from "../features/analytics/PortfolioHealth";
import ReportDetailPage from "../features/analytics/reports/ReportDetailPage";

// Auth
import {
  AuthGuard,
  GuestGuard,
  ChangePasswordPage,
  ForgotPasswordPage,
  ForgotPasswordVerifyPage,
  LoginPage,
  OTPVerificationPage,
} from "../features/auth";

import { DevelopersPage } from "../features/developers";
import { RouteNotFound } from "../components/RouteNotFound";
import BanksPage from "../features/manage-bank/BanksPage";
import CardTypesPage from "../features/manage-bank/CardTypesPage";
import BankValidationPage from "../features/manage-bank/BankValidationPage";
import LocalIssuerBankPage from "../features/manage-bank/LocalIssuerBankPage";
import AddLocalIssuerBankPage from "../features/manage-bank/AddLocalIssuerBankPage";
import { LocalIssuerBankDrawer } from "../features/manage-bank/LocalIssuerBankDrawer";
import NotificationsPage from "../features/notifications/NotificationsPage";
import { AccountsPage } from "../features/accounts";
import { CategoriesPage } from "../features/categories";

function SettlementDrawerWrapper() {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const item = db.settlements.find(
    (s) => s.id === batchId || s.batchId === batchId,
  );

  if (!item) return null;

  return (
    <SettlementDrawer
      transactionId={item.id}
      onClose={() => navigate("/settlements")}
    />
  );
}

const routes: RouteObject[] = [
  // Public Auth Routes (no layout)
  {
    path: "/login",
    element: (
      <GuestGuard>
        <LoginPage />
      </GuestGuard>
    ),
  },
  {
    path: "/login/otp",
    element: <OTPVerificationPage />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />,
  },
  {
    path: "/forgot-password/verify",
    element: <ForgotPasswordVerifyPage />,
  },
  // Protected Routes (with layout)
  {
    element: <AuthGuard />,
    children: [
      {
        path: "/",
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: "dashboard",
            element: <HomePage />,
            children: [{ path: "m/:merchantId", element: <MerchantDrawer /> }],
          },
          { path: "account", element: <AccountsPage /> },
          { path: "categories", element: <CategoriesPage /> },
          {
            path: "kam-intelligence",
            element: <KamIntelligencePage />,
          },
          {
            path: "qr-analytics",
            element: <QRMerchantsAnalyticsPage />,
          },
          {
            path: "merchants",
            element: <MerchantsPage />,
            children: [
              { path: "top", element: null },
              { path: "non-transacting", element: null },
              { path: "edit/:merchantId", element: <MerchantEditDrawer /> },
              { path: ":merchantId", element: <MerchantDrawer /> },
              { path: "top/:merchantId", element: <MerchantDrawer /> },
              {
                path: "non-transacting/:merchantId",
                element: <MerchantDrawer />,
              },
            ],
          },
          {
            path: "merchants/new",
            element: <AddMerchantPage />,
          },
          {
            path: "merchants/profile/:merchantId",
            element: <MerchantProfilePage />,
          },
          {
            path: "merchants/stores/:merchantId",
            element: <MerchantStoresPage />,
          },
          {
            path: "merchants/stores/:merchantId/new",
            element: <AddMerchantStorePage />,
          },
          {
            path: "merchants/stores/new",
            element: <AddMerchantStorePage />,
          },
          {
            path: "merchants/users/:merchantId",
            element: <MerchantUsersPage />,
          },
          {
            path: "merchants/users/:merchantId/new",
            element: <AddMerchantUserPage />,
          },
          {
            path: "merchants/users/:merchantId/:userId/edit",
            element: <AddMerchantUserPage mode="edit" />,
          },
          {
            path: "merchants/store-commission-approval",
            element: <ApproveStoreCommissionPage />,
          },
          {
            path: "merchants/manage-account",
            element: <ManageAccountPage />,
          },
          {
            path: "merchants/reverse-adjustment-amount",
            element: <ReverseAdjustmentAmountPage />,
          },
          {
            path: "merchants/store-discount",
            element: <StoreDiscountPage />,
          },
          {
            path: "merchants/store-discount/new",
            element: <EditStoreDiscountPage mode="add" />,
          },
          {
            path: "merchants/store-discount/new-bulk",
            element: <AddBulkDiscountPage />,
          },
          {
            path: "merchants/store-discount/:campaignId/edit",
            element: <EditStoreDiscountPage />,
          },
          {
            path: "resellers/kam-list",
            element: <KamResellersListPage />,
            children: [
              { path: ":resellerId", element: <KamResellerDetailDrawer /> },
            ],
          },
          {
            path: "resellers/op-list",
            element: <OpResellersListPage />,
            children: [
              { path: "edit/:resellerId", element: <ResellerDrawer /> },
              { path: ":resellerId", element: <OpResellerDetailDrawer /> },
            ],
          },
          {
            path: "resellers/op-list/details/:resellerId",
            element: <ResellerDetailsPage />,
          },
          {
            path: "resellers/ap-list",
            element: <ApResellersListPage />,
            children: [
              { path: ":resellerId", element: <ApResellerDetailDrawer /> },
            ],
          },
          {
            path: "resellers/ra-list",
            element: <RaResellersListPage />,
            children: [
              { path: ":resellerId", element: <RaResellerDetailDrawer /> },
            ],
          },
          {
            path: "resellers/add",
            element: <AddResellerPage />,
          },
          {
            path: "resellers/invite",
            element: <InviteResellerPage />,
          },
          {
            path: "resellers/history-log",
            element: <ResellerHistoryLogPage />,
          },
          {
            path: "resellers",
            element: <ResellersPage />,
            children: [{ path: ":resellerId", element: <ResellerDrawer /> }],
          },
          {
            path: "retail-news",
            element: <RetailNewsPage />,
          },
          {
            path: "retail-news/add",
            element: <AddRetailNewsPage />,
          },
          {
            path: "recurring-info",
            element: <RecurringInfoPage />,
          },
          {
            path: "analysis-categories",
            element: <AnalysisCategoryPage />,
          },
          {
            path: "analysis-categories/add",
            element: <AddAnalysisCategoryPage />,
          },
          {
            path: "email-logs",
            element: <EmailLogsPage />,
            children: [{ path: ":logId", element: <EmailLogDrawer /> }],
          },
          {
            path: "transactions",
            element: <TransactionsPage />,
          },
          {
            path: "transaction-tickets",
            element: <TransactionTicketsPage />,
          },
          {
            path: "merchant-tickets",
            element: <MerchantTicketsPage />,
          },
          {
            path: "chargebacks",
            element: <ChargebacksPage />,
          },
          {
            path: "refunds",
            element: <RefundsPage />,
          },
          {
            path: "settlements",
            element: <SettlementsPage />,
            children: [
              { path: ":batchId", element: <SettlementDrawerWrapper /> },
            ],
          },
          {
            path: "emi-operations",
            element: <EMIOperationPage />,
          },
          {
            path: "analytics",
            children: [
              { index: true, element: <AnalyticsHub /> },
              { path: "payments", element: <PaymentsAnalytics /> },
              { path: "portfolio", element: <PortfolioHealth /> },
              { path: "analysis-report", element: <AnalysisReportPage /> },
              { path: "merchant-surveys", element: <MerchantSurveysPage /> },
              { path: "reports/:reportId", element: <ReportDetailPage /> },
            ],
          },
          { path: "notifications", element: <NotificationsPage /> },
          { path: "developers", element: <DevelopersPage /> },
          {
            path: "manage-bank",
            children: [
              { path: "banks", element: <BanksPage /> },
              { path: "card-types", element: <CardTypesPage /> },
              { path: "bank-validation", element: <BankValidationPage /> },
              {
                path: "local-issuer-bank",
                element: <LocalIssuerBankPage />,
                children: [
                  { path: ":bankId", element: <LocalIssuerBankDrawer /> },
                ],
              },
              {
                path: "local-issuer-bank/add",
                element: <AddLocalIssuerBankPage />,
              },
            ],
          },
          {
            path: "gateway-routing",
            element: <GatewayRoutingPage />,
            children: [{ path: ":ruleId", element: <GatewayRoutingDrawer /> }],
          },
          { path: "change-password", element: <ChangePasswordPage /> },
          {
            path: "campaign-management",
            children: [
              {
                path: "store-management",
                element: <CampaignStoreManagementPage />,
              },
              {
                path: "kam-merchant-campaign-list",
                element: <KamMerchantCampaignsListPage />,
              },
              {
                path: "merchant-campaign-list",
                element: <KamMerchantCampaignListPage />,
              },
              {
                path: "merchant-campaign-list/new",
                element: <AddMerchantCampaignPage />,
              },
              {
                path: "merchant-campaign-list/new-single",
                element: <AddMerchantCampaignPage />,
              },
              {
                path: "merchant-campaign-list/new-bulk",
                element: <AddBulkCampaignPage />,
              },
              {
                path: "bank-campaign-store",
                element: <BankCampaignStoreManagePage />,
              },
              {
                path: "bank-campaign-approved",
                element: <BankCampaignApprovedListPage />,
              },
              {
                path: "bank-campaign-poc",
                element: <ManageBankCampaignPOCPage />,
              },
              { path: "sector-mapping", element: <KamSectorMappingPage /> },
              {
                path: "email-message-analytics",
                element: <EmailMessageAnalyticsPage />,
              },
              {
                path: "campaign-calendar",
                element: <KamCampaignCalendarPage />,
              },
              { path: "custom-campaign", element: <CustomCampaignPage /> },
            ],
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <RouteNotFound />,
  },
];

export const router = createBrowserRouter(routes);
