import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { clsx } from "clsx";
import {
  Download,
  Eye,
  FileSpreadsheet,
  ListOrdered,
  Mail,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
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
import type { ResellerAccountingRecord } from "./types/resellerAccounting";
import {
  buildFilterSearchParams,
  matchesDateRange,
  parseUrlFilters,
} from "./utils/resellerListFilters";
import { formatResellerDate } from "./utils/resellerDateFormat";

const actionButtonClass = "flex flex-col items-center gap-0 group";
const iconWrapClass =
  "pt-1.5 px-1.5 pb-0 hover:bg-slate-100 rounded text-slate-400 group-hover:text-primary-600 transition-colors";
const actionLabelClass =
  "text-[9px] font-medium text-slate-500 group-hover:text-primary-600 transition-colors";

const filterConfig: FilterConfig[] = [
  { key: "date", type: "date-range", label: "Date" },
  {
    key: "transactionId",
    type: "input",
    label: "Transaction Id",
    placeholder: "Transaction Id",
  },
];

export default function ResellerAccountingPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => parseUrlFilters(searchParams), [searchParams]);
  const [localFilters, setLocalFilters] =
    useState<Record<string, unknown>>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const { data: records = [] } = useQuery({
    queryKey: ["reseller-accounting-list"],
    queryFn: () => api.resellerAccounting.list(),
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
    const transactionId =
      typeof filters.transactionId === "string"
        ? filters.transactionId
        : undefined;

    return records.filter((item) => {
      if (
        !matchesDateRange(item.settlementDate, datePreset, dateFrom, dateTo)
      ) {
        return false;
      }

      const matchesTransactionId =
        !transactionId ||
        item.transactionId.toLowerCase().includes(transactionId.toLowerCase());

      return matchesTransactionId;
    });
  }, [records, filters]);

  const handleExportCSV = () => {
    if (!filteredData.length) return;

    const headers = [
      "Settlement Date",
      "Bank Account Name",
      "Bank Account ID",
      "Store Amount",
      "Refund+Charge Amt",
      "Paid Amount",
      "Transaction Id",
    ];

    const rows = filteredData.map((item) => [
      formatResellerDate(item.settlementDate),
      item.bankAccountName.replace(/,/g, ""),
      item.bankAccountId,
      formatNumber(item.storeAmount),
      formatNumber(item.refundChargeAmount),
      formatNumber(item.paidAmount),
      item.transactionId,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `reseller_accounting_export_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResendEmail = (record: ResellerAccountingRecord) => {
    toast.success(`Settlement email re-sent for ${record.bankAccountName}`);
  };

  const handleGenerateExcel = (record: ResellerAccountingRecord) => {
    const headers = [
      "Settlement Date",
      "Bank Account Name",
      "Store Amount",
      "Refund+Charge Amt",
      "Paid Amount",
    ];
    const row = [
      formatResellerDate(record.settlementDate),
      record.bankAccountName.replace(/,/g, ""),
      formatNumber(record.storeAmount),
      formatNumber(record.refundChargeAmount),
      formatNumber(record.paidAmount),
    ];
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), row.join(",")].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `reseller_accounting_${record.id}_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Excel details generated");
  };

  const columns = useMemo<ColumnDef<ResellerAccountingRecord>[]>(
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
        accessorKey: "bankAccountName",
        header: "Bank Account",
        cell: ({ row }) => (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-slate-900 leading-tight">
              {row.original.bankAccountName}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono p-1 bg-slate-50 border border-slate-100 rounded leading-none text-slate-500">
                {row.original.bankAccountId}
              </span>
              <CopyButton value={row.original.bankAccountId} />
            </div>
          </div>
        ),
      },
      {
        accessorKey: "transactionId",
        header: "Transaction ID",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono p-1 bg-slate-50 border border-slate-100 rounded leading-none text-slate-500">
              {row.original.transactionId}
            </span>
            <CopyButton value={row.original.transactionId} />
          </div>
        ),
      },
      {
        accessorKey: "storeAmount",
        header: "Store Amt",
        cell: ({ row }) => (
          <span className="text-xs text-slate-700">
            {formatNumber(row.original.storeAmount)}
          </span>
        ),
      },
      {
        accessorKey: "refundChargeAmount",
        header: "Refund+Charge",
        cell: ({ row }) => (
          <span className="text-xs text-slate-700">
            {formatNumber(row.original.refundChargeAmount)}
          </span>
        ),
      },
      {
        accessorKey: "paidAmount",
        header: "Paid",
        cell: ({ row }) => (
          <span className="text-xs text-slate-700">
            {formatNumber(row.original.paidAmount)}
          </span>
        ),
      },
      {
        accessorKey: "settlementDate",
        header: "Settlement Date",
        cell: ({ row }) => (
          <span className="text-xs text-slate-600">
            {formatResellerDate(row.original.settlementDate)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Action",
        cell: ({ row }) => (
          <div className="flex items-center gap-2 whitespace-nowrap">
            <UITooltip content="Payment Info">
              <Link
                to={`/resellers/accounting/${row.original.id}/payment-info`}
                onClick={(e) => e.stopPropagation()}
                className={actionButtonClass}
              >
                <div className={iconWrapClass}>
                  <Eye className="w-3.5 h-3.5" />
                </div>
                <span className={actionLabelClass}>Payment</span>
              </Link>
            </UITooltip>
            <UITooltip content="Trans Summary">
              <Link
                to={`/resellers/accounting/${row.original.id}/summary`}
                onClick={(e) => e.stopPropagation()}
                className={actionButtonClass}
              >
                <div className={iconWrapClass}>
                  <ListOrdered className="w-3.5 h-3.5" />
                </div>
                <span className={actionLabelClass}>Summary</span>
              </Link>
            </UITooltip>
            <UITooltip content="Resend Email">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleResendEmail(row.original);
                }}
                className={actionButtonClass}
              >
                <div className={iconWrapClass}>
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <span className={actionLabelClass}>Re-Send</span>
              </button>
            </UITooltip>
            <UITooltip content="Details in Excel">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleGenerateExcel(row.original);
                }}
                className={actionButtonClass}
              >
                <div className={iconWrapClass}>
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                </div>
                <span className={actionLabelClass}>Generate</span>
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
          Reseller Accounting
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
                Showing reseller accounting data
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
