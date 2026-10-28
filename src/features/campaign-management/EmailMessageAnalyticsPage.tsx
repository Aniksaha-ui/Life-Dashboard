import { useState, useMemo, useEffect } from "react";
import { Copy, Check } from "lucide-react";
import { clsx } from "clsx";
import { DataTable } from "../../components/DataTable";
import { FilterBar } from "../../components/FilterBar";
import { MetricCard } from "../../components/MetricCard";
import { CopyButton as GlobalCopyButton } from "../../components/CopyButton";
import type { ColumnDef } from "@tanstack/react-table";
import {
  STATUS_BADGE_CLASS,
  getEmailMessageStatusClass,
} from "./utils/statusBadge";

interface EmailAnalyticsRecord {
  id: string;
  sector: string;
  merchantName: string;
  merchantId: string;
  email: string;
  status: "Unknown" | "Sent" | "Failed" | "Bounced";
  date: string;
  reason: string;
}

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1 text-slate-400 hover:text-primary-600 transition-all rounded hover:bg-slate-100/50 group/copy"
      title="Copy to clipboard"
    >
      {copied ? (
        <Check className="w-3 h-3 text-emerald-500 animate-in zoom-in duration-200" />
      ) : (
        <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 sm:group-hover/parent:opacity-100 transition-opacity" />
      )}
    </button>
  );
};

const MOCK_DATA: EmailAnalyticsRecord[] = [
  {
    id: "1",
    sector: "Automobile",
    merchantName: "Demo Test Merchant",
    merchantId: "demotest",
    email: "nhlimon.ssl@gmail.com",
    status: "Unknown",
    date: "04 January 2026",
    reason: "--",
  },
  {
    id: "2",
    sector: "Automobile",
    merchantName: "Demo Test Merchant",
    merchantId: "demotest",
    email: "nh.limon2010@gmail.com",
    status: "Unknown",
    date: "04 January 2026",
    reason: "--",
  },
  {
    id: "3",
    sector: "Automobile",
    merchantName: "Demo Test Merchant",
    merchantId: "demotest",
    email: "nh.limon29999@gmail.com",
    status: "Unknown",
    date: "04 January 2026",
    reason: "--",
  },
  {
    id: "4",
    sector: "Automobile",
    merchantName: "Demo Test Merchant",
    merchantId: "demotest",
    email: "sahaanik1040@gmail.com",
    status: "Unknown",
    date: "04 January 2026",
    reason: "--",
  },
  {
    id: "5",
    sector: "Automobile",
    merchantName: "Demo Test Merchant",
    merchantId: "demotest",
    email: "sahaanik1040@gmail.com",
    status: "Unknown",
    date: "04 January 2026",
    reason: "--",
  },
];

