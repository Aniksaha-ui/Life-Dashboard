import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { clsx } from "clsx";
import { Download, Eye, Pencil } from "lucide-react";
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
import type { OpReseller } from "./types/opReseller";
import { BASE_RESELLER_FILTER_CONFIG } from "./utils/resellerFilterConfig";
import {
  buildFilterSearchParams,
  matchesDateRange,
  parseUrlFilters,
} from "./utils/resellerListFilters";
import { getOpResellerStatusBadgeClass } from "./utils/opResellerStatus";
import { formatResellerDate } from "./utils/resellerDateFormat";

const actionButtonClass = "flex flex-col items-center gap-0 group";
const iconWrapClass =
  "pt-1.5 px-1.5 pb-0 hover:bg-slate-100 rounded text-slate-400 group-hover:text-primary-600 transition-colors";
const actionLabelClass =
  "text-[9px] font-medium text-slate-500 group-hover:text-primary-600 transition-colors";
const filterConfig: FilterConfig[] = [
  ...BASE_RESELLER_FILTER_CONFIG,
  {
    key: "status",
    type: "select",
    label: "Status",
    options: [
      { label: "All Status", value: "all" },
      { label: "Pending", value: "Pending" },
      { label: "Uploaded", value: "Uploaded" },
      { label: "Approved", value: "Approved" },
      { label: "Rejected", value: "Rejected" },
    ],
  },
];

export default function OpResellersListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => parseUrlFilters(searchParams), [searchParams]);
  const [localFilters, setLocalFilters] =
    useState<Record<string, unknown>>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const { data: opResellers = [] } = useQuery({
    queryKey: ["op-resellers-list"],
    queryFn: () => api.opResellers.list(),
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
    const status =
      typeof filters.status === "string" ? filters.status : undefined;

    return opResellers.filter((item) => {
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
      const matchesStatus =
        !status || status === "all" || item.status === status;

      return matchesResellerId && matchesName && matchesSector && matchesStatus;
    });
  }, [opResellers, filters]);

  const handleExportCSV = () => {
    if (!filteredData.length) return;

    const headers = [
      "Company Name",
      "Sector",
      "POC",
      "Onboarding Date",
      "Status",
    ];

    const rows = filteredData.map((item) => [
      item.name.replace(/,/g, ""),
      item.sector,
      item.pocName,
      formatResellerDate(item.onboardingDate),
      item.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `op_resellers_export_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = useMemo<ColumnDef<OpReseller>[]>(
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
        accessorKey: "name",
        header: "Company Name",
        cell: ({ row }) => (
          <div className="flex flex-col gap-0.5">
            <Link
              to={`/resellers/op-list/details/${row.original.id}`}
              onClick={(e) => e.stopPropagation()}
              className="text-sm font-semibold text-slate-900 hover:text-primary-600 hover:underline leading-tight text-left"
            >
              {row.original.name}
            </Link>
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
        header: "Onboarding Date",
        cell: ({ row }) => (
          <span className="text-xs text-slate-600">
            {formatResellerDate(row.original.onboardingDate)}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <span className={getOpResellerStatusBadgeClass(row.original.status)}>
            {row.original.status}
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
                to={`/resellers/op-list/${row.original.id}`}
                onClick={(e) => e.stopPropagation()}
                className={actionButtonClass}
              >
                <div className={iconWrapClass}>
                  <Eye className="w-3.5 h-3.5" />
                </div>
                <span className={actionLabelClass}>Details</span>
              </Link>
            </UITooltip>
            <UITooltip content="Edit">
              <Link
                to={`/resellers/op-list/edit/${row.original.id}`}
                onClick={(e) => e.stopPropagation()}
                className={actionButtonClass}
              >
                <div className={iconWrapClass}>
                  <Pencil className="w-3.5 h-3.5" />
                </div>
                <span className={actionLabelClass}>Edit</span>
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
        <h1 className="text-2xl font-bold text-slate-900">OP Resellers List</h1>
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
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors shadow-sm"
            >
              Export
              <Download className="w-4 h-4" />
            </button>
          }
          filterActions={
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-900 ml-1">
                Showing OP resellers data
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
