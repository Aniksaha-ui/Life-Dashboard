// CSV Export Utility
import type { ReportSection, ReportRow } from "../reportRegistry";

export interface ExportParams {
  reportId: string;
  sectionId: string;
  from: string;
  to: string;
}

export const exportSectionToCsv = (
  section: ReportSection,
  params: ExportParams,
): void => {
  const { reportId, sectionId, from, to } = params;

  // Build CSV content
  const headers = ["Description", "Amount"];
  const rows: string[][] = section.rows.map((row: ReportRow) => [
    row.label,
    row.amount,
  ]);

  // Add total row if exists
  if (section.total) {
    rows.push([section.total.label, section.total.amount]);
  }

  // Convert to CSV string
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","),
    ),
  ].join("\n");

  // Create blob and trigger download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  // Generate filename
  const filename = `${reportId}-${sectionId}-${from}-${to}.csv`;

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
