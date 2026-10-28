import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { clsx } from "clsx";
import { Download, Eye } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, Outlet, useSearchParams } from "react-router-dom";
import { CopyButton } from "../../components/CopyButton";
import { DataTable } from "../../components/DataTable";
import {
  FilterBar,
  ClearAllFiltersButton,
  type FilterConfig,
} from "../../components/FilterBar";
import { Tooltip as UITooltip } from "../../components/Tooltip";
import { api } from "../../lib/api/client";
import { formatNumber } from "../../utils/format";
import type { ResellerSettlement } from "./types/resellerSettlement";
import {
  buildFilterSearchParams,
  matchesDateRange,
  parseUrlFilters,
} from "./utils/resellerListFilters";
import { getResellerSettlementPaymentStatusBadgeClass } from "./utils/resellerSettlementStatus";
import { formatResellerDate } from "./utils/resellerDateFormat";

const actionButtonClass = "flex flex-col items-center gap-0 group";
const iconWrapClass =
  "pt-1.5 px-1.5 pb-0 hover:bg-slate-100 rounded text-slate-400 group-hover:text-primary-600 transition-colors";
const actionLabelClass =
  "text-[9px] font-medium text-slate-500 group-hover:text-primary-600 transition-colors";

export default function ResellerSettlementsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => parseUrlFilters(searchParams), [searchParams]);
  const [localFilters, setLocalFilters] =
    useState<Record<string, unknown>>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const { data: settlements = [] } = useQuery({
    queryKey: ["reseller-settlements-list"],
    queryFn: () => api.resellerSettlements.list(),
  });

  const { data: resellerOptions = [{ label: "Select one", value: "all" }] } =
    useQuery({
      queryKey: ["reseller-settlements-reseller-options"],
      queryFn: () => api.resellerSettlements.resellerOptions(),
    });

  const filterConfig = useMemo<FilterConfig[]>(
    () => [
      { key: "date", type: "date-range", label: "Date" },
      {
        key: "storeId",
        type: "input",
        label: "Store ID",
        placeholder: "Store ID",
      },
      {
        key: "reseller",
        type: "select",
        label: "Reseller",
        options: resellerOptions,
      },
    ],
    [resellerOptions],
  );

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
    const storeId =
      typeof filters.storeId === "string" ? filters.storeId : undefined;
    const reseller =
      typeof filters.reseller === "string" ? filters.reseller : undefined;

    return settlements.filter((item) => {
      if (!matchesDateRange(item.date, datePreset, dateFrom, dateTo)) {
        return false;
      }

      const matchesStoreId =
        !storeId || item.storeId.toLowerCase().includes(storeId.toLowerCase());
      const matchesReseller =
        !reseller || reseller === "all" || item.resellerName === reseller;

      return matchesStoreId && matchesReseller;
    });
  }, [settlements, filters]);

  const handleExportCSV = () => {
    if (!filteredData.length) return;

    const headers = [
      "Reseller",
      "Reseller ID",
      "Store",
      "Trans.",
      "Amount",
      "Payable",
      "Deduct",
      "Date",
      "Status",
    ];

    const rows = filteredData.map((item) => [
      item.resellerName.replace(/,/g, ""),
      item.resellerId,
      item.storeId,
      String(item.transactionCount),
      formatNumber(item.transactionAmount),
      formatNumber(item.payable),
      formatNumber(item.deductAmount),
      formatResellerDate(item.date),
      item.paymentStatus,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `reseller_settlements_export_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = useMemo<ColumnDef<ResellerSettlement>[]>(
    () => [
      {
        id: "index",
        header: "#",
        cell: ({ row }) => (
          <span className="text-xs text-slate-500">{row.index + 1}</span>
        ),
        size: 50,
      },
      {
        accessorKey: "resellerName",
        header: "Reseller",
        cell: ({ row }) => (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-slate-900 leading-tight">
              {row.original.resellerName}
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
        accessorKey: "storeId",
        header: "Store",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono p-1 bg-slate-50 border border-slate-100 rounded leading-none text-slate-500">
              {row.original.storeId}
            </span>
            <CopyButton value={row.original.storeId} />
          </div>
        ),
      },
      {
        accessorKey: "transactionCount",
        header: "Trans.",
        cell: ({ row }) => (
          <span className="text-xs text-slate-600">
            {row.original.transactionCount}
          </span>
        ),
      },
      {
        accessorKey: "transactionAmount",
        header: "Amount",
        cell: ({ row }) => (
          <span className="text-xs text-slate-700">
            {formatNumber(row.original.transactionAmount)}
          </span>
        ),
      },
      {
        accessorKey: "payable",
        header: "Payable",
        cell: ({ row }) => (
          <span className="text-xs text-slate-700">
            {formatNumber(row.original.payable)}
          </span>
        ),
      },
      {
        accessorKey: "deductAmount",
        header: "Deduct",
        cell: ({ row }) => (
          <span className="text-xs text-slate-700">
            {formatNumber(row.original.deductAmount)}
          </span>
        ),
      },
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => (
          <span className="text-xs text-slate-600">
            {formatResellerDate(row.original.date)}
          </span>
        ),
      },
      {
        accessorKey: "paymentStatus",
        header: "Status",
        cell: ({ row }) => (
          <span
            className={getResellerSettlementPaymentStatusBadgeClass(
              row.original.paymentStatus,
            )}
          >
            {row.original.paymentStatus}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Details",
        cell: ({ row }) => (
          <div className="flex items-center gap-3 whitespace-nowrap">
            <UITooltip content="Details">
              <Link
                to={`/resellers/settlements/${row.original.id}`}
                onClick={(e) => e.stopPropagation()}
                className={actionButtonClass}
              >
                <div className={iconWrapClass}>
                  <Eye className="w-3.5 h-3.5" />
                </div>
                <span className={actionLabelClass}>Details</span>
              </Link>
            </UITooltip>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">
          Reseller Settlement
        </h1>
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
          hideToolbarDateFilter
          toolbarEndContent={
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
            >
              Export
              <Download className="w-4 h-4" />
            </button>
          }
          filterActions={
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-900 ml-1">
                Showing reseller settlement data
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 rounded-full border border-slate-200">
                {filteredData.length}
              </span>
            </div>
          }
        />
      </div>

      <Outlet />
    </div>
  );
}
