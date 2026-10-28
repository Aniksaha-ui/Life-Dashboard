import { clsx } from "clsx";
import { Clock, Copy } from "lucide-react";
import { useState } from "react";
import { Drawer } from "../../../components/Drawer";
import { useTransactionLog } from "../api/queries";
import type { FileLogsDrawerProps } from "../types";

const SectionHeader = ({ title }: { title: string }) => (
  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1 mb-3">
    {title}
  </h4>
);

export function FileLogsDrawer({
  tid,
  txnId,
  ip,
  onClose,
}: FileLogsDrawerProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data, isLoading } = useTransactionLog(tid);
  const logs = data?.logs || [];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Drawer
      open={!!txnId && !!ip}
      onClose={onClose}
      title="File Logs"
      subtitle={
        txnId ? (
          <div className="flex items-center gap-1.5 mt-1">
            <span>{txnId}</span>
            <button
              onClick={() => handleCopy(txnId, "headerCopy")}
              className={clsx(
                "p-1 rounded transition-colors",
                copiedId === "headerCopy"
                  ? "text-emerald-600 bg-emerald-50"
                  : "text-slate-300 hover:text-slate-600 hover:bg-slate-100",
              )}
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <span className="text-slate-300 mx-1">•</span>
            <span className="text-slate-500 font-mono text-xs">{ip}</span>
          </div>
        ) : undefined
      }
      width="xl"
    >
      <div className="pb-6 bg-slate-50/30 -mx-6 -my-6 p-4 space-y-4">
        {/* Banner-style info */}
        <div className="p-3 rounded-lg flex items-center justify-between gap-3 bg-slate-100 border border-slate-200">
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-slate-500" />
            <div>
              <p className="font-bold text-xs uppercase tracking-tight text-slate-700">
                Audit Logs: Diagnostic View
              </p>
              <p className="text-[9px] text-slate-500 font-medium leading-none mt-1">
                Source IP: {ip}
              </p>
            </div>
          </div>
        </div>

        <SectionHeader title="Log Entries" />

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-400">
            <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-medium animate-pulse">Loading logs...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.length > 0 ? (
              logs.map((log, index) => (
                <div
                  key={index}
                  className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-0.5 px-1.5 bg-slate-50 border border-slate-100 rounded flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span className="text-[9px] font-mono font-bold text-slate-600 uppercase">
                          {log.logs_on}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-slate-300">
                        |
                      </span>
                      <span className="text-[9px] font-mono text-slate-400">
                        TID: {log.tid}
                      </span>
                    </div>
                    <div className="px-1.5 py-0.5 bg-slate-900/5 rounded text-[9px] font-bold text-slate-600 uppercase tracking-wide border border-slate-200/50">
                      {log.stage}
                    </div>
                  </div>

                  <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100/50">
                    <div className="font-mono text-[10px] text-slate-700 whitespace-pre-wrap wrap-break-word leading-normal">
                      {log.descriptions
                        .split(/(\bSUCCESS\b|\bFAILED\b|\bVALID\b)/g)
                        .map((part, i) => {
                          if (part === "SUCCESS")
                            return (
                              <span
                                key={i}
                                className="text-emerald-600 font-bold underline decoration-emerald-200 underline-offset-2"
                              >
                                {part}
                              </span>
                            );
                          if (part === "FAILED")
                            return (
                              <span
                                key={i}
                                className="text-rose-600 font-bold underline decoration-rose-200 underline-offset-2"
                              >
                                {part}
                              </span>
                            );
                          if (part === "VALID")
                            return (
                              <span
                                key={i}
                                className="text-blue-600 font-bold underline decoration-blue-200 underline-offset-2"
                              >
                                {part}
                              </span>
                            );
                          return part;
                        })}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white p-10 rounded-xl border border-dashed border-slate-200 text-center">
                <p className="text-slate-400 text-xs">
                  No logs found for this IP.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Drawer>
  );
}
