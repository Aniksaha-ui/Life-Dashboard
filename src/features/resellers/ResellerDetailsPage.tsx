import { useQuery } from "@tanstack/react-query";
import { clsx } from "clsx";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  Check,
  Download,
  ExternalLink,
  FileText,
  Handshake,
  History,
  Percent,
  Shield,
  Store,
  User,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CopyButton } from "../../components/CopyButton";
import {
  FilterBar,
  ClearAllFiltersButton,
  type FilterConfig,
} from "../../components/FilterBar";
import { api } from "../../lib/api/client";
import { formatCurrency, formatPercent } from "../../utils/format";
import type { OpResellerMerchantStatus } from "./types/opReseller";
import {
  getOpResellerMerchantStatusBadgeClass,
  getOpResellerSettlementStatusBadgeClass,
  getOpResellerStatusBadgeClass,
} from "./utils/opResellerStatus";
import {
  formatResellerDate,
  formatResellerDateTimeLabel,
} from "./utils/resellerDateFormat";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "merchants", label: "Merchants" },
  { id: "settlements", label: "Settlements" },
  { id: "history", label: "History" },
] as const;

type ResellerHistoryEventType =
  | "onboarding"
  | "status_change"
  | "document_review"
  | "merchant_invite"
  | "commission"
  | "assignment"
  | "alert"
  | "milestone";

interface ResellerHistoryEvent {
  date: string;
  sortDate: number;
  type: ResellerHistoryEventType;
  title: string;
  description: string;
  actor: string;
  badge: string;
  badgeClass: string;
}

type TabId = (typeof TABS)[number]["id"];

const MERCHANT_FILTER_CONFIG: FilterConfig[] = [
  {
    key: "name",
    type: "input",
    label: "Merchant Name",
    placeholder: "Search merchant or POC",
  },
  {
    key: "status",
    type: "select",
    label: "Status",
    options: [
      { label: "All Status", value: "all" },
      { label: "Active", value: "Active" },
      { label: "Pending", value: "Pending" },
      { label: "Inactive", value: "Inactive" },
      { label: "Rejected", value: "Rejected" },
    ],
  },
];

const SETTLEMENT_FILTER_CONFIG: FilterConfig[] = [
  {
    key: "name",
    type: "input",
    label: "Merchant Name",
    placeholder: "Search merchant or MID",
  },
  {
    key: "period",
    type: "select",
    label: "Period",
    options: [{ label: "All Periods", value: "all" }],
  },
  {
    key: "status",
    type: "select",
    label: "Status",
    options: [
      { label: "All Status", value: "all" },
      { label: "Paid", value: "Paid" },
      { label: "Pending", value: "Pending" },
      { label: "Processing", value: "Processing" },
      { label: "On Hold", value: "On Hold" },
    ],
  },
];

const InfoField = ({
  label,
  value,
}: {
  label: string;
  value?: React.ReactNode;
}) => (
  <div>
    <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
    <p className="text-sm font-medium text-slate-900 mt-1 break-words">
      {value ?? "—"}
    </p>
  </div>
);

/**
 * Read-only reseller profile — no add/edit/delete actions here.
 * Mirrors the Merchant Profile page layout: header, KPI strip, info card, tabs.
 * Settlements tab follows the reseller portal commissions pattern.
 */
