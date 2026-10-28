import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import {
  AlertCircle,
  ArrowLeftRight,
  Download,
  Eye,
  Info,
  Search,
} from "lucide-react";
import { clsx } from "clsx";
import toast from "react-hot-toast";
import { CopyButton } from "../../components/CopyButton";
import { DataTable } from "../../components/DataTable";
import { Drawer } from "../../components/Drawer";
import type { FilterConfig } from "../../components/FilterBar";
import { FilterBar } from "../../components/FilterBar";
import { MetricCard } from "../../components/MetricCard";
import { Skeleton } from "../../components/Skeleton";
import { Tooltip as UITooltip } from "../../components/Tooltip";

type AdjustmentStatus = "Success" | "Cancelled" | "Pending";
type AdjustmentType = "add" | "withdrawal";

interface ReverseAdjustmentRecord {
  id: string;
  date: string;
  referId: string;
  fund: number;
  source: string;
  type: AdjustmentType;
  storeId: string;
  status: AdjustmentStatus;
  chequeRefCode?: string;
  requestedOn?: string;
  requestedRemarks?: string;
  requestedBy?: string;
  approvalRemarks?: string;
  approvedBy?: string;
  approvedOn?: string;
  chequeDate?: string;
  withdrawalStatus?: string;
  withdrawalBy?: string;
  withdrawalOn?: string;
  reverseAdjustId?: string;
  reverseAdjustRef?: string;
  reverseAdjusted?: string;
  merchantName?: string;
  depositedBankName?: string;
}

const MOCK_RECORDS: ReverseAdjustmentRecord[] = [
  {
    id: "1",
    date: "2025-10-24",
    referId: "REF00001",
    fund: 5000,
    source: "security",
    type: "add",
    storeId: "edumanbdlive",
    status: "Success",
    chequeRefCode: "CHQ-1001",
    requestedOn: "2025-04-23 23:23:13",
    requestedRemarks: "test security fund",
    requestedBy: "Admin",
    approvedBy: "Admin",
    chequeDate: "2025-04-23 00:00:00",
    depositedBankName: "AB BANK LIMITED",
  },
  {
    id: "2",
    date: "2025-10-24",
    referId: "FUND697AE6F02B2E8",
    fund: 1000000,
    source: "credit",
    type: "add",
    storeId: "demotest",
    status: "Success",
    chequeRefCode: "CHQ-1002",
  },
  {
    id: "3",
    date: "2023-10-24",
    referId: "REF00002",
    fund: 5000,
    source: "security",
    type: "add",
    storeId: "edumanbdlive",
    status: "Cancelled",
    chequeRefCode: "CHQ-1003",
  },
  {
    id: "4",
    date: "2023-10-24",
    referId: "FUND653801A9A0CAC",
    fund: 1000,
    source: "dTFyQWlzZW51cml0eXUxc kFp",
    type: "withdrawal",
    storeId: "demotest",
    status: "Success",
    chequeRefCode: "CHQ-1004",
  },
  {
    id: "5",
    date: "2023-10-24",
    referId: "REF00003",
    fund: 1000,
    source: "security",
    type: "add",
    storeId: "usbanglaairlines02live",
    status: "Pending",
    chequeRefCode: "CHQ-1005",
  },
  {
    id: "6",
    date: "2023-10-24",
    referId: "FUND6968FFFB5D561",
    fund: 1000,
    source: "credit",
    type: "add",
    storeId: "google41live",
    status: "Success",
    chequeRefCode: "CHQ-1006",
  },
  {
    id: "7",
    date: "2023-10-20",
    referId: "REF00004",
    fund: 2500,
    source: "security",
    type: "withdrawal",
    storeId: "google41live",
    status: "Pending",
    chequeRefCode: "CHQ-1007",
  },
  {
    id: "8",
    date: "2023-10-18",
    referId: "FUND653801A9A0CAD",
    fund: 7500,
    source: "credit",
    type: "add",
    storeId: "demotest",
    status: "Pending",
    chequeRefCode: "CHQ-1008",
  },
];

const primaryFilterConfig: FilterConfig[] = [
  { key: "date", type: "date-range", label: "Search Date" },
  { key: "referenceNo", type: "input", label: "Reference No" },
  { key: "storeId", type: "input", label: "Store ID" },
];

