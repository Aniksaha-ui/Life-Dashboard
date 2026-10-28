// Report Section - Reusable section component with table and actions
import { Info, Download, ExternalLink } from "lucide-react";
import type { ReportSection as SectionType } from "../reportRegistry";

interface ReportSectionProps {
  section: SectionType;
  onExport: () => void;
  onExplore: () => void;
}

export function ReportSection({
  section,
  onExport,
  onExplore,
}: ReportSectionProps) {
  return (
    <div className="border-b border-slate-100 pb-6 last:border-b-0 last:pb-0">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-slate-900">
            {section.title}
          </h3>
          <button className="p-1 text-slate-400 hover:text-slate-600 transition-colors">
            <Info className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          {section.exportable && (
            <button
              onClick={onExport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          )}
          {section.explorable && (
            <button
              onClick={onExplore}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Explore
            </button>
          )}
        </div>
      </div>

      {/* Section Table */}
      <div className="space-y-0">
        {section.rows.map((row, index) => (
          <div
            key={index}
            className={`flex items-center justify-between py-3 ${
              index < section.rows.length - 1 ? "border-b border-slate-50" : ""
            } ${row.isHighlighted ? "bg-slate-50 -mx-4 px-4 rounded" : ""}`}
          >
            <span className="text-sm text-slate-600">{row.label}</span>
            <span className="text-sm font-medium text-slate-900 tabular-nums">
              {row.amount}
            </span>
          </div>
        ))}

        {/* Total Row */}
        {section.total && (
          <div className="flex items-center justify-between py-3 mt-2 border-t border-slate-200">
            <span className="text-sm font-semibold text-slate-900">
              {section.total.label}
            </span>
            <span className="text-sm font-bold text-slate-900 tabular-nums">
              {section.total.amount}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
