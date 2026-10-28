import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { clsx } from "clsx";
import { Download, Eye, History, ClipboardList, Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, Outlet, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { CopyButton } from "../../components/CopyButton";
import { DataTable } from "../../components/DataTable";
import {
  FilterBar,
  ClearAllFiltersButton,
  type FilterConfig,
} from "../../components/FilterBar";
import { Tooltip as UITooltip } from "../../components/Tooltip";
import { Modal } from "../../components/Modal";
import { api } from "../../lib/api/client";
import { CommissionHistoryDrawer } from "./CommissionHistoryDrawer";
import { SettlementSummaryDrawer } from "./SettlementSummaryDrawer";
import type { ApReseller } from "./types/apReseller";
import {
  BASE_RESELLER_FILTER_CONFIG,
  SETTLEMENT_PERIOD_FILTER_OPTIONS,
} from "./utils/resellerFilterConfig";
import {
  buildFilterSearchParams,
  matchesDateRange,
  parseUrlFilters,
} from "./utils/resellerListFilters";
import { formatResellerDate } from "./utils/resellerDateFormat";

const actionButtonClass = "flex flex-col items-center gap-0 group";
const iconWrapClass =
  "pt-1.5 px-1.5 pb-0 hover:bg-slate-100 rounded text-slate-400 group-hover:text-primary-600 transition-colors";
const actionLabelClass =
  "text-[9px] font-medium text-slate-500 group-hover:text-primary-600 transition-colors";

const AP_RA_STATUS_FILTER_OPTIONS = [
  { label: "All Statuses", value: "all" },
  { label: "Not Requested", value: "Not Requested" },
  { label: "Pending", value: "Pending" },
  { label: "Approved", value: "Approved" },
  { label: "Rejected", value: "Rejected" },
  { label: "Settlement Initiate", value: "Settlement Initiate" },
  { label: "Settlement Done", value: "Settlement Done" },
];

const filterConfig: FilterConfig[] = [
  ...BASE_RESELLER_FILTER_CONFIG,
  {
    key: "raApprovalStatus",
    type: "select",
    label: "Status",
    options: AP_RA_STATUS_FILTER_OPTIONS,
  },
  {
    key: "settlementPeriod",
    type: "select",
    label: "Settlement Period",
    options: SETTLEMENT_PERIOD_FILTER_OPTIONS,
  },
];

export default function ApResellersListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => parseUrlFilters(searchParams), [searchParams]);
  const [localFilters, setLocalFilters] =
    useState<Record<string, unknown>>(filters);
  const [isCommissionHistoryOpen, setIsCommissionHistoryOpen] = useState(false);
  const [isSettlementSummaryOpen, setIsSettlementSummaryOpen] = useState(false);
  const [selectedReseller, setSelectedReseller] = useState<ApReseller | null>(
    null,
  );
  const [selectedResellerIds, setSelectedResellerIds] = useState<string[]>([]);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);

  const queryClient = useQueryClient();

  const bulkInitiateMutation = useMutation({
    mutationFn: async () => {
      for (const id of selectedResellerIds) {
        await api.apResellers.initiateSettlement(id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ap-resellers-list"] });
      toast.success(
        `Email sent to bank for ${selectedResellerIds.length} ${selectedResellerIds.length === 1 ? "company" : "companies"} successfully`,
      );
      setSelectedResellerIds([]);
      setIsBulkConfirmOpen(false);
    },
    onError: () => {
      toast.error("Failed to initiate bulk settlement");
    },
  });

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const { data: apResellers = [] } = useQuery({
    queryKey: ["ap-resellers-list"],
    queryFn: () => api.apResellers.list(),
  });

  const handleFilterChange = (key: string, value: unknown) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setSearchParams(buildFilterSearchParams(localFilters));
  };

  const clearFilters = () => {
    setLocalFilters({});
    setSearchParams(new URLSearchParams());
  };

  const filteredData = useMemo(() => {
    const datePreset =
      typeof filters.date_preset === "string" ? filters.date_preset : undefined;
    const dateFrom =
      typeof filters.date_from === "string" ? filters.date_from : undefined;
    const dateTo =
      typeof filters.date_to === "string" ? filters.date_to : undefined;
    const resellerId =
      typeof filters.resellerId === "string" ? filters.resellerId : undefined;
    const name = typeof filters.name === "string" ? filters.name : undefined;
    const sector =
      typeof filters.sector === "string" ? filters.sector : undefined;
    const settlementPeriod =
      typeof filters.settlementPeriod === "string"
        ? filters.settlementPeriod
        : undefined;
    const raApprovalStatus =
      typeof filters.raApprovalStatus === "string"
        ? filters.raApprovalStatus
        : undefined;

    return apResellers.filter((item) => {
      if (
        !matchesDateRange(item.onboardingDate, datePreset, dateFrom, dateTo)
      ) {
        return false;
      }

      const matchesResellerId =
        !resellerId ||
        item.resellerId.toLowerCase().includes(resellerId.toLowerCase());
      const matchesName =
        !name || item.name.toLowerCase().includes(name.toLowerCase());
      const matchesSector =
        !sector || sector === "all" || item.sector === sector;
      const matchesSettlementPeriod =
        !settlementPeriod ||
        settlementPeriod === "all" ||
        item.settlementPeriod === settlementPeriod;
      const matchesStatus =
        !raApprovalStatus ||
        raApprovalStatus === "all" ||
        item.raApprovalStatus === raApprovalStatus;

      return (
        matchesResellerId &&
        matchesName &&
        matchesSector &&
        matchesSettlementPeriod &&
        matchesStatus
      );
    });
  }, [apResellers, filters]);

  function getApApprovalStatusBadgeClass(status: string) {
    switch (status) {
      case "Approved":
        return "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-100 whitespace-nowrap";
      case "Pending":
        return "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-600 border border-amber-100 whitespace-nowrap";
      case "Rejected":
        return "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-600 border border-rose-100 whitespace-nowrap";
      case "Settlement Initiate":
        return "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600 border border-indigo-100 whitespace-nowrap";
      case "Settlement Done":
        return "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap";
      default:
        return "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap";
    }
  }

  const handleExportCSV = () => {
    if (!filteredData.length) return;

    const headers = [
      "Company Name",
      "Sector",
      "POC",
      "Settlement Date",
      "Settlement Period",
      "Status",
    ];

    const rows = filteredData.map((item) => [
      item.name.replace(/,/g, ""),
      item.sector,
      item.pocName,
      formatResellerDate(item.onboardingDate),
      item.settlementPeriod,
      item.raApprovalStatus,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `ap_resellers_export_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = useMemo<ColumnDef<ApReseller>[]>(
    () => [
      {
        id: "select",
        header: () => {
          const approvedRows = filteredData.filter(
            (r) => r.raApprovalStatus === "Approved",
          );
          const allApprovedSelected =
            approvedRows.length > 0 &&
            approvedRows.every((r) => selectedResellerIds.includes(r.id));
          const isSomeApprovedSelected =
            approvedRows.some((r) => selectedResellerIds.includes(r.id)) &&
            !allApprovedSelected;

          return (
            <div
              className="flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                checked={allApprovedSelected}
                ref={(input) => {
                  if (input) input.indeterminate = isSomeApprovedSelected;
                }}
                disabled={approvedRows.length === 0}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedResellerIds(approvedRows.map((r) => r.id));
                  } else {
                    setSelectedResellerIds([]);
                  }
                }}
                title={
                  approvedRows.length === 0
                    ? "No approved resellers available"
                    : "Select all approved resellers"
                }
              />
            </div>
          );
        },
        cell: ({ row }) => {
          const isApproved = row.original.raApprovalStatus === "Approved";
          const isSelected = selectedResellerIds.includes(row.original.id);

          return (
            <div
              className="flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                checked={isSelected}
                disabled={!isApproved}
                onChange={(e) => {
                  e.stopPropagation();
                  if (e.target.checked) {
                    setSelectedResellerIds((prev) => [
                      ...prev,
                      row.original.id,
                    ]);
                  } else {
                    setSelectedResellerIds((prev) =>
                      prev.filter((id) => id !== row.original.id),
                    );
                  }
                }}
              />
            </div>
          );
        },
        size: 40,
      },
      {
        id: "index",
        header: "#",
        cell: ({ row }) => (
          <span className="text-xs text-slate-500">{row.index + 1}</span>
        ),
        size: 50,
      },
      {
        accessorKey: "name",
        header: "Company Name",
        cell: ({ row }) => (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-slate-900 leading-tight">
              {row.original.name}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono p-1 bg-slate-50 border border-slate-100 rounded leading-none text-slate-500">
                {row.original.resellerId}
              </span>
              <CopyButton value={row.original.resellerId} />
            </div>
          </div>
        ),
      },
      {
        accessorKey: "sector",
        header: "Sector",
        cell: ({ row }) => (
          <span className="text-xs text-slate-600">{row.original.sector}</span>
        ),
      },
      {
        accessorKey: "pocName",
        header: "POC",
        cell: ({ row }) => (
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-slate-600">
              {row.original.pocName}
            </span>
            <span className="text-[11px] text-slate-500">
              {row.original.pocPhone}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "onboardingDate",
        header: "Settlement Date",
        cell: ({ row }) => (
          <span className="text-xs text-slate-600">
            {formatResellerDate(row.original.onboardingDate)}
          </span>
        ),
      },
      {
        accessorKey: "settlementPeriod",
        header: "Settlement Period",
        cell: ({ row }) => (
          <span className="text-xs font-medium text-slate-700">
            {row.original.settlementPeriod}
          </span>
        ),
      },
      {
        accessorKey: "raApprovalStatus",
        header: "Status",
        cell: ({ row }) => (
          <span
            className={getApApprovalStatusBadgeClass(
              row.original.raApprovalStatus,
            )}
          >
            {row.original.raApprovalStatus}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Action",
        cell: ({ row }) => (
          <div className="flex items-center gap-3 whitespace-nowrap">
            <UITooltip content="Details">
              <Link
                to={`/resellers/ap-list/${row.original.id}`}
                onClick={(e) => e.stopPropagation()}
                className={actionButtonClass}
              >
                <div className={iconWrapClass}>
                  <Eye className="w-3.5 h-3.5" />
                </div>
                <span className={actionLabelClass}>Details</span>
              </Link>
            </UITooltip>
            <UITooltip content="History">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedReseller(row.original);
                  setIsCommissionHistoryOpen(true);
                }}
                className={actionButtonClass}
              >
                <div className={iconWrapClass}>
                  <History className="w-3.5 h-3.5" />
                </div>
                <span className={actionLabelClass}>History</span>
              </button>
            </UITooltip>
            {(row.original.raApprovalStatus === "Approved" ||
              row.original.raApprovalStatus === "Settlement Initiate" ||
              row.original.raApprovalStatus === "Settlement Done") && (
              <UITooltip content="Settlement Summary">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedReseller(row.original);
                    setIsSettlementSummaryOpen(true);
                  }}
                  className={actionButtonClass}
                >
                  <div className={iconWrapClass}>
                    <ClipboardList className="w-3.5 h-3.5" />
                  </div>
                  <span className={actionLabelClass}>Settlement</span>
                </button>
              </UITooltip>
            )}
          </div>
        ),
      },
    ],
    [navigate, filteredData, selectedResellerIds],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">AP Resellers List</h1>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <FilterBar
          filters={localFilters}
          onFilterChange={handleFilterChange}
          config={filterConfig}
        />

        <button
          onClick={applyFilters}
          disabled={JSON.stringify(localFilters) === JSON.stringify(filters)}
          className={clsx(
            "flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-full transition-all shadow-sm ml-2",
            JSON.stringify(localFilters) !== JSON.stringify(filters)
              ? "bg-primary-600 hover:bg-primary-700 text-white"
              : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200",
          )}
        >
          Apply Filters
        </button>
        <ClearAllFiltersButton onClick={clearFilters} filters={localFilters} />
      </div>

      <div className="pt-6">
        <DataTable
          columns={columns}
          data={filteredData}
          onRowClick={(row) => navigate(`/resellers/ap-list/${row.id}`)}
          hideToolbarDateFilter
          toolbarEndContent={
            <div className="flex items-center gap-2">
              {selectedResellerIds.length > 0 && (
                <button
                  onClick={() => setIsBulkConfirmOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-white bg-primary-600 rounded hover:bg-primary-700 transition-colors shadow-sm cursor-pointer animate-fade-in"
                >
                  <Send className="w-4 h-4" />
                  Send Email to Bank ({selectedResellerIds.length})
                </button>
              )}
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
                Showing AP resellers data
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 rounded-full border border-slate-200">
                {filteredData.length}
              </span>
            </div>
          }
        />
      </div>

      <Outlet />

      <CommissionHistoryDrawer
        open={isCommissionHistoryOpen}
        onClose={() => {
          setIsCommissionHistoryOpen(false);
          setSelectedReseller(null);
        }}
        resellerName={selectedReseller?.name}
        resellerId={selectedReseller?.resellerId}
        status={selectedReseller?.raApprovalStatus}
      />

      <SettlementSummaryDrawer
        open={isSettlementSummaryOpen}
        onClose={() => {
          setIsSettlementSummaryOpen(false);
          setSelectedReseller(null);
        }}
        resellerName={selectedReseller?.name}
        resellerId={selectedReseller?.resellerId}
      />

      {/* Bulk Confirm Modal */}
      <Modal
        isOpen={isBulkConfirmOpen}
        onClose={() => setIsBulkConfirmOpen(false)}
        title="Confirm Bulk Settlement Email"
        footer={
          <>
            <button
              type="button"
              className="px-4 py-2 text-sm font-semibold border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              onClick={() => setIsBulkConfirmOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={bulkInitiateMutation.isPending}
              className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors cursor-pointer"
              onClick={() => bulkInitiateMutation.mutate()}
            >
              {bulkInitiateMutation.isPending
                ? "Sending..."
                : "Confirm & Send All"}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-slate-600 text-sm leading-relaxed">
            Are you sure you want to send settlement detail emails to Bank for{" "}
            <strong>
              {selectedResellerIds.length} selected{" "}
              {selectedResellerIds.length === 1 ? "company" : "companies"}
            </strong>
            ?
          </p>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 max-h-40 overflow-y-auto space-y-1 text-xs font-semibold text-slate-800">
            {selectedResellerIds.map((id) => {
              const item = apResellers.find((r) => r.id === id);
              return (
                <div
                  key={id}
                  className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0"
                >
                  <span>{item?.name || id}</span>
                  <span className="text-slate-500 font-mono text-[11px]">
                    {item?.resellerId}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-slate-500">
            This action will initiate settlement and update all their statuses
            to <strong>"Settlement Initiate"</strong>.
          </p>
        </div>
      </Modal>
    </div>
  );
}
