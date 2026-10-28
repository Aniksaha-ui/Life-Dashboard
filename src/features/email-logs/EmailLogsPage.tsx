import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState, useEffect } from "react";
import { Link, useSearchParams, Outlet } from "react-router-dom";
import { Download } from "lucide-react";
import { DataTable } from "../../components/DataTable";
import {
  FilterBar,
  ClearAllFiltersButton,
  type FilterConfig,
} from "../../components/FilterBar";
import { clsx } from "clsx";
import type { EmailLog } from "./types";
import {
  STATUS_BADGE_CLASS,
  getEmailLogStatusClass,
} from "../../utils/statusBadge";

const mockLogs: EmailLog[] = [
  {
    id: "1",
    recipient: "mostafizur.mazumder@sslwirless.com",
    subject: "SSLCOMMERZ Merchant Hold Notification",
    mailableName: "ESCROW_CONFIRMATION",
    status: "initial",
    createdAt: "2023-11-21 21:21:18",
  },
  {
    id: "2",
    recipient: "mostafizur.mazumder@sslwirless.com",
    subject: "SSLCOMMERZ Merchant Hold Notification",
    mailableName: "EASYUTILITYPAYMENT",
    status: "sent",
    createdAt: "2023-11-21 21:22:18",
  },
  {
    id: "3",
    recipient: "mostafizur.mazumder@sslwirless.com",
    subject: "SSLCOMMERZ Merchant Hold Notification",
    mailableName: "RegenerateSession",
    status: "failed",
    createdAt: "2023-11-21 21:23:18",
  },
  {
    id: "4",
    recipient: "sajan.sslwireless@gmail.com",
    subject: "SSLCOMMERZ Merchant Hold Notification",
    mailableName: "BANKINVOICE_SETTLE_MAIL",
    status: "sent",
    createdAt: "2023-11-21 21:24:18",
  },
  {
    id: "5",
    recipient: "sajan.sslwireless@gmail.com",
    subject: "SSLCOMMERZ Merchant Hold Notification",
    mailableName: "INVOICE_SETTLE_MAIL",
    status: "initial",
    createdAt: "2023-11-21 21:25:18",
  },
  {
    id: "6",
    recipient: "sajan.sslwireless@gmail.com",
    subject: "SSLCOMMERZ Merchant Hold Notification",
    mailableName: "ESCROW_CONFIRMATION",
    status: "sent",
    createdAt: "2023-11-21 21:26:18",
  },
  {
    id: "7",
    recipient: "sajan.sslwireless@gmail.com",
    subject: "SSLCOMMERZ Merchant Hold Notification",
    mailableName: "EASYUTILITYPAYMENT",
    status: "failed",
    createdAt: "2023-11-21 21:27:18",
  },
  {
    id: "8",
    recipient: "sajan.sslwireless@gmail.com",
    subject: "SSLCOMMERZ Merchant Hold Notification",
    mailableName: "RegenerateSession",
    status: "sent",
    createdAt: "2023-11-21 21:28:18",
  },
  {
    id: "9",
    recipient: "test@example.com",
    subject: "SSLCOMMERZ Merchant Hold Notification",
    mailableName: "INVOICE_SETTLE_MAIL",
    status: "sent",
    createdAt: "2023-11-21 21:29:18",
  },
  {
    id: "10",
    recipient: "sajan.sslwireless@gmail.com",
    subject: "SSLCOMMERZ Merchant Hold Notification",
    mailableName: "EASYUTILITYPAYMENT",
    status: "initial",
    createdAt: "2023-11-21 21:30:18",
  },
];

const filterConfig: FilterConfig[] = [
  { key: "recipient", type: "input", label: "Email" },
  { key: "subject", type: "input", label: "Subject" },
  {
    key: "mailableName",
    type: "select",
    label: "Mailable Name",
    options: [
      { label: "All Types", value: "all" },
      { label: "EASYUTILITYPAYMENT", value: "EASYUTILITYPAYMENT" },
      { label: "ESCROW_CONFIRMATION", value: "ESCROW_CONFIRMATION" },
      { label: "RegenerateSession", value: "RegenerateSession" },
      { label: "BANKINVOICE_SETTLE_MAIL", value: "BANKINVOICE_SETTLE_MAIL" },
      { label: "INVOICE_SETTLE_MAIL", value: "INVOICE_SETTLE_MAIL" },
    ],
  },
];

