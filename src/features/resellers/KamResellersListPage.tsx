import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { clsx } from "clsx";
import { Download, Eye, Percent, History } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, Outlet, useNavigate, useSearchParams } from "react-router-dom";
import { CopyButton } from "../../components/CopyButton";
import { DataTable } from "../../components/DataTable";
import {
  FilterBar,
  ClearAllFiltersButton,
  type FilterConfig,
} from "../../components/FilterBar";
import { Tooltip as UITooltip } from "../../components/Tooltip";
import { api } from "../../lib/api/client";
import { CommissionDrawer } from "./CommissionDrawer";
import { CommissionScheduleDrawer } from "./CommissionScheduleDrawer";
import { CommissionHistoryDrawer } from "./CommissionHistoryDrawer";
import type { KamReseller } from "./types/kamReseller";
import { getKamResellerStatusBadgeClass } from "./utils/kamResellerStatus";
import { formatResellerDate } from "./utils/resellerDateFormat";

const actionButtonClass = "flex flex-col items-center gap-0 group";
const iconWrapClass =
  "pt-1.5 px-1.5 pb-0 hover:bg-slate-100 rounded text-slate-400 group-hover:text-primary-600 transition-colors";
const actionLabelClass =
  "text-[9px] font-medium text-slate-500 group-hover:text-primary-600 transition-colors";

const filterConfig: FilterConfig[] = [
  { key: "date", type: "date-range", label: "Date" },
  { key: "name", type: "input", label: "Company Name" },
  { key: "resellerId", type: "input", label: "Company ID" },
  {
    key: "sector",
    type: "select",
    label: "Sector",
    options: [
      { label: "All Sectors", value: "all" },
      { label: "Pureplay Ecommerce", value: "Pureplay Ecommerce" },
      { label: "Education", value: "Education" },
      { label: "Healthcare", value: "Healthcare" },
      { label: "Travel & Tourism", value: "Travel & Tourism" },
      { label: "Food & Beverage", value: "Food & Beverage" },
      { label: "Financial Services", value: "Financial Services" },
      { label: "Telecom", value: "Telecom" },
      { label: "Retail", value: "Retail" },
    ],
  },
  {
    key: "status",
    type: "select",
    label: "Status",
    options: [
      { label: "All Status", value: "all" },
      { label: "Active", value: "Active" },
      { label: "Inactive", value: "Inactive" },
      { label: "Pending", value: "Pending" },
      { label: "Rejected", value: "Rejected" },
    ],
  },
];

export default function KamResellersListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isCommissionOpen, setIsCommissionOpen] = useState(false);
  const [isCommissionScheduleOpen, setIsCommissionScheduleOpen] =
    useState(false);
  const [isCommissionHistoryOpen, setIsCommissionHistoryOpen] = useState(false);
  const [selectedReseller, setSelectedReseller] = useState<KamReseller | null>(
    null,
  );

  const filters = useMemo(() => {
    const params: Record<string, unknown> = {};
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
    return params;
  }, [searchParams]);

  const [localFilters, setLocalFilters] =
    useState<Record<string, unknown>>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const { data: kamResellers = [] } = useQuery({
    queryKey: ["kam-resellers-list"],
    queryFn: () => api.kamResellers.list(),
  });

  const handleFilterChange = (key: string, value: unknown) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    Object.entries(localFilters).forEach(([key, value]) => {
      if (key === "date") {
        const dateValue = value as
          { preset?: string; from?: string; to?: string } | undefined;
        if (dateValue?.preset && dateValue.preset !== "all") {
          params.set("date_preset", dateValue.preset);
          if (dateValue.from) params.set("date_from", dateValue.from);
          if (dateValue.to) params.set("date_to", dateValue.to);
        }
      } else if (value && value !== "all") {
        params.set(key, String(value));
      }
    });
    setSearchParams(params);
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

    return kamResellers.filter((item) => {
      if (datePreset) {
        const itemDate = new Date(item.onboardingDate);
        const today = new Date();
        let fromDate = new Date(0);
        let toDate = new Date();

        switch (datePreset) {
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
            if (dateFrom) fromDate = new Date(dateFrom);
            if (dateTo) {
              toDate = new Date(dateTo);
              toDate.setHours(23, 59, 59, 999);
            }
            break;
        }

        if (itemDate < fromDate || itemDate > toDate) return false;
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
  }, [kamResellers, filters]);

  const handleExportCSV = () => {
    if (!filteredData.length) return;

    const headers = [
      "Company Name",
      "Sector",
      "POC",
      "Date",
      "Status",
      "Merchants",
    ];

    const rows = filteredData.map((item) => [
      item.name.replace(/,/g, ""),
      item.sector,
      item.pocName,
      formatResellerDate(item.onboardingDate),
      item.status,
      item.merchantsCount,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `kam_resellers_export_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = useMemo<ColumnDef<KamReseller>[]>(
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
          <span className={getKamResellerStatusBadgeClass(row.original.status)}>
            {row.original.status}
          </span>
        ),
      },
      {
        accessorKey: "merchantsCount",
        header: "Merchants",
        cell: ({ row }) => (
          <span className="text-xs font-semibold text-slate-700">
            {row.original.merchantsCount}
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
                to={`/resellers/kam-list/${row.original.id}`}
                onClick={(e) => e.stopPropagation()}
                className={actionButtonClass}
              >
                <div className={iconWrapClass}>
                  <Eye className="w-3.5 h-3.5" />
                </div>
                <span className={actionLabelClass}>Details</span>
              </Link>
            </UITooltip>
            <UITooltip content="Commission Slab">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedReseller(row.original);
                  setIsCommissionOpen(true);
                }}
                className={actionButtonClass}
              >
                <div className={iconWrapClass}>
                  <span className="w-4 h-4 flex items-center justify-center font-hind-siliguri font-medium text-[16px] leading-none select-none">
                    ৳
                  </span>
                </div>
                <span className={actionLabelClass}>Commission</span>
              </button>
            </UITooltip>
            <UITooltip content="Configure Commission">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedReseller(row.original);
                  setIsCommissionScheduleOpen(true);
                }}
                className={actionButtonClass}
              >
                <div className={iconWrapClass}>
                  <Percent className="w-3.5 h-3.5" />
                </div>
                <span className={actionLabelClass}>Configure</span>
              </button>
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
    [],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">
          KAM Resellers List
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
          onRowClick={(row) => navigate(`/resellers/kam-list/${row.id}`)}
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
                Showing KAM resellers data
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 rounded-full border border-slate-200">
                {filteredData.length}
              </span>
            </div>
          }
        />
      </div>

      <Outlet />

      <CommissionDrawer
        open={isCommissionOpen}
        onClose={() => {
          setIsCommissionOpen(false);
          setSelectedReseller(null);
        }}
        resellerName={selectedReseller?.name}
      />

      <CommissionScheduleDrawer
        open={isCommissionScheduleOpen}
        onClose={() => {
          setIsCommissionScheduleOpen(false);
          setSelectedReseller(null);
        }}
        resellerName={selectedReseller?.name}
        resellerId={selectedReseller?.resellerId}
      />

      <CommissionHistoryDrawer
        open={isCommissionHistoryOpen}
        onClose={() => {
          setIsCommissionHistoryOpen(false);
          setSelectedReseller(null);
        }}
        resellerName={selectedReseller?.name}
        resellerId={selectedReseller?.resellerId}
      />
    </div>
  );
}
