import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { clsx } from "clsx";
import { Download, Eye, History, CheckCircle } from "lucide-react";
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
import type { RaReseller } from "./types/raReseller";
import { getRaResellerStatusBadgeClass } from "./utils/raResellerStatus";
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

const RA_STATUS_FILTER_OPTIONS = [
  { label: "All Statuses", value: "all" },
  { label: "Pending", value: "Pending" },
  { label: "Approved", value: "Approved" },
  { label: "Rejected", value: "Rejected" },
];

const filterConfig: FilterConfig[] = [
  ...BASE_RESELLER_FILTER_CONFIG,
  {
    key: "approvalStatus",
    type: "select",
    label: "Status",
    options: RA_STATUS_FILTER_OPTIONS,
  },
  {
    key: "settlementPeriod",
    type: "select",
    label: "Settlement Period",
    options: SETTLEMENT_PERIOD_FILTER_OPTIONS,
  },
];

export default function RaResellersListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => parseUrlFilters(searchParams), [searchParams]);
  const [localFilters, setLocalFilters] =
    useState<Record<string, unknown>>(filters);
  const [isCommissionHistoryOpen, setIsCommissionHistoryOpen] = useState(false);
  const [selectedReseller, setSelectedReseller] = useState<RaReseller | null>(
    null,
  );
  const [selectedResellerIds, setSelectedResellerIds] = useState<string[]>([]);
  const [isBulkApproveOpen, setIsBulkApproveOpen] = useState(false);

  const queryClient = useQueryClient();

  const bulkApproveMutation = useMutation({
    mutationFn: async () => {
      for (const id of selectedResellerIds) {
        await api.raResellers.updateStatus(id, "Approved");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ra-resellers-list"] });
      toast.success(
        `Approved ${selectedResellerIds.length} ${selectedResellerIds.length === 1 ? "company" : "companies"} successfully`,
      );
      setSelectedResellerIds([]);
      setIsBulkApproveOpen(false);
    },
    onError: () => {
      toast.error("Failed to approve selected resellers");
    },
  });

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const { data: raResellers = [] } = useQuery({
    queryKey: ["ra-resellers-list"],
    queryFn: () => api.raResellers.list(),
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
    const approvalStatus =
      typeof filters.approvalStatus === "string"
        ? filters.approvalStatus
        : undefined;

    return raResellers.filter((item) => {
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
        !approvalStatus ||
        approvalStatus === "all" ||
        item.approvalStatus === approvalStatus;

      return (
        matchesResellerId &&
        matchesName &&
        matchesSector &&
        matchesSettlementPeriod &&
        matchesStatus
      );
    });
  }, [raResellers, filters]);

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
      item.approvalStatus,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `ra_resellers_export_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = useMemo<ColumnDef<RaReseller>[]>(
    () => [
      {
        id: "select",
        header: () => {
          const pendingRows = filteredData.filter(
            (r) => r.approvalStatus === "Pending",
          );
          const allPendingSelected =
            pendingRows.length > 0 &&
            pendingRows.every((r) => selectedResellerIds.includes(r.id));
          const isSomePendingSelected =
            pendingRows.some((r) => selectedResellerIds.includes(r.id)) &&
            !allPendingSelected;

          return (
            <div
              className="flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                checked={allPendingSelected}
                ref={(input) => {
                  if (input) input.indeterminate = isSomePendingSelected;
                }}
                disabled={pendingRows.length === 0}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedResellerIds(pendingRows.map((r) => r.id));
                  } else {
                    setSelectedResellerIds([]);
                  }
                }}
                title={
                  pendingRows.length === 0
                    ? "No pending resellers available"
                    : "Select all pending resellers"
                }
              />
            </div>
          );
        },
        cell: ({ row }) => {
          const isPending = row.original.approvalStatus === "Pending";
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
                disabled={!isPending}
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
        accessorKey: "approvalStatus",
        header: "Status",
        cell: ({ row }) => (
          <span
            className={getRaResellerStatusBadgeClass(
              row.original.approvalStatus,
            )}
          >
            {row.original.approvalStatus}
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
                to={`/resellers/ra-list/${row.original.id}`}
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
          </div>
        ),
      },
    ],
    [navigate, filteredData, selectedResellerIds],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">RA Resellers List</h1>
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
          onRowClick={(row) => navigate(`/resellers/ra-list/${row.id}`)}
          hideToolbarDateFilter
          toolbarEndContent={
            <div className="flex items-center gap-2">
              {selectedResellerIds.length > 0 && (
                <button
                  onClick={() => setIsBulkApproveOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-white bg-primary-600 rounded hover:bg-primary-700 transition-colors shadow-sm cursor-pointer animate-fade-in"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve Selected ({selectedResellerIds.length})
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
                Showing RA resellers data
              </h2>
              <span className="px-2.5 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 rounded-full border border-slate-200">
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
        status={selectedReseller?.approvalStatus}
      />

      {/* Bulk Confirm Modal */}
      <Modal
        isOpen={isBulkApproveOpen}
        onClose={() => setIsBulkApproveOpen(false)}
        title="Confirm Bulk Approval"
        footer={
          <>
            <button
              type="button"
              className="px-4 py-2 text-sm font-semibold border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              onClick={() => setIsBulkApproveOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={bulkApproveMutation.isPending}
              className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors cursor-pointer"
              onClick={() => bulkApproveMutation.mutate()}
            >
              {bulkApproveMutation.isPending
                ? "Approving..."
                : "Confirm & Approve All"}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-slate-600 text-sm leading-relaxed">
            Are you sure you want to approve the RA onboarding requests for{" "}
            <strong>
              {selectedResellerIds.length} selected{" "}
              {selectedResellerIds.length === 1 ? "company" : "companies"}
            </strong>
            ?
          </p>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 max-h-40 overflow-y-auto space-y-1 text-xs font-semibold text-slate-800">
            {selectedResellerIds.map((id) => {
              const item = raResellers.find((r) => r.id === id);
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
            This action will update all their statuses to{" "}
            <strong>"Approved"</strong>.
          </p>
        </div>
      </Modal>
    </div>
  );
}
