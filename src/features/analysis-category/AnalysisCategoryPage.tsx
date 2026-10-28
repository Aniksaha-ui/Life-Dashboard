import type { ColumnDef } from "@tanstack/react-table";
import { Download, Plus, Calendar } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DataTable } from "../../components/DataTable";
import {
  FilterBar,
  ClearAllFiltersButton,
  type FilterConfig,
} from "../../components/FilterBar";
import { clsx } from "clsx";
import type { AnalysisCategory } from "./types";

const mockCategories: AnalysisCategory[] = [
  {
    id: "6",
    name: "No of success",
    description: "No of success",
    columnName: "success",
    defaultConfig:
      '{"duration":"1400","selected_type":"range","type":{"range":{"min":"0","max":"10"}},"is_active":"1","is_special":0}',
    createdAt: "2019-12-11 21:21:18",
  },
  {
    id: "7",
    name: "No of international Trans Failed",
    description: "No of international Trans Failed",
    columnName: "international_failed",
    defaultConfig:
      '{"duration":"2000","selected_type":"range","type":{"range":{"min":"0","max":"10"}},"is_active":"1","is_special":0}',
    createdAt: "2019-12-12 11:51:13",
  },
  {
    id: "8",
    name: "No of Failed Transaction",
    description: "No of Failed Transaction",
    columnName: "failed",
    defaultConfig:
      '{"duration":"1440","selected_type":"range","type":{"range":{"min":"0","max":"10"}},"is_active":"1","is_special":0}',
    createdAt: "2019-12-12 11:52:18",
  },
  {
    id: "9",
    name: "No of international trans",
    description: "No of international trans",
    columnName: "international",
    defaultConfig:
      '{"duration":"1440","selected_type":"range","type":{"range":{"min":"0","max":"10"}},"is_active":"1","is_special":0}',
    createdAt: "2019-12-12 11:52:51",
  },
];

const filterConfig: FilterConfig[] = [
  { key: "date", type: "date-range", label: "Created At", icon: Calendar },
  { key: "name", type: "input", label: "Category Name" },
  { key: "columnName", type: "input", label: "Column Name" },
];

export default function AnalysisCategoryPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

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
    return mockCategories.filter((item: AnalysisCategory) => {
      // Date Filtering
      if (filters.date_preset) {
        const itemDate = new Date(item.createdAt);
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

      const matchesName =
        !filters.name ||
        item.name.toLowerCase().includes(filters.name.toLowerCase());
      const matchesColumnName =
        !filters.columnName ||
        item.columnName
          .toLowerCase()
          .includes(filters.columnName.toLowerCase());

      return matchesName && matchesColumnName;
    });
  }, [filters]);

  const columns = useMemo<ColumnDef<AnalysisCategory>[]>(
    () => [
      {
        id: "index",
        header: "#",
        accessorFn: (_, index) => index + 1,
        cell: (info) => (
          <span className="font-medium text-slate-500">
            {info.getValue() as number}
          </span>
        ),
        size: 50,
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: (info) => (
          <span className="font-bold text-slate-800 uppercase tracking-tight text-[12px]">
            {info.getValue() as string}
          </span>
        ),
        size: 250,
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: (info) => (
          <span
            className="text-slate-600 line-clamp-1 truncate"
            title={info.getValue() as string}
          >
            {info.getValue() as string}
          </span>
        ),
        size: 250,
      },
      {
        accessorKey: "columnName",
        header: "Column Name",
        cell: (info) => (
          <code className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[11px] font-mono text-primary-600">
            {info.getValue() as string}
          </code>
        ),
        size: 180,
      },
      {
        accessorKey: "defaultConfig",
        header: "Default Config",
        cell: (info) => (
          <div className="max-w-[400px]">
            <div
              className="bg-slate-50 border border-slate-200 rounded p-2 font-mono text-[10px] text-slate-500 overflow-x-auto whitespace-pre truncate"
              title={info.getValue() as string}
            >
              {info.getValue() as string}
            </div>
          </div>
        ),
        size: 400,
      },
      {
        accessorKey: "createdAt",
        header: "Created At",
        cell: (info) => (
          <span className="text-slate-500 whitespace-nowrap">
            {info.getValue() as string}
          </span>
        ),
        size: 180,
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Global Analysis Category
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/analysis-categories/add")}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Category
          </button>
        </div>
      </div>

      {/* Filter Bar Row */}
      <div className="flex flex-wrap items-center gap-3">
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

      <div>
        <DataTable
          columns={columns}
          data={filteredData}
          hideToolbarDateFilter
          className="border-none bg-transparent shadow-none"
          rowBorderColor="divide-slate-200/50"
          toolbarEndContent={
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors shadow-sm">
              <Download className="w-4 h-4" />
              Export
            </button>
          }
          filterActions={
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 rounded-full border border-slate-200">
                {filteredData.length}
              </span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                categories showing
              </span>
            </div>
          }
        />
      </div>
    </div>
  );
}
