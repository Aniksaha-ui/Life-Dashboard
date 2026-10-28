// Report Detail Page - Main container for Stripe-style report view
import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { ChevronRight, Printer, Download, Info } from "lucide-react";
import { clsx } from "clsx";
import { useReportData, getDefaultFilters } from "./reportApi";
import type { ReportFilters } from "./reportApi";
import { getReportConfig } from "./reportRegistry";
import { ReportLoadingOverlay } from "./components/ReportLoadingOverlay";
import { ReportFiltersComponent } from "./components/ReportFilters";
import { ReportSection } from "./components/ReportSection";
import { MerchantWiseReport } from "./components/MerchantWiseReport";
import type { MerchantWiseReportHandle } from "./components/MerchantWiseReport";
import { MerchantChannelWiseReport } from "./components/MerchantChannelWiseReport";
import type { MerchantChannelWiseReportHandle } from "./components/MerchantChannelWiseReport";
import { SectorWiseReport } from "./components/SectorWiseReport";
import type { SectorWiseReportHandle } from "./components/SectorWiseReport";
import { MerchantSuccessFailReport } from "./components/MerchantSuccessFailReport";
import type { MerchantSuccessFailReportHandle } from "./components/MerchantSuccessFailReport";
import { MerchantSurveyReport } from "./components/MerchantSurveyReport";
import type { MerchantSurveyReportHandle } from "./components/MerchantSurveyReport";
import { MerchantOnboardingReport } from "./components/MerchantOnboardingReport";
import type { MerchantOnboardingReportHandle } from "./components/MerchantOnboardingReport";
import { HunterWiseMerchantOnboardingReport } from "./components/HunterWiseMerchantOnboardingReport";
import type { HunterWiseMerchantOnboardingReportHandle } from "./components/HunterWiseMerchantOnboardingReport";
import { KamTransactionReport } from "./components/KamTransactionReport";
import type { KamTransactionReportHandle } from "./components/KamTransactionReport";
import { SectorWiseOnboardingReport } from "./components/SectorWiseOnboardingReport";
import type { SectorWiseOnboardingReportHandle } from "./components/SectorWiseOnboardingReport";
import { LeadGenerationVasReport } from "./components/LeadGenerationVasReport";
import type { LeadGenerationVasReportHandle } from "./components/LeadGenerationVasReport";
import { ReferralReport } from "./components/ReferralReport";
import type { ReferralReportHandle } from "./components/ReferralReport";
import { InstantSignupAnalyticsReport } from "./components/InstantSignupAnalyticsReport";
import type { InstantSignupAnalyticsReportHandle } from "./components/InstantSignupAnalyticsReport";
import { MerchantWiseGrowthReport } from "./components/MerchantWiseGrowthReport";
import type { MerchantWiseGrowthReportHandle } from "./components/MerchantWiseGrowthReport";
import { RevenueReport } from "./components/RevenueReport";
import type { RevenueReportHandle } from "./components/RevenueReport";
import { MerchantActivityReport } from "./components/MerchantActivityReport";
import type { MerchantActivityReportHandle } from "./components/MerchantActivityReport";
import { PaymentAnalyticsReport } from "./components/PaymentAnalyticsReport";
import type { PaymentAnalyticsReportHandle } from "./components/PaymentAnalyticsReport";
import { OnboardedInvoiceSummaryReport } from "./components/OnboardedInvoiceSummaryReport";
import type { OnboardedInvoiceSummaryReportHandle } from "./components/OnboardedInvoiceSummaryReport";
import { KamFailedTransactionReport } from "./components/KamFailedTransactionReport";
import type { KamFailedTransactionReportHandle } from "./components/KamFailedTransactionReport";
import { FinancialYearReport } from "./components/FinancialYearReport";
import type { FinancialYearReportHandle } from "./components/FinancialYearReport";
import { SettlementBounceOpReport } from "./components/SettlementBounceOpReport";
import type { SettlementBounceOpReportHandle } from "./components/SettlementBounceOpReport";
import { GatewayTransactionReport } from "./components/GatewayTransactionReport";
import type { GatewayTransactionReportHandle } from "./components/GatewayTransactionReport";
import { KamwiseMerchantTransactionReport } from "./components/KamwiseMerchantTransactionReport";
import type { KamwiseMerchantTransactionReportHandle } from "./components/KamwiseMerchantTransactionReport";
import { MonthlyTransactionAnalysisReport } from "./components/MonthlyTransactionAnalysisReport";
import type { MonthlyTransactionAnalysisReportHandle } from "./components/MonthlyTransactionAnalysisReport";
import { SectorWiseActiveRatioReport } from "./components/SectorWiseActiveRatioReport";
import type { SectorWiseActiveRatioReportHandle } from "./components/SectorWiseActiveRatioReport";
import { ManageRiskySanctionsReport } from "./components/ManageRiskySanctionsReport";
import type { ManageRiskySanctionsReportHandle } from "./components/ManageRiskySanctionsReport";
import { SettlementBounceReport } from "./components/SettlementBounceReport";
import type { SettlementBounceReportHandle } from "./components/SettlementBounceReport";
import { TransactionFailedReasonReport } from "./components/TransactionFailedReasonReport";
import type { TransactionFailedReasonReportHandle } from "./components/TransactionFailedReasonReport";
import { IncentiveReport } from "./components/IncentiveReport";
import type { IncentiveReportHandle } from "./components/IncentiveReport";
import { MerchantComparisonReport } from "./components/MerchantComparisonReport";
import type { MerchantComparisonReportHandle } from "./components/MerchantComparisonReport";
import { KamComparisonReport } from "./components/KamComparisonReport";
import type { KamComparisonReportHandle } from "./components/KamComparisonReport";
import { SectorComparisonReport } from "./components/SectorComparisonReport";
import type { SectorComparisonReportHandle } from "./components/SectorComparisonReport";
import { ExploreModal } from "./components/ExploreModal";
import { exportSectionToCsv } from "./utils/exportToCsv";
import { Tooltip } from "../../../components/Tooltip";

