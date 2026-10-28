import { forwardRef, useImperativeHandle, useMemo } from "react";
import type { ReportSection } from "../reportRegistry";
import type { ReportFilters } from "../reportApi";
import { Download } from "lucide-react";
import { clsx } from "clsx";
import { DataTable } from "../../../../components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";

interface SettlementBounceReportProps {
  sections: ReportSection[];
  filters: ReportFilters;
}

export interface SettlementBounceReportHandle {
  exportData: () => void;
}

interface BounceEntry {
  trackingId: string;
  fileName: string;
  updatedBy: string;
  status: string;
  createdOn: string;
  updatedOn: string;
}

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    Processing: "bg-blue-100 text-blue-600",
    Success: "bg-emerald-100 text-emerald-600",
    Failed: "bg-rose-100 text-rose-600",
  };

  const currentStyle =
    styles[status as keyof typeof styles] || "bg-slate-100 text-slate-400";

  return (
    <span
      className={clsx(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
        currentStyle,
      )}
    >
      {status}
    </span>
  );
};

export const SettlementBounceReport = forwardRef<
  SettlementBounceReportHandle,
  SettlementBounceReportProps
>(({ sections, filters }, ref) => {
  const data = useMemo(() => {
    const section = sections.find((s) => s.sectionId === "kam-bounce-report-1");
    return (section?.customData || []) as BounceEntry[];
  }, [sections]);

  const filteredData = useMemo(() => {
    let result = [...data];
    if (filters.status && filters.status !== "all") {
      result = result.filter((item) => item.status === filters.status);
    }
    return result;
  }, [data, filters.status]);

  const columns = useMemo<ColumnDef<BounceEntry>[]>(
    () => [
      {
        accessorKey: "createdOn",
        header: "Created On",
        cell: ({ row }) => (
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
            {row.original.createdOn}
          </span>
        ),
      },
      {
        accessorKey: "updatedOn",
        header: "Updated On",
        cell: ({ row }) => (
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
            {row.original.updatedOn}
          </span>
        ),
      },
      {
        accessorKey: "trackingId",
        header: "Tracking ID",
        cell: ({ row }) => (
          <span className="text-xs font-normal text-slate-600">
            {row.original.trackingId}
          </span>
        ),
      },
      {
        accessorKey: "fileName",
        header: "File Name",
        cell: ({ row }) => (
          <span
            className="text-xs font-semibold text-slate-700 truncate max-w-[280px] block"
            title={row.original.fileName}
          >
            {row.original.fileName}
          </span>
        ),
      },
      {
        accessorKey: "updatedBy",
        header: "Updated By",
        cell: ({ row }) => (
          <span className="text-xs font-medium text-slate-600">
            {row.original.updatedBy}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
    ],
    [],
  );

  const generateCsvContent = () => {
    const headers = [
      "Created On",
      "Updated On",
      "Tracking ID",
      "File Name",
      "Updated By",
      "Status",
    ];
    const rows = filteredData.map((item) => [
      item.createdOn,
      item.updatedOn,
      item.trackingId,
      item.fileName,
      item.updatedBy,
      item.status,
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
        `settlement-bounce-report-${new Date().toISOString().split("T")[0]}.csv`,
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
              Showing settlement bounce data
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

SettlementBounceReport.displayName = "SettlementBounceReport";
