import { clsx } from "clsx";

export type PortalDrawerView =
  "details" | "proceed" | "cancel" | "reject-document" | "accept-document";

interface PortalResellerActionButtonsProps {
  showProceed?: boolean;
  showCancel?: boolean;
  onProceed: () => void;
  onCancel: () => void;
  proceedLabel?: string;
  cancelLabel?: string;
}

export function PortalResellerActionButtons({
  showProceed = true,
  showCancel = true,
  onProceed,
  onCancel,
  proceedLabel = "Proceed",
  cancelLabel = "Cancel Request",
}: PortalResellerActionButtonsProps) {
  if (!showProceed && !showCancel) return null;

  return (
    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
      {showCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-sm cursor-pointer"
        >
          {cancelLabel}
        </button>
      )}
      {showProceed && (
        <button
          type="button"
          onClick={onProceed}
          className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors shadow-sm cursor-pointer"
        >
          {proceedLabel}
        </button>
      )}
    </div>
  );
}

interface PortalResellerActionFormProps {
  view: "proceed" | "cancel" | "reject-document" | "accept-document";
  remarks?: string;
  onRemarksChange?: (value: string) => void;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  proceedSubmitLabel?: string;
  cancelSubmitLabel?: string;
  remarksLabel?: string;
  remarksPlaceholder?: string;
  confirmMessage?: React.ReactNode;
  children?: React.ReactNode;
}

export function PortalResellerActionForm({
  view,
  remarks = "",
  onRemarksChange,
  onBack,
  onSubmit,
  isSubmitting = false,
  proceedSubmitLabel = "Proceed",
  cancelSubmitLabel = "Submit Cancellation",
  remarksLabel = "Remarks",
  remarksPlaceholder = "Enter...",
  confirmMessage,
  children,
}: PortalResellerActionFormProps) {
  const isRejectView = view === "cancel" || view === "reject-document";
  const isAcceptConfirm = view === "accept-document";
  const canSubmit = isAcceptConfirm ? true : !!remarks.trim();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 pb-8">
      <div className="space-y-6 bg-white transition-all duration-300">
        <div className="flex flex-col gap-6">
          {isAcceptConfirm ? (
            <div className="space-y-3">
              <p className="text-sm font-bold text-slate-900 leading-relaxed">
                {confirmMessage ??
                  "Are you sure you want to accept this document?"}
              </p>
              <p className="text-sm text-slate-500 leading-relaxed">
                N.B : Once you accept this document, the status will be updated.
              </p>
            </div>
          ) : (
            <div className="w-full space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                {remarksLabel}
              </label>
              <textarea
                value={remarks}
                onChange={(e) => onRemarksChange?.(e.target.value)}
                placeholder={remarksPlaceholder}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all min-h-[100px] resize-none placeholder:text-slate-400"
              />
            </div>
          )}
          {children}
        </div>
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all"
        >
          Back to Details
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            disabled={!canSubmit || isSubmitting}
            onClick={onSubmit}
            className={clsx(
              "flex items-center justify-center px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed",
              isRejectView
                ? "bg-rose-500 hover:bg-rose-600"
                : "bg-primary-600 hover:bg-primary-700",
            )}
          >
            {view === "proceed" || view === "accept-document"
              ? proceedSubmitLabel
              : cancelSubmitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function getPortalDrawerTitle(
  view: PortalDrawerView,
  titles: {
    details: React.ReactNode;
    proceed: string;
    cancel: string;
    rejectDocument?: React.ReactNode;
    acceptDocument?: React.ReactNode;
  },
) {
  if (view === "proceed") return titles.proceed;
  if (view === "cancel") return titles.cancel;
  if (view === "reject-document") return titles.rejectDocument ?? titles.cancel;
  if (view === "accept-document")
    return titles.acceptDocument ?? titles.proceed;
  return titles.details;
}
