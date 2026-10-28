import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { clsx } from "clsx";
import { Calendar, Download, Plus } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useNavigate, useSearchParams, Outlet } from "react-router-dom";
import { DataTable } from "../../components/DataTable";
import {
  STATUS_BADGE_CLASS,
  getYesNoStatusClass,
} from "../../utils/statusBadge";
import { FilterBar, type FilterConfig } from "../../components/FilterBar";
import { MetricCard } from "../../components/MetricCard";
import { api } from "../../lib/api/client";
import type { LocalIssuerBank } from "../../data/mock/types";

// --- Filter Config ---

const primaryFilterConfig: FilterConfig[] = [
  { key: "bankName", type: "input", label: "Bank Name" },
  { key: "swiftCode", type: "input", label: "SWIFT Code" },
  { key: "npsbCode", type: "input", label: "NPSB Code" },
  { key: "emiRate", type: "input", label: "EMI Rate" },
];

const advancedFilterConfig: FilterConfig[] = [
  { key: "sslEmail", type: "input", label: "SSL Email" },
  { key: "sslMobile", type: "input", label: "SSL Mobile" },
  { key: "lastReportingDate", type: "input", label: "Reporting" },
  { key: "reportSendOn", type: "input", label: "Send on" },
  { key: "lastEmailSent", type: "input", label: "Email Sent" },
  {
    key: "emailStatus",
    type: "select",
    label: "Status",
    options: [
      { label: "All", value: "all" },
      { label: "Yes", value: "Yes" },
      { label: "No", value: "No" },
    ],
  },
];