export default function ResellerDetailsPage() {
  const { resellerId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [merchantFilters, setMerchantFilters] = useState<
    Record<string, unknown>
  >({});
  const [localMerchantFilters, setLocalMerchantFilters] = useState<
    Record<string, unknown>
  >({});
  const [settlementFilters, setSettlementFilters] = useState<
    Record<string, unknown>
  >({});
  const [localSettlementFilters, setLocalSettlementFilters] = useState<
    Record<string, unknown>
  >({});
  const [showDocumentReviewsOnly, setShowDocumentReviewsOnly] = useState(false);

  const { data: reseller, isLoading } = useQuery({
    queryKey: ["op-reseller", resellerId],
    queryFn: () => api.opResellers.get(resellerId!),
    enabled: !!resellerId,
  });

  const merchants = reseller?.merchants ?? [];
  const settlements = reseller?.settlements;

  const merchantCounts = useMemo(() => {
    const counts: Record<"all" | OpResellerMerchantStatus, number> = {
      all: merchants.length,
      Active: 0,
      Pending: 0,
      Inactive: 0,
      Rejected: 0,
    };
    merchants.forEach((merchant) => {
      counts[merchant.status] += 1;
    });
    return counts;
  }, [merchants]);

  const filteredMerchants = useMemo(() => {
    const name =
      typeof merchantFilters.name === "string"
        ? merchantFilters.name.trim().toLowerCase()
        : "";
    const status =
      typeof merchantFilters.status === "string"
        ? merchantFilters.status
        : undefined;

    return merchants.filter((merchant) => {
      const matchesName =
        !name ||
        merchant.name.toLowerCase().includes(name) ||
        merchant.pocName.toLowerCase().includes(name);
      const matchesStatus =
        !status || status === "all" || merchant.status === status;
      return matchesName && matchesStatus;
    });
  }, [merchants, merchantFilters]);

  const settlementPeriodOptions = useMemo(() => {
    const periods = Array.from(
      new Set((settlements?.ledger ?? []).map((row) => row.periodLabel)),
    );
    return [
      { label: "All Periods", value: "all" },
      ...periods.map((period) => ({ label: period, value: period })),
    ];
  }, [settlements?.ledger]);

  const settlementFilterConfig = useMemo<FilterConfig[]>(
    () =>
      SETTLEMENT_FILTER_CONFIG.map((config) =>
        config.key === "period"
          ? { ...config, options: settlementPeriodOptions }
          : config,
      ),
    [settlementPeriodOptions],
  );

  const filteredLedger = useMemo(() => {
    const ledger = settlements?.ledger ?? [];
    const name =
      typeof settlementFilters.name === "string"
        ? settlementFilters.name.trim().toLowerCase()
        : "";
    const period =
      typeof settlementFilters.period === "string"
        ? settlementFilters.period
        : undefined;
    const status =
      typeof settlementFilters.status === "string"
        ? settlementFilters.status
        : undefined;

    return ledger.filter((row) => {
      const matchesName =
        !name ||
        row.merchantName.toLowerCase().includes(name) ||
        row.mid.toLowerCase().includes(name);
      const matchesPeriod =
        !period || period === "all" || row.periodLabel === period;
      const matchesStatus =
        !status || status === "all" || row.status === status;
      return matchesName && matchesPeriod && matchesStatus;
    });
  }, [settlements?.ledger, settlementFilters]);

  const filteredLedgerTotal = useMemo(
    () => filteredLedger.reduce((sum, row) => sum + row.commission, 0),
    [filteredLedger],
  );

  const resellerHistoryEvents = useMemo(() => {
    if (!reseller) return [] as ResellerHistoryEvent[];

    const events: ResellerHistoryEvent[] = [];

    events.push({
      date: formatResellerDate(reseller.onboardingDate),
      sortDate: new Date(reseller.onboardingDate).getTime() || 0,
      type: "onboarding",
      title: "Reseller onboarded",
      description: `${reseller.name} was onboarded into the OP reseller pipeline.`,
      actor: "Onboarding Team",
      badge: "Onboarded",
      badgeClass: "bg-slate-50 text-slate-700 border-slate-100",
    });

    events.push({
      date: formatResellerDate(reseller.onboardingDate),
      sortDate: (new Date(reseller.onboardingDate).getTime() || 0) + 3600000,
      type: "assignment",
      title: "Assigned to Operations review",
      description:
        "Reseller account transferred to the Operations team for document verification.",
      actor: "Admin",
      badge: "Assignment",
      badgeClass: "bg-blue-50 text-blue-700 border-blue-100",
    });

    reseller.documents.forEach((document) => {
      (document.logs ?? []).forEach((log) => {
        const isAccepted = log.action === "Accepted";
        const isRejected = log.action === "Rejected";
        events.push({
          date: formatResellerDateTimeLabel(log.performedAt),
          sortDate: new Date(log.performedAt).getTime() || 0,
          type: "document_review",
          title: `${document.name} ${log.action.toLowerCase()}`,
          description: log.remarks,
          actor: log.performedBy,
          badge: isAccepted ? "Accepted" : isRejected ? "Rejected" : "Uploaded",
          badgeClass: isAccepted
            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
            : isRejected
              ? "bg-rose-50 text-rose-700 border-rose-100"
              : "bg-slate-50 text-slate-700 border-slate-100",
        });
      });
    });

    if (
      reseller.status === "Approved" ||
      reseller.status === "Rejected" ||
      reseller.status === "Uploaded"
    ) {
      events.push({
        date: formatResellerDate(
          new Date(Date.now() - 3 * 86400000).toISOString(),
        ),
        sortDate: Date.now() - 3 * 86400000,
        type: "status_change",
        title: `Status changed to ${reseller.status}`,
        description:
          reseller.rejectedReason ||
          reseller.pendingReason ||
          `Reseller moved to ${reseller.status} in the OP review workflow.`,
        actor: "Operation",
        badge: reseller.status,
        badgeClass:
          reseller.status === "Approved"
            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
            : reseller.status === "Rejected"
              ? "bg-rose-50 text-rose-700 border-rose-100"
              : "bg-amber-50 text-amber-700 border-amber-100",
      });
    }

    if (reseller.pendingReason) {
      events.push({
        date: formatResellerDate(
          new Date(Date.now() - 5 * 86400000).toISOString(),
        ),
        sortDate: Date.now() - 5 * 86400000,
        type: "alert",
        title: "Pending review alert",
        description: reseller.pendingReason,
        actor: "System",
        badge: "Alert",
        badgeClass: "bg-amber-50 text-amber-700 border-amber-100",
      });
    }

    const activeMerchants = merchants.filter(
      (merchant) => merchant.status === "Active",
    ).length;
    if (activeMerchants > 0) {
      events.push({
        date: formatResellerDate(
          new Date(Date.now() - 10 * 86400000).toISOString(),
        ),
        sortDate: Date.now() - 10 * 86400000,
        type: "merchant_invite",
        title: `${activeMerchants} active merchant${activeMerchants === 1 ? "" : "s"} referred`,
        description:
          "Reseller merchant portfolio crossed an active-merchant milestone.",
        actor: "System",
        badge: "Merchants",
        badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-100",
      });
    }

    if (settlements) {
      events.push({
        date: formatResellerDate(
          new Date(Date.now() - 2 * 86400000).toISOString(),
        ),
        sortDate: Date.now() - 2 * 86400000,
        type: "commission",
        title: "MTD commission calculated",
        description: `Month-to-date earnings recorded at ${formatCurrency(settlements.mtdEarnings)}.`,
        actor: "Settlement System",
        badge: "Commission",
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-100",
      });

      events.push({
        date: formatResellerDate(settlements.pendingClearsOn),
        sortDate: new Date(settlements.pendingClearsOn).getTime() || 0,
        type: "milestone",
        title: "Pending settlement scheduled",
        description: `${formatCurrency(settlements.pendingSettlement)} pending settlement clears on ${formatResellerDate(settlements.pendingClearsOn)}.`,
        actor: "Settlement System",
        badge: "Milestone",
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-100",
      });
    }

    return events.sort((a, b) => b.sortDate - a.sortDate);
  }, [reseller, merchants, settlements]);

  const displayedHistoryEvents = useMemo(() => {
    if (!showDocumentReviewsOnly) return resellerHistoryEvents;
    return resellerHistoryEvents.filter(
      (event) => event.type === "document_review",
    );
  }, [resellerHistoryEvents, showDocumentReviewsOnly]);

  const historyEventIcon = (type: ResellerHistoryEventType) => {
    switch (type) {
      case "status_change":
        return {
          Icon: Handshake,
          color: "text-indigo-600 bg-indigo-50 border-indigo-100",
        };
      case "document_review":
        return {
          Icon: FileText,
          color: "text-emerald-600 bg-emerald-50 border-emerald-100",
        };
      case "merchant_invite":
        return {
          Icon: Store,
          color: "text-blue-600 bg-blue-50 border-blue-100",
        };
      case "commission":
        return {
          Icon: Percent,
          color: "text-emerald-600 bg-emerald-50 border-emerald-100",
        };
      case "alert":
        return {
          Icon: AlertTriangle,
          color: "text-amber-600 bg-amber-50 border-amber-100",
        };
      case "assignment":
        return {
          Icon: User,
          color: "text-blue-600 bg-blue-50 border-blue-100",
        };
      case "milestone":
        return {
          Icon: Shield,
          color: "text-emerald-600 bg-emerald-50 border-emerald-100",
        };
      case "onboarding":
        return {
          Icon: Check,
          color: "text-slate-600 bg-slate-50 border-slate-100",
        };
      default:
        return {
          Icon: History,
          color: "text-slate-600 bg-slate-50 border-slate-100",
        };
    }
  };

  const handleMerchantFilterChange = (key: string, value: unknown) => {
    setLocalMerchantFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyMerchantFilters = () => {
    setMerchantFilters(localMerchantFilters);
  };

  const clearMerchantFilters = () => {
    setLocalMerchantFilters({});
    setMerchantFilters({});
  };

  const isMerchantFiltersChanged =
    JSON.stringify(localMerchantFilters) !== JSON.stringify(merchantFilters);

  const handleSettlementFilterChange = (key: string, value: unknown) => {
    setLocalSettlementFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applySettlementFilters = () => {
    setSettlementFilters(localSettlementFilters);
  };

  const clearSettlementFilters = () => {
    setLocalSettlementFilters({});
    setSettlementFilters({});
  };

  const isSettlementFiltersChanged =
    JSON.stringify(localSettlementFilters) !==
    JSON.stringify(settlementFilters);

  const handleExportMerchantsCSV = () => {
    if (!filteredMerchants.length) return;

    const headers = [
      "Merchant",
      "Point of Contact",
      "Email",
      "Invited",
      "Status",
    ];
    const rows = filteredMerchants.map((merchant) => [
      merchant.name.replace(/,/g, ""),
      merchant.pocName,
      merchant.pocEmail,
      formatResellerDate(merchant.invitedAt),
      merchant.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reseller_merchants_${resellerId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportSettlementsCSV = () => {
    if (!filteredLedger.length) return;

    const headers = [
      "Merchant",
      "MID",
      "Txn Volume",
      "Rate",
      "Commission",
      "Status",
      "Period",
    ];
    const rows = filteredLedger.map((row) => [
      row.merchantName.replace(/,/g, ""),
      row.mid,
      String(row.txnVolume),
      `${row.ratePercent}%`,
      String(row.commission),
      row.status,
      row.periodLabel,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reseller_settlements_${resellerId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="h-48 bg-slate-100 animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!reseller) {
    return (
      <div className="max-w-6xl mx-auto text-center py-12">
        <p className="text-slate-500">Reseller not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/resellers/op-list")}
          className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-slate-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {reseller.name}
            </h1>
            <div className="text-[11px] text-slate-500 font-normal flex items-center gap-1 mt-0.5">
              {reseller.resellerId}
              <CopyButton value={reseller.resellerId} />
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 uppercase tracking-wider ml-1.5">
                {reseller.sector}
              </span>
            </div>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className={getOpResellerStatusBadgeClass(reseller.status)}>
            {reseller.status}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex gap-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors",
              activeTab === tab.id
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-slate-500 hover:text-slate-700",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* KPI Strip */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-500 uppercase tracking-wide">
                Total Merchants
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {merchantCounts.all}
              </p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-500 uppercase tracking-wide">
                Active
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {merchantCounts.Active}
              </p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-500 uppercase tracking-wide">
                Pending
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {merchantCounts.Pending}
              </p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-500 uppercase tracking-wide">
                Inactive
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {merchantCounts.Inactive}
              </p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-500 uppercase tracking-wide">
                Rejected
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {merchantCounts.Rejected}
              </p>
            </div>
          </div>

          {/* Reseller Information */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-900 mb-4">
              Reseller Information
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <InfoField
                label="Reseller ID"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <span className="font-mono">{reseller.resellerId}</span>
                    <CopyButton value={reseller.resellerId} />
                  </span>
                }
              />
              <InfoField label="Sector" value={reseller.sector} />
              <InfoField
                label="Status"
                value={
                  <span
                    className={getOpResellerStatusBadgeClass(reseller.status)}
                  >
                    {reseller.status}
                  </span>
                }
              />
              <InfoField
                label="Onboarding"
                value={formatResellerDate(reseller.onboardingDate)}
              />
              <InfoField
                label="Website"
                value={
                  <a
                    href={reseller.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 hover:underline inline-flex items-center gap-1"
                  >
                    {reseller.website}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                }
              />
              <InfoField label="Email" value={reseller.email} />
              <InfoField label="Phone" value={reseller.phone} />
              <InfoField label="Address" value={reseller.address} />
              <InfoField label="POC Name" value={reseller.pocName} />
              <InfoField label="POC Email" value={reseller.pocEmail} />
              <InfoField label="POC Phone" value={reseller.pocPhone} />
            </div>
          </div>

          {reseller.pendingReason && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 shadow-sm flex gap-3.5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-100/50 rounded-full -mr-12 -mt-12" />
              <div className="p-2 bg-amber-100 rounded-lg text-amber-700 h-10 w-10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="relative">
                <h3 className="text-[10px] font-bold text-amber-800 uppercase tracking-widest text-left">
                  Pending Reason
                </h3>
                <p className="text-sm font-semibold text-amber-950 mt-1 leading-relaxed text-left">
                  {reseller.pendingReason}
                </p>
              </div>
            </div>
          )}

          {reseller.rejectedReason && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 shadow-sm flex gap-3.5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-100/50 rounded-full -mr-12 -mt-12" />
              <div className="p-2 bg-rose-100 rounded-lg text-rose-700 h-10 w-10 flex items-center justify-center flex-shrink-0">
                <XCircle className="w-5 h-5" />
              </div>
              <div className="relative">
                <h3 className="text-[10px] font-bold text-rose-800 uppercase tracking-widest text-left">
                  Rejected Reason
                </h3>
                <p className="text-sm font-semibold text-rose-950 mt-1 leading-relaxed text-left">
                  {reseller.rejectedReason}
                </p>
              </div>
            </div>
          )}

          {/* Transaction Overview — Last 30 Days */}
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Transaction Overview
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Last 30 days across linked merchants
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm lg:col-span-5">
                <div className="mb-6">
                  <p className="text-sm font-semibold text-slate-900">
                    Payment Distribution
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div
                    className="relative w-[180px] h-[180px] shrink-0 [&_.recharts-wrapper]:outline-none [&_.recharts-wrapper]:focus-visible:outline-none [&_svg]:outline-none [&_svg]:focus-visible:outline-none"
                    onMouseDown={(event) => event.preventDefault()}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={
                            reseller.transactionOverview.paymentDistribution
                          }
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={52}
                          outerRadius={74}
                          paddingAngle={2}
                          stroke="#ffffff"
                          strokeWidth={2}
                        >
                          {reseller.transactionOverview.paymentDistribution.map(
                            (entry) => (
                              <Cell
                                key={entry.name}
                                fill={entry.color}
                                stroke="#ffffff"
                                strokeWidth={2}
                              />
                            ),
                          )}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            borderRadius: "12px",
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                            fontSize: "12px",
                          }}
                          formatter={(value: number, name: string) => [
                            `${value}%`,
                            name,
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="flex-1 w-full space-y-3">
                    {reseller.transactionOverview.paymentDistribution.map(
                      (item) => (
                        <div
                          key={item.name}
                          className="flex items-center justify-between gap-3 text-sm"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className="w-2.5 h-2.5 rounded-[2px] shrink-0"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-slate-700 font-medium uppercase tracking-wide text-[11px] truncate">
                              {item.name}
                            </span>
                          </div>
                          <span className="font-semibold tabular-nums text-slate-900 whitespace-nowrap">
                            {item.value}%
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm lg:col-span-7">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm font-semibold text-slate-900">
                    Transaction Count
                  </p>
                  <span className="text-[10px] font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                    {reseller.transactionOverview.countChangePercent >= 0
                      ? "↑"
                      : "↓"}{" "}
                    {formatPercent(
                      Math.abs(reseller.transactionOverview.countChangePercent),
                    )}
                  </span>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={reseller.transactionOverview.daily}
                      margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#f1f5f9"
                      />
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: "#64748b" }}
                        dy={10}
                        interval={4}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: "#64748b" }}
                      />
                      <Tooltip
                        cursor={{ fill: "#f8fafc" }}
                        contentStyle={{
                          borderRadius: "12px",
                          border: "1px solid #e2e8f0",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                          fontSize: "12px",
                        }}
                        formatter={(value: number) => [
                          value.toLocaleString(),
                          "Transactions",
                        ]}
                      />
                      <Bar
                        dataKey="count"
                        fill="#295cab"
                        radius={[3, 3, 0, 0]}
                        barSize={8}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Merchants Tab */}
      {activeTab === "merchants" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <FilterBar
              filters={localMerchantFilters}
              onFilterChange={handleMerchantFilterChange}
              config={MERCHANT_FILTER_CONFIG}
            />

            <button
              onClick={applyMerchantFilters}
              disabled={!isMerchantFiltersChanged}
              className={clsx(
                "flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-full transition-all shadow-sm",
                isMerchantFiltersChanged
                  ? "bg-primary-600 hover:bg-primary-700 text-white"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200",
              )}
            >
              Apply Filters
            </button>
            <ClearAllFiltersButton
              onClick={clearMerchantFilters}
              filters={localMerchantFilters}
            />

            <button
              type="button"
              onClick={handleExportMerchantsCSV}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm ml-auto"
            >
              Export
              <Download className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-900 ml-1">
              Showing Reseller's Merchants
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 rounded-full border border-slate-200">
              {filteredMerchants.length}
            </span>
          </div>

          <div className="bg-white overflow-hidden rounded-xl border border-slate-200 shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Merchant</th>
                  <th className="px-4 py-3">Point of Contact</th>
                  <th className="px-4 py-3">Invited</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMerchants.map((merchant, index) => (
                  <tr
                    key={merchant.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-semibold text-slate-900 leading-tight">
                          {merchant.name}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {merchant.service} · {merchant.sector}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-slate-700">
                          {merchant.pocName}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {merchant.pocEmail}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {merchant.pocPhone}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {formatResellerDate(merchant.invitedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={getOpResellerMerchantStatusBadgeClass(
                          merchant.status,
                        )}
                      >
                        {merchant.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredMerchants.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-sm text-slate-500"
                    >
                      No merchants found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Settlements Tab */}
      {activeTab === "settlements" && settlements && (
        <div className="space-y-6">
          {/* KPI Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-500 uppercase tracking-wide">
                MTD Earnings
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {formatCurrency(settlements.mtdEarnings)}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                +{formatPercent(settlements.mtdChangePercent)} vs previous month
              </p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-500 uppercase tracking-wide">
                Pending Settlement
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {formatCurrency(settlements.pendingSettlement)}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Clears {formatResellerDate(settlements.pendingClearsOn)}
              </p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-500 uppercase tracking-wide">
                Total Paid (Lifetime)
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {formatCurrency(settlements.totalPaidLifetime)}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Across {settlements.lifetimeMonths} months
              </p>
            </div>
          </div>

          {/* 12-month commission trend */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  12-Month Commission Trend
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cumulative earnings over the past year
                </p>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                ↑ {formatPercent(settlements.mtdChangePercent)}
              </span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={settlements.trend}>
                  <defs>
                    <linearGradient
                      id="colorResellerCommission"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    tickFormatter={(val) => `৳${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      fontSize: "12px",
                    }}
                    formatter={(value: number) => [
                      formatCurrency(value),
                      "Commission",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="commission"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorResellerCommission)"
                    activeDot={{ r: 6, strokeWidth: 0, fill: "#2563eb" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Commission ledger */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <FilterBar
                filters={localSettlementFilters}
                onFilterChange={handleSettlementFilterChange}
                config={settlementFilterConfig}
              />

              <button
                onClick={applySettlementFilters}
                disabled={!isSettlementFiltersChanged}
                className={clsx(
                  "flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-full transition-all shadow-sm",
                  isSettlementFiltersChanged
                    ? "bg-primary-600 hover:bg-primary-700 text-white"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200",
                )}
              >
                Apply Filters
              </button>
              <ClearAllFiltersButton
                onClick={clearSettlementFilters}
                filters={localSettlementFilters}
              />

              <button
                type="button"
                onClick={handleExportSettlementsCSV}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm ml-auto"
              >
                Export CSV
                <Download className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-slate-900 ml-1">
                  Commission Ledger
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 rounded-full border border-slate-200">
                  {filteredLedger.length}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Total:{" "}
                <span className="font-semibold text-slate-700">
                  {formatCurrency(filteredLedgerTotal)}
                </span>
              </p>
            </div>

            <div className="bg-white overflow-hidden rounded-xl border border-slate-200 shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
                  <tr>
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Merchant</th>
                    <th className="px-4 py-3">MID</th>
                    <th className="px-4 py-3">Txn Volume</th>
                    <th className="px-4 py-3">Rate</th>
                    <th className="px-4 py-3">Commission</th>
                    <th className="px-4 py-3">Period</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLedger.map((row, index) => (
                    <tr
                      key={row.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-slate-900 leading-tight">
                          {row.merchantName}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono p-1 bg-slate-50 border border-slate-100 rounded leading-none text-slate-500">
                            {row.mid}
                          </span>
                          <CopyButton value={row.mid} />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-700">
                        {formatCurrency(row.txnVolume)}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-700">
                        {formatPercent(row.ratePercent)}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                        {formatCurrency(row.commission)}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {row.periodLabel}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={getOpResellerSettlementStatusBadgeClass(
                            row.status,
                          )}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredLedger.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-8 text-center text-sm text-slate-500"
                      >
                        No settlement entries found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-slate-100 rounded-lg shrink-0">
                  <History className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Reseller History
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Document reviews, status changes, merchant milestones, and
                    settlements
                  </p>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer group shrink-0">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={showDocumentReviewsOnly}
                    onChange={(e) =>
                      setShowDocumentReviewsOnly(e.target.checked)
                    }
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:inset-s-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600" />
                </div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight group-hover:text-slate-700 transition-colors whitespace-nowrap">
                  Show Document Reviews Only
                </span>
              </label>
            </div>

            <div className="relative">
              <div className="absolute left-[19px] top-2 bottom-2 w-px bg-slate-200" />
              <div className="space-y-6">
                {displayedHistoryEvents.length === 0 ? (
                  <p className="text-sm text-slate-500 py-4 pl-14">
                    {showDocumentReviewsOnly
                      ? "No document review events yet."
                      : "No history events to display."}
                  </p>
                ) : (
                  displayedHistoryEvents.map((event, index) => {
                    const { Icon, color } = historyEventIcon(event.type);
                    return (
                      <div
                        key={`${event.type}-${event.date}-${index}`}
                        className="relative flex gap-4 pl-0"
                      >
                        <div
                          className={clsx(
                            "relative z-10 w-10 h-10 rounded-full border flex items-center justify-center shrink-0",
                            color,
                          )}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0 pb-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                              {event.date}
                            </span>
                            <span
                              className={clsx(
                                "px-2 py-0.5 text-[10px] font-bold rounded-full border",
                                event.badgeClass,
                              )}
                            >
                              {event.badge}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-slate-900">
                            {event.title}
                          </p>
                          <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                            {event.description}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-2">
                            By{" "}
                            <span className="font-medium text-slate-500">
                              {event.actor}
                            </span>
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
