import { clsx } from "clsx";
import { Check } from "lucide-react";
import { KAM_TASK_ITEMS } from "../kamTaskState";
import { useKamTaskState } from "../hooks/useKamTaskState";

export { KAM_TASK_ITEMS } from "../kamTaskState";

interface KamTaskListProps {
  merchantId?: string;
  className?: string;
  onTasksChange?: () => void;
}

export function KamTaskList({
  merchantId,
  className,
  onTasksChange,
}: KamTaskListProps) {
  const {
    completedCount,
    pendingIndices,
    editingIdx,
    tempNote,
    error,
    setTempNote,
    setError,
    handleItemClick,
    handleDone,
    handleCancel,
  } = useKamTaskState(merchantId, { onTasksChange });

  return (
    <div
      id="kam-tasks"
      className={clsx(
        "bg-white border border-slate-200 rounded-xl p-5 shadow-sm text-left scroll-mt-6",
        className,
      )}
    >
      <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-3">
        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          KAM Task List
        </h3>
        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
          {completedCount} of {KAM_TASK_ITEMS.length} completed
        </span>
      </div>
      <div className="space-y-4">
        {pendingIndices.length === 0 ? (
          <p className="text-sm text-slate-500 py-2">
            All tasks completed. View completed tasks in the History tab.
          </p>
        ) : (
          pendingIndices.map((idx) => {
            const item = KAM_TASK_ITEMS[idx];
            return (
              <div key={idx} className="space-y-2">
                <div
                  onClick={() => handleItemClick(idx)}
                  className="flex items-start gap-3 py-1 transition-all select-none group cursor-pointer"
                >
                  <div className="relative flex items-center justify-center mt-[3px]">
                    <div
                      className={clsx(
                        "w-4 h-4 border transition-all flex items-center justify-center",
                        editingIdx === idx
                          ? "rounded bg-primary-600 border-primary-600 shadow-sm"
                          : "rounded border-slate-300 group-hover:border-primary-400",
                      )}
                    >
                      {editingIdx === idx && (
                        <Check
                          className="w-2.5 h-2.5 text-white transition-opacity opacity-40"
                          strokeWidth={5}
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm text-slate-600 group-hover:text-primary-600 transition-all">
                      {item}
                    </span>
                  </div>
                </div>

                {editingIdx === idx && (
                  <div className="ml-7 space-y-2 animate-in slide-in-from-left-2 duration-200">
                    <div className="flex items-center gap-2">
                      <textarea
                        autoFocus
                        placeholder="Add a quick note..."
                        value={tempNote}
                        onChange={(e) => {
                          setTempNote(e.target.value);
                          if (error) setError(null);
                          e.target.style.height = "auto";
                          e.target.style.height = `${e.target.scrollHeight}px`;
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleDone(idx);
                          }
                          if (e.key === "Escape") handleCancel();
                        }}
                        rows={1}
                        className={clsx(
                          "flex-1 text-xs border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none bg-white shadow-sm resize-none overflow-hidden min-h-[38px]",
                          error
                            ? "border-red-300 ring-1 ring-red-100"
                            : "border-slate-200",
                        )}
                      />
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleDone(idx)}
                          className="p-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 shadow-sm"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={4}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={handleCancel}
                          className="p-2 rounded-lg bg-slate-100 text-slate-400 hover:bg-slate-200"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={4}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                    {error && (
                      <p className="text-[10px] font-bold text-red-500 px-1">
                        {error}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
