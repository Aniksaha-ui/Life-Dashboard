// About Report Panel - Right sidebar information panel
import { ExternalLink } from "lucide-react";

interface AboutReportPanelProps {
  aboutText: string;
  docsUrl: string;
}

export function AboutReportPanel({
  aboutText,
  docsUrl,
}: AboutReportPanelProps) {
  return (
    <div className="bg-slate-50 rounded-xl p-5 sticky top-6">
      <h3 className="text-sm font-semibold text-slate-900 mb-3">
        About this report
      </h3>
      <p className="text-sm text-slate-600 leading-relaxed mb-4">{aboutText}</p>
      <a
        href={docsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
      >
        View docs
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </div>
  );
}