export default function LocalIssuerBankPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

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
  const [hasUnappliedChanges, setHasUnappliedChanges] = useState(false);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  useEffect(() => {
    setHasUnappliedChanges(
      JSON.stringify(localFilters) !== JSON.stringify(filters),
    );
  }, [localFilters, filters]);

  const activeAdvancedCount = useMemo(() => {
    return advancedFilterConfig.reduce((acc, config) => {
      const val = localFilters[config.key];
      if (val && val !== "all") return acc + 1;
      return acc;
    }, 0);
  }, [localFilters]);

  const handleExportCSV = () => {
    if (!filteredData.length) return;
    const headers = [
      "Ref ID",
      "Bank Name",
      "SWIFT Code",
      "NPSB Code",
      "EMI Rate",
      "SSL Email",
      "SSL Mobile",
      "Reporting",
      "Send on",
      "Email Sent",
      "Status",
    ];
    const rows = filteredData.map((item: LocalIssuerBank) => [
      item.bankRefId,
      item.bankName.replace(/,/g, ""),
      item.swiftCode,
      item.npsbCode,
      `"${item.emiRate.replace(/"/g, '""')}"`,
      item.sslEmail,
      item.sslMobile,
      item.lastReportingDate,
      item.reportSendOn,
      item.lastEmailSent,
      item.emailStatus,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `local_issuer_banks_export_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const { data: banks = [], isLoading } = useQuery({
    queryKey: ["local-issuer-banks-list"],
    queryFn: () => api.localIssuerBanks.list(),
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

  const filteredData = useMemo(() => {
    return banks.filter((item: LocalIssuerBank) => {
      const matchesName =
        !filters.bankName ||
        item.bankName.toLowerCase().includes(filters.bankName.toLowerCase());
      const matchesSwift =
        !filters.swiftCode ||
        item.swiftCode.toLowerCase().includes(filters.swiftCode.toLowerCase());
      const matchesNpsb =
        !filters.npsbCode ||
        item.npsbCode.toLowerCase().includes(filters.npsbCode.toLowerCase());
      const matchesEmi =
        !filters.emiRate ||
        item.emiRate.toLowerCase().includes(filters.emiRate.toLowerCase());
      const matchesEmail =
        !filters.sslEmail ||
        item.sslEmail.toLowerCase().includes(filters.sslEmail.toLowerCase());
      const matchesMobile =
        !filters.sslMobile ||
        item.sslMobile.toLowerCase().includes(filters.sslMobile.toLowerCase());
      const matchesStatus =
        !filters.emailStatus ||
        filters.emailStatus === "all" ||
        item.emailStatus === filters.emailStatus;
      return (
        matchesName &&
        matchesSwift &&
        matchesNpsb &&
        matchesEmi &&
        matchesEmail &&
        matchesMobile &&
        matchesStatus
      );
    });
  }, [banks, filters]);

  const metrics = useMemo(() => {
    return {
      total: banks.length,
      emailSent: banks.filter((b) => b.emailStatus === "Yes").length,
      emailNotSent: banks.filter((b) => b.emailStatus === "No").length,
      reportingToday: banks.filter(
        (b) => b.lastReportingDate === new Date().toISOString().split("T")[0],
      ).length,
    };
  }, [banks]);

  const columns = useMemo<ColumnDef<LocalIssuerBank>[]>(
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
        accessorKey: "bankRefId",
        header: "Ref ID",
        cell: ({ row }) => (
          <span className="text-xs font-medium text-slate-600 tabular-nums">
            {row.original.bankRefId || "-"}
          </span>
        ),
        size: 90,
      },
      {
        accessorKey: "bankName",
        header: "Bank Name",
        cell: ({ row }) => (
          <span className="text-xs font-bold text-slate-900 uppercase">
            {row.original.bankName}
          </span>
        ),
      },
      {
        accessorKey: "swiftCode",
        header: "SWIFT Code",
        cell: ({ row }) => (
          <span className="text-xs font-medium text-slate-600 uppercase">
            {row.original.swiftCode || "-"}
          </span>
        ),
      },
      {
        accessorKey: "npsbCode",
        header: "NPSB Code",
        cell: ({ row }) => (
          <span className="text-xs font-medium text-slate-600">
            {row.original.npsbCode || "-"}
          </span>
        ),
      },
      {
        accessorKey: "emiRate",
        header: "EMI Rate",
        cell: ({ row }) => (
          <div className="max-w-[300px]">
            <p className="text-[10px] font-medium text-slate-500 break-all leading-tight">
              {row.original.emiRate || "-"}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "sslEmail",
        header: "SSL Email",
        cell: ({ row }) => (
          <span className="text-xs font-medium text-slate-600 lowercase">
            {row.original.sslEmail || "-"}
          </span>
        ),
      },
      {
        accessorKey: "sslMobile",
        header: "SSL Mobile",
        cell: ({ row }) => (
          <span className="text-xs font-medium text-slate-600">
            {row.original.sslMobile || "-"}
          </span>
        ),
      },
      {
        accessorKey: "lastReportingDate",
        header: "Reporting",
        cell: ({ row }) => (
          <span className="text-xs font-medium text-slate-600">
            {row.original.lastReportingDate}
          </span>
        ),
      },
      {
        accessorKey: "reportSendOn",
        header: "Send on",
        cell: ({ row }) => (
          <span className="text-xs font-medium text-slate-600">
            {row.original.reportSendOn}
          </span>
        ),
      },
      {
        accessorKey: "lastEmailSent",
        header: "Email Sent",
        cell: ({ row }) => (
          <span className="text-xs font-medium text-slate-600">
            {row.original.lastEmailSent}
          </span>
        ),
      },
      {
        accessorKey: "emailStatus",
        header: "Status",
        cell: ({ row }) => (
          <span
            className={clsx(
              STATUS_BADGE_CLASS,
              getYesNoStatusClass(row.original.emailStatus),
            )}
          >
            {row.original.emailStatus === "Yes" ? "Yes" : "No"}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Action",
        cell: ({ row }) => (
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/manage-bank/local-issuer-bank/${row.original.id}`);
            }}
            className="text-xs font-bold text-primary-600 hover:text-primary-700 hover:underline transition-colors"
          >
            Edit
          </button>
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
          <h1 className="text-2xl font-bold text-slate-900">
            Local Issuer Bank
          </h1>
          <p className="text-slate-500 text-sm">
            Manage all local issuer banks and their reporting status.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/manage-bank/local-issuer-bank/add")}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            Add Local Issuer Bank
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <FilterBar
            filters={localFilters}
            onFilterChange={handleFilterChange}
            config={primaryFilterConfig}
            layout="grid"
          />

          <button
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
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
              onClick={applyFilters}
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
              onClick={clearFilters}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium px-2"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Advanced Filters Panel */}
        <div
          className={clsx(
            "grid transition-all duration-300 ease-in-out px-1 w-full",
            isAdvancedOpen
              ? "grid-rows-[1fr] opacity-100 overflow-visible"
              : "grid-rows-[0fr] opacity-0 overflow-hidden",
          )}
        >
          <div className="min-h-0">
            <div className="pt-4 border-t border-slate-100/50">
              <FilterBar
                filters={localFilters}
                onFilterChange={handleFilterChange}
                config={advancedFilterConfig}
                layout="grid"
              >
                {isAdvancedOpen && (
                  <button
                    onClick={applyFilters}
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
              </FilterBar>
            </div>
          </div>
        </div>

        {/* Overview Section */}
        <div className="flex flex-col gap-4 pt-6">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
            Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard title="Total Banks" value={metrics.total.toString()} />
            <MetricCard
              title="Email Sent"
              value={metrics.emailSent.toString()}
            />
            <MetricCard
              title="Email Pending"
              value={metrics.emailNotSent.toString()}
            />
            <MetricCard
              title="Reporting Today"
              value={metrics.reportingToday.toString()}
            />
          </div>
        </div>

        {/* Table Section */}
        <div className="pt-6">
          <DataTable
            columns={columns}
            data={filteredData}
            isLoading={isLoading}
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
                  Showing local issuer banks data
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 rounded-full border border-slate-200">
                  {filteredData.length}
                </span>
              </div>
            }
          />
        </div>
      </div>
      <Outlet />
    </div>
  );
}
