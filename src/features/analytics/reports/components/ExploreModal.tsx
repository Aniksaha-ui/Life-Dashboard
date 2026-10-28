// Explore Modal - Stub modal for Explore action
import { X } from "lucide-react";
import type { ReportFilters } from "../reportApi";

interface ExploreModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionTitle: string;
  filters: ReportFilters;
}

export function ExploreModal({
  isOpen,
  onClose,
  sectionTitle,
  filters,
}: ExploreModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-semibold text-slate-900 mb-2">
          Explore: {sectionTitle}
        </h2>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-amber-800">
            <strong>Note:</strong> Explore is a stub in this prototype. In a
            production environment, this would open an interactive data
            exploration interface.
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-700">
            Selected Filters
          </h3>
          <div className="bg-slate-50 rounded-lg p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">From</span>
              <span className="font-medium text-slate-900">{filters.from}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">To</span>
              <span className="font-medium text-slate-900">{filters.to}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Timezone</span>
              <span className="font-medium text-slate-900">{filters.tz}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
