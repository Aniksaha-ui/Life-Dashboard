import type { ColumnDef } from "@tanstack/react-table";
import type { ReportRow } from "../types";
import { reportLabel, reportValue } from "../utils/reportMapper";

const ignoredKeys = new Set(["serial", "id", "created_at", "updated_at"]);

export const getReportColumns = (rows: ReportRow[]): ColumnDef<ReportRow>[] => {
  const keys = Array.from(
    rows.reduce((allKeys, row) => {
      Object.keys(row).forEach((key) => {
        if (!ignoredKeys.has(key) && typeof row[key] !== "object")
          allKeys.add(key);
      });
      return allKeys;
    }, new Set<string>()),
  );

  return [
    { accessorKey: "serial", header: "SL" },
    ...keys.map((key) => ({
      accessorKey: key,
      header: reportLabel(key),
      cell: ({ row }: { row: { original: ReportRow } }) => (
        <span className="break-words text-slate-700">
          {reportValue(key, row.original[key])}
        </span>
      ),
    })),
  ];
};
