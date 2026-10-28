import { Link } from "react-router-dom";
import { clsx } from "clsx";
import {
  Building2,
  BarChart3,
  TrendingUp,
  LineChart,
  PieChart,
  Users,
  AlertCircle,
  Gift,
  Calendar,
  FileText,
  BarChart2,
  ArrowLeftRight,
  Settings,
  UploadCloud,
  Ban,
  ShieldAlert,
  UserPlus,
  Crosshair,
  Megaphone,
  Zap,
  Share2,
  Activity,
} from "lucide-react";
import { isManagementReportEnabled } from "./managementReportAvailability";

interface Report {
  title: string;
  description: string;
  icon: any;
  to: string;
  color: string;
  group?: string;
}

export default function AnalyticsHub() {
  // Original Analytics Cards
  const mainAnalytics: Report[] = [
    {
      title: "Analysis Report",
      description:
        "Detailed analysis of merchant transactions and performance.",
      icon: BarChart2,
      to: "/analytics/analysis-report",
      color: "bg-blue-500",
    },
    {
      title: "Payments Analytics",
      description:
        "Comprehensive overview of payments, transactions, and revenue.",
      icon: PieChart,
      to: "/analytics/payments",
      color: "bg-emerald-500",
    },
  ];

  // Analytics Reports
  const analyticsReports: Report[] = [
    // Merchant Reports
    {
      title: "Merchant Wise Report",
      description:
        "Comprehensive merchant performance and transaction analysis.",
      icon: Building2,
      to: "/analytics/reports/merchant-wise",
      color: "bg-blue-500",
      group: "Merchant Reports",
    },
    {
      title: "Merchant Channel Wise Report",
      description: "Channel-specific performance metrics for each merchant.",
      icon: BarChart3,
      to: "/analytics/reports/merchant-channel-wise",
      color: "bg-blue-500",
      group: "Merchant Reports",
    },
    {
      title: "Merchant Success / Fail Tnx",
      description: "Success and failure metrics",
      icon: TrendingUp,
      to: "/analytics/reports/merchant-success-fail-tnx",
      color: "bg-blue-500",
      group: "Merchant Reports",
    },
    {
      title: "Merchant Growth Report",
      description: "Track merchant and segment growth trends and patterns.",
      icon: LineChart,
      to: "/analytics/reports/merchant-growth",
      color: "bg-blue-500",
      group: "Merchant Reports",
    },
    {
      title: "Merchant Survey Analytics",
      description: "Survey insights and merchant feedback analysis.",
      icon: Users,
      to: "/analytics/reports/merchant-survey",
      color: "bg-blue-500",
      group: "Merchant Reports",
    },
    {
      title: "Merchant Surveys Report",
      description: "New merchant survey feedback and responses.",
      icon: FileText,
      to: "/analytics/merchant-surveys",
      color: "bg-blue-500",
      group: "Merchant Reports",
    },

    // Sector & Segment Reports
    {
      title: "Sector Wise Report",
      description:
        "Comprehensive growth and trend analysis by business sector.",
      icon: PieChart,
      to: "/analytics/reports/sector-wise",
      color: "bg-emerald-500",
      group: "Sector & Segment Reports",
    },
    {
      title: "Sector Wise Active Ratio",
      description: "Analysis of merchant active ratio across business sectors.",
      icon: PieChart,
      to: "/analytics/reports/sector-wise-active-ratio",
      color: "bg-emerald-500",
      group: "Sector & Segment Reports",
    },

    // KAM Reports
    {
      title: "Revenue Report",
      description: "Revenue performance tracking for Key Account Managers.",
      icon: Users,
      to: "/analytics/reports/kam-revenue",
      color: "bg-rose-500",
      group: "KAM Reports",
    },
    {
      title: "Kam Transaction Failed Report",
      description: "Failed transaction analysis by KAM portfolio.",
      icon: AlertCircle,
      to: "/analytics/reports/kam-transaction-failed",
      color: "bg-rose-500",
      group: "KAM Reports",
    },
    {
      title: "Kamwise Merchant Transaction Report",
      description:
        "Comprehensive analysis of merchant transactions by volume and count.",
      icon: BarChart3,
      to: "/analytics/reports/kam-merchant-transaction",
      color: "bg-rose-500",
      group: "KAM Reports",
    },

    // Management Reports
    {
      title: "Merchant Onboarding Report",
      description: "Track merchant onboarding progress and completion status.",
      icon: UserPlus,
      to: "/analytics/reports/merchant-onboarding",
      color: "bg-purple-500",
      group: "Management Reports",
    },
    {
      title: "Hunter Wise Merchant Onboarding Report",
      description: "Onboarding performance breakdown by hunter.",
      icon: Crosshair,
      to: "/analytics/reports/hunter-wise-merchant-onboarding",
      color: "bg-purple-500",
      group: "Management Reports",
    },
    {
      title: "KAM Transaction Report",
      description: "Transaction volume and count analysis by KAM portfolio.",
      icon: BarChart3,
      to: "/analytics/reports/kam-transaction-report",
      color: "bg-purple-500",
      group: "Management Reports",
    },
    {
      title: "Sector Wise Onboarding Report",
      description: "Onboarding metrics grouped by business sector.",
      icon: PieChart,
      to: "/analytics/reports/sector-wise-onboarding",
      color: "bg-purple-500",
      group: "Management Reports",
    },
    {
      title: "Lead Generation Report from VAS",
      description: "Lead generation performance from value-added services.",
      icon: Megaphone,
      to: "/analytics/reports/lead-generation-vas",
      color: "bg-purple-500",
      group: "Management Reports",
    },
    {
      title: "Instant SignUp Analytics Report",
      description: "Analytics for instant merchant sign-up flows.",
      icon: Zap,
      to: "/analytics/reports/instant-signup-analytics",
      color: "bg-purple-500",
      group: "Management Reports",
    },
    {
      title: "On boarded Invoice Summery",
      description: "Summary of onboarded merchant invoice activity.",
      icon: FileText,
      to: "/analytics/reports/onboarded-invoice-summary",
      color: "bg-purple-500",
      group: "Management Reports",
    },
    {
      title: "Referral Report",
      description: "Merchant referral program performance and outcomes.",
      icon: Share2,
      to: "/analytics/reports/referral-report",
      color: "bg-purple-500",
      group: "Management Reports",
    },
    {
      title: "Revenue Report",
      description: "Revenue performance tracking for Key Account Managers.",
      icon: TrendingUp,
      to: "/analytics/reports/kam-revenue",
      color: "bg-purple-500",
      group: "Management Reports",
    },
    {
      title: "Transaction Failed Reason Report",
      description: "Breakdown of transaction failures by reason.",
      icon: AlertCircle,
      to: "/analytics/reports/transaction-failed-reason",
      color: "bg-purple-500",
      group: "Management Reports",
    },
    {
      title: "Merchant Activity Report",
      description: "Merchant activity levels and engagement trends.",
      icon: Activity,
      to: "/analytics/reports/merchant-activity",
      color: "bg-purple-500",
      group: "Management Reports",
    },
    {
      title: "Payment Analytics Report",
      description:
        "Comprehensive overview of payments, transactions, and revenue.",
      icon: PieChart,
      to: "/analytics/reports/payment-analytics",
      color: "bg-purple-500",
      group: "Management Reports",
    },
    {
      title: "Merchant Comparison Report",
      description:
        "Compare top merchants by GMV, Amount, Transaction, Revenue, and others.",
      icon: ArrowLeftRight,
      to: "/analytics/reports/merchant-comparison",
      color: "bg-purple-500",
      group: "Management Reports",
    },
    {
      title: "KAM Comparison Report",
      description:
        "Compare KAM portfolios by GMV, transactions, revenue, and performance metrics.",
      icon: Users,
      to: "/analytics/reports/kam-comparison",
      color: "bg-purple-500",
      group: "Management Reports",
    },
    {
      title: "Sector Comparison Report",
      description:
        "Compare business sectors by onboarding, volume, revenue, and growth trends.",
      icon: PieChart,
      to: "/analytics/reports/sector-comparison",
      color: "bg-purple-500",
      group: "Management Reports",
    },

    // Performance Reports
    {
      title: "Monthly Transaction Analysis",
      description: "Analysis of monthly transaction trends and decreases.",
      icon: LineChart,
      to: "/analytics/reports/monthly-transaction-analysis",
      color: "bg-amber-500",
      group: "Performance Reports",
    },
    {
      title: "Incentive Report",
      description: "Monthly incentive tracking and performance-based rewards.",
      icon: Gift,
      to: "/analytics/reports/incentive-report",
      color: "bg-amber-500",
      group: "Performance Reports",
    },
    {
      title: "Monthly Growth Transaction Analysis (LEGACY)",
      description: "Month-over-month transaction growth insights.",
      icon: Calendar,
      to: "/analytics/reports/monthly-growth-transaction",
      color: "bg-amber-500",
      group: "Performance Reports",
    },
    {
      title: "Financial Year Report",
      description: "Annual financial performance and year-end analysis.",
      icon: FileText,
      to: "/analytics/reports/financial-year",
      color: "bg-amber-500",
      group: "Performance Reports",
    },
    {
      title: "Gateway Transaction Report",
      description: "Detailed analysis of gateway transaction performance.",
      icon: ArrowLeftRight,
      to: "/analytics/reports/gateway-transaction",
      color: "bg-amber-500",
      group: "Performance Reports",
    },
    {
      title: "Operation Report",
      description: "Operational efficiency and support metrics.",
      icon: Settings,
      to: "/analytics/reports/operation-report",
      color: "bg-amber-500",
      group: "Performance Reports",
    },
    {
      title: "Upload Bounce Report",
      description: "Report on failed uploads and bounces.",
      icon: UploadCloud,
      to: "/analytics/reports/upload-bounce-report",
      color: "bg-amber-500",
      group: "Performance Reports",
    },
    {
      title: "Manage Risky Sanctions",
      description: "Filter and manage risky sanctions and customer data.",
      icon: ShieldAlert,
      to: "/analytics/reports/manage-risky-sanctions",
      color: "bg-amber-500",
      group: "Performance Reports",
    },
    // Settlement Reports
    {
      title: "Upload Settlement Bounce Report",
      description: "Settlement bounce analysis for KAMs.",
      icon: Ban,
      to: "/analytics/reports/settlement-bounce-kam",
      color: "bg-red-500",
      group: "Settlement Reports",
    },
    {
      title: "Settlement Bounce Operation Report",
      description: "Settlement bounce analysis for Operations.",
      icon: ShieldAlert,
      to: "/analytics/reports/settlement-bounce-operation",
      color: "bg-red-500",
      group: "Settlement Reports",
    },
  ];

  const groupedReports = analyticsReports.reduce(
    (acc, report) => {
      const group = report.group || "Other";
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(report);
      return acc;
    },
    {} as Record<string, Report[]>,
  );

  const groupOrder = [
    "Management Reports",
    "Merchant Reports",
    "Sector & Segment Reports",
    "KAM Reports",
    "Performance Reports",
    "Settlement Reports",
    "Other",
  ];

  const orderedGroups = [
    ...groupOrder.filter((group) => groupedReports[group]),
    ...Object.keys(groupedReports).filter(
      (group) => !groupOrder.includes(group),
    ),
  ];

  // Static color map for Tailwind V4
  const colorMap: Record<string, { bg: string; text: string }> = {
    "bg-blue-500": { bg: "bg-blue-500/10", text: "text-blue-500" },
    "bg-emerald-500": { bg: "bg-emerald-500/10", text: "text-emerald-500" },
    "bg-rose-500": { bg: "bg-rose-500/10", text: "text-rose-500" },
    "bg-amber-500": { bg: "bg-amber-500/10", text: "text-amber-500" },
    "bg-purple-500": { bg: "bg-purple-500/10", text: "text-purple-500" },
    "bg-red-500": { bg: "bg-red-500/10", text: "text-red-500" },
  };

  const renderReportTile = (report: Report, groupName: string) => {
    const colors = colorMap[report.color] || {
      bg: "bg-slate-500/10",
      text: "text-slate-500",
    };
    const isManagementReport = groupName === "Management Reports";
    const isEnabled =
      !isManagementReport || isManagementReportEnabled(report.to);

    const content = (
      <>
        <div
          className={clsx(
            "w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-transform",
            colors.bg,
            isEnabled && "group-hover:scale-110",
          )}
        >
          <report.icon
            className={clsx(
              "w-5 h-5",
              isEnabled ? colors.text : "text-slate-400",
            )}
          />
        </div>
        <h4
          className={clsx(
            "text-base font-semibold mb-1 transition-colors",
            isEnabled
              ? "text-slate-900 group-hover:text-primary-600"
              : "text-slate-400",
          )}
        >
          {report.title}
        </h4>
        <p
          className={clsx(
            "text-xs line-clamp-2",
            isEnabled ? "text-slate-500" : "text-slate-400",
          )}
        >
          {report.description}
        </p>
        {!isEnabled && (
          <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Coming soon
          </p>
        )}
      </>
    );

    if (!isEnabled) {
      return (
        <div
          key={report.title}
          aria-disabled="true"
          className="block p-5 bg-white border border-slate-200 rounded-xl opacity-70 cursor-not-allowed"
        >
          {content}
        </div>
      );
    }

    return (
      <Link
        key={report.title}
        to={report.to}
        className="group block p-5 bg-white border border-slate-200 rounded-xl hover:border-primary-300 transition-all"
      >
        {content}
      </Link>
    );
  };

  return (
    <div className="space-y-8">
      {/* Analytics Report Section - Now First */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">Reports</h2>
          <p className="text-slate-500 text-sm">
            Detailed reports and insights by category.
          </p>
        </div>

        {orderedGroups.map((groupName) => (
          <div key={groupName} className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-700 border-b border-slate-200 pb-2">
              {groupName}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {groupedReports[groupName].map((report) =>
                renderReportTile(report, groupName),
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Original Analytics Cards - Now Below */}
      <div className="space-y-4">
        <div className="border-t border-slate-200 pt-6">
          <h2 className="text-xl font-bold text-slate-900 mb-1">Analytics</h2>
          <p className="text-slate-500 text-sm">
            Core analytics and performance insights.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {mainAnalytics.map((report) => (
            <Link
              key={report.title}
              to={report.to}
              className="group block p-5 bg-white border border-slate-200 rounded-xl hover:border-primary-300 transition-all"
            >
              <div
                className={`w-10 h-10 rounded-lg ${(colorMap[report.color] || colorMap["bg-slate-500"]).bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
              >
                <report.icon
                  className={`w-5 h-5 ${(colorMap[report.color] || colorMap["bg-slate-500"]).text}`}
                />
              </div>
              <h4 className="text-base font-semibold text-slate-900 mb-1 group-hover:text-primary-600 transition-colors">
                {report.title}
              </h4>
              <p className="text-xs text-slate-500 line-clamp-2">
                {report.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