export default function EmailMessageAnalyticsPage() {
  const [appliedFilters, setAppliedFilters] = useState<Record<string, any>>({
    campaignName: "all",
    status: "all",
    sector: "all",
  });

  const [localFilters, setLocalFilters] =
    useState<Record<string, any>>(appliedFilters);

  useEffect(() => {
    setLocalFilters(appliedFilters);
  }, [appliedFilters]);

  const handleFilterChange = (key: string, value: any) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => setAppliedFilters(localFilters);

  const handleClearFilters = () => {
    const cleared = {
      campaignName: "all",
      status: "all",
      sector: "all",
    };
    setLocalFilters(cleared);
    setAppliedFilters(cleared);
  };

  const isFiltersChanged =
    JSON.stringify(localFilters) !== JSON.stringify(appliedFilters);

  const columns: ColumnDef<EmailAnalyticsRecord>[] = [
    {
      accessorKey: "merchantId",
      header: "Merchant",
      cell: ({ row }) => (
        <div className="flex flex-col py-0.5 group">
          <div className="text-xs font-semibold text-slate-900 leading-tight">
            {row.original.merchantName}
          </div>
          <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
            {row.original.merchantId}
            <GlobalCopyButton
              value={row.original.merchantId}
              className="!p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>
        </div>
      ),
      size: 200,
    },
    {
      accessorKey: "sector",
      header: "Sector",
      cell: ({ row }) => (
        <span className="text-xs text-slate-700 font-medium whitespace-nowrap">
          {row.original.sector}
        </span>
      ),
      size: 150,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="flex items-center gap-1 group/parent">
          <a
            href={`mailto:${row.original.email}`}
            className="text-xs text-slate-700 hover:text-primary-600 transition-colors font-medium underline-offset-2 hover:underline"
          >
            {row.original.email}
          </a>
          <CopyButton text={row.original.email} />
        </div>
      ),
      size: 250,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={clsx(
            STATUS_BADGE_CLASS,
            getEmailMessageStatusClass(row.original.status),
          )}
        >
          {row.original.status}
        </span>
      ),
      size: 120,
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-xs text-slate-700 font-medium whitespace-nowrap">
          {row.original.date}
        </span>
      ),
      size: 150,
    },
    {
      accessorKey: "reason",
      header: "Reason",
      cell: ({ row }) => (
        <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
          {row.original.reason}
        </span>
      ),
      size: 150,
    },
  ];

  const filterConfig = [
    {
      key: "campaignName",
      label: "Campaign Name",
      type: "select",
      options: [
        { label: "All Campaigns", value: "all" },
        { label: "Campaign New", value: "Campaign New" },
        { label: "Campaign Flash Sale", value: "Campaign Flash Sale" },
      ],
    },
    {
      key: "status",
      label: "Campaign Status",
      type: "select",
      options: [
        { label: "All Status", value: "all" },
        { label: "Sent", value: "Sent" },
        { label: "Failed", value: "Failed" },
        { label: "Bounced", value: "Bounced" },
        { label: "Unknown", value: "Unknown" },
      ],
    },
    {
      key: "sector",
      label: "Sector",
      type: "select",
      options: [
        { label: "All Sector", value: "all" },
        { label: "Automobile", value: "Automobile" },
        { label: "Retail Outlet", value: "Retail Outlet" },
      ],
    },
  ];

  const metrics = useMemo(() => {
    return {
      merchants: 1,
      sent: 5,
      bounced: 0,
      failed: 5,
    };
  }, []);

  const filteredData = useMemo(() => {
    return MOCK_DATA.filter((item) => {
      const matchesStatus =
        appliedFilters.status === "all" ||
        item.status === appliedFilters.status;
      const matchesSector =
        appliedFilters.sector === "all" ||
        item.sector === appliedFilters.sector;
      return matchesStatus && matchesSector;
    });
  }, [appliedFilters]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">
            Email & Message Analytics
          </h1>
          <p className="text-slate-500 text-sm tracking-tight">
            View and analyze campaign communication delivery performance.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-3">
          <FilterBar
            filters={localFilters}
            onFilterChange={handleFilterChange}
            config={filterConfig as any}
          />

          <button
            onClick={handleApplyFilters}
            disabled={!isFiltersChanged}
            className={clsx(
              "flex items-center gap-2 px-6 py-1.5 text-sm font-semibold rounded-full transition-all shadow-sm ml-2",
              isFiltersChanged
                ? "bg-primary-600 hover:bg-primary-700 text-white hover:shadow-md active:scale-95"
                : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200",
            )}
          >
            Apply Filters
          </button>

          {Object.values(localFilters).some((v) => v !== "all" && v !== "") && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium px-2 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-slate-900">Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Merchants"
              value={metrics.merchants.toString()}
            />
            <MetricCard title="Email Sent" value={metrics.sent.toString()} />
            <MetricCard title="Bounced" value={metrics.bounced.toString()} />
            <MetricCard
              title="Failed"
              value={metrics.failed.toString()}
              valueClassName="text-rose-600"
            />
          </div>
        </div>

        <div className="pt-4 overflow-x-auto">
          <DataTable
            columns={columns}
            data={filteredData}
            hideToolbarDateFilter={true}
            viewButtonLabel="View Column"
            filterActions={
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-slate-900 ml-1">
                  Showing analytics data
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 rounded-full border border-slate-200 shadow-sm">
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
