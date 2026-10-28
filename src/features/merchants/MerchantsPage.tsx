import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { clsx } from "clsx";
import {
  Calendar,
  Download,
  ExternalLink,
  Eye,
  LogIn,
  Pencil,
  Search,
  Sheet,
  Shield,
  Store,
  Users,
  MoreVertical,
  Network,
} from "lucide-react";
import { toast } from "react-hot-toast";
import React, { useMemo, useState, useEffect } from "react";
import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { CopyButton } from "../../components/CopyButton";
import { DataTable } from "../../components/DataTable";
import { Drawer } from "../../components/Drawer";
import type { FilterConfig } from "../../components/FilterBar";
import { FilterBar } from "../../components/FilterBar";
import { MetricCard } from "../../components/MetricCard";
import { Skeleton } from "../../components/Skeleton";
import { Tooltip as UITooltip } from "../../components/Tooltip";
import type { Merchant } from "../../data/mock/types";
import { api } from "../../lib/api/client";
import { MerchantViewGatewayDrawer } from "./MerchantViewGatewayDrawer";
import { MerchantManageGatewayDrawer } from "./MerchantManageGatewayDrawer";

const MERCHANT_DATE_PRESET_LABELS: Record<string, string> = {
  all: "All Time",
  today: "Today",
  last_day: "Last Day",
  this_week: "This Week",
  this_month: "This Month",
  "7d": "Past 7 Days",
  "30d": "Past 30 Days",
  custom: "Custom Range",
};

function formatMerchantFilterDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString();
}

function getMerchantDateRangeLabel(options: {
  datePreset?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  period?: string | null;
  customRange?: { from: string; to: string } | null;
}): string {
  const { datePreset, dateFrom, dateTo, period, customRange } = options;

  if (period) {
    if (period === "custom" && customRange?.from && customRange?.to) {
      return `${formatMerchantFilterDate(customRange.from)} - ${formatMerchantFilterDate(customRange.to)}`;
    }

    const homeLabels: Record<string, string> = {
      today: "Today",
      last_day: "Last Day",
      this_month: "This Month",
      "7d": "Past 7 Days",
      "30d": "Past 30 Days",
    };
    return homeLabels[period] || period;
  }

  const preset = datePreset || "all";

  if (preset === "custom" && dateFrom && dateTo) {
    return `${formatMerchantFilterDate(dateFrom)} - ${formatMerchantFilterDate(dateTo)}`;
  }

  return MERCHANT_DATE_PRESET_LABELS[preset] || "All Time";
}

// --- Merchant Drawer Component ---