export default function EmailLogsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

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
    const headers = [
      "#",
      "Multiple_to",
      "Email Subject",
      "Mailable Name",
      "Status",
      "Date",
    ];
    const rows = filteredData.map((item: EmailLog, index) => [
      index + 1,
      item.recipient,
      item.subject.replace(/,/g, ""),
      item.mailableName,
      item.status,
      item.createdAt,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `email_logs_export_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredData = useMemo(() => {
    return mockLogs.filter((item: EmailLog) => {
      const matchesRecipient =
        !filters.recipient ||
        item.recipient.toLowerCase().includes(filters.recipient.toLowerCase());
      const matchesSubject =
        !filters.subject ||
        item.subject.toLowerCase().includes(filters.subject.toLowerCase());
      const matchesMailable =
        !filters.mailableName ||
        filters.mailableName === "all" ||
        item.mailableName === filters.mailableName;

      return matchesRecipient && matchesSubject && matchesMailable;
    });
  }, [filters]);

  const columns = useMemo<ColumnDef<EmailLog>[]>(
    () => [
      {
        id: "index",
        header: "#",
        accessorFn: (_, index) => index + 1,
        cell: (info) => (
          <span className="text-xs text-slate-500">
            {info.getValue() as number}
          </span>
        ),
        size: 50,
      },
      {
        accessorKey: "recipient",
        header: "Multiple_to",
        cell: (info) => (
          <span className="text-xs font-semibold text-slate-700">
            {info.getValue() as string}
          </span>
        ),
        size: 300,
      },
      {
        accessorKey: "subject",
        header: "Email Subject",
        cell: (info) => (
          <span
            className="text-xs text-slate-600 truncate max-w-[250px]"
            title={info.getValue() as string}
          >
            {info.getValue() as string}
          </span>
        ),
        size: 300,
      },
      {
        accessorKey: "mailableName",
        header: "Mailable Name",
        cell: (info) => (
          <code className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded text-[10px] font-mono text-slate-500">
            {info.getValue() as string}
          </code>
        ),
        size: 200,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => {
          const status = info.getValue() as string;
          return (
            <span
              className={clsx(
                STATUS_BADGE_CLASS,
                getEmailLogStatusClass(status),
              )}
            >
              {status}
            </span>
          );
        },
        size: 100,
      },
      {
        id: "actions",
        header: "Action",
        cell: ({ row }) => (
          <Link
            to={`/email-logs/${row.original.id}`}
            className="text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline"
          >
            View
          </Link>
        ),
        size: 80,
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Email Log
        </h1>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        <FilterBar
          filters={localFilters}
          onFilterChange={handleFilterChange}
          config={filterConfig}
        />
        <ClearAllFiltersButton onClick={clearFilters} filters={localFilters} />

        <button
          onClick={applyFilters}
          disabled={JSON.stringify(localFilters) === JSON.stringify(filters)}
          className={clsx(
            "flex items-center gap-2 px-6 py-1.5 text-sm font-bold rounded-full transition-all shadow-sm ml-2",
            JSON.stringify(localFilters) !== JSON.stringify(filters)
              ? "bg-primary-600 hover:bg-primary-700 text-white"
              : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200",
          )}
        >
          Search
        </button>
      </div>

      <div className="pt-2">
        <DataTable
          columns={columns}
          data={filteredData}
          hideToolbarDateFilter
          className="border-none bg-transparent shadow-none"
          rowBorderColor="divide-slate-200/50"
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
              <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 rounded-full border border-slate-200">
                {filteredData.length}
              </span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                records showing
              </span>
            </div>
          }
        />
      </div>

      <Outlet />
    </div>
  );
}
