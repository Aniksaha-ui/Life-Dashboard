import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { clsx } from "clsx";
import { Calendar, Download } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { Outlet, Link, useNavigate, useSearchParams } from "react-router-dom";
import { DataTable } from "../../components/DataTable";
import { CopyButton } from "../../components/CopyButton";
import {
  STATUS_BADGE_CLASS,
  getActiveInactiveStatusClass,
} from "../../utils/statusBadge";
import {
  FilterBar,
  ClearAllFiltersButton,
  type FilterConfig,
} from "../../components/FilterBar";
import { api } from "../../lib/api/client";
import type { Reseller } from "../../data/mock/types";
import { formatResellerDate } from "./utils/resellerDateFormat";
import { CommissionDrawer } from "./CommissionDrawer";

// --- Filter Config ---

const filterConfig: FilterConfig[] = [
  { key: "date", type: "date-range", label: "Onboarding Date", icon: Calendar },
  { key: "resellerId", type: "input", label: "Reseller ID" },
  { key: "name", type: "input", label: "Reseller Name" },
  { key: "email", type: "input", label: "Email" },
  { key: "phone", type: "input", label: "Phone" },
  {
    key: "status",
    type: "select",
    label: "Status",
    options: [
      { label: "All Status", value: "all" },
      { label: "Active", value: "Active" },
      { label: "De-active", value: "De-active" },
    ],
  },
];

export default function ResellersPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isCommissionOpen, setIsCommissionOpen] = useState(false);
  const [selectedReseller, setSelectedReseller] = useState<Reseller | null>(
    null,
  );

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
    return params;
  }, [searchParams]);

  // Local buffered state for filters
  const [localFilters, setLocalFilters] =
    useState<Record<string, any>>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleExportCSV = () => {
    if (!filteredData.length) return;
    const headers = [
      "Reseller ID",
      "Reseller Name",
      "Email",
      "Phone",
      "Status",
      "Onboarding Date",
    ];
    const rows = filteredData.map((item: Reseller) => [
      item.resellerId,
      item.name.replace(/,/g, ""),
      item.email,
      item.phone,
      item.status,
      formatResellerDate(item.onboardingDate),
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `resellers_export_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const { data: rescuers = [] } = useQuery({
    queryKey: ["resellers-list"],
    queryFn: () => api.resellers.list(),
  });

  const handleFilterChange = (key: string, value: any) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    Object.entries(localFilters).forEach(([key, value]) => {
      if (key === "date") {
        if (value && value.preset && value.preset !== "all") {
          params.set("date_preset", value.preset);
          if (value.from) params.set("date_from", value.from);
          if (value.to) params.set("date_to", value.to);
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
    return rescuers.filter((item: Reseller) => {
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

      const matchesId =
        !filters.resellerId ||
        item.resellerId
          .toLowerCase()
          .includes(filters.resellerId.toLowerCase());
      const matchesName =
        !filters.name ||
        item.name.toLowerCase().includes(filters.name.toLowerCase());
      const matchesEmail =
        !filters.email ||
        item.email?.toLowerCase().includes(filters.email.toLowerCase());
      const matchesPhone =
        !filters.phone ||
        item.phone?.toLowerCase().includes(filters.phone.toLowerCase());
      const matchesStatus =
        !filters.status ||
        filters.status === "all" ||
        item.status === filters.status;
      return (
        matchesId &&
        matchesName &&
        matchesEmail &&
        matchesPhone &&
        matchesStatus
      );
    });
  }, [rescuers, filters]);

  const columns = useMemo<ColumnDef<Reseller>[]>(
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
        header: "Reseller Name",
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
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
          <span className="text-xs text-slate-600">{row.original.email}</span>
        ),
      },
      {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => (
          <span className="text-xs text-slate-600">{row.original.phone}</span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <span
            className={clsx(
              STATUS_BADGE_CLASS,
              getActiveInactiveStatusClass(row.original.status),
            )}
          >
            {row.original.status}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Action",
        cell: ({ row }) => (
          <div className="flex items-center gap-3 whitespace-nowrap">
            <Link
              to={`/resellers/${row.original.id}`}
              onClick={(e) => e.stopPropagation()}
              className="text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline"
            >
              Edit
            </Link>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedReseller(row.original);
                setIsCommissionOpen(true);
              }}
              className="text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline"
            >
              Commission
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Action for Switch Reseller
              }}
              className="text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline"
            >
              View Merchant Profile
            </button>
          </div>
        ),
      },
    ],
    [navigate],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Reseller</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/resellers/add")}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            Add Reseller
          </button>
        </div>
      </div>

      {/* Filters Row - Matching Merchants Page Style */}
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

      {/* Table Section */}
      <div className="pt-6">
        <DataTable
          columns={columns}
          data={filteredData}
          onRowClick={(row: Reseller) => navigate(`/resellers/${row.id}`)}
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
                Showing resellers data
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
    </div>
  );
}
