import { useQuery } from "@tanstack/react-query";
import { clsx } from "clsx";
import {
  ArrowLeft,
  Store,
  AlertTriangle,
  Check,
  History,
  Phone,
  Shield,
  TrendingDown,
  User,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { CopyButton } from "../../components/CopyButton";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  formatKamTaskCompletedAt,
  getCompletedKamTasks,
  getKamTaskStorageKey,
  loadKamTaskState,
} from "../kam-intelligence/kamTaskState";
import { api } from "../../lib/api/client";
import { DataTable } from "../../components/DataTable";
import { CardDetailsDrawer } from "../transactions/components/CardDetailsDrawer";
import { CustomerTransactionsDrawer } from "../transactions/components/CustomerTransactionsDrawer";
import { FileLogsDrawer } from "../transactions/components/FileLogsDrawer";
import { TransactionDetailDrawer } from "../transactions/components/TransactionDetailDrawer";
import { TransactionFilters } from "../transactions/components/TransactionFilters";
import { TransactionOverview } from "../transactions/components/TransactionOverview";
import { TransactionTable } from "../transactions/components/TransactionTable";
import { useMerchantProfileTransactions } from "../transactions/hooks/useMerchantProfileTransactions";
import { useRefundList } from "../disputes/refunds/api/queries";
import { getColumns as getRefundColumns } from "../disputes/refunds/components/columns";
import { mapApiRefundToRow } from "../disputes/refunds/utils/refundMappers";
import { RefundDrawer } from "../disputes/refunds/components/RefundDrawer";
import { merchants as localMerchants } from "../kam-intelligence/data";