export default function ReportDetailPage() {
  const { reportId } = useParams<{ reportId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize filters from URL or defaults
  const [filters, setFilters] = useState<ReportFilters>(() => {
    const defaults = getDefaultFilters(reportId);
    return {
      from: searchParams.get("from") || defaults.from,
      to: searchParams.get("to") || defaults.to,
      merchantId: searchParams.get("merchantId") || undefined,
      storeId: searchParams.get("storeId") || undefined,
      sector: searchParams.get("sector") || undefined,
      year: searchParams.get("year")
        ? parseInt(searchParams.get("year")!)
        : undefined,
      trendType:
        searchParams.get("trendType") ||
        (reportId === "kam-transaction-report" ? "all" : undefined),
      question: searchParams.get("question") || undefined,
      bank: searchParams.get("bank") || undefined,
      revenueType:
        searchParams.get("revenueType") ||
        (reportId === "kam-revenue" ? "merchant" : undefined),
      kam: searchParams.get("kam") || undefined,
      errorDescription: searchParams.get("errorDescription") || undefined,
      month: searchParams.get("month") || undefined,
      segment: searchParams.get("segment") || undefined,
      trackerId: searchParams.get("trackerId") || undefined,
      status: searchParams.get("status") || undefined,
      bulkUpload: searchParams.get("bulkUpload") === "true",
      segmentName: searchParams.get("segmentName") || undefined,
    };
  });

  // Local buffered state for filters
  const [localFilters, setLocalFilters] = useState<ReportFilters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Explore modal state
  const [exploreModal, setExploreModal] = useState<{
    isOpen: boolean;
    sectionTitle: string;
  }>({ isOpen: false, sectionTitle: "" });

  // Get report config for static info
  const reportConfig = reportId ? getReportConfig(reportId) : undefined;

  // Fetch report data with React Query
  const {
    data: reportData,
    isLoading,
    isError,
    error,
  } = useReportData(reportId || "", filters);

  // Sync filters to URL
  useEffect(() => {
    const params: Record<string, string> = {
      from: filters.from,
      to: filters.to,
    };
    if (filters.merchantId) params.merchantId = filters.merchantId;
    if (filters.storeId) params.storeId = filters.storeId;
    if (filters.sector) params.sector = filters.sector;
    if (filters.year) params.year = filters.year.toString();
    if (filters.trendType) params.trendType = filters.trendType;
    if (filters.question) params.question = filters.question;

    if (filters.bank) params.bank = filters.bank;
    if (filters.revenueType) params.revenueType = filters.revenueType;
    if (filters.kam) params.kam = filters.kam;
    if (filters.errorDescription)
      params.errorDescription = filters.errorDescription;
    if (filters.month) params.month = filters.month;
    if (filters.segment) params.segment = filters.segment;
    if (filters.trackerId) params.trackerId = filters.trackerId;
    if (filters.status) params.status = filters.status;
    if (filters.bulkUpload) params.bulkUpload = "true";
    if (filters.segmentName) params.segmentName = filters.segmentName;

    setSearchParams(params);
  }, [filters, setSearchParams]);

  // Handle filter changes (local buffer)
  const handleFiltersChange = (newFilters: ReportFilters) => {
    setLocalFilters(newFilters);
  };

  const applyFilters = () => {
    setFilters(localFilters);
  };

  const clearFilters = () => {
    const defaults = getDefaultFilters(reportId);
    setLocalFilters(defaults);
    setFilters(defaults);
  };

  // Handle export
  const handleExport = (sectionId: string) => {
    if (!reportData || !reportId) return;
    const section = reportData.sections.find((s) => s.sectionId === sectionId);
    if (section) {
      exportSectionToCsv(section, {
        reportId,
        sectionId,
        from: filters.from,
        to: filters.to,
      });
    }
  };

  // Handle explore
  const handleExplore = (sectionTitle: string) => {
    setExploreModal({ isOpen: true, sectionTitle });
  };

  // Refs for tailored reports
  const merchantReportRef = useRef<MerchantWiseReportHandle>(null);
  const channelReportRef = useRef<MerchantChannelWiseReportHandle>(null);
  const successFailReportRef = useRef<MerchantSuccessFailReportHandle>(null);
  const surveyReportRef = useRef<MerchantSurveyReportHandle>(null);
  const onboardingReportRef = useRef<MerchantOnboardingReportHandle>(null);
  const hunterOnboardingReportRef =
    useRef<HunterWiseMerchantOnboardingReportHandle>(null);
  const kamTransactionReportRef = useRef<KamTransactionReportHandle>(null);
  const sectorOnboardingReportRef =
    useRef<SectorWiseOnboardingReportHandle>(null);
  const leadGenerationVasReportRef =
    useRef<LeadGenerationVasReportHandle>(null);
  const referralReportRef = useRef<ReferralReportHandle>(null);
  const instantSignupAnalyticsReportRef =
    useRef<InstantSignupAnalyticsReportHandle>(null);
  const sectorReportRef = useRef<SectorWiseReportHandle>(null);
  const merchantGrowthReportRef = useRef<MerchantWiseGrowthReportHandle>(null);
  const revenueReportRef = useRef<RevenueReportHandle>(null);
  const merchantActivityReportRef = useRef<MerchantActivityReportHandle>(null);
  const paymentAnalyticsReportRef = useRef<PaymentAnalyticsReportHandle>(null);
  const onboardedInvoiceSummaryReportRef =
    useRef<OnboardedInvoiceSummaryReportHandle>(null);
  const kamFailedReportRef = useRef<KamFailedTransactionReportHandle>(null);
  const financialYearReportRef = useRef<FinancialYearReportHandle>(null);
  const bounceOpReportRef = useRef<SettlementBounceOpReportHandle>(null);
  const gatewayReportRef = useRef<GatewayTransactionReportHandle>(null);
  const kamMerchantTnxReportRef =
    useRef<KamwiseMerchantTransactionReportHandle>(null);
  const monthlyAnalysisReportRef =
    useRef<MonthlyTransactionAnalysisReportHandle>(null);
  const sectorActiveRatioReportRef =
    useRef<SectorWiseActiveRatioReportHandle>(null);
  const manageRiskySanctionsReportRef =
    useRef<ManageRiskySanctionsReportHandle>(null);
  const SettlementBounceReportRef = useRef<SettlementBounceReportHandle>(null);
  const incentiveReportRef = useRef<IncentiveReportHandle>(null);
  const transactionFailedReasonReportRef =
    useRef<TransactionFailedReasonReportHandle>(null);
  const merchantComparisonReportRef =
    useRef<MerchantComparisonReportHandle>(null);
  const kamComparisonReportRef = useRef<KamComparisonReportHandle>(null);
  const sectorComparisonReportRef = useRef<SectorComparisonReportHandle>(null);

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  const handleGlobalExport = () => {
    if (reportId === "merchant-wise" && merchantReportRef.current) {
      merchantReportRef.current.exportData();
    } else if (
      reportId === "merchant-channel-wise" &&
      channelReportRef.current
    ) {
      channelReportRef.current.exportData();
    } else if (
      reportId === "merchant-success-fail-tnx" &&
      successFailReportRef.current
    ) {
      successFailReportRef.current.exportData();
    } else if (reportId === "merchant-survey" && surveyReportRef.current) {
      surveyReportRef.current.exportData();
    } else if (
      reportId === "merchant-onboarding" &&
      onboardingReportRef.current
    ) {
      onboardingReportRef.current.exportData();
    } else if (
      reportId === "hunter-wise-merchant-onboarding" &&
      hunterOnboardingReportRef.current
    ) {
      hunterOnboardingReportRef.current.exportData();
    } else if (
      reportId === "kam-transaction-report" &&
      kamTransactionReportRef.current
    ) {
      kamTransactionReportRef.current.exportData();
    } else if (
      reportId === "sector-wise-onboarding" &&
      sectorOnboardingReportRef.current
    ) {
      sectorOnboardingReportRef.current.exportData();
    } else if (
      reportId === "lead-generation-vas" &&
      leadGenerationVasReportRef.current
    ) {
      leadGenerationVasReportRef.current.exportData();
    } else if (reportId === "referral-report" && referralReportRef.current) {
      referralReportRef.current.exportData();
    } else if (
      reportId === "instant-signup-analytics" &&
      instantSignupAnalyticsReportRef.current
    ) {
      instantSignupAnalyticsReportRef.current.exportData();
    } else if (reportId === "sector-wise" && sectorReportRef.current) {
      sectorReportRef.current.exportData();
    } else if (
      reportId === "merchant-growth" &&
      merchantGrowthReportRef.current
    ) {
      merchantGrowthReportRef.current.exportData();
    } else if (reportId === "kam-revenue" && revenueReportRef.current) {
      revenueReportRef.current.exportData();
    } else if (
      reportId === "merchant-activity" &&
      merchantActivityReportRef.current
    ) {
      merchantActivityReportRef.current.exportData();
    } else if (
      reportId === "payment-analytics" &&
      paymentAnalyticsReportRef.current
    ) {
      paymentAnalyticsReportRef.current.exportData();
    } else if (
      reportId === "onboarded-invoice-summary" &&
      onboardedInvoiceSummaryReportRef.current
    ) {
      onboardedInvoiceSummaryReportRef.current.exportData();
    } else if (
      reportId === "kam-transaction-failed" &&
      kamFailedReportRef.current
    ) {
      kamFailedReportRef.current.exportData();
    } else if (
      reportId === "settlement-bounce-operation" &&
      bounceOpReportRef.current
    ) {
      bounceOpReportRef.current.exportData();
    } else if (
      reportId === "financial-year" &&
      financialYearReportRef.current
    ) {
      financialYearReportRef.current.exportData();
    } else if (reportId === "gateway-transaction" && gatewayReportRef.current) {
      gatewayReportRef.current.exportData();
    } else if (
      reportId === "kam-merchant-transaction" &&
      kamMerchantTnxReportRef.current
    ) {
      kamMerchantTnxReportRef.current.exportData();
    } else if (
      reportId === "monthly-transaction-analysis" &&
      monthlyAnalysisReportRef.current
    ) {
      monthlyAnalysisReportRef.current.exportData();
    } else if (
      reportId === "sector-wise-active-ratio" &&
      sectorActiveRatioReportRef.current
    ) {
      sectorActiveRatioReportRef.current.exportData();
    } else if (
      reportId === "manage-risky-sanctions" &&
      manageRiskySanctionsReportRef.current
    ) {
      manageRiskySanctionsReportRef.current.exportData();
    } else if (
      reportId === "settlement-bounce-kam" &&
      SettlementBounceReportRef.current
    ) {
      SettlementBounceReportRef.current.exportData();
    } else if (
      reportId === "transaction-failed-reason" &&
      transactionFailedReasonReportRef.current
    ) {
      transactionFailedReasonReportRef.current.exportData();
    } else if (reportId === "incentive-report" && incentiveReportRef.current) {
      incentiveReportRef.current.exportData();
    } else if (
      reportId === "merchant-comparison" &&
      merchantComparisonReportRef.current
    ) {
      merchantComparisonReportRef.current.exportData();
    }
  };

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <p className="text-lg font-medium text-slate-900 mb-2">
          Failed to load report
        </p>
        <p className="text-sm text-slate-500 mb-4">
          {error instanceof Error ? error.message : "Unknown error occurred"}
        </p>
        <Link
          to="/analytics"
          className="text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          ← Back to Reports
        </Link>
      </div>
    );
  }

  // Report not found
  if (!reportConfig) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <p className="text-lg font-medium text-slate-900 mb-2">
          Report not found
        </p>
        <p className="text-sm text-slate-500 mb-4">
          The report "{reportId}" does not exist.
        </p>
        <Link
          to="/analytics"
          className="text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          ← Back to Reports
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Breadcrumb & Info */}
      <div className="mb-6 flex items-center justify-between">
        <nav className="flex items-center gap-2 text-sm">
          <Link
            to="/analytics"
            className="text-slate-500 hover:text-slate-700 transition-colors"
          >
            Reports
          </Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-slate-900 font-medium">
            {reportConfig.title}
          </span>
        </nav>

        <Tooltip content={reportConfig.aboutText} position="bottom-left">
          <button className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors">
            <Info className="w-3.5 h-3.5 text-primary-600" />
            About report
          </button>
        </Tooltip>
      </div>

      {/* Main Column - Full Width */}
      <div className="w-full">
        {/* Report Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm relative">
          {/* Loading Overlay */}
          <ReportLoadingOverlay isLoading={isLoading} />

          {/* Header */}
          <div className="relative z-20 overflow-visible p-6 border-b border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-semibold text-slate-900">
                {reportConfig.title}
              </h1>
              <div className="flex items-center gap-2">
                {/* Export Button (Tailored Reports) */}
                {[
                  "merchant-wise",
                  "merchant-channel-wise",
                  "merchant-success-fail-tnx",
                  "merchant-survey",
                  "sector-wise",
                  "merchant-growth",
                  "kam-transaction-failed",
                  "financial-year",
                  "gateway-transaction",
                  "kam-merchant-transaction",
                  "monthly-transaction-analysis",
                  "sector-wise-active-ratio",
                  "manage-risky-sanctions",
                  "settlement-bounce-kam",
                  "incentive-report",
                ].includes(reportId || "") && (
                  <button
                    onClick={handleGlobalExport}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md transition-colors shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                )}

                {reportId !== "merchant-survey" &&
                  reportId !== "merchant-onboarding" &&
                  reportId !== "hunter-wise-merchant-onboarding" &&
                  reportId !== "kam-transaction-report" &&
                  reportId !== "sector-wise-onboarding" &&
                  reportId !== "lead-generation-vas" &&
                  reportId !== "instant-signup-analytics" &&
                  reportId !== "referral-report" &&
                  reportId !== "kam-revenue" &&
                  reportId !== "merchant-activity" &&
                  reportId !== "payment-analytics" &&
                  reportId !== "onboarded-invoice-summary" &&
                  reportId !== "transaction-failed-reason" &&
                  reportId !== "merchant-comparison" &&
                  reportId !== "kam-comparison" &&
                  reportId !== "sector-comparison" && (
                    <button
                      onClick={handlePrint}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                    >
                      <Printer className="w-4 h-4" />
                      Print
                    </button>
                  )}
              </div>
            </div>

            {/* Filters */}
            <div className="relative z-20 flex flex-nowrap items-center gap-3 overflow-visible">
              <ReportFiltersComponent
                filters={localFilters}
                onFiltersChange={handleFiltersChange}
                availableFilters={reportConfig.availableFilters}
                reportId={reportId}
              />
              <button
                onClick={applyFilters}
                disabled={
                  JSON.stringify(localFilters) === JSON.stringify(filters)
                }
                className={clsx(
                  "flex shrink-0 items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-full transition-all shadow-sm ml-2",
                  JSON.stringify(localFilters) !== JSON.stringify(filters)
                    ? "bg-primary-600 hover:bg-primary-700 text-white"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200",
                )}
              >
                Apply Filters
              </button>
              <button
                onClick={clearFilters}
                className="shrink-0 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-md transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Report Content */}
          <div className="p-6 space-y-8">
            {/* Tailored Report Views */}
            {reportId === "merchant-wise" && reportData ? (
              <MerchantWiseReport
                ref={merchantReportRef}
                sections={reportData.sections}
                filters={filters}
              />
            ) : reportId === "merchant-channel-wise" && reportData ? (
              <MerchantChannelWiseReport
                ref={channelReportRef}
                sections={reportData.sections}
                filters={filters}
              />
            ) : reportId === "merchant-success-fail-tnx" && reportData ? (
              <MerchantSuccessFailReport
                ref={successFailReportRef}
                sections={reportData.sections}
                filters={filters}
              />
            ) : reportId === "merchant-survey" && reportData ? (
              <MerchantSurveyReport
                ref={surveyReportRef}
                sections={reportData.sections}
                filters={filters}
              />
            ) : reportId === "merchant-onboarding" && reportData ? (
              <MerchantOnboardingReport
                ref={onboardingReportRef}
                sections={reportData.sections}
                filters={filters}
              />
            ) : reportId === "hunter-wise-merchant-onboarding" && reportData ? (
              <HunterWiseMerchantOnboardingReport
                ref={hunterOnboardingReportRef}
                sections={reportData.sections}
                filters={filters}
              />
            ) : reportId === "kam-transaction-report" && reportData ? (
              <KamTransactionReport
                ref={kamTransactionReportRef}
                sections={reportData.sections}
                filters={filters}
              />
            ) : reportId === "sector-wise-onboarding" && reportData ? (
              <SectorWiseOnboardingReport
                ref={sectorOnboardingReportRef}
                sections={reportData.sections}
                filters={filters}
              />
            ) : reportId === "lead-generation-vas" && reportData ? (
              <LeadGenerationVasReport
                ref={leadGenerationVasReportRef}
                sections={reportData.sections}
                filters={filters}
              />
            ) : reportId === "instant-signup-analytics" && reportData ? (
              <InstantSignupAnalyticsReport
                ref={instantSignupAnalyticsReportRef}
                sections={reportData.sections}
                filters={filters}
              />
            ) : reportId === "referral-report" && reportData ? (
              <ReferralReport
                ref={referralReportRef}
                sections={reportData.sections}
                filters={filters}
              />
            ) : reportId === "sector-wise" && reportData ? (
              <SectorWiseReport
                ref={sectorReportRef}
                sections={reportData.sections}
                filters={filters}
              />
            ) : reportId === "merchant-growth" && reportData ? (
              <MerchantWiseGrowthReport
                ref={merchantGrowthReportRef}
                sections={reportData.sections}
                filters={filters}
              />
            ) : reportId === "kam-revenue" && reportData ? (
              <RevenueReport
                ref={revenueReportRef}
                sections={reportData.sections}
                filters={filters}
              />
            ) : reportId === "merchant-activity" && reportData ? (
              <MerchantActivityReport
                ref={merchantActivityReportRef}
                sections={reportData.sections}
                filters={filters}
              />
            ) : reportId === "payment-analytics" && reportData ? (
              <PaymentAnalyticsReport
                ref={paymentAnalyticsReportRef}
                sections={reportData.sections}
                filters={filters}
              />
            ) : reportId === "onboarded-invoice-summary" && reportData ? (
              <OnboardedInvoiceSummaryReport
                ref={onboardedInvoiceSummaryReportRef}
                sections={reportData.sections}
                filters={filters}
              />
            ) : reportId === "kam-transaction-failed" && reportData ? (
              <KamFailedTransactionReport
                ref={kamFailedReportRef}
                sections={reportData.sections}
                filters={filters}
              />
            ) : reportId === "financial-year" && reportData ? (
              <FinancialYearReport
                ref={financialYearReportRef}
                sections={reportData.sections}
                filters={filters}
              />
            ) : reportId === "settlement-bounce-operation" && reportData ? (
              <SettlementBounceOpReport
                ref={bounceOpReportRef}
                sections={reportData.sections}
                filters={filters}
              />
            ) : reportId === "gateway-transaction" && reportData ? (
              <GatewayTransactionReport
                ref={gatewayReportRef}
                sections={reportData.sections}
                filters={filters}
              />
            ) : reportId === "kam-merchant-transaction" && reportData ? (
              <KamwiseMerchantTransactionReport
                ref={kamMerchantTnxReportRef}
                sections={reportData.sections}
                filters={filters}
              />
            ) : reportId === "monthly-transaction-analysis" && reportData ? (
              <MonthlyTransactionAnalysisReport
                ref={monthlyAnalysisReportRef}
                sections={reportData.sections}
                filters={filters}
              />
            ) : reportId === "sector-wise-active-ratio" && reportData ? (
              <SectorWiseActiveRatioReport
                ref={sectorActiveRatioReportRef}
                sections={reportData.sections}
                filters={filters}
              />
            ) : reportId === "manage-risky-sanctions" && reportData ? (
              <ManageRiskySanctionsReport
                ref={manageRiskySanctionsReportRef}
                sections={reportData.sections}
                filters={filters}
              />
            ) : reportId === "settlement-bounce-kam" && reportData ? (
              <SettlementBounceReport
                ref={SettlementBounceReportRef}
                sections={reportData.sections}
                filters={filters}
              />
            ) : reportId === "transaction-failed-reason" && reportData ? (
              <TransactionFailedReasonReport
                ref={transactionFailedReasonReportRef}
                sections={reportData.sections}
                filters={filters}
              />
            ) : reportId === "incentive-report" && reportData ? (
              <IncentiveReport
                ref={incentiveReportRef}
                sections={reportData.sections}
                filters={filters}
              />
            ) : reportId === "merchant-comparison" && reportData ? (
              <MerchantComparisonReport
                ref={merchantComparisonReportRef}
                sections={reportData.sections}
                filters={filters}
              />
            ) : reportId === "kam-comparison" && reportData ? (
              <KamComparisonReport
                ref={kamComparisonReportRef}
                sections={reportData.sections}
                filters={filters}
              />
            ) : reportId === "sector-comparison" && reportData ? (
              <SectorComparisonReport
                ref={sectorComparisonReportRef}
                sections={reportData.sections}
                filters={filters}
              />
            ) : (
              reportData?.sections.map((section) => (
                <ReportSection
                  key={section.sectionId}
                  section={section}
                  onExport={() => handleExport(section.sectionId)}
                  onExplore={() => handleExplore(section.title)}
                />
              ))
            )}

            {/* Empty state when loading */}
            {isLoading && (
              <div className="h-64" /> // Placeholder space for loading
            )}
          </div>

          {/* Footer */}
          {reportData && (
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-xl">
              <p className="text-xs text-slate-400">
                Report generated at{" "}
                {new Date(reportData.generatedAt).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Explore Modal */}
      <ExploreModal
        isOpen={exploreModal.isOpen}
        onClose={() => setExploreModal({ isOpen: false, sectionTitle: "" })}
        sectionTitle={exploreModal.sectionTitle}
        filters={filters}
      />
    </div>
  );
}