const advancedFilterConfig: FilterConfig[] = [
  {
    key: "sourceOfFund",
    type: "select",
    label: "Source of Fund",
    options: [
      { label: "Select one", value: "all" },
      { label: "Security", value: "security" },
      { label: "Credit", value: "credit" },
    ],
  },
  {
    key: "actionType",
    type: "select",
    label: "Action type",
    options: [
      { label: "Select one", value: "all" },
      { label: "Add", value: "add" },
      { label: "Withdrawal", value: "withdrawal" },
    ],
  },
  {
    key: "approvalStatus",
    type: "select",
    label: "Approval Status",
    options: [
      { label: "Select one", value: "all" },
      { label: "Success", value: "Success" },
      { label: "Cancelled", value: "Cancelled" },
      { label: "Pending", value: "Pending" },
    ],
  },
  { key: "chequeRefCode", type: "input", label: "Cheque Ref. Code" },
];

function getStatusBadgeClass(status: AdjustmentStatus) {
  switch (status) {
    case "Success":
      return "bg-emerald-50 text-emerald-600";
    case "Cancelled":
      return "bg-rose-50 text-rose-600";
    case "Pending":
      return "bg-amber-50 text-amber-600";
    default:
      return "bg-slate-100 text-slate-500";
  }
}

function formatFundAmount(value: number) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) => (
  <div className="flex flex-col sm:flex-row sm:items-start py-3 text-sm">
    <dt className="w-full sm:w-1/3 text-slate-500 font-medium">{label}</dt>
    <dd className="w-full sm:w-2/3 text-slate-900 break-all">
      {value !== undefined && value !== null && value !== ""
        ? value
        : "Not Assigned"}
    </dd>
  </div>
);

export default function ReverseAdjustmentAmountPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedRecord, setSelectedRecord] =
    useState<ReverseAdjustmentRecord | null>(null);
  const [adjustRecord, setAdjustRecord] =
    useState<ReverseAdjustmentRecord | null>(null);
  const [withdrawalDescription, setWithdrawalDescription] = useState("");
  const [withdrawalError, setWithdrawalError] = useState("");

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

  const handleClearFilters = () => {
    setLocalFilters({});
    setSearchParams({});
  };

  const hasUnappliedChanges = useMemo(() => {
    const localStr = JSON.stringify(localFilters);
    const appliedStr = JSON.stringify(filters);
    return localStr !== appliedStr;
  }, [localFilters, filters]);

  const activeAdvancedCount = advancedFilterConfig.reduce((acc, config) => {
    const val = localFilters[config.key];
    if (val && val !== "all") return acc + 1;
    return acc;
  }, 0);

  const toggleAdvanced = () => {
    setIsAdvancedOpen((prev) => !prev);
  };

  const filteredData = useMemo(() => {
    return MOCK_RECORDS.filter((item) => {
      if (filters.date_preset) {
        const itemDate = new Date(item.date);
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

      if (
        filters.referenceNo &&
        !item.referId.toLowerCase().includes(filters.referenceNo.toLowerCase())
      ) {
        return false;
      }

      if (
        filters.storeId &&
        !item.storeId.toLowerCase().includes(filters.storeId.toLowerCase())
      ) {
        return false;
      }

      if (
        filters.sourceOfFund &&
        filters.sourceOfFund !== "all" &&
        !item.source.toLowerCase().includes(filters.sourceOfFund.toLowerCase())
      ) {
        return false;
      }

      if (
        filters.actionType &&
        filters.actionType !== "all" &&
        item.type !== filters.actionType
      ) {
        return false;
      }

      if (
        filters.approvalStatus &&
        filters.approvalStatus !== "all" &&
        item.status !== filters.approvalStatus
      ) {
        return false;
      }

      if (
        filters.chequeRefCode &&
        !item.chequeRefCode
          ?.toLowerCase()
          .includes(filters.chequeRefCode.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }, [filters]);

  const metrics = useMemo(
    () => ({
      securityFund: "6,554.10K",
      creditAdded: "500.00K",
      totalWithdrawal: "6,542.00K",
      pending: filteredData.filter((item) => item.status === "Pending").length,
    }),
    [filteredData],
  );

  const handleExportCSV = () => {
    if (!filteredData.length) return;

    const headers = [
      "Date",
      "Refer ID",
      "Fund",
      "Source",
      "Type",
      "Store ID",
      "Status",
    ];
    const rows = filteredData.map((item) => [
      item.date,
      item.referId,
      formatFundAmount(item.fund),
      item.source,
      item.type,
      item.storeId,
      item.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute(
      "download",
      `reverse_adjustment_export_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = useMemo<ColumnDef<ReverseAdjustmentRecord>[]>(
    () => [
      {
        header: "Refer ID",
        accessorKey: "referId",
        cell: ({ row }) => (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-slate-900 leading-tight break-all">
              {row.original.referId}
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
        header: "Date",
        accessorKey: "date",
        cell: ({ row }) => (
          <span className="text-xs font-medium text-slate-600">
            {row.original.date}
          </span>
        ),
      },
      {
        header: "Fund",
        accessorKey: "fund",
        cell: ({ row }) => (
          <span className="text-xs font-medium text-slate-600">
            {formatFundAmount(row.original.fund)}
          </span>
        ),
      },
      {
        header: "Source",
        accessorKey: "source",
        cell: ({ row }) => (
          <span className="text-xs font-medium text-slate-600 break-all">
            {row.original.source}
          </span>
        ),
      },
      {
        header: "Type",
        accessorKey: "type",
        cell: ({ row }) => (
          <span className="text-xs font-medium text-slate-600 capitalize">
            {row.original.type}
          </span>
        ),
      },
      {
        header: "Store ID",
        accessorKey: "storeId",
        cell: ({ row }) => (
          <span className="text-xs font-medium text-slate-600">
            {row.original.storeId}
          </span>
        ),
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ row }) => (
          <span
            className={clsx(
              "px-2 py-0.5 rounded-full text-xs font-medium capitalize whitespace-nowrap inline-block",
              getStatusBadgeClass(row.original.status),
            )}
          >
            {row.original.status}
          </span>
        ),
      },
      {
        id: "action",
        header: "Action",
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            {row.original.type === "add" ? (
              <UITooltip content="Adjust/Withdrawal">
                <button
                  type="button"
                  onClick={() => setAdjustRecord(row.original)}
                  className="flex flex-col items-center gap-0 group"
                >
                  <div className="pt-1.5 px-1.5 pb-0 hover:bg-slate-100 rounded text-slate-400 group-hover:text-primary-600 transition-colors">
                    <ArrowLeftRight className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-medium text-slate-500 group-hover:text-primary-600 transition-colors">
                    Adjust
                  </span>
                </button>
              </UITooltip>
            ) : (
              <span className="text-slate-400 px-1">-</span>
            )}
          </div>
        ),
      },
      {
        id: "view",
        header: "View",
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <UITooltip content="Details">
              <button
                type="button"
                onClick={() => setSelectedRecord(row.original)}
                className="flex flex-col items-center gap-0 group"
              >
                <div className="pt-1.5 px-1.5 pb-0 hover:bg-slate-100 rounded text-slate-400 group-hover:text-primary-600 transition-colors">
                  <Eye className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-medium text-slate-500 group-hover:text-primary-600 transition-colors">
                  Details
                </span>
              </button>
            </UITooltip>
          </div>
        ),
      },
    ],
    [],
  );

  const isLoading = false;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Reverse Adjustment Amount
          </h1>
          <p className="text-slate-500 text-sm">
            Review security fund, credit, and withdrawal adjustment records.
          </p>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <FilterBar
            filters={localFilters}
            onFilterChange={handleLocalFilterChange}
            config={primaryFilterConfig}
            layout="grid"
          />

          <button
            type="button"
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
              type="button"
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
              type="button"
              onClick={handleClearFilters}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium px-2"
            >
              Clear all
            </button>
          )}
        </div>

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
                    type="button"
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

        <div className="flex flex-col gap-4 pt-6">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
            Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard title="Security Fund" value={metrics.securityFund} />
            <MetricCard title="Credit Added" value={metrics.creditAdded} />
            <MetricCard
              title="Total Withdrawal"
              value={metrics.totalWithdrawal}
            />
            <MetricCard title="Pending" value={metrics.pending.toString()} />
          </div>
        </div>

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
              data={filteredData}
              hideToolbarDateFilter
              viewButtonLabel="View Column"
              toolbarEndContent={
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors shadow-sm"
                >
                  Export
                  <Download className="w-4 h-4" />
                </button>
              }
              filterActions={
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-slate-900 ml-1">
                    Showing reverse adjustment data
                  </h2>
                </div>
              }
            />
          )}
        </div>
      </div>

      {(() => {
        const customTitle = selectedRecord ? (
          <div className="flex flex-col gap-1 font-normal">
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold text-slate-900 leading-tight">
                {selectedRecord.referId}
              </span>
              <span
                className={clsx(
                  "px-2 py-0.5 rounded-full text-xs font-medium capitalize whitespace-nowrap inline-block",
                  getStatusBadgeClass(selectedRecord.status),
                )}
              >
                {selectedRecord.status}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-normal flex items-center gap-1 mt-0.5">
              <span>Store ID: {selectedRecord.storeId}</span>
              <CopyButton value={selectedRecord.storeId} />
              {selectedRecord.source && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 uppercase tracking-wider ml-1.5">
                  {selectedRecord.source}
                </span>
              )}
            </div>
          </div>
        ) : (
          "Adjustment Details"
        );

        return (
          <Drawer
            open={!!selectedRecord}
            onClose={() => setSelectedRecord(null)}
            title={customTitle}
            width="xl"
          >
            {selectedRecord && (
              <div className="space-y-8 pb-8">
                <section>
                  <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">
                    Fund & Store Information
                  </h3>
                  <div className="bg-white rounded-lg border border-slate-200 px-4 divide-y divide-slate-100">
                    <DetailRow
                      label="Reference No"
                      value={selectedRecord.referId}
                    />
                    <DetailRow
                      label="Store ID"
                      value={selectedRecord.storeId}
                    />
                    <DetailRow
                      label="Fund Amount"
                      value={`৳${formatFundAmount(selectedRecord.fund)}`}
                    />
                    <DetailRow
                      label="Source of Fund"
                      value={selectedRecord.source}
                    />
                    <DetailRow
                      label="Fund Status"
                      value={selectedRecord.type}
                    />
                  </div>
                </section>

                <section>
                  <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">
                    Request Details
                  </h3>
                  <div className="bg-white rounded-lg border border-slate-200 px-4 divide-y divide-slate-100">
                    <DetailRow
                      label="Requested On"
                      value={selectedRecord.requestedOn}
                    />
                    <DetailRow
                      label="Requested Remarks"
                      value={selectedRecord.requestedRemarks}
                    />
                    <DetailRow
                      label="Requested by"
                      value={selectedRecord.requestedBy}
                    />
                  </div>
                </section>

                <section>
                  <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">
                    Approval Information
                  </h3>
                  <div className="bg-white rounded-lg border border-slate-200 px-4 divide-y divide-slate-100">
                    <DetailRow
                      label="Approval Status"
                      value={selectedRecord.status}
                    />
                    <DetailRow
                      label="Approval Remarks"
                      value={selectedRecord.approvalRemarks}
                    />
                    <DetailRow
                      label="Approved By"
                      value={selectedRecord.approvedBy}
                    />
                    <DetailRow
                      label="Approved On"
                      value={selectedRecord.approvedOn}
                    />
                  </div>
                </section>

                <section>
                  <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">
                    Cheque Details
                  </h3>
                  <div className="bg-white rounded-lg border border-slate-200 px-4 divide-y divide-slate-100">
                    <DetailRow
                      label="Cheque Ref"
                      value={selectedRecord.chequeRefCode}
                    />
                    <DetailRow
                      label="Cheque Date"
                      value={selectedRecord.chequeDate}
                    />
                  </div>
                </section>

                <section>
                  <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">
                    Withdrawal & Reverse Adjustment
                  </h3>
                  <div className="bg-white rounded-lg border border-slate-200 px-4 divide-y divide-slate-100">
                    <DetailRow
                      label="Withdrawal Status"
                      value={selectedRecord.withdrawalStatus || "No"}
                    />
                    <DetailRow
                      label="Withdrawal By"
                      value={selectedRecord.withdrawalBy}
                    />
                    <DetailRow
                      label="Withdrawal on"
                      value={selectedRecord.withdrawalOn}
                    />
                    <DetailRow
                      label="Reverse Adjust ID"
                      value={selectedRecord.reverseAdjustId || "0"}
                    />
                    <DetailRow
                      label="Reverse Adjust Ref"
                      value={selectedRecord.reverseAdjustRef}
                    />
                    <DetailRow
                      label="Reverse Adjusted"
                      value={selectedRecord.reverseAdjusted || "no"}
                    />
                  </div>
                </section>
              </div>
            )}
          </Drawer>
        );
      })()}

      {(() => {
        const customAdjustTitle = adjustRecord ? (
          <div className="flex flex-col gap-1 font-normal">
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold text-slate-900 leading-tight">
                Adjust / Withdrawal Fund
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-600 uppercase tracking-wider">
                Pending Action
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-normal flex items-center gap-1 mt-0.5">
              <span>Refer ID: {adjustRecord.referId}</span>
              <CopyButton value={adjustRecord.referId} />
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 uppercase tracking-wider ml-1.5">
                Store ID: {adjustRecord.storeId}
              </span>
            </div>
          </div>
        ) : (
          "Adjust / Withdrawal"
        );

        return (
          <Drawer
            open={!!adjustRecord}
            onClose={() => {
              setAdjustRecord(null);
              setWithdrawalDescription("");
              setWithdrawalError("");
            }}
            title={customAdjustTitle}
            width="xl"
          >
            {adjustRecord && (
              <div className="space-y-8 pb-8">
                {/* Section 1: Summary Card */}
                <div>
                  <div className="flex items-center gap-3 mb-4 pb-2 border-b border-slate-100">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                      Adjustment & Deposit Summary
                    </h3>
                  </div>
                  <div className="bg-white rounded-lg border border-slate-200 px-4 divide-y divide-slate-100">
                    <DetailRow
                      label="Merchant Name"
                      value={adjustRecord.merchantName || "demotest"}
                    />
                    <DetailRow label="Store ID" value={adjustRecord.storeId} />
                    <DetailRow label="Refer ID" value={adjustRecord.referId} />
                    <DetailRow
                      label="Fund Amount"
                      value={`৳${formatFundAmount(adjustRecord.fund)}`}
                    />
                    <DetailRow
                      label="Source of Fund"
                      value={adjustRecord.source || "Reverse Adjustment Amount"}
                    />
                    <DetailRow
                      label="Description"
                      value={
                        adjustRecord.requestedRemarks || "test security fund"
                      }
                    />
                    <DetailRow
                      label="Deposited Bank Name"
                      value={
                        adjustRecord.depositedBankName || "AB BANK LIMITED"
                      }
                    />
                    <DetailRow
                      label="Deposited Cheque No"
                      value={adjustRecord.chequeRefCode || "REF000111"}
                    />
                    <DetailRow
                      label="Deposit Date"
                      value={adjustRecord.chequeDate || "2025-04-23 00:00:00"}
                    />
                  </div>
                </div>

                {/* Section 2: Withdrawal Action Input */}
                <div>
                  <div className="flex items-center gap-3 mb-4 pb-2 border-b border-slate-100">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                      Process Withdrawal
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <div className="mb-4">
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                        Withdrawal Description / Remarks{" "}
                        <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Enter reason or details for withdrawing the fund..."
                        value={withdrawalDescription}
                        onFocus={() => {
                          if (withdrawalError) setWithdrawalError("");
                        }}
                        onChange={(e) => {
                          setWithdrawalDescription(e.target.value);
                          if (withdrawalError) setWithdrawalError("");
                        }}
                        className={clsx(
                          "w-full px-3 py-2 text-sm bg-white border rounded-lg focus:ring-2 outline-none transition-all resize-none",
                          withdrawalError
                            ? "border-rose-400 focus:ring-rose-500"
                            : "border-slate-200 focus:border-primary-500 focus:ring-primary-500",
                        )}
                      />
                      {!withdrawalError && (
                        <p className="mt-1 text-[11px] text-slate-500 italic flex items-center gap-1 leading-normal">
                          <Info className="w-3 h-3 flex-shrink-0" />
                          Provide a valid description for audit records before
                          submitting withdrawal.
                        </p>
                      )}
                      {withdrawalError && (
                        <p className="mt-1 text-[11px] text-rose-500 flex items-center gap-1 font-medium">
                          <AlertCircle className="w-3 h-3 flex-shrink-0" />
                          {withdrawalError}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustRecord(null);
                      setWithdrawalDescription("");
                      setWithdrawalError("");
                    }}
                    className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!withdrawalDescription.trim()) {
                        setWithdrawalError(
                          "Withdrawal description is required",
                        );
                        return;
                      }
                      toast.success(
                        "Withdrawal request submitted successfully.",
                      );
                      setAdjustRecord(null);
                      setWithdrawalDescription("");
                      setWithdrawalError("");
                    }}
                    className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-semibold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    Withdrawal the fund
                  </button>
                </div>
              </div>
            )}
          </Drawer>
        );
      })()}
    </div>
  );
}
