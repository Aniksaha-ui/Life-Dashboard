import { useState } from "react";
import { clsx } from "clsx";
import { Search, CheckCircle2, XCircle, Info, History } from "lucide-react";
import { api } from "../../lib/api/client";
import { Loader } from "../../components/Loader";

export default function BankValidationPage() {
  const [sslId, setSslId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [hasChecked, setHasChecked] = useState(false);

  const handleCheckValidation = async () => {
    if (!sslId) return;

    setIsLoading(true);
    setHasChecked(true);
    try {
      const data = await api.bankValidation.validate(sslId);
      setResult(data);
    } catch (error) {
      console.error("Validation failed:", error);
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Bank Validation</h1>
        <p className="text-slate-500 text-sm">
          Verify and validate bank transaction identifiers.
        </p>
      </div>

      {/* Validation Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex flex-col gap-4">
            <label
              htmlFor="sslId"
              className="text-sm font-semibold text-slate-700"
            >
              Bank SSL ID
            </label>
            <p className="text-xs text-slate-500 -mt-2">
              A unique identifier generated at our end and passed to the bank
              for transaction/reference tracking.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 sm:max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="sslId"
                  type="text"
                  value={sslId}
                  onChange={(e) => setSslId(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleCheckValidation()
                  }
                  placeholder="Enter Bank SSL ID (e.g. EC52982026043000011)"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                />
              </div>
              <button
                onClick={handleCheckValidation}
                disabled={!sslId || isLoading}
                className={clsx(
                  "px-8 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 disabled:cursor-not-allowed disabled:active:scale-100",
                  isLoading && "animate-pulse",
                )}
              >
                {isLoading ? (
                  <>
                    <Loader size="xs" />
                    Checking...
                  </>
                ) : (
                  "Check Validation"
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 italic flex items-center gap-1.5">
              <Info className="w-3 h-3" />
              Use the exact Bank SSL ID provided by the bank to retrieve
              transaction details.
            </p>
          </div>
        </div>

        {/* Result Section */}
        {hasChecked && !isLoading && (
          <div className="border-t border-slate-100 bg-slate-50/30 p-6 md:p-8 animate-in fade-in slide-in-from-top-4 duration-500">
            {result ? (
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-200/60">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Bank Response
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Bank response retrieved successfully.
                    </p>
                  </div>
                </div>

                {/* Bank Response Section - Following project pattern */}
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                  <div className="flex items-center justify-between p-4 bg-white border-b border-slate-100">
                    <span className="text-sm font-semibold text-slate-800">
                      Bank Response
                    </span>
                    <History className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="p-5 bg-[#0f172a] overflow-x-auto">
                    <div className="font-mono text-[13px] text-[#4ade80] mb-4 border-b border-slate-800 pb-2 flex items-start gap-2">
                      <span className="text-slate-500 shrink-0">Raw:</span>
                      <span className="break-all">{result.raw || "N/A"}</span>
                    </div>
                    <div className="font-mono text-[13px] leading-relaxed">
                      {Object.entries(result.params || {}).map(
                        ([key, value]) => (
                          <div key={key} className="flex gap-2">
                            <span className="text-[#94a3b8] w-40 shrink-0">
                              {key.replace("_2", "")} :
                            </span>
                            <span className="text-[#4ade80]">
                              {String(value)}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mb-4">
                  <XCircle className="w-10 h-10 text-rose-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">
                  Bank Response
                </h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto">
                  We couldn't find any transaction matching the provided
                  identifier.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