// Enhanced Merchant Drawer
export function MerchantDrawer() {
  const { merchantId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Get period info from location state (passed from Home page)
  const locationState = location.state as {
    period?: string;
    customRange?: { from: string; to: string };
  } | null;
  const period = locationState?.period;
  const customRange = locationState?.customRange;

  const dateRangeLabel = getMerchantDateRangeLabel({
    datePreset: searchParams.get("date_preset"),
    dateFrom: searchParams.get("date_from"),
    dateTo: searchParams.get("date_to"),
    period,
    customRange,
  });

  const { data: merchant, isLoading } = useQuery({
    queryKey: ["merchant", merchantId],
    queryFn: () => api.merchants.get(merchantId!),
  });

  const onClose = () => {
    const search = location.search;

    if (location.pathname.startsWith("/m/")) {
      navigate(`/${search}`);
      return;
    }

    if (location.pathname.includes("/non-transacting/")) {
      navigate(`/merchants/non-transacting${search}`);
      return;
    }

    if (location.pathname.includes("/merchants/top/")) {
      navigate(`/merchants/top${search}`);
      return;
    }

    navigate(`/merchants${search}`);
  };

  const handleViewFullProfile = () => {
    navigate(`/merchants/profile/${merchantId}`);
  };

  if (isLoading || !merchant)
    return (
      <Drawer open={true} onClose={onClose} width="xl">
        <div className="p-8 text-center text-slate-500">
          Loading merchant profile...
        </div>
      </Drawer>
    );

  // Custom title layout: Name + View Full Profile inline, ID (with CopyButton) + Sector badge inline on the second line
  const customTitle = (
    <div className="flex flex-col gap-1 font-normal">
      <div className="flex items-center gap-3">
        <span className="text-xl font-bold text-slate-900 leading-tight">
          {merchant.name}
        </span>
        <button
          onClick={handleViewFullProfile}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors mt-0.5 cursor-pointer"
        >
          View Full Profile
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="text-[11px] text-slate-500 font-normal flex items-center gap-1 mt-0.5">
        {merchant.storeId}
        <CopyButton value={merchant.storeId} />
        {merchant.sector && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 uppercase tracking-wider ml-1.5">
            {merchant.sector}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <Drawer open={true} onClose={onClose} title={customTitle} width="xl">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500 -mt-2">
          <Calendar className="w-4 h-4 shrink-0" />
          <span className="font-medium text-slate-600">{dateRangeLabel}</span>
          <span className="text-slate-400">· showing data</span>
        </div>
        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="p-3 bg-slate-50 rounded border border-slate-100">
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">
              Total TXN Volume
            </p>
            <p className="text-lg font-bold text-slate-900 mt-1">
              ৳{merchant.gmv7d.toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded border border-slate-100">
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">
              Total Txn Count
            </p>
            <p className="text-lg font-bold text-slate-900 mt-1">
              {merchant.txCount7d.toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded border border-slate-100">
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">
              Txn Success Rate
            </p>
            <p
              className={clsx(
                "text-lg font-bold mt-1",
                merchant.successRate7d > 90
                  ? "text-emerald-600"
                  : "text-amber-600",
              )}
            >
              {merchant.successRate7d}%
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded border border-slate-100">
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">
              Failed Tx count
            </p>
            <p className="text-lg font-bold text-slate-900 mt-1">
              {Math.round(
                merchant.txCount7d * (1 - merchant.successRate7d / 100),
              ).toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded border border-slate-100">
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">
              Disputes
            </p>
            <p className="text-lg font-bold text-rose-600 mt-1">3</p>
          </div>
        </div>

        {/* New Information Sections */}
        <div className="space-y-8 pb-8">
          <section>
            <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">
              Contact Information
            </h3>
            <div className="bg-white rounded-lg border border-slate-200 px-4 divide-y divide-slate-100">
              <DetailRow label="Name" value={merchant.contactName} />
              <DetailRow label="Phone" value={merchant.contactPhone} />
              <DetailRow label="Fax" value={merchant.contactFax} />
              <DetailRow label="Country" value={merchant.contactCountry} />
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">
              Support & Assignment Information
            </h3>
            <div className="bg-white rounded-lg border border-slate-200 px-4 divide-y divide-slate-100">
              <DetailRow
                label="Technical Support By"
                value={merchant.techSupportBy}
              />
              <DetailRow
                label="SSLCommerz Salesforce"
                value={merchant.salesforce}
              />
              <DetailRow label="Hunter" value={merchant.hunter} />
              <DetailRow label="Incubator" value={merchant.incubator} />
              <DetailRow
                label="Introducer (KAM)"
                value={merchant.introducerKam}
              />
              <DetailRow label="Current KAM" value={merchant.currentKam} />
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">
              Merchant Meta Information
            </h3>
            <div className="bg-white rounded-lg border border-slate-200 px-4 divide-y divide-slate-100">
              <DetailRow label="Merchant Added By" value={merchant.addedBy} />
              <DetailRow
                label="Merchant Updated By"
                value={merchant.updatedBy}
              />
              <DetailRow label="Updated On" value={merchant.updatedOn} />
            </div>
          </section>
        </div>

        {/* Charts & Lists Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
          <div className="h-64 border border-slate-200 rounded-lg p-4 bg-white shadow-sm">
            <p className="text-sm font-semibold text-slate-900 mb-4">
              GMV Trend (7d)
            </p>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={[
                  { v: 1000 },
                  { v: 1500 },
                  { v: 1200 },
                  { v: 1800 },
                  { v: 2000 },
                  { v: 2400 },
                  { v: 2200 },
                ]}
              >
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke="#295cab"
                  strokeWidth={2}
                  dot={false}
                />
                <XAxis dataKey="name" hide />
                <Tooltip
                  formatter={(value: number | undefined) => [
                    value !== undefined
                      ? `৳${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : "",
                    "Amount",
                  ]}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Mini List: Top Failures */}
          <div className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm">
            <p className="text-sm font-semibold text-slate-900 mb-4">
              Top Failure Reasons
            </p>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Insufficient Funds</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 w-[70%]"></div>
                  </div>
                  <span className="font-medium text-slate-900">245</span>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Auth Declined</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 w-[40%]"></div>
                  </div>
                  <span className="font-medium text-slate-900">120</span>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">3DS Failed</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 w-[15%]"></div>
                  </div>
                  <span className="font-medium text-slate-900">45</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  );
}

// Helper components for Drawer
const DetailRow = ({ label, value }: { label: string; value?: string }) => (
  <div className="flex flex-col sm:flex-row sm:items-start py-3 text-sm">
    <dt className="w-full sm:w-1/3 text-slate-500 font-medium">{label}</dt>
    <dd className="w-full sm:w-2/3 text-slate-900">
      {value || "Not Assigned"}
    </dd>
  </div>
);

// --- Main Page ---

// Table columns moved inside the component to access state handlers

// --- Filter Configs ---

const primaryFilterConfig: FilterConfig[] = [
  { key: "date", type: "date-range", label: "Onboarding" },
  { key: "name", type: "input", label: "Merchant Name" },
  { key: "storeId", type: "input", label: "Store ID" },
  {
    key: "status",
    type: "select",
    label: "Status",
    options: [
      { label: "All Status", value: "all" },
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
      { label: "Transacting", value: "transacting" },
      { label: "Non transacting", value: "non_transacting" },
      { label: "Recently Onboarded", value: "recently_onboarded" },
      { label: "Suspended", value: "suspended" },
    ],
  },
  {
    key: "sector",
    type: "select",
    label: "Sector",
    options: [
      { label: "All Sectors", value: "all" },
      { label: "Business Services", value: "Business Services" },
      {
        label: "Hospitality, Travel & Aviation",
        value: "Hospitality, Travel & Aviation",
      },
      { label: "Pureplay Ecommerce", value: "Pureplay Ecommerce" },
      { label: "Telecommunication", value: "Telecommunication" },
      { label: "Healthcare", value: "Healthcare" },
      { label: "Education", value: "Education" },
      { label: "Bricks & Mortar", value: "Bricks & Mortar" },
      {
        label: "Banking & Financial Institution",
        value: "Banking & Financial Institution",
      },
      { label: "Utility & Billing", value: "Utility & Billing" },
      { label: "Government", value: "Government" },
    ],
  },
  {
    key: "type",
    type: "select",
    label: "Type",
    options: [
      { label: "All Types", value: "all" },
      { label: "Online", value: "Online" },
      { label: "Physical", value: "Physical" },
    ],
  },
];

const advancedFilterConfig: FilterConfig[] = [
  {
    key: "top_sort",
    type: "select",
    label: "Top Merchants",
    options: [
      { label: "All", value: "all" },
      { label: "Amount Wise", value: "amount" },
      { label: "Count Wise", value: "count" },
      { label: "Revenue Wise", value: "revenue" },
    ],
  },
  {
    key: "customerPayTdr",
    type: "select",
    label: "Customer Pay TDR",
    options: [
      { label: "All", value: "all" },
      { label: "Yes", value: "true" },
      { label: "No", value: "false" },
    ],
  },
  {
    key: "emiStatus",
    type: "select",
    label: "EMI Status",
    options: [
      { label: "All", value: "all" },
      { label: "Enabled", value: "Enabled" },
      { label: "Disabled", value: "Disabled" },
    ],
  },
  {
    key: "settlementStatus",
    type: "select",
    label: "Settlement Status",
    options: [
      { label: "All", value: "all" },
      { label: "Enable", value: "enabled" },
      { label: "Disable", value: "disabled" },
    ],
  },
  { key: "ownerName", type: "input", label: "KAM Name" },
  { key: "contactPhone", type: "input", label: "Contact Phone" },
  { key: "contactCountry", type: "input", label: "Country" },
];

function getMerchantStatusBadgeClass(status: string) {
  switch (status) {
    case "active":
    case "transacting":
      return "bg-emerald-50 text-emerald-600";
    case "suspended":
      return "bg-rose-50 text-rose-600";
    case "non_transacting":
      return "bg-amber-50 text-amber-600";
    case "recently_onboarded":
      return "bg-blue-50 text-blue-600";
    case "inactive":
      return "bg-slate-100 text-slate-500";
    default:
      return "bg-slate-100 text-slate-500";
  }
}

function formatMerchantStatusLabel(status: string) {
  return status.replace(/_/g, " ");
}

export default function MerchantsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedGatewayMerchant, setSelectedGatewayMerchant] =
    useState<Merchant | null>(null);
  const [selectedManageGatewayMerchant, setSelectedManageGatewayMerchant] =
    useState<Merchant | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  useEffect(() => {
    const handleOutsideClick = () => {
      setActiveMenuId(null);
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  const detailSearch = searchParams.toString();
  const getDetailLink = (merchantRowId: string) => ({
    pathname: `/merchants/${merchantRowId}`,
    search: detailSearch,
  });
  const getEditLink = (merchantRowId: string) => ({
    pathname: `/merchants/edit/${merchantRowId}`,
    search: detailSearch,
  });

  const columns = useMemo<ColumnDef<Merchant>[]>(
    () => [
      {
        header: "Merchant Name",
        accessorKey: "name",
        cell: ({ row }) => (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-slate-900 leading-tight">
              {row.original.name}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono p-1 bg-slate-50 border border-slate-100 rounded leading-none text-slate-500">
                {row.original.storeId}
              </span>
              <CopyButton value={row.original.storeId} />
            </div>
          </div>
        ),
      },
      {
        header: "KAM",
        accessorKey: "ownerName",
        cell: ({ row }) => (
          <span className="text-xs font-medium text-slate-600">
            {row.original.ownerName}
          </span>
        ),
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <span
              className={clsx(
                "px-2 py-0.5 rounded-full text-xs font-medium capitalize whitespace-nowrap inline-block",
                getMerchantStatusBadgeClass(status),
              )}
            >
              {formatMerchantStatusLabel(status)}
            </span>
          );
        },
      },
      {
        header: "Sector",
        accessorKey: "sector",
        cell: ({ row }) => (
          <span className="text-xs font-medium text-slate-600">
            {row.original.sector}
          </span>
        ),
      },
      {
        header: "Type",
        accessorKey: "type",
        cell: ({ row }) => (
          <span className="text-xs font-medium text-slate-600">
            {row.original.type || "N/A"}
          </span>
        ),
      },
      {
        header: "Onboarding",
        accessorKey: "onboardingDate",
        cell: ({ row }) => (
          <span className="text-xs font-medium text-slate-600">
            {new Date(row.original.onboardingDate).toLocaleDateString()}
          </span>
        ),
      },
      {
        id: "manage",
        header: "Manage",
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <UITooltip content="Manage Stores">
              <Link
                to={`/merchants/stores/${row.original.id}`}
                onClick={(e) => e.stopPropagation()}
                className="flex flex-col items-center gap-0 group"
              >
                <div className="pt-1.5 px-1.5 pb-0 hover:bg-slate-100 rounded text-slate-400 group-hover:text-primary-600 transition-colors">
                  <Store className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-medium text-slate-500 group-hover:text-primary-600 transition-colors">
                  Stores
                </span>
              </Link>
            </UITooltip>
            <UITooltip content="Manage Users">
              <Link
                to={`/merchants/users/${row.original.id}`}
                onClick={(e) => e.stopPropagation()}
                className="flex flex-col items-center gap-0 group"
              >
                <div className="pt-1.5 px-1.5 pb-0 hover:bg-slate-100 rounded text-slate-400 group-hover:text-primary-600 transition-colors">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-medium text-slate-500 group-hover:text-primary-600 transition-colors">
                  Users
                </span>
              </Link>
            </UITooltip>
            <UITooltip content="Manage Gateway">
              <button
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  setSelectedManageGatewayMerchant(row.original);
                }}
                className="flex flex-col items-center gap-0 group"
              >
                <div className="pt-1.5 px-1.5 pb-0 hover:bg-slate-100 rounded text-slate-400 group-hover:text-primary-600 transition-colors">
                  <Shield className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-medium text-slate-500 group-hover:text-primary-600 transition-colors">
                  Gateway
                </span>
              </button>
            </UITooltip>
          </div>
        ),
        meta: {
          headerClassName: "hidden min-[1200px]:table-cell",
          cellClassName:
            "hidden min-[1200px]:table-cell px-3 py-2 align-middle",
        },
      },
      {
        id: "action",
        header: "Action",
        cell: ({ row }) => (
          <div>
            {/* Desktop View: visible above 1200px */}
            <div className="hidden min-[1200px]:flex items-center gap-1.5 whitespace-nowrap">
              <UITooltip content="Details">
                <Link
                  to={getDetailLink(row.original.id)}
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  className="flex flex-col items-center gap-0 group"
                >
                  <div className="pt-1.5 px-1.5 pb-0 hover:bg-slate-100 rounded text-slate-400 group-hover:text-primary-600 transition-colors">
                    <Eye className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-medium text-slate-500 group-hover:text-primary-600 transition-colors">
                    Details
                  </span>
                </Link>
              </UITooltip>
              <UITooltip content="Edit">
                <Link
                  to={getEditLink(row.original.id)}
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  className="flex flex-col items-center gap-0 group"
                >
                  <div className="pt-1.5 px-1.5 pb-0 hover:bg-slate-100 rounded text-slate-400 group-hover:text-primary-600 transition-colors">
                    <Pencil className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-medium text-slate-500 group-hover:text-primary-600 transition-colors">
                    Edit
                  </span>
                </Link>
              </UITooltip>
              <UITooltip content="View Gateway">
                <button
                  type="button"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    setSelectedGatewayMerchant(row.original);
                  }}
                  className="flex flex-col items-center gap-0 group"
                >
                  <div className="pt-1.5 px-1.5 pb-0 hover:bg-slate-100 rounded text-slate-400 group-hover:text-primary-600 transition-colors">
                    <Network className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-medium text-slate-500 group-hover:text-primary-600 transition-colors">
                    Gateway
                  </span>
                </button>
              </UITooltip>
              <UITooltip content="View as Merchant">
                <button
                  type="button"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    toast.success(`Viewing as ${row.original.name}`);
                  }}
                  className="flex flex-col items-center gap-0 group"
                >
                  <div className="pt-1.5 px-1.5 pb-0 hover:bg-slate-100 rounded text-slate-400 group-hover:text-primary-600 transition-colors">
                    <LogIn className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-medium text-slate-500 group-hover:text-primary-600 transition-colors">
                    View as
                  </span>
                </button>
              </UITooltip>
            </div>

            {/* Mobile/Tablet View: visible below 1200px */}
            <div className="flex min-[1200px]:hidden items-center justify-center relative">
              <button
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  setActiveMenuId(
                    activeMenuId === row.original.id ? null : row.original.id,
                  );
                }}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {activeMenuId === row.original.id && (
                <div
                  className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-1.5 py-2 animate-in fade-in zoom-in-95 duration-100 text-left animate-duration-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Link
                    to={getDetailLink(row.original.id)}
                    onClick={() => setActiveMenuId(null)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-primary-600 hover:bg-slate-50 hover:text-primary-700 rounded-md transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Details
                  </Link>
                  <Link
                    to={getEditLink(row.original.id)}
                    onClick={() => setActiveMenuId(null)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-primary-600 hover:bg-slate-50 hover:text-primary-700 rounded-md transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </Link>
                  <button
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      setActiveMenuId(null);
                      setSelectedGatewayMerchant(row.original);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-primary-600 hover:bg-slate-50 hover:text-primary-700 rounded-md transition-colors text-left"
                  >
                    <Network className="w-3.5 h-3.5" />
                    View Gateway
                  </button>
                  <button
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      setActiveMenuId(null);
                      toast.success(`Viewing as ${row.original.name}`);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-primary-600 hover:bg-slate-50 hover:text-primary-700 rounded-md transition-colors text-left"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    View as Merchant
                  </button>

                  {/* Additional Mobile/Tablet Management Actions */}
                  <div className="border-t border-slate-100 my-1 pt-1" />
                  <Link
                    to={`/merchants/stores/${row.original.id}`}
                    onClick={() => setActiveMenuId(null)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-primary-600 hover:bg-slate-50 hover:text-primary-700 rounded-md transition-colors"
                  >
                    <Store className="w-3.5 h-3.5" />
                    Manage Stores
                  </Link>
                  <Link
                    to={`/merchants/users/${row.original.id}`}
                    onClick={() => setActiveMenuId(null)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-primary-600 hover:bg-slate-50 hover:text-primary-700 rounded-md transition-colors"
                  >
                    <Users className="w-3.5 h-3.5" />
                    Manage Users
                  </Link>
                  <button
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      setActiveMenuId(null);
                      setSelectedManageGatewayMerchant(row.original);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-primary-600 hover:bg-slate-50 hover:text-primary-700 rounded-md transition-colors text-left"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    Manage Gateway
                  </button>
                </div>
              )}
            </div>
          </div>
        ),
      },
    ],
    [
      detailSearch,
      setSelectedGatewayMerchant,
      setSelectedManageGatewayMerchant,
      activeMenuId,
      setActiveMenuId,
    ],
  );

  const { data: merchants, isLoading } = useQuery({
    queryKey: ["merchants-list"],
    queryFn: api.merchants.list,
  });

  // Sync filters with URL
  const filters = useMemo(() => {
    const params: Record<string, any> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    if (params.date_preset) {
      params.date = {
        preset: params.date_preset,
        from: params.date_from,
        to: params.date_to,
      };
    }
    if (params.advanced === "true") params.advanced = "1";
    if (params.advanced === "false") params.advanced = "0";

    return params;
  }, [searchParams]);

  // Derive view states from filters
  const isNonTransactingView = filters.status === "non_transacting";
  const isTopMerchantsView = filters.top_sort && filters.top_sort !== "all";

  // Local buffered state for filters
  const [localFilters, setLocalFilters] =
    useState<Record<string, any>>(filters);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(
    filters.advanced === "1",
  );

  useEffect(() => {
    setLocalFilters(filters);
    setIsAdvancedOpen(filters.advanced === "1");
  }, [filters]);

  const handleLocalFilterChange = (key: string, value: any) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    setSearchParams(() => {
      const next = new URLSearchParams();
      Object.entries(localFilters).forEach(([k, v]) => {
        if (k === "date") {
          if (v && v.preset && v.preset !== "all") {
            next.set("date_preset", v.preset);
            if (v.from) next.set("date_from", v.from);
            if (v.to) next.set("date_to", v.to);
          }
        } else if (v && v !== "all" && k !== "advanced") {
          next.set(k, String(v));
        }
      });
      if (isAdvancedOpen) next.set("advanced", "1");
      return next;
    });
  };

  // Check if local filters differ from applied URL filters
  const hasUnappliedChanges = useMemo(() => {
    const localStr = JSON.stringify(localFilters);
    const appliedStr = JSON.stringify(filters);
    return localStr !== appliedStr;
  }, [localFilters, filters]);

  const handleClearFilters = () => {
    setLocalFilters({});
    setSearchParams({});
  };

  // URL-synced sort state for Top Merchants
  const topSort = filters.top_sort || "amount";

  // Filtered data logic
  const filteredData = useMemo(() => {
    if (!merchants) return [];
    return merchants.filter((item) => {
      // Internal View filter (Handled by Status filter now)

      // Date Filtering
      if (filters.date_preset) {
        const itemDate = new Date(item.onboardingDate);
        const today = new Date();
        let fromDate = new Date(0);
        let toDate = new Date();

        switch (filters.date_preset) {
          case "today":
            fromDate = new Date(today.setHours(0, 0, 0, 0));
            toDate = new Date(today.setHours(23, 59, 59, 999));
            break;
          case "last_day":
            fromDate = new Date(today);
            fromDate.setDate(today.getDate() - 1);
            fromDate.setHours(0, 0, 0, 0);
            toDate = new Date(fromDate);
            toDate.setHours(23, 59, 59, 999);
            break;
          case "7d":
            fromDate = new Date(today);
            fromDate.setDate(today.getDate() - 7);
            break;
          case "30d":
            fromDate = new Date(today);
            fromDate.setDate(today.getDate() - 30);
            break;
          case "custom":
            if (filters.date_from) fromDate = new Date(filters.date_from);
            if (filters.date_to) {
              toDate = new Date(filters.date_to);
              toDate.setHours(23, 59, 59, 999);
            }
            break;
        }
        if (itemDate < fromDate || itemDate > toDate) return false;
      }

      // Other filters
      if (
        filters.name &&
        !item.name.toLowerCase().includes(filters.name.toLowerCase())
      )
        return false;
      if (
        filters.storeId &&
        !item.storeId.toLowerCase().includes(filters.storeId.toLowerCase())
      )
        return false;

      // Enhanced Status logic
      if (filters.status && filters.status !== "all") {
        if (filters.status === "transacting") {
          if (item.isNonTransacting) return false;
        } else if (filters.status === "non_transacting") {
          if (!item.isNonTransacting) return false;
        } else if (filters.status === "recently_onboarded") {
          const onboardingDate = new Date(item.onboardingDate);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          if (onboardingDate < thirtyDaysAgo) return false;
        } else {
          if (item.status !== filters.status) return false;
        }
      }

      if (filters.type && item.type !== filters.type) return false;
      if (
        filters.sector &&
        filters.sector !== "all" &&
        item.sector !== filters.sector
      )
        return false;
      if (
        filters.ownerName &&
        !item.ownerName.toLowerCase().includes(filters.ownerName.toLowerCase())
      )
        return false;
      if (
        filters.contactPhone &&
        !item.contactPhone
          ?.toLowerCase()
          .includes(filters.contactPhone.toLowerCase())
      )
        return false;
      if (
        filters.contactCountry &&
        !item.contactCountry
          ?.toLowerCase()
          .includes(filters.contactCountry.toLowerCase())
      )
        return false;

      if (filters.customerPayTdr && filters.customerPayTdr !== "all") {
        const isTdr = filters.customerPayTdr === "true";
        if (item.customerPayTdr !== isTdr) return false;
      }

      if (
        filters.emiStatus &&
        filters.emiStatus !== "all" &&
        item.emiStatus !== filters.emiStatus
      )
        return false;

      if (filters.settlementStatus && filters.settlementStatus !== "all") {
        const itemSettlement = (item as any).settlementStatus;
        if (
          itemSettlement !== undefined &&
          itemSettlement !== filters.settlementStatus
        )
          return false;
      }

      return true;
    });
  }, [merchants, filters]);

  const displayData = useMemo(() => {
    if (isTopMerchantsView) {
      return [...filteredData]
        .sort((a, b) => {
          if (topSort === "count") return b.txCount7d - a.txCount7d;
          if (topSort === "revenue") return b.revenue7d - a.revenue7d;
          return b.gmv7d - a.gmv7d;
        })
        .slice(0, 10);
    }
    return filteredData;
  }, [filteredData, isTopMerchantsView, topSort]);

  const metrics = useMemo(() => {
    return {
      total: filteredData.length,
      active: filteredData.filter((m) => m.status === "active").length,
      suspended: filteredData.filter((m) => m.status === "suspended").length,
      transacting: filteredData.filter((m) => !m.isNonTransacting).length,
    };
  }, [filteredData]);

  const activeAdvancedCount = advancedFilterConfig.reduce((acc, config) => {
    const val = localFilters[config.key];
    if (val && val !== "all") return acc + 1;
    return acc;
  }, 0);

  const toggleAdvanced = () => {
    setIsAdvancedOpen((prev) => !prev);
  };

  const handleExportCSV = () => {
    if (!displayData.length) return;
    const headers = [
      "Merchant Name",
      "Store ID",
      "KAM",
      "Status",
      "Sector",
      "Type",
      "Onboarding",
      "GMV (7d)",
      "Tx Count (7d)",
      "Success Rate (7d)",
    ];
    const rows = displayData.map((item) => [
      item.name.replace(/,/g, ""),
      item.storeId,
      item.ownerName.replace(/,/g, ""),
      item.status,
      item.sector,
      item.type || "N/A",
      new Date(item.onboardingDate).toLocaleDateString(),
      item.gmv7d,
      item.txCount7d,
      `${item.successRate7d}%`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `merchants_export_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isTopMerchantsView
              ? "Top Merchants"
              : isNonTransactingView
                ? "Non-Transacting Merchants"
                : "Merchants"}
          </h1>
          <p className="text-slate-500 text-sm">
            {isTopMerchantsView
              ? topSort === "count"
                ? "Top 10 merchants by Transaction Count."
                : topSort === "revenue"
                  ? "Top 10 merchants by Revenue Amount."
                  : "Top 10 merchants by Transaction Amount."
              : "Manage all onboarded merchants and their portfolios."}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/merchants/new")}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors shadow-sm"
          >
            Add Merchant
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <FilterBar
            filters={localFilters}
            onFilterChange={handleLocalFilterChange}
            config={primaryFilterConfig}
            layout="grid"
          />

          <button
            onClick={toggleAdvanced}
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors border rounded-full w-fit",
              isAdvancedOpen
                ? "bg-slate-100 text-slate-900 border-slate-200"
                : "bg-white text-slate-600 border-transparent hover:bg-slate-50",
            )}
          >
            Advanced filters
            {activeAdvancedCount > 0 && !isAdvancedOpen && (
              <span className="flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-primary-600 rounded-full">
                {activeAdvancedCount}
              </span>
            )}
            <span
              className={clsx(
                "transition-transform duration-200",
                isAdvancedOpen ? "rotate-180" : "",
              )}
            >
              ▾
            </span>
          </button>

          {!isAdvancedOpen && (
            <button
              onClick={handleApplyFilters}
              disabled={!hasUnappliedChanges}
              className={clsx(
                "flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-full transition-all shadow-sm",
                hasUnappliedChanges
                  ? "bg-primary-600 hover:bg-primary-700 text-white hover:shadow-md active:scale-95"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200",
              )}
            >
              Apply Filters
            </button>
          )}

          {(Object.keys(localFilters).length > 0 || isAdvancedOpen) && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium px-2"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Advanced Filters Panel */}
        <div
          className={clsx(
            "grid transition-all duration-300 ease-in-out px-1 w-full",
            isAdvancedOpen
              ? "grid-rows-[1fr] opacity-100 overflow-visible"
              : "grid-rows-[0fr] opacity-0 overflow-hidden",
          )}
        >
          <div className="min-h-0">
            <div className="pt-1.5 border-t border-slate-100/50">
              <div className="flex flex-wrap items-center gap-3">
                <FilterBar
                  filters={localFilters}
                  onFilterChange={handleLocalFilterChange}
                  config={advancedFilterConfig}
                />
                {isAdvancedOpen && (
                  <button
                    onClick={handleApplyFilters}
                    disabled={!hasUnappliedChanges}
                    className={clsx(
                      "flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-full transition-all shadow-sm",
                      hasUnappliedChanges
                        ? "bg-primary-600 hover:bg-primary-700 text-white hover:shadow-md active:scale-95"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200",
                    )}
                  >
                    <Search className="w-4 h-4" />
                    Apply Filters
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Overview Section */}
        <div className="flex flex-col gap-4 pt-6">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
            Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              title="Total Merchants"
              value={metrics.total.toString()}
            />
            <MetricCard
              title="Active Merchants"
              value={metrics.active.toString()}
            />
            <MetricCard
              title="Transacting Merchant"
              value={metrics.transacting.toString()}
            />
            <MetricCard
              title="Suspended"
              value={metrics.suspended.toString()}
            />
          </div>
        </div>

        {/* Table Section */}
        <div className="pt-6">
          {isLoading ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-8 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={displayData}
              hideToolbarDateFilter={true}
              viewButtonLabel="View Column"
              toolbarEndContent={
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors shadow-sm">
                    <Sheet className="w-4 h-4" />
                    EMI Info
                  </button>
                  <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors shadow-sm">
                    <Sheet className="w-4 h-4" />
                    TP Info
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    Export
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              }
              filterActions={
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-slate-900 ml-1">
                    {isTopMerchantsView
                      ? "Top 10 Merchants"
                      : "Showing merchants data"}
                  </h2>
                </div>
              }
            />
          )}
        </div>
      </div>
      {/* Nested Routes Render Here (The Drawer) */}
      <Outlet />
      {/* Store View Gateway Drawer */}
      <MerchantViewGatewayDrawer
        merchant={selectedGatewayMerchant}
        onClose={() => setSelectedGatewayMerchant(null)}
      />

      <MerchantManageGatewayDrawer
        merchant={selectedManageGatewayMerchant}
        onClose={() => setSelectedManageGatewayMerchant(null)}
      />
    </div>
  );
}