export default function MerchantProfilePage() {
  const { merchantId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "overview",
  );
  const [currentRefundPage, setCurrentRefundPage] = useState(1);
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    number | null
  >(null);
  const [selectedCustomerTid, setSelectedCustomerTid] = useState<number | null>(
    null,
  );
  const [selectedRefundId, setSelectedRefundId] = useState<string | null>(null);
  const [logSelection, setLogSelection] = useState<{
    tid: number;
    txnId: string;
    ip: string;
  } | null>(null);
  const [selectedMaskedCard, setSelectedMaskedCard] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (
      searchParams.get("tab") === "tasks" ||
      window.location.hash === "#kam-tasks"
    ) {
      setActiveTab("history");
    }
  }, [merchantId, searchParams]);

  const { data: merchant, isLoading } = useQuery({
    queryKey: ["merchant", merchantId],
    queryFn: () => api.merchants.get(merchantId!),
  });

  const effectiveMerchant = useMemo(() => {
    if (merchant) return merchant;

    // Fallback for mock/local merchants (KAM Intelligence)
    const local = localMerchants.find((m) => m.id === Number(merchantId));
    if (local) {
      return {
        id: local.id,
        name: local.name,
        storeId: local.storeId,
        sector: "General Retail", // Placeholder
        status: "active",
        gmv7d: local.gmv,
        txCount7d: Math.round(local.gmv / 1500), // Mock calculation
        successRate7d: local.successRate,
        ownerName: local.kam,
      };
    }
    return null;
  }, [merchant, merchantId]);

  const isKamActionMerchant = useMemo(
    () => localMerchants.some((m) => m.id === Number(merchantId)),
    [merchantId],
  );

  const {
    filteredData: transactions,
    summaryMetrics,
    filters: transactionFilters,
    pagination,
    isLoading: isTransactionsLoading,
    handleFilterChange: handleTransactionFilterChange,
    handleClearFilters: handleTransactionClearFilters,
    handlePageChange: handleTransactionPageChange,
    handleExportCSV: handleTransactionExportCSV,
    isExporting: isTransactionExporting,
  } = useMerchantProfileTransactions(merchantId, activeTab === "transactions");

  const { data: refundResponse, isLoading: isRefundsLoading } = useRefundList(
    {
      merchant_id: merchantId,
      page: currentRefundPage,
      per_page: 10,
    },
    activeTab === "money",
  );

  const refunds = useMemo(() => {
    return (refundResponse?.items || []).map(mapApiRefundToRow);
  }, [refundResponse]);

  const refundColumns = useMemo(
    () => getRefundColumns((id) => setSelectedRefundId(id)),
    [],
  );

  const refundPagination = useMemo(() => {
    const paging = refundResponse?.pagination;
    return {
      currentPage: paging?.current_page || 1,
      totalPages: paging?.last_page || 1,
      total: paging?.total || 0,
      from: paging?.from,
      to: paging?.to,
    };
  }, [refundResponse]);

  const analyticsJourneyData = useMemo(
    () => [
      { month: "Feb 2026", gmv: 922000, errorRate: 78, txnCount: 4120 },
      { month: "Mar 2026", gmv: 654000, errorRate: 82, txnCount: 2980 },
      { month: "Apr 2026", gmv: 207000, errorRate: 85, txnCount: 940 },
      { month: "May 2026", gmv: 192000, errorRate: 83, txnCount: 870 },
    ],
    [],
  );

  const [showKamTasksOnly, setShowKamTasksOnly] = useState(false);

  const completedKamTasks = useMemo(() => {
    return getCompletedKamTasks(
      loadKamTaskState(getKamTaskStorageKey(merchantId)),
    );
  }, [merchantId]);

  const merchantHistoryEvents = useMemo(
    () => [
      {
        date: "05 Jun 2026",
        type: "segment_change" as const,
        title: "Segment changed to At Risk Giant",
        description:
          "Profile dropped 7 tiers over 4 months. Sustained GMV decline triggered reclassification.",
        actor: "System",
        badge: "Declining",
        badgeClass: "bg-rose-50 text-rose-700 border-rose-100",
      },
      {
        date: "28 May 2026",
        type: "kam_action" as const,
        title: "Act Now action assigned",
        description:
          "Merchant flagged for immediate KAM outreach due to 79% GMV collapse and 83% error rate.",
        actor: effectiveMerchant?.ownerName || "KAM System",
        badge: "Act Now",
        badgeClass: "bg-rose-50 text-rose-700 border-rose-100",
      },
      {
        date: "15 Apr 2026",
        type: "alert" as const,
        title: "GMV drop alert triggered",
        description:
          "Month-over-month GMV fell 68% (৳6.54L → ৳2.07L). Sharpest decline in merchant history.",
        actor: "System",
        badge: "Alert",
        badgeClass: "bg-amber-50 text-amber-700 border-amber-100",
      },
      {
        date: "01 Apr 2026",
        type: "segment_change" as const,
        title: "Segment changed to High Risk Big Merchants",
        description:
          "Moved out of Monitor Closely after consecutive months of declining transaction volume.",
        actor: "System",
        badge: "Declining",
        badgeClass: "bg-rose-50 text-rose-700 border-rose-100",
      },
      {
        date: "12 Mar 2026",
        type: "alert" as const,
        title: "Payment error rate exceeded 80%",
        description:
          "Error rate reached 82%, suppressing transaction success and merchant volume.",
        actor: "System",
        badge: "Technical",
        badgeClass: "bg-amber-50 text-amber-700 border-amber-100",
      },
      {
        date: "01 Mar 2026",
        type: "segment_change" as const,
        title: "Segment changed to Monitor Closely",
        description:
          "Early warning signal after GMV dipped from peak levels in February.",
        actor: "System",
        badge: "Watch",
        badgeClass: "bg-amber-50 text-amber-700 border-amber-100",
      },
      {
        date: "18 Feb 2026",
        type: "milestone" as const,
        title: "Peak GMV recorded — ৳9.22L",
        description:
          "Highest monthly GMV while classified as Champion Merchants.",
        actor: "System",
        badge: "Milestone",
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-100",
      },
      {
        date: "01 Feb 2026",
        type: "segment_change" as const,
        title: "Segment changed to Champion Merchants",
        description:
          "Promoted to top-tier profile based on volume, success rate, and engagement scores.",
        actor: "System",
        badge: "Growing",
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-100",
      },
      {
        date: "10 Jan 2026",
        type: "assignment" as const,
        title: "KAM reassigned",
        description: `Merchant portfolio transferred to ${effectiveMerchant?.ownerName || "current KAM"} for dedicated account management.`,
        actor: "Admin",
        badge: "Assignment",
        badgeClass: "bg-blue-50 text-blue-700 border-blue-100",
      },
      {
        date: "05 Dec 2025",
        type: "onboarding" as const,
        title: "Merchant onboarded",
        description:
          "Store activated on SSLCOMMERZ gateway. Initial segment: Stable Merchants.",
        actor: "Onboarding Team",
        badge: "Onboarded",
        badgeClass: "bg-slate-50 text-slate-700 border-slate-100",
      },
    ],
    [effectiveMerchant?.ownerName],
  );

  const allHistoryEvents = useMemo(() => {
    const staticEvents = merchantHistoryEvents.map((event) => ({
      ...event,
      sortDate: Date.parse(event.date) || 0,
    }));

    const taskEvents = completedKamTasks.map((task) => ({
      date: formatKamTaskCompletedAt(task.completedAt),
      sortDate: new Date(task.completedAt).getTime() || 0,
      type: "kam_task" as const,
      title: task.title,
      description: task.note,
      actor: effectiveMerchant?.ownerName || "KAM",
      badge: "KAM Task",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-100",
    }));

    return [...staticEvents, ...taskEvents].sort(
      (a, b) => b.sortDate - a.sortDate,
    );
  }, [merchantHistoryEvents, completedKamTasks, effectiveMerchant?.ownerName]);

  const displayedHistoryEvents = useMemo(() => {
    if (!showKamTasksOnly) return allHistoryEvents;
    return allHistoryEvents.filter((event) => event.type === "kam_task");
  }, [allHistoryEvents, showKamTasksOnly]);

  const historyEventIcon = (
    type: (typeof merchantHistoryEvents)[number]["type"] | "kam_task",
  ) => {
    switch (type) {
      case "segment_change":
        return {
          Icon: TrendingDown,
          color: "text-indigo-600 bg-indigo-50 border-indigo-100",
        };
      case "kam_action":
        return {
          Icon: Phone,
          color: "text-rose-600 bg-rose-50 border-rose-100",
        };
      case "kam_task":
        return {
          Icon: Check,
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
      default:
        return {
          Icon: History,
          color: "text-slate-600 bg-slate-50 border-slate-100",
        };
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="h-48 bg-slate-100 animate-pulse rounded-lg"></div>
      </div>
    );
  }

  if (!effectiveMerchant) {
    return (
      <div className="max-w-6xl mx-auto text-center py-12">
        <p className="text-slate-500">Merchant not found.</p>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "transactions", label: "Transactions" },
    { id: "money", label: "Refund" },
    { id: "analytics", label: "Analytics" },
    { id: "history", label: "History" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
            <Store className="w-6 h-6 text-slate-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {effectiveMerchant.name}
            </h1>
            <div className="text-[11px] text-slate-500 font-normal flex items-center gap-1 mt-0.5">
              {effectiveMerchant.storeId}
              <CopyButton value={effectiveMerchant.storeId} />
              {effectiveMerchant.sector && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 uppercase tracking-wider ml-1.5">
                  {effectiveMerchant.sector}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span
            className={clsx(
              "px-3 py-1 text-sm font-medium rounded-full capitalize",
              effectiveMerchant.status === "active"
                ? "bg-emerald-100 text-emerald-700"
                : effectiveMerchant.status === "suspended"
                  ? "bg-rose-100 text-rose-700"
                  : "bg-slate-100 text-slate-600",
            )}
          >
            {effectiveMerchant.status}
          </span>
          {isKamActionMerchant && (
            <button
              type="button"
              onClick={() => setActiveTab("analytics")}
              className="px-3 py-1 text-sm font-medium rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors"
            >
              Analytics
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex gap-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
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

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* KPI Strip */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-500 uppercase tracking-wide">
                Total TXN Volume
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                ৳{effectiveMerchant.gmv7d.toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-500 uppercase tracking-wide">
                Total Txn Count
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {effectiveMerchant.txCount7d.toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-500 uppercase tracking-wide">
                Txn Success Rate
              </p>
              <p
                className={clsx(
                  "text-2xl font-bold mt-1",
                  effectiveMerchant.successRate7d > 90
                    ? "text-emerald-600"
                    : "text-amber-600",
                )}
              >
                {effectiveMerchant.successRate7d}%
              </p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-500 uppercase tracking-wide">
                Failed Tx count
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {Math.round(
                  effectiveMerchant.txCount7d *
                    (1 - effectiveMerchant.successRate7d / 100),
                ).toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-500 uppercase tracking-wide">
                Disputes
              </p>
              <p className="text-2xl font-bold text-rose-600 mt-1">3</p>
            </div>
          </div>

          {/* Merchant Info */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-900 mb-4">
              Merchant Information
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  KAM
                </p>
                <p className="text-sm font-medium text-slate-900 mt-1">
                  {effectiveMerchant.ownerName}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  Sector
                </p>
                <p className="text-sm font-medium text-slate-900 mt-1">
                  {effectiveMerchant.sector}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  Status
                </p>
                <p className="text-sm font-medium text-slate-900 mt-1 capitalize">
                  {effectiveMerchant.status}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  Store ID
                </p>
                <p className="text-sm font-medium text-slate-900 mt-1">
                  {effectiveMerchant.storeId}
                </p>
              </div>
            </div>
          </div>

          {/* Charts & Failures Area */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm font-semibold text-slate-900">
                  GMV Trend (Last 7 Days)
                </p>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    ↑ 12.5%
                  </span>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={[
                      { date: "Apr 10", volume: 1200000, count: 450 },
                      { date: "Apr 11", volume: 1500000, count: 520 },
                      { date: "Apr 12", volume: 1300000, count: 480 },
                      { date: "Apr 13", volume: 1800000, count: 610 },
                      { date: "Apr 14", volume: 2200000, count: 750 },
                      { date: "Apr 15", volume: 2100000, count: 720 },
                      { date: "Apr 16", volume: 2450000, count: 840 },
                    ]}
                  >
                    <defs>
                      <linearGradient id="colorGmv" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#2563eb"
                          stopOpacity={0.1}
                        />
                        <stop
                          offset="95%"
                          stopColor="#2563eb"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
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
                        `৳${value.toLocaleString()}`,
                        "GMV Volume",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="volume"
                      stroke="#2563eb"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorGmv)"
                      activeDot={{ r: 6, strokeWidth: 0, fill: "#2563eb" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Failure Reasons */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-900 mb-4">
                Top Failure Reasons
              </p>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Insufficient Funds</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 w-[70%]"></div>
                    </div>
                    <span className="font-semibold text-slate-900 w-12 text-right">
                      245
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Authorization Declined</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 w-[40%]"></div>
                    </div>
                    <span className="font-semibold text-slate-900 w-12 text-right">
                      120
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">
                    3DS Authentication Failed
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 w-[15%]"></div>
                    </div>
                    <span className="font-semibold text-slate-900 w-12 text-right">
                      45
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "transactions" && (
        <div className="flex flex-col">
          <TransactionFilters
            filters={transactionFilters}
            onFilterChange={handleTransactionFilterChange}
            onClearFilters={handleTransactionClearFilters}
            excludeFilterKeys={["merchant_id"]}
          />
          <TransactionOverview
            metrics={summaryMetrics}
            onFilterChange={(newPartialFilters) =>
              handleTransactionFilterChange({
                ...transactionFilters,
                ...newPartialFilters,
              })
            }
          />
          <TransactionTable
            data={transactions}
            isLoading={isTransactionsLoading}
            pagination={pagination}
            onPageChange={handleTransactionPageChange}
            onViewDetail={setSelectedTransactionId}
            onViewCustomer={setSelectedCustomerTid}
            onViewCard={setSelectedMaskedCard}
            onViewLogs={(tid, txnId, ip) => setLogSelection({ tid, txnId, ip })}
            onExportCSV={handleTransactionExportCSV}
            isExporting={isTransactionExporting}
          />
        </div>
      )}

      {activeTab === "money" && (
        <div className="overflow-hidden">
          <DataTable
            columns={refundColumns}
            data={refunds}
            isLoading={isRefundsLoading}
            hideToolbarDateFilter={true}
            externalPagination={refundPagination}
            onPageChange={setCurrentRefundPage}
            filterActions={
              <h2 className="text-sm font-semibold text-slate-900 ml-1">
                Merchant Refund History
              </h2>
            }
          />
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="space-y-6">
          {/* Header Warning Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 shadow-sm flex gap-3.5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-100/50 rounded-full -mr-12 -mt-12" />
            <div className="p-2 bg-amber-100 rounded-lg text-amber-700 h-10 w-10 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div className="relative">
              <h3 className="text-[10px] font-bold text-amber-800 uppercase tracking-widest text-left">
                Immediate Attention Needed
              </h3>
              <p className="text-sm font-semibold text-amber-950 mt-1 leading-relaxed text-left">
                Champion <span className="text-amber-500 mx-1">→</span> At Risk
                Giant over 4 months · GMV: ৳9.22L{" "}
                <span className="text-amber-500 mx-1">→</span> ৳1.92L ·
                Immediate action needed.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm font-semibold text-slate-900">
                  GMV Journey (4 Months)
                </p>
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                  ↓ 79%
                </span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsJourneyData}>
                    <defs>
                      <linearGradient
                        id="colorAnalyticsGmv"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#e11d48"
                          stopOpacity={0.12}
                        />
                        <stop
                          offset="95%"
                          stopColor="#e11d48"
                          stopOpacity={0}
                        />
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
                      tickFormatter={(val) => `৳${(val / 100000).toFixed(1)}L`}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        fontSize: "12px",
                      }}
                      formatter={(value: number) => [
                        `৳${(value / 100000).toFixed(2)}L`,
                        "GMV",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="gmv"
                      stroke="#e11d48"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorAnalyticsGmv)"
                      activeDot={{ r: 5, strokeWidth: 0, fill: "#e11d48" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm font-semibold text-slate-900">
                  Payment Error Rate
                </p>
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                  Avg 82%
                </span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsJourneyData}>
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
                      domain={[70, 90]}
                      tickFormatter={(val) => `${val}%`}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        fontSize: "12px",
                      }}
                      formatter={(value: number) => [`${value}%`, "Error Rate"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="errorRate"
                      stroke="#f59e0b"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: "#f59e0b", strokeWidth: 0 }}
                      activeDot={{ r: 6, strokeWidth: 0, fill: "#f59e0b" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm font-semibold text-slate-900">
                  Transaction Volume
                </p>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                  Feb → May 2026
                </span>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analyticsJourneyData}
                    margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
                  >
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
                      dataKey="txnCount"
                      fill="#295cab"
                      radius={[4, 4, 0, 0]}
                      barSize={48}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Context from journey */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6 text-left">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="w-2 h-2 bg-indigo-600 rounded-full" />
                <h4 className="uppercase text-[11px] font-bold tracking-widest text-slate-500">
                  Context from journey
                </h4>
              </div>

              <ul className="space-y-4">
                <li className="flex gap-3 text-sm text-slate-600 leading-relaxed">
                  <span className="text-indigo-500 font-semibold mt-0.5">
                    •
                  </span>
                  <span>
                    Profile dropped 7 tiers over 4 months:{" "}
                    <strong className="text-slate-900">Champion</strong>{" "}
                    <span className="text-slate-400 mx-1">→</span>{" "}
                    <strong className="text-slate-900">At Risk Giant</strong>.
                    Sustained decline — this is not a blip.
                  </span>
                </li>
                <li className="flex gap-3 text-sm text-slate-600 leading-relaxed">
                  <span className="text-indigo-500 font-semibold mt-0.5">
                    •
                  </span>
                  <span>
                    GMV collapsed{" "}
                    <strong className="text-rose-600 font-bold">79%</strong>:
                    ৳9.22 L (Feb 2026){" "}
                    <span className="text-slate-400 mx-1">→</span> ৳1.92 L (May
                    2026).
                  </span>
                </li>
                <li className="flex gap-3 text-sm text-slate-600 leading-relaxed">
                  <span className="text-indigo-500 font-semibold mt-0.5">
                    •
                  </span>
                  <span>
                    Sharpest drop: Mar 2026{" "}
                    <span className="text-slate-400 mx-1">→</span> Apr 2026 (
                    <strong className="text-rose-600 font-bold">-68%</strong>,
                    ৳6.54 L <span className="text-slate-400 mx-1">→</span> ৳2.07
                    L). Investigate what triggered this.
                  </span>
                </li>
                <li className="flex gap-3 text-sm text-slate-600 leading-relaxed">
                  <span className="text-indigo-500 font-semibold mt-0.5">
                    •
                  </span>
                  <span>
                    Persistently high error rate — avg{" "}
                    <strong className="text-rose-600 font-bold">81%</strong>{" "}
                    over the period, currently{" "}
                    <strong className="text-rose-600 font-bold">83%</strong>.
                    Payment failures are likely suppressing volume, not just a
                    relationship issue.
                  </span>
                </li>
              </ul>
            </div>

            {/* Talking points for the call */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6 text-left">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="w-2 h-2 bg-rose-500 rounded-full" />
                <h4 className="uppercase text-[11px] font-bold tracking-widest text-slate-500">
                  Talking points for the call
                </h4>
              </div>

              <ul className="space-y-4">
                <li className="flex gap-3 text-sm text-slate-600 leading-relaxed">
                  <span className="text-rose-500 font-semibold mt-0.5">•</span>
                  <span>
                    Reference their history as a{" "}
                    <em className="text-slate-900 font-medium not-italic">
                      Champion
                    </em>{" "}
                    — acknowledging the drop can open a more honest conversation
                    about what changed.
                  </span>
                </li>
                <li className="flex gap-3 text-sm text-slate-600 leading-relaxed">
                  <span className="text-rose-500 font-semibold mt-0.5">•</span>
                  <span>
                    Their peak GMV was{" "}
                    <strong className="text-slate-950 font-bold">
                      ৳9.22 L
                    </strong>{" "}
                    — anchor the conversation there. Ask what changed
                    operationally around that time.
                  </span>
                </li>
                <li className="flex gap-3 text-sm text-slate-600 leading-relaxed">
                  <span className="text-rose-500 font-semibold mt-0.5">•</span>
                  <span>
                    Check payment error logs before the call — a technical fix
                    may recover more volume than a KAM conversation alone.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

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
                    Merchant History
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Completed KAM tasks, segment changes, actions, alerts, and
                    milestones
                  </p>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer group shrink-0">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={showKamTasksOnly}
                    onChange={(e) => setShowKamTasksOnly(e.target.checked)}
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:inset-s-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600" />
                </div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight group-hover:text-slate-700 transition-colors whitespace-nowrap">
                  Show KAM Tasks Only
                </span>
              </label>
            </div>

            <div className="relative">
              <div className="absolute left-[19px] top-2 bottom-2 w-px bg-slate-200" />
              <div className="space-y-6">
                {displayedHistoryEvents.length === 0 ? (
                  <p className="text-sm text-slate-500 py-4 pl-14">
                    {showKamTasksOnly
                      ? "No completed KAM tasks yet."
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

      {/* Drawers */}
      {selectedTransactionId && (
        <TransactionDetailDrawer
          transactionId={selectedTransactionId}
          onClose={() => setSelectedTransactionId(null)}
          onShowLogs={(tid, txnId, ip) => setLogSelection({ tid, txnId, ip })}
          onShowCard={setSelectedMaskedCard}
        />
      )}

      {selectedCustomerTid && (
        <CustomerTransactionsDrawer
          tid={selectedCustomerTid}
          onClose={() => setSelectedCustomerTid(null)}
        />
      )}

      {logSelection && (
        <FileLogsDrawer
          tid={logSelection.tid}
          txnId={logSelection.txnId}
          ip={logSelection.ip}
          onClose={() => setLogSelection(null)}
        />
      )}

      {selectedMaskedCard && (
        <CardDetailsDrawer
          maskedCard={selectedMaskedCard}
          onClose={() => setSelectedMaskedCard(null)}
        />
      )}

      {selectedRefundId && (
        <RefundDrawer
          refundId={selectedRefundId}
          onClose={() => setSelectedRefundId(null)}
        />
      )}
    </div>
  );
}
