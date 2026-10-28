import { clsx } from "clsx";
import { Clock, MinusCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { Drawer } from "../../../../components/Drawer";
import { Skeleton } from "../../../../components/Skeleton";
import { useEMIOperationDetails } from "../api/queries";
import type { EMIDrawerProps } from "../types";
import { getStatusColor } from "./columns";

const getStatusIcon = (status: number) => {
  switch (status) {
    case 1:
      return Clock; // Requested
    case 0:
      return XCircle; // Declined
    case 2:
      return Clock; // Processing
    case 3:
      return MinusCircle; // Initial
    default:
      return MinusCircle;
  }
};

export function EMIDrawer({ emiId, onClose }: EMIDrawerProps) {
  const [action, setAction] = useState<"details" | "proceed" | "cancel">(
    "details",
  );
  const [remarks, setRemarks] = useState("");

  const { data: item, isLoading } = useEMIOperationDetails(emiId);

  const handleBack = () => {
    setAction("details");
    setRemarks("");
  };

  const isOpen = !!emiId;

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title={
        action === "details"
          ? "EMI Operation Details"
          : action === "proceed"
            ? "Proceed EMI Request"
            : "Cancel EMI Request"
      }
      subtitle={item?.emi_ref_id || "Loading..."}
      width="lg"
    >
      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      ) : item ? (
        <div className="space-y-6">
          {action === "details" ? (
            <>
              {/* Status Banner */}
              <div
                className={clsx(
                  "p-4 rounded-lg flex items-center justify-between gap-3 border border-slate-200",
                  getStatusColor(item.request_status),
                )}
              >
                <div className="flex items-center gap-3">
                  {(() => {
                    const Icon = getStatusIcon(item.request_status);
                    return Icon ? <Icon className="w-5 h-5" /> : null;
                  })()}
                  <div>
                    <p className="font-bold text-sm uppercase tracking-tight">
                      Status: {item.request_status_label}
                    </p>
                    <p className="text-[10px] opacity-90 font-medium">
                      EMI Ref ID: {item.emi_ref_id}
                    </p>
                  </div>
                </div>
              </div>

              {/* Summary Info - High Level */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-500 block mb-1">
                      TXN Amount
                    </span>
                    <span className="font-bold text-xl text-slate-900">
                      ৳{Number(item.tid).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">
                      EMI Amount
                    </span>
                    <span className="font-bold text-xl text-slate-900">
                      ৳{Number(item.emi_amount).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Information Details */}
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-3 block">
                  Information Details
                </h4>
                <div className="bg-white border border-slate-200 rounded-lg p-4 text-sm space-y-2.5">
                  <DetailRow label="Merchant Name" value={item.merchant_name} />
                  <DetailRow label="Store Name" value={item.store_name} />
                  <DetailRow label="Store Id" value={item.store_id} />
                  <DetailRow
                    label="Home Page of Store"
                    value={item.store_url}
                    isMono
                  />
                  <DetailRow
                    label="Bank Name"
                    value={item.emi_issuer_bank_name}
                    isBold
                    isUpper
                  />
                  <DetailRow label="Transaction Id" value={item.tid} isMono />
                  <DetailRow
                    label="Transaction Date"
                    value={item.bankssl_id}
                    isMono
                  />
                  <DetailRow
                    label="EMI Reference ID"
                    value={item.emi_ref_id}
                    isMono
                  />
                  <DetailRow
                    label="EMI Issuer Bank"
                    value={item.emi_issuer_bank_name}
                    isBold
                  />
                  <DetailRow
                    label="EMI Charge"
                    value={`৳${Number(item.emi_amount).toLocaleString()}`}
                    isBold
                  />
                  <DetailRow label="EMI Tenure" value={item.emi_month_label} />
                  <DetailRow
                    label="Requested Remarks"
                    value={item.request_remarks}
                  />
                  <DetailRow
                    label="Requested On"
                    value={new Date(item.request_on).toLocaleString()}
                  />
                </div>
              </div>

              {/* Actions */}
              {(item.can_proceed || item.can_cancel) && (
                <div className="flex gap-2 pt-4 border-t border-slate-200">
                  {item.can_proceed && (
                    <button
                      onClick={() => setAction("proceed")}
                      className="flex items-center justify-center flex-1 px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors shadow-sm"
                    >
                      Proceed
                    </button>
                  )}
                  {item.can_cancel && (
                    <button
                      onClick={() => setAction("cancel")}
                      className="flex items-center justify-center flex-1 px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-sm"
                    >
                      Cancel Request
                    </button>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-6 bg-white transition-all duration-300">
                {/* Form Fields */}
                <div className="flex flex-col gap-6">
                  {/* Remarks Field */}
                  <div className="grid grid-cols-3 items-center gap-4 group">
                    <label className="text-sm font-semibold text-slate-700 text-right pr-2">
                      <span className="text-rose-500 mr-1">*</span>Remarks
                    </label>
                    <div className="col-span-2">
                      <textarea
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Enter..."
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all min-h-[100px] resize-none placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {/* File Upload Field (Proceed Only) */}
                  {action === "proceed" && (
                    <div className="grid grid-cols-3 items-center gap-4 group">
                      <label className="text-sm font-semibold text-slate-700 text-right pr-2">
                        Cust. Signed EMI Form
                      </label>
                      <div className="col-span-2 space-y-2">
                        <div className="relative">
                          <input
                            type="file"
                            className="w-full px-4 py-1.5 border border-slate-200 rounded-lg text-sm cursor-pointer file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-[11px] file:font-semibold file:bg-slate-100 file:text-slate-600 hover:file:bg-slate-200 transition-all focus:outline-none"
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 italic leading-relaxed">
                          Allowed file type is{" "}
                          <span className="font-semibold">
                            jpg, jpeg, gif, png, pdf, doc
                          </span>{" "}
                          and file size must be in{" "}
                          <span className="font-semibold">200Kb</span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                <button
                  onClick={handleBack}
                  className="px-5 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all"
                >
                  Back to Details
                </button>
                <div className="flex gap-3">
                  <button
                    disabled={!remarks.trim()}
                    className={clsx(
                      "px-8 py-2.5 text-sm font-bold text-white rounded shadow-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed",
                      action === "proceed"
                        ? "bg-primary-600 hover:bg-primary-700"
                        : "bg-slate-800 hover:bg-slate-900 shadow-slate-200",
                    )}
                  >
                    {action === "proceed" ? "Proceed" : "Submit Cancellation"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 text-center text-slate-500">
          EMI Details not found.
        </div>
      )}
    </Drawer>
  );
}

function DetailRow({
  label,
  value,
  isMono,
  isBold,
  isUpper,
}: {
  label: string;
  value: any;
  isMono?: boolean;
  isBold?: boolean;
  isUpper?: boolean;
}) {
  return (
    <div className="flex justify-between border-b border-slate-100 pb-2">
      <span className="text-slate-500">{label}</span>
      <span
        className={clsx(
          "text-slate-900",
          isMono && "font-mono text-xs",
          isBold && "font-bold",
          isUpper && "uppercase",
        )}
      >
        {value || "-"}
      </span>
    </div>
  );
}
