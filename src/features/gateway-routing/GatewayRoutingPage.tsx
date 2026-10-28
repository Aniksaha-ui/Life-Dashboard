import type { ColumnDef } from "@tanstack/react-table";
import { clsx } from "clsx";
import { Plus, Download } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams, Link, Outlet } from "react-router-dom";
import { DataTable } from "../../components/DataTable";
import {
  FilterBar,
  ClearAllFiltersButton,
  type FilterConfig,
} from "../../components/FilterBar";
import type { GatewayRoutingRule } from "./types";
import {
  STATUS_BADGE_CLASS,
  getActiveInactiveStatusClass,
} from "../../utils/statusBadge";

const hourOptions = Array.from({ length: 24 }, (_, i) => ({
  label: `${i.toString().padStart(2, "0")}:00`,
  value: `${i.toString().padStart(2, "0")}:00`,
}));

const filterConfig: FilterConfig[] = [
  {
    key: "strid",
    type: "input",
    label: "strid",
    placeholder: "Enter store id",
  },
  {
    key: "startHour",
    type: "select",
    label: "Start Hour",
    options: hourOptions,
  },
  { key: "endHour", type: "select", label: "End Hour", options: hourOptions },
];

const mockData: GatewayRoutingRule[] = [
  {
    id: "1",
    strid: "demotest",
    startHour: "14:00",
    endHour: "18:59",
    bankName: "Eastern Bank Limited",
    status: "Active",
  },
  {
    id: "2",
    strid: "demotest",
    startHour: "19:00",
    endHour: "23:59",
    bankName: "Mutual Trust Bank Limited",
    status: "Active",
  },
  {
    id: "3",
    strid: "EstyStore040live",
    startHour: "11:00",
    endHour: "18:59",
    bankName: "Mutual Trust Bank Limited",
    status: "Active",
  },
  {
    id: "4",
    strid: "EstyStore040live",
    startHour: "19:00",
    endHour: "23:59",
    bankName: "United Commercial Bank Ltd",
    status: "Active",
  },
  {
    id: "5",
    strid: "mer_667788",
    startHour: "12:00",
    endHour: "14:00",
    bankName: "City Bank",
    status: "Inactive",
  },
  {
    id: "6",
    strid: "mer_990011",
    startHour: "06:00",
    endHour: "22:00",
    bankName: "BRAC Bank",
    status: "Active",
  },
  {
    id: "7",
    strid: "mer_223344",
    startHour: "22:01",
    endHour: "05:59",
    bankName: "Eastern Bank Limited",
    status: "Active",
  },
];

export default function GatewayRoutingPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initial local filters from URL
  const [localFilters, setLocalFilters] = useState<Record<string, any>>(() => {
    const params: Record<string, any> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  });

  const filters = useMemo(() => {
    const params: Record<string, any> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }, [searchParams]);

  const handleFilterChange = (key: string, value: any) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    Object.entries(localFilters).forEach(([key, value]) => {
      if (value && value !== "all") {
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
    return mockData.filter((item) => {
      if (
        filters.strid &&
        !item.strid.toLowerCase().includes(filters.strid.toLowerCase())
      )
        return false;
      if (filters.startHour && item.startHour !== filters.startHour)
        return false;
      if (filters.endHour && item.endHour !== filters.endHour) return false;
      return true;
    });
  }, [filters]);

  const columns: ColumnDef<GatewayRoutingRule>[] = [
    {
      id: "index",
      header: "#",
      cell: ({ row }) => (
        <span className="text-xs text-slate-500">{row.index + 1}</span>
      ),
    },
    {
      accessorKey: "strid",
      header: "Store ID",
      cell: ({ row }) => (
        <span className="text-xs font-semibold text-slate-700">
          {row.original.strid}
        </span>
      ),
    },
    {
      accessorKey: "startHour",
      header: "Start Hour",
      cell: ({ row }) => (
        <span className="text-xs text-slate-600">{row.original.startHour}</span>
      ),
    },
    {
      accessorKey: "endHour",
      header: "End Hour",
      cell: ({ row }) => (
        <span className="text-xs text-slate-600">{row.original.endHour}</span>
      ),
    },
    {
      accessorKey: "bankName",
      header: "Bank Name",
      cell: ({ row }) => (
        <span className="text-xs text-slate-600 font-medium">
          {row.original.bankName}
        </span>
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
            to={`/gateway-routing/${row.original.id}`}
            className="text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline"
          >
            Edit
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Gateway Routing Configuration
          </h1>
          <p className="text-slate-500 text-sm">
            Manage gateway routing rules based on store ID and time windows.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          <span className="text-sm font-medium">Add New Configuration</span>
        </button>
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
              : "bg-slate-100 text-slate-400 cursor-not-allowed",
          )}
        >
          Apply Filters
        </button>
        <ClearAllFiltersButton onClick={clearFilters} filters={localFilters} />
      </div>

      <div className="flex flex-col">
        <DataTable
          columns={columns}
          data={filteredData}
          hideToolbarDateFilter
          toolbarEndContent={
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors shadow-sm">
              Export
              <Download className="w-4 h-4" />
            </button>
          }
          filterActions={
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-900 ml-1">
                Showing routing rules
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
