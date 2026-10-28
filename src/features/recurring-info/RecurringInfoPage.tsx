import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { clsx } from "clsx";
import {
  Download,
  Search,
  FileText,
  FileSpreadsheet,
  Calendar,
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DataTable } from "../../components/DataTable";
import { FilterBar, type FilterConfig } from "../../components/FilterBar";
import { MetricCard } from "../../components/MetricCard";
import { CopyButton } from "../../components/CopyButton";
import { api } from "../../lib/api/client";
import type { RecurringInfo } from "../../data/mock/types";

export default function RecurringInfoPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Generate month options (Only items from screenshot)
  const monthOptions = useMemo(() => {
    const options: { label: string; value: string }[] = [];
    const baseDate = new Date(2026, 3, 1); // April 2026
    for (let i = 0; i < 6; i++) {
      const d = new Date(baseDate.getFullYear(), baseDate.getMonth() - i, 1);
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
      options.push({ label, value });
    }
    return options;
  }, []);

  const filterConfig = useMemo<FilterConfig[]>(
    () => [
      {
        key: "month",
        type: "select",
        label: "Select Month",
        options: monthOptions,
      },
      { key: "merchant", type: "input", label: "Merchant Name" },
      { key: "store", type: "input", label: "Store ID" },
      { key: "transactionId", type: "input", label: "Transaction ID" },
    ],
    [monthOptions],
  );

  // Sync filters with URL
  const filters = useMemo(() => {
    const params: Record<string, any> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }, [searchParams]);

  // Local buffered state for filters
  const [localFilters, setLocalFilters] =
    useState<Record<string, any>>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const defaultMonth = monthOptions[0]?.value;

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["recurring-info", filters.month || defaultMonth],
    queryFn: () => api.recurringInfo.list(filters.month || defaultMonth),
  });

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

  const handleExportCSV = () => {
    if (!records.length) return;
    const headers = [
      "#",
      "Merchant",
      "Store",
      "Transaction ID",
      "Amount",
      "Bank SSL ID",
      "Card Type",
      "Credit Card",
      "Reference ID",
      "Time",
    ];
    const rows = records.map((item: RecurringInfo, idx: number) => [
      idx + 1,
      item.merchant,
      item.store,
      item.transactionId,
      item.amount.toFixed(2),
      item.bankSslId,
      item.cardType || "",
      item.creditCard,
      item.referenceId,
      item.time,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `recurring_info_${filters.month || "current"}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredData = useMemo(() => {
    return records.filter((item: RecurringInfo) => {
      if (
        filters.merchant &&
        !item.merchant.toLowerCase().includes(filters.merchant.toLowerCase())
      )
        return false;
      if (
        filters.store &&
        !item.store.toLowerCase().includes(filters.store.toLowerCase())
      )
        return false;
      if (
        filters.transactionId &&
        !item.transactionId
          .toLowerCase()
          .includes(filters.transactionId.toLowerCase())
      )
        return false;
      return true;
    });
  }, [records, filters]);

  const metrics = useMemo(() => {
    const totalAmount = filteredData.reduce(
      (sum, item) => sum + item.amount,
      0,
    );
    const count = filteredData.length;
    const avg = count > 0 ? totalAmount / count : 0;

    return {
      count: count.toLocaleString(),
      volume: totalAmount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      avg: avg.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      disputes: "0",
    };
  }, [filteredData]);

  const columns = useMemo<ColumnDef<RecurringInfo>[]>(
    () => [
      {
        id: "index",
        header: "#",
        cell: ({ row }) => (
          <span className="text-xs text-slate-500 font-medium">
            {row.index + 1}
          </span>
        ),
        size: 40,
      },
      {
        accessorKey: "merchant",
        header: "Merchant Name",
        cell: ({ row }) => (
          <div className="flex flex-col gap-0.5 whitespace-nowrap">
            <span className="text-sm font-semibold text-slate-900 leading-tight">
              {row.original.merchant}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono p-1 bg-slate-50 border border-slate-100 rounded leading-none text-slate-500">
                {row.original.store}
              </span>
              <CopyButton value={row.original.store} />
            </div>
          </div>
        ),
      },
      {
        accessorKey: "transactionId",
        header: "Transaction ID",
        cell: ({ row }) => (
          <span className="text-xs font-mono font-medium text-slate-700">
            {row.original.transactionId}
          </span>
        ),
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => (
          <span className="text-xs font-normal text-slate-700">
            {row.original.amount.toFixed(2)}
          </span>
        ),
      },
      {
        accessorKey: "bankSslId",
        header: "Bank SSL ID",
        cell: ({ row }) => (
          <span className="text-xs font-mono font-medium text-slate-600">
            {row.original.bankSslId}
          </span>
        ),
      },
      {
        accessorKey: "cardType",
        header: "Card Type",
        cell: ({ row }) => (
          <span className="text-xs font-medium text-slate-500">
            {row.original.cardType || "-"}
          </span>
        ),
      },
      {
        accessorKey: "creditCard",
        header: "Credit Card",
        cell: ({ row }) => (
          <span className="text-xs font-mono font-medium text-slate-600">
            {row.original.creditCard}
          </span>
        ),
      },
      {
        accessorKey: "referenceId",
        header: "Reference ID",
        cell: ({ row }) => (
          <span className="text-xs font-medium text-slate-600">
            {row.original.referenceId}
          </span>
        ),
      },
      {
        accessorKey: "time",
        header: "Time",
        cell: ({ row }) => (
          <span className="text-xs font-medium text-slate-600">
            {row.original.time}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Recurring Info</h1>
          <p className="text-slate-500 text-sm">
            View recurring transaction details and generate reports.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col">
        {/* Filter Section */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <FilterBar
            config={filterConfig}
            filters={localFilters}
            onFilterChange={handleFilterChange}
          />

          <button
            onClick={applyFilters}
            disabled={JSON.stringify(localFilters) === JSON.stringify(filters)}
            className={clsx(
              "flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-full transition-all shadow-sm",
              JSON.stringify(localFilters) !== JSON.stringify(filters)
                ? "bg-primary-600 hover:bg-primary-700 text-white hover:shadow-md active:scale-95"
                : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200",
            )}
          >
            Apply Filters
          </button>

          {Object.values(localFilters).some((v) => v && v !== "all") && (
            <button
              onClick={clearFilters}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium px-2"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Overview Section */}
        <div className="flex flex-col gap-4 mb-6 mt-2">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
            Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              title="No. of recurring transactions"
              value={metrics.count}
            />
            <MetricCard
              title="Volume of recurring transactions"
              value={metrics.volume}
            />
            <MetricCard title="Average Ticket Size" value={metrics.avg} />
            <MetricCard title="No. of Dispute" value={metrics.disputes} />
          </div>
        </div>

        {/* Table Section */}
        <div>
          <DataTable
            columns={columns}
            data={filteredData}
            isLoading={isLoading}
            hideToolbarDateFilter
            toolbarEndContent={
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <FileText className="w-4 h-4 text-slate-400" />
                  Summary Report
                </button>
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <FileSpreadsheet className="w-4 h-4 text-slate-400" />
                  Detail Report
                </button>
              </div>
            }
            filterActions={
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-slate-900 ml-1">
                  Showing recurring transactions
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 rounded-full border border-slate-200">
                  {filteredData.length}
                </span>
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
}
