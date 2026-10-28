import { forwardRef, useImperativeHandle, useMemo } from "react";
import type { ReportSection } from "../reportRegistry";
import type { ReportFilters } from "../reportApi";
import { Download } from "lucide-react";
import { clsx } from "clsx";
import { DataTable } from "../../../../components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";

interface IncentiveReportProps {
  sections: ReportSection[];
  filters: ReportFilters;
}

export interface IncentiveReportHandle {
  exportData: () => void;
}

interface IncentiveEntry {
  referenceId: string;
  storeId: string;
  month: string;
  target: string;
  status: string;
  incentiveAmount: string;
  settlementStatus: string;
  settlementDate: string;
}

const StatusBadge = ({
  status,
  type = "incentive",
}: {
  status: string;
  type?: "incentive" | "settlement";
}) => {
  const incentiveStyles = {
    Generated: "bg-blue-50 text-blue-600",
    Paid: "bg-emerald-50 text-emerald-600",
    Pending: "bg-amber-50 text-amber-600",
  };

  const settlementStyles = {
    Settled: "bg-emerald-50 text-emerald-600",
    Bounce: "bg-rose-50 text-rose-600",
    Processing: "bg-blue-50 text-blue-600",
  };

  const styles = type === "incentive" ? incentiveStyles : settlementStyles;
  const currentStyle =
    styles[status as keyof typeof styles] || "bg-slate-100 text-slate-500";

  return (
    <span
      className={clsx(
        "px-2 py-0.5 rounded-full text-xs font-medium capitalize whitespace-nowrap inline-block",
        currentStyle,
      )}
    >
      {status}
    </span>
  );
};

export const IncentiveReport = forwardRef<
  IncentiveReportHandle,
  IncentiveReportProps
>(({ sections, filters }, ref) => {
  const data = useMemo(() => {
    const section = sections.find((s) => s.sectionId === "incentive-report-1");
    return (section?.customData || []) as IncentiveEntry[];
  }, [sections]);

  const filteredData = useMemo(() => {
    let result = [...data];

    if (filters.status && filters.status !== "all") {
      result = result.filter(
        (item) => item.status.toLowerCase() === filters.status?.toLowerCase(),
      );
    }

    if (filters.storeId) {
      const search = filters.storeId.toLowerCase();
      result = result.filter((item) =>
        item.storeId.toLowerCase().includes(search),
      );
    }

    return result;
  }, [data, filters.status, filters.storeId]);

  const columns = useMemo<ColumnDef<IncentiveEntry>[]>(
    () => [
      {
        accessorKey: "settlementDate",
        header: "Date",
        cell: ({ row }) => (
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
            {row.original.settlementDate}
          </span>
        ),
      },
      {
        accessorKey: "referenceId",
        header: "Reference ID",
        cell: ({ row }) => (
          <span className="text-xs font-normal text-slate-600">
            {row.original.referenceId}
          </span>
        ),
      },
      {
        accessorKey: "storeId",
        header: "Store ID",
        cell: ({ row }) => (
          <span className="text-xs font-normal text-slate-600">
            {row.original.storeId}
          </span>
        ),
      },
      {
        accessorKey: "month",
        header: "Month",
        cell: ({ row }) => (
          <span className="text-xs font-medium text-slate-600">
            {row.original.month}
          </span>
        ),
      },
      {
        accessorKey: "target",
        header: "Target",
        cell: ({ row }) => (
          <span className="text-xs font-medium text-slate-600 tabular-nums">
            {row.original.target}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "incentiveAmount",
        header: "Incentive Amount",
        cell: ({ row }) => (
          <span className="text-xs font-semibold text-slate-800 tabular-nums">
            {row.original.incentiveAmount}
          </span>
        ),
      },
      {
        accessorKey: "settlementStatus",
        header: "Settlement Status",
        cell: ({ row }) => (
          <StatusBadge
            status={row.original.settlementStatus}
            type="settlement"
          />
        ),
      },
    ],
    [],
  );

  const generateCsvContent = () => {
    const headers = [
      "Reference ID",
      "Store ID",
      "Month",
      "Target",
      "Status",
      "Incentive Amount",
      "Settlement Status",
      "Settlement Date",
    ];
    const rows = filteredData.map((item) => [
      item.referenceId,
      item.storeId,
      item.month,
      item.target.replace("৳ ", ""),
      item.status,
      item.incentiveAmount.replace("৳ ", ""),
      item.settlementStatus,
      item.settlementDate,
    ]);

    if (rows.length === 0) return null;
    return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  };

  const downloadCsv = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCSV = () => {
    const content = generateCsvContent();
    if (content) {
      downloadCsv(
        content,
        `incentive-report-${new Date().toISOString().split("T")[0]}.csv`,
      );
    } else {
      alert("No rows to export for current filters.");
    }
  };

  useImperativeHandle(ref, () => ({
    exportData: handleExportCSV,
  }));

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
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
              Showing incentive report data
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 rounded-full border border-slate-200">
              {filteredData.length}
            </span>
          </div>
        }
      />
    </div>
  );
});

IncentiveReport.displayName = "IncentiveReport";
